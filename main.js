/* ==========================================================================
   ORSATI — comportamento da landing page
   1. Revelação cinematográfica no scroll   4. Parallax do hero
   2. Cabeçalho e barra de progresso        5. Galeria (faixa de fotos)
   3. Trilha de seções                      6. Formulário de contato
   ========================================================================== */

(function () {
    'use strict';

    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function () {
        document.body.classList.add('is-loaded');
        iniciarRevelacao();
        iniciarCabecalho();
        iniciarTrilha();
        iniciarParallax();
        iniciarGaleria();
        iniciarImagensClicaveisMobile();
        iniciarFactbarReveal();
        iniciarFormulario();
        iniciarMenuMobile();
    });

 /* 0. MENU MOBILE (hambúrguer que substitui a nav no celular) --------- */
    function iniciarMenuMobile() {
        const trigger = document.getElementById('menuMobileTrigger');
        const painel = document.getElementById('menuMobilePanel');
        if (!trigger || !painel) return;

        function fechar() {
            painel.classList.remove('is-open');
            trigger.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        }

        trigger.addEventListener('click', function () {
            const abrindo = !painel.classList.contains('is-open');
            painel.classList.toggle('is-open', abrindo);
            trigger.classList.toggle('is-open', abrindo);
            trigger.setAttribute('aria-expanded', abrindo ? 'true' : 'false');
        });

        painel.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', fechar);
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 992) fechar();
        });
    }

    /* FAIXA DE CREDENCIAIS — efeito "placar" que abre ao entrar na tela ------ */
    function iniciarFactbarReveal() {
        const barra = document.getElementById('factbarReveal');
        if (!barra) return;

        if (reduzirMovimento || !('IntersectionObserver' in window)) {
            barra.classList.add('is-open');
            return;
        }

        let disparado = false;
        const obs = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting && !disparado) {
                    disparado = true;
                    // 1) a fresta central acende
                    barra.classList.add('is-arming');
                    // 2) logo depois, as viseiras abrem e os dados acendem
                    setTimeout(function () { barra.classList.add('is-open'); }, 260);
                    obs.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.45 });

        obs.observe(barra);
    }

    /* 1. REVELAÇÃO ------------------------------------------------------- */
    function iniciarRevelacao() {
        // Escalona o atraso dos filhos de cada grupo marcado com data-stagger
        document.querySelectorAll('[data-stagger]').forEach(function (grupo) {
            Array.prototype.forEach.call(grupo.children, function (filho, i) {
                filho.style.setProperty('--i', i);
            });
        });

        const alvos = document.querySelectorAll('.reveal');
        if (reduzirMovimento || !('IntersectionObserver' in window)) {
            alvos.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }

        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('is-in');
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        alvos.forEach(function (el) { observador.observe(el); });
    }

    /* 2. CABEÇALHO E PROGRESSO ------------------------------------------ */
    function iniciarCabecalho() {
        const cabecalho = document.getElementById('cabecalho');
        const barra = document.getElementById('barraProgresso');
        const cta = document.getElementById('ctaFlutuante');
        let agendado = false;

        function atualizar() {
            const y = window.pageYOffset;
            const total = document.documentElement.scrollHeight - window.innerHeight;

            if (cabecalho) cabecalho.classList.toggle('is-compact', y > 40);
            if (barra) barra.style.transform = 'scaleX(' + (total > 0 ? y / total : 0) + ')';
            if (cta) cta.classList.toggle('is-in', y > window.innerHeight * 0.8);

            agendado = false;
        }

        window.addEventListener('scroll', function () {
            if (!agendado) { agendado = true; window.requestAnimationFrame(atualizar); }
        }, { passive: true });

        atualizar();
    }

    /* 3. TRILHA DE SEÇÕES ------------------------------------------------ */
    function iniciarTrilha() {
        const trilha = document.getElementById('trilha');
        if (!trilha) return;

        const itens = Array.prototype.slice.call(trilha.querySelectorAll('.spine__item'));
        const secoes = itens
            .map(function (item) { return document.querySelector(item.getAttribute('href')); })
            .filter(Boolean);

        if (!secoes.length) return;

        // Detecção por linha de referência: robusta para seções de qualquer altura
        // (um threshold de interseção falha em seções mais altas que a viewport,
        // deixando a trilha "presa" na seção anterior — o bug relatado).
        let agendado = false;
        function atualizar() {
            const linha = window.innerHeight * 0.4;
            let indiceAtivo = 0;
            for (let i = 0; i < secoes.length; i++) {
                if (secoes[i].getBoundingClientRect().top <= linha) indiceAtivo = i;
            }
            itens.forEach(function (item, i) { item.classList.toggle('is-active', i === indiceAtivo); });
            trilha.classList.toggle('on-dark-rail', /band--dark|band--deep/.test(secoes[indiceAtivo].className));
            // só emerge a partir da segunda seção (Áreas de Atuação) — fica ausente no hero
            trilha.classList.toggle('is-visible', secoes[0].getBoundingClientRect().top < window.innerHeight * 0.85);
            agendado = false;
        }

        window.addEventListener('scroll', function () {
            if (!agendado) { agendado = true; window.requestAnimationFrame(atualizar); }
        }, { passive: true });
        window.addEventListener('resize', atualizar);

        atualizar();
    }

    /* 4. PARALLAX DO HERO ------------------------------------------------ */
    function iniciarParallax() {
        if (reduzirMovimento) return;
        const camadas = document.querySelectorAll('.parallax');
        if (!camadas.length) return;

        let agendado = false;
        function mover() {
            const y = window.pageYOffset;
            if (y < window.innerHeight * 1.4) {
                camadas.forEach(function (camada) {
                    camada.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0) scale(1.06)';
                });
            }
            agendado = false;
        }

        window.addEventListener('scroll', function () {
            if (!agendado) { agendado = true; window.requestAnimationFrame(mover); }
        }, { passive: true });
    }

    /* 5. GALERIA (FAIXA DE FOTOS) — parallax + arrasto + lightbox --------- */
    const MOBILE_MQ = '(max-width: 768px)';
    function ehMobile() { return window.matchMedia(MOBILE_MQ).matches; }

    /* -- Lightbox compartilhado (galeria + imagens soltas no mobile) -- */
    const lightboxEl = document.getElementById('lightboxGaleria');
    const lightboxImg = document.getElementById('lightboxImagem');
    const lightboxClose = document.getElementById('lightboxFechar');
    const lightboxPrev = document.getElementById('lightboxAnterior');
    const lightboxNext = document.getElementById('lightboxProxima');
    let lbLista = [];
    let lbIndice = 0;

    function lbAtualizar() {
        const img = lbLista[lbIndice];
        if (!img) return;
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt || '';
        const varios = lbLista.length > 1;
        if (lightboxPrev) lightboxPrev.style.display = varios ? '' : 'none';
        if (lightboxNext) lightboxNext.style.display = varios ? '' : 'none';
    }
    function abrirLightbox(lista, indice) {
        if (!lightboxEl || !lista || !lista.length) return;
        lbLista = lista;
        lbIndice = indice;
        lbAtualizar();
        lightboxEl.classList.add('is-open');
        lightboxEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus();
    }
    function fecharLightbox() {
        if (!lightboxEl) return;
        lightboxEl.classList.remove('is-open');
        lightboxEl.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    function lbIr(delta) {
        if (!lbLista.length) return;
        lbIndice = (lbIndice + delta + lbLista.length) % lbLista.length;
        lbAtualizar();
    }
    if (lightboxEl) {
        if (lightboxClose) lightboxClose.addEventListener('click', fecharLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', function () { lbIr(-1); });
        if (lightboxNext) lightboxNext.addEventListener('click', function () { lbIr(1); });
        lightboxEl.addEventListener('click', function (e) { if (e.target === lightboxEl) fecharLightbox(); });
        document.addEventListener('keydown', function (e) {
            if (!lightboxEl.classList.contains('is-open')) return;
            if (e.key === 'Escape') fecharLightbox();
            if (e.key === 'ArrowLeft') lbIr(-1);
            if (e.key === 'ArrowRight') lbIr(1);
        });
    }

    /* -- Qualquer imagem de conteúdo, clicável só no mobile -- */
    /* -- Imagens clicáveis (Agora liberado para Desktop e Mobile) -- */
    function iniciarImagensClicaveis() {
        document.addEventListener('click', function (e) {
            const img = e.target.closest('img');
            if (!img) return;
            if (img.closest('a')) return; 
            if (img.closest('.filmstrip__item')) return; 
            if (img.closest('.site-header, .nav-mobile__panel, .site-footer, .lightbox, .hero')) return;
            abrirLightbox([img], 0);
        });
    }

    function iniciarGaleria() {
        const linhas = document.querySelectorAll('.filmstrip__row');
        if (!linhas.length) return;

        const estados = new Map();
        linhas.forEach(function (linha) { estados.set(linha, { drag: 0 }); });

        function aplicarTransform(linha) {
            const secao = linha.closest('section');
            const rect = secao.getBoundingClientRect();
            const meio = window.innerHeight / 2;
            const distancia = meio - (rect.top + rect.height / 2);
            const dir = Number(linha.dataset.parallaxDir) || 1;
            const base = Number(linha.dataset.base) || 0;
            const arrasto = estados.get(linha).drag;
            const deslocamento = reduzirMovimento
                ? base + arrasto
                : base + distancia * 0.12 * dir + arrasto;
            linha.style.transform = 'translate3d(' + deslocamento.toFixed(1) + 'px,0,0)';
        }

        let agendado = false;
        function moverTodas() {
            linhas.forEach(aplicarTransform);
            agendado = false;
        }
        window.addEventListener('scroll', function () {
            if (!agendado) { agendado = true; window.requestAnimationFrame(moverTodas); }
        }, { passive: true });
        window.addEventListener('resize', moverTodas);
        moverTodas();

        const todasImagens = Array.prototype.slice.call(document.querySelectorAll('.filmstrip__item img'));

        linhas.forEach(function (linha) {
            const estado = estados.get(linha);
            let apertado = false;
            let xInicial = 0;
            let arrastoInicial = 0;
            let deslocouBastante = false;

            linha.addEventListener('pointerdown', function (e) {
                if (ehMobile()) return; 
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                apertado = true;
                deslocouBastante = false;
                xInicial = e.clientX;
                arrastoInicial = estado.drag;
                linha.setPointerCapture(e.pointerId);
                linha.classList.add('is-grabbing');
            });

            linha.addEventListener('pointermove', function (e) {
                if (!apertado) return;
                const delta = e.clientX - xInicial;
                if (Math.abs(delta) > 6) deslocouBastante = true;
                const larguraExtra = Math.max(0, linha.scrollWidth - window.innerWidth);
                const proposto = arrastoInicial + delta;
                estado.drag = Math.min(60, Math.max(-larguraExtra - 60, proposto));
                aplicarTransform(linha);
            });

            function soltar(e) {
                if (!apertado) return;
                apertado = false;
                linha.classList.remove('is-grabbing');
            }
            linha.addEventListener('pointerup', soltar);
            linha.addEventListener('pointercancel', soltar);
            linha.addEventListener('pointerleave', function (e) {
                if (apertado && e.buttons === 0) soltar(e);
            });

            linha.addEventListener('click', function (e) {
                if (deslocouBastante) { e.preventDefault(); return; }
                const item = e.target.closest('.filmstrip__item');
                if (!item) return;
                const img = item.querySelector('img');
                if (!img) return;
                const indice = todasImagens.indexOf(img);
                if (indice > -1) abrirLightbox(todasImagens, indice);
            });
        });
    }
    
    /* 6. FORMULÁRIO DE CONTATO ------------------------------------------ */
    function iniciarFormulario() {
        const form = document.getElementById('formContatoPericial');
        if (!form) return;

        const botao = document.getElementById('btnSubmitContato');
        const ok = document.getElementById('alertaSucessoContato');
        const erro = document.getElementById('alertaErroContato');
        const endpoint = 'https://formspree.io/f/xykqpvgb';

        function restaurar() {
            botao.disabled = false;
            botao.textContent = 'Enviar Mensagem';
            botao.style.opacity = '1';
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            botao.disabled = true;
            botao.textContent = 'Enviando...';
            botao.style.opacity = '0.7';
            ok.style.display = 'none';
            erro.style.display = 'none';

            fetch(endpoint, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            })
                .then(function (resposta) {
                    if (resposta.ok) {
                        botao.style.display = 'none';
                        ok.style.display = 'block';
                        form.reset();
                    } else {
                        erro.style.display = 'block';
                        restaurar();
                    }
                })
                .catch(function () {
                    erro.style.display = 'block';
                    restaurar();
                });
        });
    }
})();

