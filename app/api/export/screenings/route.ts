import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

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

  // Sheet 1: All screening records - every field
  const screeningRows = screenings.map((s, i) => ({
    "No.": i + 1,
    "Patient ID": s.patient.patientCode,
    "First Name": s.patient.firstName,
    "Last Name": s.patient.lastName,
    "Sex": s.patient.sex,
    "Date of Birth": new Date(s.patient.dateOfBirth).toLocaleDateString("en-GB"),
    "Phone Number": isManager ? s.patient.phoneNumber : "***masked***",
    "Ethnicity": s.patient.ethnicity ?? "",
    "NHIS Status": s.patient.nhisStatus,
    "Address": isManager ? (s.patient.address ?? "") : "***masked***",
    "District": s.patient.district ?? "",
    "Locality / Community": s.patient.locality ?? "",
    "Screening Date": new Date(s.screeningDatetime).toLocaleDateString("en-GB"),
    "Screening Time": new Date(s.screeningDatetime).toLocaleTimeString("en-GB"),
    "Screening Type": s.screeningType === "CATCH_UP" ? "Catch-Up" : "Newborn",
    "Screening Result (Hemotype SC)": s.screeningResult,
    "Confirmed Test Done": s.confirmedTest ? "Yes" : "No",
    "Confirmed Result": s.confirmedResult ?? "",
    "Confirmatory Action": s.confirmatoryAction,
    "Remarks": isManager ? (s.remarks ?? "") : "",
    "Treatment Started": s.treatmentStarted ? "Yes" : "No",
    "Treatment Start Date": s.treatmentStartDate
      ? new Date(s.treatmentStartDate).toLocaleDateString("en-GB") : "",
    "Medication / Plan": isManager ? (s.medicationPlan ?? "") : "",
    "Treatment Notes": isManager ? (s.treatmentNotes ?? "") : "",
    "Referral Notes": isManager ? (s.referralNotes ?? "") : "",
    "Facility Name": s.facilityName ?? "",
    "Entered By": s.enteredBy.fullName,
    "Cadre": s.enteredBy.cadre,
    "Review Status": s.reviewStatus,
    "Review Note": s.reviewNote ?? "",
    "Reviewed By": s.reviewedBy?.fullName ?? "",
    "Reviewed At": s.reviewedAt
      ? new Date(s.reviewedAt).toLocaleString("en-GB") : "",
  }));

  // Sheet 2: Patient registry
  const patientRows = patients.map((p, i) => ({
    "No.": i + 1,
    "Patient ID": p.patientCode,
    "First Name": p.firstName,
    "Last Name": p.lastName,
    "Sex": p.sex,
    "Date of Birth": new Date(p.dateOfBirth).toLocaleDateString("en-GB"),
    "Phone": isManager ? p.phoneNumber : "***masked***",
    "Ethnicity": p.ethnicity ?? "",
    "NHIS Status": p.nhisStatus,
    "District": p.district ?? "",
    "Locality": p.locality ?? "",
    "Total Screening Visits": p._count.screenings,
    "Registered On": new Date(p.createdAt).toLocaleDateString("en-GB"),
  }));

  // Sheet 3: Summary statistics
  const total = screenings.length;
  const catchUp = screenings.filter(s => s.screeningType === "CATCH_UP").length;
  const newborn = screenings.filter(s => s.screeningType === "NEWBORN").length;
  const male = screenings.filter(s => s.patient.sex === "MALE").length;
  const female = screenings.filter(s => s.patient.sex === "FEMALE").length;
  const treatYes = screenings.filter(s => s.treatmentStarted).length;
  const treatNo = total - treatYes;
  const pending = screenings.filter(s => s.reviewStatus === "PENDING").length;
  const approved = screenings.filter(s => s.reviewStatus === "APPROVED").length;
  const flagged = screenings.filter(s => s.reviewStatus === "FLAGGED").length;
  const corrected = screenings.filter(s => s.reviewStatus === "CORRECTED").length;

  const resultCounts: Record<string, number> = {};
  screenings.forEach(s => {
    resultCounts[s.screeningResult] = (resultCounts[s.screeningResult] || 0) + 1;
  });

  const summaryRows = [
    { "Category": "SCREENING TYPE", "Label": "Catch-Up", "Count": catchUp },
    { "Category": "SCREENING TYPE", "Label": "Newborn", "Count": newborn },
    { "Category": "SCREENING TYPE", "Label": "TOTAL", "Count": total },
    { "Category": "", "Label": "", "Count": "" },
    { "Category": "SEX", "Label": "Male", "Count": male },
    { "Category": "SEX", "Label": "Female", "Count": female },
    { "Category": "", "Label": "", "Count": "" },
    { "Category": "TREATMENT", "Label": "Started", "Count": treatYes },
    { "Category": "TREATMENT", "Label": "Not Started", "Count": treatNo },
    { "Category": "", "Label": "", "Count": "" },
    { "Category": "REVIEW STATUS", "Label": "Pending", "Count": pending },
    { "Category": "REVIEW STATUS", "Label": "Approved", "Count": approved },
    { "Category": "REVIEW STATUS", "Label": "Flagged", "Count": flagged },
    { "Category": "REVIEW STATUS", "Label": "Corrected", "Count": corrected },
    { "Category": "", "Label": "", "Count": "" },
    ...Object.entries(resultCounts).map(([label, count]) => ({
      "Category": "RESULT",
      "Label": label,
      "Count": count,
    })),
    { "Category": "", "Label": "", "Count": "" },
    { "Category": "EXPORT INFO", "Label": "Generated By", "Count": session.fullName },
    { "Category": "EXPORT INFO", "Label": "Date", "Count": new Date().toLocaleString("en-GB") },
  ];

  // Sheet 4: Monthly trend
  const monthlyData: Record<string, number> = {};
  screenings.forEach(s => {
    const month = new Date(s.screeningDatetime).toLocaleDateString("en-GB", {
      year: "numeric", month: "short"
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  const trendRows = Object.entries(monthlyData)
    .map(([month, count]) => ({ "Month": month, "Screenings": count }));

  // Sheet 5: Locality distribution
  const localityData: Record<string, number> = {};
  screenings.forEach(s => {
    const loc = s.patient.locality || "Unknown";
    localityData[loc] = (localityData[loc] || 0) + 1;
  });
  const localityRows = Object.entries(localityData)
    .sort(([, a], [, b]) => b - a)
    .map(([locality, count]) => ({ "Locality": locality, "Screenings": count }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(screeningRows), "Screenings");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(patientRows), "Patients");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows as object[]), "Summary Statistics");
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(trendRows.length ? trendRows : [{ "Month": "No data", "Screenings": 0 }]),
    "Monthly Trend");
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(localityRows.length ? localityRows : [{ "Locality": "No data", "Screenings": 0 }]),
    "Locality Distribution");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `OGH-SCD-Report-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
