/* Trial ticker: small corner card showing recent real trial starts (RunDot + TriDot).
   Data: data/trial-ticker.json (refreshed from HubSpot; US first names only, others anonymous). */
(function () {
  if (window.__trialTicker2) return; window.__trialTicker2 = 1;
  var host = location.hostname.replace(/^www\./, '');
  var brand = /tridot\.com$/.test(host) ? 'tridot' : /rundot\.com$/.test(host) ? 'rundot' : (/[?&]tt=tridot/.test(location.search) ? 'tridot' : 'rundot');
  if (/^\/(start|get-started)(\/|$)/.test(location.pathname)) return;
  var S = window.sessionStorage || { getItem: function () {}, setItem: function () {} };
  if (S.getItem('tt_off')) return;
  var FEED = 'https://bradleyparnell.github.io/predictive-fitness/data/trial-ticker.json';
  var COLOR = brand === 'tridot' ? '#EA0029' : '#53b956';
  var NAME = brand === 'tridot' ? 'TriDot' : 'RunDot';
  var ICON = brand === 'tridot'
    ? '<svg viewBox="0 0 116 116" width="40" height="40" aria-hidden="true"><path fill="#EA0029" d="M108.917 31.6122C105.303 41.4532 94.9557 47.4627 84.3555 45.2848C82.8102 44.9686 81.3462 44.4806 79.9545 43.8661L75.2373 48.3122C76.6561 51.3576 77.1622 54.8639 76.4302 58.4063C74.6319 67.1991 66.047 72.8561 57.2542 71.0578C55.6637 70.7324 54.1815 70.1722 52.817 69.4402L48.5878 73.4254C50.0518 75.8834 50.6483 78.8656 50.0338 81.8839C48.7144 88.3181 42.4338 92.4569 35.9996 91.1375C29.5745 89.8182 25.4176 83.5285 26.746 77.1034C28.0653 70.6692 34.3457 66.5303 40.7799 67.8497C41.7107 68.0395 42.5784 68.3467 43.4007 68.7263L47.0154 64.1537C44.693 60.6745 43.708 56.3007 44.6117 51.8727C46.41 43.0799 55.004 37.4319 63.7878 39.2212C64.6101 39.3929 65.3962 39.6368 66.1643 39.917L70.0683 34.9739C67.4838 30.5458 66.4445 25.2051 67.556 19.7921C68.9567 12.9602 73.448 7.58334 79.2677 4.74579C76.1952 3.52582 72.9782 2.54081 69.6255 1.85401C38.6835 -4.48078 8.4374 15.4453 2.1026 46.3964C-4.25026 77.3384 15.7121 107.575 46.645 113.919C77.6051 120.272 107.824 100.328 114.177 69.386C116.915 56.0296 114.746 42.8178 108.917 31.6031V31.6122Z"/></svg>'
    : '<svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path fill="#53b956" d="M22.5646 6.49157C21.7935 8.54549 19.6422 9.79997 17.4369 9.34702C17.1189 9.29484 16.7988 9.1863 16.5078 9.05271L15.5247 9.98574C15.8177 10.6265 15.9237 11.3467 15.7637 12.0939C15.3916 13.9349 13.5854 15.1352 11.7521 14.7344C11.4341 14.6822 11.114 14.5737 10.8501 14.415L9.97293 15.2416C10.266 15.7488 10.3969 16.3896 10.266 17.0033C9.99995 18.3642 8.67177 19.218 7.3436 18.9508C5.9884 18.6836 5.13828 17.3498 5.40434 16.016C5.67039 14.6551 6.99856 13.8014 8.32674 14.0685C8.5138 14.1207 8.69879 14.175 8.88586 14.2564L9.62997 13.2962C9.15191 12.5761 8.9399 11.641 9.12489 10.7351C9.49695 8.89407 11.3032 7.721 13.1364 8.09463C13.2965 8.12177 13.4815 8.17395 13.6415 8.22822L14.4646 7.18665C13.9325 6.25361 13.7205 5.13272 13.9325 4.01183C14.2256 2.57158 15.1547 1.45069 16.3769 0.864155C15.7387 0.596978 15.0757 0.411207 14.3565 0.250483C7.89856 -1.08749 1.5757 3.10176 0.247523 9.58498C-1.08065 16.0682 3.09094 22.4178 9.54683 23.7516C16.0297 25.0854 22.3256 20.8962 23.6538 14.4129C24.2129 11.6118 23.7598 8.83772 22.5646 6.48948V6.49157Z"/></svg>';
  var FIRST = 300, GAP = 14000, SHOW = 6000, MAX_PAGE = 8, MAX_SESSION = 16;

  function ago(ts) {
    var m = Math.max(1, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
    if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
    var h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    return 'Yesterday';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = '#tt-card{position:fixed;left:20px;bottom:20px;z-index:2147483000;width:316px;max-width:calc(100vw - 80px);box-sizing:border-box;display:flex;align-items:center;gap:12px;' +
    'background:#fff;color:#111;border:1px solid rgba(0,0,0,.06);border-radius:14px;padding:12px 34px 12px 12px;' +
    'box-shadow:0 12px 32px rgba(0,0,0,.16),0 2px 6px rgba(0,0,0,.06);font-family:inherit;-webkit-font-smoothing:antialiased;' +
    'opacity:0;transform:translateY(14px) scale(.98);transition:opacity .4s ease,transform .4s cubic-bezier(.2,.8,.2,1);pointer-events:none}' +
    '#tt-card.tt-on{opacity:1;transform:none;pointer-events:auto}' +
    '#tt-card .tt-ic{flex:0 0 44px;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:' + COLOR + '14}' +
    '#tt-card .tt-ic svg{width:30px;height:30px;display:block}' +
    '#tt-card span{margin:0;padding:0;text-transform:none;font-style:normal}#tt-card .tt-tx{min-width:0;display:flex;flex-direction:column;gap:1px}' +
    '#tt-card .tt-w{font-size:14px;line-height:1.3;font-weight:700;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#tt-card .tt-a{font-size:13px;line-height:1.3;color:#3a3a3a}' +
    '#tt-card .tt-t{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:11.5px;line-height:1.2;color:#8a8a8a;letter-spacing:.01em}' +
    '#tt-card .tt-dot{width:7px;height:7px;border-radius:50%;background:' + COLOR + ';animation:ttp 2s ease-out infinite}' +
    '@keyframes ttp{0%{box-shadow:0 0 0 0 ' + COLOR + '66}70%{box-shadow:0 0 0 6px ' + COLOR + '00}100%{box-shadow:0 0 0 0 ' + COLOR + '00}}' +
    '#tt-card .tt-x{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;box-shadow:none;text-shadow:none;margin:0;min-width:0;min-height:0;font-family:Arial,sans-serif;font-weight:400;position:absolute;top:8px;right:8px;width:22px;height:22px;border:0;border-radius:50%;background:transparent;color:#a0a0a0;font-size:16px;line-height:22px;cursor:pointer;padding:0;transition:background .2s,color .2s}' +
    '#tt-card .tt-x:hover{background:#f1f1f1;color:#111}' +
    '@media (max-width:768px){#tt-card{left:12px;width:300px}}' +
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
      card.innerHTML = '<span class="tt-ic">' + ICON + '</span><span class="tt-tx"><span class="tt-w">' + esc(it.w) + '</span>' +
        '<span class="tt-a">' + action + '</span><span class="tt-t"><span class="tt-dot" aria-hidden="true"></span>' + ago(it.ts) + '</span></span>' +
        '<button class="tt-x" type="button" aria-label="Dismiss">&times;</button>';
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
