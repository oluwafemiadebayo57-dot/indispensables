import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ... (Keep generateReportPDF, generatePlanPDF, and getTicketBase64 exactly as they are)
export function generateReportPDF(report) { /* ... existing code ... */ }
export function generatePlanPDF(plan) { /* ... existing code ... */ }
export function getTicketBase64(registration, eventData) { /* ... existing code ... */ }

// NEW: Master Compiled PDF
export function generateCompiledPDF(reports, plans) {
  const doc = new jsPDF();
  
  // Cover Page
  doc.setFillColor(107, 45, 145);
  doc.rect(0, 0, 210, 297, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text("THE INDISPENSABLES", 105, 100, null, null, "center");
  
  doc.setFontSize(16);
  doc.setTextColor(242, 140, 40);
  doc.text("MASTER COMPILED REPORT", 105, 120, null, null, "center");
  
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 140, null, null, "center");
  doc.text(`Total Departmental Reports: ${reports.length}`, 105, 150, null, null, "center");
  doc.text(`Total Event Plans: ${plans.length}`, 105, 160, null, null, "center");

  // Summary Table
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text("Executive Summary", 14, 20);

  const summaryData = [
    ...reports.map(r => [r.type.toUpperCase(), r.department, r.authorName, r.period, new Date(r.createdAt).toLocaleDateString()]),
    ...plans.map(p => ['PLAN', p.department, p.authorName, p.eventName, new Date(p.createdAt).toLocaleDateString()])
  ];

  autoTable(doc, {
    startY: 30,
    head: [['Type', 'Department', 'Author', 'Period/Event', 'Date']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [107, 45, 145] },
  });

  // Detailed Reports
  let currentY = doc.lastAutoTable.finalY + 20;
  
  const addReportToDoc = (item, type) => {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 45, 145);
    doc.text(`${type.toUpperCase()}: ${item.department} (${item.authorName})`, 14, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    
    let content = "";
    if (type === 'Report') {
      content = `Period: ${item.period}\nActivities: ${item.meetingsAndActivities}\nChallenges: ${item.challenges}\nSolutions: ${item.solutions}`;
    } else {
      content = `Event: ${item.eventName} (Target: ${item.targetDate})\nBudget: NGN ${item.totalBudget}\nActivities: ${item.activities}\nNeeds: ${item.uniforms || 'None'}`;
    }

    const splitText = doc.splitTextToSize(content, 180);
    if (currentY + (splitText.length * 5) > 280) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.text(splitText, 14, currentY);
    currentY += (splitText.length * 5) + 15;
  };

  reports.forEach(r => addReportToDoc(r, 'Report'));
  plans.forEach(p => addReportToDoc(p, 'Plan'));

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");
    doc.text("RCCG Ondo Province 11 - Indispensables Teens Ministry", 105, 295, null, null, "center");
  }

  doc.save(`Master_Compiled_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}