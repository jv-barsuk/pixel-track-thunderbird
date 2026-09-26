# Pixel Track Thunderbird addon
## About
This extensions adds a tracking pixel to outgoing emails in Thunderbird, allowing 
you to monitor when recipients open your messages. It works with the self hosted 
(pixel-track)[https://github.com/jv-barsuk/pixel-track] service.

This extension targets Thunderbird 128 and later. It creates one pixel per
message through `POST /api/pixels`, using the first recipient as `label` and
the subject as `campaign`, then inserts `/t/{token}` into the message.

The compose toolbar button inserts a pixel manually. Automatic insertion runs when a 
configured rule matches. Multiple account identities and recipient addresses can be 
selected. Recipient matching checks To, Cc, and Bcc fields. Plain-text messages are 
converted to HTML only when insertion occurs for a configured recipient or through 
the manual button.

## Install
Install the packaged `.xpi` from Thunderbird's Add-ons Manager. Configure the
tracker base URL and API Basic Auth in the addon's options. Basic Auth is sent
only when creating a pixel and can be omitted; the image URL is unauthenticated.

### Configuration
* Track all outgoing mails from all accounts
* Track outgoing mails from specific accounts only
* Track outgoing mails based on recipient rules

## Usage
* Add tracking pixel depending on the rules 
* Add a tracking pixel manually using the compose toolbar button

## Development
Build and package the addon:
```sh
npm test
npm run package
```

`npm run package` creates `pixel-track-thunderbird.xpi` in this directory.