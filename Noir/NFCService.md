---
tags: [service]
---

# NFCService

`frontend/src/services/nfc.ts` — NFC tag read/write via `react-native-nfc-manager`. Part of [[Services]].

Wrapped by [[useNfc]]. Used in [[Flow - Device Provisioning]] and [[Flow - Tap to Pay]] to read the tag UID that is then SHA-256 hashed into a `device_hash`.
