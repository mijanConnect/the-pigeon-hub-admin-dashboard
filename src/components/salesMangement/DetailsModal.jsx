import React from "react";
import { Modal } from "antd";
import { imageUrl } from "../../redux/api/baseApi";

const DetailsModal = ({ isVisible, onClose, orderData }) => {
    console.log(orderData?.image)
  return (
    <Modal 
    centered
      title={`Order Details - ${orderData?.orderId}`}
      visible={isVisible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div>
        {orderData?.image && (
          <div className="flex justify-center mb-4">
            <img
            //   src={`${imageUrl}${orderData.image}` }
            src={"orderData.image"}
              alt="Order"
              className="w-40 h-40 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
        <p>
          <strong>Retailer Name:</strong> {orderData?.retailerName}
        </p>
        <p>
          <strong>Sales Rep:</strong> {orderData?.salesRep}
        </p>
        <p>
          <strong>Order Box:</strong> {orderData?.orderBox}
        </p>
        <p>
          <strong>Free Box:</strong> {orderData?.freeBox}
        </p>
        <p>
          <strong>Amount:</strong> ${orderData?.amount}
        </p>
        <p>
          <strong>Status:</strong> {orderData?.status}
        </p>
        <p>
          <strong>More Info:</strong> Here, you can add any extra information
          related to the order.
        </p>
      </div>
    </Modal>
  );
};

export default DetailsModal;
