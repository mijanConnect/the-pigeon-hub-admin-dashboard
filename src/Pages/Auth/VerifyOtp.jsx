// VerifyOtp.jsx
import { Form, Typography, message } from "antd";
import React, { useState } from "react";
import OTPInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
import {
  useVerifyEmailMutation,
  useResendOtpMutation,
} from "../../redux/apiSlices/authSlice";
const { Text } = Typography;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState();
  const email = new URLSearchParams(location.search).get("email");

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // Handle OTP verification
  const onFinish = async () => {
    try {
      const res = await verifyEmail({ email, oneTimeCode: otp }).unwrap();
      console.log("VerifyEmail response:", res);

      if (res?.data) {
        // Save the reset token
        localStorage.setItem("resetToken", res.data);
      }

      navigate(`/auth/set-password?email=${email}`);
    } catch (error) {
      console.error("OTP Verify error:", error);
      message.error(error?.data?.message || "OTP verification failed");
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      const res = await resendOtp({ email }).unwrap();
      console.log("Resend OTP response:", res);
      message.success("OTP resent successfully! Please check your email.");
    } catch (error) {
      console.error("Resend OTP error:", error);
      message.error(error?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-[35px] font-semibold mb-[10px] mt-[20px] text-white">
          Enter The OTP
        </h1>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
        <p className="text-center text-white">Enter 4 digit code</p>
        <div className="flex items-center justify-center mb-6">
          <OTPInput
            value={otp}
            onChange={setOtp}
            numInputs={4}
            inputStyle={{
              height: 60,
              width: 60,
              borderRadius: "5px",
              margin: "16px",
              fontSize: "20px",
              border: "1px solid #ffffff",
              color: "#2B2A2A",
              outline: "none",
              background: "transparent",
              marginBottom: 10,
            }}
            renderInput={(props) => <input {...props} />}
          />
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <button
            htmlType="submit"
            type="submit"
            disabled={isLoading}
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
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </Form.Item>

        {/* Resend OTP Button */}
        <Form.Item style={{ marginTop: 15 }}>
          <button
            type="button"
            disabled={isResending}
            onClick={handleResendOtp}
            style={{
              width: "100%",
              height: 45,
              color: "white",
              fontWeight: "400px",
              fontSize: "18px",
              borderRadius: "5px",
            }}
            className="flex items-center justify-center bg-[#1f2682] hover:bg-primary transition rounded-lg"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VerifyOtp;
