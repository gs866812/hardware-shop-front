import React, { useState, useEffect, useRef, useContext } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const TradeReturn = () => {
  const axiosSecure = useAxiosSecure();
  const { reFetch, setReFetch } = useContext(ContextData);
  const [invoiceNumberValue, setInvoiceNumberValue] = useState("");
  const [supplierInvoiceNumberValue, setSupplierInvoiceNumberValue] =
    useState("");
  const [invoice, setInvoice] = useState(null);
  const [supplierInvoice, setSupplierInvoice] = useState(null);
  const [newGrandTotal, setNewGrandTotal] = useState(0);
  const oldGrandTotalRef = useRef(0);
  const initialQuantitiesRef = useRef({});

  useEffect(() => {
    if (invoice) {
      const initialGrandTotal = calculateGrandTotal(invoice.productList);
      oldGrandTotalRef.current = initialGrandTotal;
      setNewGrandTotal(initialGrandTotal);

      const initialQuantities = invoice.productList.reduce((acc, product) => {
        acc[product.productID] = product.salesQuantity;
        return acc;
      }, {});
      initialQuantitiesRef.current = initialQuantities;
    }
  }, [invoice, reFetch]);

  // supplier
  useEffect(() => {
    if (supplierInvoice) {
      const initialGrandTotal = calculateGrandTotal(
        supplierInvoice.productList
      );
      oldGrandTotalRef.current = initialGrandTotal;
      setNewGrandTotal(initialGrandTotal);

      const initialQuantities = supplierInvoice.productList.reduce(
        (acc, product) => {
          acc[product.productID] = product.purchaseQuantity;
          return acc;
        },
        {}
      );
      initialQuantitiesRef.current = initialQuantities;
    }
  }, [supplierInvoice, reFetch]);

  const handleInputInvoiceNumber = (event) => {
    const newInvoiceNumberValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(newInvoiceNumberValue)) {
      setInvoiceNumberValue(newInvoiceNumberValue);
    }
  };

  // supplier
  const handleInputSupplierInvoiceNumber = (event) => {
    const newInvoiceNumberValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(newInvoiceNumberValue)) {
      setSupplierInvoiceNumberValue(newInvoiceNumberValue);
    }
  };

  const handleSearchInvoice = (e) => {
    e.preventDefault();
    document.getElementById("supplier").classList.add("hidden");
    document.getElementById("customer").classList.remove("hidden");
    const invoiceNumber = parseInt(invoiceNumberValue);
    axiosSecure
      .get(`/returnCustomerInvoice/${invoiceNumber}`)
      .then((res) => {
        if (res.data.message) {
          return toast.error(res.data.message);
        }
        setInvoice(res.data);
      })
      .catch((err) => {
        toast.error(err);
      });
    setInvoiceNumberValue("");
  };

  // supplier invoice

  const handleSearchSupplierInvoice = (e) => {
    e.preventDefault();
    document.getElementById("supplier").classList.remove("hidden");
    document.getElementById("customer").classList.add("hidden");
    const invoiceNumber = parseInt(supplierInvoiceNumberValue);
    axiosSecure
      .get(`/returnSupplierInvoice/${invoiceNumber}`)
      .then((res) => {
        if (res.data.message) {
          return toast.error(res.data.message);
        }
        setSupplierInvoice(res.data);
      })
      .catch((err) => {
        toast.error(err);
      });
    setSupplierInvoiceNumberValue("");
  };

  const handleUpdateProductQuantity = (productId, newQuantity) => {
    setInvoice((prevInvoice) => {
      const updatedProductList = prevInvoice.productList.map((product) => {
        if (product.productID === productId) {
          const initialQuantity = initialQuantitiesRef.current[productId];
          if (newQuantity < 0 || newQuantity > initialQuantity) {
            toast.error(
              `Quantity for product ID ${productId} must be between 0 and ${initialQuantity}`
            );
            return product; // Prevent negative or exceeding initial quantities
          }
          return { ...product, salesQuantity: newQuantity };
        }
        return product;
      });

      const newGrandTotal = calculateGrandTotal(updatedProductList);
      const newTotalAmount = newGrandTotal;
      const newDueAmount = newGrandTotal - prevInvoice.finalPayAmount;
      const modified = "yes";

      setNewGrandTotal(newGrandTotal);

      return {
        ...prevInvoice,
        productList: updatedProductList,
        totalAmount: newTotalAmount,
        grandTotal: newGrandTotal,
        dueAmount: newDueAmount,
        modified,
      };
    });
  };

  // supplier
  const handleSupplierUpdateProductQuantity = (productId, newQuantity) => {
    setSupplierInvoice((prevInvoice) => {
      const updatedProductList = prevInvoice.productList.map((product) => {
        if (product.productID === productId) {
          const initialQuantity = initialQuantitiesRef.current[productId];
          if (newQuantity < 0 || newQuantity > initialQuantity) {
            toast.error(
              `Quantity for product ID ${productId} must be between 0 and ${initialQuantity}`
            );
            return product; // Prevent negative or exceeding initial quantities
          }
          return { ...product, purchaseQuantity: newQuantity };
        }
        return product;
      });

      const newGrandTotal = calculateSupplierGrandTotal(updatedProductList);
      const newTotalAmount = newGrandTotal;
      const newDueAmount = newGrandTotal - prevInvoice.finalPayAmount;
      const modified = "yes";

      setNewGrandTotal(newGrandTotal);

      return {
        ...prevInvoice,
        productList: updatedProductList,
        totalAmount: newTotalAmount,
        grandTotal: newGrandTotal,
        dueAmount: newDueAmount,
        modified,
      };
    });
  };

  const calculateSupplierGrandTotal = (productList) => {
    return productList.reduce(
      (total, product) =>
        total + product.purchasePrice * product.purchaseQuantity,
      0
    );
  };

  const calculateGrandTotal = (productList) => {
    return productList.reduce(
      (total, product) => total + product.salesPrice * product.salesQuantity,
      0
    );
  };

  const navigate = useNavigate();

  const handleSaveChanges = () => {
    const date = moment(new Date()).format("DD.MM.YYYY");
    const { _id, ...updatedInvoice } = invoice;
    axiosSecure
      .put(
        `/updateCustomerInvoice/${invoice.invoiceNumber}?date=${date}`,
        updatedInvoice
      )
      .then((res) => {
        if (res.data.modifiedCount > 0) {
          setReFetch(!reFetch);
          navigate("/sales");
          Swal.fire({
            title: "Invoice updated successfully",
            icon: "success",
          });
        } else {
          toast.error(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          `${err.response ? err.response.data.message : err.message}`
        );
      });
  };

  // supplier save change
  const handleSupplierSaveChanges = () => {
    const date = moment(new Date()).format("DD.MM.YYYY");
    const { _id, ...updatedInvoice } = supplierInvoice;
    axiosSecure
      .put(
        `/updateSupplierInvoice/${supplierInvoice.invoiceNumber}?date=${date}`,
        updatedInvoice
      )
      .then((res) => {
        if (res.data.modifiedCount > 0) {
          setReFetch(!reFetch);
          navigate("/purchase");
          Swal.fire({
            title: "Invoice updated successfully",
            icon: "success",
          });
        } else {
          toast.error(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          `${err.response ? err.response.data.message : err.message}`
        );
      });
  };

  return (
    <>
      <div className="border p-5 flex gap-2 justify-between mt-2 rounded">
        <div className="flex gap-5">
          <h2 className=" text-xl">Customer return:</h2>
          <form onSubmit={handleSearchInvoice}>
            <input
              className="border focus:outline-none px-2 py-1 rounded-l"
              type="text"
              name="invoice_number"
              placeholder="Invoice number"
              value={invoiceNumberValue}
              required
              size={12}
              onChange={handleInputInvoiceNumber}
            />
            <button className="py-1 px-2 border bg-green-500 text-white border-green-500">
              Search
            </button>
          </form>
        </div>

        <div className="flex gap-5">
          <h2 className=" text-xl">Supplier return:</h2>
          <form onSubmit={handleSearchSupplierInvoice}>
            <input
              className="border focus:outline-none px-2 py-1 rounded-l"
              type="text"
              name="invoice_number"
              placeholder="Invoice number"
              value={supplierInvoiceNumberValue}
              required
              size={12}
              onChange={handleInputSupplierInvoiceNumber}
            />
            <button className="py-1 px-2 border bg-green-500 text-white border-green-500">
              Search
            </button>
          </form>
        </div>
      </div>

      <div id="customer">
        {invoice && (
          <div className="mt-5">
            <h3 className="font-bold">Customer Invoice Details:</h3>
            <h3 className="my-1 mt-3">
              Invoice no:{" "}
              <span className="border-gray-500 border px-1 rounded">
                {invoice.invoiceNumber}
              </span>
            </h3>
            <h3>
              Customer Name:{" "}
              <span className="border-gray-500 px-1 border rounded">
                {invoice.customerName}
              </span>
            </h3>
            <table className="mt-5 w-full">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Title</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {invoice.productList.map((product) => (
                  <tr key={product.productID}>
                    <td className="w-[10%]">{product.productID}</td>
                    <td>{product.productTitle}</td>
                    <td className="w-[10%]">
                      <input
                        className="border rounded w-full text-center bg-red-300"
                        type="number"
                        value={product.salesQuantity}
                        onChange={(e) =>
                          handleUpdateProductQuantity(
                            product.productID,
                            parseInt(e.target.value)
                          )
                        }
                        onBlur={(e) => {
                          const initialQuantity =
                            initialQuantitiesRef.current[product.productID];
                          let newValue = parseInt(e.target.value);
                          if (newValue < 0) {
                            newValue = 0;
                          } else if (newValue > initialQuantity) {
                            newValue = initialQuantity;
                          }
                          handleUpdateProductQuantity(
                            product.productID,
                            newValue
                          );
                        }}
                      />
                    </td>
                    <td>{parseFloat(product.salesPrice).toFixed(2)}</td>
                    <td>
                      {parseFloat(
                        product.salesPrice * product.salesQuantity
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5">
              <div className="flex justify-between">
                <p>
                  Total Amount:{" "}
                  <span className="border px-1 rounded border-gray-200 bg-gray-200">
                    {parseFloat(invoice.totalAmount).toFixed(2)}
                  </span>
                </p>
                <p>
                  Grand Total:{" "}
                  <span className="border px-1 rounded border-gray-200 bg-gray-200">
                    {parseFloat(invoice.grandTotal).toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="flex justify-between mt-3">
                <p>
                  Paid amount:{" "}
                  <span className="border px-1 rounded border-gray-200 bg-gray-200">
                    {parseFloat(invoice.finalPayAmount).toFixed(2)}
                  </span>
                </p>
                <p>
                  Due Amount:{" "}
                  <span className="border px-1 rounded border-gray-200 bg-gray-200">
                    {parseFloat(invoice.dueAmount).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                className="bg-green-500 px-3 py-1 text-white"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
      {/* supplier */}
      <div id="supplier" className="mb-5">
        {supplierInvoice && (
          <div className="mt-5">
            <h3 className="font-bold">Supplier Invoice Details:</h3>
            <h3 className="my-1 mt-3">
              Invoice no:{" "}
              <span className="border-gray-500 border px-1 rounded">
                {supplierInvoice.invoiceNumber}
              </span>
            </h3>
            <h3>
              Supplier Name:{" "}
              <span className="border-gray-500 px-1 border rounded">
                {supplierInvoice.supplierName}
              </span>
            </h3>
            <table className="mt-5 w-full">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Title</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {supplierInvoice.productList.map((product) => (
                  <tr key={product.productID}>
                    <td className="w-[10%]">{product.productID}</td>
                    <td>{product.productTitle}</td>
                    <td className="w-[10%]">
                      <input
                        className="border rounded w-full text-center bg-red-300"
                        type="number"
                        value={product.purchaseQuantity}
                        onChange={(e) =>
                          handleSupplierUpdateProductQuantity(
                            product.productID,
                            parseInt(e.target.value)
                          )
                        }
                        onBlur={(e) => {
                          const initialQuantity =
                            initialQuantitiesRef.current[product.productID];
                          let newValue = parseInt(e.target.value);
                          if (newValue < 0) {
                            newValue = 0;
                          } else if (newValue > initialQuantity) {
                            newValue = initialQuantity;
                          }
                          handleSupplierUpdateProductQuantity(
                            product.productID,
                            newValue
                          );
                        }}
                      />
                    </td>
                    <td>{parseFloat(product.purchasePrice).toFixed(2)}</td>
                    <td>
                      {parseFloat(
                        product.purchasePrice * product.purchaseQuantity
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5">
              <div className="flex justify-between">
                <p>
                  Total Amount:{" "}
                  <span className="border px-1 rounded border-gray-200 bg-gray-200">
                    {parseFloat(supplierInvoice.totalAmount).toFixed(2)}
                  </span>
                </p>
                <p>
                  Grand Total:{" "}
                  <span className="border px-1 rounded border-gray-200 bg-gray-200">
                    {parseFloat(supplierInvoice.grandTotal).toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="flex justify-between mt-3">
                <p>
                  Paid amount:{" "}
                  <span className="border px-1 rounded border-gray-200 bg-gray-200">
                    {parseFloat(supplierInvoice.finalPayAmount).toFixed(2)}
                  </span>
                </p>
                <p>
                  Due Amount:{" "}
                  <span className="border px-1 rounded border-gray-200 bg-gray-200">
                    {parseFloat(supplierInvoice.dueAmount).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                className="bg-green-500 px-3 py-1 text-white"
                onClick={handleSupplierSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TradeReturn;
