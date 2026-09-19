// sticky nav shadow
  const navEl = document.getElementById('siteNav');
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 8);
  });

  function toggleMobile(){
    document.getElementById('mobilePanel').classList.toggle('open');
  }
  document.querySelectorAll('.mobile-panel a').forEach(a=>{
    a.addEventListener('click', ()=> document.getElementById('mobilePanel').classList.remove('open'));
  });

  function toggleFaq(btn){
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  }

  /* ================= Onboarding wizard ================= */
  (function(){
    const stepsEl = Array.from(document.querySelectorAll('.ob-step'));
    const totalSteps = stepsEl.length;
    let current = 1;
    const answers = {};

    document.querySelectorAll('.ob-step').forEach(stepDiv=>{
      const stepNum = stepDiv.getAttribute('data-step');
      const optsWrap = stepDiv.querySelector('.ob-options');
      if(!optsWrap) return;
      const multi = optsWrap.getAttribute('data-multi') === 'true';
      optsWrap.querySelectorAll('.ob-opt').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          if(multi){
            btn.classList.toggle('ob-selected');
          } else {
            optsWrap.querySelectorAll('.ob-opt').forEach(b=>b.classList.remove('ob-selected'));
            btn.classList.add('ob-selected');
          }
          const selected = Array.from(optsWrap.querySelectorAll('.ob-selected')).map(b=>b.textContent.trim());
          answers[stepNum] = selected;
        });
      });
    });

    function renderStep(){
      stepsEl.forEach(s=>{
        s.style.display = (s.getAttribute('data-step') == current) ? 'block' : 'none';
      });
      document.getElementById('obEyebrow').textContent = current < totalSteps
        ? 'Step ' + current + ' of ' + totalSteps
        : 'Review';
      document.getElementById('obProgress').style.width = Math.round((current/totalSteps)*100) + '%';
      document.getElementById('obBack').style.display = current > 1 ? 'inline-flex' : 'none';
      const contBtn = document.getElementById('obContinue');
      contBtn.textContent = current < totalSteps ? 'Continue →' : 'Find My Options →';

      if(current === totalSteps){
        const summary = document.getElementById('obSummary');
        const labels = {1:'Stage', 2:'Looking for', 3:'Funding need', 4:'Documents ready'};
        let rows = '';
        for(let i=1;i<totalSteps;i++){
          const val = (answers[i] && answers[i].length) ? answers[i].join(', ') : '—';
          rows += '<div style="display:flex;justify-content:space-between;gap:12px;"><span style="color:var(--ink-faint);">'+labels[i]+'</span><span style="font-weight:600;text-align:right;">'+val+'</span></div>';
        }
        summary.innerHTML = rows;
      }
    }

    document.getElementById('obContinue').addEventListener('click', ()=>{
      if(current < totalSteps){
        current++;
        renderStep();
      } else {
        const btn = document.getElementById('obContinue');
        const original = btn.textContent;
        btn.textContent = 'Understanding your profile…';
        btn.disabled = true;
        setTimeout(()=>{ btn.textContent = 'Matching relevant options…'; }, 650);
        setTimeout(()=>{
          btn.textContent = original;
          btn.disabled = false;
          const results = document.getElementById('results');
          if(results){
            results.scrollIntoView({behavior:'smooth', block:'start'});
            results.style.transition = 'box-shadow .3s ease';
            results.style.boxShadow = 'inset 0 0 0 2px var(--teal-600)';
            setTimeout(()=>{ results.style.boxShadow = 'none'; }, 1200);
          }
        }, 1500);
      }
    });

    document.getElementById('obBack').addEventListener('click', ()=>{
      if(current > 1){ current--; renderStep(); }
    });

    renderStep();
  })();

  /* ================= Patent checker ================= */
  (function(){
    const btn = document.getElementById('patentRunBtn');
    if(!btn) return;
    const ring = document.getElementById('patentRingFill');
    const scoreNum = document.getElementById('patentScoreNum');
    const scoreLabel = document.getElementById('patentScoreLabel');
    const factorsList = document.getElementById('patentFactors');
    const CIRC = 163.4;

    function analyze(text){
      const words = Array.from(new Set((text.toLowerCase().match(/[a-z]{4,}/g) || [])));
      let score = 42 + Math.min(words.length * 3, 38);
      score += (text.length % 11) - 5;
      score = Math.max(28, Math.min(96, Math.round(score)));
      let tier;
      if(score >= 80) tier = 'High';
      else if(score >= 62) tier = 'Moderate–High';
      else if(score >= 42) tier = 'Moderate';
      else tier = 'Low';
      return {score, tier, words};
    }

    function render(result){
      const offset = CIRC * (1 - result.score/100);
      ring.setAttribute('stroke-dashoffset', offset.toFixed(1));
      scoreNum.textContent = result.score;
      scoreLabel.textContent = 'Preliminary novelty: ' + result.tier;

      const f1ok = result.words.length >= 4;
      const f2ok = result.score >= 55;
      const items = [
        {ok:f1ok, text: f1ok ? 'Your description has enough distinct detail to search against' : 'Add a bit more detail — very short descriptions are hard to assess'},
        {ok:f2ok, text: f2ok ? 'The combination of elements you described looks reasonably distinct' : 'Parts of this may overlap with common existing approaches'},
        {ok:false, text: 'A real prior-art and patent-office search is still needed to confirm this'}
      ];
      factorsList.innerHTML = items.map(it=>{
        const cls = it.ok ? 'ok' : 'warn';
        const icon = it.ok
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4M12 17h.01M10.3 3.9L2.7 17.3A1.8 1.8 0 004.3 20h15.4a1.8 1.8 0 001.6-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z"/></svg>';
        return '<li class="'+cls+'">'+icon+'<span>'+it.text+'</span></li>';
      }).join('');
    }

    btn.addEventListener('click', ()=>{
      const text = document.getElementById('patentIdea').value.trim();
      if(!text){ document.getElementById('patentIdea').focus(); return; }
      const original = btn.textContent;
      btn.textContent = 'Scanning public filings…';
      btn.disabled = true;
      setTimeout(()=>{
        render(analyze(text));
        btn.textContent = original;
        btn.disabled = false;
      }, 900);
    });
  })();

  /* ================= Scheme detail modal ================= */
  const schemeData = {
    'seed-fund': {
      title: 'Startup India Seed Fund Scheme',
      dept: 'DPIIT · Early-stage funding',
      amount: 'Up to ₹50 Lakh',
      overview: 'Provides financial assistance to early-stage startups for proof of concept, prototype development, product trials, market entry and commercialisation.',
      eligibility: ['DPIIT-recognised startup, incorporated within the specified period', 'Idea validated but not yet generating significant revenue', 'Not received more than a limited amount of prior funding from other government schemes'],
      documents: ['Certificate of Incorporation', 'DPIIT recognition certificate', 'PAN of the entity', 'Pitch deck / business plan'],
      apply: ['Check eligibility on the official portal', 'Register and complete your startup profile', 'Submit your application to an eligible incubator', 'Present to the incubator selection committee', 'Sign the agreement and receive disbursement in tranches']
    },
    'mudra-tarun': {
      title: 'MUDRA Loan — Tarun',
      dept: 'Ministry of Finance · Business loan',
      amount: '₹5 – ₹10 Lakh (collateral-free)',
      overview: 'Part of the Pradhan Mantri MUDRA Yojana, the Tarun category supports established small businesses looking to expand, aimed at units that have already used Shishu and Kishor category loans.',
      eligibility: ['Non-farm income-generating small business', 'Existing business with a track record of operations', 'Loan requirement within the Tarun slab (₹5–10 Lakh)'],
      documents: ['Aadhaar & PAN', 'Business proof / registration', 'Bank statements (6–12 months)', 'Project report or quotation for the funding use'],
      apply: ['Approach a participating bank / NBFC / MFI', 'Submit the MUDRA loan application with documents', 'Bank assesses the proposal and creditworthiness', 'Loan sanctioned and disbursed, usually collateral-free']
    },
    'credit-guarantee': {
      title: 'Credit Guarantee Scheme for Startups',
      dept: 'DPIIT · Loan guarantee cover',
      amount: 'Loans up to ₹20 Cr, guarantee cover 85% (up to ₹10 Cr) / 75% (above ₹10 Cr)',
      overview: 'Provides guarantee cover on loans extended by banks and NBFCs to DPIIT-recognised startups, making lenders more willing to extend credit without collateral.',
      eligibility: ['DPIIT-recognised startup', 'Loan sanctioned by a scheme-approved lending institution', 'Loan used for business purposes recognised under the scheme'],
      documents: ['DPIIT recognition certificate', 'Loan sanction letter from the lender', 'Business financials / projections'],
      apply: ['Discuss funding needs with a scheme-empanelled lender', 'Lender evaluates and sanctions the loan', 'Lender applies for guarantee cover under the scheme', 'Loan disbursed with guarantee cover in place']
    }
  };

  function openSchemeModal(key){
    const d = schemeData[key];
    if(!d) return;
    document.getElementById('modalTitle').textContent = d.title;
    document.getElementById('modalBody').innerHTML =
      '<div style="font-size:12px;color:var(--ink-faint);margin-bottom:4px;">'+d.dept+'</div>' +
      '<div class="modal-amount">'+d.amount+'</div>' +
      '<h4>Overview</h4><p>'+d.overview+'</p>' +
      '<h4>Eligibility</h4><ul>'+d.eligibility.map(x=>'<li>'+x+'</li>').join('')+'</ul>' +
      '<h4>Documents typically needed</h4><ul>'+d.documents.map(x=>'<li>'+x+'</li>').join('')+'</ul>' +
      '<h4>How to apply</h4><ul>'+d.apply.map(x=>'<li>'+x+'</li>').join('')+'</ul>' +
      '<p style="margin-top:14px;font-size:11.5px;color:var(--ink-faint);">Preliminary information only. Confirm current terms on the official scheme portal before applying.</p>';
    document.getElementById('schemeModalBackdrop').classList.add('open');
  }
  function closeSchemeModal(){
    document.getElementById('schemeModalBackdrop').classList.remove('open');
  }

  /* ================= Ask Assist (scripted demo) ================= */
  function openAssist(){ document.getElementById('assistPanel').classList.add('open'); document.getElementById('assistInput').focus(); }
  function closeAssist(){ document.getElementById('assistPanel').classList.remove('open'); }

  function assistReply(q){
    const t = q.toLowerCase();
    if(t.includes('patent') || t.includes('ip')) return 'You can run a quick preliminary novelty check in the "Patent Check" section above. It\'s a demo scan, not a legal or official patent-office search — for a real filing, a patent professional should confirm novelty first.';
    if(t.includes('document')) return 'Required documents depend on the option — most founders start with Aadhaar, PAN, incorporation proof and a bank account. Open "View Details" on any option above for its specific document list.';
    if(t.includes('eligib') || t.includes('qualify')) return 'Eligibility depends on your stage, sector, funding need and documents. Try "Find My Options" above — it walks through a few quick questions and shows matches with the reasons behind each one.';
    if(t.includes('apply') || t.includes('how')) return 'Each option\'s "View Details" includes a step-by-step "How to Apply" section. Always complete the actual application on the scheme\'s official portal — Founder Setu only guides you there.';
    if(t.includes('mentor')) return 'You can see available mentors and their focus areas in the "Mentors & Events" section — reach out from there to request 1:1 guidance.';
    if(t.includes('track') || t.includes('status')) return 'The "Your Roadmap" section shows a live-style tracker for an application\'s progress — from documents through to disbursement.';
    return 'I can help with eligibility, documents, patents, mentors or how to apply — try asking about one of those. For anything scheme-specific and final, please check the official source.';
  }

  function sendAssist(){
    const input = document.getElementById('assistInput');
    const text = input.value.trim();
    if(!text) return;
    const body = document.getElementById('assistBody');
    const userMsg = document.createElement('div');
    userMsg.className = 'assist-msg user';
    userMsg.textContent = text;
    body.appendChild(userMsg);
    input.value = '';
    body.scrollTop = body.scrollHeight;
    setTimeout(()=>{
      const botMsg = document.createElement('div');
      botMsg.className = 'assist-msg bot';
      botMsg.textContent = assistReply(text);
      body.appendChild(botMsg);
      body.scrollTop = body.scrollHeight;
    }, 500);
  }
