/* ===== TechPulse — Shared JS ===== */

/* ---------- Mobile menu toggle ---------- */
function toggleMenu(){
  const m = document.querySelector('.nav-menu');
  if(m) m.classList.toggle('open');
}

/* ---------- Mark active nav link ---------- */
(function highlightNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(a=>{
    const href = a.getAttribute('href').split('/').pop();
    if(href === path) a.classList.add('active');
  });
})();

/* ---------- Mock News Database ---------- */
const NEWS_DB = [
  {id:1, emoji:'🚀', tag:'World', title:'SpaceX Launches Next-Gen Starlink Satellites Into Orbit',
   desc:'Latest mission expands global internet coverage with 60 new satellites delivered successfully.',
   date:'Jun 17, 2026', author:'Tech Desk',
   body:[
     'SpaceX has successfully launched its newest batch of Starlink satellites, marking another milestone in expanding global broadband coverage.',
     'The Falcon 9 rocket lifted off from Kennedy Space Center and deployed 60 satellites into low Earth orbit within minutes of launch. The first stage booster landed safely on a drone ship in the Atlantic.',
     'With this mission, Starlink now serves more than 70 countries, providing internet access to remote regions where traditional infrastructure has been impractical.',
     'Industry analysts believe this expansion will reshape global connectivity, especially in developing nations and disaster-recovery zones.'
   ]},
  {id:2, emoji:'💹', tag:'Markets', title:'Global Stock Markets Hit Record Highs Amid AI Boom',
   desc:'Tech stocks surge as investors pour billions into AI-driven companies across all continents.',
   date:'Jun 17, 2026', author:'Markets Desk',
   body:[
     'Major indices touched new all-time highs as AI infrastructure spending continues to dominate investor sentiment.',
     'Semiconductor giants and cloud providers led the rally, with several names posting double-digit gains over the week.',
     'Analysts caution that valuations are stretched, though earnings revisions remain firmly positive.'
   ]},
  {id:3, emoji:'⚽', tag:'Sports', title:'Underdog Team Stuns Champions in Final Minutes',
   desc:'A last-minute goal seals a historic victory for the unranked challengers in a packed stadium.',
   date:'Jun 16, 2026', author:'Sports Desk',
   body:[
     'In one of the most dramatic finishes of the season, the visiting side scored deep into stoppage time to overturn a one-goal deficit.',
     'Fans erupted as the winning goal hit the back of the net, sending the team into the next round of the tournament.',
     'The manager praised his squad\'s resilience and credited a tactical change made at halftime for the comeback.'
   ]},
  {id:4, emoji:'🏛️', tag:'Politics', title:'New Climate Bill Passes With Bipartisan Support',
   desc:'Sweeping legislation aims to cut emissions by 50% within the next decade.',
   date:'Jun 16, 2026', author:'Politics Desk',
   body:[
     'Lawmakers passed a landmark climate bill with rare bipartisan backing, setting aggressive targets for renewable energy adoption.',
     'The package includes tax incentives for clean technology, funding for grid modernization, and stricter emission standards for heavy industry.',
     'Environmental groups welcomed the move but urged faster implementation timelines.'
   ]},
  {id:5, emoji:'🎬', tag:'Entertainment', title:'Blockbuster Film Smashes Opening-Weekend Records',
   desc:'Audiences flock to theaters as the long-awaited sequel grosses over $300M in three days.',
   date:'Jun 15, 2026', author:'Entertainment Desk',
   body:[
     'The much-anticipated sequel opened to packed theaters worldwide, shattering opening-weekend records in multiple markets.',
     'Critics praised the visual effects and emotional storytelling, while fans celebrated the return of beloved characters.',
     'The studio has already greenlit a follow-up project, set for release next year.'
   ]},
  {id:6, emoji:'🏥', tag:'Health', title:'Breakthrough Cancer Treatment Shows 90% Success Rate',
   desc:'New immunotherapy trial offers hope to patients with previously untreatable conditions.',
   date:'Jun 15, 2026', author:'Health Desk',
   body:[
     'A groundbreaking immunotherapy trial has reported a 90% remission rate among patients with advanced-stage cancers.',
     'Researchers say the treatment retrains the body\'s immune system to recognize and destroy malignant cells with unprecedented precision.',
     'Wider clinical rollouts are expected within the next two years pending regulatory approval.'
   ]}
];

