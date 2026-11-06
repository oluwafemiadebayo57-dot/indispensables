import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateReportPDF(report) {
  const doc = new jsPDF();
  
  // --- HEADER / LETTERHEAD ---
  doc.setFontSize(18);
  doc.setTextColor(107, 45, 145); // Brand Purple
  doc.setFont('helvetica', 'bold');
  doc.text("RCCG ONDO PROVINCE 11 TEEN AFFAIRS", 105, 20, null, null, "center");
  
  doc.setFontSize(14);
  doc.setTextColor(242, 140, 40); // Brand Orange
  doc.text("THE INDISPENSABLES", 105, 28, null, null, "center");
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text("Official Departmental Report", 105, 35, null, null, "center");
  
  // Divider Line
  doc.setDrawColor(107, 45, 145);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  // --- REPORT METADATA ---
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

  // --- BODY SECTIONS ---
  let currentY = 90;

  const addSection = (title, content) => {
    if (!content) return;
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 45, 145);
    doc.text(title, 20, currentY);
    currentY += 7;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    
    // Split text into lines to fit page width
    const splitText = doc.splitTextToSize(content, 170);
    
    // Check if text fits on current page, if not, add page
    if (currentY + (splitText.length * 6) > 280) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.text(splitText, 20, currentY);
    currentY += (splitText.length * 6) + 8; // Add spacing
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

  // --- FOOTER ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");
    doc.text("RCCG Ondo Province 11 - Indispensables Teens Ministry", 105, 295, null, null, "center");
  }

  // Save the PDF
  doc.save(`Report - ${report.department} - ${report.period}.pdf`);
}
// ... existing generateReportPDF function ...

export function generatePlanPDF(plan) {
  const doc = new jsPDF();
  
  // --- HEADER ---
  doc.setFontSize(18);
  doc.setTextColor(107, 45, 145); // Brand Purple
  doc.setFont('helvetica', 'bold');
  doc.text("RCCG ONDO PROVINCE 11 TEEN AFFAIRS", 105, 20, null, null, "center");
  
  doc.setFontSize(14);
  doc.setTextColor(242, 140, 40); // Brand Orange
  doc.text("EVENT PROPOSAL & BUDGET PLAN", 105, 28, null, null, "center");
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text("For Presidency Review", 105, 35, null, null, "center");
  
  doc.setDrawColor(107, 45, 145);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  // --- METADATA ---
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
  doc.setTextColor(0, 0, 0); // reset to black

  // --- BODY ---
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

  // --- FOOTER ---
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