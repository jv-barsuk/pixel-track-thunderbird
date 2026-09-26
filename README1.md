# Pixel Track Thunderbird addon

This MailExtension targets Thunderbird 128 and later. It creates one pixel per
message through `POST /api/pixels`, using the first recipient as `label` and
the subject as `campaign`, then inserts `/t/{token}` into the message.

Install the packaged `.xpi` from Thunderbird's Add-ons Manager. Configure the
tracker base URL and API Basic Auth in the addon's options. Basic Auth is sent
only when creating a pixel; the image URL is unauthenticated.

The compose toolbar button inserts a pixel manually. Automatic insertion runs when a configured rule matches. Multiple account
identities and recipient addresses can be selected. Recipient matching checks
To, Cc, and Bcc fields. Plain-text messages are converted to HTML only when
insertion occurs for a configured recipient or through the manual button.

## Build and test

```sh
npm test
npm run package
```

`npm run package` creates `pixel-track-thunderbird.xpi` in this directory.