/* ---------- Tech Posts Database ---------- */
const TECH_DB = [
  {id:101, emoji:'🤖', tag:'AI', title:'GPT-6 Released: New Multimodal Capabilities Unveiled',
   desc:'The latest AI model can now process video, audio, and text simultaneously in real time.',
   date:'Jun 17, 2026', cat:'ai'},
  {id:102, emoji:'📱', tag:'Mobile', title:'iPhone 17 Pro Leaked: Titanium Frame & Solar Charging',
   desc:'Rumors suggest Apple\'s next flagship will feature revolutionary battery technology.',
   date:'Jun 16, 2026', cat:'apps'},
  {id:103, emoji:'💰', tag:'Earning', title:'10 Best Side Hustles For 2026 — Online Income Guide',
   desc:'From freelancing to affiliate marketing, here are proven ways to earn online this year.',
   date:'Jun 16, 2026', cat:'earning'},
  {id:104, emoji:'🌐', tag:'Internet', title:'5 Speed Tricks To Make Your Wi-Fi 3x Faster',
   desc:'Simple router tweaks and settings that can dramatically boost your home network speeds.',
   date:'Jun 15, 2026', cat:'tips'},
  {id:105, emoji:'🎨', tag:'Apps', title:'New AI Photo App Removes Backgrounds Instantly',
   desc:'Free tool gaining popularity offers professional-grade photo editing in seconds.',
   date:'Jun 15, 2026', cat:'apps'},
  {id:106, emoji:'🧠', tag:'AI', title:'Google Gemini Update: Faster, Smarter, Now Free',
   desc:'Major upgrade brings advanced reasoning to all users at no cost.',
   date:'Jun 14, 2026', cat:'ai'},
  {id:107, emoji:'💸', tag:'Earning', title:'YouTube Shorts Now Pay Creators Per View',
   desc:'New monetization model rewards short-form content based on watch time.',
   date:'Jun 14, 2026', cat:'earning'},
  {id:108, emoji:'🔒', tag:'Tips', title:'Top 7 Password Managers To Secure Your Accounts',
   desc:'Compared: features, pricing, and security of leading password tools in 2026.',
   date:'Jun 13, 2026', cat:'tips'}
];

/* ---------- Render news cards ---------- */
function renderNews(targetId, items){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = items.map(n => `
    <article class="card">
      <div class="card-img">
        <span class="tag">${n.tag}</span>
        <div class="emoji">${n.emoji}</div>
      </div>
      <div class="card-body">
        <h3><a href="news/news-detail.html?id=${n.id}">${n.title}</a></h3>
        <p>${n.desc}</p>
        <div class="meta"><span>${n.date}</span><span>${n.author||'Editor'}</span></div>
        <a class="read-more" href="news/news-detail.html?id=${n.id}">Read More →</a>
      </div>
    </article>`).join('');
}

/* ---------- Load news for home/news pages ---------- */
function loadNews(targetId, limit){
  const items = limit ? NEWS_DB.slice(0,limit) : NEWS_DB;
  renderNews(targetId, items);
}

/* ---------- Render tech posts ---------- */
function renderTech(targetId, items){
  const el = document.getElementById(targetId);
  if(!el) return;
  if(!items.length){
    el.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:40px">No posts found in this category.</p>`;
    return;
  }
  el.innerHTML = items.map(n => `
    <article class="card">
      <div class="card-img">
        <span class="tag">${n.tag}</span>
        <div class="emoji">${n.emoji}</div>
      </div>
      <div class="card-body">
        <h3><a href="news/news-detail.html?id=${n.id}&type=tech">${n.title}</a></h3>
        <p>${n.desc}</p>
        <div class="meta"><span>${n.date}</span><span>TechPulse</span></div>
        <a class="read-more" href="news/news-detail.html?id=${n.id}&type=tech">Read More →</a>
      </div>
    </article>`).join('');
}

