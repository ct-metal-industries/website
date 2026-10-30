/* Cookie consent for CT Metal Industries.
   Loaded in <head> before the Google tag so consent defaults apply first.

   - Analytics (Google Analytics) and Marketing (HubSpot) are off until the
     visitor opts in.
   - Google Analytics always loads, but in Consent Mode: no cookies are set
     unless analytics is accepted.
   - HubSpot tracking is only loaded after opt-in.
   - The choice is stored in localStorage for 12 months, then asked again.
   - Any element with [data-cookie-settings] reopens the preferences.
   - Set PRIVACY_URL once the privacy policy page exists to show a "Learn more" link. */
(function () {
  var STORAGE_KEY = 'ctm-cookie-consent';
  var VERSION = 1;
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
  var HUBSPOT_SRC = '//js-na3.hs-scripts.com/343635070.js';
  var PRIVACY_URL = '';

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!c || c.v !== VERSION || Date.now() - c.ts > MAX_AGE_MS) return null;
      return c;
    } catch (e) { return null; }
  }

  function save(c) {
    c.v = VERSION; c.ts = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) {}
  }

  var loaded = {};
  function loadScript(id, src) {
    if (loaded[id]) return;
    loaded[id] = true;
    var s = document.createElement('script');
    s.async = true; s.defer = true; s.id = id; s.src = src;
    document.head.appendChild(s);
  }

  function apply(c) {
    window.gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
    if (c.marketing) loadScript('hs-script-loader', HUBSPOT_SRC);
  }

  function choose(c, wasSet) {
    var revoked = wasSet && ((wasSet.analytics && !c.analytics) || (wasSet.marketing && !c.marketing));
    save(c);
    apply(c);
    hide();
    // Scripts already running can't be unloaded; reload so withdrawn consent takes effect.
    if (revoked) window.location.reload();
  }

  var stored = read();
  if (stored) apply(stored);

  /* ---------- Banner UI ---------- */
  var root;

  function build() {
    root = document.createElement('div');
    root.className = 'cookie-consent';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-labelledby', 'cookie-consent-title');
    root.setAttribute('aria-describedby', 'cookie-consent-desc');
    root.hidden = true;
    root.innerHTML =
      '<div class="cookie-consent__panel">' +
        '<div id="cookie-consent-title" class="cookie-consent__title">We value your privacy</div>' +
        '<p id="cookie-consent-desc" class="cookie-consent__text">We use cookies to understand how visitors use our site and to improve our marketing. ' +
          'You can accept all, reject non-essential cookies, or choose which to allow.' +
          (PRIVACY_URL ? ' <a href="' + PRIVACY_URL + '">Learn more</a>' : '') + '</p>' +
        '<div class="cookie-consent__prefs" hidden>' +
          '<label class="cookie-consent__option"><input type="checkbox" checked disabled>' +
            '<span><strong>Essential</strong> Required for the site to work. Always on.</span></label>' +
          '<label class="cookie-consent__option"><input type="checkbox" name="analytics">' +
            '<span><strong>Analytics</strong> Google Analytics helps us see which pages are useful.</span></label>' +
          '<label class="cookie-consent__option"><input type="checkbox" name="marketing">' +
            '<span><strong>Marketing</strong> HubSpot helps us follow up on enquiries and measure our campaigns.</span></label>' +
        '</div>' +
        '<div class="cookie-consent__actions">' +
          '<button type="button" class="btn btn--outline" data-action="manage">Manage preferences</button>' +
          '<button type="button" class="btn btn--outline" data-action="save" hidden>Save preferences</button>' +
          '<button type="button" class="btn btn--outline" data-action="reject">Reject all</button>' +
          '<button type="button" class="btn btn--primary" data-action="accept">Accept all</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    var prefs = root.querySelector('.cookie-consent__prefs');
    var manageBtn = root.querySelector('[data-action="manage"]');
    var saveBtn = root.querySelector('[data-action="save"]');

    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var prev = read();
      var action = btn.getAttribute('data-action');
      if (action === 'accept') choose({ analytics: true, marketing: true }, prev);
      else if (action === 'reject') choose({ analytics: false, marketing: false }, prev);
      else if (action === 'manage') {
        prefs.hidden = false; manageBtn.hidden = true; saveBtn.hidden = false;
        prefs.querySelector('input[name="analytics"]').focus();
      } else if (action === 'save') {
        choose({
          analytics: prefs.querySelector('input[name="analytics"]').checked,
          marketing: prefs.querySelector('input[name="marketing"]').checked
        }, prev);
      }
    });
  }

  function show(openPrefs) {
    if (!root) build();
    var c = read() || { analytics: false, marketing: false };
    root.querySelector('input[name="analytics"]').checked = !!c.analytics;
    root.querySelector('input[name="marketing"]').checked = !!c.marketing;
    var prefs = root.querySelector('.cookie-consent__prefs');
    prefs.hidden = !openPrefs;
    root.querySelector('[data-action="manage"]').hidden = !!openPrefs;
    root.querySelector('[data-action="save"]').hidden = !openPrefs;
    root.hidden = false;
    root.querySelector(openPrefs ? 'input[name="analytics"]' : '[data-action="accept"]').focus({ preventScroll: true });
  }

  function hide() { if (root) root.hidden = true; }

  document.addEventListener('DOMContentLoaded', function () {
    if (!stored) show(false);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); show(true); }
    });
  });
})();
