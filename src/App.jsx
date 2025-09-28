import React from "react";
import router from "./routes";
import { RouterProvider } from "react-router-dom";
import TokenRefresh from "./Pages/Auth/TokenRefresh";

function App() {
  return (
    <React.Fragment>
      <TokenRefresh />
      <RouterProvider router={router} />
    </React.Fragment>
  );
}
export default App;
