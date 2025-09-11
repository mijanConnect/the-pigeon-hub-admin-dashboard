import { Button, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { LiaEditSolid } from "react-icons/lia";
import toast from "react-hot-toast";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "../../redux/apiSlices/authSlice";
import { imageUrl } from "../../redux/api/baseApi";
import { useUser } from "../../provider/User";

const Profile = () => {
  const [profileEdit, setProfileEdit] = useState(false);
  const [image, setImage] = useState();
  const [imgURL, setImgURL] = useState();
  const [form] = Form.useForm();
  const { user } = useUser();
  const { refetch } = useProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  const onChange = (e) => {
    const file = e.target.files[0];
    const imgUrl = URL.createObjectURL(file);
    setImgURL(imgUrl);
    setImage(file);
  };

  const src = user?.image?.startsWith("https")
    ? user?.image
    : `${imageUrl}${user?.image}`;

  const handleSubmit = async (values) => {
    const formData = new FormData();

    if (image) {
      formData.append("image", image);
    }

    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });

    try {
      await updateProfile(formData)
        .unwrap()
        .then(({ statusCode, status, message }) => {
          if (status) {
            toast.success(message);
            refetch();
          }
        });
    } catch ({ message }) {
      toast.error(message);
    }
  };

  return (
    <div>
      {!profileEdit ? (
        <Form form={form} className="grid grid-cols-12 gap-6" layout="vertical">
          <div className="col-span-12  flex items-center justify-between border-b-[1px] border-[#d9d9d9d] pb-6 mb-10">
            <div className="flex gap-5 items-center">
              <img
                width={142}
                height={142}
                style={{ borderRadius: "8px" }}
                src={src}
              />
              <div>
                <h2>{user?.firstName + " " + user?.lastName}</h2>
                <p>{user?.email}</p>
              </div>
            </div>

            <Button
              onClick={() => setProfileEdit(true)}
              style={{
                background: "#6C57EC",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                border: "none",
              }}
            >
              <LiaEditSolid fontSize={16} />
              Edit
            </Button>
          </div>

          <Form.Item
            name={"firstName"}
            label={<p>First Name</p>}
            className="col-span-6"
            style={{ marginBottom: 0 }}
          >
            <Input readOnly style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            name={"lastName"}
            label={<p>Last Name</p>}
            className="col-span-6"
            style={{ marginBottom: 0 }}
          >
            <Input readOnly style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            name={"email"}
            label={<p>Email</p>}
            className="col-span-12"
            style={{ marginBottom: 0 }}
          >
            <Input readOnly style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            name={"mobileNumber"}
            label={<p>Mobile Number</p>}
            className="col-span-6"
            style={{ marginBottom: 0 }}
          >
            <Input readOnly style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            name={"location"}
            label={<p>Location</p>}
            className="col-span-6"
            style={{ marginBottom: 0 }}
          >
            <Input readOnly style={{ width: "100%", height: "45px" }} />
          </Form.Item>
        </Form>
      ) : (
        <Form
          onFinish={handleSubmit}
          form={form}
          layout="vertical"
          className="w-full grid grid-cols-12 gap-6"
        >
          <div className="col-span-12 flex items-center gap-10 mb-10">
            <img
              className=""
              src={imgURL || src}
              width={142}
              height={142}
              alt=""
              style={{ borderRadius: "8px" }}
            />
            <div>
              <h2>
                {user?.firstName} {user?.lastName}
              </h2>
              <label
                htmlFor="img"
                style={{
                  marginTop: 0,
                  cursor: "pointer",
                  display: "block",
                  color: "#6C57EC",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Change Photo
              </label>
              <input
                style={{ display: "none" }}
                onChange={onChange}
                type="file"
                name=""
                id="img"
              />
            </div>
          </div>

          <Form.Item
            name={"firstName"}
            label={<p>First Name</p>}
            className="col-span-6"
            style={{ marginBottom: 0 }}
          >
            <Input style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            name={"lastName"}
            label={<p>Last Name</p>}
            className="col-span-6"
            style={{ marginBottom: 0 }}
          >
            <Input style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            name={"email"}
            label={<p>Email</p>}
            className="col-span-12"
            style={{ marginBottom: 0 }}
          >
            <Input style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            name={"mobileNumber"}
            label={<p>Mobile Number</p>}
            className="col-span-6"
            style={{ marginBottom: 0 }}
          >
            <Input style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            name={"location"}
            label={<p>Location</p>}
            className="col-span-6"
            style={{ marginBottom: 0 }}
          >
            <Input style={{ width: "100%", height: "45px" }} />
          </Form.Item>

          <Form.Item
            style={{ marginBottom: 0 }}
            className="col-span-12 flex items-center justify-center"
          >
            <Button
              htmlType="submit"
              style={{
                width: 200,
                height: 45,
                background: "#6C57EC",
                color: "#fff",
                marginTop: "20px",
                border: "none",
              }}
            >
              {isLoading ? "Loading..." : "Update"}
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Profile;
