import { Button, ConfigProvider, Form, Input } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import keyIcon from "../../assets/key.png";
import { ArrowLeft } from "lucide-react";

const SetPassword = () => {
  const email = new URLSearchParams(location.search).get("email");
  const navigate = useNavigate();

  const onFinish = async (values) => {
    navigate(`/auth/login`);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-[35px] font-semibold mb-[10px] mt-[20px] text-white">
          Set Password
        </h1>
      </div>

      <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
        {/* New Password */}
        <Form.Item
          name="newPassword"
          label={
            <p style={{ color: "#ffffff", fontWeight: 500 }}>New Password</p>
          }
          rules={[
            {
              required: true,
              message: "Please input your new Password!",
            },
          ]}
        >
          <Input.Password
            placeholder="Enter new password"
            style={{
              height: 50,
              border: "1px solid #ffffff",
              outline: "none",
              boxShadow: "none",
              borderRadius: 5,
              backgroundColor: "transparent",
              color: "#ffffff",
            }}
          />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          name="confirmPassword"
          label={
            <p style={{ color: "#ffffff", fontWeight: 500 }}>
              Confirm Password
            </p>
          }
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Enter confirm password"
            style={{
              height: 50,
              border: "1px solid #ffffff",
              outline: "none",
              boxShadow: "none",
              borderRadius: 5,
              backgroundColor: "transparent",
              color: "#ffffff",
            }}
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <button
            htmlType="submit"
            type="submit"
            style={{
              width: "100%",
              height: 45,
              color: "white",
              fontWeight: 400,
              fontSize: 18,
              marginTop: 20,
              borderRadius: 5,
            }}
            className="flex items-center justify-center bg-primary hover:bg-[#1f2682] transition rounded-lg"
          >
            Submit
          </button>
        </Form.Item>
      </Form>

      <div className="">
        <a
          href="/auth/login"
          className="flex items-center justify-center gap-1 text-[#ffffff] hover:text-[#1f2682] text-center mt-4 transition"
        >
          <ArrowLeft size={20} />
          <p>Back to log in</p>
        </a>
      </div>
    </div>
  );
};

export default SetPassword;
