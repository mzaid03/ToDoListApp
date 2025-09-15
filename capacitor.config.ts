import { CapacitorConfig } from "@capacitor/cli";

// Update appId before publishing (reverse-DNS style)
const config: CapacitorConfig = {
  appId: "app.tasktide",
  appName: "TaskTide",
  webDir: "out",
  server: {
    // For device testing, set CAP_SERVER_URL to your LAN Next dev URL, e.g. http://192.168.1.10:3000
    url: process.env.CAP_SERVER_URL,
    cleartext: true,
    androidScheme: "https",
  },
};

export default config;
