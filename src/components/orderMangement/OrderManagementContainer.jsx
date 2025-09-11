import React from "react";
import OrderManagementTable from "./OrderManagementTable";
import OrderCard from "./OrderCard";
import SalesTable from "./TopSalerReps";
import TopSalesRepCard from "./TopSalesRepCard";

const OrderManagementContainer = () => {
  return (
    <div>
      <OrderCard />
      <OrderManagementTable />

      <h2 className="text-3xl font-bold mt-12 mb-6">Top Performing Sales Representatives</h2>
      <TopSalesRepCard />
      <SalesTable />
    </div>
  );
};

export default OrderManagementContainer;
