# Test how Zone.js handles JSONP

## Update in 2022

With the fix from [PR](https://github.com/valera-rozuvan/test-zone-js-with-jsonp/pull/3) by [JiaLiPassion](https://github.com/JiaLiPassion), the original issue should be gone.

## For historic purposes

This repository tries to confirm the fact that [Zone.js](https://github.com/angular/zone.js/) can't
(doesn't) monkey patch JSONP. The project consists of a front-end application, and a back-end application.
In the web app interface, there are two buttons. The first button triggers a GET request, the second
button triggers a JSONP request. The entire application is wrapped inside a Zone, and we output a
bunch of logs to the JavaScript console. Also, we perform a console.log() directly from within each of
the response handlers.

These are the JS console logs from GET request:

```
new zone: onInvokeTask
eventName = click
eventName = HTMLButtonElement.addEventListener:click
new zone: onInvokeTask
eventName = click
eventName = HTMLDocument.addEventListener:click
new zone: onScheduleTask
eventName = undefined
eventName = XMLHttpRequest.addEventListener:load
new zone: onScheduleTask
eventName = undefined
eventName = XMLHttpRequest.send
new zone: onHasTask
new zone: onInvokeTask
---> eventName = undefined
---> eventName = XMLHttpRequest.send
new zone: onHasTask
new zone: onInvokeTask
---> eventName = load
---> eventName = XMLHttpRequest.addEventListener:load
GET request OK. Data is  {"data":"[get ok 42]"}
```

These are the JS console logs from JSONP request:

```
new zone: onInvokeTask
---> eventName = click
---> eventName = HTMLButtonElement.addEventListener:click
new zone: onInvokeTask
---> eventName = click
---> eventName = HTMLDocument.addEventListener:click
new zone: onScheduleTask
---> eventName = undefined
---> eventName = setTimeout
new zone: onHasTask
new zone: onHasTask
JSONP request OK. Data is  {"data":"[jsonp ok 97]"}
```

As can be seen, Zone.js does not catch the JSONP response. This is because
the response is actually JavaScript code that is executed by the browser inside
a newly injected `script` tag.

Further reading: [Do you still think that NgZone (zone.js) is required for change detection in Angular?](https://blog.angularindepth.com/do-you-still-think-that-ngzone-zone-js-is-required-for-change-detection-in-angular-16f7a575afef)

## Run locally

Make sure you have [node](https://github.com/nodejs/node), [npm](https://github.com/npm/npm), and
[nodemon](https://github.com/remy/nodemon) installed globally.

1. Clone this repository.
2. Switch to repository root folder.
3. Run command `npm install`.
4. Run command `npm run start`.
5. Navigate your browser to `http://localhost:3000/`.

## Local development

For convenience of local development, Nodemon is used for watching server JS files, and restarting the server upon
changes. [LiveReload](https://github.com/napcs/node-livereload) is integrated into the front-end part to refresh the
browser when the web application source files change.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.
