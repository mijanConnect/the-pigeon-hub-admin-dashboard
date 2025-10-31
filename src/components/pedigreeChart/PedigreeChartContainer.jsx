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
import logo from "../../../src/assets/image4.png";
import Cock from "../../../src/assets/cock.png";
import Hen from "../../../src/assets/hen.png";
import Unspeficic from "../../../src/assets/unspeficic.png";

import { useGetProfileQuery } from "../../redux/apiSlices/profileSlice";
// import { useParams } from "next/navigation";
// import Spinner from "@/app/(commonLayout)/Spinner";
import { getCode } from "country-list";
// import { WinnerPedigree } from "../share/svg/howItWorkSvg";
import * as XLSX from "xlsx";
// import { convertBackendToExistingFormat } from "./PigeonData";
// import { useGetPigeonPedigreeDataQuery } from "../../redux/apiSlices/pigeonPedigreeApi";
import { useParams } from "react-router-dom";
import SpinnerCustom from "../../Pages/Dashboard/Spinner/SpinnerCustom";
import { useGetPigeonPedigreeDataQuery } from "../../redux/apiSlices/pigeonPedigreeApi";
import { exportPedigreeToPDF } from "./ExportPDF";
import { convertBackendToExistingFormat } from "./PedigreeData";
import { getImageUrl } from "../common/imageUrl";
// import { exportPedigreeToPDF } from "./exportPDF";

