import { CiSearch } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ContextData } from "../../Provider";
import useAxiosProtect from "../hooks/useAxiosProtect";

const SupplierLedger = () => {
  const mail = localStorage.getItem('userEmail');
  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();
  const { reFetch, setReFetch, user } = useContext(ContextData);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplier, setSupplier] = useState([]);
  const [count, setCount] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

 

  // get supplier due list
  useEffect(()=> {
    axiosProtect.get(`/supplierLedger`, {
      params: {
        userEmail: mail,
        page: currentPage,
        size: itemsPerPage,
        search: searchTerm,
      },
    })
    .then(data => {
      setSupplier(data.data.result);
      setCount(data.data.count);
    }).catch(err => {
      toast.error('Server error, err');
    });
  },[setReFetch, currentPage, itemsPerPage, searchTerm, axiosProtect]);

  const navigate = useNavigate();

  const handleSupplierLedger = (id) => {
    navigate(`/supplierLedger/id/${id}`);
  };

  // .............................................................
  useEffect(() => {
    axiosSecure
      .get("/singleSupplierCount")
      .then((res) => {
        setCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);
  

// Pagination
const totalItem = count;
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



   // search input onchange
   const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // reset to first page on new search
  };
  

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Supplier ledger</h2>
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

      {/* table */}

      <div>
          <div className="overflow-x-auto mt-5 pb-5">
            <table className="table table-zebra">
              {/* head */}
              <thead>
                <tr className="border bg-green-200 text-black">
                  <th>Supplier ID</th>
                  <th>Supplier name</th>
                  <th>Address</th>
                  <th>Contact person</th>
                  <th>Contact No.</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {Array.isArray(supplier) &&
                  supplier.map((supplier) => (
                    <tr key={supplier._id}>
                      <td>{supplier.supplierSerial}</td>
                      <td>{supplier.supplierName}</td>
                      <td>{supplier.supplierAddress}</td>
                      <td>{supplier.contactPerson}</td>
                      <td>{supplier.contactNumber}</td>
                      <td> <IoEyeOutline onClick={()=> handleSupplierLedger(supplier.supplierSerial)} className="text-xl cursor-pointer hover:text-yellow-500"/></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        {count > 10 && (
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
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SupplierLedger;
