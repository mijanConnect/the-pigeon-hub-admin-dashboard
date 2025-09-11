import React from "react";
// import InfoCard from "./InfoCard";
import { LuBadgeDollarSign } from "react-icons/lu";
import { RiBox3Fill } from "react-icons/ri";
import { TbProgressAlert, TbTruckLoading } from "react-icons/tb";
import InfoCard from "./InfoCard";

const CardInfo = () => {
  // Data for cards
  const cardData = [
    { icon: LuBadgeDollarSign, value: "100", label: "Total Revenue" },
    { icon: TbTruckLoading, value: "12k", label: "Total Order Boxes" },
    { icon: RiBox3Fill, value: "500", label: "Total Free order Boxes" },
    { icon: TbProgressAlert, value: "$3049", label: "Total Pending Orders" },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 h-[120px] mb-9">
      {cardData.map((data, index) => (
        <InfoCard
          key={index}
          icon={data.icon}
          value={data.value}
          label={data.label}
        />
      ))}
    </div>
  );
};

export default CardInfo;
