(function () {
  "use strict";

  var DEFAULTS = {
    trackerHost: "",
    username: "",
    password: "",
    addToAll: false,
    accountEnabled: false,
    accountIdentityIds: [],
    recipientEnabled: false,
    recipientAddresses: []
  };

  async function getSettings() {
    return Object.assign({}, DEFAULTS, await browser.storage.local.get(DEFAULTS));
  }

  function firstRecipient(details) {
    return (details.to || details.cc || details.bcc || [])[0] || "";
  }

  async function createPixel(settings, details) {
    var host = PixelTrackUtils.normalizeHost(settings.trackerHost);
    if (!host) throw new Error("Pixel tracker host is not configured.");

    var response = await fetch(host + "/api/pixels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(settings.username + ":" + settings.password)
      },
      body: JSON.stringify({
        label: firstRecipient(details),
        campaign: details.subject || ""
      })
    });
    if (!response.ok) {
      throw new Error("Pixel tracker returned HTTP " + response.status + ".");
    }
    var result = await response.json();
    if (!result.token) throw new Error("Pixel tracker response did not contain a token.");
    return result.token;
  }

  async function createPixelUpdate(details) {
    var settings = await getSettings();
    if (!details.isPlainText && PixelTrackUtils.hasPixel(details.body)) return details;
    var token = await createPixel(settings, details);
    return PixelTrackUtils.appendPixel(details,
      PixelTrackUtils.createPixelMarkup(settings.trackerHost, token));
  }

  browser.compose.onBeforeSend.addListener(async function (tab, details) {
    try {
      var settings = await getSettings();
      if (!PixelTrackUtils.normalizeHost(settings.trackerHost)) return;
      if (!PixelTrackUtils.shouldAutomaticallyInsert(settings, details)) return;
      if (details.isPlainText &&
          !(settings.recipientEnabled &&
            PixelTrackUtils.recipientMatches(
              (details.to || []).concat(details.cc || [], details.bcc || []),
              settings.recipientAddresses || []))) return;
      if (!details.isPlainText && PixelTrackUtils.hasPixel(details.body)) return;
      return { details: await createPixelUpdate(details) };
    } catch (error) {
      // Never block sending because of a pixel insertion failure.
      console.error("Pixel Track: skipping pixel insertion, send will proceed:", error);
      await browser.notifications.create({
        type: "basic",
        title: "Pixel Track",
        message: "Could not insert tracking pixel, message sent without it: " +
          (error.message || error)
      });
    }
  });

  browser.composeAction.onClicked.addListener(async function (tab) {
    try {
      var details = await browser.compose.getComposeDetails(tab.id);
      if (!details.isPlainText && PixelTrackUtils.hasPixel(details.body)) return;
      await browser.compose.setComposeDetails(tab.id, await createPixelUpdate(details));
    } catch (error) {
      console.error("Unable to insert tracking pixel:", error);
      await browser.notifications.create({
        type: "basic",
        title: "Pixel Track",
        message: error.message || "Unable to insert tracking pixel."
      });
    }
  });
})();
