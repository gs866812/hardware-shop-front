import { CiSearch } from "react-icons/ci";
import AddSupplier from "../Components/AddSupplier/AddSupplier";
import { MdDelete, MdOutlineEdit } from "react-icons/md";
import { useContext, useEffect } from "react";
import { ContextData } from "../Provider";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useAxiosSecure from "../Components/hooks/useAxiosSecure";

const Supplier = () => {
  const axiosSecure = useAxiosSecure();

  const {
    user,
    supplier,
    reFetch,
    setReFetch,
    supplierCount,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    setSearchSupplier,
  } = useContext(ContextData);

  // __________________________________________________________________________
  useEffect(() => {
    // Reset search term and current page on component mount
    setSearchSupplier("");
    setCurrentPage(1);

    return () => {
      // Cleanup function to reset search term and current page on component unmount
      setSearchSupplier("");
      setCurrentPage(1);
    };
  }, [setSearchSupplier, setCurrentPage]);
  // __________________________________________________________________________

  // search input onchange
  const handleInputChange = (event) => {
    setSearchSupplier(event.target.value);
    setCurrentPage(1); // reset to first page on new search
  };

  const handleUpdateSupplier = (e, id) => {
    e.preventDefault();
    const form = e.target;
    const supplierName = form.supplier_name.value;
    const contactPerson = form.contact_person.value;
    const contactNumber = form.contact_number.value;
    const supplierAddress = form.supplier_address.value;

    if (contactNumber.length < 11) {
      return toast.error("Invalid contact number");
    }

    const updateSupplierInfo = {
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
    };
    axiosSecure
      .put(`/updateSupplier/${id}`, updateSupplierInfo)
      .then((data) => {
        if (data.data.modifiedCount === 1) {
          setReFetch(!reFetch);
          const modal = document.querySelector(`#AddSupplier_${id}`);
          modal.close();
          Swal.fire({
            text: "Supplier updated successfully",
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

  // Pagination
  const totalItem = supplierCount;
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
        pageNumbers.push("...", totalPages);
      } else if (currentPage > totalPages - halfMaxPagesToShow) {
        pageNumbers.push(1, "...");
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1, "...");
        for (
          let i = currentPage - halfMaxPagesToShow;
          i <= currentPage + halfMaxPagesToShow;
          i++
        ) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...", totalPages);
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

  // .................

  return (
    <div>
      <div className="bg-green-500 rounded-md shadow w-[200px]">
        <AddSupplier />
      </div>

      <div className="mt-5 pb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Supplier List</h2>
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

        {/* Supplier table */}
        <div className="mt-2">
          {supplier.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                {/* head */}
                <thead className="bg-green-200 text-black">
                  <tr>
                    <th>Serial No</th>
                    <th>Supplier Name</th>
                    <th>Contact person</th>
                    <th>Contact No</th>
                    <th>Supplier address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(supplier) &&
                    supplier.map((sup, i) => (
                      <tr key={i}>
                        <td>{sup.serial}</td>
                        <td>{sup.supplierName}</td>
                        <td>{sup.contactPerson}</td>
                        <td>{sup.contactNumber}</td>
                        <td>{sup.supplierAddress}</td>
                        <td>
                          <div className="flex items-center text-xl w-full gap-3">
                            <button
                              onClick={() =>
                                document
                                  .getElementById(`AddSupplier_${sup._id}`)
                                  .showModal()
                              }
                            >
                              <MdOutlineEdit />
                            </button>

                            {/* update modal */}

                            <dialog
                              id={`AddSupplier_${sup._id}`}
                              className="modal text-[16px]"
                            >
                              <div className="modal-box">
                                <h3 className="font-bold text-lg mb-3 uppercase">
                                  Update supplier:
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
                                    handleUpdateSupplier(e, sup._id)
                                  }
                                  className="mt-5 space-y-3"
                                >
                                  <label className="flex items-center">
                                    <p className="w-1/2 font-semibold">
                                      Supplier Name:
                                    </p>{" "}
                                    <input
                                      type="text"
                                      name="supplier_name"
                                      placeholder="Supplier Name"
                                      defaultValue={sup.supplierName}
                                      className="py-1 px-2 rounded-md outline-none border w-full"
                                      required
                                    />
                                  </label>

                                  <label className="flex items-center">
                                    <p className="w-1/2 font-semibold">
                                      Contact person:
                                    </p>{" "}
                                    <input
                                      type="text"
                                      name="contact_person"
                                      placeholder="Contact person"
                                      defaultValue={sup.contactPerson}
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
                                      defaultValue={sup.contactNumber}
                                      className="py-1 px-2 rounded-md outline-none border w-full"
                                      required
                                    />
                                  </label>

                                  <label className="flex items-start">
                                    <p className="w-1/2 font-semibold">
                                      Supplier address:
                                    </p>
                                    <textarea
                                      name="supplier_address"
                                      placeholder="Supplier address"
                                      rows="4"
                                      defaultValue={sup.supplierAddress}
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
                                      value="Update supplier"
                                      className="bg-green-500 py-2 px-3 rounded-md text-white hover:bg-green-600 cursor-pointer"
                                    />
                                  </label>
                                </form>
                              </div>
                            </dialog>

                            {/* Delete supplier */}
                            {/* <button
                              onClick={() => handleDeleteSupplier(sup._id)}
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
            <p>Supplier list is empty</p>
          )}
        </div>
      </div>
      {/* Pagination */}
      {supplierCount > 10 && (
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
              onClick={() => typeof page === "number" && handlePageClick(page)}
              className={`py-2 px-5 bg-green-500 text-white rounded-md hover:bg-gray-600 ${
                currentPage === page ? "!bg-gray-600" : ""
              }`}
              disabled={typeof page !== "number"}
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

export default Supplier;
