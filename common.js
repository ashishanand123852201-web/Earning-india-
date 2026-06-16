/* ===== QuantumEarn Pro - Shared Utilities ===== */
const QE = {
  STORAGE_KEY: 'qe_state_v1',
  defaultState: {
    users: {},          // { phone: { phone, password, name, email, createdAt, referredBy, refCode } }
    accounts: {},       // { phone: { balance, promoIncome, investIncome, totalRecharge, totalWithdraw, ... } }
    bankAccounts: {},   // { phone: { holder, account, ifsc, bank, addedAt } }
    rechargeRecords: {},// { phone: [ { id, amount, method, utr, status, time } ] }
    withdrawRecords: {},// { phone: [ { id, amount, status, time } ] }
    investments: {},    // { phone: [ { productId, name, perDay, days, daysLeft, lastCollected, purchasedAt } ] }
    checkins: {},       // { phone: { lastCheckin, lastGift } }
    bills: {},          // { phone: [ { type, amount, time, note } ] }
    config: {
      upiId: '9263558256@nyyes',
      upiName: 'QuantumEarn Pro',
      siteName: 'QuantumEarn Pro',
      minRecharge: 100,
      minWithdraw: 200,
      withdrawHours: '10:00 AM - 06:00 PM IST (Mon-Sat)',
      paymentMethods: [
        { id:'upi', name:'UPI Fast Pay', desc:'Instant credit via UPI', color:'#22c55e', icon:'UPI' },
        { id:'bank', name:'Bank Transfer', desc:'NEFT / IMPS / RTGS', color:'#3b82f6', icon:'BNK' },
        { id:'wallet', name:'Wallet Pay', desc:'Paytm / PhonePe / GPay', color:'#8b5cf6', icon:'WLT' }
      ],
      contactEmail: 'support@quantumearn.pro',
      contactAddress: 'Tower B, 14th Floor, Cyber Hub, DLF Phase III, Gurugram - 122002, India',
      contactPhone: '+91-1800-QE-EARN',
    },
    admin: { user:'admin', pass:'admin123' },
    adminLog: []
  },
  state: null,
  load(){
    try{
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if(raw){ this.state = JSON.parse(raw); }
      else { this.state = JSON.parse(JSON.stringify(this.defaultState)); this.save(); }
      // patch missing keys
      for(const k of Object.keys(this.defaultState)){
        if(!(k in this.state)) this.state[k] = JSON.parse(JSON.stringify(this.defaultState[k]));
      }
      // patch config keys
      for(const k of Object.keys(this.defaultState.config)){
        if(!(k in (this.state.config||{}))){ this.state.config[k] = this.defaultState.config[k]; }
      }
    }catch(e){
      this.state = JSON.parse(JSON.stringify(this.defaultState)); this.save();
    }
    return this.state;
  },
  save(){ localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state)); },
  session: {
    set(phone){ sessionStorage.setItem('qe_user', phone); localStorage.setItem('qe_user', phone); },
    get(){ return sessionStorage.getItem('qe_user') || localStorage.getItem('qe_user'); },
    clear(){ sessionStorage.removeItem('qe_user'); localStorage.removeItem('qe_user'); },
    adminSet(){ sessionStorage.setItem('qe_admin','1'); },
    adminGet(){ return sessionStorage.getItem('qe_admin')==='1'; },
    adminClear(){ sessionStorage.removeItem('qe_admin'); }
  },
  acct(phone){
    if(!this.state.accounts[phone]){
      this.state.accounts[phone] = { balance:0, promoIncome:0, investIncome:0, totalRecharge:0, totalWithdraw:0 };
    }
    return this.state.accounts[phone];
  },
  rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; },
  uid(){ return 'ID'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase(); },
  refCode(phone){ return 'QE'+phone.slice(-4)+Math.random().toString(36).slice(2,5).toUpperCase(); },
  fmt(n){ return '₹'+Number(n||0).toFixed(2); },
  fmtDate(t){ const d=new Date(t); return d.toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); },
  isSameDay(a,b){ const x=new Date(a),y=new Date(b); return x.toDateString()===y.toDateString(); },
  toast(msg,type='success'){
    const t=document.createElement('div');
    t.className='toast '+type;
    t.innerHTML='<span class="dot"></span>'+msg;
    document.body.appendChild(t);
    setTimeout(()=>{t.style.opacity='0';t.style.transform='translate(-50%,-12px)';setTimeout(()=>t.remove(),350);},2400);
  },
  modal(opts){
    // opts: { title, body, confirm, onConfirm, cancel }
    const overlay=document.createElement('div');
    overlay.className='modal-overlay show';
    overlay.innerHTML=`
      <div class="modal" style="position:relative">
        <button class="modal-close">&times;</button>
        <h3>${opts.icon||''} ${opts.title||''}</h3>
        <div>${opts.body||''}</div>
        <div class="flex gap-8 mt-12">
          ${opts.cancel!==false?'<button class="btn-ghost cancel" style="flex:1;margin:0">'+(opts.cancelText||'Cancel')+'</button>':''}
          ${opts.confirm!==false?'<button class="btn-primary confirm" style="flex:1;margin:0">'+(opts.confirmText||'OK')+'</button>':''}
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close=()=>{overlay.remove();};
    overlay.querySelector('.modal-close').onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    const cancelBtn=overlay.querySelector('.cancel');if(cancelBtn)cancelBtn.onclick=()=>{close();opts.onCancel&&opts.onCancel();};
    const okBtn=overlay.querySelector('.confirm');if(okBtn)okBtn.onclick=()=>{const r=opts.onConfirm&&opts.onConfirm(overlay);if(r!==false)close();};
    return overlay;
  },
  confetti(){
    const colors=['#f5c542','#22c55e','#3b82f6','#8b5cf6','#ef4444','#06b6d4'];
    for(let i=0;i<60;i++){
      const c=document.createElement('div');
      c.className='confetti';
      c.style.left=Math.random()*100+'vw';
      c.style.background=colors[Math.floor(Math.random()*colors.length)];
      c.style.animationDelay=Math.random()*0.6+'s';
      c.style.animationDuration=(2+Math.random()*1.5)+'s';
      document.body.appendChild(c);
      setTimeout(()=>c.remove(),3500);
    }
  },
  // Simple QR-like SVG generator (decorative; not a real scannable code)
  qrSVG(text,size=160){
    const grid=21;
    let seed=0;for(const ch of text) seed=(seed*131+ch.charCodeAt(0))>>>0;
    const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return (seed>>>16)/65536;};
    let cells='';
    for(let y=0;y<grid;y++)for(let x=0;x<grid;x++){
      // finder patterns 3 corners
      const inFinder=(x<7&&y<7)||(x>=grid-7&&y<7)||(x<7&&y>=grid-7);
      let fill=false;
      if(inFinder){
        const fx=x>=grid-7?x-(grid-7):x;
        const fy=y>=grid-7?y-(grid-7):y;
        if((fx===0||fx===6||fy===0||fy===6)||(fx>=2&&fx<=4&&fy>=2&&fy<=4)) fill=true;
      } else {
        fill = rand()<0.48;
      }
      if(fill){ const u=size/grid; cells+=`<rect x="${(x*u).toFixed(2)}" y="${(y*u).toFixed(2)}" width="${u.toFixed(2)}" height="${u.toFixed(2)}"/>`; }
    }
    return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect class="bg" width="${size}" height="${size}"/>${cells}</svg>`;
  },
  initBgAnim(){
    if(!document.querySelector('.bg-anim')){
      const d=document.createElement('div');d.className='bg-anim';
      d.innerHTML='<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>';
      document.body.prepend(d);
      const s=document.createElement('div');s.className='stars';document.body.prepend(s);
    }
  }
};

QE.load();
QE.initBgAnim();
