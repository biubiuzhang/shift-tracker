import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportPdf(element: HTMLElement, fileName: string, title: string) {
  const canvas = await html2canvas(element, {
    backgroundColor: '#000000',
    scale: 2,
    useCORS: true,
  });

  // Fixed A4 page with padding — scale content to fit one page
  const pageW = 210;
  const pageH = 297;
  const pad = 10;
  const areaW = pageW - pad * 2;
  const areaH = pageH - pad * 2;

  const imgAspect = canvas.width / canvas.height;
  const areaAspect = areaW / areaH;
  let drawW: number, drawH: number;
  if (imgAspect > areaAspect) {
    drawW = areaW;
    drawH = areaW / imgAspect;
  } else {
    drawH = areaH;
    drawW = areaH * imgAspect;
  }
  const offsetX = pad + (areaW - drawW) / 2;
  const offsetY = pad + (areaH - drawH) / 2;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, pageW, pageH, 'F');
  pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawW, drawH);

  const pdfBlob = pdf.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  if (navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
    await navigator.share({ files: [pdfFile], title });
  } else {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
