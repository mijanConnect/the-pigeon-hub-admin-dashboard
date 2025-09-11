import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, Avatar, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../../redux/apiSlices/profileSlice";

const baseUrl = "http://10.10.7.41:5001"; // your API root
const makeUrl = (path) =>
  !path ? "" : path.startsWith("http") ? path : `${baseUrl}${path}`;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [fileList, setFileList] = useState([]);
  const { data: profile, isFetching, error } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();

  // Populate form with profile
  useEffect(() => {
    if (profile && !isFetching && !error) {
      form.setFieldsValue({
        username: profile.name,
        email: profile.email,
        contact: profile.contact,
        address: profile.address || "",
        language: profile.language || "english",
      });

      if (profile.profile) {
        const full = makeUrl(profile.profile);
        setImageUrl(full);
        setFileList([
          {
            uid: "-1",
            name: "profile.jpg",
            status: "done",
            url: full,
          },
        ]);
      }
    }
  }, [profile, isFetching, error, form]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageChange = ({ fileList: newList }) => {
    const latest = newList.slice(-1);
    setFileList(latest);

    if (latest.length > 0 && latest[0].originFileObj) {
      const newUrl = URL.createObjectURL(latest[0].originFileObj);
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(newUrl);
    } else if (latest.length === 0) {
      setImageUrl(null);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Please upload an image file.");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB.");
    }
    return isImage && isLt2M ? false : Upload.LIST_IGNORE; // prevent auto upload
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();

      // Only use originFileObj if a new file is uploaded
      const imageFile =
        fileList.length > 0 ? fileList[0].originFileObj || null : null;

      // Map form fields to backend expected keys
      formData.append("name", values.username);
      formData.append("contact", values.contact);

      if (imageFile) {
        formData.append("image", imageFile); // <- must match backend multer field
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/api/v1/user`, {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // include token
          // Don't set Content-Type for FormData
        },
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        console.error("Update failed:", result);
        message.error(result.message || "Update failed");
        return;
      }

      message.success(result.message || "Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      message.error("Update failed: " + err.message);
    }
  };

  if (isFetching) return <div>Loading profile…</div>;
  if (error) return <div>Could not load profile</div>;

  return (
    <div className="flex justify-center items-center shadow-xl rounded-lg pt-5 pb-12">
      <Form
        form={form}
        layout="vertical"
        style={{ width: "80%" }}
        onFinish={onFinish}
        encType="multipart/form-data"
      >
        <div className="flex flex-col gap-5">
          {/* Profile Image */}
          <div className="col-span-2 flex justify-start items-center gap-5">
            <Form.Item style={{ marginBottom: 0 }}>
              <Upload
                name="profile"
                showUploadList={false}
                onChange={handleImageChange}
                beforeUpload={beforeUpload}
                fileList={fileList}
                listType="picture-card"
                maxCount={1}
              >
                {imageUrl ? (
                  <Avatar size={100} src={imageUrl} />
                ) : (
                  <Avatar size={100} icon={<UploadOutlined />} />
                )}
              </Upload>
            </Form.Item>
            <h2 className="text-[24px] font-bold">{profile?.name || "User"}</h2>
          </div>

          <Form.Item
            name="username"
            label="Full Name"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input
              placeholder="Enter your Username"
              style={{
                height: "45px",
                backgroundColor: "#f7f7f7",
                borderRadius: "8px",
                outline: "none",
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            style={{ marginBottom: 0 }}
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="Enter your Email"
              style={{
                height: "45px",
                backgroundColor: "#f7f7f7",
                borderRadius: "8px",
                outline: "none",
              }}
              disabled
            />
          </Form.Item>

          <Form.Item
            name="contact"
            label="Contact Number"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: "Please enter your contact" }]}
          >
            <Input
              placeholder="Enter your Contact Number"
              style={{
                height: "45px",
                backgroundColor: "#f7f7f7",
                borderRadius: "8px",
                outline: "none",
              }}
            />
          </Form.Item>

          {/* Update Button */}
          <div className="col-span-2 text-end mt-6">
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ height: 40 }}
              >
                Save Changes
              </Button>
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default UserProfile;
