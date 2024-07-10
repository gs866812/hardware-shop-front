import React, { useContext, useState } from "react";
import { ContextData } from "../../Provider";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { toast } from "react-toastify";

const AddCustomer = () => {
  const axiosSecure = useAxiosSecure();
  const { reFetch, setReFetch } = useContext(ContextData);
  const [customerValue, setCustomerValue] = useState("");
  const [contactNumberValue, setContactNumberValue] = useState("");

  // add customer input onchange
  const handleInputCustomer = (event) => {
    const customerNameValue = event.target.value;
    const onlyTextRegex = /^(?! +$)[A-Za-z0-9\s-]*$/;
    if (onlyTextRegex.test(customerNameValue)) {
      setCustomerValue(customerNameValue);
    }
  };

  // contact number input onchange
  const handleInputContactNumber = (event) => {
    const customerNumberValue = event.target.value;
    const onlyNumberRegex = /^[0-9]{0,11}$/;
    if (onlyNumberRegex.test(customerNumberValue)) {
      setContactNumberValue(customerNumberValue);
    }
  };

  // handle reset
  const handleReset = () => {
    setCustomerValue("");
    setContactNumberValue("");
  };


  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (contactNumberValue.length < 11) {
      return toast.error("Invalid contact number");
    }
    const form = e.target;
    const customerName = form.customer_name.value;
    const contactNumber = form.contact_number.value;
    const customerAddress = form.customer_address.value;
    const customerInfo = {
        customerName,
        contactNumber,
        customerAddress,
    };

    axiosSecure.post(`/addCustomer`, customerInfo)
      .then((data) => {
        if (data.data.insertedId) {
          setReFetch(!reFetch);
          handleReset();
          form.reset();
          // const modal = document.querySelector('#AddSupplier');
          // modal.close();

          toast.success(`Customer added successfully`);
        } else {
          toast.error(data.data);
        }
      })
      .catch((error) => {
        toast.error("Server error", error);
      });
  };


  return (
    <div>
      <div
        onClick={() => document.getElementById("AddCustomer").showModal()}
        className="w-auto font-semibold flex items-center py-2 px-5 gap-2 text-xl text-white cursor-pointer justify-center"
      >
        <span>+ Add Customer</span>
      </div>
      {/* modal */}

      <div>
        <dialog id="AddCustomer" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3 uppercase">
              Add new Customer:
            </h3>
            <hr />
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <form onSubmit={handleAddCustomer} className="mt-5 space-y-3">
              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Customer Name:</p>{" "}
                <input
                  type="text"
                  name="customer_name"
                  placeholder="Customer Name"
                  value={customerValue}
                  onChange={handleInputCustomer}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Contact number:</p>{" "}
                <input
                  type="text"
                  name="contact_number"
                  placeholder="Contact number"
                  value={contactNumberValue}
                  onChange={handleInputContactNumber}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-start">
                <p className="w-1/2 font-semibold">Customer address:</p>
                <textarea
                  name="customer_address"
                  placeholder="Customer address"
                  rows="4"
                  className="w-full px-2 py-1 outline-none border rounded-md"
                  required
                ></textarea>
              </label>

              <span className="flex items-start justify-end gap-3">
                <input
                  onClick={() => handleReset()}
                  type="reset"
                  value="Reset"
                  className="bg-yellow-300 py-2 px-4 rounded-md"
                />
                <input
                  type="submit"
                  value="Add customer"
                  className="bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer"
                />
              </span>
            </form>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default AddCustomer;
