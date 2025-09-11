import React from "react";
import { LuBadgeDollarSign } from "react-icons/lu";
import { FaUsers } from "react-icons/fa6";

const HomeCard = () => {
  // Data for cards
  const cardData = [
    { icon: FaUsers, value: "100", label: "Total Sales" },
    { icon: FaUsers, value: "$12", label: "Total Commission" },
    { icon: LuBadgeDollarSign, value: "$5000", label: "Total Orders" },
    { icon: LuBadgeDollarSign, value: "$5000", label: "Total Orders" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-9">
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
    <div className="bg-[#fff] text-[#181818] shadow-lg rounded-lg p-4 md:p-6 flex items-center justify-between gap-2 md:gap-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#EFEFEF] flex items-center justify-center">
          <Icon color="#007BA5" className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div>
          <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold">
            {value}
          </h3>
          <h2 className="text-white text-sm md:text-base lg:text-xl">
            {label}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
