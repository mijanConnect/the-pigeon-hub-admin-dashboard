import { Spin, message } from "antd";
import jsPDF from "jspdf";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useGetSiblingsQuery,
  useGetSinglePigeonQuery,
} from "../../../redux/apiSlices/mypigeonSlice";
import { addresultsArrayToHtml } from "../../common/share/richTextUtils";
import { renderRichTextToPdf } from "../../common/share/richTextPdf";

const ExportPdfSinglePigeon = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const origin = location?.state?.from || "/my-pigeon";
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const runOnceRef = useRef(false);

  const { data: pigeonResp, isLoading: loading } = useGetSinglePigeonQuery(id, {
    skip: !id,
  });
  const pigeon = pigeonResp?.data || null;

  const { data: siblingsResp, isLoading: siblingsLoading } =
    useGetSiblingsQuery(id, { skip: !id });
  const siblings = siblingsResp?.data?.siblings || [];

  const getImageUrl = (path) => {
    if (!path) {
      return "https://i.ibb.co/fYZx5zCP/Region-Gallery-Viewer.png";
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const baseUrl = import.meta.env.VITE_ASSET_BASE_URL;
    return `${baseUrl}/${path}`;
  };

  const getBase64FromUrl = async (url) => {
    try {
      const imageUrl = getImageUrl(url);
      const token = localStorage.getItem("token");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const response = await fetch(imageUrl, {
        mode: "cors",
        cache: "no-cache",
        headers,
      });

      if (!response.ok) {
        console.error(`Failed to load image: ${response.status}`);
        return null;
      }

      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error loading image:", error);
      return null;
    }
  };

  const renderHtmlContent = (
    html,
    startX,
    startY,
    maxWidth,
    pdf,
    options = {},
  ) => {
    return renderRichTextToPdf({
      pdf,
      html,
      x: startX,
      y: startY,
      maxWidth,
      lineHeight: options.lineHeight ?? 2.5,
      listIndent: options.listIndent ?? 2.3,
      blockSpacing: options.blockSpacing,
      itemSpacing: options.itemSpacing,
    });
  };

  const handleExportPDF = async () => {
    if (!pigeon) {
      message.error("Pigeon data not loaded");
      return;
    }

    setPdfGenerating(true);

    console.log(
      "[ExportPdf2] handleExportPDF started for pigeon:",
      pigeon?._id,
    );

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      const checkPageBreak = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      const addSectionHeader = (title, yPos) => {
        pdf.setFillColor(55, 183, 195);
        pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin + 2, yPos);
        pdf.setTextColor(0, 0, 0);
      };

      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Pigeon Overview Report", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Generated on: ${moment().format("DD MMM YYYY, hh:mm A")}`,
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );
      yPosition += 15;

      const imageSource =
        pigeon?.pigeonPhoto || pigeon?.eyePhoto || pigeon?.pedigreePhoto;
      let base64Image = null;
      if (imageSource) {
        base64Image = await getBase64FromUrl(imageSource);
      }

      const leftColumnX = margin;
      const rightColumnX = margin + 85;
      const imageSize = 60;
      const contentStartY = yPosition;

      if (base64Image) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.rect(
          leftColumnX - 1,
          contentStartY - 1,
          imageSize + 2,
          imageSize + 2,
        );
        pdf.addImage(
          base64Image,
          "JPEG",
          leftColumnX,
          contentStartY,
          imageSize,
          imageSize,
        );
      } else {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(leftColumnX, contentStartY, imageSize, imageSize, "F");
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "No Image",
          leftColumnX + imageSize / 2,
          contentStartY + imageSize / 2,
          { align: "center" },
        );
        pdf.setTextColor(0, 0, 0);
      }

      let rightY = contentStartY;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Basic Information", rightColumnX, rightY);
      rightY += 10;

      const basicInfo = [
        { label: "Name", value: String(pigeon?.name || "N/A"), bold: true },
        { label: "Ring Number", value: String(pigeon?.ringNumber || "N/A") },
        { label: "Birth Year", value: String(pigeon?.birthYear || "N/A") },
        { label: "Gender", value: String(pigeon?.gender || "N/A") },
        { label: "Color", value: String(pigeon?.color || "N/A") },
        { label: "Country", value: String(pigeon?.country || "N/A") },
        { label: "Status", value: String(pigeon?.status || "Racing") },
      ];

      pdf.setFontSize(9);
      basicInfo.forEach((item) => {
        pdf.setFont("helvetica", "normal");
        const label = `${item.label}: `;
        pdf.text(label, rightColumnX, rightY);
        const labelWidth = pdf.getTextWidth(label);
        pdf.setFont("helvetica", item.bold ? "bold" : "normal");
        pdf.text(item.value, rightColumnX + labelWidth, rightY);
        rightY += 8;
      });

      yPosition = Math.max(contentStartY + imageSize + 15, rightY + 10);
      checkPageBreak(60);

      const parentsStartY = yPosition;
      const leftParentX = margin;
      const rightParentX = pageWidth / 2 + 5;
      const columnWidth = (pageWidth - 2 * margin - 10) / 2;

      addSectionHeader("Father Information", parentsStartY);
      let fatherY = parentsStartY + 10;
      const fatherInfo = [
        { label: "Name", value: String(pigeon?.fatherRingId?.name || "N/A") },
        {
          label: "Ring Number",
          value: String(pigeon?.fatherRingId?.ringNumber || "N/A"),
        },
        {
          label: "Birth Year",
          value: String(pigeon?.fatherRingId?.birthYear || "N/A"),
        },
        {
          label: "Country",
          value: String(pigeon?.fatherRingId?.country || "N/A"),
        },
        {
          label: "Gender",
          value: String(pigeon?.fatherRingId?.gender || "N/A"),
        },
        {
          label: "Breeder",
          value: String(pigeon?.fatherRingId?.breeder?.loftName || "N/A"),
        },
      ];

      pdf.setFontSize(8);
      fatherInfo.forEach((item) => {
        pdf.setFont("helvetica", "normal");
        const label = `${item.label}: `;
        pdf.text(label, leftParentX, fatherY);
        const labelWidth = pdf.getTextWidth(label);
        pdf.setFont("helvetica", "bold");
        const valueLines = pdf.splitTextToSize(
          item.value,
          columnWidth - labelWidth - 2,
        );
        pdf.text(valueLines[0], leftParentX + labelWidth, fatherY);
        fatherY += 7;
      });

      if (pigeon?.fatherRingId?.shortInfo) {
        fatherY += 3;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("Story:", leftParentX, fatherY);
        fatherY += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        fatherY = renderHtmlContent(
          pigeon.fatherRingId.shortInfo,
          leftParentX,
          fatherY,
          columnWidth - 2,
          pdf,
        );
        fatherY += 3;
      }

      if (
        Array.isArray(pigeon?.fatherRingId?.addresults) &&
        pigeon.fatherRingId.addresults.length > 0
      ) {
        fatherY += 3;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("Results:", leftParentX, fatherY);
        fatherY += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        fatherY = renderHtmlContent(
          addresultsArrayToHtml(pigeon.fatherRingId.addresults),
          leftParentX,
          fatherY,
          columnWidth - 2,
          pdf,
        );
      }

      pdf.setFillColor(55, 183, 195);
      pdf.rect(rightParentX, parentsStartY - 5, columnWidth, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Mother Information", rightParentX + 2, parentsStartY);
      pdf.setTextColor(0, 0, 0);

      let motherY = parentsStartY + 10;
      const motherInfo = [
        { label: "Name", value: String(pigeon?.motherRingId?.name || "N/A") },
        {
          label: "Ring Number",
          value: String(pigeon?.motherRingId?.ringNumber || "N/A"),
        },
        {
          label: "Birth Year",
          value: String(pigeon?.motherRingId?.birthYear || "N/A"),
        },
        {
          label: "Country",
          value: String(pigeon?.motherRingId?.country || "N/A"),
        },
        {
          label: "Gender",
          value: String(pigeon?.motherRingId?.gender || "N/A"),
        },
        {
          label: "Breeder",
          value: String(pigeon?.motherRingId?.breeder?.loftName || "N/A"),
        },
      ];

      pdf.setFontSize(8);
      motherInfo.forEach((item) => {
        pdf.setFont("helvetica", "normal");
        const label = `${item.label}: `;
        pdf.text(label, rightParentX, motherY);
        const labelWidth = pdf.getTextWidth(label);
        pdf.setFont("helvetica", "bold");
        const valueLines = pdf.splitTextToSize(
          item.value,
          columnWidth - labelWidth - 2,
        );
        pdf.text(valueLines[0], rightParentX + labelWidth, motherY);
        motherY += 7;
      });

      if (pigeon?.motherRingId?.shortInfo) {
        motherY += 3;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("Story:", rightParentX, motherY);
        motherY += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        motherY = renderHtmlContent(
          pigeon.motherRingId.shortInfo,
          rightParentX,
          motherY,
          columnWidth - 2,
          pdf,
        );
        motherY += 3;
      }

      if (
        Array.isArray(pigeon?.motherRingId?.addresults) &&
        pigeon.motherRingId.addresults.length > 0
      ) {
        motherY += 3;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("Results:", rightParentX, motherY);
        motherY += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        motherY = renderHtmlContent(
          addresultsArrayToHtml(pigeon.motherRingId.addresults),
          rightParentX,
          motherY,
          columnWidth - 2,
          pdf,
        );
      }

      yPosition = Math.max(fatherY, motherY) + 10;
      checkPageBreak(50);
      addSectionHeader("Additional Information", yPosition);
      yPosition += 10;

      const additionalInfo = [
        {
          label: "Breeder",
          value: String(pigeon?.breeder?.breederName || "N/A"),
        },
        {
          label: "Breeder Loft Name",
          value: String(pigeon?.breeder?.loftName || "N/A"),
        },
        { label: "Location", value: String(pigeon?.location || "N/A") },
        {
          label: "Father Ring Number",
          value: String(pigeon?.fatherRingId?.ringNumber || "N/A"),
        },
        {
          label: "Mother Ring Number",
          value: String(pigeon?.motherRingId?.ringNumber || "N/A"),
        },
        { label: "Country", value: String(pigeon?.country || "N/A") },
        { label: "Status", value: String(pigeon?.status || "N/A") },
      ];

      pdf.setFontSize(9);
      additionalInfo.forEach((item) => {
        checkPageBreak(6);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${item.label}: `, margin, yPosition);
        const labelWidth = pdf.getTextWidth(`${item.label}: `);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.value, margin + labelWidth, yPosition);
        yPosition += 6;
      });

      if (pigeon?.shortInfo) {
        yPosition += 5;
        checkPageBreak(10);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("Your Story:", margin, yPosition);
        yPosition += 6;
        pdf.setFont("helvetica", "normal");
        yPosition = renderHtmlContent(
          pigeon.shortInfo,
          margin,
          yPosition,
          pageWidth - 2 * margin,
          pdf,
        );
        yPosition += 5;
      }

      if (pigeon?.notes) {
        yPosition += 5;
        checkPageBreak(10);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("Notes:", margin, yPosition);
        yPosition += 6;
        pdf.setFont("helvetica", "normal");
        const notes = String(pigeon.notes ?? "").trim();
        if (/<[a-z][\s\S]*>/i.test(notes)) {
          yPosition = renderHtmlContent(
            notes,
            margin,
            yPosition,
            pageWidth - 2 * margin,
            pdf,
          );
        } else {
          const notesLines = pdf.splitTextToSize(notes, pageWidth - 2 * margin);
          notesLines.forEach((line) => {
            checkPageBreak(5);
            pdf.text(line, margin, yPosition);
            yPosition += 5;
          });
        }
        yPosition += 5;
      }

      if (siblings && siblings.length > 0) {
        checkPageBreak(60);
        addSectionHeader("Siblings Information", yPosition);
        yPosition += 10;

        const colWidths = {
          name: 28,
          type: 26,
          ring: 22,
          year: 16,
          breeder: 16,
          racer: 18,
          father: 18,
          mother: 18,
          gender: 16,
        };

        let xPos = margin;
        pdf.setFillColor(45, 45, 45);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text("Name", xPos + 1, yPosition);
        xPos += colWidths.name;
        pdf.text("Siblings Type", xPos + 1, yPosition);
        xPos += colWidths.type;
        pdf.text("Ring Number", xPos + 1, yPosition);
        xPos += colWidths.ring;
        pdf.text("Birth Year", xPos + 1, yPosition);
        xPos += colWidths.year;
        pdf.text("Breeder", xPos + 1, yPosition);
        xPos += colWidths.breeder;
        pdf.text("Racer Rating", xPos + 1, yPosition);
        xPos += colWidths.racer;
        pdf.text("Father", xPos + 1, yPosition);
        xPos += colWidths.father;
        pdf.text("Mother", xPos + 1, yPosition);
        xPos += colWidths.mother;
        pdf.text("Gender", xPos + 1, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 5;

        pdf.setFont("helvetica", "normal");
        siblings.forEach((sibling, index) => {
          checkPageBreak(10);
          xPos = margin;
          const rowY = yPosition;
          if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
          } else {
            pdf.setFillColor(240, 240, 240);
          }
          pdf.rect(margin, rowY - 4, pageWidth - 2 * margin, 8, "F");
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.1);
          pdf.line(margin, rowY + 4, pageWidth - margin, rowY + 4);
          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0);

          const truncate = (text, width) => {
            const textStr = String(text || "N/A");
            const lines = pdf.splitTextToSize(textStr, width - 2);
            return lines[0];
          };

          pdf.text(truncate(sibling.name, colWidths.name), xPos + 1, rowY);
          xPos += colWidths.name;
          pdf.text(truncate(sibling.type, colWidths.type), xPos + 1, rowY);
          xPos += colWidths.type;
          pdf.text(truncate(sibling.ringNumber, colWidths.ring), xPos + 1, rowY);
          xPos += colWidths.ring;
          pdf.text(truncate(sibling.birthYear, colWidths.year), xPos + 1, rowY);
          xPos += colWidths.year;
          pdf.text(
            truncate(sibling.breederRating, colWidths.breeder),
            xPos + 1,
            rowY,
          );
          xPos += colWidths.breeder;
          pdf.text(
            truncate(sibling.racingRating, colWidths.racer),
            xPos + 1,
            rowY,
          );
          xPos += colWidths.racer;
          pdf.text(
            truncate(sibling.fatherRingId?.ringNumber, colWidths.father),
            xPos + 1,
            rowY,
          );
          xPos += colWidths.father;
          pdf.text(
            truncate(sibling.motherRingId?.ringNumber, colWidths.mother),
            xPos + 1,
            rowY,
          );
          xPos += colWidths.mother;
          pdf.text(truncate(sibling.gender, colWidths.gender), xPos + 1, rowY);
          yPosition += 8;
        });
        yPosition += 5;
      }

      if (
        pigeon?.addresults &&
        Array.isArray(pigeon.addresults) &&
        pigeon.addresults.length > 0
      ) {
        checkPageBreak(20);
        addSectionHeader("Race Results", yPosition);
        yPosition += 10;

        pigeon.addresults.forEach((result) => {
          checkPageBreak(6);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          yPosition += 3;
          yPosition = renderHtmlContent(
            result,
            margin + 4,
            yPosition,
            pageWidth - 2 * margin - 4,
            pdf,
          );
          yPosition += 14;
        });
      }

      const fileName = `Pigeon_${
        pigeon?.ringNumber || "Report"
      }_${moment().format("YYYYMMDD")}.pdf`;
      pdf.save(fileName);
      message.success("PDF downloaded successfully!");

      setTimeout(() => {
        navigate(origin);
      }, 1500);
      setPdfGenerating(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error(
        `Failed to generate PDF: ${error?.message || "Unknown error. Please try again."}`,
      );
      setPdfGenerating(false);
    }
  };

  useEffect(() => {
    if (runOnceRef.current) return;
    if (!loading && !siblingsLoading && pigeon && id) {
      runOnceRef.current = true;
      console.log(
        "[ExportPdf2] both pigeon and siblings ready, running export",
        { pigeonId: id },
      );
      handleExportPDF();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pigeon, loading, siblingsLoading, id]);

  if (loading || pdfGenerating) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {loading ? "Loading pigeon data..." : "Generating PDF..."}
          </p>
        </div>
      </div>
    );
  }

  if (!pigeon) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">Pigeon not found</p>
          <button
            onClick={() => navigate("/my-pigeon")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Processing your request...
        </p>
      </div>
    </div>
  );
};

export default ExportPdfSinglePigeon;
