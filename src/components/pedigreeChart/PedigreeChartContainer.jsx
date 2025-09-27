import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from "reactflow";

import "reactflow/dist/style.css";
import { Card, Button, Modal, Spin } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  CrownOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
// import { useParams } from "next/navigation";
// import Spinner from "@/app/(commonLayout)/Spinner";
import { getCode } from "country-list";
// import { WinnerPedigree } from "../share/svg/howItWorkSvg";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// import { convertBackendToExistingFormat } from "./PigeonData";
// import { useGetPigeonPedigreeDataQuery } from "../../redux/apiSlices/pigeonPedigreeApi";
import { useParams } from "react-router-dom";
import { convertBackendToExistingFormat } from "./PedigreeData";
import { useGetPigeonPedigreeDataQuery } from "../../redux/apiSlices/pigeonPedigreeApi";

const PigeonNode = ({ data }) => {
  const countryCode = data.country ? getCode(data.country) : null;
  // Remove console logs in production
  console.log(data.gender);
  console.log(data.verified);

  // Gender is already properly formatted as "Hen" or "Cock" from PedigreeData.jsx
  // Just use the gender icon function directly
  const getGenderIcon = (gender) => {
    return gender === "Cock" ? "♂" : "♀";
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
        return "w-[300px] h-[700px]"; // Subject - largest
      case 1:
        return "w-[300px] h-[700px]"; // Parents
      case 2:
        return "w-[300px] h-[400px]"; // Grandparents
      case 3:
        return "w-[300px] h-[200px]"; // Great-grandparents
      case 4:
        return "w-[300px] h-[100px]"; // Great-great-grandparents - smallest
      default:
        return "w-[300px] h-24";
    }
  };

  return (
    <div
      style={{ backgroundColor: data.color }}
      className={`${getCardSize(data?.generation)}
       
        border-b-8  border-r-8 border-black
          text-white rounded-none transition-all duration-300 px-4 py-2
          ${getGenerationColor(data?.generation)} border`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className=" !bg-slate-400"
      />
      <div className="flex items-center justify-between ">
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
        {data.gender && (
          <span className="text-black text-xl">
            {getGenderIcon(data.gender)}
          </span>
        )}
        <img
          src="/assets/Letter-P.png"
          alt="Letter P"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <img
          src="/assets/GoldCup.png"
          alt="Letter P"
          width={30}
          height={30}
          className="w-7 h-7"
        />

        {/* <WinnerPedigree /> */}
      </div>

      <div className="">
        <div className="flex items-center justify-start gap-2 space-y-2">
          {data.name && (
            <h3 className="font-bold text-black  truncate">{data.name}</h3>
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
              {data.verified && (
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
            <p className="text-sm text-slate-700">{data.description}</p>
          </div>
        )}
        {data.colorName && (
          <div className="">
            <p className="text-sm text-slate-700"> color : {data.colorName}</p>
          </div>
        )}
        {data.achievements && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-black">Results : </p>
            <img
              src="/assets/GoldTrophy.png"
              alt="Letter P"
              width={30}
              height={30}
              className="w-7 h-7"
            />
            <p className="text-xs text-black">{data.achievements}</p>
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
  console.log("id", id);

  const { data: pedigreeData, isLoading } = useGetPigeonPedigreeDataQuery(id);
  console.log("pedigreeData", pedigreeData);
  const chartRef = useRef(null);

  const { nodes: dynamicNodes, edges: dynamicEdges } = useMemo(() => {
    return convertBackendToExistingFormat(pedigreeData);
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

      // Button loading state
      const exportButton = document.querySelector("[data-export-pdf]");
      if (exportButton) {
        exportButton.textContent = "Exporting...";
        exportButton.disabled = true;
      }

      // --- Fix overflow/transform issues ---
      const ancestors = [];
      let el = chartRef.current;
      while (el) {
        ancestors.push(el);
        el = el.parentElement;
      }
      const styleBackups = ancestors.map((node) => ({
        node,
        transform: node.style.transform,
        overflow: node.style.overflow,
      }));
      ancestors.forEach((node) => {
        node.style.transform = "none";
        node.style.overflow = "visible";
      });

      // Wait small delay for styles
      await new Promise((r) => setTimeout(r, 80));

      // --- Capture canvas ---
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      const canvas = await html2canvas(chartRef.current, {
        scale: Math.min(2 * dpr, 4),
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
      });

      // Restore styles
      styleBackups.forEach((b) => {
        b.node.style.transform = b.transform || "";
        b.node.style.overflow = b.overflow || "";
      });

      // --- Prepare image for PDF ---
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Scale image to fit width
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Extra pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // --- Save PDF ---
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `pigeon-pedigree-chart-${currentDate}.pdf`;
      pdf.save(filename);

      console.log("✅ PDF export completed successfully");
    } catch (error) {
      console.error("❌ Error exporting to PDF:", error);
      alert("Error exporting to PDF. Please refresh the page and try again.");
    } finally {
      const exportButton = document.querySelector("[data-export-pdf]");
      if (exportButton) {
        exportButton.textContent = "Export as PDF";
        exportButton.disabled = false;
      }
    }
  }, []);

  const defaultViewport = { x: 0, y: 0, zoom: 0.8 };

  if (isLoading) return <div>Loading ... </div>;

  return (
    <div className="container  mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mt-12">
        <div className="max-w-2xl">
          <h2 className="text-black font-bold text-2xl">
            Pigeon pedigree chart
          </h2>
          <p className="text-black">
            The Pedigree Chart displays your pigeon's lineage across multiple
            generations, showing key details like name, ring number, and
            birthdate. It helps you track breeding relationships and plan future
            pairings.
          </p>
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
        className="w-full h-[1700px] flex justify-start items-center mt-0"
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
