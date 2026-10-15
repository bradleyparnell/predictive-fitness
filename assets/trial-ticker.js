/* Trial ticker: small corner card showing recent real trial starts (RunDot + TriDot).
   Data: data/trial-ticker.json (refreshed from HubSpot; US first names only, others anonymous). */
(function () {
  if (window.__trialTicker) return; window.__trialTicker = 1;
  var host = location.hostname.replace(/^www\./, '');
  var brand = /tridot\.com$/.test(host) ? 'tridot' : /rundot\.com$/.test(host) ? 'rundot' : (/[?&]tt=tridot/.test(location.search) ? 'tridot' : 'rundot');
  if (/^\/(start|get-started)(\/|$)/.test(location.pathname)) return;
  var S = window.sessionStorage || { getItem: function () {}, setItem: function () {} };
  if (S.getItem('tt_off')) return;
  var FEED = 'https://bradleyparnell.github.io/predictive-fitness/data/trial-ticker.json';
  var COLOR = brand === 'tridot' ? '#EA0029' : '#53b956';
  var NAME = brand === 'tridot' ? 'TriDot' : 'RunDot';
  var FIRST = 4000, GAP = 14000, SHOW = 6000, MAX_PAGE = 8, MAX_SESSION = 16;

  function ago(ts) {
    var m = Math.max(1, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
    if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
    var h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    return 'Yesterday';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = '#tt-card{position:fixed;left:20px;bottom:20px;z-index:2147483000;max-width:320px;display:flex;align-items:center;gap:12px;' +
    'background:#fff;color:#111;border-radius:12px;padding:12px 36px 12px 14px;box-shadow:0 8px 28px rgba(0,0,0,.18),0 1px 3px rgba(0,0,0,.08);' +
    'font-family:inherit;font-size:14px;line-height:1.35;opacity:0;transform:translateY(12px);transition:opacity .45s ease,transform .45s ease;pointer-events:none}' +
    '#tt-card.tt-on{opacity:1;transform:none;pointer-events:auto}' +
    '#tt-card .tt-dot{flex:0 0 auto;width:10px;height:10px;border-radius:50%;background:' + COLOR + ';box-shadow:0 0 0 0 ' + COLOR + '66;animation:ttp 2s ease-out infinite}' +
    '@keyframes ttp{0%{box-shadow:0 0 0 0 ' + COLOR + '66}70%{box-shadow:0 0 0 9px ' + COLOR + '00}100%{box-shadow:0 0 0 0 ' + COLOR + '00}}' +
    '#tt-card .tt-w{font-weight:700}#tt-card .tt-t{display:block;margin-top:2px;font-size:12px;color:#666}' +
    '#tt-card .tt-x{position:absolute;top:6px;right:8px;width:24px;height:24px;border:0;background:none;color:#888;font-size:18px;line-height:24px;cursor:pointer;padding:0}' +
    '#tt-card .tt-x:hover{color:#111}' +
    '@media (max-width:768px){#tt-card{left:12px;right:auto;max-width:calc(100vw - 80px);font-size:13px}}' +
    '@media (prefers-reduced-motion:reduce){#tt-card{transition:opacity .2s;transform:none}#tt-card .tt-dot{animation:none}}';

  function bottomOffset() {
    if (window.innerWidth > 768) return 20;
    var off = 12, vh = window.innerHeight;
    var els = document.body.querySelectorAll('*');
    for (var i = 0; i < els.length && i < 4000; i++) {
      var el = els[i]; if (el.id === 'tt-card') continue;
      var cs = getComputedStyle(el);
      if ((cs.position === 'fixed' || cs.position === 'sticky') && cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05) {
        var r = el.getBoundingClientRect();
        if (r.height > 0 && r.height < vh * 0.4 && r.bottom >= vh - 4 && r.top > vh * 0.5 && r.width > window.innerWidth * 0.5) off = Math.max(off, vh - r.top + 10);
      }
    }
    return off;
  }

  function start(items) {
    var now = Date.now();
    items = (items || []).filter(function (x) { var t = new Date(x.ts).getTime(); return x && x.w && t && now - t < 48 * 3600e3 && now - t > -6e5; });
    if (!items.length) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var card = document.createElement('div'); card.id = 'tt-card'; card.setAttribute('role', 'status'); card.setAttribute('aria-live', 'polite');
    document.body.appendChild(card);
    var shown = 0, idx = parseInt(S.getItem('tt_i') || '0', 10) % items.length, timer;
    function hide() { card.classList.remove('tt-on'); }
    function next() {
      var count = parseInt(S.getItem('tt_n') || '0', 10);
      if (shown >= MAX_PAGE || count >= MAX_SESSION || S.getItem('tt_off')) return;
      if (document.hidden) { timer = setTimeout(next, 4000); return; }
      var it = items[idx % items.length]; idx++;
      var action = it.k === 'j' ? 'joined ' + NAME : 'started a free trial';
      card.innerHTML = '<span class="tt-dot" aria-hidden="true"></span><span><span class="tt-w">' + esc(it.w) + '</span> ' + action +
        '<span class="tt-t">' + ago(it.ts) + '</span></span><button class="tt-x" type="button" aria-label="Dismiss">&times;</button>';
      card.querySelector('.tt-x').onclick = function () { S.setItem('tt_off', '1'); hide(); clearTimeout(timer); };
      card.style.bottom = bottomOffset() + 'px';
      card.classList.add('tt-on'); shown++;
      S.setItem('tt_n', String(count + 1)); S.setItem('tt_i', String(idx));
      try { (window.dataLayer = window.dataLayer || []).push({ event: 'trial_ticker_view', brand: brand }); } catch (e) {}
      setTimeout(hide, SHOW);
      timer = setTimeout(next, GAP);
    }
    timer = setTimeout(next, FIRST);
  }

  function load() {
    fetch(FEED + '?h=' + Math.floor(Date.now() / 6e5), { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) start(d[brand]); })
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
