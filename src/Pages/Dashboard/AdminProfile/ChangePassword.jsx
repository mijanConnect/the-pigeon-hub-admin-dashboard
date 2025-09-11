import { Form, Input, message } from "antd";
import React from "react";
import GradientButton from "../../../components/common/GradiantButton";
import { useChangePasswordMutation } from "../../../redux/apiSlices/profileSlice";

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleChangePassword = async (values) => {
    // console.log("📤 Submitting form values:", values);

    try {
      // Call backend
      const res = await changePassword(values).unwrap();

      // console.log("✅ API response:", res);
      message.success("Password updated successfully!");
      form.resetFields();
    } catch (err) {
      // console.error("❌ API error object:", err);
      // If fetchBaseQuery returns a standard error
      if (err?.status) {
        console.error("🔹 Status:", err.status);
        console.error("🔹 Data:", err.data);
        message.error(err?.data?.message || "Failed to update password");
      } else {
        message.error("Network or server error");
      }
    }
  };

  return (
    <div className="">
      <div className="flex flex-col justify-start pl-20 pr-20 pt-5 pb-10 shadow-xl">
        <h2 className="text-2xl font-bold mb-5">Update Password</h2>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={handleChangePassword}
          onFinishFailed={(errorInfo) => {
            // console.log("❌ onFinishFailed triggered:", errorInfo);
            // message.error("Please fix validation errors!");
          }}
        >
          {/* Current Password */}
          <Form.Item
            style={{ marginBottom: "20px" }}
            name="current_password"
            label={<p style={{ display: "block" }}>Current Password</p>}
            rules={[
              {
                required: true,
                message: "Please input your current password!",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter Password"
              style={{
                height: "40px",
                background: "white",
                borderRadius: "8px",
                outline: "none",
              }}
            />
          </Form.Item>

          {/* New Password */}
          <Form.Item
            style={{ marginBottom: "20px" }}
            name="new_password"
            label={<p style={{ display: "block" }}>New Password</p>}
            dependencies={["current_password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please enter your new password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value && getFieldValue("current_password") === value) {
                    return Promise.reject(
                      new Error(
                        "The new password cannot be the same as current password!"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              style={{
                height: "40px",
                background: "white",
                borderRadius: "8px",
                outline: "none",
              }}
            />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            style={{ marginBottom: "40px" }}
            name="confirm_password"
            label={<p style={{ display: "block" }}>Re-Type Password</p>}
            dependencies={["new_password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value && getFieldValue("new_password") !== value) {
                    return Promise.reject(
                      new Error("The passwords you entered do not match!")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              style={{
                height: "40px",
                background: "white",
                borderRadius: "8px",
                outline: "none",
              }}
            />
          </Form.Item>

          {/* Submit Button */}
          {/* <div className="flex justify-center mb-[20px]">
            <Form.Item>
              <GradientButton
                type="primary"
                htmlType="submit"
                loading={isLoading}
                style={{
                  border: "none",
                  height: "40px",
                  background: "#1D75F2",
                  color: "white",
                  borderRadius: "8px",
                  outline: "none",
                  width: "200px",
                }}
              >
                Update your password
              </GradientButton>
            </Form.Item>
          </div> */}
          <Form.Item>
            <button
              type="submit"
              className="bg-primary text-white w-full font-bold rounded-lg"
              style={{ height: 40 }}
            >
              Update Your Password
            </button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
