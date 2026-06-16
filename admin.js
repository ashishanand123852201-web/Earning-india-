/* ===== QuantumEarn Pro - Admin Panel ===== */
(function(){
  const $ = s=>document.querySelector(s);
  const $$ = s=>document.querySelectorAll(s);

  function showPanel(){
    $('#adminLoginPage').style.display='none';
    $('#adminPanel').style.display='';
    $('#adminWho').textContent = 'Signed in as '+QE.state.admin.user;
    renderOverview();
    switchTab('users');
  }
  function showLogin(){
    $('#adminLoginPage').style.display='';
    $('#adminPanel').style.display='none';
    $('#adminWho').textContent = 'Sign-in required';
  }

  if(QE.session.adminGet()) showPanel(); else showLogin();

  $('#adminLoginForm').onsubmit = e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const u = fd.get('user').trim();
    const p = fd.get('pass');
    if(u===QE.state.admin.user && p===QE.state.admin.pass){
      QE.session.adminSet();
      QE.toast('Admin login successful');
      showPanel();
    } else {
      QE.toast('Invalid credentials','error');
    }
  };

  $('#adminLogout').onclick = ()=>{
    QE.modal({icon:'⏻',title:'Logout?',body:'<p>End admin session?</p>',confirmText:'Logout',onConfirm:()=>{
      QE.session.adminClear(); showLogin();
    }});
  };

  function renderOverview(){
    const users = Object.values(QE.state.users);
    let totalBal=0,totalRech=0,totalWd=0,pendingWd=0;
    users.forEach(u=>{
      const a = QE.state.accounts[u.phone]||{};
      totalBal += a.balance||0;
      totalRech += a.totalRecharge||0;
      totalWd += a.totalWithdraw||0;
    });
    Object.values(QE.state.withdrawRecords).forEach(arr=>{
      arr.forEach(w=>{ if(w.status==='pending') pendingWd++; });
    });
    const g = $('#overviewGrid');
    g.innerHTML = `
      <div class="admin-stat"><div class="l">Total Users</div><div class="v">${users.length}</div></div>
      <div class="admin-stat"><div class="l">Wallet Balance (Live)</div><div class="v">${QE.fmt(totalBal)}</div></div>
      <div class="admin-stat"><div class="l">Total Recharged</div><div class="v">${QE.fmt(totalRech)}</div></div>
      <div class="admin-stat"><div class="l">Total Withdrawn</div><div class="v">${QE.fmt(totalWd)}</div></div>
      <div class="admin-stat"><div class="l">Pending Withdrawals</div><div class="v">${pendingWd}</div></div>
      <div class="admin-stat"><div class="l">UPI ID</div><div class="v" style="font-size:14px;word-break:break-all">${QE.state.config.upiId}</div></div>`;
  }

  $('#adminTabs').querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>switchTab(b.dataset.atab);
  });
  function switchTab(t){
    $$('#adminTabs button').forEach(b=>b.classList.toggle('active', b.dataset.atab===t));
    if(t==='users') renderUsers();
    else if(t==='recharge') renderRecharges();
    else if(t==='withdraw') renderWithdrawals();
    else if(t==='invest') renderInvestments();
    else if(t==='config') renderConfig();
    else if(t==='adjust') renderAdjust();
    else if(t==='data') renderData();
  }

  function renderUsers(){
    const users = Object.values(QE.state.users).sort((a,b)=>b.createdAt-a.createdAt);
    if(!users.length){ $('#adminContent').innerHTML='<p style="text-align:center;color:var(--muted);padding:30px">No users registered yet.</p>'; return; }
    const rows = users.map(u=>{
      const a = QE.state.accounts[u.phone]||{};
      return `<tr>
        <td>${u.name}</td>
        <td>${u.phone}</td>
        <td style="color:var(--gold);font-weight:700">${u.refCode}</td>
        <td>${QE.fmt(a.balance||0)}</td>
        <td>${QE.fmt(a.totalRecharge||0)}</td>
        <td>${QE.fmt(a.totalWithdraw||0)}</td>
        <td>${u.referredBy||'-'}</td>
        <td>${QE.fmtDate(u.createdAt)}</td>
        <td>
          <button class="pill pending" data-act="view" data-ph="${u.phone}" style="cursor:pointer;border:none">View</button>
          <button class="pill rejected" data-act="del" data-ph="${u.phone}" style="cursor:pointer;border:none">Del</button>
        </td>
      </tr>`;
    }).join('');
    $('#adminContent').innerHTML = `<div style="overflow-x:auto"><table class="adm">
      <thead><tr><th>Name</th><th>Phone</th><th>Code</th><th>Balance</th><th>Recharge</th><th>Withdraw</th><th>Ref By</th><th>Joined</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
    $$('#adminContent [data-act]').forEach(b=>{
      b.onclick=()=>{
        const ph = b.dataset.ph;
        if(b.dataset.act==='view') viewUser(ph);
        else if(b.dataset.act==='del') deleteUser(ph);
      };
    });
  }

  function viewUser(ph){
    const u = QE.state.users[ph];
    const a = QE.state.accounts[ph]||{};
    const bk = QE.state.bankAccounts[ph];
    const inv = QE.state.investments[ph]||[];
    const rec = QE.state.rechargeRecords[ph]||[];
    const wd = QE.state.withdrawRecords[ph]||[];
    QE.modal({
      icon:'👤',title:u.name,
      body:`<div style="font-size:13px;line-height:1.8">
        <b>Phone:</b> ${u.phone}<br>
        <b>Email:</b> ${u.email}<br>
        <b>Ref Code:</b> <span style="color:var(--gold)">${u.refCode}</span><br>
        <b>Referred By:</b> ${u.referredBy||'-'}<br>
        <b>Joined:</b> ${QE.fmtDate(u.createdAt)}<br>
        <b>Password:</b> <code>${u.password}</code><br><br>
        <b>Balance:</b> ${QE.fmt(a.balance||0)}<br>
        <b>Promo Income:</b> ${QE.fmt(a.promoIncome||0)}<br>
        <b>Invest Income:</b> ${QE.fmt(a.investIncome||0)}<br>
        <b>Total Recharged:</b> ${QE.fmt(a.totalRecharge||0)}<br>
        <b>Total Withdrawn:</b> ${QE.fmt(a.totalWithdraw||0)}<br><br>
        <b>Bank:</b> ${bk?`${bk.bank} A/C ${bk.account} IFSC ${bk.ifsc} (${bk.holder})`:'Not bound'}<br>
        <b>Active Plans:</b> ${inv.length} | <b>Recharges:</b> ${rec.length} | <b>Withdrawals:</b> ${wd.length}
      </div>`,
      cancel:false, confirmText:'Close'
    });
  }

  function deleteUser(ph){
    QE.modal({icon:'⚠️',title:'Delete User?',body:'<p>This will permanently delete the user and all their data including investments, records, and bank info.</p>',confirmText:'Delete',onConfirm:()=>{
      delete QE.state.users[ph];
      delete QE.state.accounts[ph];
      delete QE.state.bankAccounts[ph];
      delete QE.state.rechargeRecords[ph];
      delete QE.state.withdrawRecords[ph];
      delete QE.state.investments[ph];
      delete QE.state.checkins[ph];
      delete QE.state.bills[ph];
      QE.save();
      QE.toast('User deleted');
      renderUsers(); renderOverview();
    }});
  }

  function renderRecharges(){
    const all = [];
    Object.entries(QE.state.rechargeRecords).forEach(([ph,arr])=>{
      arr.forEach(r=>all.push({...r, phone:ph, name:QE.state.users[ph]?.name||'?'}));
    });
    all.sort((a,b)=>b.time-a.time);
    if(!all.length){ $('#adminContent').innerHTML='<p style="text-align:center;color:var(--muted);padding:30px">No recharges yet.</p>'; return; }
    const rows = all.map(r=>`<tr>
      <td>${r.name}<br><span style="color:var(--muted);font-size:11px">${r.phone}</span></td>
      <td style="color:var(--gold);font-weight:700">${QE.fmt(r.amount)}</td>
      <td>${r.method.toUpperCase()}</td>
      <td><code>${r.utr}</code></td>
      <td><span class="pill ${r.status}">${r.status}</span></td>
      <td>${QE.fmtDate(r.time)}</td>
    </tr>`).join('');
    $('#adminContent').innerHTML = `<div style="overflow-x:auto"><table class="adm">
      <thead><tr><th>User</th><th>Amount</th><th>Method</th><th>UTR</th><th>Status</th><th>Time</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function renderWithdrawals(){
    const all = [];
    Object.entries(QE.state.withdrawRecords).forEach(([ph,arr])=>{
      arr.forEach((r,idx)=>all.push({...r, _idx:idx, phone:ph, name:QE.state.users[ph]?.name||'?'}));
    });
    all.sort((a,b)=>b.time-a.time);
    if(!all.length){ $('#adminContent').innerHTML='<p style="text-align:center;color:var(--muted);padding:30px">No withdrawals yet.</p>'; return; }
    const rows = all.map(r=>`<tr>
      <td>${r.name}<br><span style="color:var(--muted);font-size:11px">${r.phone}</span></td>
      <td style="color:var(--gold);font-weight:700">${QE.fmt(r.amount)}<br><span style="color:var(--muted);font-size:11px">Net ${QE.fmt(r.net||r.amount)}</span></td>
      <td>${r.bank}<br><span style="color:var(--muted);font-size:11px">${r.account} / ${r.ifsc}</span></td>
      <td>${r.holder}</td>
      <td><span class="pill ${r.status}">${r.status}</span></td>
      <td>${QE.fmtDate(r.time)}</td>
      <td>
        ${r.status==='pending'?`<button class="pill approved" data-wact="approve" data-id="${r.id}" style="cursor:pointer;border:none">Approve</button>
        <button class="pill rejected" data-wact="reject" data-id="${r.id}" style="cursor:pointer;border:none">Reject</button>`:'-'}
      </td>
    </tr>`).join('');
    $('#adminContent').innerHTML = `<div style="overflow-x:auto"><table class="adm">
      <thead><tr><th>User</th><th>Amount</th><th>Bank</th><th>Holder</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
    $$('#adminContent [data-wact]').forEach(b=>{
      b.onclick=()=>actWd(b.dataset.id, b.dataset.wact);
    });
  }

  function actWd(id, act){
    Object.entries(QE.state.withdrawRecords).forEach(([ph,arr])=>{
      arr.forEach(r=>{
        if(r.id===id){
          if(act==='approve'){ r.status='approved'; QE.toast('Withdrawal approved'); }
          else if(act==='reject'){
            r.status='rejected';
            // refund to user
            const a = QE.acct(ph);
            a.balance += r.amount;
            a.totalWithdraw = Math.max(0,(a.totalWithdraw||0)-r.amount);
            if(!QE.state.bills[ph]) QE.state.bills[ph]=[];
            QE.state.bills[ph].push({type:'Withdrawal Refund',amount:r.amount,time:Date.now(),note:'Admin rejected'});
            QE.toast('Rejected & refunded');
          }
        }
      });
    });
    QE.save();
    renderWithdrawals(); renderOverview();
  }

  function renderInvestments(){
    const all = [];
    Object.entries(QE.state.investments).forEach(([ph,arr])=>{
      arr.forEach(i=>all.push({...i, phone:ph, name:QE.state.users[ph]?.name||'?'}));
    });
    all.sort((a,b)=>b.purchasedAt-a.purchasedAt);
    if(!all.length){ $('#adminContent').innerHTML='<p style="text-align:center;color:var(--muted);padding:30px">No active investments.</p>'; return; }
    const rows = all.map(i=>`<tr>
      <td>${i.name}<br><span style="color:var(--muted);font-size:11px">${i.phone}</span></td>
      <td>${i.name}</td>
      <td>${QE.fmt(i.perDay)}</td>
      <td>${i.daysLeft} / ${i.days}</td>
      <td>${i.lastCollected?QE.fmtDate(i.lastCollected):'Never'}</td>
      <td>${QE.fmtDate(i.purchasedAt)}</td>
    </tr>`).join('');
    $('#adminContent').innerHTML = `<div style="overflow-x:auto"><table class="adm">
      <thead><tr><th>User</th><th>Plan</th><th>Per Day</th><th>Days Left</th><th>Last Collect</th><th>Purchased</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function renderConfig(){
    const c = QE.state.config;
    $('#adminContent').innerHTML = `
      <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;max-width:560px">
        <h3 style="margin-bottom:14px">⚙️ Site Settings</h3>
        <div class="field"><label>UPI Payment ID (used in recharge)</label><input class="input-box" id="cfgUpi" value="${c.upiId}"/></div>
        <div class="field"><label>UPI Name</label><input class="input-box" id="cfgUpiName" value="${c.upiName}"/></div>
        <div class="field"><label>Minimum Recharge (₹)</label><input class="input-box" id="cfgMinR" type="number" value="${c.minRecharge}"/></div>
        <div class="field"><label>Minimum Withdrawal (₹)</label><input class="input-box" id="cfgMinW" type="number" value="${c.minWithdraw}"/></div>
        <div class="field"><label>Withdrawal Hours (display text)</label><input class="input-box" id="cfgWdH" value="${c.withdrawHours}"/></div>
        <div class="field"><label>Support Email</label><input class="input-box" id="cfgEmail" value="${c.contactEmail}"/></div>
        <div class="field"><label>Helpline</label><input class="input-box" id="cfgPhone" value="${c.contactPhone}"/></div>
        <div class="field"><label>Office Address</label><input class="input-box" id="cfgAddr" value="${c.contactAddress}"/></div>
        <h4 style="margin:18px 0 10px">Payment Methods (3)</h4>
        ${c.paymentMethods.map((m,i)=>`
          <div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px;margin-bottom:8px">
            <input class="input-box" data-pm-i="${i}" data-pm-k="name" value="${m.name}" placeholder="Method name" style="margin-bottom:6px"/>
            <input class="input-box" data-pm-i="${i}" data-pm-k="desc" value="${m.desc}" placeholder="Description" style="margin-bottom:6px"/>
            <input class="input-box" data-pm-i="${i}" data-pm-k="icon" value="${m.icon}" placeholder="3-letter icon" style="margin-bottom:0"/>
          </div>`).join('')}
        <h4 style="margin:18px 0 10px">Admin Credentials</h4>
        <div class="field"><label>Admin Username</label><input class="input-box" id="cfgAdmU" value="${QE.state.admin.user}"/></div>
        <div class="field"><label>Admin Password</label><input class="input-box" id="cfgAdmP" value="${QE.state.admin.pass}"/></div>
        <button class="btn-primary" id="cfgSave">SAVE SETTINGS</button>
      </div>`;
    $('#cfgSave').onclick = ()=>{
      c.upiId = $('#cfgUpi').value.trim();
      c.upiName = $('#cfgUpiName').value.trim();
      c.minRecharge = parseInt($('#cfgMinR').value)||100;
      c.minWithdraw = parseInt($('#cfgMinW').value)||200;
      c.withdrawHours = $('#cfgWdH').value.trim();
      c.contactEmail = $('#cfgEmail').value.trim();
      c.contactPhone = $('#cfgPhone').value.trim();
      c.contactAddress = $('#cfgAddr').value.trim();
      c.paymentMethods.forEach((m,i)=>{
        ['name','desc','icon'].forEach(k=>{
          const el=document.querySelector(`[data-pm-i="${i}"][data-pm-k="${k}"]`);
          if(el) m[k]=el.value;
        });
      });
      QE.state.admin.user = $('#cfgAdmU').value.trim()||'admin';
      QE.state.admin.pass = $('#cfgAdmP').value||'admin123';
      QE.save();
      QE.toast('Settings saved');
      renderOverview();
    };
  }

  function renderAdjust(){
    const users = Object.values(QE.state.users);
    $('#adminContent').innerHTML = `
      <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;max-width:520px">
        <h3 style="margin-bottom:6px">💰 Manual Balance Adjustment</h3>
        <p style="color:var(--muted);font-size:12.5px;margin-bottom:14px">Credit or debit a user's wallet manually. Use positive number to credit, negative to debit.</p>
        <div class="field"><label>Select User</label>
          <select class="input-box" id="adjUser">${users.map(u=>`<option value="${u.phone}">${u.name} — ${u.phone}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Amount (₹)</label><input class="input-box" id="adjAmt" type="number" placeholder="e.g. 100 or -50"/></div>
        <div class="field"><label>Note</label><input class="input-box" id="adjNote" placeholder="Reason for adjustment"/></div>
        <button class="btn-primary" id="adjSave">APPLY ADJUSTMENT</button>
      </div>`;
    $('#adjSave').onclick = ()=>{
      const ph = $('#adjUser').value;
      const amt = parseFloat($('#adjAmt').value);
      const note = $('#adjNote').value.trim()||'Admin adjustment';
      if(!ph || !amt) return QE.toast('Fill all fields','error');
      const a = QE.acct(ph);
      a.balance += amt;
      if(!QE.state.bills[ph]) QE.state.bills[ph]=[];
      QE.state.bills[ph].push({type:amt>0?'Admin Credit':'Admin Debit',amount:amt,time:Date.now(),note});
      QE.save();
      QE.toast('Balance updated');
      renderOverview();
    };
  }

  function renderData(){
    $('#adminContent').innerHTML = `
      <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;max-width:560px">
        <h3 style="margin-bottom:14px">🗄 Data Management</h3>
        <p style="color:var(--muted);font-size:12.5px;margin-bottom:14px">Export or import the full site database (JSON). Use for backups or migration.</p>
        <button class="btn-primary" id="dlExport" style="margin-bottom:10px">⬇ EXPORT DATABASE (JSON)</button>
        <button class="btn-ghost" id="dlReset">⚠️ RESET ALL DATA</button>
        <h4 style="margin:18px 0 8px">Import JSON</h4>
        <textarea class="input-box" id="impJson" rows="6" placeholder='Paste exported JSON here...' style="font-family:monospace;font-size:11px"></textarea>
        <button class="btn-primary" id="dlImport" style="margin-top:8px">⬆ IMPORT</button>
      </div>`;
    $('#dlExport').onclick = ()=>{
      const data = JSON.stringify(QE.state,null,2);
      const blob = new Blob([data],{type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'quantumearn-backup-'+Date.now()+'.json';
      a.click();
      QE.toast('Downloaded backup');
    };
    $('#dlReset').onclick = ()=>{
      QE.modal({icon:'⚠️',title:'Reset Everything?',body:'<p>This will delete <b>ALL users, balances, records and settings</b>. This cannot be undone.</p>',confirmText:'Yes, Reset',onConfirm:()=>{
        localStorage.removeItem(QE.STORAGE_KEY);
        QE.load();
        QE.session.adminClear();
        QE.toast('Database reset');
        location.reload();
      }});
    };
    $('#dlImport').onclick = ()=>{
      try{
        const obj = JSON.parse($('#impJson').value);
        QE.state = obj; QE.save();
        QE.toast('Import successful');
        renderOverview();
      }catch(e){ QE.toast('Invalid JSON','error'); }
    };
  }
})();
