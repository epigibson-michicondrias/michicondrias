// Polyfill to resolve 'ReferenceError: Property MessageQueue doesn't exist' in Bridgeless/New Architecture mode.
// Va antes que expo-router: con `import` el polyfill correría después (los imports se evalúan primero), por eso `require`.
if (typeof global.MessageQueue === 'undefined') {
  global.MessageQueue = {
    spy: () => {},
    registerQueueHook: () => {},
    enqueueSecureJSCall: () => {},
  };
}

// Entry point real de Expo Router
require('expo-router/entry');
