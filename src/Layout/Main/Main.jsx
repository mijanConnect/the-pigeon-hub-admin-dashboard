import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Main = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) setCollapsed(true);
      else setCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-baseBg overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden border-l border-primary">
        {/* Header */}
        <Header toggleSidebar={() => setCollapsed(!collapsed)} />

        {/* Page Content */}
        <div className="flex-1 mt-3 overflow-y-auto overflow-x-hidden bg-baseBg rounded-md">
          <div className="w-full p-7 pt-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
