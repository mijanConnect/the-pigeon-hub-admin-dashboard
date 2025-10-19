import { Button, Spin, Table } from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import PlaceholderImg from "../../../assets/placeholder.png";
import VerifyIcon from "../../../assets/verify.png";
import {
  useGetSiblingsQuery,
  useGetSinglePigeonQuery,
} from "../../../redux/apiSlices/mypigeonSlice";
import { getImageUrl } from "../../common/imageUrl";
import PigeonPdfExport from "./ExportPdf";

const safeValue = (value) => {
  if (value === null || value === undefined || value === "" || value === "-")
    return "N/A";
  if (typeof value === "object") {
    if (value?.name) return value.name;
    return JSON.stringify(value);
  }
  return String(value);
};

// Lightweight image slider component (no external CSS required)
const ImageSlider = ({
  photos = [],
  size = 320,
  autoplay = false,
  autoplayInterval = 3000,
  showArrows = true,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!photos || photos.length === 0) return;
    if (index >= photos.length) setIndex(Math.max(0, photos.length - 1));
  }, [photos, index]);

  if (!photos || photos.length === 0) return null;

  const prev = React.useCallback(() => {
    // debug
    try {
      // eslint-disable-next-line no-console
      console.debug("ImageSlider prev() called");
    } catch (e) {}
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = React.useCallback(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug("ImageSlider next() called");
    } catch (e) {}
    setIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  // keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (!photos || photos.length === 0) return;
      if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [photos, prev, next]);

  // autoplay
  const autoplayRef = React.useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // drag/swipe support
  const pointerRef = React.useRef({ active: false, startX: 0, currentX: 0 });

  const onPointerDown = (e) => {
    pointerRef.current.active = true;
    pointerRef.current.startX =
      e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    pointerRef.current.currentX = pointerRef.current.startX;
    setIsPaused(true);
  };

  const onPointerMove = (e) => {
    if (!pointerRef.current.active) return;
    pointerRef.current.currentX =
      e.clientX ||
      (e.touches && e.touches[0]?.clientX) ||
      pointerRef.current.currentX;
  };

  const onPointerUp = () => {
    if (!pointerRef.current.active) return;
    const dx = pointerRef.current.currentX - pointerRef.current.startX;
    const threshold = 40; // px
    if (dx > threshold) {
      prev();
    } else if (dx < -threshold) {
      next();
    }
    pointerRef.current.active = false;
    setIsPaused(false);
  };

  useEffect(() => {
    if (!autoplay || !photos || photos.length <= 1) return;
    if (isPaused) return;
    autoplayRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, autoplayInterval);
    return () => clearInterval(autoplayRef.current);
  }, [autoplay, autoplayInterval, photos, isPaused]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size, overflow: "hidden" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => {
          onPointerDown(e);
        }}
        onTouchMove={(e) => {
          onPointerMove(e);
        }}
        onTouchEnd={() => {
          onPointerUp();
        }}
        onPointerDown={(e) => {
          onPointerDown(e);
        }}
        onPointerMove={(e) => {
          onPointerMove(e);
        }}
        onPointerUp={() => {
          onPointerUp();
        }}
      >
        {showArrows && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: 8,
              zIndex: 20,
              background: "rgba(0,0,0,0.45)",
              border: "none",
              cursor: "pointer",
              color: "white",
              width: 36,
              height: 36,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
            aria-label="Previous image"
          >
            <IoIosArrowBack size={20} />
          </button>
        )}

        <img
          src={getImageUrl(photos[index].url)}
          alt={photos[index].label}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 8,
            objectFit: "cover",
            userSelect: "none",
            WebkitUserDrag: "none",
          }}
          draggable={false}
        />

        {showArrows && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              right: 8,
              zIndex: 20,
              background: "rgba(0,0,0,0.45)",
              border: "none",
              cursor: "pointer",
              color: "white",
              width: 36,
              height: 36,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
            aria-label="Next image"
          >
            <IoIosArrowForward size={20} />
          </button>
        )}
      </div>

      <div className="flex gap-2 mt-2 items-center">
        {photos.map((p, i) => {
          const isActive = i === index;
          const inactiveSize = 10; // px
          const activeWidth = 25; // px (requested)
          const activeHeight = 10; // px (requested)
          const width = isActive ? activeWidth : inactiveSize;
          const height = isActive ? activeHeight : inactiveSize;
          const background = isActive ? "#111827" : "#d1d5db";
          const borderRadius = isActive ? `${activeHeight / 2}px` : "50%";

          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setIndex(i)}
              style={{
                width,
                height,
                borderRadius,
                background,
                border: "none",
                padding: 0,
                transition: "all 140ms cubic-bezier(.2,.8,.2,1)",
                cursor: "pointer",
              }}
              aria-label={`Show ${p.label}`}
            />
          );
        })}
      </div>
    </div>
  );
};

