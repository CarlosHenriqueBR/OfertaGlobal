/**
 * Bot guard: bloqueia crawlers/bots do Google (e afins) por:
 *  1) User-Agent conhecido de bot
 *  2) DNS reverso (PTR via DNS-over-HTTPS) com hostname do Google
 *  3) Faixas de IP oficiais publicadas pelo Google
 *
 * Roda no runtime serverless (Cloudflare Worker), por isso usa DoH em vez do
 * módulo `dns` do Node (indisponível).
 */

const GOOGLE_IP_RANGE_URLS = [
  "https://developers.google.com/static/search/apis/ipranges/googlebot.json",
  "https://developers.google.com/crawling/ipranges/common-crawlers.json",
  "https://developers.google.com/crawling/ipranges/special-crawlers.json",
  "https://developers.google.com/crawling/ipranges/user-triggered-fetchers.json",
  "https://developers.google.com/crawling/ipranges/user-triggered-fetchers-google.json",
  "https://developers.google.com/crawling/ipranges/user-triggered-agents.json",
];

/** Hostnames de DNS reverso que devem ser bloqueados. */
const BLOCKED_PTR_PATTERNS: RegExp[] = [
  /\.googlebot\.com\.?$/i,
  /\.geo\.googlebot\.com\.?$/i,
  /\.google\.com\.?$/i, // rate-limited-proxy-*, google-proxy-*
  /\.googleusercontent\.com\.?$/i, // *.gae.googleusercontent.com
  /\.googlebot\.net\.?$/i,
  /\.crawl\.yahoo\.net\.?$/i,
  /\.search\.msn\.com\.?$/i,
  /\.applebot\.apple\.com\.?$/i,
  /\.baidu\.(com|jp)\.?$/i,
  /\.yandex\.(ru|net|com)\.?$/i,
];

/** User-Agents bloqueados. */
const BLOCKED_UA_PATTERNS: RegExp[] = [
  /googlebot/i,
  /google-inspectiontool/i,
  /storebot-google/i,
  /google-extended/i,
  /googleother/i,
  /google favicon/i,
  /feedfetcher-google/i,
  /google-read-aloud/i,
  /google-site-verification/i,
  /apis-google/i,
  /adsbot/i,
  /mediapartners-google/i,
  /google-safety/i,
  /google web preview/i,
  /google-cloudvertexbot/i,
  /gsa-crawler/i,
  /bingbot|bingpreview|adidxbot/i,
  /duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i,
  /ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|dataforseo|serpstat|screaming frog/i,
  /python-requests|scrapy|curl\/|wget|httpclient|okhttp|go-http-client|libwww-perl|axios\//i,
  /headlesschrome|phantomjs|puppeteer|playwright|selenium/i,
  /\bbot\b|crawler|spider|crawling/i,
];

type Cidr = { bytes: Uint8Array; bits: number };

let rangesCache: { at: number; list: Cidr[] } | null = null;
const RANGES_TTL_MS = 12 * 60 * 60 * 1000;

const ptrCache = new Map<string, { at: number; blocked: boolean }>();
const PTR_TTL_MS = 60 * 60 * 1000;

function ipToBytes(ip: string): Uint8Array | null {
  if (ip.includes(".") && !ip.includes(":")) {
    const parts = ip.split(".");
    if (parts.length !== 4) return null;
    const out = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      const n = Number(parts[i]);
      if (!Number.isInteger(n) || n < 0 || n > 255) return null;
      out[i] = n;
    }
    return out;
  }
  // IPv6
  const clean = ip.split("%")[0] ?? ip;
  const halves = clean.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":").filter(Boolean) : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":").filter(Boolean) : [];
  const groups = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (groups < 0) return null;
  const all = [...head, ...Array<string>(groups).fill("0"), ...tail];
  if (all.length !== 8) return null;
  const out = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const n = parseInt(all[i]!, 16);
    if (Number.isNaN(n) || n < 0 || n > 0xffff) return null;
    out[i * 2] = n >> 8;
    out[i * 2 + 1] = n & 0xff;
  }
  return out;
}

function parseCidr(cidr: string): Cidr | null {
  const [ip, prefix] = cidr.split("/");
  if (!ip) return null;
  const bytes = ipToBytes(ip);
  if (!bytes) return null;
  const bits = prefix === undefined ? bytes.length * 8 : Number(prefix);
  if (!Number.isInteger(bits) || bits < 0 || bits > bytes.length * 8) return null;
  return { bytes, bits };
}

