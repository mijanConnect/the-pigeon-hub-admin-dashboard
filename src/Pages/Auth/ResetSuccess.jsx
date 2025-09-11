import { Button, Form, Typography, Input } from "antd";
import React, { useState } from "react"
import OTPInput from "react-otp-input";
import { useNavigate, useParams } from "react-router-dom";
const { Text } = Typography;
import resetSuccessTik from "../../assets/reset-success-tik.png"
import { ArrowLeft } from "lucide-react";

const ResetSuccessTik = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState();
  const email = new URLSearchParams(location.search).get("email")

  const onFinish = async(values) => {
        navigate(`/auth/reset-password?email=${email}`);
  };

  const handleResendEmail = async() => {

  };

  return (
    <div>
      <img src={resetSuccessTik} alt="KeyIcon" className="mb-[24px] mx-auto"/>
      <div className="text-center mb-8">
        <h1 className="text-[25px] font-semibold mb-6">Check your email</h1>
        <p className="mx-auto text-base text-[#667085]">
          We sent a password reset link to olivia@untitledui.com
        </p>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
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
              borderRadius: "200px",
              marginTop: 20,
            }}
            className="flex items-center justify-center bg-[#3FAE6A] rounded-lg"
          >
            Open email app
          </button>
        </Form.Item>
      </Form>
      <div className="mt-[20px]">
        <p className="text-center text-[#667085]">
          Didn’t receive the email?{" "}
          <a
            href="/auth/register"
            className="text-[#3FAE6A] hover:text-[#1E1E1E] font-semibold"
          >
            Click to resend
          </a>
        </p>
        </div>
      <div className="">
        <a href="/auth/login" className="flex items-center justify-center gap-1 text-[#667085] hover:text-[#3FAE6A] text-center mt-4">
          <ArrowLeft size={20} />
          <p>Back to log in</p>
        </a>
      </div>
    </div>
  );
};

export default ResetSuccessTik;
