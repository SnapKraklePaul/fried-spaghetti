document.addEventListener('DOMContentLoaded', function() {
  const salesReportForm = document.getElementById('salesReportForm');
  const reportResult = document.getElementById('reportResult');

  salesReportForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const monthInput = document.getElementById('reportMonth').value;
      const [year, month] = monthInput.split('-');

      try {
          const response = await fetch(`/admin/sales-report?year=${year}&month=${month}`);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          // Display report summary
          reportResult.innerHTML = `
              <h3>Sales Report for ${monthInput}</h3>
              <p>Total Sales: $${data.totalSales.toFixed(2)}</p>
              <p>Total Orders: ${data.orderCount}</p>
              <button id="exportPDF">Export to PDF</button>
          `;

          // Add event listener for PDF export
          document.getElementById('exportPDF').addEventListener('click', function() {
              generatePDF(data, monthInput);
          });
      } catch (error) {
          console.error('Error generating report:', error);
          reportResult.innerHTML = '<p>Error generating report. Please try again.</p>';
      }
  });

  function generatePDF(data, monthInput) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`Sales Report for ${monthInput}`, 20, 20);

      doc.setFontSize(12);
      doc.text(`Total Sales: $${data.totalSales.toFixed(2)}`, 20, 40);
      doc.text(`Total Orders: ${data.orderCount}`, 20, 50);

      doc.setFontSize(14);
      doc.text('Order Details:', 20, 70);

      let yPos = 80;
      data.orders.forEach((order, index) => {
          doc.setFontSize(10);
          doc.text(`${index + 1}. Order ID: ${order.orderID}`, 30, yPos);
          doc.text(`   Product: ${order.product.title}`, 30, yPos + 5);
          doc.text(`   Price: $${order.product.price.toFixed(2)}`, 30, yPos + 10);
          doc.text(`   Date: ${new Date(order.purchaseDate).toLocaleDateString()}`, 30, yPos + 15);
          yPos += 25;

          if (yPos > 270) {
              doc.addPage();
              yPos = 20;
          }
      });

      doc.save(`sales_report_${monthInput}.pdf`);
  }
});