/*!
 * Ana Bella Restaurante — script.js
 */
(function () {
  'use strict';

  /* 1. MENU MOBILE */
  var menuToggle = document.getElementById('menuToggle');
  var mainNav    = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
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
      scrollTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }, { passive: true });
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 4. TABS */
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById(btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* 5. ACCORDION */
  document.querySelectorAll('.accordion-header').forEach(function (h) {
    h.addEventListener('click', function () {
      var item   = h.parentElement;
      var isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(function (i) {
        i.classList.remove('open');
      });
      if (!isOpen) item.classList.add('open');
    });
  });

  // Abre só o primeiro item do primeiro accordion (Porções)
  var primeiroAccordion = document.querySelector('.accordion');
  if (primeiroAccordion) {
    var primeiroItem = primeiroAccordion.querySelector('.accordion-item');
    if (primeiroItem) primeiroItem.classList.add('open');
  }

  /* 6. CARDÁPIO DO DIA */
  var hojeEl = document.getElementById('hoje-card');
  var diasEl = document.getElementById('dias-grid');

  if (hojeEl || diasEl) {
    var cardapioDia = {
      0: null,
      1: { nome: 'Segunda-Feira',  prato: 'Panqueca',              acompanhamentos: ['Arroz', 'Salada'],                                                                         img: 'imagens/dia_segunda.jpg' },
      2: { nome: 'Terça-Feira',    prato: 'Costelinha no Barbecue', acompanhamentos: ['Arroz', 'Salada', 'Batata Frita'],                                                         img: 'imagens/dia_terca.jpg'  },
      3: { nome: 'Quarta-Feira',   prato: 'Dia Italiano',           acompanhamentos: ['Rondelli', 'Espaguete', 'Nhoque', 'Frango', 'Tulipa', 'Risoto', 'Polenta Frita', 'Salada'], img: 'imagens/dia_quarta.jpg' },
      4: { nome: 'Quinta-Feira',   prato: 'Parmegiana ⭐',          acompanhamentos: ['Arroz ou Macarrão', 'Batata Frita', 'Salada'],                                             img: 'imagens/dia_quinta.jpg' },
      5: { nome: 'Sexta-Feira',    prato: 'Picanha na Chapa',       acompanhamentos: ['Arroz', 'Farofa', 'Legumes', 'Maionese', 'Polenta Frita'],                                 img: 'imagens/dia_sexta.jpg'  },
      6: { nome: 'Sábado',         prato: 'Pasteis',                acompanhamentos: [],                                                                                          img: 'imagens/dia_sabado.jpg' }
    };

    var hoje = new Date().getDay();

    if (hojeEl) {
      if (hoje === 0) {
        hojeEl.innerHTML =
          '<div class="fechado-card">' +
          '<p style="font-size:2.5rem;margin-bottom:.5rem">🌙</p>' +
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
            acomp +
            '<img src="' + d.img + '" alt="' + d.prato + '" class="hoje-img" onerror="this.style.display=\'none\'">' +
            '<p class="hoje-nota">Disponível das 18:00 às 22:00 · Sujeito a alteração</p>' +
          '</div></div>';
      }
    }

    if (diasEl) {
      diasEl.innerHTML = Object.keys(cardapioDia).map(function (key) {
        var n      = parseInt(key);
        var d      = cardapioDia[n];
        var isHoje = n === hoje;
        if (!d) {
          return '<div class="dia-card dia-fechado"><p class="dia-nome">Domingo</p>' +
                 '<p class="dia-prato-nome" style="color:var(--text-lt)">Fechado</p></div>';
        }
        return '<div class="dia-card' + (isHoje ? ' dia-hoje' : '') + '">' +
          '<p class="dia-nome">' + (isHoje ? '▶ ' : '') + d.nome + '</p>' +
          '<p class="dia-prato-nome">' + d.prato + '</p>' +
          (d.acompanhamentos.length ? '<p class="dia-acomp">' + d.acompanhamentos.join(' · ') + '</p>' : '') +
        '</div>';
      }).join('');
    }
  }

})();
