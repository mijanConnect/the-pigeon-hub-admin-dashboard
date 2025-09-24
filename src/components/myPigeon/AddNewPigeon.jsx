import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Upload,
  message,
  Menu,
  Dropdown,
  Switch,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useAddPigeonMutation,
  useGetBreederNamesQuery,
  useUpdatePigeonMutation,
} from "../../redux/apiSlices/mypigeonSlice";
import { getImageUrl } from "../common/imageUrl";
import { useGetBreedersQuery } from "../../redux/apiSlices/breederSlice";
import { getNames } from "country-list";

const { Option } = Select;

const colorPatternMap = {
  Blue: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Black: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  White: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Ash_Red: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Brown: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Grizzle: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Mealy: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
};

const AddNewPigeon = ({ visible, onCancel, onSave, pigeonData }) => {
  const [form] = Form.useForm();
  const [selected, setSelected] = useState({ color: null, pattern: null });
  const [addPigeon, { isLoading: isAdding }] = useAddPigeonMutation();
  const [showResults, setShowResults] = useState(false);
  const [raceResults, setRaceResults] = useState([]);
  const countries = getNames();

  useEffect(() => {
    if (visible) {
      if (pigeonData) {
        // Split color & pattern
        const [color, pattern] = pigeonData.color?.includes("&")
          ? pigeonData.color.split(" & ").map((v) => v.trim())
          : [pigeonData.color, null];

        setSelected({ color, pattern });
        setShowResults(Boolean(pigeonData.results));
        setRaceResults(
          pigeonData.results?.map((r) => ({
            ...r,
            date: r.date ? r.date.split("T")[0] : "", // format for <input type="date">
          })) || []
        );

        const photoList = pigeonData.photos
          ? pigeonData.photos.map((url, index) => ({
              uid: String(index),
              name: `image-${index}.jpg`,
              status: "done",
              url: getImageUrl(url),
              originFileObj: null,
            }))
          : [];

        form.setFieldsValue({
          ...pigeonData,
          fatherRingId: pigeonData.fatherRingId?.ringNumber || "",
          motherRingId: pigeonData.motherRingId?.ringNumber || "",
          colorPattern: { color, pattern },
          verification: pigeonData.verified ? "verified" : "notverified",
          iconic: pigeonData.iconic ? "yes" : "no",
          photos: photoList,
          breeder: pigeonData.breeder?._id || pigeonData.breeder, // ✅ ensure ID is used
        });
      } else {
        form.resetFields();
        setSelected({ color: null, pattern: null });
        setShowResults(false);
        setRaceResults([]);
      }
    }
  }, [pigeonData, visible, form]);

  const handleClick = (color, pattern) => {
    setSelected({ color, pattern });
    form.setFieldsValue({ colorPattern: { color, pattern } });
  };

  const menu = (
    <Menu>
      {Object.entries(colorPatternMap).map(([color, patterns]) => (
        <Menu.SubMenu key={color} title={color}>
          {patterns.map((pattern) => (
            <Menu.Item
              key={`${color}-${pattern}`}
              onClick={() => handleClick(color, pattern)}
            >
              {pattern}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      ))}
    </Menu>
  );

  const { data: breederNames = [], isLoading: breedersLoading } =
    useGetBreederNamesQuery();

  const [updatePigeon, { isLoading: isUpdating }] = useUpdatePigeonMutation();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const fileList = values.photos || [];

      const newFiles = fileList.filter((file) => file.originFileObj);
      const existingFiles = fileList.filter((file) => !file.originFileObj);

      const extractImagePath = (url) => {
        if (!url) return "";
        if (url.includes("/images/")) return url.split("/images/")[1];
        return url;
      };

      const remainingImages = existingFiles
        .map(
          (file) =>
            `/images/${extractImagePath(file.url || file.response?.url)}`
        )
        .filter(Boolean);

      const combinedColor =
        values.colorPattern?.color && values.colorPattern?.pattern
          ? `${values.colorPattern.color} & ${values.colorPattern.pattern}`
          : values.colorPattern?.color || values.colorPattern?.pattern || "-";

      const filteredRaceResults = raceResults
        .filter((r) => r.name || r.date || r.distance || r.total || r.place) // only non-empty results
        .map((r) => ({
          name: r.name || "",
          date: r.date || "",
          distance: r.distance || "",
          total: r.total ? Number(r.total) : 0,
          place: r.place || "",
        }));

      // 🔥 Add remaining images to the main data payload
      const dataToSend = {
        ringNumber: values.ringNumber,
        name: values.name,
        country: values.country,
        birthYear: values.birthYear,
        story: values.story || "",
        shortInfo: values.shortInfo || "",
        breeder: values.breeder,
        color: combinedColor,
        racingRating: values.racingRating,
        breederRating: values.breederRating,
        iconicScore: values.iconicScore,
        gender: values.gender,
        status: values.status,
        location: values.location,
        notes: values.notes || "",
        results:
          filteredRaceResults.length > 0 ? filteredRaceResults : undefined, // send only if not empty
        verified: values.verification === "verified",
        iconic: values.iconic === "yes",
        fatherRingId: values.fatherRingId || "",
        motherRingId: values.motherRingId || "",
        remaining: remainingImages, // ✅ here
      };

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("data", JSON.stringify(dataToSend));

      // Append only new uploaded images
      newFiles.forEach((file) => formData.append("image", file.originFileObj));

      // 🔥 Console everything being sent
      console.log("===== Sending Pigeon Data =====");
      console.log("Data JSON (with remaining images):", dataToSend);
      console.log(
        "New files:",
        newFiles.map((f) => f.name)
      );
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("===== End of Data =====");

      if (pigeonData?._id) {
        await updatePigeon({ id: pigeonData._id, formData, token }).unwrap();
        message.success("Pigeon updated successfully!");
      } else {
        await addPigeon({ formData, token }).unwrap();
        message.success("Pigeon added successfully!");
      }

      form.resetFields();
      setSelected({ color: null, pattern: null });
      setShowResults(false);
      setRaceResults([]);
      onCancel();
    } catch (err) {
      console.error(err);
      message.error(
        "Failed to save pigeon. " + (err?.data?.message || err.message)
      );
    }
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelected({ color: null, pattern: null });
      setShowResults(false);
      setRaceResults([]);
    }
  }, [visible, form]);

  const addRaceResult = () => {
    setRaceResults((prev) => [
      ...prev,
      { name: "", date: "", distance: "", total: "", place: "" },
    ]);
  };

  const handleRaceChange = (index, field, value) => {
    const updated = [...raceResults];
    updated[index][field] = value;
    setRaceResults(updated);
  };

  const removeRaceResult = (index) => {
    const updated = [...raceResults];
    updated.splice(index, 1);
    setRaceResults(updated);
  };

  return (
    <Modal
      title={pigeonData ? "Edit Pigeon" : "Add New Pigeon"}
      open={visible}
      onCancel={() => {
        form.resetFields();
        setSelected({ color: null, pattern: null });
        setShowResults(false);
        setRaceResults([]);
        onCancel();
      }}
      width={1200}
      footer={[
        <Button
          key="cancel"
          onClick={onCancel}
          disabled={isAdding || isUpdating}
        >
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          loading={isAdding || isUpdating} // 🔥 spinner here
        >
          {pigeonData ? "Update Pigeon" : "Add New Pigeon"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="mb-6">
        <Row gutter={[30, 20]}>
          {/* existing form items here ... */}
          {/* Ring Number */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Ring Number"
              name="ringNumber"
              rules={[{ required: true }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Ring Number"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Name */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Name"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Country */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: "Please select country" }]}
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Country"
                className="custom-select-ant-modal"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {countries.map((country, index) => (
                  <Option key={index} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Birth Year */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Birth Year"
              name="birthYear"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Birth Year"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Story */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Your Story"
              name="story"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Story"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Color & Pattern */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Color & Pattern"
              name="colorPattern"
              rules={[
                { required: true, message: "Please select color & pattern" },
              ]}
              className="custom-form-item-ant-select"
            >
              <Dropdown overlay={menu} trigger={["click"]}>
                <Button
                  className="custom-select-ant-modal !h-[40px] flex items-center justify-start"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    color: selected.color && selected.pattern ? "#000" : "#999",
                  }}
                >
                  {selected.color && selected.pattern
                    ? `${selected.color} & ${selected.pattern}`
                    : "Select Color & Pattern"}
                </Button>
              </Dropdown>
            </Form.Item>
          </Col>

          {/* Gender */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Gender"
              name="gender"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Gender"
                className="custom-select-ant-modal"
              >
                <Option value="Cock">Cock</Option>
                <Option value="Hen">Hen</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Breeder */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Breeder"
              name="breeder"
              rules={[{ required: true, message: "Please select a breeder" }]}
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder={
                  breedersLoading ? "Loading breeders..." : "Select Breeder"
                }
                className="custom-select-ant-modal"
                loading={breedersLoading}
                showSearch
                optionFilterProp="children"
              >
                {breederNames.map((b) => (
                  <Option key={b._id} value={b._id}>
                    {b.breederName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Breeder Rating */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Breeder Rating"
              name="breederRating"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Rating"
                className="custom-select-ant-modal"
              >
                {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((v) => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Status */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Status"
              name="status"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Status"
                className="custom-select-ant-modal"
              >
                <Option value="racing">Racing</Option>
                <Option value="breeding">Breeding</Option>
                <Option value="lost">Lost</Option>
                <Option value="sold">Sold</Option>
                <Option value="retired">Retired</Option>
                <Option value="deceased">Deceased</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Location */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Location"
              name="location"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Location"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Racing Rating */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Racing Rating"
              name="racingRating"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Rating"
                className="custom-select-ant-modal"
              >
                {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((v) => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Verification */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Verification"
              name="verification"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Verification"
                className="custom-select-ant-modal"
              >
                <Option value="verified">Verified</Option>
                <Option value="notverified">Not Verified</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Iconic */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Iconic"
              name="iconic"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Iconic"
                className="custom-select-ant-modal"
              >
                <Option value="yes">Yes</Option>
                <Option value="no">No</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Iconic Score */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Iconic Score"
              name="iconicScore"
              rules={[
                { required: true, message: "Please select iconic score" },
              ]}
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Iconic Score"
                className="custom-select-ant-modal"
              >
                {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((v) => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Father */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Father Ring Number"
              name="fatherRingId"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Father Ring Number"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Mother */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Mother Ring Number"
              name="motherRingId"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Mother Ring Number"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Render Race Results */}
          {raceResults.map((race, index) => (
            <Col xs={24} key={index} className="mb-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <strong>Race Result #{index + 1}</strong>
                <Button
                  type="text"
                  danger
                  onClick={() => removeRaceResult(index)}
                >
                  Remove
                </Button>
              </div>
              <Row gutter={[30, 0]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Race Name">
                    <Input
                      placeholder="Race Name"
                      value={race.name}
                      onChange={(e) =>
                        handleRaceChange(index, "name", e.target.value)
                      }
                      className="custom-input-ant-modal"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Date">
                    <Input
                      placeholder="Date"
                      type="date"
                      value={race.date}
                      onChange={(e) =>
                        handleRaceChange(index, "date", e.target.value)
                      }
                      className="custom-input-ant-modal"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Distance">
                    <Input
                      placeholder="Distance"
                      value={race.distance}
                      onChange={(e) =>
                        handleRaceChange(index, "distance", e.target.value)
                      }
                      className="custom-input-ant-modal"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Total Birds">
                    <Input
                      placeholder="Total Birds"
                      type="number"
                      value={race.total}
                      onChange={(e) =>
                        handleRaceChange(index, "total", e.target.value)
                      }
                      className="custom-input-ant-modal"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Place / Position">
                    <Input
                      placeholder="Place/Position"
                      value={race.place}
                      onChange={(e) =>
                        handleRaceChange(index, "place", e.target.value)
                      }
                      className="custom-input-ant-modal"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          ))}

          {/* Add Race Results Button */}
          <Col xs={24}>
            <Button
              type="dashed"
              onClick={addRaceResult}
              className="mb-0 mt-0"
              style={{ width: "100%" }}
            >
              + Add Race Results
            </Button>
          </Col>

          {/* Pigeon Photos */}
          <Form.Item
            label="Pigeon Photos"
            name="photos"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload
              name="files"
              listType="picture-card"
              fileList={form.getFieldValue("photos")}
              onPreview={(file) => window.open(getImageUrl(file.url), "_blank")}
              onChange={({ fileList }) =>
                form.setFieldsValue({ photos: fileList })
              }
              multiple
              className="border rounded-lg p-3 border-[#071952]"
              maxCount={5}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
              beforeUpload={(file) => {
                const isJpgOrPng =
                  file.type === "image/jpeg" || file.type === "image/png";
                if (!isJpgOrPng)
                  message.error("You can only upload JPG/PNG files!");
                return false; // prevent auto upload
              }}
              accept=".jpg,.jpeg,.png"
            >
              <div
                style={{
                  width: 102,
                  height: 102,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddNewPigeon;
