import type { CapacitorConfig } from "@capacitor/cli";

// Live reload: start the dev server with `npm run dev -- --host`, then
//   CAP_SERVER_URL=http://<pc-lan-ip>:3000 npx cap sync android
// and Run from Android Studio. Leave CAP_SERVER_URL unset (and re-sync) to bundle dist/ again.
const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.example.rpgprototype",
  appName: "Emberhold",
  webDir: "dist",
  ...(serverUrl ? { server: { url: serverUrl, cleartext: true } } : {}),
};

export default config;
