import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // Local run
    host: "10.10.7.48",
    port: 3001,

    // Host run
    // host: "50.6.200.33",
    // port: 3001,
  },
});

// import react from "@vitejs/plugin-react";
// import { defineConfig } from "vite";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: "50.6.200.33",
//   },
// });
