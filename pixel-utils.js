(function (global) {
  "use strict";

  function normalizeHost(host) {
    return host.trim().replace(/\/+$/, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createPixelMarkup(host, token) {
    var url = normalizeHost(host) + "/t/" + encodeURIComponent(token);
    return '<img src="' + escapeHtml(url) +
      '" width="1" height="1" alt="" style="display:none" data-pixel-track="true">';
  }

  function plainTextToHtml(text) {
    return escapeHtml(text).replace(/\r\n|\r|\n/g, "<br>\n");
  }

  function appendPixel(details, markup) {
    if (details.isPlainText) {
      return {
        isPlainText: false,
        body: "<html><body>" + plainTextToHtml(details.plainTextBody || details.body || "") +
          "<br>\n" + markup + "</body></html>"
      };
    }

    var body = details.body || "";
    var closingBody = body.search(/<\/body\s*>/i);
    if (closingBody >= 0) {
      return { body: body.slice(0, closingBody) + markup + body.slice(closingBody) };
    }
    return { body: body + markup };
  }

  function hasPixel(body) {
    return /data-pixel-track\s*=\s*["']true["']/i.test(body || "");
  }

  function recipientMatches(recipients, configured) {
    var expected = Array.isArray(configured) ? configured : [configured];
    expected = expected.map(function (address) { return String(address).trim().toLowerCase(); })
      .filter(Boolean);
    return (recipients || []).some(function (recipient) {
      var address = String(recipient).replace(/^.*<([^>]+)>.*$/, "$1").trim().toLowerCase();
      return expected.indexOf(address) >= 0;
    });
  }

  function shouldAutomaticallyInsert(settings, details) {
    if (settings.addToAll) return true;
    var identityIds = settings.accountIdentityIds ||
      (settings.accountIdentityId ? [settings.accountIdentityId] : []);
    if (settings.accountEnabled && identityIds.indexOf(details.identityId) >= 0) return true;
    var recipients = (details.to || []).concat(details.cc || [], details.bcc || []);
    return settings.recipientEnabled && recipientMatches(recipients,
      settings.recipientAddresses || settings.recipientAddress || []);
  }

  global.PixelTrackUtils = {
    normalizeHost: normalizeHost,
    escapeHtml: escapeHtml,
    createPixelMarkup: createPixelMarkup,
    appendPixel: appendPixel,
    hasPixel: hasPixel,
    recipientMatches: recipientMatches,
    shouldAutomaticallyInsert: shouldAutomaticallyInsert
  };
})(this);
