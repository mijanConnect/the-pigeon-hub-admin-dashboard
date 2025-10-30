import {
  DeleteOutlined,
  DownOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Col,
  Dropdown,
  Form,
  Input,
  Menu,
  Row,
  Select,
  Upload,
  message,
} from "antd";
import { getNames } from "country-list";
import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddPigeonMutation,
  useGetBreederNamesQuery,
  useGetFatherMotherQuery,
  useGetSinglePigeonQuery,
  useUpdatePigeonMutation,
  useGetAllNameQuery,
} from "../../../redux/apiSlices/mypigeonSlice";
import { getImageUrl } from "../../common/imageUrl";

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

// Format color keys for display (replace underscores with spaces)
const formatColor = (c) => (typeof c === "string" ? c.replace(/_/g, " ") : c);

const AddNewPigeon = ({ onSave }) => {
  const [form] = Form.useForm();
  const [selected, setSelected] = useState({ color: null, pattern: null });
  const [addPigeon, { isLoading: isAdding }] = useAddPigeonMutation();
  const [showResults, setShowResults] = useState(false);
  const [raceResults, setRaceResults] = useState([]);
  const countries = getNames();
  const navigate = useNavigate();
  const [viewPigeonId, setViewPigeonId] = useState(null);
  const { id } = useParams();
  const [showAddButton, setShowAddButton] = useState(true);
  const [showRaceResults, setShowRaceResults] = useState(false);
  const [isIconicEnabled, setIsIconicEnabled] = useState(false);
  const currentYear = new Date().getFullYear();

  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [breederDisplay, setBreederDisplay] = useState("");
  const [fatherDisplay, setFatherDisplay] = useState("");
  const [motherDisplay, setMotherDisplay] = useState("");
  const [fatherSelected, setFatherSelected] = useState(null);
  const [motherSelected, setMotherSelected] = useState(null);

  const { data: allNames = [] } = useGetAllNameQuery();

  console.log(allNames);

  const validatePigeonName = (inputName) => {
    // Get all existing pigeon names from API
    const existingNames = allNames || [];

    // Normalize the input name (lowercase and trim)
    const normalizedInput = inputName?.trim().toLowerCase();
    const isDuplicate = existingNames.some(
      (pigeon) => pigeon.name?.trim().toLowerCase() === normalizedInput
    );

    return isDuplicate;
  };

  const handleChangePlace = (e) => {
    const v = e.target.value;
    setValue(v);
    try {
      form.setFieldsValue({ addresults: v });
    } catch (e) {
      /* ignore if form not ready */
    }
  };

  const handleChangePlace2 = (e) => {
    const v = e.target.value;
    setValue2(v);
    try {
      form.setFieldsValue({ shortInfo: v });
    } catch (e) {
      /* ignore if form not ready */
    }
  };

  // console.log("id", id);

  // 🔎 Parents
  const [fatherSearch, setFatherSearch] = useState("");
  const [motherSearch, setMotherSearch] = useState("");
  const { data: fatherOptions = [], isLoading: fatherLoading } =
    useGetFatherMotherQuery(fatherSearch, { skip: !fatherSearch });
  const { data: motherOptions = [], isLoading: motherLoading } =
    useGetFatherMotherQuery(motherSearch, { skip: !motherSearch });

  // Filter parent options by gender client-side to ensure only appropriate pigeons show
  const fatherOptionsFiltered = (fatherOptions || []).filter((p) => {
    const g = (p.gender || "").toString().toLowerCase();
    console.log(p.verified);
    return g === "cock"; // only show cocks for father
  });

  const motherOptionsFiltered = (motherOptions || []).filter((p) => {
    const g = (p.gender || "").toString().toLowerCase();
    return g === "hen"; // only show hens for mother
  });

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

  // Ref and state for horizontal photo scroller
  const photosRowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  // percentage top position for photo scroller arrows (customize as needed)
  const photosScrollTop = "50%"; // e.g. '45%', '50%'

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
            // If the URL points to a PDF file, provide a thumbnail data URL so
            // the Upload picture-card shows a PDF icon instead of a broken image.
            thumbUrl: String(url).toLowerCase().includes(".pdf")
              ? pdfThumbDataUrl(String(url).split("/").pop() || "PDF")
              : undefined,
          },
        ]
      : [];

  // Helper to generate a small SVG thumbnail data URL for a PDF file.
  // Label is used as a small filename hint inside the SVG.
  const pdfThumbDataUrl = (label = "PDF") => {
    const safeLabel = String(label).slice(0, 20);
    // SVG that resembles a document with a small file-text icon and red accent.
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='240' height='180' viewBox='0 0 120 90'>
        <rect width='120' height='90' rx='6' fill='%23ffffff' />
        <!-- document -->
        <path d='M12 6h60l30 30v48a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z' fill='%23f8fafc' stroke='%23e5e7eb' />
        <!-- folded corner -->
        <path d='M72 6v24h24' fill='%23fff' stroke='%23e5e7eb' />
        <!-- icon square -->
        <rect x='24' y='30' width='24' height='24' rx='3' fill='%23E33E3E' />
        <!-- small text lines -->
        <rect x='54' y='34' width='32' height='4' rx='2' fill='%23111' />
        <rect x='54' y='42' width='32' height='4' rx='2' fill='%234b5563' />
        <rect x='24' y='60' width='62' height='4' rx='2' fill='%23c7cdd3' />
        <text x='24' y='82' font-size='6' fill='%234b5563' font-family='Arial, Helvetica, sans-serif'>${safeLabel}</text>
      </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };

  useEffect(() => {
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
        shortInfo: pigeonData?.shortInfo || "",
        iconic: pigeonData.iconic ? "yes" : "no",
        breeder:
          pigeonData.breeder && typeof pigeonData.breeder === "object"
            ? pigeonData.breeder.breederName ||
              pigeonData.breeder.name ||
              pigeonData.breeder._id
            : pigeonData.breeder,
      });

      // Prefill addresults textarea when editing: join array into newline-delimited text
      try {
        if (Array.isArray(pigeonData.addresults)) {
          const joined = pigeonData.addresults.join("\n");
          form.setFieldsValue({ addresults: joined });
          setValue(joined);
        } else if (typeof pigeonData.addresults === "string") {
          form.setFieldsValue({ addresults: pigeonData.addresults });
          setValue(pigeonData.addresults);
        }
      } catch (e) {
        // ignore
      }

      // Set local controlled textarea state for shortInfo so the custom
      // placeholder and controlled Input.TextArea show the value when
      // editing. We also already set the form field above.
      setValue2(pigeonData?.shortInfo || "");

      // show father ring in the input (keep typed value if user entered)
      if (pigeonData.fatherRingId) {
        setFatherDisplay(
          pigeonData.fatherRingId?.ringNumber || pigeonData.fatherRingId || ""
        );
        // ensure the selected preview box shows on edit
        const maybeFather =
          typeof pigeonData.fatherRingId === "object"
            ? pigeonData.fatherRingId
            : { ringNumber: pigeonData.fatherRingId, name: "" };
        setFatherSelected(maybeFather);
      }

      // show breeder name/string in the input (resolve later when breederNames arrive)
      if (pigeonData.breeder) {
        if (typeof pigeonData.breeder === "object")
          setBreederDisplay(
            pigeonData.breeder.breederName || pigeonData.breeder.name || ""
          );
        else setBreederDisplay(pigeonData.breeder);
      }
      // show mother ring in the input (keep typed value if user entered)
      if (pigeonData.motherRingId) {
        setMotherDisplay(pigeonData.motherRingId?.ringNumber || "");
        // ensure the selected preview box shows on edit (mirror father behavior)
        const maybeMother =
          typeof pigeonData.motherRingId === "object"
            ? pigeonData.motherRingId
            : { ringNumber: pigeonData.motherRingId, name: "" };
        setMotherSelected(maybeMother);
      }

      // Set iconic enabled state based on existing data
      setIsIconicEnabled(pigeonData.iconic === true);

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
    } else if (id === undefined) {
      form.resetFields();
      setSelected({ color: null, pattern: null });
      setShowResults(false);
      setRaceResults([]);
      setIsIconicEnabled(false); // Reset iconic state for new pigeon
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
      // reset breederDisplay for new form
      setBreederDisplay("");
      // reset addresults textarea value
      setValue("");
      // reset shortInfo controlled textarea value
      setValue2("");
    }
  }, [pigeonData, id, form]);

  // Update scroll controls when fileLists change or on resize
  useEffect(() => {
    const el = photosRowRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [fileLists]);

  const handleClick = (color, pattern) => {
    setSelected({ color, pattern });
    form.setFieldsValue({ colorPattern: { color, pattern } });
  };

  const menu = (
    <Menu>
      {Object.entries(colorPatternMap).map(([color, patterns]) => (
        <Menu.SubMenu key={color} title={formatColor(color)}>
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

  useEffect(() => {
    try {
      const current = form.getFieldValue("breeder");
      if (current) {
        const match = breederNames.find(
          (b) => b._id === current || b.breederName === current
        );
        if (match) {
          // show the breeder name in the input; keep the form value as the name
          setBreederDisplay(match.breederName);
          form.setFieldsValue({ breeder: match.breederName });
        }
      }
    } catch (e) {
      // ignore
    }
  }, [breederNames]);

  // Resolve fatherRingId to display value when fatherOptions change (editing scenario)
  useEffect(() => {
    try {
      const current = form.getFieldValue("fatherRingId");
      if (current) {
        const match = fatherOptions.find(
          (p) => p.ringNumber === current || p.ringNumber === String(current)
        );
        if (match) {
          setFatherDisplay(match.ringNumber);
          setFatherSelected(match);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [motherOptions]);

  // Resolve motherRingId to display value when motherOptions change (editing scenario)
  useEffect(() => {
    try {
      const current = form.getFieldValue("motherRingId");
      if (current) {
        const match = motherOptions.find(
          (p) => p.ringNumber === current || p.ringNumber === String(current)
        );
        if (match) {
          setMotherDisplay(match.ringNumber);
          setMotherSelected(match);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [fatherOptions]);

  // NOTE: we sync breederDisplay via Form's onValuesChange below instead of subscribing.

  const [updatePigeon, { isLoading: isUpdating }] = useUpdatePigeonMutation();

  // Handle iconic status change to enable/disable iconic score
  const handleIconicChange = (value) => {
    const enabled = value === "yes";
    setIsIconicEnabled(enabled);

    // Clear iconic score if iconic is disabled
    if (!enabled) {
      form.setFieldsValue({ iconicScore: undefined });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const combinedColor =
        values.colorPattern?.color && values.colorPattern?.pattern
          ? `${values.colorPattern.color} ${values.colorPattern.pattern}`
          : values.colorPattern?.color || values.colorPattern?.pattern;

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
        addresults: values.addresults
          ? values.addresults
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
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
        navigate("/my-pigeon");
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
      // If validation failed, scroll to the first invalid field and let AntD show field errors.
      if (
        err &&
        err.errorFields &&
        Array.isArray(err.errorFields) &&
        err.errorFields.length > 0
      ) {
        const first = err.errorFields[0];
        const namePath = first && first.name ? first.name : null;
        if (namePath) {
          try {
            form.scrollToField(namePath);
          } catch (e) {
            // ignore scroll errors
          }
        }
        // don't log the full validation object to console; field errors are visible on the form
        return;
      }

      // Non-validation error: log and show message
      console.error(err);
      message.error(
        err?.data?.message || err.message || "Something went wrong"
      );
    }
  };

  const handleSaveAndCreateAnother = async () => {
    try {
      const values = await form.validateFields();

      const combinedColor =
        values.colorPattern?.color && values.colorPattern?.pattern
          ? `${values.colorPattern.color} ${values.colorPattern.pattern}`
          : values.colorPattern?.color || values.colorPattern?.pattern;

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
        addresults: values.addresults
          ? values.addresults
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
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

      // Always add a new pigeon (do not call update)
      await addPigeon({ formData, token }).unwrap();
      message.success(
        "Pigeon added successfully! You can add another one now."
      );

      // Reset form & local state to blank for next entry
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
      setBreederDisplay("");
      setValue("");
      setValue2("");
      // Scroll to top so the form is visible for the next entry
      if (typeof window !== "undefined" && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      // clear editing context if any
      try {
        // if URL had an id param, don't navigate; just clear local editing state
        // (we don't mutate route here)
      } catch (e) {
        // ignore
      }
    } catch (err) {
      // If validation failed, scroll to the first invalid field and let AntD show field errors.
      if (
        err &&
        err.errorFields &&
        Array.isArray(err.errorFields) &&
        err.errorFields.length > 0
      ) {
        const first = err.errorFields[0];
        const namePath = first && first.name ? first.name : null;
        if (namePath) {
          try {
            form.scrollToField(namePath);
          } catch (e) {
            // ignore scroll errors
          }
        }
        return;
      }

      // Non-validation error: log and show message
      console.error(err);
      message.error(
        err?.data?.message || err.message || "Something went wrong"
      );
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
    <div style={{ color: "#666", padding: "8px", fontSize: "11px" }}>
      <PlusOutlined />
      <div style={{ marginTop: 2 }}>{label}</div>
    </div>
  );

  const commonUploadProps = (key) => ({
    listType: "picture-card",
    maxCount: 1,
    multiple: false,
    fileList: fileLists[key],
    showUploadList: { showPreviewIcon: true, showRemoveIcon: true },
    // Custom renderer for upload list items so we can show a proper PDF
    // icon (inline SVG) instead of a black/empty thumbnail when the item
    // is a PDF. The actions object gives us preview/remove handlers.
    itemRender: (originNode, file, fileListRender, actions) => {
      try {
        const isPdfFile =
          (file && file.type === "application/pdf") ||
          (file &&
            file.name &&
            String(file.name).toLowerCase().endsWith(".pdf")) ||
          (file && file.thumbUrl && String(file.thumbUrl).includes("svg"));

        if (!isPdfFile) return originNode;

        // Use Ant's preview/remove actions
        const { preview, remove } = actions || {};

        return (
          <div
            className="ant-upload-list-item ant-upload-list-item-done"
            style={{ position: "relative", width: "100%", height: "100%" }}
          >
            <div
              className="ant-upload-list-item-info"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="ant-upload-list-item-thumbnail"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Inline SVG file icon (red accent) to avoid relying on img rendering */}
                <FileText size={70} color="#E33E3E" />
              </span>

              {/* Overlay actions (preview/remove) positioned top-right.
                  Use Ant Design's actions markup (ul > li) so the styling and
                  hover behavior match image thumbnails. */}
              <ul
                className="ant-upload-list-item-actions"
                style={{ position: "absolute", right: 6, top: 6 }}
              >
                {preview && (
                  <li
                    className="ant-upload-list-item-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        preview(file);
                      } catch (err) {
                        const src =
                          file.url ||
                          file.thumbUrl ||
                          (file.originFileObj &&
                            URL.createObjectURL(file.originFileObj));
                        if (src) window.open(src, "_blank");
                      }
                    }}
                  >
                    {/* <span className="ant-upload-list-item-action-btn"><EyeOutlined /></span> */}
                  </li>
                )}

                {remove && (
                  <li
                    className="ant-upload-list-item-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(file);
                    }}
                  >
                    <span className="ant-upload-list-item-action-btn">
                      <DeleteOutlined />
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        );
      } catch (e) {
        // if anything goes wrong, fall back to Ant origin node
        return originNode;
      }
    },
    onPreview: async (file) => {
      // Open file in a new tab. Works for images and PDFs.
      let src = file.url || file.thumbUrl;
      if (!src && file.originFileObj) {
        src = URL.createObjectURL(file.originFileObj);
      }
      if (src) {
        window.open(src, "_blank");
      } else {
        message.error("Preview not available");
      }
    },
    beforeUpload: (file) => {
      // Validate file type
      const imageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/heic",
        "image/heif",
      ];
      // Allow PDFs for pedigree and DNA uploads
      const allowPdf = key === "pedigreePhoto" || key === "DNAPhoto";
      const allowedTypes = allowPdf
        ? [...imageTypes, "application/pdf"]
        : imageTypes;
      const maxBytes = 10 * 1024 * 1024; // 10 MB

      if (!allowedTypes.includes(file.type)) {
        const msg = allowPdf
          ? "Only JPEG, JPG, PNG, HEIC/HEIF or PDF files are allowed."
          : "Only JPEG, JPG, PNG or HEIC/HEIF files are allowed.";
        message.error(msg);
        // Prevent adding to upload list
        return Upload.LIST_IGNORE;
      }

      if (file.size > maxBytes) {
        message.error("File must be less than 10MB.");
        return Upload.LIST_IGNORE;
      }

      // Valid file — create preview and set into controlled state
      setPhotos((p) => ({ ...p, [key]: file }));
      // For images we can use an object URL for preview. For PDFs we create
      // a small SVG data URL so the Upload UI shows an icon-like thumbnail and
      // the remove/preview overlays still work the same as for images.
      const isPdf =
        file.type === "application/pdf" ||
        String(file.name || "")
          .toLowerCase()
          .endsWith(".pdf");
      const previewUrl = isPdf
        ? pdfThumbDataUrl(file.name || "PDF")
        : URL.createObjectURL(file);
      setFileLists((fl) => ({
        ...fl,
        [key]: [
          {
            uid: `${Math.random()}`,
            name: file.name,
            status: "done",
            url: isPdf ? undefined : previewUrl,
            thumbUrl: previewUrl,
            originFileObj: file,
          },
        ],
      }));

      // Return false to prevent automatic upload (we handle uploads manually)
      return false;
    },
    onRemove: () => {
      setPhotos((p) => ({ ...p, [key]: null }));
      setFileLists((fl) => {
        const existing = fl[key] && fl[key][0];
        if (existing && existing.url && existing.url.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(existing.url);
          } catch (e) {
            // ignore
          }
        }
        return { ...fl, [key]: [] };
      });
    },
    customRequest: ({ onSuccess }) => onSuccess && onSuccess(),
  });

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        className="mb-6 border rounded-lg border-primary px-[30px] py-[25px] mt-4"
        onValuesChange={(changedValues, allValues) => {
          if (Object.prototype.hasOwnProperty.call(changedValues, "breeder")) {
            const current = changedValues.breeder;
            if (typeof current === "string") {
              const match = breederNames.find(
                (b) => b._id === current || b.breederName === current
              );
              setBreederDisplay(match ? match.breederName : current || "");
            } else {
              setBreederDisplay("");
            }
          }
        }}
      >
        <div className="add-pigeon-row flex justify-between mb-6">
          <style>{`@media (max-width: 1179px) { .add-pigeon-row{flex-direction:column !important;} .add-pigeon-row .left-column, .add-pigeon-row .right-column{width:100% !important;}
            .add-pigeon-row .right-column{margin-top:16px;}
          }`}</style>
          <div className="left-column w-[60%] flex flex-col gap-4">
            <div className="flex justify-between gap-10 border p-6 rounded-lg">
              <div className="left flex w-full justify-start flex-col gap-4">
                <Form.Item
                  label="Ring Number"
                  name="ringNumber"
                  rules={[{ required: true }]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Ring Number"
                    className="custom-input-ant-modal"
                    // required
                  />
                </Form.Item>

                <Form.Item
                  label="Country"
                  name="country"
                  rules={[{ required: true, message: "Please select Country" }]}
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
                  label="Story Line"
                  name="shortInfo"
                  className="custom-form-item-ant"
                >
                  <div style={{ position: "relative" }}>
                    {/* Custom placeholder simulation */}
                    {!value2 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "10px",
                          color: "#999",
                          pointerEvents: "none",
                          fontSize: "13px",
                          lineHeight: "19px",
                        }}
                      >
                        For example:
                        <br />
                        Son of Burj Khalifa
                        <br />
                        Winner of the Dubai OLR
                        <br />
                        5 times 1st price winner
                        <br />
                        Bought for USD 50,000
                      </div>
                    )}

                    {/* Actual TextArea */}
                    <Input.TextArea
                      placeholder=""
                      className="custom-input-ant-modal custom-textarea-pigeon"
                      style={{ paddingTop: "40px" }} // Adjust padding to prevent overlapping text
                      value={value2}
                      onChange={handleChangePlace2} // Track the input value
                    />
                  </div>
                  {/* <Input.TextArea
                    placeholder="Enter short information about the pigeon"
                    className="custom-input-ant-modal custom-textarea-pigeon"
                  /> */}
                </Form.Item>

                <Form.Item
                  label="Loft Name"
                  name="breeder"
                  // rules={[{ required: true, message: "Please select a breeder" }]}
                  className="custom-form-item-ant-select"
                >
                  <AutoComplete
                    options={breederNames.map((b) => ({
                      value: b.breederName,
                      label: b.breederName,
                      id: b._id,
                    }))}
                    placeholder={
                      breedersLoading
                        ? "Loading Lofts..."
                        : "Type or Select Loft Name"
                    }
                    className="custom-select-ant-modal"
                    value={breederDisplay}
                    filterOption={(inputValue, option) =>
                      option.value
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    }
                    onSelect={(value, option) => {
                      const selected = breederNames.find(
                        (b) => b.breederName === value || b._id === option?.id
                      );
                      if (selected) {
                        form.setFieldsValue({ breeder: selected.breederName });
                        setBreederDisplay(selected.breederName);
                      } else {
                        form.setFieldsValue({ breeder: value });
                        setBreederDisplay(value);
                      }
                    }}
                    onChange={(val) => {
                      form.setFieldsValue({ breeder: val });
                      setBreederDisplay(val);
                    }}
                    onBlur={() => {
                      try {
                        const current = form.getFieldValue("breeder");
                        if (current && typeof current === "string")
                          setBreederDisplay(current);
                      } catch (e) {
                        // ignore
                      }
                    }}
                    allowClear
                    onClear={() => {
                      form.setFieldsValue({ breeder: undefined });
                      setBreederDisplay("");
                    }}
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
                      className="custom-select-ant-modal !h-[40px] flex items-center justify-between"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        color:
                          selected.color && selected.pattern ? "#000" : "#999",
                      }}
                    >
                      <span>
                        {selected.color && selected.pattern
                          ? `${formatColor(selected.color)} ${selected.pattern}`
                          : "Select Color & Pattern"}
                      </span>
                      <DownOutlined className="text-primary" />
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
                    <Option value="Racing">Racing</Option>
                    <Option value="Breeding">Breeding</Option>
                    <Option value="Lost">Lost</Option>
                    <Option value="Sold">Sold</Option>
                    <Option value="Retired">Retired</Option>
                    <Option value="Deceased">Deceased</Option>
                  </Select>
                </Form.Item>

                {/* <Form.Item
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
                </Form.Item> */}

                <Form.Item
                  label="Iconic"
                  name="iconic"
                  // rules={[{ required: true }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Iconic"
                    className="custom-select-ant-modal"
                    onChange={handleIconicChange}
                  >
                    <Option value="yes">Yes</Option>
                    <Option value="no">No</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Iconic Score"
                  name="iconicScore"
                  rules={[
                    {
                      required: isIconicEnabled,
                      message:
                        "Please select iconic score when iconic is enabled",
                    },
                  ]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder={
                      isIconicEnabled ? "Select Score" : "Select Score"
                    }
                    className="custom-select-ant-modal"
                    disabled={!isIconicEnabled}
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
                    {Array.from({ length: 99 }, (_, i) => 99 - i).map((v) => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="right flex w-full justify-start flex-col gap-4">
                {/* <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true }]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Name"
                    className="custom-input-ant-modal"
                    // required
                  />
                </Form.Item> */}

                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter a name" },
                    {
                      validator: (_, value) => {
                        const existingNames = allNames || [];
                        const normalizedInput = value?.trim().toLowerCase();
                        const isDuplicate = existingNames.some(
                          (pigeon) =>
                            pigeon.name?.trim().toLowerCase() ===
                            normalizedInput
                        );

                        if (isDuplicate) {
                          return Promise.reject(
                            new Error(
                              "This pigeon is already registered in our database."
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
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
                  rules={[
                    { required: true, message: "Please select Birth Year" },
                  ]}
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
                    {/* Creating options from 1927 to the current year */}
                    {Array.from(
                      { length: currentYear + 2 - 1927 + 1 }, // Same logic for generating the range
                      (_, index) => currentYear + 2 - index // Reverse the order by subtracting index
                    ).map((v) => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Pigeon Results"
                  name="addresults"
                  className="custom-form-item-ant"
                >
                  <div style={{ position: "relative" }}>
                    {/* Custom placeholder simulation */}
                    {!value && (
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "10px",
                          color: "#999",
                          pointerEvents: "none",
                          fontSize: "13px",
                          lineHeight: "19px",
                        }}
                      >
                        For example:
                        <br />
                        1st/828p Quiévrain 108km
                        <br />
                        4th/3265p Melun 287km
                        <br />
                        6th/3418p HotSpot 6 Dubai OLR
                      </div>
                    )}

                    {/* Actual TextArea */}
                    <Input.TextArea
                      placeholder=""
                      className="custom-input-ant-modal custom-textarea-pigeon2"
                      style={{ paddingTop: "40px" }} // Adjust padding to prevent overlapping text
                      value={value}
                      onChange={handleChangePlace} // Track the input value
                    />
                  </div>
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
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {Array.from({ length: 99 }, (_, i) => 99 - i).map((v) => (
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
                    <Option value="Unspecified">Unspecified</Option>
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
                    {Array.from({ length: 99 }, (_, i) => 99 - i).map((v) => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
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
                  <AutoComplete
                    options={fatherOptionsFiltered.map((p) => ({
                      value: p.ringNumber,
                      label: `${p.ringNumber} (${p.name || "Unknown"})`,
                      data: p,
                    }))}
                    placeholder="Search by Father Ring No. or Name"
                    className="custom-select-ant-modal"
                    onSearch={setFatherSearch}
                    value={fatherDisplay}
                    filterOption={(inputValue, option) => {
                      const q = String(inputValue).toLowerCase();
                      const ring = String(option.value || "").toLowerCase();
                      const label = String(option.label || "").toLowerCase();
                      // match ring number or name
                      return ring.includes(q) || label.includes(q);
                    }}
                    onSelect={(value, option) => {
                      // when selecting suggestion, store selected ring number and selected pigeon data
                      form.setFieldsValue({ fatherRingId: value });
                      setFatherDisplay(value);
                      // option may include the original data under option.data
                      setFatherSelected(
                        option?.data ||
                          fatherOptions.find(
                            (p) => String(p.ringNumber) === String(value)
                          ) ||
                          null
                      );
                    }}
                    onChange={(val) => {
                      // keep typed value in field and form
                      form.setFieldsValue({ fatherRingId: val });
                      setFatherDisplay(val);
                      // clear selected when user types a custom value
                      setFatherSelected(null);
                    }}
                    onBlur={() => {
                      try {
                        const current = form.getFieldValue("fatherRingId");
                        if (current && typeof current === "string")
                          setFatherDisplay(current);
                      } catch (e) {
                        // ignore
                      }
                    }}
                    allowClear
                    onClear={() => {
                      form.setFieldsValue({ fatherRingId: undefined });
                      setFatherDisplay("");
                      setFatherSelected(null);
                    }}
                  />
                </Form.Item>
                <p className="text-gray-400 font-normal text-[12px] pt-1">
                  Enter a part of the ring or part of the name to search for the
                  Corresponding Pigeon
                </p>
                {fatherSelected && (
                  <div className="mt-2 p-2 bg-gray-50 border rounded text-sm">
                    {/* <strong>Selected Father:</strong> */}
                    <div>
                      <div className="flex gap-1">
                        <p className="font-semibold">Ring Number:</p>
                        <p>{fatherSelected.ringNumber}</p>
                      </div>
                      <div className="flex gap-1">
                        <p className="font-semibold">Name:</p>
                        <p>{fatherSelected.name || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full">
                <Form.Item
                  label="Mother Ring Number"
                  name="motherRingId"
                  className="custom-form-item-ant-select"
                >
                  <AutoComplete
                    options={motherOptionsFiltered.map((p) => ({
                      value: p.ringNumber,
                      label: `${p.ringNumber} (${p.name || "Unknown"})`,
                      data: p,
                    }))}
                    placeholder="Search by Mother Ring No. or Name"
                    className="custom-select-ant-modal"
                    onSearch={setMotherSearch}
                    value={motherDisplay}
                    filterOption={(inputValue, option) => {
                      const q = String(inputValue).toLowerCase();
                      const ring = String(option.value || "").toLowerCase();
                      const label = String(option.label || "").toLowerCase();
                      // match ring number or name
                      return ring.includes(q) || label.includes(q);
                    }}
                    onSelect={(value, option) => {
                      // when selecting suggestion, store selected ring number and selected pigeon data
                      form.setFieldsValue({ motherRingId: value });
                      setMotherDisplay(value);
                      // option may include the original data under option.data
                      setMotherSelected(
                        option?.data ||
                          motherOptions.find(
                            (p) => String(p.ringNumber) === String(value)
                          ) ||
                          null
                      );
                    }}
                    onChange={(val) => {
                      // keep typed value in field and form
                      form.setFieldsValue({ motherRingId: val });
                      setMotherDisplay(val);
                      // clear selected when user types a custom value
                      setMotherSelected(null);
                    }}
                    onBlur={() => {
                      try {
                        const current = form.getFieldValue("motherRingId");
                        if (current && typeof current === "string")
                          setMotherDisplay(current);
                      } catch (e) {
                        // ignore
                      }
                    }}
                    allowClear
                    onClear={() => {
                      form.setFieldsValue({ motherRingId: undefined });
                      setMotherDisplay("");
                      setMotherSelected(null);
                    }}
                  />
                </Form.Item>
                <p className="text-gray-400 font-normal text-[12px] pt-1">
                  Enter a part of the ring or part of the name to search for the
                  Corresponding Pigeon
                </p>
                {motherSelected && (
                  <div className="mt-2 p-2 bg-gray-50 border rounded text-sm">
                    {/* <strong>Selected Mother:</strong> */}
                    <div>
                      <div className="flex gap-1">
                        <p className="font-semibold">Ring Number:</p>
                        <p>{motherSelected.ringNumber}</p>
                      </div>
                      <div className="flex gap-1">
                        <p className="font-semibold">Name:</p>
                        <p>{motherSelected.name || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mother */}
              {/* <div className="w-full">
                <Form.Item
                  label="Mother Ring Number"
                  name="motherRingId"
                  className="custom-form-item-ant-select"
                >
                  <AutoComplete
                    options={motherOptionsFiltered.map((p) => ({
                      value: p.ringNumber,
                      label: `${p.ringNumber} (${p.name || "Unknown"})`,
                      data: p,
                    }))}
                    placeholder="Search by Mother Ring No. or Name"
                    className="custom-select-ant-modal"
                    onSearch={setMotherSearch}
                    value={motherDisplay}
                    filterOption={(inputValue, option) => {
                      const q = String(inputValue).toLowerCase();
                      const ring = String(option.value || "").toLowerCase();
                      const label = String(option.label || "").toLowerCase();
                      return ring.includes(q) || label.includes(q);
                    }}
                    onSelect={(value, option) => {
                      form.setFieldsValue({ motherRingId: value });
                      setMotherDisplay(value);
                      setMotherSelected(
                        option?.data ||
                          motherOptions.find(
                            (p) => String(p.ringNumber) === String(value)
                          ) ||
                          null
                      );
                    }}
                    onChange={(val) => {
                      form.setFieldsValue({ motherRingId: val });
                      setMotherDisplay(val);
                      setMotherSelected(null);
                    }}
                    onBlur={() => {
                      try {
                        const current = form.getFieldValue("motherRingId");
                        if (current && typeof current === "string")
                          setMotherDisplay(current);
                      } catch (e) {
                        // ignore
                      }
                    }}
                    allowClear
                    onClear={() => {
                      form.setFieldsValue({ motherRingId: undefined });
                      setMotherDisplay("");
                      setMotherSelected(null);
                    }}
                  />
                </Form.Item>
                <p className="text-gray-400 font-normal text-[12px] pt-1">
                  Enter a part of the ring or part of the name to search for the
                  Corresponding Pigeon
                </p>
                {motherSelected && (
                  <div className="mt-2 p-2 bg-gray-50 border rounded text-sm">
                    <strong>Selected Pigeon:</strong>
                    <div>
                      {motherSelected.ringNumber} —{" "}
                      {motherSelected.name || "Unknown"}
                    </div>
                  </div>
                )}
              </div> */}
            </div>
          </div>

          <div className="right-column w-[38%] flex flex-col gap-6 border p-4 rounded-lg">
            {/* ===== PIGEON PHOTOS ===== */}
            <div className="p-4 border rounded-lg flex flex-col">
              <style>{`
                .custom-upload-ant .ant-upload-list-item-thumbnail,
                .custom-upload-ant .ant-upload-list-item-info {
                  width: 100% !important;
                  height: 100% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  overflow: hidden !important;
                }
                .custom-upload-ant .ant-upload-list-item-thumbnail img,
                .custom-upload-ant .ant-upload-list-picture-card-container img,
                .custom-upload-ant .ant-upload-list-item img {
                  width: 100% !important;
                  height: 100% !important;
                  max-width: none !important;
                  max-height: none !important;
                  object-fit: cover !important;
                  display: block !important;
                  margin: 0 !important;
                }
                .custom-upload-ant .ant-upload-list-picture-card .ant-upload-list-item {
                  padding: 0 !important;
                }
              `}</style>
              <p className="text-[16px] font-semibold">Pigeon Photos:</p>
              <p className="mb-2 text-[12px] text-gray-400">
                Accepted formats: JPEG, PNG, JPG, PDF. Maximum file size: 10MB.
              </p>
              <div className="relative">
                {canScrollLeft && (
                  <div
                    className="absolute left-[-16px] z-10 bg-gray-100 rounded-full"
                    style={{
                      top: photosScrollTop,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <Button
                      type="text"
                      icon={<LeftOutlined />}
                      onClick={() => {
                        const el = photosRowRef.current;
                        if (el) el.scrollBy({ left: -200, behavior: "smooth" });
                      }}
                    />
                  </div>
                )}
                {canScrollRight && (
                  <div
                    className="absolute right-[-16px] z-10 bg-gray-100 rounded-full"
                    style={{
                      top: photosScrollTop,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <Button
                      type="text"
                      icon={<RightOutlined />}
                      onClick={() => {
                        const el = photosRowRef.current;
                        if (el) el.scrollBy({ left: 200, behavior: "smooth" });
                      }}
                    />
                  </div>
                )}
                <div
                  ref={photosRowRef}
                  className="overflow-x-auto hide-scrollbar h-[102px] overflow-y-hidden"
                >
                  <Row
                    gutter={[10, 16]}
                    justify="start"
                    wrap={false}
                    className="flex-nowrap"
                  >
                    <Col flex="none">
                      <Upload
                        accept=".jpg,.jpeg,.png,.heic,.heif"
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
                        accept=".jpg,.jpeg,.png,.heic,.heif"
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
                        accept=".jpg,.jpeg,.png,.heic,.heif"
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
                        accept=".jpg,.jpeg,.png,.heic,.heif,.pdf"
                        className="custom-upload-ant"
                        {...commonUploadProps("pedigreePhoto")}
                      >
                        {fileLists.pedigreePhoto?.length
                          ? null
                          : uploadButton("Upload Pedigree Photo/PDF")}
                      </Upload>
                    </Col>

                    <Col flex="none">
                      <Upload
                        accept=".jpg,.jpeg,.png,.heic,.heif,.pdf"
                        className="custom-upload-ant"
                        {...commonUploadProps("DNAPhoto")}
                      >
                        {fileLists.DNAPhoto?.length
                          ? null
                          : uploadButton("Upload DNA Photo/PDF")}
                      </Upload>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>

            {/* ===== PIGEON RESULTS ===== */}
            {/* <div>
              <Form.Item
                label="Pigeon Results"
                name="addresults"
                className="custom-form-item-ant"
              >
                <div style={{ position: "relative" }}>
                  {!value && (
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "10px",
                        color: "#999",
                        pointerEvents: "none",
                        fontSize: "13px",
                        lineHeight: "19px",
                      }}
                    >
                      For example:
                      <br />
                      1st/828p Quiévrain 108km
                      <br />
                      4th/3265p Melun 287km
                      <br />
                      6th/3418p HotSpot 6 Dubai OLR
                    </div>
                  )}
                  <Input.TextArea
                    placeholder=""
                    className="custom-input-ant-modal custom-textarea-pigeon2"
                    style={{ paddingTop: "40px" }} // Adjust padding to prevent overlapping text
                    value={value}
                    onChange={handleChangePlace} // Track the input value
                  />
                </div>
              </Form.Item>
            </div> */}
            {/* <div className=" flex flex-col min-h-[300px]">
              <div className="mb-4 flex items-center gap-2">
                <Switch
                  checked={showRaceResults}
                  onChange={(checked) => setShowRaceResults(checked)}
                  size="small"
                />
                <span className="text-[16px] font-semibold">Pigeon Result</span>
              </div>

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
                  <Button
                    type="dashed"
                    onClick={addRaceResult}
                    style={{ width: "100%" }}
                  >
                    + Add Race Results
                  </Button>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </Form>

      <div className="flex justify-end gap-2">
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
          className="bg-[#C33739] border border-[#C33739] hover:!border-[#C33739] text-white hover:!text-[#C33739]"
        >
          Cancel
        </Button>

        <Button
          key="save"
          onClick={handleSave}
          loading={isAdding || isUpdating}
          className="bg-primary border border-primary text-white"
        >
          {pigeonData ? "Update Pigeon" : "Save Pigeon"}
        </Button>
        <Button
          key="save-another"
          onClick={handleSaveAndCreateAnother}
          loading={isAdding}
          className="bg-[#37B7C3] border border-[#37B7C3] hover:!border-[#37B7C3] text-white hover:!text-[#37B7C3]"
        >
          Save and Create Another Pigeon
        </Button>
      </div>
    </div>
  );
};

export default AddNewPigeon;
