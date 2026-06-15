// Polyfill to resolve 'ReferenceError: Property MessageQueue doesn't exist' in Bridgeless/New Architecture mode
if (typeof global.MessageQueue === 'undefined') {
  global.MessageQueue = {
    spy: () => {},
    registerQueueHook: () => {},
    enqueueSecureJSCall: () => {},
  };
}

// Import the actual Expo Router entry point
import 'expo-router/entry';
