import React, { useContext, useState } from "react";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import useAxiosSecure from "../hooks/useAxiosSecure";

const AddCategory = () => {
  const axiosSecure = useAxiosSecure();
  const [categoryValue, setCategoryValue] = useState("");
  const [categoryCodeValue, setCategoryCodeValue] = useState("");

  const { reFetch, setReFetch} = useContext(ContextData);

  // category name input onchange
  const handleInputCategory = (event) => {
    const categoryValue = event.target.value;
    const onlyTextRegex = /^(?! +$)[A-Za-z\s]*$/;
    if (onlyTextRegex.test(categoryValue)) {
      setCategoryValue(categoryValue);
    }
  };
  // category code input onchange
  const handleInputCategoryCode = (event) => {
    const categoryCodeValue = event.target.value;
    const onlyNumberRegex = /^[1-9]{0,3}$/;
    if (onlyNumberRegex.test(categoryCodeValue) || categoryCodeValue === "") {
      setCategoryCodeValue(categoryCodeValue);
    }
  };

      // add category
      const handleAddCategory = () => {
        // setCategoryValue("");
        setCategoryCodeValue("");
        const categoryValue = document.getElementById("category-name").value;
        const categoryCodeValue = document.getElementById("category-code").value;
        const categoryInfo = {categoryValue, categoryCodeValue};
  
  
        axiosSecure.post(`/addCategory`, categoryInfo)
          .then((data) => {
            if(data.data.insertedId){
              setReFetch(!reFetch);
              setCategoryValue("");
              toast.success(`${categoryValue} added successfully`);
              
            } else{
              return toast.error(data.data);
            }
          }).catch(error => {
              toast.error('Server error', error);
          })
      };

  return (
    <div>
      <div
        onClick={() => document.getElementById("addCategory").showModal()}
        className="py-2 px-10 font-semibold flex items-center gap-2 text-xl text-white cursor-pointer"
      >
        <span>+ Add Category</span>
        </div>

        {/* add category modal */}
        <div>
          <dialog id="addCategory" className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-2 uppercase">
                Add new category:
              </h3>
              <hr />
              <p className="py-4">
                <input
                  onChange={handleInputCategory}
                  value={categoryValue}
                  type="text"
                  name="category-name"
                  placeholder="Category Name"
                  className="border py-2 px-4 w-full outline-none rounded-md"
                  id="category-name"
                  required
                />

                <input
                  onChange={handleInputCategoryCode}
                  value={categoryCodeValue}
                  type="text"
                  name="category-code"
                  placeholder="Category Code 3 digit only"
                  className="border py-2 px-4 w-full outline-none rounded-md mt-3"
                  id="category-code"
                  required
                />
              </p>
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}

                  {categoryValue.length > 0 &&
                  categoryCodeValue.length === 3 ? (
                    <button
                      onClick={handleAddCategory}
                      className="bg-green-500 text-white py-1 px-4 rounded-md"
                    >
                      Add
                    </button>
                  ) : (
                    <button
                      className="bg-gray-100 py-1 px-4 rounded-md"
                      disabled
                    >
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

export default AddCategory;
