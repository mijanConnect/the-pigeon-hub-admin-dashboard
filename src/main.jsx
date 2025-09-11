import i18next from "i18next";
import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import App from "./App.jsx";
import global_en from "./Translation/en/en.global.json";
import global_es from "./Translation/es/es.global.json";
import "./index.css";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "./provider/User.jsx";
import { ConfigProvider } from "antd";

i18next.init({
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  lng: "en",
  resources: {
    en: {
      // Use "en" instead of "english"
      global: global_en,
    },
    es: {
      // Use "es" instead of "spanish"
      global: global_es,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#071952",
          colorBorder: "#071952", // Default border color
          // colorText: "rgba(0, 0, 0, 0.88)", // Default text color
          // colorTextPlaceholder: "#bfbfbf", // Placeholder color
          // colorBgContainer: "#ffffff", // Background color
          // controlOutline: "rgba(232, 80, 91, 0.1)", // Focus outline color (based on your primary color)
        },
        components: {
          Input: {
            activeBorderColor: "#071952", // Active border color
            hoverBorderColor: "#071952", // Hover border color
            // activeShadow: "0 0 0 2px rgba(232, 80, 91, 0.1)", // Focus shadow
          },
        },
        Button: {
          colorPrimary: "#071952",
        },
      }}
    >
      <I18nextProvider i18n={i18next}>
        <Provider store={store}>
          <UserProvider>
            <App />
          </UserProvider>
          <Toaster />
        </Provider>
      </I18nextProvider>
    </ConfigProvider>
  </React.StrictMode>
);
