import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isManager = session.role === "MANAGER" || session.role === "ADMIN";

  const [screenings, patients] = await Promise.all([
    prisma.screening.findMany({
      where: { archivedAt: null },
      orderBy: { screeningDatetime: "desc" },
      include: {
        patient: true,
        enteredBy: { select: { fullName: true, cadre: true, facilityName: true } },
        reviewedBy: { select: { fullName: true } },
      },
    }),
    prisma.patient.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { screenings: true } } },
    }),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "OGH SCD E-Tracker";
  wb.created = new Date();

  // Header style
  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A5276" } },
    alignment: { horizontal: "center" },
    border: {
      bottom: { style: "thin", color: { argb: "FF000000" } },
    },
  };

  // Sheet 1: Screenings
  const ws1 = wb.addWorksheet("Screenings");
  ws1.columns = [
    { header: "No.", key: "no", width: 5 },
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "First Name", key: "firstName", width: 15 },
    { header: "Last Name", key: "lastName", width: 15 },
    { header: "Sex", key: "sex", width: 8 },
    { header: "Date of Birth", key: "dob", width: 14 },
    { header: "Phone Number", key: "phone", width: 15 },
    { header: "Ethnicity", key: "ethnicity", width: 12 },
    { header: "NHIS Status", key: "nhis", width: 12 },
    { header: "Address", key: "address", width: 20 },
    { header: "District", key: "district", width: 15 },
    { header: "Locality", key: "locality", width: 15 },
    { header: "Screening Date", key: "screenDate", width: 14 },
    { header: "Screening Time", key: "screenTime", width: 14 },
    { header: "Screening Type", key: "screenType", width: 14 },
    { header: "Screening Result (Hemotype SC)", key: "result", width: 30 },
    { header: "Confirmed Test", key: "confirmedTest", width: 14 },
    { header: "Confirmed Result", key: "confirmedResult", width: 16 },
    { header: "Confirmatory Action", key: "confirmatoryAction", width: 20 },
    { header: "Remarks", key: "remarks", width: 25 },
    { header: "Treatment Started", key: "treatment", width: 16 },
    { header: "Treatment Start Date", key: "treatDate", width: 18 },
    { header: "Medication / Plan", key: "medication", width: 20 },
    { header: "Treatment Notes", key: "treatNotes", width: 20 },
    { header: "Referral Notes", key: "referralNotes", width: 20 },
    { header: "Facility", key: "facility", width: 20 },
    { header: "Entered By", key: "enteredBy", width: 18 },
    { header: "Cadre", key: "cadre", width: 18 },
    { header: "Review Status", key: "reviewStatus", width: 14 },
    { header: "Review Note", key: "reviewNote", width: 20 },
    { header: "Reviewed By", key: "reviewedBy", width: 18 },
    { header: "Reviewed At", key: "reviewedAt", width: 18 },
  ];

  ws1.getRow(1).eachCell(cell => { Object.assign(cell, headerStyle); });

  screenings.forEach((s, i) => {
    ws1.addRow({
      no: i + 1,
      patientId: s.patient.patientCode,
      firstName: s.patient.firstName,
      lastName: s.patient.lastName,
      sex: s.patient.sex,
      dob: new Date(s.patient.dateOfBirth).toLocaleDateString("en-GB"),
      phone: isManager ? s.patient.phoneNumber : "***masked***",
      ethnicity: s.patient.ethnicity ?? "",
      nhis: s.patient.nhisStatus,
      address: isManager ? (s.patient.address ?? "") : "***masked***",
      district: s.patient.district ?? "",
      locality: s.patient.locality ?? "",
      screenDate: new Date(s.screeningDatetime).toLocaleDateString("en-GB"),
      screenTime: new Date(s.screeningDatetime).toLocaleTimeString("en-GB"),
      screenType: s.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn",
      result: s.screeningResult,
      confirmedTest: s.confirmedTest ? "Yes" : "No",
      confirmedResult: s.confirmedResult ?? "",
      confirmatoryAction: s.confirmatoryAction,
      remarks: isManager ? (s.remarks ?? "") : "",
      treatment: s.treatmentStarted ? "Yes" : "No",
      treatDate: s.treatmentStartDate
        ? new Date(s.treatmentStartDate).toLocaleDateString("en-GB") : "",
      medication: isManager ? (s.medicationPlan ?? "") : "",
      treatNotes: isManager ? (s.treatmentNotes ?? "") : "",
      referralNotes: isManager ? (s.referralNotes ?? "") : "",
      facility: s.facilityName ?? "",
      enteredBy: s.enteredBy.fullName,
      cadre: s.enteredBy.cadre,
      reviewStatus: s.reviewStatus,
      reviewNote: s.reviewNote ?? "",
      reviewedBy: s.reviewedBy?.fullName ?? "",
      reviewedAt: s.reviewedAt
        ? new Date(s.reviewedAt).toLocaleString("en-GB") : "",
    });
  });

  // Alternate row colors
  ws1.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell(cell => {
        cell.fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: rowNumber % 2 === 0 ? "FFF2F8FF" : "FFFFFFFF" },
        };
      });
    }
  });

  // Sheet 2: Patients
  const ws2 = wb.addWorksheet("Patients");
  ws2.columns = [
    { header: "No.", key: "no", width: 5 },
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "First Name", key: "firstName", width: 15 },
    { header: "Last Name", key: "lastName", width: 15 },
    { header: "Sex", key: "sex", width: 8 },
    { header: "Date of Birth", key: "dob", width: 14 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Ethnicity", key: "ethnicity", width: 12 },
    { header: "NHIS Status", key: "nhis", width: 12 },
    { header: "District", key: "district", width: 15 },
    { header: "Locality", key: "locality", width: 15 },
    { header: "Total Visits", key: "visits", width: 12 },
    { header: "Registered On", key: "registeredOn", width: 14 },
  ];

  ws2.getRow(1).eachCell(cell => { Object.assign(cell, headerStyle); });

  patients.forEach((p, i) => {
    ws2.addRow({
      no: i + 1,
      patientId: p.patientCode,
      firstName: p.firstName,
      lastName: p.lastName,
      sex: p.sex,
      dob: new Date(p.dateOfBirth).toLocaleDateString("en-GB"),
      phone: isManager ? p.phoneNumber : "***masked***",
      ethnicity: p.ethnicity ?? "",
      nhis: p.nhisStatus,
      district: p.district ?? "",
      locality: p.locality ?? "",
      visits: p._count.screenings,
      registeredOn: new Date(p.createdAt).toLocaleDateString("en-GB"),
    });
  });

  ws2.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell(cell => {
        cell.fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: rowNumber % 2 === 0 ? "FFF2F8FF" : "FFFFFFFF" },
        };
      });
    }
  });

  // Sheet 3: Summary Statistics
  const ws3 = wb.addWorksheet("Summary Statistics");
  ws3.columns = [
    { header: "Category", key: "category", width: 20 },
    { header: "Label", key: "label", width: 30 },
    { header: "Count", key: "count", width: 10 },
  ];
  ws3.getRow(1).eachCell(cell => { Object.assign(cell, headerStyle); });

  const total = screenings.length;
  const catchUp = screenings.filter(s => s.screeningType === "CATCH_UP").length;
  const newborn = screenings.filter(s => s.screeningType === "NEWBORN").length;
  const male = screenings.filter(s => s.patient.sex === "MALE").length;
  const female = screenings.filter(s => s.patient.sex === "FEMALE").length;
  const treatYes = screenings.filter(s => s.treatmentStarted).length;
  const pending = screenings.filter(s => s.reviewStatus === "PENDING").length;
  const approved = screenings.filter(s => s.reviewStatus === "APPROVED").length;
  const flagged = screenings.filter(s => s.reviewStatus === "FLAGGED").length;
  const corrected = screenings.filter(s => s.reviewStatus === "CORRECTED").length;

  const resultCounts: Record<string, number> = {};
  screenings.forEach(s => {
    resultCounts[s.screeningResult] = (resultCounts[s.screeningResult] || 0) + 1;
  });

  const summaryData = [
    ["SCREENING TYPE", "Catch-Up", catchUp],
    ["SCREENING TYPE", "Newborn", newborn],
    ["SCREENING TYPE", "TOTAL", total],
    ["", "", ""],
    ["SEX", "Male", male],
    ["SEX", "Female", female],
    ["", "", ""],
    ["TREATMENT", "Started", treatYes],
    ["TREATMENT", "Not Started", total - treatYes],
    ["", "", ""],
    ["REVIEW STATUS", "Pending", pending],
    ["REVIEW STATUS", "Approved", approved],
    ["REVIEW STATUS", "Flagged", flagged],
    ["REVIEW STATUS", "Corrected", corrected],
    ["", "", ""],
    ...Object.entries(resultCounts).map(([label, count]) => ["RESULT", label, count]),
    ["", "", ""],
    ["EXPORT INFO", "Generated By", session.fullName],
    ["EXPORT INFO", "Date", new Date().toLocaleString("en-GB")],
  ];

  summaryData.forEach(([category, label, count]) => {
    ws3.addRow({ category, label, count });
  });

  // Sheet 4: Monthly Trend
  const ws4 = wb.addWorksheet("Monthly Trend");
  ws4.columns = [
    { header: "Month", key: "month", width: 15 },
    { header: "Screenings", key: "count", width: 12 },
  ];
  ws4.getRow(1).eachCell(cell => { Object.assign(cell, headerStyle); });

  const monthlyData: Record<string, number> = {};
  screenings.forEach(s => {
    const month = new Date(s.screeningDatetime).toLocaleDateString("en-GB", {
      year: "numeric", month: "short"
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  Object.entries(monthlyData).forEach(([month, count]) => {
    ws4.addRow({ month, count });
  });

  // Sheet 5: Locality Distribution
  const ws5 = wb.addWorksheet("Locality Distribution");
  ws5.columns = [
    { header: "Locality", key: "locality", width: 20 },
    { header: "Screenings", key: "count", width: 12 },
  ];
  ws5.getRow(1).eachCell(cell => { Object.assign(cell, headerStyle); });

  const localityData: Record<string, number> = {};
  screenings.forEach(s => {
    const loc = s.patient.locality || "Unknown";
    localityData[loc] = (localityData[loc] || 0) + 1;
  });

  Object.entries(localityData)
    .sort(([, a], [, b]) => b - a)
    .forEach(([locality, count]) => {
      ws5.addRow({ locality, count });
    });

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `OGH-SCD-Report-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
