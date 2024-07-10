import { useContext, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { toast } from "react-toastify";
import { ContextData } from "../Provider";
import { MdOutlineEdit } from "react-icons/md";
import Swal from "sweetalert2";
import AddProduct from "../Components/AddProduct/AddProduct";
import AddCategory from "../Components/AddCategory/AddCategory";
import AddBrand from "../Components/AddBrand/AddBrand";
import AddUnit from "../Components/AddUnit/AddUnit";
import useAxiosSecure from "../Components/hooks/useAxiosSecure";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import excel from "../assets/images/excel.png";
import pdf from "../assets/images/pdf.png";

const Product = () => {
  const axiosSecure = useAxiosSecure();
  const {
    categories,
    brands,
    units,
    reFetch,
    setReFetch,
    products,
    productCount,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    setSearchTerm,
  } = useContext(ContextData);

  const [downloadProducts, setDownloadProducts] = useState([]);

  useEffect(() => {
    axiosSecure.get("/products").then((data) => {
      setDownloadProducts(data.data.products);
    });
  }, [reFetch, axiosSecure]);


  useEffect(() => {
    setSearchTerm("");
    setCurrentPage(1);

    return () => {
      setSearchTerm("");
      setCurrentPage(1);
    };
  }, [setSearchTerm, setCurrentPage]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleUpdateProduct = (e, id) => {
    e.preventDefault();
    const form = e.target;
    const updateProductName = form.update_product_name.value;
    const updateCategory = form.querySelector("#update-category").value;
    const updateBrand = form.querySelector("#update-brand").value;
    const updateUnit = form.querySelector("#update-unit").value;

    const updateInfo = {
      updateProductName,
      updateCategory,
      updateBrand,
      updateUnit,
    };

    axiosSecure
      .put(`/updateProduct/${id}`, updateInfo)
      .then((data) => {
        if (data.data.modifiedCount === 1) {
          setReFetch(!reFetch);
          const modal = document.querySelector(`#my_modal_update_${id}`);
          modal.close();
          Swal.fire({
            text: "Product updated successfully",
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

  const totalItem = productCount;
  const numberOfPages = Math.ceil(totalItem / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
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
  };

  const downloadExcel = () => {
    // Format the data to include only the desired columns
    const formattedData = downloadProducts.map((product) => ({
      "Product ID": product.productCode,
      "Product Name": product.productName,
      Unit: product.unitName,
      Brand: product.brandName,
      Category: product.categoryName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Product ID",
      "Product Name",
      "Unit",
      "Brand",
      "Category",
    ];
    const tableRows = [];

    downloadProducts.forEach((product) => {
      const productData = [
        product.productCode,
        product.productName,
        product.unitName,
        product.brandName,
        product.categoryName,
      ];
      tableRows.push(productData);
    });

    doc.text("Product List", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("products.pdf");
  };

  return (
    <div className="py-0">
      <div className="flex gap-5 justify-between">
        <div className="border shadow rounded-md w-auto bg-green-600">
          <AddProduct />
        </div>

        <div className="flex gap-2">
          <div className="border shadow rounded-md w-auto bg-[#48514C]">
            <AddCategory />
          </div>

          <div className="border shadow rounded-md w-auto bg-[#48514C]">
            <AddBrand />
          </div>
          <div className="border shadow rounded-md w-auto bg-[#48514C]">
            <AddUnit />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
          <h2 className="text-2xl">Product List</h2>
          <img
              src={excel}
              alt="Excel"
              className="w-[20px] h-[20%] cursor-pointer ml-5"
              onClick={downloadExcel}
            />
            <img
              src={pdf}
              alt="Pdf"
              className="w-[20px] h-[20%] cursor-pointer"
              onClick={downloadPDF}
            />
          </div>
          <div className="flex gap-2">
            

            <label className="flex gap-1 items-center border py-1 px-3 rounded-md border-gray-500">
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
        </div>
      </div>

      <div className="mt-2 pb-5">
        <div className="overflow-x-auto">
          {products.length > 0 ? (
            <table className="table table-zebra" id="productTable">
              <thead>
                <tr className="border bg-green-200 text-black">
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Brand </th>
                  <th>Unit </th>
                  <th>Action </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(products) &&
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.productCode}</td>
                      <td>{product.productName}</td>
                      <td>{product.categoryName}</td>
                      <td>{product.brandName}</td>
                      <td>{product.unitName}</td>
                      <td>
                        <div className="flex items-center text-xl w-full gap-3">
                          <button
                            onClick={() =>
                              document
                                .getElementById(
                                  `my_modal_update_${product._id}`
                                )
                                .showModal()
                            }
                          >
                            <MdOutlineEdit />{" "}
                          </button>
                          <dialog
                            id={`my_modal_update_${product._id}`}
                            className="modal"
                          >
                            <div className="modal-box">
                              <h3 className="font-bold text-lg mb-2 uppercase">
                                Update Product:
                              </h3>
                              <hr />
                              <div className="mt-5">
                                <form method="dialog">
                                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                                    ✕
                                  </button>
                                </form>
                                <form
                                  onSubmit={(e) =>
                                    handleUpdateProduct(e, product._id)
                                  }
                                >
                                  <p className="text-[16px] flex items-center gap-4 mb-3">
                                    <span className="w-1/3 font-bold">
                                      Product Name:
                                    </span>
                                    <input
                                      type="text"
                                      name="update_product_name"
                                      defaultValue={product.productName}
                                      required
                                      className="border py-1 px-2 rounded-md outline-none w-1/2"
                                    />
                                  </p>

                                  <p className="text-[16px] flex items-center gap-4 mb-3">
                                    <span className="w-1/3 font-bold">
                                      Category:
                                    </span>
                                    <select
                                      className="border max-w-xs rounded-md py-1 px-2 outline-none w-1/2"
                                      id="update-category"
                                      defaultValue="Select category"
                                    >
                                      <option>{product.categoryName}</option>
                                      {categories?.map((category) => (
                                        <option key={category._id}>
                                          {category.category}
                                        </option>
                                      ))}
                                    </select>
                                  </p>

                                  <p className="text-[16px] flex items-center gap-4 mb-3">
                                    <span className="w-1/3 font-bold">
                                      Brand:
                                    </span>
                                    <select
                                      className="border max-w-xs rounded-md py-1 px-2 outline-none w-1/2"
                                      id="update-brand"
                                      defaultValue="Select brand"
                                    >
                                      <option>{product.brandName}</option>
                                      {brands?.map((brand) => (
                                        <option key={brand._id}>
                                          {brand.brand}
                                        </option>
                                      ))}
                                    </select>
                                  </p>

                                  <p className="text-[16px] flex items-center gap-4 mb-3">
                                    {" "}
                                    <span className="w-1/3 font-bold">
                                      Unit:
                                    </span>
                                    <select
                                      className="border max-w-xs rounded-md py-1 px-2 outline-none w-1/2"
                                      id="update-unit"
                                      defaultValue="Select unit"
                                    >
                                      <option>{product.unitName}</option>
                                      {units?.map((unit) => (
                                        <option key={unit._id}>
                                          {unit.unit}
                                        </option>
                                      ))}
                                    </select>
                                  </p>
                                  <p className="flex gap-4 mt-5">
                                    <span className="w-1/3"></span>
                                    <span className="w-1/2 flex justify-end gap-2">
                                      <input
                                        type="reset"
                                        value="Reset"
                                        className="bg-yellow-300 py-1 px-2 rounded-md text-[15px]"
                                      />
                                      <input
                                        type="submit"
                                        value="Update"
                                        className="bg-green-500 py-1 px-2 rounded-md text-white hover:bg-green-600 text-[15px] cursor-pointer"
                                      />
                                    </span>
                                  </p>
                                </form>
                              </div>
                            </div>
                          </dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>Product list is empty</p>
          )}
        </div>
      </div>

      {productCount > 10 && (
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

export default Product;
