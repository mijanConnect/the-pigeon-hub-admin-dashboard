// import react from "@vitejs/plugin-react";
// import { defineConfig } from "vite";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     // Local run
//     host: "10.10.7.21",
//     port: 3001,

//     // Host run
//     // host: "50.6.200.33",
//     // port: 3001,
//   },
// });

// import react from "@vitejs/plugin-react";
// import { defineConfig } from "vite";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     // host: "50.6.200.33",
//     // host: "ftp.thepigeonhub.com",
//     host: "admin.thepigeonhub.com",
//     // host: "admin.thepigeonhub.com",
//     // host: "206.162.244.155",
//     port: 4173,
//     allowedHosts: [
//       'admin.thepigeonhub.com'
//     ],
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
  },
  server: {
    host: true, 
    allowedHosts: ["admin.thepigeonhub.com", "localhost", "127.0.0.1"],
  },
});

