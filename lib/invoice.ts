import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateInvoicePDF(order: any): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];
    
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(new Uint8Array(Buffer.concat(buffers))));
    doc.on("error", reject);

    const primaryColor = "#4a439a"; 
    const textColor = "#333333";
    const mutedColor = "#6b7280";
    const borderColor = "#e5e7eb";

    // HEADER AREA
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { fit: [120, 60], align: 'left' });
      } else {
        doc.fontSize(24).font("Helvetica-Bold").fillColor(primaryColor).text("Tsquarey", 50, 45);
      }
    } catch (e) {
      doc.fontSize(24).font("Helvetica-Bold").fillColor(primaryColor).text("Tsquarey", 50, 45);
    }

    // Right Side: Invoice Details
    doc.fontSize(28).font("Helvetica-Bold").fillColor(primaryColor).text("INVOICE", 350, 40, { align: "right", width: 195 });
    doc.fontSize(10).font("Helvetica").fillColor(textColor);
    doc.text(`Order Number: ${order.orderNumber}`, 350, 75, { align: "right", width: 195 });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 90, { align: "right", width: 195 });
    
    if (order.payment?.status === "SUCCESS") {
      doc.fillColor("#16a34a").font("Helvetica-Bold").text(`PAID VIA ${order.payment.paymentMethod?.toUpperCase()}`, 350, 105, { align: "right", width: 195 });
    } else if (order.payment?.paymentMethod === "COD") {
      doc.fillColor("#ea580c").font("Helvetica-Bold").text("CASH ON DELIVERY", 350, 105, { align: "right", width: 195 });
    }

    // Separator Line
    doc.moveTo(50, 135).lineTo(545, 135).lineWidth(1).strokeColor(borderColor).stroke();

    // BILLING INFO
    doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("Billed To:", 50, 155);
    doc.fillColor(textColor).font("Helvetica").fontSize(10);
    doc.text(order.address.name, 50, 175);
    doc.text(order.address.addressLine1, 50, 190);
    
    let nextY = 205;
    if (order.address.addressLine2) {
      doc.text(order.address.addressLine2, 50, nextY);
      nextY += 15;
    }
    doc.text(`${order.address.city}, ${order.address.state} - ${order.address.pincode}`, 50, nextY);
    doc.text(`Phone: ${order.address.phone}`, 50, nextY + 15);

    // TABLE HEADER
    const tableTop = 270;
    
    // Header Background Block
    doc.rect(50, tableTop - 5, 495, 25).fillColor("#f3f4f6").fill();
    
    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(10);
    doc.text("Item Description", 60, tableTop);
    doc.text("Qty", 350, tableTop, { width: 50, align: "center" });
    doc.text("Price", 400, tableTop, { width: 60, align: "right" });
    doc.text("Total", 470, tableTop, { width: 65, align: "right" });

    // TABLE ITEMS
    doc.font("Helvetica").fillColor(textColor);
    let y = tableTop + 30;
    
    order.items.forEach((item: any) => {
      const title = item.productSnapshot ? (item.productSnapshot as any).title : item.product?.title;
      const price = Number(item.priceAtPurchase);
      const rowTotal = price * item.quantity;

      doc.text(title.substring(0, 60), 60, y, { width: 270 });
      doc.text(item.quantity.toString(), 350, y, { width: 50, align: "center" });
      doc.text(`Rs. ${price.toFixed(2)}`, 400, y, { width: 60, align: "right" });
      doc.text(`Rs. ${rowTotal.toFixed(2)}`, 470, y, { width: 65, align: "right" });
      
      y += 25; 
      
      // Subtle line between rows
      doc.moveTo(50, y - 10).lineTo(545, y - 10).lineWidth(0.5).strokeColor("#f9fafb").stroke();

      // Page break logic if order has too many items
      if (y > 680) {
        doc.addPage();
        y = 50;
      }
    });

    // TOTALS SECTION
    doc.moveTo(350, y).lineTo(545, y).lineWidth(1).strokeColor(borderColor).stroke();
    y += 15;

    doc.font("Helvetica").fillColor(mutedColor);
    doc.text("Subtotal:", 350, y, { width: 80, align: "right" });
    doc.fillColor(textColor);
    doc.text(`Rs. ${Number(order.subtotal).toFixed(2)}`, 440, y, { width: 95, align: "right" });
    y += 20;

    if (Number(order.discount) > 0 || order.couponId) {
      doc.fillColor("#16a34a").text("Discount:", 350, y, { width: 80, align: "right" });
      doc.text(`- Rs. ${Number(order.discount).toFixed(2)}`, 440, y, { width: 95, align: "right" });
      doc.fillColor(textColor);
      y += 20;
    }

    // Highlighted Total Block
    doc.rect(330, y - 5, 215, 30).fillColor("#f8fafc").fill();
    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(12);
    doc.text("Total Amount:", 340, y + 3, { width: 90, align: "right" });
    doc.text(`Rs. ${Number(order.totalAmount).toFixed(2)}`, 440, y + 3, { width: 95, align: "right" });

    // FOOTER
    const footerY = 750;
    doc.moveTo(50, footerY - 15).lineTo(545, footerY - 15).lineWidth(1).strokeColor(borderColor).stroke();
    
    doc.font("Helvetica").fontSize(9).fillColor(mutedColor);
    doc.text(
      "Thank you for shopping with Tsquarey. We hope you enjoy building your electronics!", 
      50, 
      footerY, 
      { align: "center", width: 495 }
    );
    doc.fillColor(primaryColor).text("https://tsquarey.store", 50, footerY + 15, { align: "center", width: 495, link: "https://tsquarey.store" });

    doc.end();
  });
}