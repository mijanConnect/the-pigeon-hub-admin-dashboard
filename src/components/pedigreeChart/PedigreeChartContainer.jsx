import { useCallback, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  addEdge,
  Handle,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";

import { DownloadOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
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

  // Generic chart capture and PDF save function. Returns the generated filename.
  const captureChartAndSave = useCallback(async (filenameOverride) => {
    try {
      if (!chartRef.current) {
        throw new Error("Chart not ready");
      }

      // Show loading state
      const exportButton = document.querySelector("[data-export-pdf]");
      if (exportButton) {
        exportButton.textContent = "Exporting...";
        exportButton.disabled = true;
      }

      // CRITICAL FIX: Temporarily increase height to ensure all content is visible
      const originalHeight = chartRef.current.style.height;
      const originalMinHeight = chartRef.current.style.minHeight;
      const reactFlowElement = chartRef.current.querySelector(".react-flow");
      const reactFlowOriginalHeight = reactFlowElement
        ? reactFlowElement.style.height
        : null;

      // Force minimum height to ensure all edges are rendered
      chartRef.current.style.height = "2000px";
      chartRef.current.style.minHeight = "2000px";
      if (reactFlowElement) {
        reactFlowElement.style.height = "2000px";
      }

      // Wait for ReactFlow to adjust to new height
      await new Promise((resolve) => setTimeout(resolve, 300));

      const convertLabToRgb = (labString) => {
        const labMatch = labString.match(/lab\(\s*([^)]+)\s*\)/);
        if (!labMatch) return labString;

        const values = labMatch[1]
          .split(/\s+/)
          .map((v) => parseFloat(v.replace("%", "")));
        const [l, a, b] = values;

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

      const temporarilyReplaceLabColors = (element) => {
        const originalStyles = [];

        const processElement = (el) => {
          if (el.nodeType === Node.ELEMENT_NODE) {
            const style = el.getAttribute("style");
            const computedStyle = window.getComputedStyle(el);

            let needsReplacement = false;
            let newStyle = style || "";

            if (style && style.includes("lab(")) {
              needsReplacement = true;
              newStyle = style.replace(/lab\([^)]+\)/g, (match) => {
                return convertLabToRgb(match);
              });
            }

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

            Array.from(el.children).forEach(processElement);
          }
        };

        processElement(element);
        return originalStyles;
      };

      // Apply lab color replacements
      const styleBackups = temporarilyReplaceLabColors(chartRef.current);

      // Remove truncation
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
          e.classList.remove(
            "truncate",
            "overflow-hidden",
            "whitespace-nowrap"
          );
          const oldStyle = e.getAttribute("style") || "";
          const newStyle = oldStyle
            .replace(/overflow:\s*hidden;?/g, "")
            .replace(/text-overflow:\s*ellipsis;?/g, "")
            .replace(/white-space:\s*nowrap;?/g, "");
          if (newStyle.trim()) e.setAttribute("style", newStyle);
          else e.removeAttribute("style");
        });
      };

      removeTruncation(chartRef.current);

      // CRITICAL FIX: Ensure SVG edges are visible and properly positioned
      const svgEdges = chartRef.current.querySelectorAll(
        ".react-flow__edges, .react-flow__edge"
      );
      const svgBackups = [];

      svgEdges.forEach((svg) => {
        const original = {
          element: svg,
          style: svg.getAttribute("style"),
          visibility: svg.style.visibility,
          display: svg.style.display,
          opacity: svg.style.opacity,
          zIndex: svg.style.zIndex,
        };
        svgBackups.push(original);

        // Force visibility and proper positioning
        svg.style.visibility = "visible !important";
        svg.style.display = "block !important";
        svg.style.opacity = "1 !important";
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "1";
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");

        // Ensure all paths in edges have proper stroke
        const paths = svg.querySelectorAll("path");
        paths.forEach((path) => {
          const stroke = path.getAttribute("stroke");
          if (!stroke || stroke === "none" || stroke === "transparent") {
            path.setAttribute("stroke", "#37B7C3");
          }

          const strokeWidth = path.getAttribute("stroke-width");
          if (!strokeWidth || parseFloat(strokeWidth) < 1) {
            path.setAttribute("stroke-width", "2");
          }

          path.setAttribute("fill", "none");
          path.style.visibility = "visible";
          path.style.display = "block";
          path.style.opacity = "1";
        });

        // Ensure all edge groups are visible
        const gElements = svg.querySelectorAll("g");
        gElements.forEach((g) => {
          g.style.visibility = "visible";
          g.style.display = "block";
          g.style.opacity = "1";
        });
      });

      // Force render all ReactFlow edge elements specifically
      const allEdgeElements = chartRef.current.querySelectorAll(
        '[class*="react-flow__edge"]'
      );
      allEdgeElements.forEach((edge) => {
        edge.style.visibility = "visible";
        edge.style.display = "block";
        edge.style.opacity = "1";
      });

      // Wait longer for all elements to render properly
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: chartRef.current.scrollWidth,
        height: chartRef.current.scrollHeight,
        logging: false,
        // Critical settings for SVG capture
        foreignObjectRendering: false,
        removeContainer: false,
        ignoreElements: (element) => {
          // Don't ignore any elements, especially not SVG
          return (
            element.classList &&
            element.classList.contains("html2canvas-ignore")
          );
        },
        onclone: (clonedDoc) => {
          // Additional processing on cloned document
          const clonedEdges = clonedDoc.querySelectorAll(
            ".react-flow__edges, .react-flow__edge"
          );
          clonedEdges.forEach((svg) => {
            svg.style.visibility = "visible";
            svg.style.display = "block";
            svg.style.opacity = "1";

            const paths = svg.querySelectorAll("path");
            paths.forEach((path) => {
              path.setAttribute("stroke", "#37B7C3");
              path.setAttribute("stroke-width", "2");
              path.setAttribute("fill", "none");
            });
          });
        },
      });

      // Restore all styles
      styleBackups.forEach((backup) => {
        if (backup.hasStyle && backup.originalStyle) {
          backup.element.setAttribute("style", backup.originalStyle);
        } else if (!backup.hasStyle) {
          backup.element.removeAttribute("style");
        }
      });

      truncationBackups.forEach((b) => {
        b.element.className = "";
        b.classList.forEach((c) => b.element.classList.add(c));
        if (b.style) b.element.setAttribute("style", b.style);
        else b.element.removeAttribute("style");
      });

      // Restore SVG elements
      svgBackups.forEach((backup) => {
        if (backup.style) {
          backup.element.setAttribute("style", backup.style);
        }
      });

      // Restore original heights
      chartRef.current.style.height = originalHeight;
      chartRef.current.style.minHeight = originalMinHeight;
      if (reactFlowElement && reactFlowOriginalHeight) {
        reactFlowElement.style.height = reactFlowOriginalHeight;
      }

      const imgData = canvas.toDataURL("image/png", 1.0);

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const maxWidth = imgWidth > imgHeight ? 1120 : 790;
      const maxHeight = imgWidth > imgHeight ? 790 : 1120;

      const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "landscape" : "portrait",
        unit: "px",
        format: [finalWidth + 40, finalHeight + 40],
      });

      const xOffset = 20;
      const yOffset = 20;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);

      const currentDate = new Date().toISOString().split("T")[0];
      const filename =
        filenameOverride || `pigeon-pedigree-chart-${currentDate}.pdf`;

      pdf.save(filename);

      return filename;
    } catch (error) {
      throw error;
    } finally {
      const exportButton = document.querySelector("[data-export-pdf]");
      if (exportButton) {
        exportButton.textContent = "Export as PDF";
        exportButton.disabled = false;
      }
    }
  }, []);

  // Original single-click export (captures the full chart)
  const exportToPDF = useCallback(async () => {
    try {
      await captureChartAndSave();
      console.log("PDF export completed successfully");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Error exporting to PDF. Please try again or refresh the page.");
    }
  }, [captureChartAndSave]);

  // Export only N generations (N includes subject as generation 0). Example: 4Gen => generations 0..3
  const exportToPDFWithGenerations = useCallback(
    async (genCount) => {
      const maxGen = Math.max(0, genCount - 1);
      const originalNodes = nodes;
      const originalEdges = edges;

      try {
        // Filter nodes by generation
        const filteredNodes = originalNodes.filter((n) => {
          const gen = n?.data?.generation ?? 0;
          return gen <= maxGen;
        });

        // Keep edges that connect visible nodes
        const visibleIds = new Set(filteredNodes.map((n) => n.id));
        const filteredEdges = originalEdges.filter(
          (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
        );

        // Apply filtered graph
        setNodes(filteredNodes);
        setEdges(filteredEdges);

        // Wait for ReactFlow to re-render
        await new Promise((resolve) => setTimeout(resolve, 220));

        const currentDate = new Date().toISOString().split("T")[0];
        const filename = `pigeon-pedigree-chart-${genCount}gen-${currentDate}.pdf`;

        await captureChartAndSave(filename);

        console.log(`PDF export for ${genCount} generations completed`);
      } catch (error) {
        console.error("Error exporting filtered generations:", error);
        alert("Error exporting the selected generations. Please try again.");
      } finally {
        // Restore original nodes/edges regardless of success/failure
        setNodes(originalNodes);
        setEdges(originalEdges);
      }
    },
    [nodes, edges, setNodes, setEdges, captureChartAndSave]
  );

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
      <div className="flex flex-col md:flex-row items-end justify-between mt-4">
        <div className="max-w-2xl">
          <h2 className="text-black font-bold text-[26px]">
            Pigeon pedigree chart
          </h2>
          {/* <p className="text-black">
            The Pedigree Chart displays your pigeon's lineage across multiple
            generations, showing key details like name, ring number, and
            birthdate. It helps you track breeding relationships and plan future
            pairings.
          </p> */}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={exportToExcel}
            className="bg-primary hover:!bg-primary/90 text-white hover:!text-white py-5 px-7 font-semibold text-[16px]"
            icon={<DownloadOutlined />}
          >
            Export as Excel
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: "4gen",
                  label: "Export as PDF (4Gen)",
                  onClick: async () => exportToPDFWithGenerations(4),
                },
                {
                  key: "5gen",
                  label: "Export as PDF (5Gen)",
                  onClick: async () => exportToPDFWithGenerations(5),
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button
              data-export-pdf
              className="bg-primary hover:!bg-primary/90 text-white hover:!text-white py-5 px-7 font-semibold text-[16px]"
              icon={<DownloadOutlined />}
            >
              Export as PDF
            </Button>
          </Dropdown>
        </div>
      </div>
      <div
        ref={chartRef}
        className="w-full h-[1400px] 2xl:h-[2000px] bg-transparent flex justify-start items-center rounded-3xl"
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
          className="bg-transparent h-full py-8"
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
