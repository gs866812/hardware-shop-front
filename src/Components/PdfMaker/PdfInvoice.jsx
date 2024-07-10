import { useContext, useEffect, useState } from "react";
import useAxiosProtect from "../hooks/useAxiosProtect";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import logo from "../../assets/images/logo_red.png";

const PdfInvoice = () => {
  const { user } = useContext(ContextData);
  const axiosProtect = useAxiosProtect();
  const [invoice, setInvoice] = useState({});

  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const id = pathParts[pathParts.length - 1]; // Get the last part of the pathname
  const NID = parseInt(id);

  useEffect(() => {
    if (user && NID) {
      axiosProtect
        .get("/generateSalesInvoice", {
          params: {
            userEmail: user.email,
            invoiceNumber: NID,
          },
        })
        .then((res) => {
          setInvoice(res.data);
        })
        .catch((err) => {
          toast.error("Server error", err);
        });
    }
  }, [user, NID, axiosProtect]);

  const handlePrint = () => {
    const printSection = document.getElementById("printSection");
    printSection.classList.remove("hidden");
    printSection.classList.add("flex");
    window.print();
    window.onafterprint = () => {
      printSection.classList.add("hidden");
      printSection.classList.remove("flex");
    };
  };

  return (
    <div>
      <div
        style={{
          padding: "20px",
          background: "white",
          margin: "0 auto",
          maxWidth: "800px",
        }}
      >
        <div className="flex justify-end mb-5">
          <button
            onClick={handlePrint}
            className="text-white bg-green-500 px-2 "
          >
            Print
          </button>
        </div>

        {/* Upper part of invoice */}
        <div
          className="hidden justify-between items-center gap-5 pb-5 border-b mb-10"
          id="printSection"
        >
          <div className="w-1/2">
            <img
              src={logo}
              alt=""
              className="stroke-2 stroke-slate-600 w-[80%]"
            />
          </div>
          <div className="w-1/2">
            <p>Shop Address:</p>
            <p>Mozumdarhat, Sundarganj, Gaibandha</p>
            <p>Mobile: 01795616264, 01767201923</p>
          </div>
        </div>

        <h2>Customer Invoice</h2>
        <p>INV - {invoice.invoiceNumber}</p>

        <table
          className="mt-3"
          border="1"
          cellPadding="5"
          cellSpacing="0"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <tbody>
            <tr>
              <td>Bill to:</td>
              <td className="w-[20%]">Invoice number</td>
              <td className="w-[18%] text-center">{invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td rowSpan={2}>
                <p>{invoice.customerName}</p>
                <p>{invoice.customerAddress}</p>
                <p>{invoice.customerMobile}</p>
              </td>
              <td>Invoice date</td>
              <td className="text-center">{invoice.date}</td>
            </tr>
            <tr>
              <td>Delivery date</td>
              <td> </td>
            </tr>
          </tbody>
        </table>

        <table
          border="1"
          cellPadding="5"
          cellSpacing="0"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th className="w-[12%]">ID</th>
              <th>Product Name</th>
              <th className="w-[8%]">QTY</th>
              <th className="w-[10%]">Unit</th>
              <th className="w-[8%]">Rate</th>
              <th className="w-[12%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(invoice.productList) &&
              invoice.productList.map((product) => (
                <tr key={product.productID}>
                  <td className="text-center">{product.productID}</td>
                  <td>{product.productTitle}</td>
                  <td className="text-center">{product.salesQuantity}</td>
                  <td className="text-center">{product.salesUnit}</td>
                  <td className="text-center">{product.salesPrice}</td>
                  <td className="text-right">
                    {(product.salesQuantity * product.salesPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <table
          border="1"
          cellPadding="5"
          cellSpacing="0"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <tbody>
            <tr>
              <td>Total</td>
              <td className="text-right w-[38%]">
                {parseFloat(invoice.totalAmount).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td>Discount</td>
              <td className="text-right">
                {invoice.discountAmount > 0
                  ? `${invoice.discountAmount}%`
                  : "N/A"}
              </td>
            </tr>
            <tr>
              <td>Grand Total</td>
              <td className="text-right">
                {parseFloat(invoice.grandTotal).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td>Paid Amount</td>
              <td className="text-right">
                {parseFloat(invoice.finalPayAmount).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td>{invoice.refund >= 0?
              'Refund after deductions' : 'Due Amount'
              }</td>
              <td className="text-right">
                {invoice.refund >= 0?
                `${parseFloat(invoice.refund) || 0 .toFixed(2)}` : `${parseFloat(invoice.dueAmount) || 0 .toFixed(2)}`
                }
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "50px" }}>
          <div className="flex justify-between">
            <p>Received by</p>
            <p>Authorized Signature</p>
          </div>
          <p className="mt-12">
            Time of printing: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfInvoice;
