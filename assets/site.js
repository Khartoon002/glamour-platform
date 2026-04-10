
(function(){
  const root = document.documentElement;

  document.addEventListener('mousemove', (e)=>{
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
  }, {passive:true});

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if(toggle && nav){
    toggle.addEventListener('click', ()=> nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=> nav.classList.remove('open')));
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('[data-reveal]').forEach(el=> io.observe(el));

  const animateCount = (el)=>{
    const target = Number(el.dataset.count || 0);
    const duration = Number(el.dataset.duration || 1500);
    const start = performance.now();
    const tick = (now)=>{
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if(p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  document.querySelectorAll('[data-count]').forEach(animateCount);

  const toast = document.getElementById('toast');
  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> toast.classList.remove('show'), 2200);
  }

  const storageKey = 'glamour_user_profile';
  function readProfile(){
    try{return JSON.parse(localStorage.getItem(storageKey) || '{}')}catch(e){return {}}
  }
  function saveProfile(next){
    const merged = Object.assign({}, readProfile(), next || {});
    localStorage.setItem(storageKey, JSON.stringify(merged));
    return merged;
  }

  const registerForm = document.getElementById('registerForm');
  if(registerForm){
    registerForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm).entries());
      const agree = registerForm.querySelector('[name="agree"]');
      if(agree && !agree.checked){
        showToast('Please accept the terms first.');
        return;
      }
      saveProfile(data);
      showToast('Details saved.');
      setTimeout(()=> location.href = 'shortlink.html', 500);
    });
  }

  const signupForm = document.getElementById('signupForm');
  if(signupForm){
    const params = new URLSearchParams(location.search);
    const planField = signupForm.querySelector('[name="plan"]');
    const qPlan = params.get('plan');
    if(planField && qPlan){ planField.value = qPlan; }
    signupForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(signupForm).entries());
      saveProfile(data);
      showToast('Signup details saved.');
      setTimeout(()=> location.href = 'payments.html', 500);
    });
  }

  const helloEls = document.querySelectorAll('[data-hello-name]');
  if(helloEls.length){
    const p = readProfile();
    const name = p.name || p.firstName || 'future creator';
    helloEls.forEach(el => el.textContent = name);
  }

  const countryData = [
    {key:'NG', label:'Nigeria', amount:'₦14,050', channel:'Paystack', payUrl:'https://paystack.shop/pay/6wabet3r-m', accountNo:'Online checkout', accountName:'Glamour via Paystack', note:'Use the Pay Now button to complete checkout. After payment, submit proof on Telegram for activation.'},
    {key:'GH', label:'Ghana', amount:'200 GHS', channel:'MTN', payUrl:'https://t.me/glamourvendor?text=' + encodeURIComponent('I am from Ghana and I want to make payments for Glamour.'), accountNo:'0550827063', accountName:'GLAMOUR AGENT', note:'Contact the Telegram vendor for payment confirmation and activation.'},
    {key:'CM', label:'Cameroon', amount:'12,000 XAF', channel:'MTN', payUrl:'https://t.me/glamourvendor?text=' + encodeURIComponent('I am from Cameroon and I want to make payments for Glamour.'), accountNo:'652856398', accountName:'GLAMOUR AGENT', note:'Contact the Telegram vendor for payment confirmation and activation.'},
    {key:'KE', label:'Kenya', amount:'2,500 KES', channel:'Airtel Money', payUrl:'https://t.me/glamourvendor?text=' + encodeURIComponent('I am from Kenya and I want to make payments for Glamour.'), accountNo:'0107494918', accountName:'GLAMOUR AGENT', note:'Contact the Telegram vendor for payment confirmation and activation.'},
    {key:'ZA', label:'South Africa', amount:'350 ZAR', channel:'FNB', payUrl:'https://t.me/glamourvendor?text=' + encodeURIComponent('I am from South Africa and I want to make payments for Glamour.'), accountNo:'63096232756', accountName:'GLAMOUR AGENT', note:'Contact the Telegram vendor for payment confirmation and activation.'},
    {key:'UG', label:'Uganda', amount:'65,000 UGX', channel:'Airtel Uganda', payUrl:'https://t.me/glamourvendor?text=' + encodeURIComponent('I am from Uganda and I want to make payments for Glamour.'), accountNo:'+256753668856', accountName:'GLAMOUR AGENT', note:'Contact the Telegram vendor for payment confirmation and activation.'},
    {key:'SL', label:'Sierra Leone', amount:'350 SLE', channel:'Orange Money', payUrl:'https://t.me/glamourvendor?text=' + encodeURIComponent('I am from Sierra Leone and I want to make payments for Glamour.'), accountNo:'073190703', accountName:'GLAMOUR AGENT', note:'Contact the Telegram vendor for payment confirmation and activation.'}
  ];
  const telegramProof = 'https://t.me/glamourvendor?text=' + encodeURIComponent('I have made payments for Glamour. How do I get started?');
  const payState = {country:'NG', plan:'Registration'};
  const plans = [
    {name:'Registration', desc:'One-time onboarding access for Glamour creators.'},
    {name:'Premium', desc:'Priority support, boosted campaigns, and faster creator onboarding.'}
  ];

  const countryWrap = document.getElementById('countryChoices');
  const planWrap = document.getElementById('planChoices');

  function fillPaymentCard(){
    const c = countryData.find(x => x.key === payState.country) || countryData[0];
    const profile = readProfile();
    const map = {
      '#payAmount': c.amount,
      '#payCountry': c.label,
      '#payPlan': payState.plan,
      '#payChannel': c.channel,
      '#payAcctNo': c.accountNo,
      '#payAcctName': c.accountName,
      '#payNote': c.note,
      '#payProfile': profile.name || ((profile.firstName || '') + ' ' + (profile.lastName || '')).trim() || 'your account'
    };
    Object.entries(map).forEach(([sel, val])=>{
      const el = document.querySelector(sel);
      if(el) el.textContent = val;
    });
    const card = document.getElementById('paymentCard');
    if(card) card.dataset.payUrl = c.payUrl;
  }

  if(countryWrap){
    countryData.forEach((c, idx)=>{
      const div = document.createElement('button');
      div.type = 'button';
      div.className = 'choice' + (idx === 0 ? ' active' : '');
      div.innerHTML = `<strong>${c.label}</strong><small>${c.amount}</small>`;
      div.addEventListener('click', ()=>{
        payState.country = c.key;
        countryWrap.querySelectorAll('.choice').forEach(x => x.classList.remove('active'));
        div.classList.add('active');
        fillPaymentCard();
      });
      countryWrap.appendChild(div);
    });
  }

  if(planWrap){
    plans.forEach((p, idx)=>{
      const div = document.createElement('button');
      div.type = 'button';
      div.className = 'choice' + (idx === 0 ? ' active' : '');
      div.innerHTML = `<strong>${p.name}</strong><small>${p.desc}</small>`;
      div.addEventListener('click', ()=>{
        payState.plan = p.name;
        planWrap.querySelectorAll('.choice').forEach(x => x.classList.remove('active'));
        div.classList.add('active');
        fillPaymentCard();
      });
      planWrap.appendChild(div);
    });
  }
  fillPaymentCard();

  const payNow = document.getElementById('payNow');
  if(payNow){
    payNow.addEventListener('click', ()=>{
      const card = document.getElementById('paymentCard');
      const url = card && card.dataset ? card.dataset.payUrl : '';
      if(url) location.href = url;
    });
  }

  const submitProof = document.getElementById('submitProof');
  if(submitProof){
    submitProof.addEventListener('click', ()=> location.href = telegramProof);
  }

  document.querySelectorAll('[data-copy]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const target = document.querySelector(btn.dataset.copy);
      if(!target) return;
      try{
        await navigator.clipboard.writeText(target.textContent.trim());
        showToast('Copied.');
      }catch(e){
        showToast('Copy failed.');
      }
    });
  });
})();