/* 5. ACESSO RESTRITO — PLANILHA DE GESTÃO DE EPIs ----------------------- */
const TOKEN_PREMIUM_AUTORIZADO = "ORSATI2026";
const ENDERECO_PLANILHA_EXCEL = "./Planilha de Gestão de EPIs.xlsm";

function solicitarAutenticacaoLocal() {
    const wrapper = document.getElementById('wrapper-conteudo-premium');
    const painel = document.getElementById('painel-autenticacao-local');
    const input = document.getElementById('input-token-local');
    const msgErro = document.getElementById('erro-token-local');

    if (wrapper) {
        wrapper.style.filter = 'blur(12px)';
        wrapper.style.opacity = '0.3';
        wrapper.style.pointerEvents = 'none';
    }
    if (painel) painel.style.display = 'block';
    if (input) { input.value = ''; input.focus(); }
    if (msgErro) msgErro.style.display = 'none';
}

function fecharAutenticacaoLocal() {
    const wrapper = document.getElementById('wrapper-conteudo-premium');
    const painel = document.getElementById('painel-autenticacao-local');

    if (painel) painel.style.display = 'none';
    if (wrapper) {
        wrapper.style.filter = 'none';
        wrapper.style.opacity = '1';
        wrapper.style.pointerEvents = 'auto';
    }
}

