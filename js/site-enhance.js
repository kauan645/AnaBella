/*!
 * Ana Bella — site-enhance.js
 * Barra de ação fixa (mobile) + indicador "Aberto agora".
 * Camada compartilhada: incluir em todas as páginas de conteúdo.
 * Para pular a barra fixa numa página: <body data-no-actionbar>.
 */
(function () {
  'use strict';

  /* ───────── Config ───────── */
  var TEL_DIGITS = '4130182200';
  var TEL_LABEL  = '(41) 3018-2200';
  var MAPS_URL   = 'https://www.google.com/maps/search/?api=1&query=Rua+Professor+Dario+Veloso+686+Curitiba+Parana';
  var CARDAPIO   = 'cardapio.html#restaurante';

  // Janelas Seg–Sáb (minutos desde 00:00). Domingo (0) fechado.
  var ALMOCO = [11 * 60 + 30, 14 * 60];        // 11:30–14:00
  var JANTAR = [18 * 60,      21 * 60 + 45];    // 18:00–21:45
  var DIAS   = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  /* ───────── SVG icons ───────── */
  var ICON = {
    phone: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z"/></svg>',
    pin:   '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>',
    list:  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5h16v2.6H4zm0 5.7h16v2.6H4zm0 5.7h10v2.6H4z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.9 10.4-.9.5V7h1.8v5.6l-.9-.2zM12 13l4 2.3-.9 1.5L11 14V7h1z"/></svg>'
  };

  /* ───────── Aberto agora ───────── */
  function nextOpenDay(day) {        // próximo dia que abre (pula domingo)
    var d = day;
    do { d = (d + 1) % 7; } while (d === 0);
    return d;
  }
  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // Curitiba fica sempre em America/Sao_Paulo (-03:00, sem horario de verao
  // desde 2019) — calcula pelo fuso do restaurante, nao pelo do navegador do
  // visitante, senao alguem fora do Brasil ve "aberto/fechado" errado.
  var WEEKDAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function nowInCuritiba() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var hour = parseInt(map.hour, 10) % 24;
    return { day: WEEKDAY_MAP[map.weekday], mins: hour * 60 + parseInt(map.minute, 10) };
  }

  function openNow() {
    var agora = nowInCuritiba();
    var day = agora.day;
    var mins = agora.mins;

    if (day === 0) {
      return { state: 'closed', text: 'Fechado · abre segunda 11:30' };
    }
    // aberto?
    if (mins >= ALMOCO[0] && mins < ALMOCO[1]) {
      return { state: 'open', text: 'Aberto agora · fecha ' + fmt(ALMOCO[1]) };
    }
    if (mins >= JANTAR[0] && mins < JANTAR[1]) {
      return { state: 'open', text: 'Aberto agora · fecha ' + fmt(JANTAR[1]) };
    }
    // fechado, abre hoje?
    if (mins < ALMOCO[0]) {
      return { state: 'soon', text: 'Fechado · abre ' + fmt(ALMOCO[0]) };
    }
    if (mins < JANTAR[0]) {
      return { state: 'soon', text: 'Fechado · abre ' + fmt(JANTAR[0]) };
    }
    // depois do jantar → próximo dia
    var nd = nextOpenDay(day);
    var nomeDia = (nd === (day + 1) % 7) ? 'amanhã' : DIAS[nd].toLowerCase();
    return { state: 'closed', text: 'Fechado · abre ' + nomeDia + ' 11:30' };
  }

  function fillOpenBadges() {
    var info = openNow();
    document.querySelectorAll('[data-open-now]').forEach(function (el) {
      el.classList.remove('is-open', 'is-soon', 'is-closed');
      el.classList.add('is-' + info.state);
      el.innerHTML = ICON.clock + '<span>' + info.text + '</span>';
    });
  }

  /* ───────── Barra de ação fixa ───────── */
  function buildActionBar() {
    if (document.body.hasAttribute('data-no-actionbar')) return;
    if (document.querySelector('.action-bar')) return;

    var bar = document.createElement('nav');
    bar.className = 'action-bar';
    bar.setAttribute('aria-label', 'Ações rápidas');
    bar.innerHTML =
      '<a href="tel:' + TEL_DIGITS + '" aria-label="Ligar ' + TEL_LABEL + '">' + ICON.phone + '<span>Ligar</span></a>' +
      '<a class="mid" href="' + MAPS_URL + '" target="_blank" rel="noopener" aria-label="Como chegar (Google Maps)">' + ICON.pin + '<span>Como chegar</span></a>' +
      '<a href="' + CARDAPIO + '" aria-label="Ver cardápio">' + ICON.list + '<span>Cardápio</span></a>';
    document.body.appendChild(bar);
    document.body.classList.add('has-action-bar');
  }

  /* ───────── Ícones SVG (substituem emojis) ───────── */
  // Lucide-style, stroke currentColor. 'star'/'trophy'/'sparkle' usam fill.
  var S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var F = 'viewBox="0 0 24 24" fill="currentColor"';
  var ICONS = {
    calendar: '<svg class="ico" '+S+'><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    clock:    '<svg class="ico" '+S+'><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin:      '<svg class="ico" '+S+'><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    phone:    '<svg class="ico" '+S+'><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/></svg>',
    utensils: '<svg class="ico" '+S+'><path d="M3 2v7a3 3 0 0 0 6 0V2M6 2v20M21 15V2a5 5 0 0 0-3 5v6a2 2 0 0 0 2 2h1Z"/></svg>',
    chef:     '<svg class="ico" '+S+'><path d="M6 13.9V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6.1M6 13.9A4 4 0 0 1 5 6.2a5 5 0 0 1 9.5-1.8A4.5 4.5 0 0 1 18 5a4 4 0 0 1 0 8.9M6 13.9h12M6 17h12"/></svg>',
    trophy:   '<svg class="ico" '+S+'><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/></svg>',
    star:     '<svg class="ico" '+F+'><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.7L12 16.9 5.8 20.8l1.6-6.7L2.2 9.5l6.9-.6z"/></svg>',
    sparkle:  '<svg class="ico" '+F+'><path d="M12 2l1.8 5.7L19.5 9l-5.7 1.8L12 16l-1.8-5.2L4.5 9l5.7-1.3z"/></svg>',
    rice:     '<svg class="ico" '+S+'><path d="M3 11h18a9 9 0 0 1-18 0ZM7 11c0-3 2-5 5-5s5 2 5 5"/></svg>',
    beef:     '<svg class="ico" '+S+'><path d="M5 13a7 7 0 1 1 11.5 5.4A4 4 0 0 1 9 17a5 5 0 0 0-4-4Z"/><circle cx="13" cy="10" r="2.2"/></svg>',
    salad:    '<svg class="ico" '+S+'><path d="M4 12h16a8 8 0 0 1-16 0ZM12 12c-1-4 1-7 4-8M12 12c-2-2-5-2-7-1"/></svg>',
    soup:     '<svg class="ico" '+S+'><path d="M4 11h16a8 8 0 0 1-16 0ZM8 7c0-1 .8-1.5.8-2.5M12 7c0-1 .8-1.5.8-2.5M16 7c0-1 .8-1.5.8-2.5"/></svg>',
    cup:      '<svg class="ico" '+S+'><path d="M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8ZM6 8l-.7-3h13.4L18 8"/></svg>',
    droplet:  '<svg class="ico" '+S+'><path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10Z"/></svg>',
    beer:     '<svg class="ico" '+S+'><path d="M6 4h9v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4ZM15 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/></svg>',
    wine:     '<svg class="ico" '+S+'><path d="M8 22h8M12 16v6M6 3h12s-.5 9-6 9-6-9-6-9Z"/></svg>',
    bottle:   '<svg class="ico" '+S+'><path d="M10 2h4v3l1 3v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8l1-3z"/></svg>',
    baby:     '<svg class="ico" '+S+'><circle cx="12" cy="9" r="6"/><path d="M9 9h.01M15 9h.01M9.5 13a3.5 3 0 0 0 5 0M5 20c2-3 4-4 7-4s5 1 7 4"/></svg>',
    plus:     '<svg class="ico" '+S+'><path d="M12 5v14M5 12h14"/></svg>',
    moon:     '<svg class="ico" '+S+'><path d="M21 12.8A8 8 0 1 1 11.2 3 6.3 6.3 0 0 0 21 12.8Z"/></svg>'
  };
  function injectIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      var name = el.getAttribute('data-icon');
      if (ICONS[name] && !el.querySelector('svg')) el.innerHTML = ICONS[name];
    });
  }
  // exposto p/ conteúdo gerado por JS (ex.: cardápio do dia)
  window.AB_icon = function (name) { return ICONS[name] || ''; };

  /* ───────── Init ───────── */
  function init() {
    buildActionBar();
    fillOpenBadges();
    injectIcons();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
