import React from "react";
import { LuBadgeDollarSign } from "react-icons/lu";
import { FaUsers } from "react-icons/fa6";

const DetailsCard = () => {
  // Data for cards
  const cardData = [
    { icon: FaUsers, value: "100", label: "Total Sales" },
    { icon: FaUsers, value: "$12", label: "Total Commission" },
    { icon: LuBadgeDollarSign, value: "$5000", label: "Total Orders" },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 h-[120px] mb-9">
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

// SalesRepsCard Component Inside the Same File
const SalesRepsCard = ({ icon: Icon, value, label }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary shadow-lg rounded-lg p-6 flex items-center justify-between gap-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#EFEFEF] flex items-center justify-center">
          <Icon color="#007BA5" size={40} />
        </div>
        <div>
          <h3 className="text-white text-[32px] font-semibold">{value}</h3>
          <h2 className="text-white text-center text-xl">{label}</h2>
        </div>
      </div>
    </div>
  );
};

export default DetailsCard;
