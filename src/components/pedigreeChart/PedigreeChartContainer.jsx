import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, Typography, Tag, Button, Spin, Row, Col, message } from "antd";
import {
  UserOutlined,
  TrophyOutlined,
  DownloadOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
// If you used RTK Query before, keep your hook. Otherwise, replace with your data loader.
// import { useGetPigeonPedigreeChartDataQuery } from "@/redux/featured/pigeon/pigeonApi";
import { convertBackendToExistingFormat } from "./PigeonData"; // keep as-is if you already have it
import { useParams } from "react-router-dom"; // ← React Router instead of Next.js
import { getCode } from "country-list";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const { Title, Paragraph, Text } = Typography;

/**
 * Ant Design friendly ReactFlow node
 */
const PigeonNode = ({ data }) => {
  const countryCode = data.country ? getCode(data.country) : null;

  const getGenderIcon = (gender) => {
    if (!gender) return null;
    return gender.toLowerCase() === "cock" || gender.toLowerCase() === "male" ? (
      <ManOutlined />
    ) : (
      <WomanOutlined />
    );
  };

  const sizeByGeneration = (generation) => {
    switch (generation) {
      case 0:
      case 1:
        return { width: 300, height: 700 };
      case 2:
        return { width: 300, height: 400 };
      case 3:
        return { width: 300, height: 200 };
      case 4:
        return { width: 300, height: 100 };
      default:
        return { width: 300, height: 96 };
    }
  };

  const cardSize = sizeByGeneration(data?.generation);

  return (
    <div
      style={{
        backgroundColor: data.color || "#fff",
        width: cardSize.width,
        height: cardSize.height,
        border: "1px solid #000",
        borderRightWidth: 10,
        borderBottomWidth: 8,
        boxSizing: "border-box",
        padding: 8,
        borderRadius: 4,
        color: "#111",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ width: 12, height: 12, background: "#94a3b8" }} />

      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {countryCode && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <img
              src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
              alt={data.country}
              width={24}
              height={18}
              style={{ borderRadius: 2 }}
            />
            <Text strong>{countryCode}</Text>
          </div>
        )}

        {data.birthYear && <Text>{String(data.birthYear).slice(-2)}</Text>}
        {data.ringNumber && <Text strong style={{ color: "#C33739" }}>{data.ringNumber}</Text>}
        {data.gender && <Text>{getGenderIcon(data.gender)}</Text>}
      </div>

      {/* Body */}
      <div style={{ marginTop: 8 }}>
        {data.name && (
          <Title level={5} style={{ margin: 0 }}>
            {data.name}
          </Title>
        )}

        {data.owner && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <UserOutlined />
            <Text italic>{data.owner}</Text>
          </div>
        )}

        {data.description && (
          <Paragraph style={{ marginTop: 8, color: "#475569" }}>{data.description}</Paragraph>
        )}

        {data.colorName && (
          <Paragraph style={{ marginTop: 4, color: "#475569" }}>
            <Text strong>Color:</Text> {data.colorName}
          </Paragraph>
        )}

        {data.achievements && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <Text>Results:</Text>
            <TrophyOutlined />
            <Text>{data.achievements}</Text>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ width: 12, height: 12, background: "#94a3b8" }} />
    </div>
  );
};

const nodeTypes = { pigeonNode: PigeonNode };

