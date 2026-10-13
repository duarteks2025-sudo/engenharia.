(function () {
  'use strict';
  const FORM_SOURCE = 'duarte-attribution-v1';
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const clean = value => String(value || '').replace(/[\u0000-\u001f]/g, '').slice(0, 160);
  const pagePath = location.pathname.slice(0, 200);
  const params = new URLSearchParams(location.search);
  let referrer = '';
  try { referrer = new URL(document.referrer).hostname; } catch (_) {}
  const current = { landingPage: location.origin + pagePath, referrer, capturedAt: Date.now() };
  for (const key of campaignKeys) current[key] = clean(params.get(key));
  let first = current;
  try {
    const previous = JSON.parse(sessionStorage.getItem(FORM_SOURCE) || 'null');
    if (previous && Date.now() - previous.capturedAt < 4 * 3600000) first = previous;
    else sessionStorage.setItem(FORM_SOURCE, JSON.stringify(current));
  } catch (_) {} // Contact stays usable when browser storage is blocked.
  function inferredSource(value) {
    const source = String(value.utm_source || value.referrer || '').toLowerCase();
    if (/(^|\.)(google\.[a-z.]+)$/.test(source) || source === 'google') return 'Google';
    if (source === 'bing' || /(^|\.)bing\.com$/.test(source)) return 'Bing';
    if (source === 'instagram' || /(^|\.)instagram\.com$/.test(source)) return 'Instagram';
    if (source === 'facebook' || /(^|\.)facebook\.com$/.test(source)) return 'Facebook';
    if (source === 'youtube' || /(^|\.)youtube\.com$/.test(source)) return 'YouTube';
    return 'Desconhecida';
  }
  function collect(form) {
    const values = Object.fromEntries(new FormData(form));
    const service = form.dataset.service || values.service;
    const fields = [['personType','Responsável'],['area','Área (m²)'],['constructionType','Tipo de construção'],['start','Início'],['end','Conclusão'],['cno','CNO'],['sero','SERO'],['accounting','Escrituração'],['labor','Mão de obra'],['payments','Recolhimentos']];
    const diagnosis = fields.filter(([key]) => values[key]).map(([key,label]) => label + ': ' + values[key]).join('\n');
    return { requestId: crypto.randomUUID(), name: values.name.trim(), phone: values.phone.trim(), email: (values.email || '').trim(), service, city: values.city.trim(), source: values.source || '', situation: [values.situation, diagnosis].filter(Boolean).join('\n').slice(0, 1500), website: values.website || '', attribution: { landingPage: first.landingPage, referrer: first.referrer, firstSource: inferredSource(first), lastSource: inferredSource(current), utmSource: first.utm_source || '', utmMedium: first.utm_medium || '', utmCampaign: first.utm_campaign || '', utmContent: first.utm_content || '', utmTerm: first.utm_term || '' } };
  }
  function diagnostic(form) {
    const values = Object.fromEntries(new FormData(form));
    const pending = [];
    for (const [field,label] of [['personType','responsável'],['area','área'],['constructionType','tipo da construção'],['start','data inicial'],['end','data final']]) if (!values[field]) pending.push('Confirmar ' + label + '.');
    for (const [field,label] of [['cno','CNO'],['sero','aferição SERO'],['labor','documentos de mão de obra'],['payments','recolhimentos']]) if (!values[field] || /Não sei/.test(values[field])) pending.push('Conferir ' + label + '.');
    if (values.personType === 'Pessoa jurídica') pending.push('Solicitar ao contador a escrituração regular da obra e os documentos de remuneração e recolhimentos. Não aplicar automaticamente o fator de ajuste de pessoa física.');
    if (values.start && values.end && values.start > values.end) pending.push('Corrigir as datas: a conclusão não pode ser anterior ao início.');
    const output = document.getElementById('diagnostic');
    output.hidden = false;
    output.replaceChildren();
    const heading = document.createElement('strong'); heading.textContent = 'Triagem preliminar'; output.append(heading);
    const list = document.createElement('ul');
    for (const message of pending.length ? pending : ['Informações básicas preenchidas. A análise documental permanece necessária.']) { const item = document.createElement('li'); item.textContent = message; list.append(item); }
    output.append(list);
    const note = document.createElement('p'); note.textContent = 'Não há cálculo de contribuição nem confirmação de redução ou decadência nesta triagem.'; output.append(note);
  }
  for (const form of document.querySelectorAll('[data-lead-form]')) {
    const phone = form.elements.phone;
    phone.addEventListener('input', () => phone.setCustomValidity(''));
    const diagnose = form.querySelector('[data-diagnose]');
    if (diagnose) diagnose.addEventListener('click', () => diagnostic(form));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const digits = phone.value.replace(/\D/g, '');
      phone.setCustomValidity(/^(?:55)?[1-9]\d{9,10}$/.test(digits) ? '' : 'Informe um telefone válido com DDD.');
      if (form.elements.end) form.elements.end.setCustomValidity(form.elements.start.value && form.elements.end.value && form.elements.start.value > form.elements.end.value ? 'A conclusão deve ser posterior ao início.' : '');
      if (!form.reportValidity()) return;
      const status = form.querySelector('[data-status]');
      const button = form.querySelector('button[type="submit"]');
      const fallback = form.querySelector('[data-fallback]');
      const payload = collect(form);
      fallback.hidden = true;
      fallback.href = 'https://wa.me/5547991233830?text=' + encodeURIComponent(['Olá, gostaria de solicitar uma análise técnica.', 'Nome: '+payload.name, 'WhatsApp: '+payload.phone, 'E-mail: '+payload.email, 'Serviço: '+payload.service, 'Cidade/UF: '+payload.city, 'Origem informada: '+payload.source, 'Página de entrada: '+payload.attribution.landingPage, payload.situation].join('\n'));
      button.disabled = true; status.textContent = 'Enviando sua solicitação…';
      try {
        const response = await fetch('/api/leads', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:AbortSignal.timeout(15000)});
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('not-saved');
        status.textContent = 'Solicitação recebida. A Duarte Engenharia retornará pelo contato informado.';
        form.reset();
      } catch (_) {
        status.textContent = 'Não foi possível confirmar o recebimento. Seus dados continuam preenchidos. Tente novamente ou envie pelo WhatsApp.';
        fallback.hidden = false;
      } finally { button.disabled = false; }
    });
    if (form.elements.end) for (const input of [form.elements.start,form.elements.end]) input.addEventListener('input', () => form.elements.end.setCustomValidity(''));
  }
})();
