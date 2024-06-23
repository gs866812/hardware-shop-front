import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { ContextData } from "../../Provider";
import moment from "moment";
import Swal from "sweetalert2";
import useAxiosProtect from "../hooks/useAxiosProtect";
import { IoEyeOutline } from "react-icons/io5";

const SingleSupplierLedger = () => {
  const mail = localStorage.getItem('userEmail');
  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();

  const [singleSupplier, setSingleSupplier] = useState([]);
  const [filteredPurchaseHistory, setFilteredPurchaseHistory] = useState([]);

  const { reFetch, setReFetch, userName, user } = useContext(ContextData);
  const [payAmount, setPayAmount] = useState("");
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const id = pathParts[pathParts.length - 1]; // Get the last part of the pathname
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchSupplierData = async () => {
      const response = await axiosProtect.get(`/singleSupplier/${id}`, {
        params: {
          userEmail: mail,
          searchTerm,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setSingleSupplier(response.data);
      setFilteredPurchaseHistory(response.data.paginatedPurchaseHistory || []);
    };

    fetchSupplierData();
  }, [reFetch, searchTerm, currentPage, itemsPerPage]);

  const totalPaid = singleSupplier?.paymentHistory?.reduce(
    (acc, item) => acc + item.paidAmount,
    0
  );

  const handlePayAmount = (event) => {
    const payValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(payValue)) {
      setPayAmount(payValue);
    }
  };

  const handleReset = () => {
    setPayAmount("");
  };

  const handlePayment = (e) => {
    e.preventDefault();
    const date = moment(new Date()).format("DD.MM.YYYY");
    const form = e.target;
    const paidAmount = parseFloat(payAmount);
    const paymentMethod = form.payment_method.value;
    const payNote = form.pay_note.value;

    const paymentInfo = { date, paidAmount, paymentMethod, payNote, userName };

    if (paidAmount > singleSupplier.dueAmount) {
      return toast.error("Can't over payment");
    }

    axiosSecure
      .post(`/paySupplier/${id}`, paymentInfo)
      .then((res) => {
        const modal = document.querySelector(`#payDue`);
        modal.close();
        if (res.data === "success") {
          handleReset();
          setReFetch(!reFetch);
          Swal.fire({
            title: "Payment success",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: res.data,
            icon: "error",
          });
        }
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  };

  // search input onchange
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // reset to first page on new search
  }

  // Function to generate pagination buttons with ellipses
  const generatePaginationButtons = () => {
    const totalPages = singleSupplier.totalPages;
    const buttons = [];
    const maxButtons = 5; // Maximum number of buttons to show at a time

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button key="1" onClick={() => setCurrentPage(1)} className={`btn ${currentPage === 1 ? 'btn-active' : ''}`}>
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis-start" className="btn mx-1">...</span>);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`btn ${currentPage === page ? 'btn-active' : ''} mr-1`}
        >
          {page}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis-end" className="btn mx-1">...</span>);
      }
      buttons.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`btn ${currentPage === totalPages ? 'btn-active' : ''}`}>
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1); // reset to first page on items per page change
  };

