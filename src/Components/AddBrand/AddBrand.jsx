import React, { useContext, useState } from "react";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import useAxiosSecure from "../hooks/useAxiosSecure";

const AddBrand = () => {
  const [brandValue, setBrandValue] = useState("");
  const axiosSecure = useAxiosSecure();
  const { reFetch, setReFetch } = useContext(ContextData);

  // brand input onchange
  const handleInputBrand = (event) => {
    const brandValue = event.target.value;
    const onlyTextRegex = /^(?! +$)[A-Za-z\s]*$/;
    if (onlyTextRegex.test(brandValue)) {
      setBrandValue(brandValue);
    }
  };

  // add brand
  const handleAddBrand = () => {
    setBrandValue("");
    const brandValue = document.getElementById("brand-name").value;
    axiosSecure.post(`/brands/${brandValue}`)
      .then((data) => {
        if (data.data.insertedId) {
          setReFetch(!reFetch);
          toast.success(`${brandValue} added successfully`);
        } else {
          toast.error(data.data);
        }
      }).catch(error => {
        toast.error('Server error', error);
    })
  };

  return (
    <div>
      <div
        onClick={() => document.getElementById("AddBrand").showModal()}
        className="py-2 px-10 font-semibold  flex items-center gap-2 text-xl text-white cursor-pointer"
      > <span>+ Add Brand</span>
      </div>

      {/* add brand modal */}
      <div>
        <dialog id="AddBrand" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2 uppercase">Add new Brand:</h3>
            <hr />
            <p className="py-4">
              <input
                onChange={handleInputBrand}
                value={brandValue}
                type="text"
                name="brand-name"
                placeholder="Brand Name"
                className="border py-2 px-4 w-full outline-none rounded-md"
                id="brand-name"
                required
              />
            </p>
            <div className="modal-action">
              <form method="dialog">
                {brandValue.length > 0 ? (
                  <button
                    onClick={handleAddBrand}
                    className="bg-green-500 text-white py-1 px-4 rounded-md"
                  >
                    Add
                  </button>
                ) : (
                  <button className="bg-gray-100 py-1 px-4 rounded-md" disabled>
                    Add
                  </button>
                )}
                <button className="bg-red-500 text-white py-1 px-4 rounded-md ml-2">
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

export default AddBrand;
