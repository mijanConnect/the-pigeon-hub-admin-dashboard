// import { Form, Input, message as antdMessage } from "antd";
// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useLoginMutation } from "../../redux/apiSlices/authSlice";
// import { useUser } from "../../provider/User";
// import { Link } from "react-router-dom";

// const Login = () => {
//   const navigate = useNavigate();
//   const [login, { isLoading }] = useLoginMutation();
//   const [messageApi, contextHolder] = antdMessage.useMessage(); // ✅ hook version
//   const { setUser } = useUser();

//   const onFinish = async (values) => {
//     try {
//       const response = await login(values).unwrap();
//       if (response?.success) {
//         // ✅ store token
//         localStorage.setItem("token", response.data.accessToken);

//         // ✅ success toast
//         messageApi.success(response.message || "Logged in successfully!");

//         // ✅ hard reload → ensures UserProvider refetches profile with new token
//         window.location.href = "/";
//       } else {
//         messageApi.error(response.message || "Login failed!");
//       }
//     } catch (error) {
//       console.error("Login error:", error);

//       const backendMessage =
//         (typeof error === "string" && error) || // if transformErrorResponse made it a string
//         error?.data?.message || // normal RTKQ error object
//         error?.data?.errorMessages?.[0]?.message ||
//         error?.error ||
//         "Something went wrong!";

//       messageApi.error(backendMessage);
//     }
//   };

//   return (
//     <div>
//       {contextHolder} {/* ✅ required for hook */}
//       <div className="text-center mb-8">
//         <h1 className="text-[35px] font-semibold mb-[10px] mt-[20px] text-white">
//           Log In
//         </h1>
//       </div>
//       <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
//         <Form.Item
//           name="email"
//           label={
//             <p style={{ color: "#ffffff", fontWeight: 500 }}>Email Address</p>
//           }
//           rules={[
//             { required: true, message: "Please input your Email!" },
//             { type: "email", message: "Please enter a valid email!" },
//           ]}
//         >
//           <Input
//             placeholder="Enter your email"
//             style={{
//               height: 50,
//               border: "1px solid #ffffff",
//               borderRadius: 5,
//               backgroundColor: "transparent",
//               color: "#ffffff",
//             }}
//           />
//         </Form.Item>

//         <Form.Item
//           name="password"
//           label={<p style={{ color: "#ffffff", fontWeight: 500 }}>Password</p>}
//           rules={[{ required: true, message: "Please input your Password!" }]}
//         >
//           <Input.Password
//             placeholder="Enter your password"
//             style={{
//               height: 50,
//               border: "1px solid #ffffff",
//               borderRadius: 5,
//               backgroundColor: "transparent",
//               color: "#ffffff",
//             }}
//           />
//         </Form.Item>

//         <div className="flex justify-end">
//           <Link
//             to="/auth/forgot-password"
//             className="text-[16px] text-white hover:text-white hover:underline"
//           >
//             Forgot Password
//           </Link>
//         </div>

//         <Form.Item>
//           <button
//             type="submit"
//             disabled={isLoading}
//             style={{
//               width: "100%",
//               height: 45,
//               color: "white",
//               fontWeight: 400,
//               fontSize: 18,
//               marginTop: 20,
//               borderRadius: 5,
//             }}
//             className="flex items-center justify-center bg-primary hover:bg-[#1f2682] transition rounded-lg"
//           >
//             {isLoading ? "Signing in..." : "Sign In"}
//           </button>
//         </Form.Item>
//       </Form>
//     </div>
//   );
// };

// export default Login;

// Login.jsx
import React from "react";
import { Form, Input, message as antdMessage } from "antd";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/apiSlices/authSlice";
import { useUser } from "../../provider/User";
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [messageApi, contextHolder] = antdMessage.useMessage(); // ✅ hook version
  const { setUser } = useUser();

  const onFinish = async (values) => {
    try {
      const response = await login(values).unwrap();

      if (response?.success) {
        // ✅ store token and pages
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("pages", JSON.stringify(response.data.User.pages));

        // ✅ success toast
        messageApi.success(response.message || "Logged in successfully!");

        // ✅ hard reload → ensures UserProvider refetches profile with new token
        window.location.href = "/";
      } else {
        messageApi.error(response.message || "Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);

      const backendMessage =
        (typeof error === "string" && error) || // if transformErrorResponse made it a string
        error?.data?.message || // normal RTKQ error object
        error?.data?.errorMessages?.[0]?.message ||
        error?.error ||
        "Something went wrong!";

      messageApi.error(backendMessage);
    }
  };

  return (
    <div>
      {contextHolder} {/* ✅ required for hook */}
      <div className="text-center mb-8">
        <h1 className="text-[35px] font-semibold mb-[10px] mt-[20px] text-white">
          Log In
        </h1>
      </div>
      <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
        <Form.Item
          name="email"
          label={
            <p style={{ color: "#ffffff", fontWeight: 500 }}>Email Address</p>
          }
          rules={[
            { required: true, message: "Please input your Email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            placeholder="Enter your email"
            style={{
              height: 50,
              border: "1px solid #ffffff",
              borderRadius: 5,
              backgroundColor: "transparent",
              color: "#ffffff",
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<p style={{ color: "#ffffff", fontWeight: 500 }}>Password</p>}
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input.Password
            placeholder="Enter your password"
            style={{
              height: 50,
              border: "1px solid #ffffff",
              borderRadius: 5,
              backgroundColor: "transparent",
              color: "#ffffff",
            }}
          />
        </Form.Item>

        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-[16px] text-white hover:text-white hover:underline"
          >
            Forgot Password
          </Link>
        </div>

        <Form.Item>
          <button
            type="submit"
            disabled={isLoading}
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
