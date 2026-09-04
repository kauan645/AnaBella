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
  // Duracao do transition:grid-template-rows do .accordion-body (css/cardapio.html
  // inline, .45s) + folga. Rolar antes disso mira a posicao do item enquanto o
  // anterior ainda esta com a altura cheia (fechamento so comecou a encolher) -
  // quando esse item fechado era mais alto, o scroll acerta o alvo errado e a
  // pagina acaba la embaixo assim que a transicao termina de verdade.
  var ACCORDION_CLOSE_MS = 460;

  function setAccordionState(item, open) {
    var header = item.querySelector('.accordion-header');
    item.classList.toggle('open', open);
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
      var item     = h.closest('.accordion-item');
      var isOpen   = item.classList.contains('open');
      var prevOpen = document.querySelector('.accordion-item.open');
      document.querySelectorAll('.accordion-item').forEach(function (i) {
        setAccordionState(i, false);
      });
      if (!isOpen) {
        setAccordionState(item, true);
        // Mobile: item abre pra baixo e some da tela em telas curtas, então rola
        // até ele. Desktop tem espaço de sobra, não precisa.
        if (window.matchMedia('(max-width: 640px)').matches) {
          var delay = (prevOpen && prevOpen !== item) ? ACCORDION_CLOSE_MS : 0;
          setTimeout(function () {
            item.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, delay);
        }
      }
    });
  });

  // Abre só o primeiro item do primeiro accordion (Porções)
  var primeiroAccordion = document.querySelector('.accordion');
  if (primeiroAccordion) {
    var primeiroItem = primeiroAccordion.querySelector('.accordion-item');
    if (primeiroItem) setAccordionState(primeiroItem, true);
  }

  // Nav de categorias sticky: pula pro accordion-item e já abre ele.
  // Altura recalculada a cada clique (não no load) porque a nav só tem
  // altura real depois que a aba "restaurante" fica visível.
  var catNav = document.querySelector('.cat-nav');
  if (catNav) {
    var catBtns = Array.prototype.slice.call(catNav.querySelectorAll('.cat-nav-btn'));
    var activeItem = document.querySelector('.accordion-item.open[data-cat]');
    if (activeItem) {
      var initialBtn = catNav.querySelector('.cat-nav-btn[data-cat="' + activeItem.dataset.cat + '"]');
      if (initialBtn) initialBtn.classList.add('active');
    }
    catBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = document.querySelector('.accordion-item[data-cat="' + btn.dataset.cat + '"]');
        if (!item) return;
        var prevOpen = document.querySelector('.accordion-item.open');
        document.documentElement.style.setProperty('--cat-nav-h', catNav.offsetHeight + 'px');
        catBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.accordion-item').forEach(function (i) {
          setAccordionState(i, false);
        });
        setAccordionState(item, true);
        var delay = (prevOpen && prevOpen !== item) ? ACCORDION_CLOSE_MS : 0;
        setTimeout(function () {
          item.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, delay);
      });
    });
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
      4: { nome: 'Quinta-Feira',   prato: 'Parmegiana',            acompanhamentos: ['Arroz ou Macarrão', 'Batata Frita', 'Salada'],                                             img: 'imagens/dia_quinta.jpg', nota: 'Também disponível todos os dias' },
      5: { nome: 'Sexta-Feira',    prato: 'Picanha na Chapa',       acompanhamentos: ['Arroz', 'Farofa', 'Legumes', 'Maionese', 'Polenta Frita'],                                 img: 'imagens/dia_sexta.jpg'  },
      6: { nome: 'Sábado',         prato: 'Alcatra na Chapa',       acompanhamentos: [],                                                                                          img: 'imagens/foto_alcatra.jpg', nota: 'Também disponível todos os dias' }
    };

    // Dia de Curitiba (America/Sao_Paulo), não do fuso do aparelho do visitante —
    // site-enhance.js carrega antes deste script e expõe o cálculo já feito lá
    // pro banner "Aberto agora". Fallback só cobre página sem site-enhance.js.
    var hoje = window.AB_nowInCuritiba ? window.AB_nowInCuritiba().day : new Date().getDay();

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

  /* 8. LIGHTBOX DA GALERIA */
  var galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length) {
    var lightboxModal = null;
    var currentGalleryIndex = -1;
    var lightboxTrigger = null;

    function updateLightbox(index) {
      if (!lightboxModal) return;
      currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
      var img = galleryItems[currentGalleryIndex].querySelector('img');
      if (!img) return;
      var modalImg = lightboxModal.querySelector('.lightbox-content img');
      var caption = lightboxModal.querySelector('.lightbox-caption');
      modalImg.src = img.currentSrc || img.src;
      modalImg.alt = img.alt;
      caption.textContent = img.alt;
    }

    function closeLightbox() {
      if (!lightboxModal) return;
      var modal = lightboxModal;
      lightboxModal = null;
      modal.classList.remove('active');
      document.body.classList.remove('lightbox-open');
      document.body.style.removeProperty('--lightbox-scrollbar-width');
      setTimeout(function () {
        modal.remove();
        if (lightboxTrigger) lightboxTrigger.focus();
        lightboxTrigger = null;
      }, 250);
    }

    function openLightbox(item) {
      var img = item.querySelector('img');
      if (!img) return;
      currentGalleryIndex = Array.prototype.indexOf.call(galleryItems, item);
      lightboxTrigger = item;
      var modal = document.createElement('div');
      modal.className = 'lightbox-modal';
      modal.innerHTML =
        '<div class="lightbox-backdrop"></div>' +
        '<div class="lightbox-content">' +
          '<img src="' + img.currentSrc + '" alt="' + img.alt.replace(/"/g, '&quot;') + '">' +
          '<p class="lightbox-caption">' + img.alt + '</p>' +
          '<button type="button" class="lightbox-nav lightbox-prev" aria-label="Foto anterior">‹</button>' +
          '<button type="button" class="lightbox-nav lightbox-next" aria-label="Próxima foto">›</button>' +
          '<button type="button" class="lightbox-close" aria-label="Fechar foto ampliada">✕</button>' +
        '</div>';
      document.body.appendChild(modal);
      document.body.style.setProperty('--lightbox-scrollbar-width', (window.innerWidth - document.documentElement.clientWidth) + 'px');
      document.body.classList.add('lightbox-open');
      lightboxModal = modal;
      requestAnimationFrame(function () { modal.classList.add('active'); });
      modal.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
      modal.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      modal.querySelector('.lightbox-prev').addEventListener('click', function () { updateLightbox(currentGalleryIndex - 1); });
      modal.querySelector('.lightbox-next').addEventListener('click', function () { updateLightbox(currentGalleryIndex + 1); });
      var touchStartX = 0;
      modal.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
      modal.addEventListener('touchend', function (e) {
        var deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) < 50) return;
        updateLightbox(currentGalleryIndex + (deltaX < 0 ? 1 : -1));
      }, { passive: true });
      modal.querySelector('.lightbox-close').focus();
    }

    galleryItems.forEach(function (item) {
      var img = item.querySelector('img');
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      if (img) item.setAttribute('aria-label', 'Ampliar foto: ' + img.alt);
      item.addEventListener('click', function () { openLightbox(item); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(item);
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightboxModal) closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxModal) updateLightbox(currentGalleryIndex - 1);
      if (e.key === 'ArrowRight' && lightboxModal) updateLightbox(currentGalleryIndex + 1);
    });
  }

  /* 9. HERO ADAPTATIVO POR TURNO (home) */
  // Fora do horário de almoço/jantar (ou domingo fechado) o hero fica no texto
  // padrão do HTML — só troca durante o serviço, quando é decisão quente ("vou
  // agora?"). Usa o mesmo cálculo de horário de Curitiba do site-enhance.js.
  var heroHome = document.querySelector('.hero-home');
  if (heroHome && window.AB_nowInCuritiba) {
    var agoraHero = window.AB_nowInCuritiba();
    var turno = null;
    if (agoraHero.day !== 0) {
      if (agoraHero.mins >= 11 * 60 + 30 && agoraHero.mins < 14 * 60) {
        turno = {
          eyebrow: 'Aberto agora · Almoço',
          h1: 'Almoço servido agora',
          copy: 'Buffet fresquinho, variado e pronto pra você. Venha ainda hoje ou peça sua mesa.',
          ctaLabel: 'Ver o almoço',
          ctaHref: 'almoco.html'
        };
      } else if (agoraHero.mins >= 17 * 60 + 30 && agoraHero.mins < 22 * 60) {
        turno = {
          eyebrow: 'Aberto agora · Jantar',
          h1: 'Jantar à la carte aberto',
          copy: 'Da parmegiana à picanha na chapa — pratos preparados na hora pra sua noite.',
          ctaLabel: 'Ver cardápio do jantar',
          ctaHref: 'cardapio.html#restaurante'
        };
      }
    }
    if (turno) {
      var eyebrowEl = heroHome.querySelector('.eyebrow');
      var h1El      = heroHome.querySelector('h1');
      var copyEl    = heroHome.querySelector('.hero-copy');
      var ctaEl     = heroHome.querySelector('.hero-actions .btn-primary');
      if (eyebrowEl) eyebrowEl.textContent = turno.eyebrow;
      if (h1El)      h1El.textContent = turno.h1;
      if (copyEl)    copyEl.textContent = turno.copy;
      if (ctaEl) {
        ctaEl.textContent = turno.ctaLabel;
        ctaEl.setAttribute('href', turno.ctaHref);
      }
    }
  }


})();
