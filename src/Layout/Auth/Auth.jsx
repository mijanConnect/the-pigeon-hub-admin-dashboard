import { Outlet, useLocation } from "react-router-dom";
import loginImage from "../../assets/sideimage.png";
import forgotImage from "../../assets/forgot-img.png";
import verifyEmail from "../../assets/checkEmail.png";
import setImage from "../../assets/set-password.png";
import resetSuccess from "../../assets/reset-success.png";
import loginForm from "../../assets/login-form.png";

const Auth = () => {
  const location = useLocation();

  // Map routes to images
  const imageMap = {
    "/auth/login": loginForm,
    "/auth/forgot-password": loginForm,
    "/auth/verify-email": loginForm,
    "/auth/set-password": loginForm,
    "/auth/reset-success": loginForm,
    "/auth/verify-otp": loginForm,
  };

  // Pick the correct image or a default one
  const currentImage = imageMap[location.pathname] || forgotImage;

  return (
    <div className="w-full h-screen relative">
      <img
        src={currentImage}
        alt="Authentication visual"
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          filter: "brightness(80%) blur(5px)", // darken + blur
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      />

      {/* Centered Auth form */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.2)", // 20% opacity white
          padding: 30,
          paddingBottom: 40,
          borderRadius: 15,
          width: "80%",
          maxWidth: 500,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          border: "1px solid #ffffff",
          backdropFilter: "blur(10px)",
        }}
        className="shadow-xl"
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Auth;
