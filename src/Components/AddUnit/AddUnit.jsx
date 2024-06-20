import React, { useContext, useState } from "react";

import { toast } from "react-toastify";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { ContextData } from "../../Provider";

const AddUnit = () => {
  const axiosSecure = useAxiosSecure();
  const [unitValue, setUnitValue] = useState("");
  const {reFetch, setReFetch} = useContext(ContextData);

  // unit input onchange
  const handleInputUnit = (event) => {
    const unitValue = event.target.value;
    const regex = /^(?!\s+$)[\s\S]*$/;
    if (regex.test(unitValue)) {
      setUnitValue(unitValue);
    }
  };

  // add unit
  const handleAddUnit = () => {
    setUnitValue("");
    const unitValue = document.getElementById("unit-name").value;
    axiosSecure.post(`/units/${unitValue}`)
    .then(data => {
      if(data.data.insertedId){
        setReFetch(!reFetch);
        toast.success(`${unitValue} added successfully`);
      }else{
        toast.error(data.data);
      }
    }).catch(err => {
      toast.error('Server error', err);
    });
      
  };

  return (
    <div>
      <div
        onClick={() => document.getElementById("AddUnit").showModal()}
        className="py-2 px-10 font-semibold  flex items-center gap-2 text-xl text-white cursor-pointer"
      >
        <span>+ Add Unit</span>
      </div>

      {/* add unit modal */}
      <div>
        <dialog id="AddUnit" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2 uppercase">Add Unit:</h3>
            <hr />
            <p className="py-4">
              <input
                onChange={handleInputUnit}
                value={unitValue}
                type="text"
                name="unit-name"
                placeholder="Unit Name"
                className="border py-2 px-4 w-full outline-none rounded-md"
                id="unit-name"
                required
              />
            </p>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}

                {unitValue.length > 0 ? (
                  <button
                    onClick={handleAddUnit}
                    className="bg-green-500 text-white py-1 px-4 rounded-md"
                  >
                    Add
                  </button>
                ) : (
                  <button className="bg-gray-100 py-1 px-4 rounded-md" disabled>
                    Add
                  </button>
                )}
                <button className="bg-red-500 py-1 px-4 rounded-md ml-2 text-white">
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default AddUnit;
