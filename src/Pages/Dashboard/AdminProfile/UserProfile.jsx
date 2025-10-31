import { UploadOutlined } from "@ant-design/icons";
import { Avatar, Button, Form, Input, message, Upload } from "antd";
import { useEffect, useState } from "react";
import { getImageUrl } from "../../../components/common/imageUrl";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../../redux/apiSlices/profileSlice";

const UserProfile = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [fileList, setFileList] = useState([]);
  const { data: profile, isFetching, error } = useGetProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  // AntD message hook to avoid static function warning
  const [messageApi, contextHolder] = message.useMessage();

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
        setImageUrl(profile.profile);
        setFileList([
          {
            uid: "-1",
            name: "profile.jpg",
            status: "done",
            url: profile.profile,
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
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic"];
    const isAllowedType = allowedTypes.includes(file.type.toLowerCase());
    if (!isAllowedType) {
      messageApi.error("Please upload only JPG, JPEG, PNG, or HEIC files.");
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error("Image must be smaller than 2MB.");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.username);
      formData.append("contact", values.contact);

      // if (fileList.length > 0 && fileList[0].originFileObj) {
      //   formData.append("image", fileList[0].originFileObj);
      // }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        // must match multer.single('profile') or fields([{ name: 'profile', maxCount: 1 }])
        formData.append("image", fileList[0].originFileObj);
      }

      const result = await updateProfile(formData).unwrap();

      // Update image preview with timestamp to avoid caching
      if (result?.data?.profile) {
        const updatedUrl = `${result.data.profile}?t=${Date.now()}`;
        setImageUrl(updatedUrl);
        setFileList([
          {
            uid: "-1",
            name: "profile.jpg",
            status: "done",
            url: updatedUrl,
          },
        ]);
      }

      messageApi.success(result.message || "Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      messageApi.error(err?.data?.message || "Update failed");
    }
  };

  if (isFetching) return <div>Loading profile…</div>;
  if (error) return <div>Could not load profile</div>;

  return (
    <>
      {contextHolder} {/* AntD message context */}
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
                  accept=".jpg,.jpeg,.png,.heic"
                  fileList={fileList}
                  listType="picture-card"
                  maxCount={1}
                >
                  {imageUrl ? (
                    <Avatar
                      className="profile-avatar-pigeon"
                      size={100}
                      src={
                        imageUrl
                          ? imageUrl.startsWith("blob:")
                            ? imageUrl
                            : getImageUrl(imageUrl)
                          : null
                      }
                      icon={!imageUrl && <UploadOutlined />}
                    />
                  ) : (
                    <Avatar
                      className="profile-avatar-pigeon"
                      size={100}
                      icon={<UploadOutlined />}
                    />
                  )}
                </Upload>
              </Form.Item>
              <h2 className="text-[24px] font-bold">
                {profile?.name || "User"}
              </h2>
            </div>

            {/* Username */}
            <Form.Item
              name="username"
              label="Name"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Please enter your username" },
              ]}
            >
              <Input
                placeholder="Enter your Username"
                style={{
                  height: "45px",
                  backgroundColor: "#f7f7f7",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </Form.Item>

            {/* Email */}
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
                  borderRadius: "6px",
                  outline: "none",
                }}
                disabled
              />
            </Form.Item>

            {/* Contact */}
            <Form.Item
              name="contact"
              label="Contact Number"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Please enter your contact" },
                {
                  validator: (_, value) => {
                    // If empty, required rule will handle it
                    if (!value) return Promise.resolve();
                    // Remove common separators and parentheses
                    const cleaned = String(value).replace(/[\s\-()]/g, "");
                    // Allow optional leading +, then 7-15 digits
                    const isValid = /^\+?\d{7,15}$/.test(cleaned);
                    return isValid
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Please enter a valid phone number (7-15 digits)."
                          )
                        );
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter your Contact Number"
                style={{
                  height: "45px",
                  backgroundColor: "#f7f7f7",
                  borderRadius: "6px",
                  outline: "none",
                }}
                inputMode="tel"
              />
            </Form.Item>

            {/* Save Button */}
            <div className="col-span-2 text-end mt-6">
              <Form.Item>
                <Button
                  htmlType="submit"
                  block
                  loading={isLoading}
                  className="bg-primary hover:!bg-primary/90 text-white hover:!text-white py-5 px-7 font-semibold text-[16px]"
                >
                  Save Changes
                </Button>
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
};

export default UserProfile;
