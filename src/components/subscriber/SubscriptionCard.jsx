import React from "react";
import { FaUsers } from "react-icons/fa6";

const SubscriptionCard = () => {
  // Data for cards
  const cardData = [
    { icon: FaUsers, value: "357", label: "Total Subscribers" },
    { icon: FaUsers, value: "105", label: "Running Subscribers" },
    { icon: FaUsers, value: "58", label: "Inactive Subscribers" },
  ];

  return (
    <div className="mb-6">
      {" "}
      {/* Added margin bottom to prevent overlap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((data, index) => (
          <SalesRepsCard
            key={index}
            icon={data.icon}
            value={data.value}
            label={data.label}
          />
        ))}
      </div>
    </div>
  );
};

// SalesRepsCard Component Inside the Same File
const SalesRepsCard = ({ icon: Icon, value, label }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#EFEFEF] flex items-center justify-center">
          <Icon color="#007BA5" size={40} />
        </div>
        <div>
          <h3 className="text-white text-[20px] sm:text-[32px] font-semibold">
            {value}
          </h3>
          <h2 className="text-white text-center sm:text-left text-sm lg:text-xl">
            {label}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
