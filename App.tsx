// App.tsx
import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { getRandomValues } from "expo-crypto";

export default function App() {
  if (!global.crypto) {
    global.crypto = {
      getRandomValues: getRandomValues as <T extends ArrayBufferView | null>(
        array: T
      ) => T,
      subtle: {
        decrypt: () => Promise.reject("Not implemented"),
        deriveBits: () => Promise.reject("Not implemented"),
        deriveKey: () => Promise.reject("Not implemented"),
        digest: () => Promise.reject("Not implemented"),
        encrypt: () => Promise.reject("Not implemented"),
        exportKey: () => Promise.reject("Not implemented"),
        generateKey: () => Promise.reject("Not implemented"),
        importKey: () => Promise.reject("Not implemented"),
        sign: () => Promise.reject("Not implemented"),
        unwrapKey: () => Promise.reject("Not implemented"),
        verify: () => Promise.reject("Not implemented"),
        wrapKey: () => Promise.reject("Not implemented"),
      },
      randomUUID: () => "00000000-0000-0000-0000-000000000000",
    };
  }
  return <AppNavigator />;
}
