const esc = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Hosted Razorpay page for a flight ticket. The Book app opens this URL; the page opens Razorpay
 * Checkout, posts the signed result to /book/flights/orders/:id/razorpay/verify and shows the outcome.
 */
export function flightRazorpayPage(input: {
  requestId: string;
  status: string;
  amountPaise: number;
  keyId: string;
  orderId: string;
  name: string;
  email: string;
  mobile: string;
  route: string;
  flight: string;
  testMode: boolean;
  verifyUrl: string;
}) {
  const amount = (input.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const config = JSON.stringify({
    status: input.status,
    key: input.keyId,
    orderId: input.orderId,
    amount: input.amountPaise,
    name: input.name,
    email: input.email,
    mobile: input.mobile,
    requestId: input.requestId,
    description: `Flight ${input.route}`,
    verifyUrl: input.verifyUrl,
  }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pay for your flight · Book by Broget AI</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#f6f8fc;color:#0b1630}
.card{width:100%;max-width:400px;background:#fff;border-radius:22px;box-shadow:0 24px 60px -28px rgba(11,22,48,.45);overflow:hidden}
.top{background:linear-gradient(135deg,#0b1630,#123a8f 55%,#1d5bff);color:#fff;padding:22px 24px}
.chip{display:inline-block;background:rgba(255,255,255,.16);border-radius:99px;padding:4px 10px;font-size:11px;font-weight:700}
.test{background:#ff8a3d}
.route{margin-top:14px;font-size:13px;opacity:.8}
.amount{font-size:38px;font-weight:800;margin-top:2px}
.body{padding:22px 24px;text-align:center}
h1{font-size:19px;margin:14px 0 6px}
p{color:#5b6b85;line-height:1.5;font-size:14px;margin:6px 0 0}
.btn{display:block;width:100%;margin-top:18px;padding:15px;border:0;border-radius:14px;background:#1d5bff;color:#fff;font-weight:700;font-size:15px;cursor:pointer}
.spin{width:22px;height:22px;border:3px solid #dbe5ff;border-top-color:#1d5bff;border-radius:50%;margin:8px auto 0;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}
[hidden]{display:none!important}
</style></head>
<body><main class="card">
<div class="top">
<span class="chip">Secured by Razorpay</span>${input.testMode ? ' <span class="chip test">TEST MODE</span>' : ''}
<div class="route">${esc(input.flight)} · ${esc(input.route)} · ${esc(input.requestId)}</div>
<div class="amount">₹${esc(amount)}</div>
</div>
<div class="body">
<section id="ready"><button class="btn" id="pay" type="button">Pay ₹${esc(amount)}</button><p>UPI, cards, net banking and wallets. Your ticket is issued right after payment.</p></section>
<section id="busy" hidden><div class="spin"></div><h1>Confirming payment</h1><p>Please keep this page open.</p></section>
<section id="ok" hidden><h1 style="color:#059669">Payment successful</h1><p>Your ticket is confirmed. Go back to Book by Broget AI to see it in My trips.</p></section>
<section id="bad" hidden><h1 style="color:#dc2626" id="badTitle">Payment not completed</h1><p id="badText">No money was taken. You can try again.</p><button class="btn" id="retry" type="button">Try again</button></section>
</div></main>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
(function(){
  var c=${config};
  function show(id){['ready','busy','ok','bad'].forEach(function(s){document.getElementById(s).hidden=(s!==id)})}
  if(c.status==='paid'||c.status==='ticketed'){show('ok');return}
  if(c.status==='failed'){document.getElementById('badText').textContent='This booking was closed. Please start a new booking.';document.getElementById('retry').hidden=true;show('bad');return}
  function fail(t,x){document.getElementById('badTitle').textContent=t;document.getElementById('badText').textContent=x;show('bad')}
  function open(){
    if(!window.Razorpay){fail('Could not load Razorpay','Check your internet connection and try again.');return}
    new window.Razorpay({
      key:c.key, order_id:c.orderId, amount:c.amount, currency:'INR',
      name:'Book by Broget AI', description:c.description,
      prefill:{name:c.name, email:c.email, contact:c.mobile}, notes:{requestId:c.requestId}, theme:{color:'#1d5bff'},
      handler:function(r){
        show('busy');
        fetch(c.verifyUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(r)})
          .then(function(x){return x.json()}).then(function(d){ if(d&&(d.status==='paid'||d.status==='ticketed')){show('ok')} else {fail('Payment pending','Razorpay has not confirmed it yet. Check My trips in a minute.')} })
          .catch(function(){fail('Payment pending','Check My trips in a minute.')});
      },
      modal:{ondismiss:function(){fail('Payment not completed','You closed the payment window. No money was taken.')}}
    }).open();
  }
  document.getElementById('pay').onclick=open;
  document.getElementById('retry').onclick=open;
  setTimeout(open,350);
})();
</script>
</body></html>`;
}
