import { useContext, useEffect, useState } from "react";
import AddBalance from "../Components/AddBalance/AddBalance";
import AddCosting from "../Components/AddCosting/AddCosting";
import { ContextData } from "../Provider";
import { toast } from "react-toastify";
import useAxiosSecure from "../Components/hooks/useAxiosSecure";
import useAxiosProtect from "../Components/hooks/useAxiosProtect";

const Expense = () => {
  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();
  const [costingBalance, setCostingBalance] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const [profit, setProfit] = useState([]);
  const [count, setCount] = useState({});
  const { mainBalance, reFetch,  setMainBalance, user } = useContext(ContextData);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');


  const balance = mainBalance[0]?.mainBalance;
  const parseBalance = parseFloat(balance || 0);
  const currentBalance = parseFloat(parseBalance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
  });
  // get costing balance
  useEffect(() => {
    axiosProtect
      .get("/costingBalance", {
        params: {
		        userEmail: user?.email,
        },
      })
      .then((res) => {
        setCostingBalance(res.data);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  const costingBalances = costingBalance[0]?.costingBalance;
  const parseCostingBalance = parseFloat(costingBalances || 0);
  const currentCostingBalance = parseFloat(parseCostingBalance).toLocaleString(
    undefined,
    { minimumFractionDigits: 2 }
  );

  // get profit balance
  useEffect(()=> {
    axiosProtect.get('/profitBalance' , {
      params: {
        userEmail: user?.email,
      },
    })
    .then((res) => {
      setProfit(res.data);
    })
    .catch((err) => {
      toast.error("Server error", err);
    });
  },[reFetch]);


  // show transactions
  useEffect(() => {
    axiosProtect
      .get(`/allTransactions`, {
        params: {
          userEmail: user?.email,
          page: currentPage,
          size: itemsPerPage,
          search: searchTerm,
        },
      })
      .then((res) => {
        setTransaction(res.data.result);
        setCount(res.data.count);
      });
  }, [reFetch, currentPage, itemsPerPage, searchTerm, axiosProtect]);

  useEffect(() => {
    axiosSecure
      .get("/transactionCount")
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

  // ............... get main balance
  useEffect(() => {
    axiosProtect.get("/mainBalance", {
      params: {
        userEmail: user?.email,
      },
    })
    .then((res) => {
      setMainBalance(res.data);
    });
  }, [reFetch]);


  return (
    <div>
      <div className="flex justify-between gap-5 uppercase">
        <div className="w-full">
          <div className="flex flex-col gap-3 justify-center border px-3 py-6 shadow-lg text-center rounded-md bg-green-600 text-white">
            <h2 className="text-2xl font-bold">BDT: {currentBalance || 0}</h2>
            <p>Total Balance</p>
          </div>
        </div>

        <div className="w-full bg">
          <div className="flex flex-col gap-3 justify-center border px-3 py-6 shadow-lg text-center rounded-md bg-red-500 text-white">
            <h2 className="text-2xl font-bold">BDT: {currentCostingBalance || 0}</h2>
            <p>Total Expense</p>
          </div>
        </div>

        <div className="w-full bg">
          <div className="flex flex-col gap-3 justify-center border px-3 py-6 shadow-lg text-center rounded-md bg-yellow-500 text-white">
            <h2 className="text-2xl font-bold">BDT: {parseFloat(profit[0]?.profitBalance).toFixed(2) || 0}</h2>
            <p>Total Profit</p>
          </div>
        </div>
      </div>

      <div className="pb-5">
        <div className="sticky top-0 z-50 bg-white ">
          <div className="flex justify-between items-center py-2">
            <h2 className="py-2 text-xl">Recent transactions</h2>
            <div className="flex gap-2">
              <input
                type="text"
                name="transaction_search"
                placeholder="search"
                onChange={handleInputChange}
                size={10}
                className="px-2 border outline-none border-gray-500 rounded-md"
              />
              <AddBalance />
              <AddCosting />
            </div>
          </div>

          <table className="table table-zebra">
            {/* head */}
            <thead>
              <tr className="border bg-green-200 text-black">
                <th className="w-[10%]">Serial No</th>
                <th className="w-[15%]">Date</th>
                <th>Description</th>
                <th className="w-[15%]">Amount</th>
                <th className="w-[10%]">Type</th>
                <th className="w-[12%]">User</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* show latest transactions in table */}
        <div className="overflow-x-auto">
          <table className="table ">
            {/* head */}
            <thead className="hidden">
              <tr className="border bg-green-200 text-black">
                <th className="w-[10%]">Serial No</th>
                <th className="w-[15%]">Date</th>
                <th>Description</th>
                <th className="w-[15%]">Amount</th>
                <th className="w-[10%]">Type</th>
                <th className="w-[12%]">User</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {Array.isArray(transaction) && transaction.length >= 0 ? (
                transaction.map((tran, i) => (
                  <tr
                    key={tran._id}
                    className={`${tran.type === "Cost" ? "!bg-red-100" : ""} `}
                  >
                    <td className="w-[10%] text-center">{tran.serial}</td>
                    <td className="w-[15%]">{tran.date}</td>
                    <td>
                      {tran.note}
                    </td>
                    <td className="w-[15%]">
                      {" "}
                      {parseFloat(tran.totalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="w-[10%]">{tran.type}</td>
                    <td className="w-[12%]">{tran.userName}</td>
                  </tr>
                ))
              ) : (
                <p>No recent transaction</p>
              )}
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
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="50">100</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Expense;
