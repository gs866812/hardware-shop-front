import { NavLink } from 'react-router-dom';
import logo from '../../assets/images/logo_white.png';

import { FcBearish, FcBullish, FcBusinessman, FcCurrencyExchange, FcDocument, FcInTransit, FcList, FcLowPriority, FcPaid, FcPieChart, FcShop } from 'react-icons/fc';
import StockPopUp from '../StockPopUp/StockPopUp';
import useAxiosSecure from '../hooks/useAxiosSecure';
import moment from 'moment';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useContext, useState } from 'react';
import { ContextData } from '../../Provider';



const Sidebar = () => {

  const axiosSecure = useAxiosSecure();
  const {reFetch, setReFetch, userName} = useContext(ContextData);
  const [newCostAmount, setNewCostAmount] = useState("");
    const [confirmCostAmount, setConfirmCostAmount] = useState("");
    const [notes, setNotes] = useState("");

       // number validation 
       const handleInputCostAmount = (event) => {
        const newCostAmountValue = event.target.value;
        const onlyNumberRegex = /^\d*\.?\d*$/;
        if (onlyNumberRegex.test(newCostAmountValue)) {
            setNewCostAmount(newCostAmountValue);
        }
      };

      const handleInputConfirmCostAmount = (event) => {
        const confirmCostAmountValue = event.target.value;
        const onlyNumberRegex = /^\d*\.?\d*$/;
        if (onlyNumberRegex.test(confirmCostAmountValue)) {
            setConfirmCostAmount(confirmCostAmountValue);
        }
      };

      // handle notes
      const handleNotes = (e) => {
        const noteValue = e.target.value;
        setNotes(noteValue);
      };

    //   handle reset
    const handleReset = (e) => {
        e.preventDefault();
        setNewCostAmount('');
        setConfirmCostAmount('');
        setNotes('');
    };

  const handleAddCostingBalance = (e) => {
      e.preventDefault();
      const date = moment(new Date()).format('DD.MM.YYYY');
      const form = e.target;
      const note = form.notes.value;
      const type = 'Cost'; // deduct from main balance
      const costBalanceInfo = {confirmCostAmount, note, date, type, userName};
      
      if(newCostAmount !== confirmCostAmount){
          toast.error('Amount not match');
          return;
      };
      axiosSecure.post(`/costingBalance`, costBalanceInfo)
      .then(res => {
        if(res.data.insertedId){
          const modal = document.querySelector(`#AddNewCostingInSidebar`);
          modal.close();
          setReFetch(!reFetch);

          setNotes('');
          setConfirmCostAmount('');
          setNewCostAmount('');

          Swal.fire({
            text: "Costing added successfully",
            icon: "success",
          });
        }else{
          toast.error(res.data);
        }
      }).catch(err => {
        toast.error('Server error', err);
      });

  };

    return (
      <div>
        <div className="sticky top-0 bg-[#2A3042] z-50">
          <img src={logo} alt="MHT" className="py-3" />
        </div>

        <nav className="text-[#C1C1C1] mt-5 w-full">
          <div>
            <NavLink
              to="/"
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcShop className="text-xl" /> Dashboard
            </NavLink>
          </div>

          <div>
            <NavLink
              to="/sales"
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcBullish className="text-xl" /> Sales
            </NavLink>
          </div>
          <div>
            <NavLink
              to="/purchase"
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcLowPriority className="text-xl" /> Purchase
            </NavLink>
          </div>
          <div>
            <NavLink
              to="/quotation"
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcDocument className="text-xl" /> Quotation
            </NavLink>
          </div>
          <div>
            <NavLink
              to="/customer"
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcBusinessman className="text-xl" /> Customer
            </NavLink>
          </div>

          <div>
            <NavLink
              to="/product"
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcPaid className="text-xl" /> Product
            </NavLink>
          </div>

          <div>
            <NavLink
              to="/supplier"
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcInTransit className="text-xl" />
              Supplier{" "}
            </NavLink>
          </div>

          <div className="collapse hover:bg-gray-600 mt-1 collapse-arrow hover:-z-0">
            <input type="checkbox" />
            <div className="collapse-title flex items-center gap-2 px-2">
              <FcList className="text-xl" /> Ledger
            </div>
            <div className="collapse-content">
              <NavLink
                to="/supplierLedger"
                className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
              >
                
                Supplier
              </NavLink>

              <NavLink
                to="/customerLedger"
                className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
              >
                
                Customer
              </NavLink>
            </div>
          </div>

          <div>
            <NavLink
              to="/balance"
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcCurrencyExchange className="text-xl" />
              Balance{" "}
            </NavLink>
          </div>

          <div>
            <button onClick={() => document.getElementById("AddNewCostingInSidebar").showModal()}
              className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px]"
            >
              <FcBearish className="text-xl" />
			        New Expense{" "}
            </button>
             {/* modal */}
             <dialog id="AddNewCostingInSidebar" className="modal text-black">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-3 uppercase">
            New Expense:
          </h3>
          <hr />
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
              ✕
            </button>
          </form>
          <form onSubmit={handleAddCostingBalance} className="mt-5 space-y-5">


            <label className="flex items-center">
              <p className="w-1/2 font-semibold">Cost amount:</p>{" "}
              <input
                type="text"
                name="cost_amount"
                placeholder="Cost Amount"
                value={newCostAmount}
                onChange={handleInputCostAmount}
                className="py-1 px-2 rounded-md outline-none border w-1/2"
                required
              />
            </label>

            <label className="flex items-center">
              <p className="w-1/2 font-semibold">Confirm cost amount:</p>
              <input
                type="text"
                name="confirm_cost_amount"
                placeholder="Confirm cost amount"
                value={confirmCostAmount}
                onChange={handleInputConfirmCostAmount}
                className="py-1 px-2 rounded-md outline-none border w-1/2"
                required
              />
            </label>

            <label className="flex items-center">
              <p className="w-1/2 font-semibold">Notes:</p>
              <textarea
                name="notes"
                onChange={handleNotes}
                value={notes}
                placeholder="Message/ref."
                className="py-1 px-2 rounded-md outline-none border w-1/2"
                required
              />
            </label>

          

            <span className="flex items-start justify-end gap-3">
              <input
              onClick={(e) => handleReset(e)}
                type="reset"
                value="Reset"
                className="bg-yellow-300 text-black py-2 px-4 rounded-md"
              />
              <input
                type="submit"
                value="Add costing"
                className="bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer"
              />
            </span>
          </form>
        </div>
      </dialog>
            
          </div>

          <div>
            <StockPopUp />
          </div>
        </nav>
      </div>
    );
};

export default Sidebar;