/* ---------- Filter tech posts ---------- */
function filterTechPosts(cat){
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.toggle('active', c.dataset.cat===cat));
  const items = cat==='all' ? TECH_DB : TECH_DB.filter(p=>p.cat===cat);
  renderTech('techGrid', items);
}

/* ---------- Open article (used by detail page) ---------- */
function openArticle(){
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'),10);
  const type = params.get('type');
  const db = type === 'tech' ? TECH_DB : NEWS_DB;
  const idx = db.findIndex(a=>a.id===id);
  const a = db[idx];
  const wrap = document.getElementById('articleWrap');
  if(!a){ wrap.innerHTML='<h1>Article not found</h1><p><a href="../index.html">← Back to home</a></p>'; return; }

  // Provide default body for tech articles
  const body = a.body || [
    `${a.desc} In this in-depth look, we explore what this means for users and the broader industry.`,
    'Experts agree that the development signals a new phase in how the technology will evolve over the coming months. Early adopters are already exploring practical use cases.',
    'For everyday users, the changes promise improved performance, better usability, and new features that were previously out of reach. Stay tuned to TechPulse for ongoing coverage.'
  ];

  document.title = `${a.title} — TechPulse`;
  wrap.innerHTML = `
    <div class="crumbs"><a href="../index.html">Home</a> / <a href="../${type==='tech'?'tech':'news'}.html">${type==='tech'?'Tech':'News'}</a> / Article</div>
    <h1>${a.title}</h1>
    <div class="article-meta">
      <span>📅 ${a.date}</span>
      <span>✍️ ${a.author||'TechPulse Editor'}</span>
      <span>🏷️ ${a.tag}</span>
    </div>
    <div class="article-hero">${a.emoji}</div>
    <div class="ad-slot ad-inline">Ad Slot — After Title (PropellerAds)</div>
    <div class="article-body">
      ${body.map((p,i)=>i===Math.floor(body.length/2) ? `<p>${p}</p><div class="ad-slot ad-inline">Ad Slot — Between Paragraphs (PropellerAds)</div>` : `<p>${p}</p>`).join('')}
      <h2>Why It Matters</h2>
      <p>Developments like these shape the technological and cultural landscape of our time. TechPulse will continue to bring you the most relevant updates as the story unfolds.</p>
    </div>
    <div class="share-bar">
      <span>Share:</span>
      <a class="share-btn" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">𝕏 Twitter</a>
      <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">f Facebook</a>
      <a class="share-btn" href="https://wa.me/?text=${encodeURIComponent(a.title+' '+location.href)}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="share-btn" href="mailto:?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(location.href)}">Email</a>
    </div>
    <div class="ad-slot ad-medium">Ad Slot — End of Article (PropellerAds Best-Earning)</div>
    <div class="nav-prev-next">
      ${db[idx-1] ? `<a class="btn btn-ghost" href="news-detail.html?id=${db[idx-1].id}${type==='tech'?'&type=tech':''}">← ${db[idx-1].title.slice(0,40)}…</a>` : '<span></span>'}
      ${db[idx+1] ? `<a class="btn btn-ghost" href="news-detail.html?id=${db[idx+1].id}${type==='tech'?'&type=tech':''}">${db[idx+1].title.slice(0,40)}… →</a>` : '<span></span>'}
    </div>
  `;
}

/* ---------- BMI Calculator ---------- */
function calculateBMI(){
  const h = parseFloat(document.getElementById('bmiHeight').value);
  const w = parseFloat(document.getElementById('bmiWeight').value);
  const out = document.getElementById('bmiResult');
  if(!h || !w || h<=0 || w<=0){
    out.classList.add('show');
    out.innerHTML = '<div class="sub" style="color:var(--bad)">Please enter valid height and weight.</div>';
    return;
  }
  const m = h/100;
  const bmi = w/(m*m);
  let cat = '', color = 'var(--accent)';
  if(bmi<18.5){cat='Underweight';color='var(--warn)';}
  else if(bmi<25){cat='Normal weight';color='var(--good)';}
  else if(bmi<30){cat='Overweight';color='var(--warn)';}
  else {cat='Obese';color='var(--bad)';}
  out.classList.add('show');
  out.innerHTML = `
    <div class="label">Your BMI</div>
    <div class="big" style="color:${color}">${bmi.toFixed(1)}</div>
    <div class="sub">Category: <strong style="color:${color}">${cat}</strong></div>`;
}

