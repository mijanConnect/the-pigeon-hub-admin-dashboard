// import react from "@vitejs/plugin-react";
// import { defineConfig } from "vite";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: "10.10.7.21",
//     port: 3003,
//   },
// });

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // allow access from any IP
    port: 3000,
    allowedHosts: [
      "mijanur3000.binarybards.online", // ✅ add your domain here
    ],
  },
});

