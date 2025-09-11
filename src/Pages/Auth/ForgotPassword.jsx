import { Button, Form, Input } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import keyIcon from "../../assets/key.png";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    navigate(`/auth/verify-otp?email=${values?.email}`);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-[35px] font-semibold mb-[10px] mt-[20px] text-white">
          Reset Password
        </h1>
      </div>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="email"
          label={<p style={{ color: "#ffffff", fontWeight: 500 }}>Email</p>}
          rules={[
            {
              required: true,
              message: "Please input your Email!",
              type: "email", // optional: validates email format
            },
          ]}
        >
          <Input
            type="email"
            placeholder="Enter your email"
            style={{
              height: 50,
              border: "1px solid #ffffff",
              outline: "none",
              boxShadow: "none",
              borderRadius: 5,
              backgroundColor: "transparent", // ✅ transparent background
              color: "#ffffff", // optional: make text white
            }}
          />
        </Form.Item>

        <Form.Item>
          <button
            htmlType="submit"
            type="submit"
            style={{
              width: "100%",
              height: 45,
              color: "white",
              fontWeight: "400px",
              fontSize: "18px",
              marginTop: 20,
              borderRadius: "5px",
            }}
            className="flex items-center justify-center bg-primary hover:bg-[#1f2682] transition rounded-lg"
          >
            Submit
          </button>
        </Form.Item>
      </Form>
      <div className="">
        <Link
          to="/auth/login"
          className="flex items-center justify-center gap-1 text-[#ffffff] hover:text-[#1f2682] text-center mt-4 transition"
        >
          <ArrowLeft size={20} />
          <p>Back to log in</p>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
