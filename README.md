# BumpCare

BumpCare is a prototype Android app built with Expo / React Native. It pairs with a wearable ultrasound-assisted screening device to help identify possible obstructed-labour risk factors during pregnancy (fetal presentation, size indicators, and obstetric history) and points users to relevant education and follow-up guidance.

**BumpCare does not diagnose obstructed labour.** It screens for possible risk factors and encourages appropriate professional follow-up — it is not a medical device and is not a substitute for clinical care.

This is a working prototype: there is no real hardware yet, so Bluetooth device connection and ultrasound scanning are simulated with realistic demo data so every screen and flow can be tested end-to-end.

## Features


- Profile setup with pregnancy details and obstetric history
- Simulated BLE device pairing, device check, and live monitoring
- Simulated ultrasound scan with AI-analysis screening result (presentation, size, scan quality)
- Local screening/monitoring history stored on-device (SQLite)
- Education hub with articles tied to screening results
- Export/share a report of any saved session

## Getting Started

**Requirements:**
- [Node.js](https://nodejs.org) (LTS version) installed on your computer
- The [Expo Go](https://expo.dev/go) app installed on your Android phone
- Your phone and computer connected to the same Wi-Fi network

**Setup:**

```bash
git clone <this-repo-url>
cd bumpcare
npm install
npx expo start
```

Scan the QR code shown in the terminal (or browser) using the Expo Go app on your phone. The app will load directly — no Android Studio or build step required.

## Tech Stack

- Expo (SDK 57) / React Native
- React Navigation (native stack)
- expo-sqlite for local data persistence
- React Context for shared device/profile state

## Project Structure

```
screens/       All app screens
navigation/    Navigation stack setup
context/       Shared app state (device, profile)
data/          SQLite database layer
content/       Education article content
theme/         Colors and shared styling
assets/        Images and icons
```

## Note

This project uses simulated sensor and scan data throughout, since no physical hardware exists yet. Every UI state (successful/failed connection, good/poor signal, scan quality, etc.) is deterministically reproducible for testing and demo purposes.
