const esc = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Hosted checkout page for the agent mobile app. The app opens this URL in the browser; the page opens
 * Razorpay Checkout, sends the signed result to /wallet/razorpay/verify and tells the agent to go back.
 */
export function razorpayCheckoutPage(input: {
  requestId: string;
  status: string;
  amountPaise: number;
  keyId: string;
  orderId: string;
  mobile: string;
  apiBase: string;
}) {
  const amount = (input.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const config = JSON.stringify({
    requestId: input.requestId,
    status: input.status,
    key: input.keyId,
    orderId: input.orderId,
    amount: input.amountPaise,
    mobile: input.mobile,
    verifyUrl: `${input.apiBase}/api/v1/wallet/razorpay/verify`,
  }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Add money · Broget AI</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:linear-gradient(160deg,#eef3ff 0%,#f6f8fb 60%);color:#0f172a}
.card{width:100%;max-width:400px;background:#fff;border-radius:24px;box-shadow:0 24px 60px -24px rgba(2,42,110,.35);overflow:hidden}
.top{background:linear-gradient(145deg,#2b6bff,#0b3fbf 60%,#072a87);color:#fff;padding:22px 24px 26px}
.chip{display:inline-block;background:rgba(255,255,255,.16);border-radius:99px;padding:4px 10px;font-size:11.5px;font-weight:700;letter-spacing:.03em}
.label{margin-top:18px;font-size:11px;font-weight:700;letter-spacing:.14em;opacity:.75}
.amount{font-size:40px;font-weight:800;letter-spacing:-.02em;margin-top:2px}
.order{display:inline-block;margin-top:10px;background:rgba(0,0,0,.18);border-radius:6px;padding:3px 8px;font:11px ui-monospace,Menlo,monospace;opacity:.9}
.body{padding:24px;text-align:center}
.badge{width:72px;height:72px;margin:4px auto 0;border-radius:50%;display:grid;place-items:center}
.badge span{width:50px;height:50px;border-radius:50%;display:grid;place-items:center}
.badge svg{width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
h1{font-size:20px;margin:16px 0 6px}
p{color:#475569;line-height:1.5;font-size:14px;margin:8px 0 0}
.btn{display:block;width:100%;margin-top:20px;padding:15px;border:0;border-radius:14px;background:#0b5cff;color:#fff;font-weight:700;font-size:15.5px;cursor:pointer;box-shadow:0 12px 28px -12px rgba(11,92,255,.8)}
.btn[disabled]{opacity:.6;cursor:default}
.methods{display:flex;gap:8px;margin-top:18px}
.methods span{flex:1;border:1px solid #e2e8f5;background:#f8faff;border-radius:12px;padding:9px 0;font-size:12px;font-weight:700;color:#1e293b}
.hint{font-size:12.5px;color:#64748b;margin-top:16px}
.spin{width:22px;height:22px;border:3px solid #dbe5ff;border-top-color:#0b5cff;border-radius:50%;margin:8px auto 0;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}
[hidden]{display:none!important}
</style></head>
<body><main class="card">
<div class="top">
<span class="chip">Secured by Razorpay</span>
<div class="label">ADDING TO BROGET WALLET</div>
<div class="amount">₹${esc(amount)}</div>
<span class="order">Order ${esc(input.requestId)}</span>
</div>
<div class="body">
<section id="ready">
<div class="methods"><span>UPI</span><span>Cards</span><span>Net banking</span><span>Wallets</span></div>
<button class="btn" id="pay" type="button">Pay ₹${esc(amount)}</button>
<p class="hint">The Razorpay window opens on this page. Your wallet updates only after the payment is confirmed.</p>
</section>
<section id="busy" hidden><div class="spin"></div><h1>Confirming payment…</h1><p>Please wait, do not close this page.</p></section>
<section id="ok" hidden>
<div class="badge" style="background:#ecfdf5"><span style="background:#059669"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></span></div>
<h1 style="color:#059669">Payment successful</h1><p>₹${esc(amount)} is added to your Broget AI wallet.</p>
<p class="hint">Go back to the Broget AI app - the wallet is already updated.</p>
</section>
<section id="bad" hidden>
<div class="badge" style="background:#fef2f2"><span style="background:#dc2626"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></span></div>
<h1 style="color:#dc2626" id="badTitle">Payment not completed</h1><p id="badText">No money was taken. You can try again.</p>
<button class="btn" id="retry" type="button">Try again</button>
</section>
</div></main>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
(function(){
  var c=${config};
  function show(id){['ready','busy','ok','bad'].forEach(function(s){document.getElementById(s).hidden=(s!==id)})}
  if(c.status==='success'){show('ok');return}
  function fail(title,text){document.getElementById('badTitle').textContent=title;document.getElementById('badText').textContent=text;show('bad')}
  function open(){
    if(!window.Razorpay){fail('Could not load Razorpay','Check your internet connection and try again.');return}
    var rzp=new window.Razorpay({
      key:c.key, order_id:c.orderId, amount:c.amount, currency:'INR',
      name:'Broget AI', description:'Wallet top-up', prefill:{contact:c.mobile},
      notes:{requestId:c.requestId}, theme:{color:'#0b5cff'},
      handler:function(r){
        show('busy');
        fetch(c.verifyUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:c.requestId,razorpay_order_id:r.razorpay_order_id,razorpay_payment_id:r.razorpay_payment_id,razorpay_signature:r.razorpay_signature})})
          .then(function(x){return x.json()}).then(function(d){ if(d&&d.status==='success'){show('ok')} else {fail('Payment pending','Razorpay has not confirmed it yet. Go back to the app and tap Check status.')} })
          .catch(function(){fail('Payment pending','Go back to the app and tap Check status.')});
      },
      modal:{ondismiss:function(){fail('Payment not completed','You closed the payment window. No money was taken.')}}
    });
    rzp.on('payment.failed',function(e){ /* Razorpay lets the payer retry inside the window. */ });
    rzp.open();
  }
  document.getElementById('pay').onclick=open;
  document.getElementById('retry').onclick=open;
  setTimeout(open,350);
})();
</script>
</body></html>`;
}
