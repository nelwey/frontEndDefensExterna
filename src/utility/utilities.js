import config from "../config";
import jwt from "jsonwebtoken";
import jsPDF from "jspdf";
import "jspdf-autotable";
export default {

  verifyRol() {
    const token = localStorage.getItem("token") || "";
    const decoded = jwt.verify(token, config.SECRET);
    console.log("[>] utilities, verifyRol:  ", decoded.rol);
    return decoded.rol;
  },

  generatePDF(heading, columns, body, footer) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter",
    });
    // text is placed using x, y coordinates
    doc.setFontSize(16).text(heading, 0.5, 1.0);
    // create a line under heading
    doc.setLineWidth(0.01).line(0.5, 1.1, 8.0, 1.1);
    // Using autoTable plugin
    doc.autoTable({
      columns,
      body,
      didParseCell: function (data) {
        if (data.column.raw.displayProperty) {
          var prop = data.column.raw.displayProperty;
          var text = data.cell.raw[prop];
          if (text && text.length > 0) {
            data.cell.text = text;
          }
        }
      },
      styles: {fontSize: 7 },
      margin: {
        left: 0.5,
        top: 1.25
      },
    });

    // Creating footer and saving file
    doc
      .setFont("courier")
      .setFontSize(12)
      .setTextColor(0, 0, 255)
      .text(
        footer,
        0.5,
        doc.internal.pageSize.height - 0.5
      )
      .save(`${heading}.pdf`);
  },
}