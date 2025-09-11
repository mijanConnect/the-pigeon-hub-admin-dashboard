import { useLocation, useParams } from "react-router-dom";
import SalesCardInfo from "../SalesCardInfo";
import DetailsCard from "./DetailsCard";
import RetailerInfo from "./RetailerInfo";

const ViewSalesReps = () => {
  const { id } = useParams(); // Get dynamic ID from URL
  const location = useLocation(); // Get state data
  const salesRep = location.state; // Received sales rep data

  return (
    <div className="">
      <div className="flex  justify-between items-center">
        <div>
          {salesRep ? (
            <div className=" px-4  rounded shadow flex gap-10 items-center w-[450px]">
              {/* Image Section */}
              <img
                src={salesRep.image || "https://via.placeholder.com/150"} // Fallback Image
                alt={salesRep.name}
                className="w-32 h-32 rounded-full mb-4 border"
              />

              {/* Details Section */}

              <div>
                <p>
                  <strong>Name:</strong> {salesRep.name}
                </p>
                <p>
                  <strong>Email:</strong> {salesRep.email}
                </p>
                <p>
                  <strong>Assigned Retailer:</strong> {salesRep.retailer}
                </p>
                <p>
                  <strong>Total Sales:</strong> {salesRep.sales}
                </p>
                {/* <p>
                  <strong>Commission:</strong> {salesRep.commission}
                </p> */}
                {/* <p>
                  <strong>Status:</strong> {salesRep.status}
                </p> */}
              </div>
            </div>
          ) : (
            <p className="text-red-500">No data available</p>
          )}
        </div>
        <div>
          <DetailsCard />
        </div>
      </div>

      <RetailerInfo salesRep={salesRep} />
    </div>
  );
};

export default ViewSalesReps;
