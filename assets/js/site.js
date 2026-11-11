/* Stratos Bridge Capital — script del sitio (rediseño nov-2026)
   - Idioma: atributos data-es / data-en (+ data-es-ph / data-en-ph para placeholders,
     data-es-al / data-en-al para aria-label). Cambio sin recargar la página
     (evita el loop de recarga del sitio anterior).
   - Menú desplegable "Cómo Trabajamos": funciona con click/touch y teclado.
   - Menú móvil off-canvas: el overlay queda oculto (visibility:hidden) cuando
     está cerrado, para no bloquear toques en iOS/Android.
   - Formulario de contacto vía Formspree (fetch, sin recargar). */
(function () {
  'use strict';
  var KEY = 'sbc-lang';

  function storedLang() {
    try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'es'; } catch (e) { return 'es'; }
  }

  // Recorre los elementos bilingües y aplica el idioma (nombre heredado del sitio anterior)
  function walkAndReplace(lang) {
    var els = document.querySelectorAll('[data-es][data-en]');
    for (var i = 0; i < els.length; i++) {
      var v = els[i].getAttribute('data-' + lang);
      if (els[i].innerHTML !== v) els[i].innerHTML = v;
    }
    var ph = document.querySelectorAll('[data-es-ph]');
    for (var j = 0; j < ph.length; j++) ph[j].setAttribute('placeholder', ph[j].getAttribute('data-' + lang + '-ph'));
    var al = document.querySelectorAll('[data-es-al]');
    for (var k = 0; k < al.length; k++) al[k].setAttribute('aria-label', al[k].getAttribute('data-' + lang + '-al'));
    var root = document.documentElement;
    root.lang = lang;
    var t = root.getAttribute('data-title-' + lang);
    if (t) document.title = t;
    var btns = document.querySelectorAll('[data-setlang]');
    for (var b = 0; b < btns.length; b++) {
      var on = btns[b].getAttribute('data-setlang') === lang;
      btns[b].classList.toggle('on', on);
      btns[b].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function setLang(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    walkAndReplace(lang);
  }
  window.setLang = setLang;
  window.sbcLang = function () { return document.documentElement.lang === 'en' ? 'en' : 'es'; };

  document.addEventListener('click', function (e) {
    var lb = e.target.closest('[data-setlang]');
    if (lb) { e.preventDefault(); setLang(lb.getAttribute('data-setlang')); }
  });

  // ---- Desplegable ----
  var dds = document.querySelectorAll('.dd');
  function closeAll(except) {
    for (var i = 0; i < dds.length; i++) if (dds[i] !== except) {
      dds[i].classList.remove('open');
      var b = dds[i].querySelector('.dd-btn'); if (b) b.setAttribute('aria-expanded', 'false');
    }
  }
  for (var d = 0; d < dds.length; d++) (function (dd) {
    var btn = dd.querySelector('.dd-btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !dd.classList.contains('open');
      closeAll(dd);
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  })(dds[d]);
  document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) closeAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); document.body.classList.remove('mob-open'); }
  });

  // ---- Menú móvil ----
  var burger = document.getElementById('burger');
  var mob = document.getElementById('mob');
  function mobToggle(open) {
    document.body.classList.toggle('mob-open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (mob) mob.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (burger) burger.addEventListener('click', function () { mobToggle(true); });
  var closers = document.querySelectorAll('[data-mob-close]');
  for (var c = 0; c < closers.length; c++) closers[c].addEventListener('click', function () { mobToggle(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1200) mobToggle(false); });

  // ---- Formulario (Formspree) ----
  var form = document.getElementById('contact-form');
  if (form) {
    var msg = document.getElementById('form-msg');
    var T = {
      sending: { es: 'Enviando…', en: 'Sending…' },
      ok: { es: 'Gracias. Recibimos su mensaje y nos pondremos en contacto a la brevedad.', en: 'Thank you. We have received your message and will be in touch shortly.' },
      err: { es: 'No se pudo enviar el mensaje. Por favor, escríbanos a adriandm@stratosbcap.com.', en: 'The message could not be sent. Please email us at adriandm@stratosbcap.com.' },
      cfg: { es: 'El formulario aún está en configuración. Por favor, escríbanos a adriandm@stratosbcap.com.', en: 'The form is still being configured. Please email us at adriandm@stratosbcap.com.' }
    };
    function show(kind, cls) {
      msg.className = 'form-msg ' + cls;
      msg.textContent = T[kind][window.sbcLang()];
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.action.indexOf('REEMPLAZAR') !== -1) { show('cfg', 'err'); return; }
      var btn = form.querySelector('button[type=submit]');
      var label = btn.innerHTML;
      btn.disabled = true; btn.textContent = T.sending[window.sbcLang()];
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { if (r.ok) { form.reset(); show('ok', 'ok'); } else { show('err', 'err'); } })
        .catch(function () { show('err', 'err'); })
        .then(function () { btn.disabled = false; btn.innerHTML = label; });
    });
  }

  // Aplicar idioma guardado
  if (storedLang() === 'en') walkAndReplace('en'); else walkAndReplace('es');
})();
