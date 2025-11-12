import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetNotificationsQuery,
  useReadAllNotificationsMutation,
} from "../../redux/apiSlices/notificationSlice";

const Notifications = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetNotificationsQuery(page);
  const [readAll] = useReadAllNotificationsMutation();

  const totalPages = data?.pagination?.totalPage || 1;
  const total = data?.pagination?.total || 0;

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

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPage = (pageNum) => {
    setPage(pageNum);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate start and end of middle pages
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Adjust if we're near the start
      if (page <= 3) {
        end = 4;
      }

      // Adjust if we're near the end
      if (page >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 px-4 py-2 bg-primary">
        <h2 className="text-[22px] font-bold text-white">Notifications</h2>
        <button
          onClick={handleReadAll}
          className="bg-white text-primary hover:bg-gray-100 transition-colors h-8 rounded-md px-4 font-semibold"
        >
          Read All
        </button>
      </div>

      <div className="grid grid-cols-1 px-4">
        {isLoading ? (
          [...Array(8).keys()].map((_, index) => (
            <div
              key={index}
              className="border-b-[1px] pb-2 border-[#d9d9d9] flex items-center gap-2 animate-pulse"
            >
              <div className="h-12 w-12 rounded-full bg-gray-300"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : data?.notification?.length > 0 ? (
          data.notification.map((notification) => (
            <div
              key={notification._id}
              className="border-b-[1px] pb-2 pt-2 border-[#d9d9d9] flex items-start gap-2"
            >
              <div className="flex-1">
                <p
                  className={
                    notification.read
                      ? "font-normal text-gray-500"
                      : "font-semibold text-black"
                  }
                >
                  {notification.text}
                </p>
                <p className="text-gray-400 mt-1 text-xs">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No notifications found
          </div>
        )}
      </div>

      {/* Custom Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-end mt-6 px-4 pb-4">
          {/* <div className="text-sm text-gray-600">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of{" "}
            {total} notifications
          </div> */}

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className={`flex items-center justify-center w-9 h-9 rounded-md border transition-colors ${
                page === 1
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500"
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="w-9 h-9 flex items-center justify-center text-gray-500"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-9 h-9 rounded-md font-medium transition-colors ${
                      page === pageNum
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className={`flex items-center justify-center w-9 h-9 rounded-md border transition-colors ${
                page === totalPages
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
