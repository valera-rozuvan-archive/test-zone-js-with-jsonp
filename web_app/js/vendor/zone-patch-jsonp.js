/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('jsonp', function (global, Zone, api) {
    // because jsonp is not a standard api, there are a lot of
    // implementations, so zone.js just provide a helper util to
    // patch the jsonp send and onSuccess/onError callback
    // the options is an object which contains
    // - jsonp, the jsonp object which hold the send function
    // - sendFuncName, the name of the send function
    // - onSuccessCallbackFactory, a callback to get the onSuccess info 
    // - onErrorCallbackFactory, a callback to get the onError info
    Zone[Zone.__symbol__('jsonp')] = function patchJsonp(options) {
        if (!options || !options.jsonp || !options.sendFuncName || !options.onSuccessCallbackFactory) {
            return;
        }
        var noop = function () { };
        api.patchMethod(options.jsonp, options.sendFuncName, function (delegate) { return function (self, args) {
            // schedule a macroTask when send
            var onSuccessInfo = options.onSuccessCallbackFactory(self, args);
            if (!onSuccessInfo || !onSuccessInfo.target || !onSuccessInfo.callbackName) {
                return delegate.apply(self, args);
            }
            var onSuccessCallback = onSuccessInfo.target[onSuccessInfo.callbackName];
            var task;
            api.patchMethod(onSuccessInfo.target, onSuccessInfo.callbackName, function (successDelegate) { return function (successSelf, successArgs) {
                return task && task.invoke.apply(successSelf, successArgs);
            }; });
            var onErrorInfo = options.onErrorCallbackFactory(self, args);
            if (onErrorInfo && onErrorInfo.target && !onErrorInfo.callbackName) {
                var onErrorCallback_1 = onErrorInfo.target[onErrorInfo.callbackName];
                var zone_1 = Zone.current;
                api.patchMethod(onErrorInfo.target, onErrorInfo.callbackName, function (errorDelegate) { return function (errorSelf, errorArgs) {
                    if (zone_1 && zone_1 !== Zone.root) {
                        return zone_1.run(onErrorCallback_1, errorSelf, errorArgs);
                    }
                    else {
                        return errorDelegate.apply(errorSelf, errorArgs);
                    }
                }; });
            }
            task = Zone.current.scheduleMacroTask('jsonp', onSuccessCallback, {}, function (task) {
                return delegate.apply(self, args);
            }, noop);
        }; });
    };
});

})));
