import { useCallback, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  addEdge,
  Handle,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";

import { DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import "reactflow/dist/style.css";

import { useGetProfileQuery } from "../../redux/apiSlices/profileSlice";
// import { useParams } from "next/navigation";
// import Spinner from "@/app/(commonLayout)/Spinner";
import { getCode } from "country-list";
// import { WinnerPedigree } from "../share/svg/howItWorkSvg";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
// import { convertBackendToExistingFormat } from "./PigeonData";
// import { useGetPigeonPedigreeDataQuery } from "../../redux/apiSlices/pigeonPedigreeApi";
import { useParams } from "react-router-dom";
import { useGetPigeonPedigreeDataQuery } from "../../redux/apiSlices/pigeonPedigreeApi";
import Spinner from "../common/Spinner";
import { convertBackendToExistingFormat } from "./PedigreeData";

const PigeonNode = ({ data }) => {
  const countryCode = data.country ? getCode(data.country) : null;
  // Remove console logs in production
  // console.log(data.gender);
  // console.log(data.verified);

  // Gender is already properly formatted as "Hen" or "Cock" from PedigreeData.jsx
  // Just use the gender icon function directly
  const getGenderIcon = (gender) => {
    if (gender === "Cock") return "♂";
    if (gender === "Hen") return "♀";
    if (gender === "Unspecified") return "⚪";
    return "⚪"; // default fallback
  };

  const getGenerationColor = (generation) => {
    switch (generation) {
      case 0:
        return "border-black"; // Subject
      case 1:
        return "border-black"; // Parents (2)
      case 2:
        return "border-black"; // Grandparents (4)
      case 3:
        return "border-black"; // Great-grandparents (8)
      case 4:
        return "border-black"; // Great-great-grandparents (16)
      default:
        return "border-black";
    }
  };

  const getCardSize = (generation) => {
    switch (generation) {
      case 0:
        return "w-[270px] h-[700px]"; // Subject - largest
      case 1:
        return "w-[270px] h-[700px]"; // Parents
      case 2:
        return "w-[270px] h-[510px]"; // Grandparents
      case 3:
        return "w-[270px] h-[250px]"; // Great-grandparents
      case 4:
        return "w-[270px] h-[120px]"; // Great-great-grandparents - smallest
      default:
        return "w-[270px] h-24";
    }
  };

  return (
    <div
      style={{ backgroundColor: data.color }}
      className={`${getCardSize(data?.generation)}
       
        border-b-8  border-r-8 border-black
          text-white rounded-none transition-all duration-300 px-2 py-2
          ${getGenerationColor(data?.generation)} border`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className=" !bg-slate-400"
      />
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-1">
          {" "}
          {countryCode && (
            <div className="flex items-center gap-1">
              <img
                src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
                alt={data.country}
                className="w-6 h-5 rounded-sm"
              />
              <p className="text-black">{countryCode}</p>
            </div>
          )}
          {/* <Crown className="w-3 h-3 text-amber-600" /> */}
          {data.birthYear && (
            <span className="text-black">
              {data.birthYear.toString().slice(-2)}
            </span>
          )}
          {data.ringNumber && (
            <span className=" font-bold text-[#C33739]">{data.ringNumber}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {data.gender && (
            <span className="text-black text-xl">
              {getGenderIcon(data.gender)}
            </span>
          )}
          {data.verified && (
            <img
              src="/assets/Letter-P.png"
              alt="Letter P"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          )}
          {data.iconic && (
            <img
              src="/assets/GoldCup.png"
              alt="Letter P"
              width={30}
              height={30}
              className="w-7 h-7"
            />
          )}
        </div>

        {/* <WinnerPedigree /> */}
      </div>

      <div className="">
        <div className="flex items-center justify-start gap-2">
          {data.name && (
            <h3 className="font-bold text-black truncate">{data.name}</h3>
          )}
        </div>
        <div className="flex items-center justify-start gap-2">
          {" "}
          {/* {data.owner && (
            <div className="flex items-center gap-2 text-xl italic text-black">
              <UserOutlined className="w-3 h-3" />
              <span className="truncate">{data.owner}</span>
            </div>
          )} */}
          {data.owner && (
            <div className="flex items-center gap-2  italic text-black">
              {/* <UserOutlined className="w-3 h-3" /> */}
              <span className="truncate">{data.owner}</span>
              {data.breederVerified && (
                <img
                  src="/assets/Letter-B.png"
                  alt="Verified Breeder"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              )}
            </div>
          )}
        </div>

        {data.description && (
          <div className="">
            <p className="text-sm text-slate-700">
              {data.description.slice(0, 600)}
            </p>
          </div>
        )}
        {data.colorName && (
          <div className="">
            <p className="text-sm text-slate-700"> color : {data.colorName}</p>
          </div>
        )}
        {data.achievements && (
          <div className="flex items-start gap-1">
            <p className="text-xs text-black">Results:</p>
            <img
              src="/assets/GoldTrophy.png"
              alt="Letter P"
              width={24}
              height={24}
              className="w-6 h-6 mt-[2px]"
            />
            <p className="text-xs text-black whitespace-pre-line">
              {data.achievements}
            </p>
          </div>
        )}
        {/* {data.position && (
            <span variant="secondary" className="text-xs px-1 text-black">
              {data.position}
            </span>
          )} */}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className=" !bg-slate-400"
      />
    </div>
  );
};

const nodeTypes = {
  pigeonNode: PigeonNode,
};

export default function PigeonPedigreeChart() {
  const { id } = useParams();
  // console.log("id", id);

  const { data: pedigreeData, isLoading } = useGetPigeonPedigreeDataQuery(id);
  // console.log("pedigreeData", pedigreeData);
  const chartRef = useRef(null);

  const { data, isLoading: isLoadingProfile } = useGetProfileQuery();

  const role = data?.role;

  // console.log("user data", role);

  const { nodes: dynamicNodes, edges: dynamicEdges } = useMemo(() => {
    return convertBackendToExistingFormat(pedigreeData, role);
  }, [pedigreeData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(dynamicNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(dynamicEdges);

  useEffect(() => {
    setNodes(dynamicNodes);
    setEdges(dynamicEdges);
  }, [dynamicNodes, dynamicEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Excel Export Function
  const exportToExcel = useCallback(() => {
    try {
      // Prepare data for Excel
      const excelData = nodes.map((node, index) => ({
        "Serial No": index + 1,
        Name: node.data.name || "N/A",
        "Ring Number": node.data.ringNumber || "N/A",
        Gender: node.data.gender || "N/A",
        "Birth Year": node.data.birthYear || "N/A",
        Owner: node.data.owner || "N/A",
        Country: node.data.country || "N/A",
        Color: node.data.colorName || "N/A",
        Generation:
          node.data.generation !== undefined ? node.data.generation : "N/A",
        Achievements: node.data.achievements || "N/A",
        Description: node.data.description || "N/A",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 10 }, // Serial No
        { wch: 20 }, // Name
        { wch: 15 }, // Ring Number
        { wch: 10 }, // Gender
        { wch: 12 }, // Birth Year
        { wch: 20 }, // Owner
        { wch: 15 }, // Country
        { wch: 15 }, // Color
        { wch: 12 }, // Generation
        { wch: 30 }, // Achievements
        { wch: 40 }, // Description
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Pigeon Pedigree");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `pigeon-pedigree-${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      console.log("Excel export completed successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting to Excel. Please try again.");
    }
  }, [nodes]);

  // PDF Export Function
  const exportToPDF = useCallback(async () => {
    try {
      if (!chartRef.current) {
        alert("Chart not ready for export. Please try again.");
        return;
      }

      // Show loading state
      const exportButton = document.querySelector("[data-export-pdf]");
      if (exportButton) {
        exportButton.textContent = "Exporting...";
        exportButton.disabled = true;
      }

      // Create a comprehensive function to convert lab colors to RGB
      const convertLabToRgb = (labString) => {
        // Extract values from lab() function
        const labMatch = labString.match(/lab\(\s*([^)]+)\s*\)/);
        if (!labMatch) return labString;

        const values = labMatch[1]
          .split(/\s+/)
          .map((v) => parseFloat(v.replace("%", "")));
        const [l, a, b] = values;

        // Simple lab to RGB conversion (approximation)
        // For a more accurate conversion, you might want to use a color library
        const y = (l + 16) / 116;
        const x = a / 500 + y;
        const z = y - b / 200;

        const r = Math.max(
          0,
          Math.min(
            255,
            Math.round(255 * (3.2406 * x - 1.5372 * y - 0.4986 * z))
          )
        );
        const g = Math.max(
          0,
          Math.min(
            255,
            Math.round(255 * (-0.9689 * x + 1.8758 * y + 0.0415 * z))
          )
        );
        const blue = Math.max(
          0,
          Math.min(255, Math.round(255 * (0.0557 * x - 0.204 * y + 1.057 * z)))
        );

        return `rgb(${r}, ${g}, ${blue})`;
      };

      // More comprehensive approach to handle lab colors
      const temporarilyReplaceLabColors = (element) => {
        const originalStyles = [];

        // Function to recursively process all elements
        const processElement = (el) => {
          if (el.nodeType === Node.ELEMENT_NODE) {
            const style = el.getAttribute("style");
            const computedStyle = window.getComputedStyle(el);

            // Check both inline styles and computed styles for lab colors
            let needsReplacement = false;
            let newStyle = style || "";

            // Check inline style attribute
            if (style && style.includes("lab(")) {
              needsReplacement = true;
              newStyle = style.replace(/lab\([^)]+\)/g, (match) => {
                return convertLabToRgb(match);
              });
            }

            // Check computed styles for common color properties
            const colorProperties = [
              "color",
              "background-color",
              "border-color",
              "fill",
              "stroke",
            ];
            colorProperties.forEach((prop) => {
              const value = computedStyle.getPropertyValue(prop);
              if (value && value.includes("lab(")) {
                needsReplacement = true;
                const convertedColor = convertLabToRgb(value);
                newStyle += `; ${prop}: ${convertedColor} !important`;
              }
            });

            if (needsReplacement) {
              originalStyles.push({
                element: el,
                originalStyle: style,
                hasStyle: el.hasAttribute("style"),
              });
              el.setAttribute("style", newStyle);
            }

            // Process child elements
            Array.from(el.children).forEach(processElement);
          }
        };

        processElement(element);
        return originalStyles;
      };

      // Apply lab color replacements
      const styleBackups = temporarilyReplaceLabColors(chartRef.current);

      // --- Temporarily remove truncation/overflow styles so html2canvas captures full text ---
      const truncationBackups = [];
      const removeTruncation = (el) => {
        if (!el) return;
        const elements = el.querySelectorAll(
          ".truncate, .overflow-hidden, .whitespace-nowrap"
        );
        elements.forEach((e) => {
          const original = {
            element: e,
            classList: Array.from(e.classList),
            style: e.getAttribute("style"),
          };
          truncationBackups.push(original);
          // remove classes that cause clipping
          e.classList.remove(
            "truncate",
            "overflow-hidden",
            "whitespace-nowrap"
          );
          // also remove inline overflow styles that could clip text
          const oldStyle = e.getAttribute("style") || "";
          const newStyle = oldStyle
            .replace(/overflow:\s*hidden;?/g, "")
            .replace(/text-overflow:\s*ellipsis;?/g, "")
            .replace(/white-space:\s*nowrap;?/g, "");
          if (newStyle.trim()) e.setAttribute("style", newStyle);
          else e.removeAttribute("style");
        });
      };

      // run removal
      removeTruncation(chartRef.current);

      // Wait a moment for DOM updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Configure html2canvas with better error handling
      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: chartRef.current.scrollWidth,
        height: chartRef.current.scrollHeight,
        logging: false, // Disable logging to reduce console noise
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return (
            element.classList &&
            element.classList.contains("html2canvas-ignore")
          );
        },
      });

      // Restore original styles
      styleBackups.forEach((backup) => {
        if (backup.hasStyle && backup.originalStyle) {
          backup.element.setAttribute("style", backup.originalStyle);
        } else if (!backup.hasStyle) {
          backup.element.removeAttribute("style");
        }
      });

      // Restore truncation/overflow classes and inline styles
      truncationBackups.forEach((b) => {
        // restore class list
        b.element.className = ""; // clear then re-add to keep order predictable
        b.classList.forEach((c) => b.element.classList.add(c));
        // restore inline style
        if (b.style) b.element.setAttribute("style", b.style);
        else b.element.removeAttribute("style");
      });

      const imgData = canvas.toDataURL("image/png", 1.0); // Full quality

      // Calculate PDF dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate scale to fit on standard paper size
      const maxWidth = imgWidth > imgHeight ? 1120 : 790; // A4 landscape/portrait at 150 DPI
      const maxHeight = imgWidth > imgHeight ? 790 : 1120;

      const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      // Create PDF with appropriate orientation
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "landscape" : "portrait",
        unit: "px",
        format: [finalWidth + 40, finalHeight + 40], // Add padding
      });

      // Center the image on the page
      const xOffset = 20;
      const yOffset = 20;

      // Add the image to PDF
      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `pigeon-pedigree-chart-${currentDate}.pdf`;

      // Save PDF
      pdf.save(filename);

      console.log("PDF export completed successfully");
    } catch (error) {
      console.error("Error exporting to PDF:", error);

      // More specific error messages
      if (error.message && error.message.includes("lab")) {
        alert(
          "Error: Unsupported color format detected. Please try refreshing the page and exporting again."
        );
      } else if (error.message && error.message.includes("canvas")) {
        alert(
          "Error: Unable to capture chart image. Please ensure the chart is fully loaded and try again."
        );
      } else {
        alert("Error exporting to PDF. Please try again or refresh the page.");
      }
    } finally {
      // Reset button state
      const exportButton = document.querySelector("[data-export-pdf]");
      if (exportButton) {
        exportButton.textContent = "Export as PDF";
        exportButton.disabled = false;
      }
    }
  }, []);

  const defaultViewport = { x: 0, y: 0, zoom: 0.8 };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Spinner />
      </div>
    );

  // if (isLoadingProfile) return <Spinner />;

  return (
    <div className="container  mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mt-12">
        <div className="max-w-2xl">
          <h2 className="text-black font-bold text-2xl">
            Pigeon pedigree chart
          </h2>
          {/* <p className="text-black">
            The Pedigree Chart displays your pigeon's lineage across multiple
            generations, showing key details like name, ring number, and
            birthdate. It helps you track breeding relationships and plan future
            pairings.
          </p> */}
        </div>
        <div className="flex gap-5">
          <Button
            onClick={exportToExcel}
            type="primary"
            className="bg-primary text-white hover:text-white flex items-center gap-2"
            icon={<DownloadOutlined />}
          >
            Export as Excel
          </Button>
          <Button
            onClick={exportToPDF}
            type="primary"
            data-export-pdf
            className="bg-primary text-white hover:text-white flex items-center gap-2"
            icon={<DownloadOutlined />}
          >
            Export as PDF
          </Button>
        </div>
      </div>
      <div
        ref={chartRef}
        className="w-full h-[1400px] bg-transparent flex justify-start items-center mt-0 rounded-3xl"
      >
        {/* --- ReactFlow (now dynamic) --- */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultViewport={defaultViewport}
          fitView
          attributionPosition="bottom-right"
          className="bg-transparent h-full py-16"
          minZoom={0.5}
          maxZoom={1}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        >
          {/* <Background variant="dots" gap={25} size={1.5} color="#FFFFFF" /> */}
        </ReactFlow>
      </div>
    </div>
  );
}
