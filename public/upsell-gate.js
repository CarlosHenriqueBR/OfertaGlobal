/* Upsell gate: black (real) page only for leads carrying a TT- parameter.
   Any other visitor sees the white page on the SAME URL (no redirect). */
(function () {
  if (window.__upsellGateRan) return;
  window.__upsellGateRan = true;

  function hasTT() {
    try {
      var q = window.location.search || "";
      if (!q || q.length <= 1) return false;
      var params = new URLSearchParams(q.substring(1));
      var found = false;
      params.forEach(function (value, key) {
        if (found) return;
        var k = String(key || "").toUpperCase();
        var v = String(value || "").toUpperCase();
        if (k.indexOf("TT-") !== -1 || v.indexOf("TT-") !== -1) found = true;
      });
      if (!found && decodeURIComponent(q).toUpperCase().indexOf("TT-") !== -1) found = true;
      // Digistore sempre manda o comprador com estes parametros: nunca esconder deles
      if (!found) {
        var DS = ["DIGISTORE_UPSELL_SESSION_ID","ORDERID","ORDER_ID","DS24","PRODUCT_ID","PRODUCTID","BUYER_ID","PURCHASE_ID","TRANSACTION_ID","UPSELL"];
        params.forEach(function (value, key) {
          if (found) return;
          if (DS.indexOf(String(key || "").toUpperCase()) !== -1) found = true;
        });
      }
      return found;
    } catch (e) {
      return false;
    }
  }

  if (hasTT()) return; // black page stays as-is

  // Hide the real content immediately, before paint.
  var hide = document.createElement("style");
  hide.id = "upsell-gate-hide";
  hide.textContent = "body{visibility:hidden !important;}";
  (document.head || document.documentElement).appendChild(hide);

  var WHITE_HTML =
    '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box;}' +
    'body{visibility:visible !important;font-family:Georgia,"Times New Roman",serif;background:#fbfaf7;color:#2f3a2f;line-height:1.7;}' +
    '.wg-header{background:#2f5d3a;color:#fff;padding:64px 24px;text-align:center;}' +
    '.wg-eyebrow{display:inline-block;font-size:12px;letter-spacing:.22em;text-transform:uppercase;opacity:.85;margin-bottom:14px;}' +
    '.wg-header h1{font-size:34px;line-height:1.25;margin-bottom:14px;}' +
    '.wg-header p{max-width:640px;margin:0 auto;opacity:.9;font-size:16px;}' +
    '.wg-container{max-width:860px;margin:0 auto;padding:48px 24px 72px;}' +
    '.wg-section{background:#fff;border:1px solid #e7e3d9;border-radius:10px;padding:32px;margin-bottom:28px;}' +
    '.wg-section h2{font-size:24px;margin-bottom:18px;color:#2f5d3a;}' +
    '.wg-card{border-left:3px solid #2f5d3a;padding:10px 0 10px 16px;margin-bottom:20px;}' +
    '.wg-card h3{font-size:17px;margin-bottom:6px;}' +
    '.wg-card p,.wg-section li{font-size:15px;color:#4a544a;}' +
    '.wg-section ul{padding-left:20px;}' +
    '.wg-section li{margin-bottom:10px;}' +
    '.wg-price{font-size:40px;color:#2f5d3a;margin:14px 0;text-align:center;}' +
    '.wg-offer{text-align:center;}' +
    '.wg-btn{display:inline-block;background:#2f5d3a;color:#fff;text-decoration:none;padding:16px 34px;border-radius:8px;font-size:16px;margin-top:14px;}' +
    '.wg-decline{display:block;margin-top:14px;color:#7a8479;font-size:13px;text-decoration:underline;}' +
    '.wg-footer{text-align:center;padding:32px 24px;font-size:12px;color:#8a917f;}' +
    '</style>' +
    '<div class="wg-header">' +
    '<span class="wg-eyebrow">Premium Natural Gardening Collection</span>' +
    '<h1>Secrets of Natural Growing</h1>' +
    '<p>A practical digital collection created to help beginners nourish plants naturally, recover struggling plants, and protect gardens from pests without harsh chemicals.</p>' +
    '</div>' +
    '<div class="wg-container">' +
    '<div class="wg-section"><h2>What You Will Receive</h2>' +
    '<div class="wg-card"><h3>01 · Natural Fertilizers</h3><p>How to create simple natural plant food using banana peels, coffee grounds, eggshells and compost.</p></div>' +
    '<div class="wg-card"><h3>02 · How to Save Dying Plants</h3><p>Identify overwatering, weak roots, yellow leaves and poor drainage — and how to fix each one.</p></div>' +
    '<div class="wg-card"><h3>03 · Natural Pest Control</h3><p>Safe ways to protect plants from aphids, whiteflies, mealybugs, snails and fungus.</p></div>' +
    '</div>' +
    '<div class="wg-section"><h2>Who This Product Is For</h2><ul>' +
    '<li>Beginners who want to care for plants in a natural, sustainable way.</li>' +
    '<li>People who prefer to avoid harsh chemicals at home or in the garden.</li>' +
    '<li>Anyone dealing with yellow leaves, weak plants or pests.</li>' +
    '<li>Home gardeners looking for low-cost, practical plant care solutions.</li>' +
    '</ul></div>' +
    '<div class="wg-section wg-offer"><h2>Add This Collection Today</h2>' +
    '<p>Get access to all 3 premium ebooks and learn how to care for your plants naturally.</p>' +
    '<div class="wg-price">$19</div>' +
    '<p>One-time payment. Digital product delivered online.</p>' +
    '<a class="wg-btn" href="https://www.checkout-ds24.com/answer/yes?template=light">Yes, I Want This Offer</a>' +
    '<a class="wg-decline" href="https://www.checkout-ds24.com/answer/no">No thanks, I do not want this offer</a>' +
    '</div>' +
    '<div class="wg-footer">Digital product. Support available by email.</div>' +
    '</div>';

  function render() {
    try {
      document.title = "Secrets of Natural Growing";
      document.body.innerHTML = WHITE_HTML;
      document.body.className = "";
      document.body.style.visibility = "visible";
      var s = document.getElementById("upsell-gate-hide");
      if (s) s.remove();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  window.addEventListener("load", function () {
    if (!document.querySelector(".wg-header")) render();
  });
})();