export default function PigeonPedigreeChart() {
  // If you're not using React Router, replace this with how you get your "id"
  const { id } = useParams();

  // ---- Load Data ----
  // If you have RTK Query, uncomment and use your API hook
  // const { data: pedigreeData, isLoading } = useGetPigeonPedigreeChartDataQuery(id);
  // For demo, assume pedigreeData is available via props or context. Replace as needed.
  const pedigreeData = undefined; // <- supply real data
  const isLoading = false; // <- update with your loader state

  const chartRef = useRef(null);

  const { nodes: dynamicNodes = [], edges: dynamicEdges = [] } = useMemo(() => {
    return convertBackendToExistingFormat(pedigreeData) || { nodes: [], edges: [] };
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

  // ------- EXPORT: EXCEL -------
  const exportToExcel = useCallback(() => {
    try {
      const excelData = nodes.map((node, index) => ({
        "Serial No": index + 1,
        Name: node.data?.name || "N/A",
        "Ring Number": node.data?.ringNumber || "N/A",
        Gender: node.data?.gender || "N/A",
        "Birth Year": node.data?.birthYear || "N/A",
        Owner: node.data?.owner || "N/A",
        Country: node.data?.country || "N/A",
        Color: node.data?.colorName || "N/A",
        Generation: node.data?.generation ?? "N/A",
        Achievements: node.data?.achievements || "N/A",
        Description: node.data?.description || "N/A",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 30 },
        { wch: 40 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Pigeon Pedigree");
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `pigeon-pedigree-${currentDate}.xlsx`;
      XLSX.writeFile(wb, filename);
      message.success("Excel exported successfully");
    } catch (err) {
      console.error(err);
      message.error("Error exporting to Excel. Please try again.");
    }
  }, [nodes]);

  // ------- EXPORT: PDF -------
  const exportToPDF = useCallback(async () => {
    try {
      if (!chartRef.current) {
        message.warning("Chart not ready for export.");
        return;
      }

      const btn = document.querySelector('[data-export-pdf]');
      if (btn) {
        btn.textContent = "Exporting...";
        btn.disabled = true;
      }

      // Replace unsupported lab() CSS colors by forcing computed color properties into RGB
      const convertLabToRgb = (labString) => {
        const labMatch = labString?.match(/lab\(\s*([^)]+)\s*\)/);
        if (!labMatch) return labString;
        const values = labMatch[1].split(/\s+/).map((v) => parseFloat(v.replace("%", "")));
        const [l, a, b] = values;
        const y = (l + 16) / 116;
        const x = a / 500 + y;
        const z = y - b / 200;
        const r = Math.max(0, Math.min(255, Math.round(255 * (3.2406 * x - 1.5372 * y - 0.4986 * z))));
        const g = Math.max(0, Math.min(255, Math.round(255 * (-0.9689 * x + 1.8758 * y + 0.0415 * z))));
        const blue = Math.max(0, Math.min(255, Math.round(255 * (0.0557 * x - 0.204 * y + 1.057 * z))));
        return `rgb(${r}, ${g}, ${blue})`;
      };

      const temporarilyReplaceLabColors = (root) => {
        const backups = [];
        const process = (el) => {
          if (el.nodeType !== Node.ELEMENT_NODE) return;
          const styleAttr = el.getAttribute("style");
          const cs = window.getComputedStyle(el);
          let needs = false;
          let newStyle = styleAttr || "";

          if (styleAttr && styleAttr.includes("lab(")) {
            needs = true;
            newStyle = styleAttr.replace(/lab\([^\)]+\)/g, (m) => convertLabToRgb(m));
          }

          ["color", "background-color", "border-color", "fill", "stroke"].forEach((prop) => {
            const val = cs.getPropertyValue(prop);
            if (val && val.includes("lab(")) {
              needs = true;
              newStyle += `; ${prop}: ${convertLabToRgb(val)} !important`;
            }
          });

          if (needs) {
            backups.push({ element: el, originalStyle: styleAttr, hasStyle: el.hasAttribute("style") });
            el.setAttribute("style", newStyle);
          }

          Array.from(el.children).forEach(process);
        };
        process(root);
        return backups;
      };

      const backups = temporarilyReplaceLabColors(chartRef.current);
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: chartRef.current.scrollWidth,
        height: chartRef.current.scrollHeight,
        logging: false,
        ignoreElements: (el) => el.classList && el.classList.contains("html2canvas-ignore"),
      });

      // restore
      backups.forEach((b) => {
        if (b.hasStyle && b.originalStyle) b.element.setAttribute("style", b.originalStyle);
        else if (!b.hasStyle) b.element.removeAttribute("style");
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const maxWidth = imgWidth > imgHeight ? 1120 : 790; // A4-ish @ 150DPI
      const maxHeight = imgWidth > imgHeight ? 790 : 1120;
      const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "landscape" : "portrait",
        unit: "px",
        format: [finalWidth + 40, finalHeight + 40],
      });

      pdf.addImage(imgData, "PNG", 20, 20, finalWidth, finalHeight);
      const currentDate = new Date().toISOString().split("T")[0];
      pdf.save(`pigeon-pedigree-chart-${currentDate}.pdf`);
      message.success("PDF exported successfully");
    } catch (error) {
      console.error(error);
      if (String(error?.message || "").includes("lab")) {
        message.error("Unsupported CSS color format detected. Refresh and try again.");
      } else if (String(error?.message || "").includes("canvas")) {
        message.error("Unable to capture chart. Ensure it is fully loaded and try again.");
      } else {
        message.error("Error exporting to PDF. Please try again.");
      }
    } finally {
      const btn = document.querySelector('[data-export-pdf]');
      if (btn) {
        btn.textContent = "Export as PDF";
        btn.disabled = false;
      }
    }
  }, []);

  const defaultViewport = { x: 0, y: 0, zoom: 0.8 };

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingInline: 16 }}>
      <Row gutter={[24, 24]} align="middle" style={{ marginTop: 48 }}>
        <Col xs={24} md={16}>
          <Title level={3} style={{ marginBottom: 8 }}>Pigeon pedigree chart</Title>
          <Paragraph>
            The Pedigree Chart displays your pigeon's lineage across multiple generations, showing key details like name,
            ring number, and birthdate. It helps you track breeding relationships and plan future pairings.
          </Paragraph>
        </Col>
        <Col xs={24} md={8} style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button icon={<DownloadOutlined />} type="primary" onClick={exportToExcel}>
            Export as Excel
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportToPDF} data-export-pdf>
            Export as PDF
          </Button>
        </Col>
      </Row>

      <div ref={chartRef} style={{ width: "100%", height: 1700, display: "flex", alignItems: "center" }}>
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
          style={{ background: "transparent", height: "100%", paddingBlock: 16 }}
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
        />
      </div>
    </div>
  );
}