function inCidr(ipBytes: Uint8Array, cidr: Cidr): boolean {
  if (ipBytes.length !== cidr.bytes.length) return false;
  let bits = cidr.bits;
  let i = 0;
  while (bits >= 8) {
    if (ipBytes[i] !== cidr.bytes[i]) return false;
    i++;
    bits -= 8;
  }
  if (bits === 0) return true;
  const mask = (0xff << (8 - bits)) & 0xff;
  return ((ipBytes[i] ?? 0) & mask) === ((cidr.bytes[i] ?? 0) & mask);
}

async function getGoogleRanges(): Promise<Cidr[]> {
  const now = Date.now();
  if (rangesCache && now - rangesCache.at < RANGES_TTL_MS) return rangesCache.list;

  const list: Cidr[] = [];
  await Promise.all(
    GOOGLE_IP_RANGE_URLS.map(async (url) => {
      try {
        const res = await fetch(url, { headers: { accept: "application/json" } });
        if (!res.ok) return;
        const json = (await res.json()) as {
          prefixes?: Array<{ ipv4Prefix?: string; ipv6Prefix?: string }>;
        };
        for (const p of json.prefixes ?? []) {
          const cidr = p.ipv4Prefix ?? p.ipv6Prefix;
          if (!cidr) continue;
          const parsed = parseCidr(cidr);
          if (parsed) list.push(parsed);
        }
      } catch {
        /* rede indisponível: ignora essa lista */
      }
    }),
  );

  if (list.length > 0) rangesCache = { at: now, list };
  return rangesCache?.list ?? [];
}

function reverseName(ip: string): string | null {
  const bytes = ipToBytes(ip);
  if (!bytes) return null;
  if (bytes.length === 4) return `${[...bytes].reverse().join(".")}.in-addr.arpa`;
  const nibbles: string[] = [];
  for (const b of bytes) {
    nibbles.push((b >> 4).toString(16), (b & 0xf).toString(16));
  }
  return `${nibbles.reverse().join(".")}.ip6.arpa`;
}

/** DNS reverso via DoH (dns.google não é usado para evitar depender do alvo bloqueado). */
async function reverseHostnames(ip: string): Promise<string[]> {
  const name = reverseName(ip);
  if (!name) return [];
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${name}&type=PTR`, {
      headers: { accept: "application/dns-json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { Answer?: Array<{ type: number; data: string }> };
    return (json.Answer ?? []).filter((a) => a.type === 12).map((a) => a.data);
  } catch {
    return [];
  }
}

export function getClientIp(request: Request): string | null {
  const headers = request.headers;
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  ];
  for (const c of candidates) {
    if (c && ipToBytes(c)) return c;
  }
  return null;
}

export function isBlockedUserAgent(ua: string | null): boolean {
  if (!ua || ua.trim() === "") return true; // sem UA = bot
  return BLOCKED_UA_PATTERNS.some((re) => re.test(ua));
}

async function isBlockedByPtr(ip: string): Promise<boolean> {
  const cached = ptrCache.get(ip);
  const now = Date.now();
  if (cached && now - cached.at < PTR_TTL_MS) return cached.blocked;

  const hosts = await reverseHostnames(ip);
  const blocked = hosts.some((h) => BLOCKED_PTR_PATTERNS.some((re) => re.test(h)));
  ptrCache.set(ip, { at: now, blocked });
  if (ptrCache.size > 5000) ptrCache.clear();
  return blocked;
}

async function isBlockedByRange(ip: string): Promise<boolean> {
  const bytes = ipToBytes(ip);
  if (!bytes) return false;
  const ranges = await getGoogleRanges();
  return ranges.some((r) => inCidr(bytes, r));
}

export type BotVerdict = { blocked: boolean; reason?: string };

export async function checkRequestForBot(request: Request): Promise<BotVerdict> {
  const url = new URL(request.url);

  // Não bloqueia infraestrutura interna / webhooks / assets
  if (
    url.pathname.startsWith("/api/public/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/__l5e") ||
    url.pathname.startsWith("/~") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/favicon.svg" ||
    url.pathname === "/robots.txt"
  ) {
    return { blocked: false };
  }

  const ua = request.headers.get("user-agent");
  if (isBlockedUserAgent(ua)) return { blocked: true, reason: "user-agent" };

  const ip = getClientIp(request);
  if (!ip) return { blocked: false };

  if (await isBlockedByRange(ip)) return { blocked: true, reason: "ip-range" };
  if (await isBlockedByPtr(ip)) return { blocked: true, reason: "reverse-dns" };

  return { blocked: false };
}

export function blockedResponse(): Response {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
