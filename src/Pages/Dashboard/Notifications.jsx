import React, { useState } from "react";
import { ConfigProvider, Pagination } from "antd";
import toast from "react-hot-toast";
import {
  useGetNotificationsQuery,
  useReadAllNotificationsMutation,
} from "../../redux/apiSlices/notificationSlice";

const Notifications = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetNotificationsQuery(page);
  const [readAll] = useReadAllNotificationsMutation();

  const handleReadAll = async () => {
    try {
      const res = await readAll().unwrap();
      toast.success(res.message || "All notifications marked as read!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to mark as read");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px]">All Notifications</h2>
        <button
          onClick={handleReadAll}
          className="bg-primary text-white h-10 px-4 rounded-md"
        >
          Read All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {isLoading
          ? [...Array(8).keys()].map((_, index) => (
              <div
                key={index}
                className="border-b-[1px] pb-2 border-[#d9d9d9] flex items-center gap-3 animate-pulse"
              >
                <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          : data?.notification?.map((notification) => (
              <div
                key={notification._id}
                className="border-b-[1px] pb-2 border-[#d9d9d9] flex items-center gap-3"
              >
                {/* <img
                  style={{
                    height: "50px",
                    width: "50px",
                    borderRadius: "100%",
                    border: "2px solid gray",
                  }}
                  src="https://img.freepik.com/free-photo/everything-is-okay-cheerful-friendly-looking-caucasian-guy-with-moustache-beard-raising-hand-with-ok-great-gesture-giving-approval-like-having-situation-control_176420-22386.jpg"
                /> */}
                <div>
                  <p>{notification.text}</p>
                  {/* <p style={{ color: "gray", marginTop: "4px" }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p> */}
                </div>
              </div>
            ))}
      </div>

      <div className="flex items-center justify-center mt-6">
        <ConfigProvider
          theme={{
            components: {
              Pagination: {
                itemActiveBg: "#6C57EC",
                borderRadius: "100%",
              },
            },
            token: {
              colorPrimary: "white",
            },
          }}
        >
          <Pagination
            current={page}
            total={data?.pagination?.total || 0}
            onChange={(p) => setPage(p)}
            showQuickJumper={false}
            showSizeChanger={false}
          />
        </ConfigProvider>
      </div>
    </div>
  );
};

export default Notifications;
