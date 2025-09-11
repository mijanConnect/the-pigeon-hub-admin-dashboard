import { Button, Form, Typography } from "antd";
import React, { useState } from "react";
import OTPInput from "react-otp-input";
import { useNavigate, useParams } from "react-router-dom";
const { Text } = Typography;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState();
  const email = new URLSearchParams(location.search).get("email");

  const onFinish = async (values) => {
    navigate(`/auth/set-password?email=${email}`);
  };

  const handleResendEmail = async () => {};

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-[35px] font-semibold mb-[10px] mt-[20px] text-white">
          Enter The OTP
        </h1>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
        <p className="text-center text-white ">Enter 4 digit code</p>
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
              border: "1px solid #ffffff", // corrected color
              color: "#2B2A2A",
              outline: "none",
              background: "transparent", // make background transparent
              marginBottom: 10,
            }}
            renderInput={(props) => <input {...props} />}
          />
        </div>

        {/* <div className="flex items-center justify-between mb-6 text-white">
          <Text className="text-white">Don't received code?</Text>
          <p
            onClick={handleResendEmail}
            className="login-form-forgot"
            style={{ color: "#fffff", cursor: "pointer" }}
          >
            Resend
          </p>
        </div> */}

        <Form.Item style={{ marginBottom: 0 }}>
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
            Verify
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VerifyOtp;
