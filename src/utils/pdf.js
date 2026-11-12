import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ==========================================
// 1. REPORT PDF
// ==========================================
export function generateReportPDF(report) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setTextColor(107, 45, 145);
  doc.setFont('helvetica', 'bold');
  doc.text("RCCG ONDO PROVINCE 11 TEEN AFFAIRS", 105, 20, null, null, "center");
  
  doc.setFontSize(14);
  doc.setTextColor(242, 140, 40);
  doc.text("THE INDISPENSABLES", 105, 28, null, null, "center");
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text("Official Departmental Report", 105, 35, null, null, "center");
  
  doc.setDrawColor(107, 45, 145);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Department:`, 20, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.department}`, 55, 50);

  doc.setFont('helvetica', 'bold');
  doc.text(`Report Type:`, 20, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.type.toUpperCase()}`, 55, 57);

  doc.setFont('helvetica', 'bold');
  doc.text(`Period/Event:`, 20, 64);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.period}`, 55, 64);

  doc.setFont('helvetica', 'bold');
  doc.text(`Submitted By:`, 20, 71);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.authorName} (${report.authorEmail})`, 55, 71);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date Submitted:`, 20, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(report.createdAt).toLocaleDateString()}`, 55, 78);

  let currentY = 90;

  const addSection = (title, content) => {
    if (!content) return;
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 45, 145);
    doc.text(title, 20, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const splitText = doc.splitTextToSize(content, 170);
    if (currentY + (splitText.length * 6) > 280) { doc.addPage(); currentY = 20; }
    doc.text(splitText, 20, currentY);
    currentY += (splitText.length * 6) + 8; 
  };

  addSection("1. MEETINGS HELD / ACTIVITIES", report.meetingsAndActivities);
  
  if (report.financialIncome || report.financialExpenses) {
    addSection("2. FINANCIAL SUMMARY", 
      `Income: NGN ${report.financialIncome || 0}\nExpenses: NGN ${report.financialExpenses || 0}\nNotes: ${report.financialNotes || 'None'}`
    );
  }

  addSection("3. CHALLENGES FACED", report.challenges);
  addSection("4. PROPOSED SOLUTIONS", report.solutions);
  addSection("5. PRAYER POINTS", report.prayerPoints);
  addSection("6. EXTRA NOTES", report.extraNotes);

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");
    doc.text("RCCG Ondo Province 11 - Indispensables Teens Ministry", 105, 295, null, null, "center");
  }

  doc.save(`Report - ${report.department} - ${report.period}.pdf`);
}

// ==========================================
// 2. EVENT PLAN PDF
// ==========================================
export function generatePlanPDF(plan) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setTextColor(107, 45, 145);
  doc.setFont('helvetica', 'bold');
  doc.text("RCCG ONDO PROVINCE 11 TEEN AFFAIRS", 105, 20, null, null, "center");
  
  doc.setFontSize(14);
  doc.setTextColor(242, 140, 40);
  doc.text("EVENT PROPOSAL & BUDGET PLAN", 105, 28, null, null, "center");
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text("For Presidency Review", 105, 35, null, null, "center");
  
  doc.setDrawColor(107, 45, 145);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Event Name:`, 20, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`${plan.eventName}`, 55, 50);

  doc.setFont('helvetica', 'bold');
  doc.text(`Target Date:`, 20, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(`${plan.targetDate}`, 55, 57);

  doc.setFont('helvetica', 'bold');
  doc.text(`Department:`, 20, 64);
  doc.setFont('helvetica', 'normal');
  doc.text(`${plan.department}`, 55, 64);

  doc.setFont('helvetica', 'bold');
  doc.text(`Submitted By:`, 20, 71);
  doc.setFont('helvetica', 'normal');
  doc.text(`${plan.authorName} (${plan.authorEmail})`, 55, 71);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Status:`, 20, 78);
  doc.setTextColor(plan.status === 'approved' ? 0 : 200, plan.status === 'approved' ? 128 : 0, 0);
  doc.text(`${plan.status.toUpperCase()}`, 55, 78);
  doc.setTextColor(0, 0, 0);

  let currentY = 90;

  const addSection = (title, content) => {
    if (!content) return;
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 45, 145);
    doc.text(title, 20, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const splitText = doc.splitTextToSize(content, 170);
    if (currentY + (splitText.length * 6) > 280) { doc.addPage(); currentY = 20; }
    doc.text(splitText, 20, currentY);
    currentY += (splitText.length * 6) + 8; 
  };

  addSection("1. PROPOSED ACTIVITIES", plan.activities);
  addSection("2. BUDGET & FINANCIALS", 
    `Total Estimated Budget: NGN ${plan.totalBudget || '0'}\n\nBreakdown:\n${plan.budgetBreakdown || 'None provided'}`
  );
  addSection("3. UNIFORM / MATERIAL REQUIREMENTS", plan.uniforms);
  addSection("4. OTHER LOGISTICS / NEEDS", plan.otherNeeds);

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");
    doc.text("RCCG Ondo Province 11 - Indispensables Teens Ministry", 105, 295, null, null, "center");
  }

  doc.save(`Plan - ${plan.eventName} - ${plan.department}.pdf`);
}

// ==========================================
// 3. E-TICKET PDF (NEW)
// ==========================================
export function generateTicketPDF(registration, eventData) {
  // Create a custom ticket size (200x300 points)
  const doc = new jsPDF({ format: [200, 300] });
  
  // Background
  doc.setFillColor(107, 45, 145);
  doc.rect(0, 0, 200, 300, 'F');
  
  // Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("THE INDISPENSABLES", 100, 30, null, null, "center");
  
  doc.setFontSize(14);
  doc.setTextColor(242, 140, 40);
  doc.text("OFFICIAL E-TICKET", 100, 40, null, null, "center");
  
  // Event Details
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(eventData.title, 100, 70, null, null, "center");
  
  doc.setFontSize(10);
  doc.text(`DATE: ${eventData.displayDate}`, 100, 85, null, null, "center");
  doc.text(`LOCATION: ${eventData.location}`, 100, 95, null, null, "center");
  
  // Divider
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 110, 180, 110);
  
  // Attendee Details
  doc.setFontSize(12);
  doc.text("ATTENDEE DETAILS", 100, 130, null, null, "center");
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(registration.fullName.toUpperCase(), 100, 150, null, null, "center");
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PHONE: ${registration.phone}`, 100, 165, null, null, "center");
  doc.text(`PARISH: ${registration.parish}`, 100, 175, null, null, "center");
  
  // Unique Check-in Code
  const checkInCode = registration.id || 'TEMP-ID';
  
  // White box for the code
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 200, 160, 50, 10, 10, 'F');
  
  doc.setTextColor(107, 45, 145);
  doc.setFontSize(10);
  doc.text("UNIQUE CHECK-IN CODE (SHOW AT VENUE)", 100, 215, null, null, "center");
  
  doc.setFontSize(14); 
  doc.setFont('helvetica', 'bold');
  doc.text(checkInCode, 100, 235, null, null, "center");
  
  doc.save(`Ticket-${registration.fullName.replace(/\s+/g, '-')}.pdf`);
}
// Add this at the bottom of src/utils/pdf.js
export function getTicketBase64(registration, eventData) {
  const doc = new jsPDF({ format: [200, 300] });
  
  doc.setFillColor(107, 45, 145);
  doc.rect(0, 0, 200, 300, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("THE INDISPENSABLES", 100, 30, null, null, "center");
  
  doc.setFontSize(14);
  doc.setTextColor(242, 140, 40);
  doc.text("OFFICIAL E-TICKET", 100, 40, null, null, "center");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(eventData.title, 100, 70, null, null, "center");
  
  doc.setFontSize(10);
  doc.text(`DATE: ${eventData.displayDate}`, 100, 85, null, null, "center");
  doc.text(`LOCATION: ${eventData.location}`, 100, 95, null, null, "center");
  
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 110, 180, 110);
  
  doc.setFontSize(12);
  doc.text("ATTENDEE DETAILS", 100, 130, null, null, "center");
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(registration.fullName.toUpperCase(), 100, 150, null, null, "center");
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PHONE: ${registration.phone}`, 100, 165, null, null, "center");
  doc.text(`PARISH: ${registration.parish}`, 100, 175, null, null, "center");
  
  const checkInCode = registration.id || 'TEMP-ID';
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 200, 160, 50, 10, 10, 'F');
  
  doc.setTextColor(107, 45, 145);
  doc.setFontSize(10);
  doc.text("UNIQUE CHECK-IN CODE", 100, 215, null, null, "center");
  
  doc.setFontSize(14); 
  doc.setFont('helvetica', 'bold');
  doc.text(checkInCode, 100, 235, null, null, "center");
  
  // Output as Base64 string (stripping the data URI prefix for Resend)
  const pdfBase64 = doc.output('datauristring');
  return pdfBase64.split(',')[1]; 
}