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

      if (res.success) {
        toast.success(res.message || "All notifications marked as read!");
      } else {
        toast.error(res.message || "Failed to mark as read");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Request failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-4 bg-primary">
        <h2 className="text-[22px] font-bold text-white">All Notifications</h2>
        <button
          onClick={handleReadAll}
          className="bg-primary text-white h-10 rounded-md"
        >
          Read All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 px-4">
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
                <div>
                  <p
                    className={
                      notification.read
                        ? "font-normal text-gray-500"
                        : "font-semibold text-black"
                    }
                  >
                    {notification.text}
                  </p>
                  <p
                    style={{
                      color: "gray",
                      marginTop: "2px",
                      fontSize: "12px",
                    }}
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
      </div>

      <div className="flex items-center justify-end mt-4">
        <ConfigProvider
          theme={{
            components: {
              Pagination: {
                colorText: "#ffffff", // normal number color (white like table body)
                colorTextDisabled: "#888888", // disabled arrows
                itemActiveBg: "#6C57EC", // active background (purple)
                itemActiveColor: "#ffffff", // active number text color
                colorPrimaryHover: "#6C57EC", // hover border/text
                itemBg: "#071952", // background for each item (same as table row)
                itemLinkBg: "#071952", // arrows background
              },
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
