/* Duarte: one confirmed GA4 destination, opt-in measurement, no form values. */
(() => {
  'use strict';
  const ID = 'G-WX3RZ19389';
  const KEY = 'duarte-measurement-v1';
  const production = ['www.engenhariaduarte.com.br', 'engenhariaduarte.com.br'].includes(location.hostname);
  const denied = {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'};
  let consent = false, started = false;
  try { const saved = JSON.parse(localStorage.getItem(KEY)); consent = saved?.allowed === true && Date.now() - saved.at < 180 * 86400000; } catch (_) {}
  window.dataLayer = window.dataLayer || [];
  function tag() { window.dataLayer.push(arguments); }
  window['ga-disable-' + ID] = !consent;
  tag('consent', 'default', denied);
  function start() {
    if (!production || !consent || started) return;
    started = true;
    window['ga-disable-' + ID] = false;
    tag('consent', 'update', {...denied, analytics_storage:'granted'});
    tag('js', new Date());
    // Never send arbitrary query strings or fragments to Analytics.
    tag('config', ID, {send_page_view:false, page_location:location.origin + location.pathname, page_referrer:document.referrer ? (()=>{try{return new URL(document.referrer).origin;}catch(_){return '';}})() : '', allow_google_signals:false, allow_ad_personalization_signals:false});
    tag('event', 'page_view', {send_to:ID});
    const script = document.createElement('script');
    script.async = true; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.append(script);
  }
  const allowed = new Set(['generate_lead','whatsapp_click','form_error','diagnostic_completed']);
  window.duarteTrack = name => {
    if (production && consent && allowed.has(name)) tag('event', name, {send_to:ID});
  };
  function clearCookies() {
    for (const item of document.cookie.split(';')) {
      const name = item.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat)/.test(name)) continue;
      for (const domain of ['', location.hostname, '.engenhariaduarte.com.br']) document.cookie = name + '=; Max-Age=0; Path=/;' + (domain ? ' Domain=' + domain + ';' : '') + ' SameSite=Lax';
    }
  }
  function init() {
    const box = document.createElement('section');
    box.className = 'duarte-consent'; box.setAttribute('aria-label','Preferências de medição');
    box.innerHTML = '<p><strong>Sua privacidade</strong><br>Podemos usar o Google Analytics para entender a navegação e melhorar o site? O atendimento funciona com ou sem essa medição. <a href="/privacidade/">Saiba mais</a>.</p><div><button type="button" data-consent="no">Continuar sem medição</button><button type="button" data-consent="yes">Permitir medição</button></div>';
    let hasChoice = false;
    try { const saved = JSON.parse(localStorage.getItem(KEY)); hasChoice = typeof saved?.allowed === 'boolean' && Date.now() - saved.at < 180 * 86400000; } catch (_) {}
    box.hidden = hasChoice;
    const settings = document.createElement('button'); settings.type = 'button'; settings.className = 'duarte-privacy-settings'; settings.textContent = 'Preferências de privacidade';
    settings.addEventListener('click', () => { box.hidden = false; box.querySelector('button').focus(); });
    box.addEventListener('click', e => {
      const button = e.target.closest('[data-consent]'); if (!button) return;
      consent = button.dataset.consent === 'yes';
      try { localStorage.setItem(KEY, JSON.stringify({allowed:consent, at:Date.now()})); } catch (_) {}
      window['ga-disable-' + ID] = !consent;
      if (consent) { if(started) tag('consent','update',{...denied,analytics_storage:'granted'}); else start(); }
      else { if(started) tag('consent','update',denied); clearCookies(); }
      box.hidden = true; settings.focus();
    });
    document.body.append(box);
    (document.querySelector('footer') || document.body).append(settings);
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]'); if (!link) return;
      try { const u = new URL(link.href); if (['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(u.hostname)) window.duarteTrack('whatsapp_click'); } catch (_) {}
    });
    start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
