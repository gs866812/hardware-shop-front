import { useContext, useEffect } from "react";
import { FcWorkflow } from "react-icons/fc";
import { ContextData } from "../../Provider";
import { CiSearch } from "react-icons/ci";
import useAxiosProtect from "../hooks/useAxiosProtect";
import { toast } from "react-toastify";

const StockPopUp = () => {
  const axiosProtect = useAxiosProtect();
    const {stock, setSearchStock, setCurrentPage, user, currentPage, itemsPerPage,
      searchStock, setCount, setStock, reFetch
     } = useContext(ContextData);

         // __________________________________________________________________________
    useEffect(() => {
      // Reset search term and current page on component mount
      setSearchStock("");
      setCurrentPage(1);
  
      return () => {
        // Cleanup function to reset search term and current page on component unmount
        setSearchStock("");
        setCurrentPage(1);
      };
    }, [setSearchStock, setCurrentPage]);
    // __________________________________________________________________________

     // get stock balance
  useEffect(() => {
    axiosProtect
      .get(`/stockBalance`, {
        params: {
          userEmail: user?.email,
          page: currentPage,
          size: itemsPerPage,
          search: searchStock,
        },
      })
      .then((res) => {
        setStock(res.data.result);
        setCount(res.data.count);
      })
      .catch((err) => {
        toast.error(err);
      });
  }, [reFetch, currentPage, itemsPerPage, searchStock]);


     // search input onchange
    const handleInputChange = (event) => {
      setSearchStock(event.target.value);
      setCurrentPage(1); // reset to first page on new search
     };

  return (
    <div>
      <div
        onClick={() => document.getElementById("stock_modal").showModal()}
        className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
      >
        <span className="flex items-center gap-2">
          {" "}
          <FcWorkflow />
          Stock
        </span>
      </div>

      {/* Modal */}

      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="stock_modal" className="modal text-black flex flex-col justify-start items-center mt-5">
        <div className="modal-box w-auto max-w-5xl">
        <div className="flex items-center justify-between mx-3">
          <h2 className="text-2xl">Current stock balance:</h2>
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
          <div className="modal-action">
            <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <div className="overflow-x-auto mt-1">
            
            <table className="table table-zebra">
              {/* head */}
              <thead>
                <tr className="border bg-green-200 text-black">
                  <th>Product ID</th>
                  <th>Product name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Sales Price</th>
                  <th>Storage</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {Array.isArray(stock) &&
                  stock.map((stock) => (
                    <tr key={stock._id} className={`${stock.purchaseQuantity <= stock.reOrderQuantity? 'bg-yellow-100': ''}`}>
                      <td>{stock.productID}</td>
                      <td>{stock.productTitle}</td>
                      <td className="text-center">{parseFloat(stock.purchaseQuantity).toFixed(2)}</td>
                      <td>{stock.purchaseUnit}</td>
                      <td>{stock.category}</td>
                      <td>{stock.brand}</td>
                      <td className="text-center">{parseFloat(stock.salesPrice).toFixed(2)}</td>
                      <td>{stock.storage}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          </div>
        </div>
      </dialog>
    </div>
  );
};

export default StockPopUp;
