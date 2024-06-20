import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { ContextData } from "../../Provider";
import useAxiosSecure from "../hooks/useAxiosSecure";

const AddSupplier = () => {
  const axiosSecure = useAxiosSecure();
  const [supplierValue, setSupplierValue] = useState("");
  const [contactPersonValue, setContactPersonValue] = useState("");
  const [contactNumberValue, setContactNumberValue] = useState("");

  const { reFetch, setReFetch } = useContext(ContextData);

  // add supplier input onchange
  const handleInputSupplier = (event) => {
    const supplierNameValue = event.target.value;
    const onlyTextRegex = /^(?! +$)[A-Za-z0-9\s-]*$/;
    if (onlyTextRegex.test(supplierNameValue)) {
      setSupplierValue(supplierNameValue);
    }
  };

  // contact person input onchange
  const handleInputContactPerson = (event) => {
    const contactPersonNameValue = event.target.value;
    const onlyTextRegex = /^(?! +$)[A-Za-z\s]*$/;
    if (onlyTextRegex.test(contactPersonNameValue)) {
      setContactPersonValue(contactPersonNameValue);
    }
  };
  // contact number input onchange
  const handleInputContactNumber = (event) => {
    const contactPersonNumberValue = event.target.value;
    const onlyNumberRegex = /^[0-9]{0,11}$/;
    if (onlyNumberRegex.test(contactPersonNumberValue)) {
      setContactNumberValue(contactPersonNumberValue);
    }
  };

  // handle reset
  const handleReset = () => {
    setSupplierValue("");
    setContactPersonValue("");
    setContactNumberValue("");
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (contactNumberValue.length < 11) {
      return toast.error("Invalid contact number");
    }
    const form = e.target;
    const supplierName = form.supplier_name.value;
    const contactPerson = form.contact_person.value;
    const contactNumber = form.contact_number.value;
    const supplierAddress = form.supplier_address.value;
    const supplierInfo = {
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
    };

    axiosSecure.post(`/addSupplier`, supplierInfo)
      .then((data) => {
        if (data.data.insertedId) {
          setReFetch(!reFetch);
          handleReset();
          form.reset();
          // const modal = document.querySelector('#AddSupplier');
          // modal.close();

          toast.success(`Supplier added successfully`);
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
        onClick={() => document.getElementById("AddSupplier").showModal()}
        className="w-auto font-semibold flex items-center py-2 px-5 gap-2 text-xl text-white cursor-pointer justify-center"
      >
        <span>+ Add Supplier</span>
      </div>
      {/* modal */}

      <div>
        <dialog id="AddSupplier" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3 uppercase">
              Add new supplier:
            </h3>
            <hr />
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <form onSubmit={handleAddSupplier} className="mt-5 space-y-3">
              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Supplier Name:</p>{" "}
                <input
                  type="text"
                  name="supplier_name"
                  placeholder="Supplier Name"
                  value={supplierValue}
                  onChange={handleInputSupplier}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Contact person:</p>{" "}
                <input
                  type="text"
                  name="contact_person"
                  placeholder="Contact person"
                  value={contactPersonValue}
                  onChange={handleInputContactPerson}
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
                <p className="w-1/2 font-semibold">Supplier address:</p>
                <textarea
                  name="supplier_address"
                  placeholder="Supplier address"
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
                  value="Add supplier"
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

export default AddSupplier;
