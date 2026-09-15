(() => {
    'use strict';

    document.documentElement.classList.add('js');
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SVG_NS = 'http://www.w3.org/2000/svg';

    /* ───────── Nav ───────── */
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('solid', window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ───────── Nashik time ───────── */
    const istParts = () => {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
        }).formatToParts(new Date());
        const get = (type) => Number(parts.find((p) => p.type === type).value);
        return { h: get('hour') % 24, m: get('minute') };
    };

    const STATUS = [
        { to: 6,  state: 'off', text: 'Nashik is asleep. The matki is sprouting.' },
        { to: 8,  state: 'on',  text: 'Chulhas are being lit across Nashik.' },
        { to: 11, state: 'hot', text: 'Prime misal hours in Nashik. Go. Now.' },
        { to: 14, state: 'on',  text: 'Last plates. Some kadhais are running empty.' },
        { to: 24, state: 'off', text: 'Misal is done for the day. Plan tomorrow\'s plate.' },
    ];

    const updateClock = () => {
        const { h, m } = istParts();
        const status = STATUS.find((s) => h < s.to);
        const statusEl = $('#status');
        statusEl.dataset.state = status.state;
        $('#status-text').textContent = status.text;

        const hh12 = ((h + 11) % 12) + 1;
        $('#ist-clock').textContent = `${hh12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;

        $$('#timeline li').forEach((li) => {
            li.classList.toggle('now', h >= Number(li.dataset.from) && h < Number(li.dataset.to));
        });
    };
    updateClock();
    setInterval(updateClock, 30_000);

    /* ───────── Domain typing ───────── */
    const typed = $('#typed');
    const typeDomain = () => {
        const word = 'misal';
        const tld = '.co.in';
        if (reducedMotion) {
            typed.innerHTML = `${word}<span class="tld">${tld}</span>`;
            return;
        }
        let i = 0;
        typed.textContent = '';
        const tick = () => {
            i += 1;
            if (i <= word.length) {
                typed.textContent = word.slice(0, i);
                setTimeout(tick, 140 + Math.random() * 90);
            } else if (i <= word.length + tld.length) {
                typed.innerHTML = `${word}<span class="tld">${tld.slice(0, i - word.length)}</span>`;
                setTimeout(tick, 70);
            }
        };
        setTimeout(tick, 300);
    };

    /* ───────── Bowl ───────── */
    // Seeded RNG so the bowl looks the same every time.
    const rng = (seed) => () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const el = (tag, attrs, parent) => {
        const node = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        if (parent) parent.appendChild(node);
        return node;
    };
    const CX = 230, CY = 220, R = 170;
    const inBowl = (rand, radius = R, cx = CX, cy = CY) => {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * radius;
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    const layerG = (name) => $(`#bowl-svg .layer[data-layer="${name}"]`);

    const drawBowl = () => {
        // Usal: a thick base scattered with sprouted matki
        let rand = rng(11);
        const usal = layerG('usal');
        el('circle', { cx: CX, cy: CY, r: R, fill: '#7b4a1c' }, usal);
        el('circle', { cx: CX - 20, cy: CY - 30, r: R * 0.8, fill: '#8d5a24', opacity: 0.6 }, usal);
        for (let i = 0; i < 260; i++) {
            const [x, y] = inBowl(rand);
            const rot = rand() * 180;
            const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})` }, usal);
            el('ellipse', { rx: 6.5, ry: 4.6, fill: rand() > 0.5 ? '#8b8a3c' : '#6f6f2c' }, g);
            el('ellipse', { rx: 2, ry: 1.2, cx: -2, cy: -1.5, fill: 'rgba(255,255,255,.25)' }, g);
            if (rand() > 0.6) el('path', { d: 'M5 0 q6 -2 10 3', stroke: '#f1ead0', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, g);
        }

        // Kat: an irregular pool of red oil
        rand = rng(7);
        const kat = layerG('kat');
        const pts = [];
        const n = 28;
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const r = 118 + rand() * 46;
            pts.push([CX + 8 + Math.cos(a) * r, CY + 6 + Math.sin(a) * r]);
        }
        const d = pts.map((p, i) => {
            const next = pts[(i + 1) % n];
            const mx = (p[0] + next[0]) / 2, my = (p[1] + next[1]) / 2;
            return `${i === 0 ? `M${mx.toFixed(1)} ${my.toFixed(1)}` : ''} Q${next[0].toFixed(1)} ${next[1].toFixed(1)} ${((next[0] + pts[(i + 2) % n][0]) / 2).toFixed(1)} ${((next[1] + pts[(i + 2) % n][1]) / 2).toFixed(1)}`;
        }).join(' ') + 'Z';
        el('path', { d, fill: 'url(#g-tarri)', opacity: 0.92 }, kat);
        for (let i = 0; i < 26; i++) {
            const [x, y] = inBowl(rand, 120, CX + 8, CY + 6);
            el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (2 + rand() * 7).toFixed(1), fill: 'none', stroke: 'rgba(255,190,120,.45)', 'stroke-width': 1.5 }, kat);
        }

        // Farsan: sev sticks, boondi, peanuts, piled on one side
        rand = rng(23);
        const farsan = layerG('farsan');
        for (let i = 0; i < 150; i++) {
            const [x, y] = inBowl(rand, 105, CX + 70, CY - 60);
            const r = Math.hypot(x - CX, y - CY);
            if (r > R - 8) continue;
            const kind = rand();
            if (kind < 0.62) {
                const len = 10 + rand() * 18;
                el('rect', {
                    x: (x - len / 2).toFixed(1), y: (y - 2).toFixed(1), width: len.toFixed(1), height: 4.2, rx: 2,
                    fill: rand() > 0.4 ? '#e9b233' : '#d98c1d',
                    transform: `rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`,
                }, farsan);
            } else if (kind < 0.85) {
                el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (3 + rand() * 2).toFixed(1), fill: '#e07a1a' }, farsan);
            } else {
                el('ellipse', { cx: x.toFixed(1), cy: y.toFixed(1), rx: 6, ry: 4.4, fill: '#9c5a2e', transform: `rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})` }, farsan);
            }
        }

        // Kanda: small chopped onion pieces
        rand = rng(5);
        const kanda = layerG('kanda');
        for (let i = 0; i < 46; i++) {
            const [x, y] = inBowl(rand, 90, CX - 55, CY + 45);
            el('rect', {
                x: (x - 5).toFixed(1), y: (y - 4).toFixed(1), width: 10, height: 8, rx: 2.5,
                fill: '#f3e3ee', stroke: '#b5669a', 'stroke-width': 1.4,
                transform: `rotate(${(rand() * 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`,
            }, kanda);
        }

        // Kothimbir: little three-lobed leaves
        rand = rng(3);
        const kothimbir = layerG('kothimbir');
        for (let i = 0; i < 26; i++) {
            const [x, y] = inBowl(rand, 115, CX - 10, CY + 10);
            const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(rand() * 360).toFixed(0)})` }, kothimbir);
            [[0, -5], [-5, 2], [5, 2]].forEach(([dx, dy]) => el('circle', { cx: dx, cy: dy, r: 5, fill: rand() > 0.5 ? '#3f8a3a' : '#2f6e2c' }, g));
            el('circle', { cx: 0, cy: 0, r: 2, fill: '#2a5e27' }, g);
        }

        // Limbu: a lemon wedge sitting on the rim
        const limbu = layerG('limbu');
        const lg = el('g', { transform: 'translate(92 380) rotate(-28)' }, limbu);
        el('path', { d: 'M-46 0 A46 46 0 0 1 46 0 Z', fill: '#f6d743', stroke: '#c9a415', 'stroke-width': 4 }, lg);
        el('path', { d: 'M-38 -2 A38 38 0 0 1 38 -2 Z', fill: '#fbe98a' }, lg);
        [-60, -30, 0, 30, 60].forEach((deg) => {
            const a = ((deg - 90) * Math.PI) / 180;
            el('line', { x1: 0, y1: -2, x2: (Math.cos(a) * 34).toFixed(1), y2: (Math.sin(a) * 34 - 2).toFixed(1), stroke: '#f6d743', 'stroke-width': 2.5 }, lg);
        });

        // Pav: two buns beside the bowl
        const pav = layerG('pav');
        [[468, 150, -8], [482, 262, 6]].forEach(([x, y, rot]) => {
            const g = el('g', { transform: `translate(${x} ${y}) rotate(${rot})` }, pav);
            el('rect', { x: -58, y: -46, width: 116, height: 92, rx: 30, fill: '#c9772e' }, g);
            el('rect', { x: -52, y: -42, width: 104, height: 78, rx: 26, fill: '#e39a45' }, g);
            el('ellipse', { cx: -14, cy: -18, rx: 26, ry: 12, fill: 'rgba(255,230,170,.45)' }, g);
            el('line', { x1: -52, y1: 2, x2: 52, y2: 2, stroke: 'rgba(120,60,20,.35)', 'stroke-width': 2 }, g);
        });
    };
    drawBowl();

    const ORDER = ['usal', 'kat', 'farsan', 'kanda', 'kothimbir', 'limbu', 'pav'];
    const buttons = $$('#layers button');
    const caption = $('#bowl-caption');
    const bowlState = new Set();
    let serveTimer = null;

    const captionFor = (justAdded) => {
        const has = (k) => bowlState.has(k);
        if (bowlState.size === 0) return 'An empty bowl. Tragic. Start adding.';
        if (bowlState.size === ORDER.length) return 'एक नंबर. That is a Nashik misal. Pav in hand, go.';
        if (justAdded === 'kat' && !has('usal')) return 'Kat with no usal? That\'s just a cry for help.';
        if (justAdded === 'farsan' && !has('kat')) return 'Farsan before kat? It\'ll stay crunchy, at least.';
        if (justAdded === 'pav' && bowlState.size === 1) return 'Just pav. Bold breakfast strategy.';
        if (justAdded === 'limbu' && !has('usal')) return 'Squeezing lemon into an empty bowl. Very zen.';
        if (has('usal') && !has('kat')) return 'Usal without kat is just… usal. Keep going.';
        const left = ORDER.length - bowlState.size;
        return `Looking good. ${left} more to go.`;
    };

    const setLayer = (name, on, announce = true) => {
        on ? bowlState.add(name) : bowlState.delete(name);
        layerG(name).classList.toggle('on', on);
        const btn = buttons.find((b) => b.dataset.layer === name);
        btn.setAttribute('aria-pressed', String(on));
        if (announce) caption.textContent = on ? captionFor(name) : captionFor(null);
    };

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            clearTimeout(serveTimer);
            setLayer(btn.dataset.layer, !bowlState.has(btn.dataset.layer));
        });
    });

    $('#serve').addEventListener('click', () => {
        clearTimeout(serveTimer);
        const missing = ORDER.filter((k) => !bowlState.has(k));
        const step = () => {
            const next = missing.shift();
            if (!next) return;
            setLayer(next, true);
            serveTimer = setTimeout(step, reducedMotion ? 0 : 380);
        };
        step();
    });

    $('#reset').addEventListener('click', () => {
        clearTimeout(serveTimer);
        ORDER.forEach((k) => setLayer(k, false, false));
        caption.textContent = captionFor(null);
    });

    /* ───────── Kat meter ───────── */
    const LEVELS = [
        { mr: 'कमी तिखट', en: 'Kami tikhat. Go easy, please.', note: 'No judgement. (Some judgement.) We\'ll keep the kat on the side for you.' },
        { mr: 'मध्यम',    en: 'Madhyam. Pleasantly warm.',       note: 'A gentle glow. The kind of spice that lets you still hold a conversation.' },
        { mr: 'तिखट',     en: 'Tikhat. A respectable Nashik starting point.', note: 'You\'ll sweat a little. You\'ll order a second pav. This is healthy.' },
        { mr: 'झणझणीत',   en: 'Jhanjhanit. Now we\'re talking.', note: 'Nose running, eyes watering, reaching for more kat anyway. Welcome home.' },
        { mr: 'डोळ्यांत पाणी', en: 'Tears. Actual tears.', note: 'Nashik level. Your ancestors are proud. Your stomach has filed a complaint.' },
    ];
    const katSection = $('#kat');
    const heat = $('#heat');
    const chillies = $$('.chillies svg');

    const setHeat = (level) => {
        const L = LEVELS[level];
        katSection.dataset.level = level;
        katSection.style.setProperty('--heat', (level / 4).toFixed(2));
        chillies.forEach((c, i) => c.classList.toggle('lit', i <= level));
        $('#verdict-mr').textContent = L.mr;
        $('#verdict-en').textContent = L.en;
        $('#verdict-note').textContent = L.note;
        heat.setAttribute('aria-valuetext', L.en.split('.')[0]);
    };
    heat.addEventListener('input', () => setHeat(Number(heat.value)));
    setHeat(Number(heat.value));

    /* ───────── Places filter ───────── */
    const places = $$('#places-list .place[data-type]');
    const chips = $$('.place-filters .chip');
    chips.forEach((chip) => {
        const type = chip.dataset.filter;
        const n = type === 'all' ? places.length : places.filter((pl) => pl.dataset.type === type).length;
        $('.count', chip).textContent = n;
        chip.addEventListener('click', () => {
            chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
            places.forEach((pl) => { pl.hidden = type !== 'all' && pl.dataset.type !== type; });
        });
    });

    /* ───────── Free offers → form ───────── */
    const form = $('#rec-form');
    const more = $('#more');
    $$('[data-interest]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const box = $(`input[name="interest"][value="${btn.dataset.interest}"]`, form);
            if (box) box.checked = true;
            btn.classList.add('picked');
            more.open = true;
            $('#recommend').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
            setTimeout(() => $('#f-email').focus({ preventScroll: true }), reducedMotion ? 0 : 700);
        });
    });

    /* ───────── Recommendation form ───────── */
    const submit = $('#submit');
    const errorEl = $('#form-error');
    const thanks = $('#thanks');
    const showError = (msg, field) => {
        errorEl.textContent = msg;
        errorEl.hidden = false;
        if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.hidden = true;
        $$('[aria-invalid]', form).forEach((f) => f.removeAttribute('aria-invalid'));

        const place = $('#f-place');
        const area = $('#f-area');
        const why = $('#f-why');
        const maps = $('#f-maps');
        const email = $('#f-email');
        if (!place.value.trim()) return showError('Which place? We need a name to go find it.', place);
        if (!area.value.trim()) return showError('Roughly where is it? An area or landmark is enough.', area);
        if (!why.value.trim()) return showError('Sell it to us. What makes it good?', why);
        if (!maps.validity.valid) return showError('That Maps link doesn\'t look right. Paste the full link, or leave it blank.', maps);
        if (!email.validity.valid) {
            more.open = true;
            return showError('That email doesn\'t look right.', email);
        }

        const data = new FormData(form);
        const interests = data.getAll('interest');
        data.delete('interest');
        if (interests.length) data.set('interests', interests.join(', '));

        submit.disabled = true;
        submit.textContent = 'Sending…';
        try {
            const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error(String(res.status));
            form.reset();
            more.open = false;
            form.hidden = true;
            thanks.hidden = false;
            thanks.focus();
        } catch {
            showError('The kadhai tipped over. Try again, or write to hello@misal.co.in.');
        } finally {
            submit.disabled = false;
            submit.textContent = 'Send recommendation';
        }
    });

    $('#another').addEventListener('click', () => {
        thanks.hidden = true;
        form.hidden = false;
        $('#f-place').focus();
    });

    /* ───────── Reveal on scroll ───────── */
    $$('.section-head, .place-filters, .places, .bowl-grid, .meter, .cards, .timeline, .offers, .ticket, .domain-copy')
        .forEach((node) => node.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.15 });
    $$('.reveal').forEach((node) => io.observe(node));

    const once = (target, fn) => {
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { fn(); obs.disconnect(); }
        }, { threshold: 0.4 });
        obs.observe(target);
    };
    once($('#domain'), typeDomain);
    once($('.cards'), () => $('.cards').classList.add('seen'));
    once($('#bowl-svg'), () => { if (bowlState.size === 0) $('#serve').click(); });

    $('#year').textContent = new Date().getFullYear();
})();
