import { Input, Modal } from 'antd';
import React from 'react'
import GradientButton from '../common/GradiantButton';

const DetailsModalInOrder = ({handleSubmit,detailModalVisible, setDetailModalVisible, selectedOrder, freeBoxes, setFreeBoxes}) => {
  return (
    <div>
      <Modal
        title="Order Overview"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <GradientButton key="submit" type="primary" onClick={handleSubmit}>
            Submit
          </GradientButton>,
        ]}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <img
                src={selectedOrder.image}
                alt="Product"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
                className="rounded-lg"
              />
              <div>
                <p>
                  <strong>Order ID:</strong> {selectedOrder.orderId}
                </p>
                <p>
                  <strong>User Name:</strong> {selectedOrder.userName}
                </p>
                <p>
                  <strong>Source:</strong> {selectedOrder.source}
                </p>
                <p>
                  <strong>Total Boxes Sold:</strong> {selectedOrder.orderBox}
                </p>
                <p>
                  <strong>Free Boxes:</strong> {selectedOrder.freeBox}
                </p>
                <p>
                  <strong>Price:</strong> {selectedOrder.amount}
                </p>
                <p>
                  <strong>Order Status:</strong> {selectedOrder.status}
                </p>
                <p>
                  <strong>Shipping Address:</strong> 123 Business Avenue, Suite
                  200, Francisco, CA 94107
                </p>
              </div>
            </div>

            <div>
              <strong>Add Free Boxes:</strong>
              <Input
                type="number"
                value={freeBoxes}
                onChange={(e) => setFreeBoxes(e.target.value)}
                placeholder="Enter number of free boxes "
                min={0}
                className="mb-4"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DetailsModalInOrder
