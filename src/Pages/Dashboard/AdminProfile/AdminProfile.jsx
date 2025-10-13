import { Tabs } from "antd";
import "./AdminProfile.css";
import ChangePassword from "./ChangePassword";
import UserProfile from "./UserProfile";

const AdminProfile = () => {
  const items = [
    {
      key: "1",
      label: "Edit Profile",
      children: <UserProfile />,
    },
    {
      key: "2",
      label: "Change Password",
      children: <ChangePassword />,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 admin-profile">
      <div
        className="bg-white p-4 sm:p-6 md:p-8 rounded-xl mx-auto w-full"
        style={{ maxWidth: 1000 }}
      >
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </div>
  );
};

export default AdminProfile;
