/* eslint-disable react/prop-types */
import React from "react";

const SalesRepsCard = ({ icon: Icon, value, label }) => {
  return (
    <div className="bg-gradient-to-r from-primary  to-secondary shadow-lg rounded-lg p-6 flex items-center justify-between gap-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#EFEFEF] flex items-center justify-center">
          <Icon color="#007BA5" size={40} />
        </div>
        <div>
          <h3 className="text-white text-[32px] font-semibold">{value}</h3>
          <h2 className="text-white text-center text-md ">{label}</h2>
        </div>
      </div>
    </div>
  );
};

export default SalesRepsCard;
