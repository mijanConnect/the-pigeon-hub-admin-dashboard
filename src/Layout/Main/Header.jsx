import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegBell } from "react-icons/fa6";
import { Badge, Button, Dropdown, Menu, Modal, List } from "antd";
import { useUser } from "../../provider/User";
import { IoIosLogOut } from "react-icons/io";
import { getImageUrl } from "../../components/common/imageUrl";
import {
  useGetRecentNotificationsQuery,
  useGetUnreadNotificationCountQuery,
} from "../../redux/apiSlices/notificationSlice";

const Header = () => {
  const { user } = useUser();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const navigate = useNavigate();

  const src = user?.profile;

  const showLogoutConfirm = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogoutModalOpen(false);
    window.location.href = "/auth/login";
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const handleOpenNotification = () => {
    setIsNotificationModalOpen(true);
  };

  const handleCloseNotification = () => {
    setIsNotificationModalOpen(false);
  };

  const handleSeeAllNotifications = () => {
    setIsNotificationModalOpen(false);
    navigate("/notification");
  };

  const menu = (
    <Menu>
      <Menu.Item key="settings">
        <Link to="/profile">Settings</Link>
      </Menu.Item>
      <Menu.Item
        key="logout"
        danger
        onClick={showLogoutConfirm}
        style={{ display: "flex", alignItems: "center" }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  // ✅ Fetch recent notifications
  const { data: notifications = [] } = useGetRecentNotificationsQuery(10);

  // ✅ Fetch unread count
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery();

  // console.log(unreadCount);

  return (
    <div className="flex items-center justify-between gap-5 w-full px-4 py-6 bg-[#F2F2F2] lg:px-10">
      <h2 className="font-bold text-xl text-secondary"></h2>
      <div className="flex items-center gap-5">
        {/* Profile Icon with Dropdown Menu */}
        <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="flex flex-row gap-1">
              <p>Hello,</p>
              <p className="text-[16px] font-semibold">
                {user?.name || "User"}
              </p>
            </div>
            <div
              style={{
                width: 45,
                height: 45,
                borderRadius: "50%",
                backgroundColor: "#071952",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 16,
                textTransform: "uppercase",
              }}
            >
              {user?.profile ? (
                <img
                  src={getImageUrl(user.profile)}
                  alt="profile-pic"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : user?.name ? (
                user.name.charAt(0)
              ) : (
                "U"
              )}
            </div>
          </div>
        </Dropdown>

        {/* Notification Icon with Unread Count */}
        <div
          onClick={handleOpenNotification}
          className="h-fit mt-[10px] cursor-pointer"
        >
          <Badge count={unreadCount} style={{ backgroundColor: "#071952" }}>
            <FaRegBell color="#071952" size={24} />
          </Badge>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        open={isLogoutModalOpen}
        onCancel={handleCancelLogout}
        footer={[
          <Button key="cancel" onClick={handleCancelLogout}>
            Cancel
          </Button>,
          <Button key="logout" danger onClick={handleLogout}>
            Logout
          </Button>,
        ]}
      >
        <p>Are you sure you want to log out?</p>
      </Modal>

      {/* Notification Modal */}
      <Modal
        title="Notifications"
        open={isNotificationModalOpen}
        onCancel={handleCloseNotification}
        footer={[
          <Button
            key="seeAll"
            type="primary"
            onClick={handleSeeAllNotifications}
          >
            See All Notifications
          </Button>,
        ]}
      >
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item key={item._id}>
              <span className="font-semibold">{item.text}</span>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default Header;