/* ---------- Age Calculator ---------- */
function calculateAge(){
  const d = document.getElementById('ageDate').value;
  const out = document.getElementById('ageResult');
  if(!d){
    out.classList.add('show');
    out.innerHTML='<div class="sub" style="color:var(--bad)">Please choose your date of birth.</div>';
    return;
  }
  const dob = new Date(d), today = new Date();
  if(dob > today){
    out.classList.add('show');
    out.innerHTML='<div class="sub" style="color:var(--bad)">Birth date cannot be in the future.</div>';
    return;
  }
  let y = today.getFullYear()-dob.getFullYear();
  let m = today.getMonth()-dob.getMonth();
  let dd = today.getDate()-dob.getDate();
  if(dd<0){ m--; dd += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if(m<0){ y--; m+=12; }
  const days = Math.floor((today-dob)/86400000);
  out.classList.add('show');
  out.innerHTML = `
    <div class="label">You are</div>
    <div class="big">${y} <span style="font-size:1rem;color:var(--muted)">years</span> ${m} <span style="font-size:1rem;color:var(--muted)">months</span> ${dd} <span style="font-size:1rem;color:var(--muted)">days</span></div>
    <div class="sub">That's <strong>${days.toLocaleString()}</strong> days alive 🎉</div>`;
}

/* ---------- Random Number Generator ---------- */
function generateRandomNumber(){
  const min = parseInt(document.getElementById('rngMin').value,10);
  const max = parseInt(document.getElementById('rngMax').value,10);
  const out = document.getElementById('rngResult');
  if(isNaN(min) || isNaN(max) || min>=max){
    out.classList.add('show');
    out.innerHTML='<div class="sub" style="color:var(--bad)">Min must be less than Max.</div>';
    return;
  }
  const n = Math.floor(Math.random()*(max-min+1))+min;
  out.classList.add('show');
  out.innerHTML = `<div class="label">Random number</div><div class="big">${n}</div><div class="sub">Range: ${min} to ${max}</div>`;
}

/* ---------- Percentage Calculator ---------- */
function calculatePercent(){
  const mode = document.getElementById('pctMode').value;
  const a = parseFloat(document.getElementById('pctA').value);
  const b = parseFloat(document.getElementById('pctB').value);
  const out = document.getElementById('pctResult');
  if(isNaN(a)||isNaN(b)){
    out.classList.add('show');
    out.innerHTML='<div class="sub" style="color:var(--bad)">Please enter both numbers.</div>';
    return;
  }
  let result='', label='';
  if(mode==='of'){ result = (a/100)*b; label = `${a}% of ${b}`; }
  else if(mode==='isWhat'){
    if(b===0){ out.classList.add('show'); out.innerHTML='<div class="sub" style="color:var(--bad)">Cannot divide by zero.</div>'; return; }
    result = (a/b)*100; label = `${a} is what % of ${b}`;
  } else {
    if(a===0){ out.classList.add('show'); out.innerHTML='<div class="sub" style="color:var(--bad)">Original value cannot be zero.</div>'; return; }
    result = ((b-a)/a)*100; label = `% change ${a} → ${b}`;
  }
  out.classList.add('show');
  out.innerHTML = `<div class="label">${label}</div><div class="big">${result.toFixed(2)}${mode!=='of'?'%':''}</div>`;
}

/* ---------- Contact form ---------- */
function submitContactForm(e){
  e.preventDefault();
  const name = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const msg = document.getElementById('cMsg').value.trim();
  if(!name || !email || !msg){
    document.getElementById('cStatus').textContent='Please fill all fields.';
    return false;
  }
  const body = `Hi TechPulse,%0D%0A%0D%0A${encodeURIComponent(msg)}%0D%0A%0D%0A— ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
  window.location.href = `mailto:hello@techpulse.example?subject=${encodeURIComponent('Message from '+name)}&body=${body}`;
  document.getElementById('cStatus').textContent='Opening your email app…';
  return false;
}
