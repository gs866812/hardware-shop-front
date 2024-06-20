import React, { useContext, useState } from 'react';
import { ContextData } from '../../Provider';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import moment from 'moment';
import axios from 'axios';
import useAxiosSecure from '../hooks/useAxiosSecure';

const AddCosting = () => {

    const {reFetch, setReFetch, userName} = useContext(ContextData);
    const axiosSecure = useAxiosSecure();

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
            const modal = document.querySelector(`#AddNewCosting`);
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
        <>
            <button onClick={() => document.getElementById("AddNewCosting").showModal()} className="bg-[#48514C] text-white py-1 px-3 rounded-md">+ New Expense</button>

            {/* modal */}
            <dialog id="AddNewCosting" className="modal">
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
                className="bg-yellow-300 py-2 px-4 rounded-md"
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
        </>
    );
};

export default AddCosting;