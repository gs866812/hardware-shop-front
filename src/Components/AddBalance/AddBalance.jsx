import axios from "axios";
import moment from "moment";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ContextData } from "../../Provider";
import useAxiosSecure from "../hooks/useAxiosSecure";

const AddBalance = () => {

  const {reFetch, setReFetch, userName} = useContext(ContextData);

    const [newAmount, setNewAmount] = useState("");
    const [confirmAmount, setConfirmAmount] = useState("");
    const [notes, setNotes] = useState("");

    // number validation 
    const handleInputNewAmount = (event) => {
        const newAmountValue = event.target.value;
        const onlyNumberRegex = /^\d*\.?\d*$/;
        if (onlyNumberRegex.test(newAmountValue)) {
            setNewAmount(newAmountValue);
        }
      };

    const handleInputConfirmAmount = (event) => {
        const confirmAmountValue = event.target.value;
        const onlyNumberRegex = /^\d*\.?\d*$/;
        if (onlyNumberRegex.test(confirmAmountValue)) {
            setConfirmAmount(confirmAmountValue);
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
        setNewAmount('');
        setConfirmAmount('');
        setNotes('');
    };

    const handleAddBalance = (e) => {
      const axiosSecure = useAxiosSecure();
        e.preventDefault();
        const date = moment(new Date()).format('DD.MM.YYYY');
        const form = e.target;
        const note = form.notes.value;
        const type = 'Credit';
        const balanceInfo = {confirmAmount, note, date, type, userName};
        
        if(newAmount !== confirmAmount){
            toast.error('Amount not match');
            return;
        };
        axiosSecure.post(`/addBalance`, balanceInfo)
        .then(res => {
          if(res.data.insertedId){
            const modal = document.querySelector(`#AddNewBalance`);
            modal.close();
            setReFetch(!reFetch);

            setNotes('');
            setConfirmAmount('');
            setNewAmount('');

            Swal.fire({
              text: "Amount added successfully",
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
      <button onClick={() => document.getElementById("AddNewBalance").showModal()} className="bg-[#48514C] text-white py-1 px-3 rounded-md">
        + Add Balance
      </button>

      <dialog id="AddNewBalance" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-3 uppercase">
            Add Balance:
          </h3>
          <hr />
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
              ✕
            </button>
          </form>
          <form onSubmit={handleAddBalance} className="mt-5 space-y-5">


            <label className="flex items-center">
              <p className="w-1/2 font-semibold">Amount in BDT:</p>{" "}
              <input
                type="text"
                name="new_amount"
                placeholder="Amount"
                value={newAmount}
                onChange={handleInputNewAmount}
                className="py-1 px-2 rounded-md outline-none border w-1/2"
                required
              />
            </label>

            <label className="flex items-center">
              <p className="w-1/2 font-semibold">Confirm Amount:</p>
              <input
                type="text"
                name="confirm_amount"
                placeholder="Confirm amount"
                value={confirmAmount}
                onChange={handleInputConfirmAmount}
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
                value="Add balance"
                className="bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer"
              />
            </span>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default AddBalance;
