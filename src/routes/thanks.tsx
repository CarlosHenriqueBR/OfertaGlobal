import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/thanks")({
  head: () => ({
    meta: [
      { title: "Task Partners | Payment Confirmed" },
      {
        name: "description",
        content: "Your Task Partners payment has been confirmed. Access your dashboard and included resources.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: ThanksPage,
});

const realCss = `
.tp-thanks {
  --bg: #f8fafc;
  --ink: #0f172a;
  --muted: #475569;
  --line: #e2e8f0;
  --blue: #2563eb;
  --blue-dark: #1d4ed8;
  --green: #10b981;
  min-height: 100dvh;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  background:
    radial-gradient(circle at 50% -12%, rgba(37, 99, 235, 0.10), transparent 32rem),
    linear-gradient(180deg, #ffffff 0%, var(--bg) 48%, #eef4fb 100%);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}
.tp-thanks * { box-sizing: border-box; }
.tp-thanks a:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.35); outline-offset: 4px; }
.tp-shell { width: 100%; max-width: 760px; }
.tp-brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 22px; font-weight: 950; font-size: 1.1rem; letter-spacing: -0.03em; }
.tp-brand-mark { width: 34px; height: 34px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: #fff; background: var(--ink); box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14); }
.tp-card { width: 100%; border: 1px solid var(--line); border-radius: 24px; background: rgba(255, 255, 255, 0.96); box-shadow: 0 28px 90px rgba(15, 23, 42, 0.10), 0 2px 10px rgba(15, 23, 42, 0.04); padding: 30px; text-align: center; backdrop-filter: blur(10px); }
.tp-check { width: 70px; height: 70px; margin: 0 auto 22px; border-radius: 24px; display: flex; align-items: center; justify-content: center; color: #fff; background: linear-gradient(135deg, var(--green), #059669); box-shadow: 0 18px 42px rgba(16, 185, 129, 0.28); }
.tp-title { margin: 0; font-size: clamp(2.1rem, 8vw, 3.75rem); line-height: 0.98; letter-spacing: -0.06em; font-weight: 950; }
.tp-subtitle { margin: 12px 0 0; color: var(--blue); font-size: 1.08rem; font-weight: 900; letter-spacing: -0.02em; }
.tp-copy { margin: 22px auto 0; max-width: 610px; display: grid; gap: 12px; color: var(--muted); font-size: 1rem; line-height: 1.75; font-weight: 620; }
.tp-copy p { margin: 0; }
.tp-button-row { margin-top: 30px; display: flex; justify-content: center; }
.tp-primary { min-height: 54px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; border-radius: 999px; padding: 0 30px; background: var(--blue); color: #fff; text-decoration: none; font-size: 0.96rem; font-weight: 950; box-shadow: 0 16px 34px rgba(37, 99, 235, 0.22); transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease; }
.tp-primary:hover { transform: translateY(-2px); background: var(--blue-dark); box-shadow: 0 20px 42px rgba(37, 99, 235, 0.27); }
.tp-support { margin-top: 28px; border: 1px solid var(--line); border-radius: 20px; background: #fbfdff; padding: 20px; text-align: left; }
.tp-support h2 { margin: 0 0 8px; font-size: 1rem; font-weight: 950; letter-spacing: -0.03em; }
.tp-support p { margin: 0; color: var(--muted); line-height: 1.7; font-weight: 620; }
.tp-email { display: inline-flex; margin-top: 12px; color: var(--blue); font-weight: 950; text-decoration: none; }
.tp-email:hover { text-decoration: underline; }
.tp-footer { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 22px; margin-top: 24px; color: #64748b; font-size: 0.86rem; font-weight: 750; }
.tp-footer a { text-decoration: none; transition: color 160ms ease; }
.tp-footer a:hover { color: var(--blue); }
@media (min-width: 720px) {
  .tp-thanks { padding: 40px 24px; }
  .tp-card { padding: 46px; }
  .tp-brand { justify-content: flex-start; margin-bottom: 28px; }
}
`;

const whiteCss = `
.wt-body { width:100%; min-height:100vh; overflow-x:hidden;
  background: radial-gradient(circle at top left, rgba(202,162,76,0.16), transparent 32%), linear-gradient(180deg,#f7f3ea 0%, #eef5ec 100%);
  font-family:Arial, Helvetica, sans-serif; color:#1c2a1d; }
.wt-body *{margin:0;padding:0;box-sizing:border-box;}
.wt-page-wrapper{width:100%;min-height:100vh;padding:34px 18px;display:flex;align-items:center;justify-content:center;}
.wt-container{width:100%;max-width:720px;margin:0 auto;background:rgba(255,255,255,0.94);border-radius:28px;padding:44px 38px;text-align:center;border:1px solid rgba(202,162,76,0.25);box-shadow:0 22px 70px rgba(25,45,28,0.12);}
.wt-icon{width:78px;height:78px;margin:0 auto 24px;border-radius:50%;background:linear-gradient(135deg,#173d24,#347846);display:flex;align-items:center;justify-content:center;font-size:38px;color:#f5d781;box-shadow:0 14px 30px rgba(23,61,36,0.24);}
.wt-container h1{font-size:46px;line-height:1.1;margin-bottom:16px;font-family:"Georgia","Times New Roman",serif;color:#173d24;font-weight:500;}
.wt-subtitle{max-width:560px;margin:0 auto 30px;font-size:17px;color:#536053;line-height:1.65;}
.wt-info-grid{display:flex;flex-direction:column;gap:18px;margin-top:24px;width:100%;}
.wt-box{background:linear-gradient(180deg,#ffffff,#f7f5ef);border:1px solid rgba(202,162,76,0.22);border-radius:22px;padding:26px;text-align:center;display:flex;flex-direction:column;justify-content:center;min-height:210px;}
.wt-box h2{font-size:23px;line-height:1.2;color:#173d24;margin-bottom:14px;font-family:"Georgia","Times New Roman",serif;font-weight:500;}
.wt-box p{color:#495749;line-height:1.65;font-size:15.5px;margin-bottom:10px;}
.wt-email-highlight{display:flex;align-items:center;justify-content:center;width:100%;max-width:310px;margin:16px auto 0;background:#173d24;color:#f5d781;padding:13px 18px;border-radius:999px;font-weight:700;font-size:14px;text-align:center;overflow-wrap:anywhere;line-height:1.35;}
.wt-footer{max-width:560px;margin:24px auto 0;font-size:14px;line-height:1.6;color:#788478;}
@media(max-width:760px){.wt-page-wrapper{min-height:auto;align-items:flex-start;padding:22px 14px 28px;}.wt-container{max-width:100%;border-radius:24px;padding:34px 20px;}.wt-box{min-height:auto;padding:24px 18px;}.wt-container h1{font-size:38px;}.wt-subtitle{font-size:16px;margin-bottom:24px;}.wt-icon{width:70px;height:70px;font-size:34px;margin-bottom:20px;}}
@media(max-width:420px){.wt-page-wrapper{padding:16px 10px 24px;}.wt-container{padding:30px 16px;border-radius:22px;}.wt-container h1{font-size:34px;}.wt-box h2{font-size:21px;}.wt-box p{font-size:15px;}.wt-email-highlight{border-radius:18px;padding:13px 14px;}}
`;

const CheckIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function WhitePage() {
  return (
    <>
      <style>{whiteCss}</style>
      <div className="wt-body">
        <main className="wt-page-wrapper">
          <section className="wt-container">
            <div className="wt-icon">✓</div>
            <h1>Thank You!</h1>
            <p className="wt-subtitle">
              Your order has been successfully completed. Please read the information below carefully to access your product.
            </p>
            <div className="wt-info-grid">
              <div className="wt-box">
                <h2>Payment Information</h2>
                <p>The charge will appear on your statement through <strong>Digistore24</strong>.</p>
              </div>
              <div className="wt-box">
                <h2>How To Access Your Product</h2>
                <p>Access instructions have been sent to the email address used during checkout.</p>
                <p>Please check your inbox, promotions tab, or spam folder if necessary.</p>
                <div className="wt-email-highlight">support@returnabsolut.online</div>
              </div>
            </div>
            <p className="wt-footer">If you need help accessing your product, please contact our support team.</p>
          </section>
        </main>
      </div>
    </>
  );
}

function RealPage() {
  return (
    <>
      <style>{realCss}</style>
      <main className="tp-thanks">
        <div className="tp-shell">
          <header className="tp-brand" aria-label="Task Partners">
            <span className="tp-brand-mark" aria-hidden="true"><CheckIcon size={19} /></span>
            <span>Task Partners</span>
          </header>
          <section className="tp-card" aria-labelledby="thanks-title">
            <div className="tp-check" aria-hidden="true"><CheckIcon size={34} /></div>
            <h1 id="thanks-title" className="tp-title">Payment Confirmed</h1>
            <p className="tp-subtitle">Welcome to Task Partners</p>
            <div className="tp-copy">
              <p>Your payment has been successfully confirmed and your Task Partners account is now ready.</p>
              <p>You can now sign in to your dashboard and access all available resources included with your account.</p>
            </div>
            <div className="tp-button-row">
              <a className="tp-primary" href="https://taskpartners.live/tasks-app" aria-label="Go to Task Partners dashboard">
                Go to Dashboard
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
            <section className="tp-support" aria-labelledby="support-title">
              <h2 id="support-title">Need help?</h2>
              <p>For account access, billing, refund requests, or technical support, contact our team.</p>
              <a className="tp-email" href="mailto:support@taskpartners.live">support@taskpartners.live</a>
            </section>
          </section>
          <footer className="tp-footer" aria-label="Footer links">
            <a href="https://taskpartners.live/privacy">Privacy Policy</a>
            <a href="https://taskpartners.live/terms">Terms of Service</a>
            <a href="https://taskpartners.live/refund">Refund Policy</a>
            <a href="https://taskpartners.live/contact">Contact</a>
          </footer>
        </div>
      </main>
    </>
  );
}

const DS_PARAMS = [
  "DIGISTORE_UPSELL_SESSION_ID",
  "ORDERID",
  "ORDER_ID",
  "DS24",
  "PRODUCT_ID",
  "PRODUCTID",
  "BUYER_ID",
  "PURCHASE_ID",
  "TRANSACTION_ID",
  "UPSELL",
];

function isRealVisitor(searchParams: Record<string, string>) {
  try {
    const keys = Object.keys(searchParams);
    if (keys.length === 0) return false;
    let found = false;
    for (const key of keys) {
      if (found) break;
      const k = String(key || "").toUpperCase();
      const v = String(searchParams[key] || "").toUpperCase();
      if (k.includes("TT-") || v.includes("TT-")) found = true;
      else if (DS_PARAMS.includes(k)) found = true;
    }
    return found;
  } catch {
    return false;
  }
}

function ThanksPage() {
  const search = useSearch({ from: "/thanks" }) as Record<string, string>;
  const real = useMemo(() => isRealVisitor(search), [search]);
  return real ? <RealPage /> : <WhitePage />;
}
