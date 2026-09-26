(function () {
  "use strict";
  var scalarIds = ["trackerHost", "username", "password", "addToAll", "accountEnabled",
    "recipientEnabled"];

  async function loadAccounts() {
    var select = document.getElementById("accountIdentityIds");
    var accounts = await browser.accounts.list();
    select.textContent = "";
    accounts.forEach(function (account) {
      (account.identities || []).forEach(function (identity) {
        var option = document.createElement("option");
        option.value = identity.id;
        option.textContent = identity.name + " <" + identity.email + ">";
        select.appendChild(option);
      });
    });
  }

  async function load() {
    await loadAccounts();
    var settings = await browser.storage.local.get(scalarIds.concat([
      "accountIdentityIds", "accountIdentityId", "recipientAddresses", "recipientAddress"
    ]));
    scalarIds.forEach(function (id) {
      var element = document.getElementById(id);
      if (element.type === "checkbox") element.checked = Boolean(settings[id]);
      else if (settings[id] !== undefined) element.value = settings[id];
    });
    var identityIds = settings.accountIdentityIds ||
      (settings.accountIdentityId ? [settings.accountIdentityId] : []);
    Array.from(document.getElementById("accountIdentityIds").options).forEach(function (option) {
      option.selected = identityIds.indexOf(option.value) >= 0;
    });
    document.getElementById("recipientAddresses").value =
      (settings.recipientAddresses || (settings.recipientAddress ? [settings.recipientAddress] : [])).join("\n");
  }

  document.getElementById("settings").addEventListener("submit", async function (event) {
    event.preventDefault();
    var values = {};
    scalarIds.forEach(function (id) {
      var element = document.getElementById(id);
      values[id] = element.type === "checkbox" ? element.checked : element.value.trim();
    });
    values.trackerHost = values.trackerHost.replace(/\/+$/, "");
    values.accountIdentityIds = Array.from(document.getElementById("accountIdentityIds").selectedOptions)
      .map(function (option) { return option.value; });
    values.recipientAddresses = document.getElementById("recipientAddresses").value
      .split(/[\n,]+/).map(function (address) { return address.trim().toLowerCase(); })
      .filter(Boolean).filter(function (address, index, addresses) {
        return addresses.indexOf(address) === index;
      });
    await browser.storage.local.set(values);
    var status = document.getElementById("status");
    status.textContent = "Saved.";
    setTimeout(function () { status.textContent = ""; }, 2000);
  });
  load().catch(function (error) {
    document.getElementById("status").textContent = "Unable to load settings: " + error.message;
  });
})();
