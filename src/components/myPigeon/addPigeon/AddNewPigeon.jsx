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
import { useParams } from "react-router-dom";
import {
  useAddPigeonMutation,
  useGetBreederNamesQuery,
  useGetPigeonSearchQuery,
  useUpdatePigeonMutation,
  useGetSinglePigeonQuery,
} from "../../../redux/apiSlices/mypigeonSlice";
import { getImageUrl } from "../../common/imageUrl";
import { getNames } from "country-list";
import { useNavigate } from "react-router-dom";

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

const AddNewPigeon = ({ visible, onSave }) => {
  const [form] = Form.useForm();
  const [selected, setSelected] = useState({ color: null, pattern: null });
  const [addPigeon, { isLoading: isAdding }] = useAddPigeonMutation();
  const [showResults, setShowResults] = useState(false);
  const [raceResults, setRaceResults] = useState([]);
  const countries = getNames();
  const navigate = useNavigate();
  const [viewPigeonId, setViewPigeonId] = useState(null);
  const { id } = useParams();
  const [showAddButton, setShowAddButton] = useState(true); // initial state: visible
  const [showRaceResults, setShowRaceResults] = useState(false); // Switch state
  const currentYear = new Date().getFullYear(); // Get the current year

  console.log("id", id);

  // 🔎 Parents
  const [fatherSearch, setFatherSearch] = useState("");
  const [motherSearch, setMotherSearch] = useState("");
  const { data: fatherOptions = [], isLoading: fatherLoading } =
    useGetPigeonSearchQuery(fatherSearch, { skip: !fatherSearch });
  const { data: motherOptions = [], isLoading: motherLoading } =
    useGetPigeonSearchQuery(motherSearch, { skip: !motherSearch });

  //   const [editingPigeonId, setEditingPigeonId] = useState(null);
  const { data: editingPigeonData } = useGetSinglePigeonQuery(id, {
    skip: !id, // don't fetch until ID is set
  });

  const pigeonData = editingPigeonData?.data;

  console.log(pigeonData);
  console.log("ring NUmber", pigeonData?.ringNumber);

  // 📷 Images (File objects to send)
  const [photos, setPhotos] = useState({
    pigeonPhoto: null,
    eyePhoto: null,
    ownershipPhoto: null,
    pedigreePhoto: null,
    DNAPhoto: null,
  });

  // 📷 Upload component fileLists (controlled previews)
  const [fileLists, setFileLists] = useState({
    pigeonPhoto: [],
    eyePhoto: [],
    ownershipPhoto: [],
    pedigreePhoto: [],
    DNAPhoto: [],
  });

  // Convert a URL into antd Upload item
  const toUploadItem = (url) =>
    url
      ? [
          {
            uid: `${Math.random()}`,
            name: String(url).split("/").pop() || "image",
            status: "done",
            url: String(url).startsWith("http") ? url : getImageUrl(url),
          },
        ]
      : [];

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
            date: r.date ? r.date.split("T")[0] : "",
          })) || []
        );

        form.setFieldsValue({
          ...pigeonData,
          ringNumber: pigeonData.ringNumber,
          fatherRingId: pigeonData.fatherRingId?.ringNumber || "",
          motherRingId: pigeonData.motherRingId?.ringNumber || "",
          colorPattern: { color, pattern },
          verification: pigeonData.verified ? "verified" : "notverified",
          iconic: pigeonData.iconic ? "yes" : "no",
          breeder: pigeonData.breeder?._id || pigeonData.breeder,
        });

        // Pre-fill uploads
        setFileLists({
          pigeonPhoto: toUploadItem(
            pigeonData.pigeonPhotoUrl || pigeonData.pigeonPhoto
          ),
          eyePhoto: toUploadItem(pigeonData.eyePhotoUrl || pigeonData.eyePhoto),
          ownershipPhoto: toUploadItem(
            pigeonData.ownershipPhotoUrl || pigeonData.ownershipPhoto
          ),
          pedigreePhoto: toUploadItem(
            pigeonData.pedigreePhotoUrl || pigeonData.pedigreePhoto
          ),
          DNAPhoto: toUploadItem(pigeonData.DNAPhotoUrl || pigeonData.DNAPhoto),
        });
      } else {
        // reset on add new
        form.resetFields();
        setSelected({ color: null, pattern: null });
        setShowResults(false);
        setRaceResults([]);
        setPhotos({
          pigeonPhoto: null,
          eyePhoto: null,
          ownershipPhoto: null,
          pedigreePhoto: null,
          DNAPhoto: null,
        });
        setFileLists({
          pigeonPhoto: [],
          eyePhoto: [],
          ownershipPhoto: [],
          pedigreePhoto: [],
          DNAPhoto: [],
        });
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

      const combinedColor =
        values.colorPattern?.color && values.colorPattern?.pattern
          ? `${values.colorPattern.color} & ${values.colorPattern.pattern}`
          : values.colorPattern?.color || values.colorPattern?.pattern || "-";

      const filteredRaceResults = raceResults
        .filter((r) => r.name || r.date || r.distance || r.total || r.place)
        .map((r) => ({
          name: r.name || "",
          date: r.date || "",
          distance: r.distance || "",
          total: r.total ? Number(r.total) : 0,
          place: r.place || "",
        }));

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
        racherRating: values.racerRating,
        breederRating: values.breederRating,
        iconicScore: values.iconicScore,
        gender: values.gender,
        status: values.status,
        location: values.location,
        notes: values.notes || "",
        results:
          filteredRaceResults.length > 0 ? filteredRaceResults : undefined,
        verified: values.verification === "verified",
        iconic: values.iconic === "yes",
        fatherRingId: values.fatherRingId || "",
        motherRingId: values.motherRingId || "",
      };

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("data", JSON.stringify(dataToSend));

      // Append files
      if (photos.pigeonPhoto)
        formData.append("pigeonPhoto", photos.pigeonPhoto);
      if (photos.eyePhoto) formData.append("eyePhoto", photos.eyePhoto);
      if (photos.ownershipPhoto)
        formData.append("ownershipPhoto", photos.ownershipPhoto);
      if (photos.pedigreePhoto)
        formData.append("pedigreePhoto", photos.pedigreePhoto);
      if (photos.DNAPhoto) formData.append("DNAPhoto", photos.DNAPhoto);

      if (pigeonData?._id) {
        await updatePigeon({ id: pigeonData._id, formData, token }).unwrap();
        message.success("Pigeon updated successfully!");
      } else {
        await addPigeon({ formData, token }).unwrap();
        message.success("Pigeon added successfully!");
        navigate("/my-pigeon");
      }

      form.resetFields();
      setSelected({ color: null, pattern: null });
      setShowResults(false);
      setRaceResults([]);
      setPhotos({
        pigeonPhoto: null,
        eyePhoto: null,
        ownershipPhoto: null,
        pedigreePhoto: null,
        DNAPhoto: null,
      });
      setFileLists({
        pigeonPhoto: [],
        eyePhoto: [],
        ownershipPhoto: [],
        pedigreePhoto: [],
        DNAPhoto: [],
      });
      //   onCancel();
    } catch (err) {
      console.error(err);
      message.error(err?.data?.message || err.message);
    }
  };

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

  // ---------- Upload helpers ----------
  const uploadButton = (label) => (
    <div style={{ color: "#666" }}>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{label}</div>
    </div>
  );

  const commonUploadProps = (key) => ({
    listType: "picture-card",
    maxCount: 1,
    multiple: false,
    fileList: fileLists[key],
    showUploadList: { showPreviewIcon: true, showRemoveIcon: true },
    beforeUpload: (file) => {
      setPhotos((p) => ({ ...p, [key]: file }));
      const previewUrl = URL.createObjectURL(file);
      setFileLists((fl) => ({
        ...fl,
        [key]: [
          {
            uid: `${Math.random()}`,
            name: file.name,
            status: "done",
            url: previewUrl,
            originFileObj: file,
          },
        ],
      }));
      return false;
    },
    onRemove: () => {
      setPhotos((p) => ({ ...p, [key]: null }));
      setFileLists((fl) => ({ ...fl, [key]: [] }));
    },
    customRequest: ({ onSuccess }) => onSuccess && onSuccess(),
  });

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        className="mb-6 border rounded-lg border-primary px-[30px] py-[25px] mt-4"
      >
        <div className="flex justify-between mb-6">
          <div className="w-[60%] flex flex-col gap-4">
            <div className="flex justify-between gap-10 border p-6 rounded-lg">
              <div className="left flex w-full justify-start flex-col gap-4">
                <Form.Item
                  label="Ring Number"
                  name="ringNumber"
                  // rules={[{ required: true }]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Ring Number"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>

                <Form.Item
                  label="Choose a Country"
                  name="country"
                  // rules={[{ required: true, message: "Please select country" }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Country"
                    className="custom-select-ant-modal"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    allowClear // Adds the clear (cross) button
                  >
                    {countries.map((country, index) => (
                      <Option key={index} value={country}>
                        {country}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Short Information of the Pigeon */}
                <Form.Item
                  label="Short Information of the Pigeon"
                  name="shortInfo"
                  className="custom-form-item-ant"
                >
                  <Input.TextArea
                    placeholder="Enter short information about the pigeon"
                    className="custom-input-ant-modal custom-textarea-pigeon"
                  />
                </Form.Item>

                <Form.Item
                  label="Color & Pattern"
                  name="colorPattern"
                  // rules={[{ required: true, message: "Please select color & pattern" }]}
                  className="custom-form-item-ant-select custom-form-item-ant-select-pattern color-pattern-custom"
                >
                  <Dropdown overlay={menu} trigger={["click"]}>
                    <Button
                      className="custom-select-ant-modal !h-[40px] flex items-center justify-start"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        color:
                          selected.color && selected.pattern ? "#000" : "#999",
                      }}
                    >
                      {selected.color && selected.pattern
                        ? `${selected.color} & ${selected.pattern}`
                        : "Select Color & Pattern"}
                    </Button>
                  </Dropdown>
                </Form.Item>

                <Form.Item
                  label="Status"
                  name="status"
                  // rules={[{ required: true }]}
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

                <Form.Item
                  label="Racer Rating"
                  name="racerRating"
                  // rules={[{ required: true }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Racer Rating"
                    className="custom-select-ant-modal"
                  >
                    <Option value="Outstanding">Outstanding</Option>
                    <Option value="Excellent">Excellent</Option>
                    <Option value="Very Good">Very Good</Option>
                    <Option value="Good">Good</Option>
                    <Option value="Aboveaverage">Above Average</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Iconic"
                  name="iconic"
                  // rules={[{ required: true }]}
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

                <Form.Item
                  label="Verification"
                  name="verification"
                  // rules={[{ required: true }]}
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
              </div>

              <div className="right flex w-full justify-start flex-col gap-4">
                <Form.Item
                  label="Name"
                  name="name"
                  // rules={[{ required: true }]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Name"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>

                <Form.Item
                  label="Birth Year"
                  name="birthYear"
                  // rules={[{ required: true, message: "Please select birth year" }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Birth Year"
                    className="custom-select-ant-modal"
                    showSearch
                    allowClear // Enables the clear button (cross icon)
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      // Ensure option.children is treated as a string
                      String(option?.children)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value) => {
                      // You can handle clearing value here if necessary
                    }}
                  >
                    {/* Creating options from 1980 to the current year */}
                    {Array.from(
                      { length: currentYear - 1980 + 1 },
                      (_, index) => (
                        <Option key={1980 + index} value={1980 + index}>
                          {1980 + index}
                        </Option>
                      )
                    )}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Breeder"
                  name="breeder"
                  // rules={[{ required: true, message: "Please select a breeder" }]}
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

                <Form.Item
                  label="Breeder Rating"
                  name="breederRating"
                  // rules={[{ required: true }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Rating"
                    className="custom-select-ant-modal"
                    showSearch // Enable search functionality
                    allowClear // Enable the clear button (cross icon)
                    optionFilterProp="children" // Ensures search is done based on the option's children (i.e., the value)
                    filterOption={(input, option) =>
                      option?.children
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {Array.from({ length: 101 }, (_, i) => i).map((v) => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Gender"
                  name="gender"
                  // rules={[{ required: true }]}
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

                <Form.Item
                  label="Location"
                  name="location"
                  // rules={[{ required: true }]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Location"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>

                <Form.Item
                  label="Racing Rating"
                  name="racingRating"
                  // rules={[{ required: true }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Rating"
                    className="custom-select-ant-modal"
                    showSearch // Enable search functionality
                    allowClear // Enable the clear button (cross icon)
                    optionFilterProp="children" // Ensures search is done based on the option's children (i.e., the value)
                    filterOption={(input, option) =>
                      option?.children
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {Array.from({ length: 101 }, (_, i) => i).map((v) => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Iconic Score"
                  name="iconicScore"
                  // rules={[{ required: true, message: "Please select iconic score" }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Iconic Score"
                    className="custom-select-ant-modal"
                    showSearch // Enable search functionality
                    allowClear // Enable the clear button (cross icon)
                    optionFilterProp="children" // Ensures search is done based on the option's children (i.e., the value)
                    filterOption={(input, option) =>
                      option?.children
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {Array.from({ length: 101 }, (_, i) => i).map((v) => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            {/* Story */}
            <div>
              <Form.Item
                label="Notes"
                name="notes"
                className="custom-form-item-ant"
              >
                <Input.TextArea
                  placeholder="Additional notes about the pigeon"
                  className="custom-input-ant-modal custom-textarea-pigeon"
                />
              </Form.Item>
            </div>

            <div className="flex justify-between gap-10">
              {/* Father */}
              <div className="w-full">
                <Form.Item
                  label="Father Ring Number"
                  name="fatherRingId"
                  className="custom-form-item-ant-select"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Search by Father Ring Number"
                    className="custom-select-ant-modal"
                    filterOption={false}
                    onSearch={setFatherSearch}
                    loading={fatherLoading}
                    options={fatherOptions.map((p) => ({
                      label: p.ringNumber,
                      value: p.ringNumber,
                    }))}
                  />
                </Form.Item>
                <p className="text-gray-400 font-normal text-[12px] pt-1">
                  Enter a part of the ring or part of the name to search for the
                  Corresponding Pigeon
                </p>
              </div>

              {/* Mother */}
              <div className="w-full">
                <Form.Item
                  label="Mother Ring Number"
                  name="motherRingId"
                  className="custom-form-item-ant-select"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Search by Mother Ring Number"
                    className="custom-select-ant-modal"
                    filterOption={false}
                    onSearch={setMotherSearch}
                    loading={motherLoading}
                    options={motherOptions.map((p) => ({
                      label: p.ringNumber,
                      value: p.ringNumber,
                    }))}
                  />
                </Form.Item>
                <p className="text-gray-400 font-normal text-[12px] pt-1">
                  Enter a part of the ring or part of the name to search for the
                  Corresponding Pigeon
                </p>
              </div>
            </div>
          </div>

          <div className="w-[38%] flex flex-col gap-6 border p-4 rounded-lg">
            {/* ===== PIGEON PHOTOS ===== */}
            <div className="p-4 border rounded-lg flex flex-col">
              <p className="text-[16px] font-semibold mb-2">Pigeon Photos:</p>
              <div className="pb-2 overflow-x-auto">
                <Row
                  gutter={[10, 16]}
                  justify="start"
                  wrap={false}
                  className="flex-nowrap"
                >
                  <Col flex="none">
                    <Upload
                      className="custom-upload-ant"
                      {...commonUploadProps("pigeonPhoto")}
                    >
                      {fileLists.pigeonPhoto?.length
                        ? null
                        : uploadButton("Upload Pigeon Photo")}
                    </Upload>
                  </Col>

                  <Col flex="none">
                    <Upload
                      className="custom-upload-ant"
                      {...commonUploadProps("eyePhoto")}
                    >
                      {fileLists.eyePhoto?.length
                        ? null
                        : uploadButton("Upload Eye Photo")}
                    </Upload>
                  </Col>

                  <Col flex="none">
                    <Upload
                      className="custom-upload-ant"
                      {...commonUploadProps("ownershipPhoto")}
                    >
                      {fileLists.ownershipPhoto?.length
                        ? null
                        : uploadButton("Upload Ownership Card")}
                    </Upload>
                  </Col>

                  <Col flex="none">
                    <Upload
                      className="custom-upload-ant"
                      {...commonUploadProps("pedigreePhoto")}
                    >
                      {fileLists.pedigreePhoto?.length
                        ? null
                        : uploadButton("Upload Pedigree Photo")}
                    </Upload>
                  </Col>

                  <Col flex="none">
                    <Upload
                      className="custom-upload-ant"
                      {...commonUploadProps("DNAPhoto")}
                    >
                      {fileLists.DNAPhoto?.length
                        ? null
                        : uploadButton("Upload DNA Photo")}
                    </Upload>
                  </Col>
                </Row>
              </div>
            </div>

            {/* ===== RACE RESULTS ===== */}
            <div className=" flex flex-col min-h-[300px]">
              {/* ===== Switch to toggle entire race results column ===== */}
              <div className="mb-4 flex items-center gap-2">
                <Switch
                  checked={showRaceResults}
                  onChange={(checked) => setShowRaceResults(checked)}
                  size="small"
                />
                <span className="text-[16px] font-semibold">Pigeon Result</span>
              </div>

              {/* ===== Conditionally render race results + add button ===== */}
              {showRaceResults && (
                <div className=" gap-4">
                  {raceResults.map((race, index) => (
                    <div key={index}>
                      <div className="mb-2 flex justify-between items-center">
                        <strong>Race Result #{index + 1}</strong>
                        <Button
                          type="text"
                          danger
                          onClick={() => removeRaceResult(index)}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="flex flex-col mb-4 p-4 border rounded-lg">
                        <div className="flex justify-between gap-4">
                          <div className="left w-full">
                            <Form.Item label="Race Name">
                              <Input
                                placeholder="Race Name"
                                value={race.name}
                                onChange={(e) =>
                                  handleRaceChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="custom-input-ant-modal"
                              />
                            </Form.Item>
                            <Form.Item label="Date">
                              <Input
                                placeholder="Date"
                                type="date"
                                value={race.date}
                                onChange={(e) =>
                                  handleRaceChange(
                                    index,
                                    "date",
                                    e.target.value
                                  )
                                }
                                className="custom-input-ant-modal"
                              />
                            </Form.Item>
                          </div>
                          <div className="right w-full">
                            <Form.Item label="Distance">
                              <Input
                                placeholder="Distance"
                                value={race.distance}
                                onChange={(e) =>
                                  handleRaceChange(
                                    index,
                                    "distance",
                                    e.target.value
                                  )
                                }
                                className="custom-input-ant-modal"
                              />
                            </Form.Item>
                            <Form.Item label="Total Birds">
                              <Input
                                placeholder="Total Birds"
                                type="number"
                                value={race.total}
                                onChange={(e) =>
                                  handleRaceChange(
                                    index,
                                    "total",
                                    e.target.value
                                  )
                                }
                                className="custom-input-ant-modal"
                              />
                            </Form.Item>
                          </div>
                        </div>
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
                      </div>
                    </div>
                  ))}

                  {/* Add Race Results Button at the bottom */}
                  <Button
                    type="dashed"
                    onClick={addRaceResult}
                    style={{ width: "100%" }}
                  >
                    + Add Race Results
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Form>

      <div className="flex justify-end">
        {/* <Button
          key="cancel"
          onClick={onCancel}
          disabled={isAdding || isUpdating}
        >
          Cancel
        </Button> */}
        <Button
          onClick={() => navigate("/my-pigeon")} // Navigate on cancel
          disabled={isAdding || isUpdating}
          className="mr-[10px] bg-[#C33739] border border-[#C33739] text-white"
        >
          Cancel
        </Button>

        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          loading={isAdding || isUpdating}
        >
          {pigeonData ? "Update Pigeon" : "Add New Pigeon"}
        </Button>
      </div>
    </div>
  );
};

export default AddNewPigeon;
