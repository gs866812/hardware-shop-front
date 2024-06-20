import { useContext, useEffect, useState } from "react";
import useAxiosProtect from "../hooks/useAxiosProtect";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";


const PurchaseInvoice = () => {
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
        .get("/generatePurchaseInvoice", {
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
    window.print();

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


        <h2>Purchase Invoice</h2>
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
              <td>Supplier:</td>
              <td className="w-[20%]">Invoice number</td>
              <td className="w-[18%]">{invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td rowSpan={2}>
                <p>{invoice.supplierName}</p>
                <p>{invoice.supplierAddress}</p>
                <p>{invoice.supplierContact}</p>
              </td>
              <td>Invoice date</td>
              <td>{invoice.date}</td>
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
              <th>ID</th>
              <th>Product Name</th>
              <th className="w-[10%]">QTY</th>
              <th className="w-[10%]">Rate</th>
              <th className="w-[18%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(invoice.productList) &&
              invoice.productList.map((product) => (
                <tr key={product.productID}>
                  <td className="text-center">{product.productID}</td>
                  <td>{product.productTitle}</td>
                  <td className="text-center">{product.purchaseQuantity}</td>
                  <td className="text-center">{product.purchasePrice}</td>
                  <td className="text-right">
                    {(product.purchaseQuantity * product.purchasePrice).toFixed(2)}
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
              <td>Due Amount</td>
              <td className="text-right">
                {parseFloat(invoice.dueAmount).toFixed(2) || 0}
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

export default PurchaseInvoice;
