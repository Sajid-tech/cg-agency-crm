import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Title, Container, Center,Text } from "@mantine/core";
import Layout from "../../layout/Layout";
import axios from "axios";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import BASE_URL from "../../base/BaseUrl";
import moment from "moment";
const OutstandingBuyerReport = () => {
  const [payments, setPayments] = useState([]);
  const [groupedPayments, setGroupedPayments] = useState({});
  const reportRef = useRef();

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem("token");
      const from_date = localStorage.getItem("from_date");
      const to_date = localStorage.getItem("to_date");
      const billing_to_id = localStorage.getItem("billing_to_id");
      const billing_from_id = localStorage.getItem("billing_from_id");

      try {
        const response = await axios.post(
          `${BASE_URL}/api/panel-fetch-buyer-outstanding-report`,
          {
            from_date,
            to_date,
            billing_to_id,
            billing_from_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.buyerOutstanding) {
          setPayments(response.data.buyerOutstanding);
          groupPaymentsByVendorAndBuyer(response.data.buyerOutstanding);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        toast.error("Failed to fetch payment data");
      }
    };

    fetchPayments();
  }, []);

  const groupPaymentsByVendorAndBuyer = (payments) => {
    const grouped = payments.reduce((acc, payment) => {
      const { buyer_company, vendor_company } = payment;
      if (!acc[buyer_company]) {
        acc[buyer_company] = {};
      }
      if (!acc[buyer_company][vendor_company]) {
        acc[buyer_company][vendor_company] = [];
      }
      acc[buyer_company][vendor_company].push(payment);
      return acc;
    }, {});
    setGroupedPayments(grouped);
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: "Buyer Outstanding Report",
    pageStyle: `
      @page {
        margin: 2mm;
      }
      body {
        font-family: Arial, sans-serif;
        background: white;
        color: black;
        padding: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid black;
        padding: 8px;
      }
      th {
        background: white;
        color: black;
      }
    `,
  });

  const handlePdfDownload = () => {
    const content = [];

    Object.entries(groupedPayments).forEach(([vendor, buyers]) => {
      content.push({
        text: `${vendor}`,
        style: "vendorHeader",
        margin: [0, 10, 0, 5],
      });

      Object.entries(buyers).forEach(([buyer, payments]) => {
        content.push({
          text: `${buyer}`,
          style: "buyerHeader",
          margin: [0, 5, 0, 5],
        });

        const tableBody = payments.map((payment, index) => [
          index + 1,
          payment.billing_date,
          payment.billing_no,
          payment.billing_total_amount,
          payment.billing_tax,
          payment.billing_discount,
          payment.billing_other,
          payment.total_received_sum,
          payment.billing_total_amount -
            payment.billing_discount -
            payment.total_received_sum,
        ]);

        content.push({
          table: {
            headerRows: 1,
            widths: [
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ],
            body: [
              [
                { text: "Sl No", style: "tableHeader" },
                { text: "Billing Date", style: "tableHeader" },
                { text: "Billing No", style: "tableHeader" },
                { text: "Total Amount", style: "tableHeader" },
                { text: "Tax Value", style: "tableHeader" },
                { text: "Discount Value", style: "tableHeader" },
                { text: "Other Value", style: "tableHeader" },
                { text: "Received", style: "tableHeader" },
                { text: "Balance", style: "tableHeader" },
              ],
              ...tableBody,
            ],
          },
          margin: [0, 0, 0, 10],
        });
      });
    });

    const docDefinition = {
      content: [
        {
          text: "Buyer Outstanding Report",
          style: "header",
          alignment: "center",
        },
        ...content,
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        vendorHeader: {
          fontSize: 14,
          bold: true,
        },
        buyerHeader: {
          fontSize: 12,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: "black",
        },
      },
      defaultStyle: {
        fontSize: 8,
      },
      pageMargins: [20, 20, 20, 20],
    };

    pdfMake
      .createPdf(docDefinition)
      .download("Buyer_Outstanding_Report.pdf");
  };

  const downloadReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const from_date = localStorage.getItem("from_date");
      const to_date = localStorage.getItem("to_date");
      const billing_to_id = localStorage.getItem("billing_to_id");
      const billing_from_id = localStorage.getItem("billing_from_id");

      const res = await axios.post(
        `${BASE_URL}/api/panel-download-buyer-outstanding-report`,
        {
          from_date,
          to_date,
          billing_to_id,
          billing_from_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "Buyer_Outstanding_Report.csv");
      document.body.appendChild(link);
      link.click();

      toast.success("Buyer Outstanding Report downloaded successfully");
    } catch (err) {
      console.error("Error downloading report:", err);
      toast.error("Error downloading report");
    }
  };
  return (
    <Layout>
      <div className="p-6 max-w-screen bg-white">
           {payments.length === 0 ? (
                          <Center className="mt-6">
                            <Text>No Buyer data available.</Text>
                          </Center>
                        ) : (
                          <>
        <div ref={reportRef} className="bg-white">
          <Title
            align="center"
            className="text-xl font-bold text-black mb-4 print:mt-4"
          >
            Buyer Outstanding Report
          </Title>

          {Object.entries(groupedPayments).map(([buyer, vendors]) => (
            <div key={buyer} className="mb-4">
              <h2 className="text-lg font-bold mb-2">{buyer}</h2>

              {Object.entries(vendors).map(([vendor, payments]) => (
                <div key={vendor} className="mb-4">
                  <h3 className="text-md font-semibold mb-2">{vendor}</h3>
                  <Table
                    striped
                    highlightOnHover
                    className="w-full border border-black"
                  >
                    <thead>
                      <tr className="bg-white text-black">
                        <th className="text-center p-2 border border-black">
                          Sl No
                        </th>
                        <th className="text-center p-2 border border-black">
                          Billing Date
                        </th>
                        <th className="text-center p-2 border border-black">
                          Billing No
                        </th>
                        <th className="text-center p-2 border border-black">
                          Total Amount
                        </th>
                        <th className="text-center p-2 border border-black">
                          Tax Value
                        </th>
                        <th className="text-center p-2 border border-black">
                          Discount Value
                        </th>
                        <th className="text-center p-2 border border-black">
                          Other Value
                        </th>
                        <th className="text-center p-2 border border-black">
                          Received
                        </th>
                        <th className="text-center p-2 border border-black">
                          Balance
                        </th>
                        <th className=" p-2 border border-black"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, index) => (
                        <tr key={index}>
                          <td className="text-center p-2 border border-black">
                            {index + 1}
                          </td>
                          <td className="text-center p-2 border border-black">
                            {moment(payment.billing_date).format("DD-MM-YYYY")}
                          </td>
                          <td className="text-center p-2 border border-black">
                            {payment.billing_no}
                          </td>
                          <td className="text-right p-2 border border-black">
                            {payment.billing_total_amount}
                          </td>
                          <td className="text-right p-2 border border-black">
                            {payment.billing_tax}
                          </td>
                          <td className="text-right p-2 border border-black">
                            {payment.billing_discount}
                          </td>
                          <td className="text-right p-2 border border-black">
                            {payment.billing_other}
                          </td>
                          <td className="text-right p-2 border border-black">
                            {payment.total_received_sum}
                          </td>
                          <td className="text-right p-2 border border-black">
                            {payment.billing_total_amount -
                              payment.billing_discount -
                              payment.total_received_sum}
                          </td>
                          <td className="p-2 border border-black"></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Center className="mt-6">
          <Button
            onClick={handlePrint}
            className="mr-4 bg-blue-600 hover:bg-blue-700"
          >
            Print
          </Button>
          <Button
            onClick={handlePdfDownload}
            className="mr-4 bg-green-600 hover:bg-green-700"
          >
            Download PDF
          </Button>
          <Button
            onClick={downloadReport}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Download Report
          </Button>
        </Center>
              </>
            )}
      </div>
    </Layout>
  );
};

export default OutstandingBuyerReport;
