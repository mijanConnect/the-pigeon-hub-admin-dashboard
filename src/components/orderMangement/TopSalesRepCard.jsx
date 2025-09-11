import React from "react";

const TopSalesRepCard = () => {
  // Data for cards with image paths instead of icons
  const cardData = [
    {
      image: "https://i.ibb.co/8gh3mqPR/Ellipse-48-1.jpg", // Replace with your actual image URL
      value: "$15000",
      label: "Jashica Tasnim",
    },
    {
      image: "https://i.ibb.co/8gh3mqPR/Ellipse-48-1.jpg", // Replace with your actual image URL
      value: "$10562",
      label: "Tanvir Ahmed",
    },
    {
      image: "https://i.ibb.co/8gh3mqPR/Ellipse-48-1.jpg", // Replace with your actual image URL
      value: "$5000",
      label: "Pronab Kumar",
    },
  ];

  return (
    <div className="mb-9">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((data, index) => (
          <SalesRepsCard
            key={index}
            image={data.image}
            value={data.value}
            label={data.label}
          />
        ))}
      </div>
    </div>
  );
};

// SalesRepsCard Component Inside the Same File
const SalesRepsCard = ({ image, value, label }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary shadow-lg rounded-lg p-6 flex items-center justify-between gap-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#EFEFEF] flex items-center justify-center">
          <img
            src={image}
            alt={label}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-white text-center text-md">{label}</h2>
          <h3 className="text-white text-[32px] font-semibold">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default TopSalesRepCard;
