import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useChangePasswordMutation } from "../../redux/apiSlices/authSlice";

const ChangePassword = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [newPassError, setNewPassError] = useState("");
  const [conPassError, setConPassError] = useState("");
  const [form] = Form.useForm();

  form.setFieldsValue({});

  const validatePasswordChange = (values) => {
    let errors = {};

    if (values?.currentPass === values.newPass) {
      errors.newPassError = "The New password is similar to the old Password";
      setNewPassError(errors.newPassError);
    } else {
      setNewPassError("");
    }

    if (values?.newPass !== values.confirmPass) {
      errors.conPassError = "New Password and Confirm Password Don't Match";
      setConPassError(errors.conPassError);
    } else {
      setConPassError("");
    }

    return errors;
  };

  const onFinish = async (values) => {
    const errors = validatePasswordChange(values);

    if (Object.keys(errors).length === 0) {
      try {
        await changePassword({ ...values })
          .unwrap()
          .then(({ status, message, token }) => {
            if (status) {
              toast.success(message);
              form.resetFields();
            }
          });
      } catch (error) {
        toast.error(error);
      }
    }
  };

  return (
    <div>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className="w-[50%] mx-auto mt-20"
      >
        <Form.Item
          name="currentPass"
          label={<p>Current Password</p>}
          rules={[
            {
              required: true,
              message: "Please Enter Current Password!",
            },
          ]}
        >
          <Input.Password
            style={{ background: "transparent" }}
            placeholder="Enter current password"
            className="h-12 bg-transparent hover:bg-transparent focus:bg-transparent placeholder:text-gray-500"
          />
        </Form.Item>

        <Form.Item
          name="newPass"
          rules={[
            {
              required: true,
              message: "Please Enter New Password!",
            },
          ]}
          label={<p>New Password</p>}
          style={{ marginBottom: newPassError ? 0 : null }}
        >
          <Input.Password
            style={{ background: "transparent" }}
            placeholder="Enter current password"
            className="h-12 bg-transparent hover:bg-transparent focus:bg-transparent placeholder:text-gray-500"
          />
        </Form.Item>
        {newPassError && (
          <label style={{ display: "block", color: "red" }} htmlFor="error">
            {newPassError}
          </label>
        )}

        <Form.Item
          label={<p>Confirm Password</p>}
          name="confirmPass"
          rules={[
            {
              required: true,
              message: "Please Enter Confirm Password!",
            },
          ]}
          style={{ marginBottom: conPassError ? 0 : null }}
        >
          <Input.Password
            style={{ background: "transparent" }}
            placeholder="Enter current password"
            className="h-12 bg-transparent hover:bg-transparent focus:bg-transparent placeholder:text-gray-500"
          />
        </Form.Item>
        {conPassError && (
          <label style={{ display: "block", color: "red" }} htmlFor="error">
            {conPassError}
          </label>
        )}

        <Form.Item
          style={{
            marginBottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            htmlType="submit"
            type="submit"
            style={{
              width: "100%",
              height: 45,
              color: "white",
              fontWeight: "400px",
              fontSize: "18px",

              marginTop: 20,
            }}
            className="flex items-center justify-center bg-gradient-to-r from-primary  to-secondary rounded-lg"
          >
            {isLoading ? "Changing" : "Update"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePassword;
