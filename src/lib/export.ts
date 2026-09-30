import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadBlob, toCsv, formatDateTime, formatCoords } from "./utils";
import type { Defect } from "@/types/defect";
import type { ChallanReference } from "@/types/violation";
import type { AnalyticsData } from "@/types/analytics";
import type { InvestigationCase, BusFootageResult } from "@/types/investigation";
import { DEFECT_LABELS, VIOLATION_LABELS, CONGESTION_LABELS } from "./constants";

export function exportDefectsCsv(defects: Defect[], filename = "defects-report.csv") {
  const headers = ["ID", "Type", "Ward", "Zone", "Lat", "Lng", "Confidence", "Status", "Detected at", "Bus ID"];
  const rows = defects.map((d) => [
    d.id,
    DEFECT_LABELS[d.type] ?? d.type,
    d.ward,
    d.zone,
    d.lat.toFixed(6),
    d.lng.toFixed(6),
    `${d.confidence.toFixed(0)}%`,
    d.status,
    formatDateTime(d.detectedAt),
    d.busId,
  ]);
  downloadBlob(filename, toCsv(headers, rows), "text/csv;charset=utf-8");
}

export function exportDefectsPdf(defects: Defect[], filename = "defects-report.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Road Condition & Infrastructure Defects Report", 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString("en-IN")} · ${defects.length} defects`, 14, 22);
  autoTable(doc, {
    head: [["ID", "Type", "Ward", "Confidence", "Status", "Detected at", "Location"]],
    body: defects.map((d) => [
      d.id,
      DEFECT_LABELS[d.type] ?? d.type,
      d.ward,
      `${d.confidence.toFixed(0)}%`,
      d.status,
      formatDateTime(d.detectedAt),
      formatCoords(d.lat, d.lng),
    ]),
    startY: 26,
    headStyles: { fillColor: [15, 118, 160] },
    styles: { fontSize: 8 },
  });
  doc.save(filename);
}

export function exportChallanHistoryPdf(refs: ChallanReference[], filename = "challan-references.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("E-Challan Reference History", 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString("en-IN")} · ${refs.length} references`, 14, 22);
  autoTable(doc, {
    head: [["Application ID", "Plate", "Violation", "Status", "Detected at", "Location"]],
    body: refs.map((r) => [
      r.applicationId,
      r.plateNumber,
      VIOLATION_LABELS[r.violationType] ?? r.violationType,
      r.status,
      formatDateTime(r.detectedAt),
      r.locationLabel,
    ]),
    startY: 26,
    headStyles: { fillColor: [15, 118, 160] },
    styles: { fontSize: 8 },
  });
  doc.save(filename);
}

export function exportAnalyticsPdf(data: AnalyticsData, rangeLabel: string, filename = "congestion-analytics.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Congestion & Traffic Analytics Report", 14, 16);
  doc.setFontSize(9);
  doc.text(`Period: ${rangeLabel} · Generated ${new Date().toLocaleString("en-IN")}`, 14, 22);
  autoTable(doc, {
    head: [["Route", "Avg speed (km/h)", "Congestion index", "Vehicle count"]],
    body: data.topRoutes.map((r) => [r.routeName, r.avgSpeed.toFixed(0), r.congestionIndex.toFixed(2), r.vehicleCount]),
    startY: 26,
    headStyles: { fillColor: [15, 118, 160] },
    styles: { fontSize: 8 },
  });
  const peak = data.hourly.reduce((max, h) => (h.vehicleCount > max.vehicleCount ? h : max), data.hourly[0]);
  const cursorY = 26 + data.topRoutes.length * 8 + 8;
  doc.text(`Peak hour: ${peak.hour} — ${peak.vehicleCount} vehicles`, 14, cursorY);
  doc.text(
    `Congestion: ${data.zones
      .map((z) => `${z.name} (${CONGESTION_LABELS[z.level]})`)
      .slice(0, 8)
      .join(", ")}${data.zones.length > 8 ? " …" : ""}`,
    14,
    cursorY + 6,
  );
  doc.save(filename);
}

export function exportInvestigationResultPdf(result: BusFootageResult[], filename = "investigation-results.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Investigation Footage Search Results", 14, 16);
  autoTable(doc, {
    head: [["Bus", "Vehicle", "Route", "Entered zone", "Exited zone", "Cameras available"]],
    body: result.map((r) => [
      r.busId,
      r.vehicleNumber,
      r.routeName,
      formatDateTime(r.enteredAt),
      formatDateTime(r.exitedAt),
      r.camerasAvailable.length,
    ]),
    startY: 24,
    headStyles: { fillColor: [15, 118, 160] },
    styles: { fontSize: 8 },
  });
  doc.save(filename);
}

export function exportCaseMetadataPdf(caseItem: InvestigationCase, filename = `case-${caseItem.id}.pdf`) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(caseItem.title, 14, 16);
  doc.setFontSize(9);
  doc.text(`Case ID: ${caseItem.id}`, 14, 22);
  doc.text(`Created: ${formatDateTime(caseItem.createdAt)}`, 14, 28);
  doc.text(`Updated: ${formatDateTime(caseItem.updatedAt)}`, 14, 33);
  doc.text(
    `Search window: ${formatDateTime(caseItem.searchParams.from)} → ${formatDateTime(caseItem.searchParams.to)}`,
    14,
    38,
  );
  doc.text("Clips:", 14, 46);
  autoTable(doc, {
    head: [["Bus", "Title", "From", "To", "Cameras"]],
    body: caseItem.clips.map((c) => [c.vehicleNumber, c.title, formatDateTime(c.from), formatDateTime(c.to), c.cameras.join(", ")]),
    startY: 50,
    headStyles: { fillColor: [15, 118, 160] },
    styles: { fontSize: 8 },
  });
  if (caseItem.notes) {
    const cursorY = 52 + caseItem.clips.length * 8;
    doc.text("Notes:", 14, cursorY);
    doc.text(caseItem.notes, 14, cursorY + 6);
  }
  doc.save(filename);
}