import { CiSearch } from "react-icons/ci";
import AddCustomer from "../Components/AddCustomer/AddCustomer";
import { MdDelete, MdOutlineEdit } from "react-icons/md";
import { useContext, useEffect, useState } from "react";
import { ContextData } from "../Provider";
import { toast } from "react-toastify";
import useAxiosSecure from "../Components/hooks/useAxiosSecure";
import Swal from "sweetalert2";


const Customer = () => {
  const axiosSecure = useAxiosSecure();

  const {
    customer,
    reFetch,
    setReFetch,
    customerCount,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    setSearchCustomer
  } = useContext(ContextData);

 


  

  // search input onchange
  const handleInputChange = (event) => {
    setSearchCustomer(event.target.value);
    setCurrentPage(1); // reset to first page on new search
  };

  // Customer update
  const handleUpdateCustomer = (e, id) => {
    e.preventDefault();
    const form = e.target;
    const customerName = form.customer_name.value;
    const contactNumber = form.contact_number.value;
    const customerAddress = form.customer_address.value;

    if (contactNumber.length < 11) {
      toast.error("Invalid contact number");
      return;
    }

    const updateCustomerInfo = { customerName, contactNumber, customerAddress };
    axiosSecure
      .put(`/updateCustomer/${id}`, updateCustomerInfo)
      .then((data) => {
        if (data.data.modifiedCount === 1) {
          setReFetch(!reFetch);
          const modal = document.querySelector(`#AddCustomer_${id}`);
          modal.close();
          Swal.fire({
            text: "Customer updated successfully",
            icon: "success",
          });
        } else {
          toast.error(data.data);
        }
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  };

  //   delete customer
  // const handleDeleteCustomer = (id) => {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       axiosSecure
  //         .delete(`/deleteCustomer/${id}`)
  //         .then((data) => {
  //           if (data.data.deletedCount === 1) {
  //             setReFetch(!reFetch);
  //           }
  //         })
  //         .catch((error) => {
  //           toast.error("Server error", error);
  //         });
  //     }
  //   });
  // };
  // ..................................................
  // Pagination
  const totalItem = customerCount;
  const numberOfPages = Math.ceil(totalItem / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Maximum number of page buttons to show
    const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
    const totalPages = numberOfPages;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= halfMaxPagesToShow) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...', totalPages);
      } else if (currentPage > totalPages - halfMaxPagesToShow) {
        pageNumbers.push(1, '...');
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1, '...');
        for (let i = currentPage - halfMaxPagesToShow; i <= currentPage + halfMaxPagesToShow; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...', totalPages);
      }
    }

    return pageNumbers;
  };



  const handleItemsPerPage = (e) => {
    const val = parseInt(e.target.value);
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numberOfPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
    // any other logic to handle page change
  };

  // ...................................................................



  return (
    <div>
      <div className="bg-green-500 rounded-md shadow w-[208px]">
        <AddCustomer />
      </div>

      <div className="mt-5 pb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Customer List</h2>
          <label className="flex gap-1 items-center border py-1 px-3 rounded-md">
            <input
              onChange={handleInputChange}
              type="text"
              name="search"
              placeholder="Search"
              className=" hover:outline-none outline-none"
              size="13"
            />
            <CiSearch />
          </label>
        </div>

        {/* Customer table */}
        <div className="mt-2">
          {customer.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                {/* head */}
                <thead className="bg-green-200 text-black">
                  <tr>
                    <th>Serial No</th>
                    <th>Customer Name</th>
                    <th>Contact No</th>
                    <th>Customer address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(customer) &&
                    customer.map((cus, i) => (
                      <tr key={i}>
                        <td>{cus.serial}</td>
                        <td>{cus.customerName}</td>
                        <td>{cus.contactNumber}</td>
                        <td>{cus.customerAddress}</td>
                        <td>
                          <div className="flex items-center text-xl w-full gap-3">
                            <button
                              onClick={() =>
                                document
                                  .getElementById(`AddCustomer_${cus._id}`)
                                  .showModal()
                              }
                            >
                              <MdOutlineEdit />
                            </button>

                            {/* update modal */}

                            <dialog
                              id={`AddCustomer_${cus._id}`}
                              className="modal text-[16px]"
                            >
                              <div className="modal-box">
                                <h3 className="font-bold text-lg mb-3 uppercase">
                                  Update customer:
                                </h3>
                                <hr />
                                <form method="dialog">
                                  {/* if there is a button in form, it will close the modal */}
                                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                                    ✕
                                  </button>
                                </form>
                                <form
                                  onSubmit={(e) =>
                                    handleUpdateCustomer(e, cus._id)
                                  }
                                  className="mt-5 space-y-3"
                                >
                                  <label className="flex items-center">
                                    <p className="w-1/2 font-semibold">
                                      Customer Name:
                                    </p>{" "}
                                    <input
                                      type="text"
                                      name="customer_name"
                                      placeholder="Customer Name"
                                      defaultValue={cus.customerName}
                                      className="py-1 px-2 rounded-md outline-none border w-full"
                                      required
                                    />
                                  </label>

                                  <label className="flex items-center">
                                    <p className="w-1/2 font-semibold">
                                      Contact number:
                                    </p>{" "}
                                    <input
                                      type="text"
                                      name="contact_number"
                                      placeholder="Contact number"
                                      defaultValue={cus.contactNumber}
                                      className="py-1 px-2 rounded-md outline-none border w-full"
                                      required
                                    />
                                  </label>

                                  <label className="flex items-start">
                                    <p className="w-1/2 font-semibold">
                                      Customer address:
                                    </p>
                                    <textarea
                                      name="customer_address"
                                      placeholder="Customer address"
                                      rows="4"
                                      defaultValue={cus.customerAddress}
                                      className="w-full px-2 py-1 outline-none border rounded-md"
                                      required
                                    ></textarea>
                                  </label>

                                  <label className="flex items-start justify-end gap-3">
                                    <input
                                      type="reset"
                                      value="Reset"
                                      className="bg-yellow-300 py-2 px-3 rounded-md"
                                    />
                                    <input
                                      type="submit"
                                      value="Update customer"
                                      className="bg-green-500 py-2 px-3 rounded-md text-white hover:bg-green-600 cursor-pointer"
                                    />
                                  </label>
                                </form>
                              </div>
                            </dialog>

                            {/* Delete customer */}
                            {/* <button
                              onClick={() => handleDeleteCustomer(cus._id)}
                            >
                              <MdDelete className="text-red-500" />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Customer list is empty</p>
          )}
        </div>
      </div>

      {/* Pagination */}

      {customerCount > 10 && (
        <div className="my-8 flex justify-center gap-1">
          <button
            onClick={handlePrevPage}
            className="py-2 px-3 bg-green-500 text-white rounded-md hover:bg-gray-600"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {renderPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageClick(page)}
              className={`py-2 px-5 bg-green-500 text-white rounded-md hover:bg-gray-600 ${
                currentPage === page ? "!bg-gray-600" : ""
              }`}
              disabled={typeof page !== 'number'}
            >
              {page}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            className="py-2 px-3 bg-green-500 text-white rounded-md hover:bg-gray-600"
            disabled={currentPage === numberOfPages}
          >
            Next
          </button>

          <select
            value={itemsPerPage}
            onChange={handleItemsPerPage}
            name=""
            id=""
            className="py-2 px-1 rounded-md bg-green-500 text-white outline-none"
          >

            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Customer;