function processarValidacaoLocal() {
    const digitado = document.getElementById('input-token-local').value.trim();
    const msgErro = document.getElementById('erro-token-local');

    if (digitado !== TOKEN_PREMIUM_AUTORIZADO) {
        if (msgErro) msgErro.style.display = 'block';
        return;
    }

    if (msgErro) msgErro.style.display = 'none';
    fecharAutenticacaoLocal();

    const link = document.createElement('a');
    link.href = ENDERECO_PLANILHA_EXCEL;
    link.download = 'Planilha_Gestao_EPI_Orsati.xlsm';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function alternarVisibilidadeSenha() {
    const input = document.getElementById('input-token-local');
    const olho = document.getElementById('svg-olho');
    if (!input || !olho) return;

    if (input.type === 'password') {
        input.type = 'text';
        input.style.letterSpacing = 'normal';
        input.style.fontFamily = 'inherit';
        olho.innerHTML = '<path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-4.12 1.419-2.497-2.497a3.5 3.5 0 0 0 4.474 4.474l-.823-.823a2.5 2.5 0 0 1-2.829-2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709z"/><path d="m13.646 14.354-12-12 .708-.708 12 12-.708.708z"/>';
    } else {
        input.type = 'password';
        input.style.letterSpacing = '4px';
        input.style.fontFamily = 'monospace';
        olho.innerHTML = '<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5S0 8s3-5.5 8-5.5zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>';
    }
}
