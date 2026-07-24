/*!
 * Ana Bella Restaurante — script.js
 */
(function () {
  'use strict';

  /* 1. MENU MOBILE */
  var menuToggle = document.getElementById('menuToggle');
  var mainNav    = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    function setMenu(open) {
      mainNav.classList.toggle('open', open);
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      if (open) {
        var firstLink = mainNav.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        menuToggle.focus();
      }
    }
    menuToggle.addEventListener('click', function () {
      setMenu(!mainNav.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (mainNav.classList.contains('open') && !menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) setMenu(false);
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* 2. HEADER SCROLL */
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* 3. SCROLL TO TOP */
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 4. TABS */
  var tabBtns = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));

  function activateTab(btn) {
    tabBtns.forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.tabIndex = -1;
    });
    document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.tabIndex = 0;
    var panel = document.getElementById(btn.dataset.tab);
    if (panel) panel.classList.add('active');
  }

  tabBtns.forEach(function (btn, idx) {
    btn.addEventListener('click', function () { activateTab(btn); });
    btn.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabBtns[(idx + dir + tabBtns.length) % tabBtns.length];
      next.focus();
      activateTab(next);
    });
  });

  // Link direto tipo cardapio.html#restaurante abre naquela aba de cara.
  if (location.hash) {
    var targetTab = tabBtns.filter(function (b) { return b.dataset.tab === location.hash.slice(1); })[0];
    if (targetTab) activateTab(targetTab);
  }

  /* 5. ACCORDION */
  function setAccordionHeight(item, open) {
    var body = item.querySelector('.accordion-body');
    if (!body) return;
    body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
  }

  function setAccordionState(item, open) {
    var header = item.querySelector('.accordion-header');
    item.classList.toggle('open', open);
    setAccordionHeight(item, open);
    if (header) header.setAttribute('aria-expanded', String(open));
  }

  // IDs unicos + aria-controls/aria-labelledby gerados em runtime (evita repetir
  // id a mao em cada um dos 6 blocos de accordion do cardapio a la carte).
  document.querySelectorAll('.accordion-item').forEach(function (item, idx) {
    var header = item.querySelector('.accordion-header');
    var body = item.querySelector('.accordion-body');
    if (!header || !body) return;
    var headerId = 'acc-header-' + idx;
    var bodyId = 'acc-body-' + idx;
    header.id = headerId;
    header.setAttribute('aria-controls', bodyId);
    header.setAttribute('aria-expanded', 'false');
    body.id = bodyId;
    body.setAttribute('role', 'region');
    body.setAttribute('aria-labelledby', headerId);
  });

  document.querySelectorAll('.accordion-header').forEach(function (h) {
    h.addEventListener('click', function () {
      var item   = h.parentElement;
      var isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(function (i) {
        setAccordionState(i, false);
      });
      if (!isOpen) setAccordionState(item, true);
    });
  });

  // Abre só o primeiro item do primeiro accordion (Porções)
  var primeiroAccordion = document.querySelector('.accordion');
  if (primeiroAccordion) {
    var primeiroItem = primeiroAccordion.querySelector('.accordion-item');
    if (primeiroItem) setAccordionState(primeiroItem, true);
  }

  // Recalcula altura de itens abertos apos resize (fonte/zoom/orientacao) —
  // scrollHeight so e medido na abertura, senao o painel corta conteudo novo.
  var accordionResizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(accordionResizeTimer);
    accordionResizeTimer = setTimeout(function () {
      document.querySelectorAll('.accordion-item.open').forEach(function (item) {
        setAccordionHeight(item, true);
      });
    }, 150);
  });

  /* 6. CARDÁPIO DO DIA */
  var hojeEl = document.getElementById('hoje-card');
  var diasEl = document.getElementById('dias-grid');

  if (hojeEl || diasEl) {
    var cardapioDia = {
      0: null,
      1: { nome: 'Segunda-Feira',  prato: 'Panqueca',              acompanhamentos: ['Arroz', 'Salada'],                                                                         img: 'imagens/dia_segunda.jpg' },
      2: { nome: 'Terça-Feira',    prato: 'Costelinha no Barbecue', acompanhamentos: ['Arroz', 'Salada', 'Batata Frita'],                                                         img: 'imagens/dia_terca.jpg'  },
      3: { nome: 'Quarta-Feira',   prato: 'Dia Italiano',           acompanhamentos: ['Rondelli', 'Espaguete', 'Nhoque', 'Frango', 'Tulipa', 'Risoto', 'Polenta Frita', 'Salada'], img: 'imagens/dia_quarta.jpg' },
      4: { nome: 'Quinta-Feira',   prato: 'Parmegiana',            acompanhamentos: ['Arroz ou Macarrão', 'Batata Frita', 'Salada'],                                             img: 'imagens/dia_quinta.jpg', nota: 'Também disponível todos os dias' },
      5: { nome: 'Sexta-Feira',    prato: 'Picanha na Chapa',       acompanhamentos: ['Arroz', 'Farofa', 'Legumes', 'Maionese', 'Polenta Frita'],                                 img: 'imagens/dia_sexta.jpg'  },
      6: { nome: 'Sábado',         prato: 'Alcatra na Chapa',       acompanhamentos: [],                                                                                          img: 'imagens/foto_alcatra.jpg', nota: 'Também disponível todos os dias' }
    };

    var hoje = new Date().getDay();

    if (hojeEl) {
      if (hoje === 0) {
        hojeEl.innerHTML =
          '<div class="fechado-card">' +
          '<p style="margin-bottom:.5rem"><svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#c9a87c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8 8 0 1 1 11.2 3 6.3 6.3 0 0 0 21 12.8Z"/></svg></p>' +
          '<h3>Estamos fechados aos domingos</h3>' +
          '<p>Voltamos na segunda-feira. Te esperamos com muito sabor!</p>' +
          '</div>';
      } else {
        var d = cardapioDia[hoje];
        var acomp = d.acompanhamentos.length
          ? '<ul class="hoje-acompanhamentos">' +
              d.acompanhamentos.map(function (a) { return '<li>' + a + '</li>'; }).join('') +
            '</ul>'
          : '';
        hojeEl.innerHTML =
          '<div class="hoje-card"><div class="hoje-card-inner">' +
            '<span class="hoje-badge">HOJE</span>' +
            '<p class="eyebrow" style="color:var(--brown-lt);margin-bottom:.5rem">' + d.nome + '</p>' +
            '<p class="hoje-prato">' + d.prato + '</p>' +
            (d.nota ? '<p class="hoje-nota-extra">' + d.nota + '</p>' : '') +
            acomp +
            '<img src="' + d.img + '" alt="' + d.prato + '" class="hoje-img" onerror="this.outerHTML=\'<div class=hoje-img--placeholder>🍽️ Foto em breve</div>\'">' +
            '<p class="hoje-nota">Disponível das 18:00 às 21:45 · Sujeito a alteração</p>' +
          '</div></div>';
      }
    }

    if (diasEl) {
      diasEl.innerHTML = Object.keys(cardapioDia).map(function (key) {
        var n      = parseInt(key);
        var d      = cardapioDia[n];
        var isHoje = n === hoje;
        if (!d) {
          return '<div class="dia-card dia-fechado"><div class="dia-card-body">' +
                 '<p class="dia-nome">Domingo</p>' +
                 '<p class="dia-prato-nome" style="color:var(--text-lt)">Fechado</p>' +
                 '</div></div>';
        }
        return '<div class="dia-card' + (isHoje ? ' dia-hoje' : '') + '">' +
          '<img src="' + d.img + '" alt="' + d.prato + '" class="dia-card-img" onerror="this.outerHTML=\'<div class=dia-card-img--placeholder>🍽️ Foto em breve</div>\'">' +
          '<div class="dia-card-body">' +
          '<p class="dia-nome">' + (isHoje ? '▶ ' : '') + d.nome + '</p>' +
          '<p class="dia-prato-nome">' + d.prato + '</p>' +
          (d.acompanhamentos.length ? '<p class="dia-acomp">' + d.acompanhamentos.join(' · ') + '</p>' : '') +
          (d.nota ? '<p class="dia-acomp" style="font-style:italic;opacity:.75">' + d.nota + '</p>' : '') +
          '</div>' +
        '</div>';
      }).join('');
    }
  }


  /* 7. REVEAL ON SCROLL */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }
  }

})();