// Purchase invoice preview
  const viewInvoice = (invoiceNumber) => {
    window.open(`/purchaseInvoice/${invoiceNumber}`,'_blank');
  };

  return (
    <div>
      <h2 className="text-2xl mt-5">Supplier Ledger Details</h2>
      <div className="flex gap-2 p-2">
        <div className="w-1/2">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <tbody>
                <tr>
                  <th>Supplier Name</th>
                  <td>{singleSupplier.supplierName}</td>
                </tr>
                <tr>
                  <th>Contact Person</th>
                  <td>{singleSupplier.contactPerson}</td>
                </tr>
                <tr>
                  <th>Contact No.</th>
                  <td>{singleSupplier.contactNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-1/2">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <tbody>
                <tr>
                  <th>Total Due:</th>
                  <td>
                    BDT: {parseFloat(singleSupplier.dueAmount).toFixed(2)}
                  </td>
                  <td className="p-0">
                    {singleSupplier.dueAmount > 0 ? (
                      <button
                        onClick={() =>
                          document.getElementById("payDue").showModal()
                        }
                        className="w-full py-3 text-center bg-green-500 text-white"
                      >
                        PAY
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          document.getElementById("payDue").showModal()
                        }
                        className="w-full py-3 text-center bg-gray-500 text-white"
                        disabled
                      >
                        PAY
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Total Paid:</th>
                  <td>BDT: {parseFloat(totalPaid).toFixed(2) || 0}</td>
                  <td
                    onClick={() =>
                      document.getElementById("paymentHistory").showModal()
                    }
                    className="w-10 text-center bg-blue-500 text-white cursor-pointer"
                  >
                    Payment History
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <h2 className="py-2 text-xl">Purchase Invoice History</h2>
        <div className="flex gap-2">
          <input
            type="text"
            name="purchase_search"
            onChange={handleInputChange}
            placeholder="search"
            size={10}
            className="px-2 py-1 border outline-none border-gray-500 rounded-md"
          />

          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-2 py-1 border outline-none border-gray-500 rounded-md"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

        </div>
      </div>

      <div className="overflow-x-auto mt-2 pb-5">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice Number</th>
              <th>Invoice Amount</th>
              <th>Paid Amount</th>
              <th>Due Amount</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchaseHistory &&
              filteredPurchaseHistory.map((purchase) => (
                <tr key={purchase.invoiceNumber}>
                  <td>{purchase.date}</td>
                  <td>{purchase.invoiceNumber}</td>
                  <td>BDT: {parseFloat(purchase.grandTotal).toFixed(2)}</td>
                  <td>BDT: {parseFloat(purchase.finalPayAmount).toFixed(2)}</td>
                  <td>BDT: {parseFloat(purchase.dueAmount).toFixed(2)}</td>
                  <td>{purchase.userName}</td>
                  <td className="text-center w-[8%]"> <IoEyeOutline onClick={()=> viewInvoice(purchase.invoiceNumber)} className="text-xl cursor-pointer"/></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPurchaseHistory && (
        <div className="flex justify-center my-4">
          <div className="btn-group">
            <button
              className="btn mr-1"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {generatePaginationButtons()}
            <button
              className="btn ml-1"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, singleSupplier.totalPages))
              }
              disabled={currentPage === singleSupplier.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Payment modal */}
      <dialog id="payDue" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3 uppercase">
              Supplier payment:
            </h3>
            <hr />
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <form onSubmit={handlePayment} className="mt-5 space-y-3">
              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Pay amount:</p>{" "}
                <input
                  type="text"
                  name="pay_amount"
                  placeholder="Pay amount"
                  onChange={handlePayAmount}
                  value={payAmount}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Method:</p>{" "}
                <input
                  type="text"
                  name="payment_method"
                  placeholder="Payment method"
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Note:</p>{" "}
                <input
                  type="text"
                  name="pay_note"
                  placeholder="Note"
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-start justify-end gap-3">
                <input
                  onClick={() => handleReset()}
                  type="reset"
                  value="Reset"
                  className="bg-yellow-300 py-2 px-4 rounded-md"
                />
                <input
                  type="submit"
                  value="PAY"
                  className="bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer"
                />
              </label>
            </form>
          </div>
        </dialog>

      {/* Payment History modal */}
      <dialog id="paymentHistory" className="modal">
          <div className="modal-box w-2/4 max-w-5xl">
            <h3 className="font-bold text-lg mb-3 uppercase">
              Payment history:
            </h3>
            <hr />
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <div className="overflow-x-auto mt-5">
              <table className="table table-zebra">
                {/* head */}
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Note</th>
                    <th>Amount</th>
                    <th>Pay method</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {/* row 1 */}
                  {singleSupplier.paymentHistory &&
                    Array.isArray(singleSupplier.paymentHistory) &&
                    singleSupplier.paymentHistory.map((payment, i) => (
                      <tr key={i}>
                        <td>{payment.date}</td>
                        <td>{payment.payNote}</td>
                        <td>BDT: {parseFloat(payment.paidAmount).toFixed(2)}</td>
                        <td>{payment.paymentMethod}</td>
                        <td>{payment.userName}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </dialog>
    </div>
  );
};

export default SingleSupplierLedger;