const ViewPigeon = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const { id } = useParams();

  const { data: pigeonResp, isLoading: loading } = useGetSinglePigeonQuery(id, {
    skip: !id,
  });
  const pigeonData = pigeonResp?.data || null;
  
  const { data: siblingsResp } = useGetSiblingsQuery(id, { skip: !id });
  const siblingsData = siblingsResp?.data?.siblings || null;

  console.log(siblingsData);

  const handleExportPDF = async () => {
    const contentEl = printRef.current;
    if (!contentEl) return;

    try {
      // clone and temporarily scale for better quality
      const canvas = await html2canvas(contentEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // calculate image dimensions to fit A4 width
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      // if the content spans multiple pages
      let remainingHeight = imgHeight - pageHeight;
      while (remainingHeight > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(`pigeon-${id || "view"}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Pigeon Details</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(-1)}
            className="bg-primary border border-primary text-white"
          >
            Back
          </Button>
          {/* <Button type="primary" onClick={handleExportPDF}>
            Export as PDF
          </Button> */}
          <PigeonPdfExport pigeon={pigeonData} siblings={siblingsData} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : pigeonData ? (
        <div className="view-pigeon-wrap" ref={printRef}>
          <div>
            {/* New Start */}
            <div className="flex jsutify-between gap-8 flex-col md:flex-row">
              <div>
                {/* Check if any of the images exist */}
                {pigeonData?.pigeonPhoto ||
                pigeonData?.eyePhoto ||
                pigeonData?.ownershipPhoto ||
                pigeonData?.pedigreePhoto ||
                pigeonData?.DNAPhoto ? (
                  <div className="">
                    {/* ImageSlider with available images */}
                    <ImageSlider
                      photos={[
                        {
                          key: "pigeonPhoto",
                          label: "Pigeon Photo",
                          url: pigeonData?.pigeonPhoto,
                        },
                        {
                          key: "eyePhoto",
                          label: "Eye Photo",
                          url: pigeonData?.eyePhoto,
                        },
                        {
                          key: "ownershipPhoto",
                          label: "Ownership Card",
                          url: pigeonData?.ownershipPhoto,
                        },
                        {
                          key: "pedigreePhoto",
                          label: "Pedigree",
                          url: pigeonData?.pedigreePhoto,
                        },
                        {
                          key: "DNAPhoto",
                          label: "DNA",
                          url: pigeonData?.DNAPhoto,
                        },
                      ].filter((p) => p.url)} // Only include images with valid URLs
                      size={300}
                      // autoplay={true}
                      autoplayInterval={3000}
                      showArrows={true}
                    />
                  </div>
                ) : (
                  // Show placeholder if no images are available
                  <div className="placeholder-container">
                    <img
                      src={PlaceholderImg} // You can replace this with your own placeholder image path
                      alt="No Images Available"
                      style={{
                        width: 300, // Same size as the slider images
                        height: 300,
                        objectFit: "cover",
                        borderRadius: "8px", // Optional: add some styling
                        background: "#f3f4f6", // Light gray background
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="border p-6 rounded-lg flex-1">
                {/* Pigeon Info */}
                <h3 className="font-bold text-[20px] text-primary">
                  Basic Information
                </h3>
                <div className="space-y-2 mt-2">
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Name: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.name)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Ring Number: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.ringNumber)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Birth Year: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.birthYear)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Gender: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.gender)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Color: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.color)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Status: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.status)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Country: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.country)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border p-6 rounded-lg mt-6">
              <div className="flex flex-col md:flex-row gap-6 mb-4">
                <div className="w-full">
                  <p className="font-bold mb-2 text-primary">
                    Father Information
                  </p>

                  {/* Father Information */}
                  <p className="border p-4 rounded-lg">
                    {pigeonData.fatherRingId?.name ? (
                      <div className="flex gap-1">
                        <p className="font-normal text-[14px]">Father: </p>
                        <p className="font-semibold text-[14px]">
                          {safeValue(pigeonData.fatherRingId?.name)}
                        </p>
                      </div>
                    ) : (
                      <p className="font-normal text-[14px] text-gray-400">
                        No Information Available
                      </p>
                    )}
                  </p>
                </div>

                <div className="w-full">
                  <p className="font-bold mb-2 text-primary">
                    Mother Information
                  </p>

                  {/* Mother Information */}
                  <p className="border p-4 rounded-lg">
                    {pigeonData.motherRingId?.name ? (
                      <div className="flex gap-1">
                        <p className="font-normal text-[14px]">Mother: </p>
                        <p className="font-semibold text-[14px]">
                          {safeValue(pigeonData.motherRingId?.name)}
                        </p>
                      </div>
                    ) : (
                      <p className="font-normal text-[14px] text-gray-400">
                        No Information Available
                      </p>
                    )}
                  </p>
                </div>
              </div>
              {/* Pigeon Info */}
              <div>
                <h3 className="font-bold text-[20px] text-primary mt-6">
                  Additional Information
                </h3>
                <div className="space-y-2 mt-2">
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Breeder: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.breeder?.breederName)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">
                      Breeder Loft Name:{" "}
                    </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.breeder?.loftName)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Location: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.location)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">
                      Father Ring Number:{" "}
                    </p>
                    <p className="font-semibold text-[14px] flex items-center">
                      {safeValue(pigeonData.fatherRingId?.ringNumber)}
                      {pigeonData.fatherRingId?.verified && (
                        <img
                          src={VerifyIcon} // replace with the actual image path
                          alt="Verified"
                          style={{ width: 20, height: 20 }}
                          className="ml-1"
                        />
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">
                      Mother Ring Number:{" "}
                    </p>
                    <p className="font-semibold text-[14px] flex items-center">
                      {safeValue(pigeonData.motherRingId?.ringNumber)}
                      {pigeonData.motherRingId?.verified && (
                        <img
                          src={VerifyIcon} // replace with the actual image path
                          alt="Verified"
                          style={{ width: 20, height: 20 }}
                          className="ml-1"
                        />
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Country: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.country)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Status: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.status)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Verified: </p>
                    <p className="font-semibold text-[14px] flex items-center">
                      {pigeonData?.verified === true ? (
                        <>
                          <span className="mr-2">Yes</span>
                          <img
                            src={VerifyIcon}
                            alt="Verified"
                            style={{ width: 20, height: 20 }}
                            className="ml-1"
                          />
                        </>
                      ) : (
                        "No"
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Iconic: </p>
                    <p className="font-semibold text-[14px]">
                      {pigeonData?.iconic === true ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-normal text-[14px]">Iconic Score: </p>
                    <p className="font-semibold text-[14px]">
                      {safeValue(pigeonData.iconicScore) || "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-semibold text-[14px]">
                      Your Story:{" "}
                      <span className="font-normal text-[14px]">
                        {safeValue(pigeonData.shortInfo) || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="flex gap-1 mt-6 border p-4 rounded-lg">
                <p className="font-semibold text-[14px]">
                  Race Results:{" "}
                  <span className="font-normal text-[14px]">
                    {safeValue(pigeonData.addresults) || "N/A"}
                  </span>
                </p>
              </div> */}
              <div className="flex gap-1 mt-6 border p-4 rounded-lg">
                <p className="font-semibold text-[14px]">
                  Race Results:{" "}
                  <span className="font-normal text-[14px]">
                    {Array.isArray(pigeonData.addresults) &&
                    pigeonData.addresults.length > 0
                      ? pigeonData.addresults.map((result, index) => (
                          <div key={index}>{result}</div>
                        ))
                      : "N/A"}
                  </span>
                </p>
              </div>

              {/* Siblings Information */}
              {siblingsData?.length > 0 && (
                <>
                  <h3 className="font-bold text-[20px] text-primary mt-6 mb-1">
                    Siblings Information
                  </h3>
                  <div className="overflow-x-auto border rounded-lg shadow-md bg-gray-50 custom-scrollbar">
                    <div className="border rounded-lg shadow-md bg-gray-50">
                      <div
                        style={
                          {
                            // minWidth: pigeons.length > 0 ? "max-content" : "100%",
                          }
                        }
                        className="bg-[#333D49] rounded-lg"
                      >
                        {loading ? (
                          <div className="flex justify-center items-center p-6">
                            <Spin size="large" />
                          </div>
                        ) : (
                          <Table
                            // rowSelection={rowSelection}
                            dataSource={siblingsData}
                            rowClassName={() => "hover-row"}
                            bordered={false}
                            size="small"
                            // rowKey="_id"
                            // scroll={
                            //   pigeons.length > 0
                            //     ? { x: "max-content" }
                            //     : undefined
                            // }
                            columns={[
                              {
                                title: "Name",
                                dataIndex: "name",
                                key: "name",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Siblings Type",
                                dataIndex: "type",
                                key: "type",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Ring Number",
                                dataIndex: "ringNumber",
                                key: "ringNumber",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Birth Year",
                                dataIndex: "birthYear",
                                key: "birthYear",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Breeder Rating",
                                dataIndex: "breederRating",
                                key: "breederRating",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Racing Rating",
                                dataIndex: "racingRating",
                                key: "racingRating",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Father",
                                dataIndex: "fatherRingId",
                                key: "fatherRingId",
                                render: (value) => value?.ringNumber || "N/A",
                              },
                              {
                                title: "Mother",
                                dataIndex: "motherRingId",
                                key: "motherRingId",
                                render: (value) => value?.ringNumber || "N/A",
                              },
                              {
                                title: "Gender",
                                dataIndex: "gender",
                                key: "gender",
                                render: (value) => value || "N/A",
                              },
                            ]}
                            // pagination={{
                            //   current: page,
                            //   pageSize,
                            //   total,
                            //   showSizeChanger: false,
                            //   onChange: (newPage) => setPage(newPage),
                            // }}
                            pagination={false}
                            components={{
                              header: {
                                cell: (props) => (
                                  <th
                                    {...props}
                                    style={{
                                      height: 70,
                                      lineHeight: "70px",
                                      background: "#333D49",
                                      color: "#ffffff",
                                      fontWeight: 600,
                                      padding: "0 16px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {props.children}
                                  </th>
                                ),
                              },
                              body: {
                                cell: (props) => (
                                  <td
                                    {...props}
                                    style={{
                                      background: "#212B35",
                                      padding: "12px 16px",
                                      color: "#ffffff",
                                      borderBottom: "none",
                                    }}
                                  >
                                    {props.children}
                                  </td>
                                ),
                              },
                            }}
                            locale={{
                              emptyText: (
                                <div className="py-10 text-gray-400 text-center">
                                  No pigeons found 🕊️
                                </div>
                              ),
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Race Results */}
              {pigeonData.results?.length > 0 && (
                <>
                  <h3 className="font-bold text-[20px] text-primary mt-6 mb-1">
                    Race Results
                  </h3>
                  <div className="overflow-x-auto border rounded-lg shadow-md bg-gray-50 custom-scrollbar">
                    <div className="border rounded-lg shadow-md bg-gray-50">
                      <div
                        style={
                          {
                            // minWidth: pigeons.length > 0 ? "max-content" : "100%",
                          }
                        }
                        className="bg-[#333D49] rounded-lg"
                      >
                        {loading ? (
                          <div className="flex justify-center items-center p-6">
                            <Spin size="large" />
                          </div>
                        ) : (
                          <Table
                            // rowSelection={rowSelection}
                            dataSource={pigeonData.results}
                            rowClassName={() => "hover-row"}
                            bordered={false}
                            size="small"
                            // rowKey="_id"
                            // scroll={
                            //   pigeons.length > 0
                            //     ? { x: "max-content" }
                            //     : undefined
                            // }
                            columns={[
                              {
                                title: "SL",
                                key: "index",
                                render: (_, __, index) => index + 1,
                                width: 60,
                              },
                              {
                                title: "Name",
                                dataIndex: "name",
                                key: "name",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Date",
                                dataIndex: "date",
                                key: "date",
                                render: (d) =>
                                  d ? new Date(d).toLocaleDateString() : "N/A",
                              },
                              {
                                title: "Distance",
                                dataIndex: "distance",
                                key: "distance",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Total",
                                dataIndex: "total",
                                key: "total",
                                render: (value) => value || "N/A",
                              },
                              {
                                title: "Place",
                                dataIndex: "place",
                                key: "place",
                                render: (value) => value || "N/A",
                              },
                            ]}
                            // pagination={{
                            //   current: page,
                            //   pageSize,
                            //   total,
                            //   showSizeChanger: false,
                            //   onChange: (newPage) => setPage(newPage),
                            // }}
                            pagination={false}
                            components={{
                              header: {
                                cell: (props) => (
                                  <th
                                    {...props}
                                    style={{
                                      height: 70,
                                      lineHeight: "70px",
                                      background: "#333D49",
                                      color: "#ffffff",
                                      fontWeight: 600,
                                      padding: "0 16px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {props.children}
                                  </th>
                                ),
                              },
                              body: {
                                cell: (props) => (
                                  <td
                                    {...props}
                                    style={{
                                      background: "#212B35",
                                      padding: "12px 16px",
                                      color: "#ffffff",
                                      borderBottom: "none",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {props.children}
                                  </td>
                                ),
                              },
                            }}
                            locale={{
                              emptyText: (
                                <div className="py-10 text-gray-400 text-center">
                                  No pigeons found 🕊️
                                </div>
                              ),
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-1 mt-4">
                <p className="font-semibold text-[14px]">
                  Additional Notes:{" "}
                  <span className="font-normal text-[14px]">
                    {safeValue(pigeonData.notes) || "N/A"}
                  </span>
                </p>
                {/* <p className="font-normal text-[14px]">
                  {safeValue(pigeonData.notes)}
                </p> */}
              </div>
            </div>

            {/* New End */}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">No data found 🕊️</div>
      )}
    </div>
  );
};

export default ViewPigeon;