const PigeonNode = ({ data }) => {
  const countryCode = data.country ? getCode(data.country) : null;

  // Check if this is the subject node (generation 0)
  const isSubject = data.generation === 0;

  // const getGenderIcon = (gender) => {
  //   if (gender === "Cock") return "♂";
  //   if (gender === "Hen") return "♀";
  //   if (gender === "Unspecified") return "⛔";
  //   return "⛔";
  // };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case "Cock":
        return <img src={Cock} alt="Cock" width={20} height={20} />;
      case "Hen":
        return <img src={Hen} alt="Hen" width={20} height={20} />;
      case "Unspecified":
        return (
          <img
            src={Unspeficic}
            alt="Unspecified"
            width={20}
            height={20}
          />
        );
      default:
        return (
          <img
            src="/assets/unspecified.png"
            alt="Unspecified"
            width={20}
            height={20}
          />
        );
    }
  };

  const getGenerationColor = (generation) => {
    switch (generation) {
      case 0:
        return "border-black";
      case 1:
        return "border-black";
      case 2:
        return "border-black";
      case 3:
        return "border-black";
      case 4:
        return "border-black";
      default:
        return "border-black";
    }
  };

  const getCardSize = (generation) => {
    switch (generation) {
      case 0:
        return "w-[270px] h-[680px]";
      case 1:
        return "w-[270px] h-[680px]";
      case 2:
        return "w-[270px] h-[508px]";
      case 3:
        return "w-[270px] h-[246px]";
      case 4:
        return "w-[270px] h-[114px]";
      default:
        return "w-[270px] h-[100px]";
    }
  };

  return (
    <div
      style={{ backgroundColor: data.color }}
      className={`${getCardSize(data?.generation)}
        border-b-8 border-r-10 border-black
        text-white rounded-none transition-all duration-300 px-2 py-2
        ${getGenerationColor(data?.generation)} border`}
    >
      {/* Conditional Handles based on generation */}
      {isSubject ? (
        // Subject node (Gen 0): Top and Bottom handles only
        <>
          <Handle
            type="source"
            position={Position.Top}
            id="top"
            className="w-1 h-1 !bg-slate-400"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            className="w-1 h-1 !bg-slate-400"
          />
        </>
      ) : (
        // All other nodes: Left (target) and Right (source) handles
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="w-1 h-1 !bg-slate-400"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="w-1 h-1 !bg-slate-400"
          />
        </>
      )}

      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-1">
          {" "}
          {countryCode && (
            <div className="flex items-center gap-1">
              <img
                src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
                alt={data.country}
                className="w-5 h-4 rounded-sm"
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
            <span className=" text-[#C33739]">{data.ringNumber}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {data.gender && (
            <span className="text-black text-lg">
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
            <p className=" text-black">{data.description.slice(0, 600)}</p>
          </div>
        )}
        {data.colorName && (
          <div className="">
            <p className=" text-black"> {data.colorName}</p>
          </div>
        )}
        {data.achievements && (
          <div className="flex items-start gap-1">
            {/* <p className="text-xs text-black">Results:</p> */}
            {/* <img
              src="/assets/GoldTrophy.png"
              alt="Letter P"
              width={24}
              height={24}
              className="w-6 h-6 mt-[2px]"
            /> */}
            <p
              className="text-black whitespace-pre-line break-words max-w-[250px] overflow-hidden"
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
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
  const reactFlowInstanceRef = useRef(null);

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

  // Keep the flow fitted to the container on init, nodes/edges change and resize
  useEffect(() => {
    const fit = () => {
      try {
        const inst = reactFlowInstanceRef.current;
        if (inst && typeof inst.fitView === "function") {
          inst.fitView({ padding: 0.12, includeHiddenNodes: true });
        }
      } catch (e) {
        // ignore
      }
    };

    fit();

    const onResize = () => {
      clearTimeout(window.__pedigree_fit_timeout);
      window.__pedigree_fit_timeout = setTimeout(fit, 150);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [nodes.length, edges.length]);

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

  // Original single-click export (captures the full chart)
  // PDF Export Function
  const exportToPDF = useCallback(async () => {
    try {
      await exportPedigreeToPDF(nodes, edges, pedigreeData);
    } catch (error) {
      alert("Error exporting PDF. Please try again.");
    }
  }, [nodes, edges, pedigreeData]);

  const exportToPDFWithGenerations = useCallback(
    async (genCount) => {
      try {
        await exportPedigreeToPDF(nodes, edges, pedigreeData, data, genCount);
      } catch (error) {
        alert("Error exporting the selected generations. Please try again.");
      }
    },
    [nodes, edges, pedigreeData]
  );

  const defaultViewport = { x: 0, y: 0, zoom: 0.7 };

  if (isLoading) return <SpinnerCustom />;

  // if (isLoadingProfile) return <Spinner />;

  return (
    <div className="container mx-auto">
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
            className="bg-primary hover:!bg-primary/90 text-white hover:!text-white py-5 lg:px-4 xl:px-7 font-semibold text-[16px]"
            icon={<DownloadOutlined />}
          >
            Export to Excel
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: "4gen",
                  label: "Export to PDF (4Gen)",
                  onClick: async () => exportToPDFWithGenerations(4),
                },
                {
                  key: "5gen",
                  label: "Export to PDF (5Gen)",
                  onClick: async () => exportToPDFWithGenerations(5),
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button
              data-export-pdf
              className="bg-primary hover:!bg-primary/90 text-white hover:!text-white py-5 lg:px-4 xl:px-7 font-semibold text-[16px]"
              icon={<DownloadOutlined />}
            >
              Export to PDF
            </Button>
          </Dropdown>
        </div>
      </div>

      <div className="relative">
        <img
          src={getImageUrl(data.profile)}
          alt="The Pigeon Hub Logo"
          width={60}
          height={60}
          className="w-16 h-16 xl:w-24 xl:h-24 absolute top-8 xl:top-16 2xl:top-20 left-0 xl:left-20 2xl:left-52 rounded-full object-cover"
        />
      </div>
      <div className="flex justify-center">
        <div
          ref={chartRef}
          className="w-full max-w-[1200px] h-[1120px] xl:h-[1400px] 2xl:h-[1700px] bg-transparent flex justify-start items-center rounded-3xl"
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
      <div className="relative">
        <div className="absolute bottom-20 xl:bottom-28 2xl:bottom-32 -left-5 xl:left-24 2xl:left-52 text-black">
          <p className="text-accent-foreground text-[11px] 2xl:text-lg  font-bold">
            {data?.name}
          </p>
          {data?.contact && (
            <p className="text-[8px] ">
              {/* Phone:{" "} */}
              <span className="text-accent-foreground text-[10px]  font-bold">
                {data?.contact}
              </span>
            </p>
          )}
          {data?.email && (
            <p className="text-[8px]">
              {/* Email:{" "} */}
              <span className="text-accent-foreground font-bold">
                {data?.email}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="w-full flex justify-center">
        <h2 className="text-[#37B7C3] font-bold  mb-10">
          Generated by <span className="text-black">ThePigeonHub.Com</span>
        </h2>
      </div>
    </div>
  );
}
