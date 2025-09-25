import React from "react";
import router from "./routes";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <React.Fragment>
      <RouterProvider router={router} />
    </React.Fragment>
  );
}
export default App;
