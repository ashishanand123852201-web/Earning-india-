/* ===== Auth Page Logic ===== */
(function(){
  // If already logged in, jump to home
  if(QE.session.get() && QE.state.users[QE.session.get()]){
    location.href='home.html';return;
  }

  const tabs=document.querySelectorAll('#authTabs button, .switch-tab');
  const loginForm=document.getElementById('loginForm');
  const regForm=document.getElementById('registerForm');
  const loginCap=document.getElementById('loginCap');
  const regCap=document.getElementById('regCap');

  function genCap(){ const chars='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s;}
  let loginCapV=genCap(),regCapV=genCap();
  loginCap.textContent=loginCapV;regCap.textContent=regCapV;
  loginCap.onclick=()=>{loginCapV=genCap();loginCap.textContent=loginCapV;};
  regCap.onclick=()=>{regCapV=genCap();regCap.textContent=regCapV;};

  function switchTab(name){
    document.querySelectorAll('#authTabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===name));
    loginForm.style.display = name==='login'?'block':'none';
    regForm.style.display = name==='register'?'block':'none';
  }
  tabs.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();switchTab(t.dataset.tab);}));

  // LOGIN submit
  loginForm.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(loginForm);
    const phone=fd.get('phone').trim();
    const password=fd.get('password');
    const cap=fd.get('captcha').trim().toUpperCase();
    if(!/^[0-9]{10}$/.test(phone)){ return QE.toast('Enter valid 10-digit phone','error'); }
    if(cap!==loginCapV){ QE.toast('Captcha incorrect','error'); loginCapV=genCap(); loginCap.textContent=loginCapV; return; }
    const u=QE.state.users[phone];
    if(!u){ return QE.toast('Account not found. Please register.','error'); }
    if(u.password!==password){ return QE.toast('Wrong password','error'); }
    QE.session.set(phone);
    QE.modal({
      icon:'✅',
      title:'Login Successful',
      body:`<p>Welcome back, <b style="color:var(--gold)">${u.name}</b>!<br>Redirecting to your dashboard…</p>`,
      cancel:false, confirmText:'Continue',
      onConfirm:()=>{ location.href='home.html'; }
    });
    setTimeout(()=>location.href='home.html', 1600);
  });

  // REGISTER submit
  regForm.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(regForm);
    const name=fd.get('name').trim();
    const phone=fd.get('phone').trim();
    const password=fd.get('password');
    const referral=fd.get('referral').trim();
    const cap=fd.get('captcha').trim().toUpperCase();
    if(name.length<2) return QE.toast('Enter your full name','error');
    if(!/^[0-9]{10}$/.test(phone)) return QE.toast('Enter valid 10-digit phone','error');
    if(password.length<6) return QE.toast('Password must be 6+ chars','error');
    if(cap!==regCapV){ QE.toast('Captcha incorrect','error'); regCapV=genCap(); regCap.textContent=regCapV; return; }
    if(QE.state.users[phone]) return QE.toast('Account already exists. Please sign in.','error');
    const refCode=QE.refCode(phone);
    QE.state.users[phone]={
      phone,password,name,
      email:phone+'@quantumearn.user',
      createdAt:Date.now(),
      referredBy:referral||null,
      refCode
    };
    QE.acct(phone); // init account
    // Welcome bonus
    QE.state.accounts[phone].balance += 30;
    QE.state.accounts[phone].promoIncome += 30;
    if(!QE.state.bills[phone]) QE.state.bills[phone]=[];
    QE.state.bills[phone].push({type:'Welcome Bonus',amount:30,time:Date.now(),note:'Sign-up reward'});
    QE.save();
    QE.confetti();
    QE.modal({
      icon:'🎉',
      title:'Account Created!',
      body:`<p>Welcome <b style="color:var(--gold)">${name}</b>!<br>Your account has been created successfully.<br><br>🎁 <b>₹30 welcome bonus</b> added to your wallet!<br><br>Your Referral Code: <b style="color:var(--cyan)">${refCode}</b></p>`,
      cancel:false, confirmText:'Sign In Now',
      onConfirm:()=>{ switchTab('login'); loginForm.querySelector('[name=phone]').value=phone; }
    });
    regForm.reset();
    regCapV=genCap(); regCap.textContent=regCapV;
  });

  // FORGOT password modal
  document.getElementById('forgotLink').addEventListener('click',e=>{
    e.preventDefault();
    QE.modal({
      icon:'🔑',
      title:'Reset Password',
      body:`
        <p>Enter your registered phone and a new password. Captcha is required for security.</p>
        <input type="tel" maxlength="10" placeholder="Phone Number" class="input-box" id="fpPhone"/>
        <input type="password" placeholder="New Password (min 6)" class="input-box" id="fpPass"/>
        <div class="captcha-row" style="margin-top:6px">
          <div class="captcha-box" id="fpCap" style="flex:0 0 110px"></div>
          <input type="text" placeholder="Enter captcha" class="input-box" id="fpCapIn" style="margin:0"/>
        </div>`,
      confirmText:'Reset Password',
      onConfirm:(ov)=>{
        const ph=ov.querySelector('#fpPhone').value.trim();
        const pw=ov.querySelector('#fpPass').value;
        const cp=ov.querySelector('#fpCapIn').value.trim().toUpperCase();
        const cv=ov.querySelector('#fpCap').textContent;
        if(!/^[0-9]{10}$/.test(ph)){QE.toast('Invalid phone','error');return false;}
        if(pw.length<6){QE.toast('Password 6+ chars','error');return false;}
        if(cp!==cv){QE.toast('Captcha incorrect','error');return false;}
        if(!QE.state.users[ph]){QE.toast('Account not found','error');return false;}
        QE.state.users[ph].password=pw;QE.save();
        QE.toast('Password reset successful');
      }
    });
    const fpCap=document.getElementById('fpCap'); fpCap.textContent=genCap();
    fpCap.onclick=()=>{fpCap.textContent=genCap();};
  });

  // HELP modal
  document.getElementById('helpLink').addEventListener('click',e=>{
    e.preventDefault();
    const c=QE.state.config;
    QE.modal({
      icon:'💬',
      title:'24×7 Customer Support',
      body:`
        <p style="margin-bottom:10px">Our dedicated support team is available round the clock to assist you with:</p>
        <ul style="color:var(--muted);font-size:13px;line-height:1.8;padding-left:18px;margin-bottom:12px">
          <li>Account login & registration issues</li>
          <li>Password recovery & security</li>
          <li>Recharge / withdrawal queries</li>
          <li>Investment plan guidance</li>
          <li>KYC / Bank verification help</li>
        </ul>
        <div style="background:rgba(255,255,255,.04);padding:12px;border-radius:10px;font-size:13px;line-height:1.7">
          <b>📧 Email:</b> ${c.contactEmail}<br>
          <b>📞 Helpline:</b> ${c.contactPhone}<br>
          <b>🏢 Office:</b> ${c.contactAddress}<br>
          <b>⏰ Hours:</b> 24×7 (chat) / 10AM-7PM (call)
        </div>`,
      cancel:false, confirmText:'Got it'
    });
  });
})();
