/* ===== QuantumEarn Pro - Home App Logic ===== */
(function(){
  // ---- Auth gate ----
  const phone = QE.session.get();
  if(!phone || !QE.state.users[phone]){ location.href='index.html'; return; }
  const user = QE.state.users[phone];
  QE.acct(phone);

  // ---- Products catalog (10 plans, 1 free) ----
  const PRODUCTS = [
    { id:'qe-free', name:'Starter Free Trial', price:0, perDay:50, days:3, color:'#22c55e', icon:'🎁', free:true },
    { id:'qe-1',    name:'QE Bronze 30',       price:300,  perDay:60,  days:20, color:'#cd7f32', icon:'🥉' },
    { id:'qe-2',    name:'QE Silver 50',       price:800,  perDay:120, days:25, color:'#9ca3af', icon:'🥈' },
    { id:'qe-3',    name:'QE Gold 80',         price:1500, perDay:220, days:30, color:'#f5c542', icon:'🥇' },
    { id:'qe-4',    name:'QE Platinum 120',    price:3000, perDay:380, days:35, color:'#e5e7eb', icon:'💎' },
    { id:'qe-5',    name:'QE Diamond 200',     price:6000, perDay:680, days:40, color:'#06b6d4', icon:'💠' },
    { id:'qe-6',    name:'QE Sapphire 320',    price:10000,perDay:1100,days:45, color:'#3b82f6', icon:'🔷' },
    { id:'qe-7',    name:'QE Emerald 500',     price:18000,perDay:1850,days:50, color:'#10b981', icon:'🟢' },
    { id:'qe-8',    name:'QE Ruby 800',        price:30000,perDay:2900,days:55, color:'#ef4444', icon:'🔴' },
    { id:'qe-9',    name:'QE Royal Crown',     price:60000,perDay:5500,days:60, color:'#8b5cf6', icon:'👑' }
  ];

  // ---- DOM helpers ----
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // ---- Daily collection for active investments ----
  function processInvestments(){
    const list = QE.state.investments[phone] || [];
    const now = Date.now();
    list.forEach(inv=>{
      // Investment auto-credits if last collected was different calendar day (we keep manual collect via Orders)
      // No auto here; manual collect from Orders page.
    });
  }

  // ---- Topbar ----
  $('#topUser').textContent = 'Welcome, '+user.name;
  $('#btnHelp').onclick = ()=>openHelp();
  $('#btnNotif').onclick = ()=>QE.modal({icon:'🔔',title:'Notifications',body:'<p>No new notifications. We will alert you for new rewards, deposits and withdrawal updates here.</p>',cancel:false,confirmText:'Close'});

  // ---- Tab routing ----
  const tabbar = $('#tabbar');
  tabbar.querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>switchPage(b.dataset.tab);
  });

  function switchPage(id, showTabbar=true){
    $$('.page').forEach(p=>p.classList.remove('active'));
    const pg = document.getElementById(id);
    if(pg) pg.classList.add('active');
    tabbar.querySelectorAll('button').forEach(b=>{
      b.classList.toggle('active', b.dataset.tab===id);
    });
    tabbar.style.display = showTabbar ? '' : 'none';
    window.scrollTo({top:0,behavior:'smooth'});
    if(id==='pageHome') renderHome();
    if(id==='pageIncome') renderIncome();
    if(id==='pageShare') renderShare();
    if(id==='pageMine') renderMine();
  }

  // ---- Hero / Home stats ----
  function renderHome(){
    const a = QE.acct(phone);
    $('#heroBal').textContent = QE.fmt(a.balance);
    $('#heroTotal').textContent = QE.fmt((a.promoIncome||0)+(a.investIncome||0));
    // Today income from bills
    const bills = QE.state.bills[phone]||[];
    const today = bills.filter(b=>QE.isSameDay(b.time,Date.now()) && b.amount>0).reduce((s,b)=>s+b.amount,0);
    $('#heroToday').textContent = QE.fmt(today);
    renderFeatured();
    renderWinners();
    renderMarquee();
  }

  function renderFeatured(){
    const c = document.getElementById('featuredPlans');
    c.innerHTML = PRODUCTS.slice(0,3).map(p=>productCard(p)).join('');
    c.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyProduct(b.dataset.buy));
  }

  function productCard(p){
    return `<div class="product">
      <div class="img" style="background:linear-gradient(135deg,${p.color},#000)">${p.icon}</div>
      <div class="info">
        <h4>${p.name}${p.free?'<span class="badge-free">FREE</span>':''}</h4>
        <div class="meta">
          <span>Price: <b>${p.free?'FREE':QE.fmt(p.price)}</b></span>
          <span>Daily: <b>${QE.fmt(p.perDay)}</b></span>
          <span>${p.days} days</span>
          <span>Total: <b>${QE.fmt(p.perDay*p.days)}</b></span>
        </div>
      </div>
      <button data-buy="${p.id}">${p.free?'Claim':'Buy'}</button>
    </div>`;
  }

  function renderWinners(){
    const names=['Rahul S','Priya M','Amit K','Sneha R','Vikas T','Anjali D','Suresh P','Neha G','Manoj L','Kiran B'];
    const c = $('#winnersList');
    let html='';
    for(let i=0;i<5;i++){
      const n=names[Math.floor(Math.random()*names.length)];
      const amt = QE.rand(50,2500);
      const mins=QE.rand(1,59);
      html += `<div class="row"><div class="l"><div class="ri">🏆</div><div><div class="t">${n}***</div><div class="s">withdrew successfully</div></div></div><div class="r"><div class="text-gold fw-700">+₹${amt}</div><div class="fs-12 text-muted">${mins}m ago</div></div></div>`;
    }
    c.innerHTML=html;
  }

  function renderMarquee(){
    const names=['Ravi','Pooja','Akash','Divya','Sandeep','Kavita','Manish','Aarti','Suraj','Neeraj'];
    let s='';
    for(let i=0;i<10;i++){
      s += `🎉 ${names[i%names.length]}*** withdrew ₹${QE.rand(200,5000)} • `;
    }
    $('#marqueeText').textContent = s;
  }

  // ---- Quick grid actions ----
  $$('.quick-grid .q').forEach(q=>{
    q.onclick = ()=>handleQuick(q.dataset.quick);
  });

  function handleQuick(k){
    if(k==='gift') openGiftCode();
    else if(k==='checkin'){ window.scrollTo({top:600,behavior:'smooth'}); QE.toast('Spin the wheel below 🎡','success'); }
    else if(k==='invest') switchPage('pageIncome');
    else if(k==='share') switchPage('pageShare');
    else if(k==='vip') QE.modal({icon:'👑',title:'VIP Club',body:'<p>Unlock exclusive perks: priority withdrawals, dedicated manager, +2% daily bonus, and special events. <br><br>Reach <b style="color:var(--gold)">VIP Level 2</b> by investing ₹5,000+ in any plan.</p>',cancel:false,confirmText:'Got it'});
    else if(k==='news') QE.modal({icon:'📰',title:'Market Today',body:'<p style="line-height:1.7">• NIFTY 50 closed +0.84% at 24,560<br>• Gold spot up ₹120 to ₹74,300/10g<br>• USD/INR steady at 83.40<br>• Bitcoin hovers near $68,200<br>• Crude Brent trades $84.10/bbl<br><br><i style="font-size:12px;color:var(--muted)">Source: QuantumEarn Research Desk</i></p>',cancel:false,confirmText:'Close'});
    else if(k==='kyc') QE.modal({icon:'✅',title:'KYC Verification',body:'<p>Your KYC is <b style="color:var(--green)">Auto-Verified</b> based on registered phone. Full KYC (Aadhaar / PAN) is required only for withdrawals above ₹50,000.</p>',cancel:false,confirmText:'Got it'});
    else if(k==='about') openAbout();
  }

  // ---- Gift Code ----
  function openGiftCode(){
    QE.modal({
      icon:'🎁',
      title:'Redeem Gift Code',
      body:`
        <p>Enter your 6-digit gift code to receive a random reward between <b style="color:var(--gold)">₹1 and ₹10</b>. Limit: 1 redemption per day per account.</p>
        <input type="text" maxlength="6" placeholder="Enter 6-digit code" class="input-box" id="giftInput" style="text-transform:uppercase;letter-spacing:6px;text-align:center;font-weight:700;font-size:18px"/>
        <p style="font-size:11.5px;color:var(--muted)">Gift codes are shared in our official channels & promotions.</p>`,
      confirmText:'Redeem Now',
      onConfirm:(ov)=>{
        const code = ov.querySelector('#giftInput').value.trim().toUpperCase();
        if(!/^[A-Z0-9]{6}$/.test(code)){ QE.toast('Code must be 6 characters','error'); return false; }
        if(!QE.state.checkins[phone]) QE.state.checkins[phone] = {};
        const last = QE.state.checkins[phone].lastGift;
        if(last && QE.isSameDay(last,Date.now())){
          QE.toast('Already redeemed today. Come back tomorrow!','error'); return false;
        }
        const amt = QE.rand(1,10);
        const a = QE.acct(phone);
        a.balance += amt;
        a.promoIncome = (a.promoIncome||0) + amt;
        QE.state.checkins[phone].lastGift = Date.now();
        if(!QE.state.bills[phone]) QE.state.bills[phone]=[];
        QE.state.bills[phone].push({type:'Gift Code',amount:amt,time:Date.now(),note:'Code: '+code});
        QE.save();
        QE.confetti();
        QE.modal({icon:'🎉',title:'Congratulations!',body:`<p>You received <b style="color:var(--gold);font-size:22px">₹${amt}</b> in your wallet!</p>`,cancel:false,confirmText:'Awesome'});
        renderHome();
      }
    });
  }

  // ---- Spinner check-in ----
  const SLICES = [10,40,15,25,12,30,20,35]; // 8 slices ₹10-40
  function renderSpinnerLabels(){
    const wrap = $('#spinnerLabels');
    wrap.innerHTML='';
    const R = 100; // distance from center in px-like units
    SLICES.forEach((v,i)=>{
      const angle = i*45 + 22.5;
      const rad = (angle-90) * Math.PI/180;
      const r = 90;
      const x = Math.cos(rad)*r;
      const y = Math.sin(rad)*r;
      const s = document.createElement('span');
      s.textContent = '₹'+v;
      s.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      wrap.appendChild(s);
    });
  }
  renderSpinnerLabels();

  $('#spinBtn').onclick = ()=>{
    if(!QE.state.checkins[phone]) QE.state.checkins[phone] = {};
    const last = QE.state.checkins[phone].lastCheckin;
    if(last && QE.isSameDay(last,Date.now())){
      return QE.toast('Already spun today. Come back tomorrow!','error');
    }
    const btn = $('#spinBtn'); btn.disabled = true;
    const idx = Math.floor(Math.random()*SLICES.length);
    const amt = SLICES[idx];
    const sliceAngle = 360/SLICES.length;
    const targetAngle = 360*6 + (360 - (idx*sliceAngle + sliceAngle/2));
    const sp = $('#spinner');
    sp.style.transform = `rotate(${targetAngle}deg)`;
    setTimeout(()=>{
      const a = QE.acct(phone);
      a.balance += amt;
      a.promoIncome = (a.promoIncome||0) + amt;
      QE.state.checkins[phone].lastCheckin = Date.now();
      if(!QE.state.bills[phone]) QE.state.bills[phone]=[];
      QE.state.bills[phone].push({type:'Daily Spin',amount:amt,time:Date.now(),note:'Lucky spin reward'});
      QE.save();
      QE.confetti();
      QE.modal({icon:'🎡',title:'You Won!',body:`<p>The wheel landed on <b style="color:var(--gold);font-size:24px">₹${amt}</b>! Amount credited to your wallet.</p>`,cancel:false,confirmText:'Collect'});
      renderHome();
      btn.disabled = false;
    },4700);
  };

  // ---- INCOME page ----
  function renderIncome(){
    const c = $('#productList');
    c.innerHTML = PRODUCTS.map(p=>productCard(p)).join('');
    c.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyProduct(b.dataset.buy));
    renderOrders();
  }

  $('#incomeTabs').querySelectorAll('button').forEach(b=>{
    b.onclick=()=>{
      $('#incomeTabs').querySelectorAll('button').forEach(x=>x.classList.toggle('active', x===b));
      $('#investSection').style.display = b.dataset.itab==='invest' ? '' : 'none';
      $('#ordersSection').style.display = b.dataset.itab==='orders' ? '' : 'none';
      if(b.dataset.itab==='orders') renderOrders();
    };
  });

  function buyProduct(id){
    const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
    const owned = (QE.state.investments[phone]||[]).some(i=>i.productId===id);
    if(owned){ return QE.toast('You already own this plan','error'); }
    const a = QE.acct(phone);
    if(p.free){
      doPurchase(p);
    } else {
      QE.modal({
        icon:'📈',
        title:'Confirm Purchase',
        body:`<p>You are about to buy:<br><b style="color:var(--gold);font-size:16px">${p.name}</b></p>
          <p style="background:rgba(255,255,255,.04);padding:10px;border-radius:8px;font-size:13px;line-height:1.7">
            Price: <b>${QE.fmt(p.price)}</b><br>
            Daily Profit: <b style="color:var(--green)">${QE.fmt(p.perDay)}</b><br>
            Validity: <b>${p.days} days</b><br>
            Total Return: <b style="color:var(--gold)">${QE.fmt(p.perDay*p.days)}</b><br>
            ROI: <b>${((p.perDay*p.days/p.price-1)*100).toFixed(0)}%</b>
          </p>
          <p style="font-size:12px;color:var(--muted)">Amount will be deducted from your wallet balance.</p>`,
        confirmText:'Confirm & Buy',
        onConfirm:()=>{
          if(a.balance < p.price){
            QE.modal({icon:'⚠️',title:'Insufficient Balance',body:'<p>Your wallet balance is not enough. Please recharge first.</p>',confirmText:'Recharge Now',onConfirm:()=>openRecharge()});
            return;
          }
          a.balance -= p.price;
          a.totalRecharge = a.totalRecharge; // unchanged
          if(!QE.state.bills[phone]) QE.state.bills[phone]=[];
          QE.state.bills[phone].push({type:'Plan Purchase',amount:-p.price,time:Date.now(),note:p.name});
          doPurchase(p);
        }
      });
    }
  }

  function doPurchase(p){
    if(!QE.state.investments[phone]) QE.state.investments[phone]=[];
    QE.state.investments[phone].push({
      productId:p.id, name:p.name, perDay:p.perDay, days:p.days,
      daysLeft:p.days, lastCollected:0, purchasedAt:Date.now(), icon:p.icon, color:p.color
    });
    QE.save();
    QE.confetti();
    QE.modal({icon:'✅',title:'Purchase Successful',body:`<p><b style="color:var(--gold)">${p.name}</b> is now active!<br>Go to <b>My Orders</b> and tap <b>Collect</b> daily to earn ${QE.fmt(p.perDay)}.</p>`,cancel:false,confirmText:'View Orders',onConfirm:()=>{
      $('#incomeTabs button[data-itab="orders"]').click();
    }});
    renderIncome();
    renderHome();
  }

  function renderOrders(){
    const c = $('#ordersList');
    const list = QE.state.investments[phone]||[];
    if(!list.length){ c.innerHTML='<p style="text-align:center;color:var(--muted);padding:30px">No active orders yet. Buy a plan to get started.</p>'; return; }
    c.innerHTML = list.map((inv,i)=>{
      const canCollect = inv.daysLeft>0 && (!inv.lastCollected || !QE.isSameDay(inv.lastCollected,Date.now()));
      const status = inv.daysLeft<=0 ? '<span class="pill rejected">Expired</span>'
                  : (canCollect ? '<span class="pill pending">Ready</span>' : '<span class="pill approved">Collected</span>');
      return `<div class="product">
        <div class="img" style="background:linear-gradient(135deg,${inv.color||'#3b82f6'},#000)">${inv.icon||'📦'}</div>
        <div class="info">
          <h4>${inv.name} ${status}</h4>
          <div class="meta">
            <span>Daily: <b>${QE.fmt(inv.perDay)}</b></span>
            <span>Days Left: <b>${inv.daysLeft}/${inv.days}</b></span>
          </div>
        </div>
        <button data-collect="${i}" ${canCollect?'':'disabled style="opacity:.5"'}>${canCollect?'Collect':'✓'}</button>
      </div>`;
    }).join('');
    c.querySelectorAll('[data-collect]').forEach(b=>b.onclick=()=>collectOrder(parseInt(b.dataset.collect)));
  }

  function collectOrder(i){
    const list = QE.state.investments[phone]||[];
    const inv = list[i]; if(!inv) return;
    if(inv.daysLeft<=0) return QE.toast('Plan expired','error');
    if(inv.lastCollected && QE.isSameDay(inv.lastCollected,Date.now())) return QE.toast('Already collected today','error');
    const a = QE.acct(phone);
    a.balance += inv.perDay;
    a.investIncome = (a.investIncome||0) + inv.perDay;
    inv.daysLeft -= 1;
    inv.lastCollected = Date.now();
    if(!QE.state.bills[phone]) QE.state.bills[phone]=[];
    QE.state.bills[phone].push({type:'Daily Profit',amount:inv.perDay,time:Date.now(),note:inv.name});
    QE.save();
    QE.confetti();
    QE.toast('+'+QE.fmt(inv.perDay)+' collected!');
    renderOrders(); renderHome();
  }

  // ---- SHARE ----
  function renderShare(){
    $('#refCode').textContent = user.refCode;
    const link = location.origin + location.pathname.replace(/home\.html.*/,'') + 'index.html?ref='+user.refCode;
    $('#refLink').textContent = link;
    $('#refQR').innerHTML = QE.qrSVG(link, 200);
    // Count team
    let l1=0,l2=0,l3=0;
    Object.values(QE.state.users).forEach(u=>{
      if(u.referredBy===user.refCode) l1++;
    });
    $('#teamL1').textContent=l1;
    $('#teamL2').textContent=Math.floor(l1*1.3);
    $('#teamL3').textContent=Math.floor(l1*0.7);
  }
  $('#btnCopyLink').onclick = ()=>{
    const t = $('#refLink').textContent;
    navigator.clipboard?.writeText(t).then(()=>QE.toast('Invite link copied!'), ()=>QE.toast('Copy failed','error'));
  };

  // ---- MINE ----
  function renderMine(){
    const a = QE.acct(phone);
    $('#mineName').textContent = user.name;
    $('#mineAv').textContent = user.name[0].toUpperCase();
    $('#mineId').textContent = user.refCode;
    $('#minePhone').textContent = '+91 '+phone.slice(0,5)+' '+phone.slice(5);
    $('#mineBal').textContent = QE.fmt(a.balance);
    $('#minePromo').textContent = QE.fmt(a.promoIncome||0);
    $('#mineInvest').textContent = QE.fmt(a.investIncome||0);
    $('#mineTotal').textContent = QE.fmt((a.promoIncome||0)+(a.investIncome||0));
    const bank = QE.state.bankAccounts[phone];
    $('#bindStatus').textContent = bank ? '✓ '+bank.bank : '›';
    $('#bindStatus').style.color = bank ? 'var(--green)':'var(--muted)';
  }

  $('#mineRecharge').onclick = openRecharge;
  $('#mineWithdraw').onclick = openWithdraw;
  $$('[data-mine]').forEach(r=>{
    r.onclick = ()=>{
      const k = r.dataset.mine;
      if(k==='bind') openBindBank();
      else if(k==='bill') openList('Bill Details', (QE.state.bills[phone]||[]).slice().reverse(), 'bill');
      else if(k==='recRec') openList('Recharge Records', (QE.state.rechargeRecords[phone]||[]).slice().reverse(), 'rec');
      else if(k==='wdRec') openList('Withdrawal Records', (QE.state.withdrawRecords[phone]||[]).slice().reverse(), 'wd');
      else if(k==='team') openTeam();
      else if(k==='about') openAbout();
      else if(k==='help') openHelp();
      else if(k==='logout') doLogout();
    };
  });

  function doLogout(){
    QE.modal({icon:'⏻',title:'Logout?',body:'<p>You will need to sign in again to access your account.</p>',confirmText:'Logout',onConfirm:()=>{
      QE.session.clear();
      QE.toast('Logged out successfully');
      setTimeout(()=>location.href='index.html', 600);
    }});
  }

  // ---- HOME / MINE buttons ----
  $('#goRecharge').onclick = openRecharge;
  $('#goWithdraw').onclick = openWithdraw;

  // ---- RECHARGE ----
  function openRecharge(){
    const cfg = QE.state.config;
    $('#minRechText').textContent = QE.fmt(cfg.minRecharge);
    const pm = $('#pmList');
    pm.innerHTML = cfg.paymentMethods.map((m,i)=>`
      <div class="pm ${i===0?'active':''}" data-pm="${m.id}">
        <div class="pmi" style="background:${m.color}">${m.icon}</div>
        <div class="pmt"><h5>${m.name}</h5><p>${m.desc}</p></div>
        <div class="pmr">●</div>
      </div>`).join('');
    pm.querySelectorAll('.pm').forEach(p=>p.onclick=()=>{
      pm.querySelectorAll('.pm').forEach(x=>x.classList.remove('active'));
      p.classList.add('active');
    });
    const chips = $('#amountChips');
    chips.innerHTML = [200,500,1000,2000,5000,10000,20000,50000].map(v=>`<button data-amt="${v}">₹${v}</button>`).join('');
    chips.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      chips.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      $('#rechAmount').value = b.dataset.amt;
    });
    $('#rechAmount').value='';
    switchPage('pageRecharge', false);
  }
  $('#backFromRecharge').onclick = ()=>switchPage('pageHome');
  $('#rechProceed').onclick = ()=>{
    const amt = parseInt($('#rechAmount').value);
    const min = QE.state.config.minRecharge;
    if(!amt || amt<min) return QE.toast('Min recharge '+QE.fmt(min),'error');
    const method = $('#pmList .pm.active')?.dataset.pm || 'upi';
    startPay(amt, method);
  };

  // ---- PAY ----
  let payTimerId=null, currentPay=null;
  function startPay(amt, method){
    currentPay = { amt, method, startedAt:Date.now() };
    $('#payAmt').textContent = QE.fmt(amt);
    const upi = QE.state.config.upiId;
    $('#payUpi').textContent = upi;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(QE.state.config.upiName)}&am=${amt}&cu=INR&tn=QE${Date.now().toString(36)}`;
    $('#payQR').innerHTML = QE.qrSVG(upiUrl, 160);
    $('#utrInput').value='';
    let remain = 10*60;
    const upd = ()=>{
      const m=Math.floor(remain/60), s=remain%60;
      $('#payTimer').textContent = `⏱ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if(remain<=0){
        clearInterval(payTimerId);
        QE.toast('Payment session expired','error');
        switchPage('pageRecharge', false);
      }
      remain--;
    };
    upd(); clearInterval(payTimerId); payTimerId = setInterval(upd,1000);
    switchPage('pagePay', false);
  }
  $('#backFromPay').onclick = ()=>{clearInterval(payTimerId); switchPage('pageRecharge',false);};
  $('#copyUpi').onclick = ()=>{
    navigator.clipboard?.writeText($('#payUpi').textContent).then(()=>QE.toast('UPI ID copied'));
  };
  $('#submitUtr').onclick = ()=>{
    const utr = $('#utrInput').value.trim();
    if(!/^[0-9]{12}$/.test(utr)) return QE.toast('UTR must be 12 digits','error');
    if(!currentPay) return;
    clearInterval(payTimerId);
    const a = QE.acct(phone);
    a.balance += currentPay.amt;
    a.totalRecharge = (a.totalRecharge||0) + currentPay.amt;
    if(!QE.state.rechargeRecords[phone]) QE.state.rechargeRecords[phone]=[];
    QE.state.rechargeRecords[phone].push({
      id:QE.uid(), amount:currentPay.amt, method:currentPay.method,
      utr, status:'approved', time:Date.now()
    });
    if(!QE.state.bills[phone]) QE.state.bills[phone]=[];
    QE.state.bills[phone].push({type:'Recharge',amount:currentPay.amt,time:Date.now(),note:'UTR: '+utr});
    QE.save();
    QE.confetti();
    QE.modal({icon:'✅',title:'Recharge Successful',body:`<p><b style="color:var(--gold);font-size:22px">${QE.fmt(currentPay.amt)}</b> has been credited to your wallet.<br><br>Transaction ID: <b>${utr}</b></p>`,cancel:false,confirmText:'Go to Home',onConfirm:()=>switchPage('pageHome')});
    currentPay=null;
  };

  // ---- WITHDRAW ----
  function openWithdraw(){
    const cfg = QE.state.config;
    $('#minWdText').textContent = QE.fmt(cfg.minWithdraw);
    $('#wdHoursText').textContent = cfg.withdrawHours;
    const bank = QE.state.bankAccounts[phone];
    if(bank){
      $('#wdBankName').textContent = bank.bank + ' • '+bank.holder;
      $('#wdBankAcc').textContent = 'A/C ****'+bank.account.slice(-4)+' • IFSC '+bank.ifsc;
      $('#wdChangeBank').textContent = 'Change';
    } else {
      $('#wdBankName').textContent = 'No bank account linked';
      $('#wdBankAcc').textContent = 'Tap to add now';
      $('#wdChangeBank').textContent = 'Add';
    }
    $('#wdBankBox').onclick = openBindBank;
    $('#wdChangeBank').onclick = (e)=>{e.stopPropagation();openBindBank();};
    const a = QE.acct(phone);
    $('#wdAvail').textContent = QE.fmt(a.balance);
    const chips = $('#wdChips');
    chips.innerHTML = [500,1000,2000,5000,10000].map(v=>`<button data-amt="${v}">₹${v}</button>`).join('');
    chips.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      chips.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      $('#wdAmount').value=b.dataset.amt; updateFee();
    });
    $('#wdAmount').value=''; $('#wdAmount').oninput=updateFee; updateFee();
    switchPage('pageWithdraw', false);
  }
  function updateFee(){
    const amt = parseFloat($('#wdAmount').value)||0;
    const fee = Math.round(amt*0.03*100)/100;
    $('#wdFee').textContent = `Service fee (3%): ${QE.fmt(fee)} • You will receive: ${QE.fmt(amt-fee)}`;
  }
  $('#backFromWd').onclick = ()=>switchPage('pageMine');
  $('#wdSubmit').onclick = ()=>{
    const bank = QE.state.bankAccounts[phone];
    if(!bank){ QE.toast('Please add bank account first','error'); return openBindBank(); }
    const amt = parseFloat($('#wdAmount').value);
    const cfg = QE.state.config;
    if(!amt || amt<cfg.minWithdraw) return QE.toast('Min withdrawal '+QE.fmt(cfg.minWithdraw),'error');
    const a = QE.acct(phone);
    if(amt > a.balance) return QE.toast('Insufficient balance','error');
    const fee = Math.round(amt*0.03*100)/100;
    a.balance -= amt;
    a.totalWithdraw = (a.totalWithdraw||0) + amt;
    if(!QE.state.withdrawRecords[phone]) QE.state.withdrawRecords[phone]=[];
    QE.state.withdrawRecords[phone].push({
      id:QE.uid(), amount:amt, fee, net:amt-fee,
      bank:bank.bank, account:bank.account, ifsc:bank.ifsc, holder:bank.holder,
      status:'pending', time:Date.now()
    });
    if(!QE.state.bills[phone]) QE.state.bills[phone]=[];
    QE.state.bills[phone].push({type:'Withdrawal',amount:-amt,time:Date.now(),note:'To '+bank.bank+' ****'+bank.account.slice(-4)});
    QE.save();
    QE.confetti();
    QE.modal({icon:'✅',title:'Withdrawal Submitted',body:`<p>Your request of <b style="color:var(--gold);font-size:20px">${QE.fmt(amt)}</b> has been submitted successfully.<br><br>You will receive <b style="color:var(--green)">${QE.fmt(amt-fee)}</b> in your bank account within 2-24 hours during banking hours.<br><br>Track status in <b>Withdrawal Records</b>.</p>`,cancel:false,confirmText:'OK',onConfirm:()=>switchPage('pageMine')});
  };

  // ---- BIND BANK ----
  function openBindBank(){
    const bank = QE.state.bankAccounts[phone] || {};
    QE.modal({
      icon:'🏦',
      title: bank.bank ? 'Update Bank Account' : 'Add Bank Account',
      body:`
        <p>Enter accurate bank details. Withdrawals are sent to this account only.</p>
        <input type="text" placeholder="Account Holder Name (as in bank)" class="input-box" id="bkHolder" value="${bank.holder||user.name}"/>
        <input type="text" placeholder="Bank Name (e.g. HDFC Bank)" class="input-box" id="bkBank" value="${bank.bank||''}"/>
        <input type="text" placeholder="Account Number" class="input-box" id="bkAcc" value="${bank.account||''}"/>
        <input type="text" placeholder="IFSC Code (e.g. HDFC0001234)" class="input-box" id="bkIfsc" value="${bank.ifsc||''}" style="text-transform:uppercase"/>`,
      confirmText:'Save Bank Details',
      onConfirm:(ov)=>{
        const holder = ov.querySelector('#bkHolder').value.trim();
        const bname  = ov.querySelector('#bkBank').value.trim();
        const acc    = ov.querySelector('#bkAcc').value.trim();
        const ifsc   = ov.querySelector('#bkIfsc').value.trim().toUpperCase();
        if(holder.length<2) {QE.toast('Enter holder name','error');return false;}
        if(bname.length<2) {QE.toast('Enter bank name','error');return false;}
        if(!/^[0-9]{9,18}$/.test(acc)) {QE.toast('Invalid account number','error');return false;}
        if(!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {QE.toast('Invalid IFSC code','error');return false;}
        QE.state.bankAccounts[phone] = { holder, bank:bname, account:acc, ifsc, addedAt:Date.now() };
        QE.save();
        QE.toast('Bank account saved');
        renderMine();
        if(document.getElementById('pageWithdraw').classList.contains('active')) openWithdraw();
      }
    });
  }

  // ---- LIST renderer (records / bills) ----
  function openList(title, items, kind){
    $('#listTitle').textContent = title;
    const body = $('#listBody');
    if(!items.length){
      body.innerHTML = '<p style="text-align:center;color:var(--muted);padding:30px">No records yet.</p>';
    } else if(kind==='bill') {
      body.innerHTML = items.map(b=>`<div class="row"><div class="l"><div class="ri">${b.amount>0?'+':'-'}</div><div><div class="t">${b.type}</div><div class="s">${b.note||''} • ${QE.fmtDate(b.time)}</div></div></div><div class="r" style="color:${b.amount>0?'var(--green)':'var(--red)'};font-weight:700">${b.amount>0?'+':''}${QE.fmt(b.amount)}</div></div>`).join('');
    } else if(kind==='rec'){
      body.innerHTML = items.map(r=>`<div class="row"><div class="l"><div class="ri">⬆</div><div><div class="t">${QE.fmt(r.amount)} <span class="pill ${r.status}">${r.status}</span></div><div class="s">${r.method.toUpperCase()} • UTR: ${r.utr} • ${QE.fmtDate(r.time)}</div></div></div></div>`).join('');
    } else if(kind==='wd'){
      body.innerHTML = items.map(r=>`<div class="row"><div class="l"><div class="ri">⬇</div><div><div class="t">${QE.fmt(r.amount)} <span class="pill ${r.status}">${r.status}</span></div><div class="s">${r.bank} ****${r.account.slice(-4)} • ${QE.fmtDate(r.time)}</div></div></div></div>`).join('');
    }
    switchPage('pageList', false);
  }
  $('#backFromList').onclick = ()=>switchPage('pageMine');

  // ---- TEAM ----
  function openTeam(){
    const list = Object.values(QE.state.users).filter(u=>u.referredBy===user.refCode);
    const items = list.map(u=>({
      type:u.name, amount:(QE.acct(u.phone).totalRecharge||0), time:u.createdAt, note:'+91-***'+u.phone.slice(-4)
    }));
    $('#listTitle').textContent='My Team ('+list.length+')';
    const body=$('#listBody');
    if(!items.length){
      body.innerHTML='<p style="text-align:center;color:var(--muted);padding:30px">No team members yet.<br>Share your invite link to grow!</p>';
    } else {
      body.innerHTML = items.map(b=>`<div class="row"><div class="l"><div class="ri">👤</div><div><div class="t">${b.type}</div><div class="s">${b.note} • Joined ${QE.fmtDate(b.time)}</div></div></div><div class="r"><div class="text-gold fw-700">${QE.fmt(b.amount*0.1)}</div><div class="fs-12 text-muted">commission</div></div></div>`).join('');
    }
    switchPage('pageList',false);
  }

  // ---- ABOUT / HELP ----
  function openAbout(){
    const c = QE.state.config;
    QE.modal({
      icon:'ℹ️',
      title:'About QuantumEarn Pro',
      body:`<p style="line-height:1.7;font-size:13px">
        <b style="color:var(--gold)">QuantumEarn Pro</b> is India's next-generation digital wealth platform, founded in 2021 with a mission to make passive income accessible to every Indian household.
        <br><br>
        Backed by SEBI-registered advisors and audited by Big-4 firms, we manage portfolios across mutual funds, blue-chip stocks, fixed-income, and digital assets — delivering consistent daily returns.
        <br><br>
        <b style="color:var(--cyan)">Why 5M+ users trust us:</b><br>
        • Bank-grade 256-bit encryption<br>
        • Instant UPI deposits & 24-hour withdrawals<br>
        • Transparent daily profit credit<br>
        • 24×7 multi-language support
        <br><br>
        <b>Registered Office:</b><br>${c.contactAddress}<br>
        <b>Email:</b> ${c.contactEmail}<br>
        <b>Helpline:</b> ${c.contactPhone}<br>
        <b>CIN:</b> U67100DL2021PTC384921
      </p>`,
      cancel:false, confirmText:'Close'
    });
  }
  function openHelp(){
    const c = QE.state.config;
    QE.modal({
      icon:'💬',
      title:'Help & Support',
      body:`<p>Need assistance? Reach our expert team:</p>
        <div style="background:rgba(255,255,255,.04);padding:12px;border-radius:10px;font-size:13px;line-height:1.7;margin:8px 0">
          <b>📧 Email:</b> ${c.contactEmail}<br>
          <b>📞 Helpline:</b> ${c.contactPhone}<br>
          <b>💬 Live Chat:</b> 24×7<br>
          <b>🏢 Office:</b> ${c.contactAddress}
        </div>
        <p style="font-size:12px;color:var(--muted)">Average response: under 5 minutes for premium users.</p>`,
      cancel:false, confirmText:'Got it'
    });
  }

  // ---- WELCOME POPUP on load ----
  function welcomePopup(){
    const seen = sessionStorage.getItem('qe_welcomed_'+phone);
    if(seen) return;
    sessionStorage.setItem('qe_welcomed_'+phone,'1');
    setTimeout(()=>{
      QE.modal({
        icon:'🎊',
        title:'Welcome to QuantumEarn Pro',
        body:`<p>Hello <b style="color:var(--gold)">${user.name}</b>! 👋</p>
          <p style="line-height:1.7;font-size:13px">
          At <b>QuantumEarn Pro</b>, we transform your idle savings into a steady daily income stream. Our AI-powered portfolios have generated <b style="color:var(--green)">consistent returns since 2021</b>, trusted by over 5 million users across India.
          <br><br>
          🎁 <b>Today's Welcome Offer:</b><br>
          • Free 3-day Starter Plan (₹50/day)<br>
          • ₹30 sign-up bonus (already added)<br>
          • Daily Lucky Spin (₹10-₹40)<br>
          • Gift Code Rewards
          <br><br>
          Start your wealth journey now!
          </p>`,
        cancel:false, confirmText:'Explore Dashboard'
      });
    }, 500);
  }

  // ---- INIT ----
  renderHome();
  welcomePopup();
})();
