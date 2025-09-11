import React from "react";
import { LuBadgeDollarSign, LuBox } from "react-icons/lu";
import SalesRepsCard from "./SalesRepsCard";
import { FaUsers } from "react-icons/fa6";

const SalesCardInfo = () => {
  // Data for cards
  const cardData = [
    { icon: LuBox, value: "50", label: "Total Box sold" },
    { icon: LuBox, value: "$12", label: "Total Free Boxes Given" },
    { icon: LuBadgeDollarSign, value: "$5000", label: "Total Sales" },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 h-[120px] mb-9">
      {cardData.map((data, index) => (
        <SalesRepsCard
          key={index}
          icon={data.icon}
          value={data.value}
          label={data.label}
        />
      ))}
    </div>
  );
};

export default SalesCardInfo;
