const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { console };
vm.createContext(context);
vm.runInContext(fs.readFileSync("pixel-utils.js", "utf8"), context);
const utils = context.PixelTrackUtils;

test("creates a tracker image URL", () => {
  assert.match(utils.createPixelMarkup("https://track.example/", "a/b"), /https:\/\/track\.example\/t\/a%2Fb/);
});

test("converts plain text only when inserting", () => {
  const result = utils.appendPixel({ isPlainText: true, plainTextBody: "Hello <there>" }, "<img>");
  assert.equal(result.isPlainText, false);
  assert.match(result.body, /Hello &lt;there&gt;<br>/);
  assert.match(result.body, /<img>/);
});

test("matches recipient addresses in display-name form", () => {
  assert.equal(utils.recipientMatches(["Person <person@example.com>"], ["person@example.com", "other@example.com"]), true);
  assert.equal(utils.recipientMatches(["other@example.com"], ["person@example.com"]), false);
});

test("matches selected account identities", () => {
  assert.equal(utils.shouldAutomaticallyInsert({
    accountEnabled: true,
    accountIdentityIds: ["identity-2"],
    recipientEnabled: false
  }, { identityId: "identity-2" }), true);
});
