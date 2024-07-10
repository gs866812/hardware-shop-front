import { useContext, useEffect, useState } from "react";
import AddProduct from "../AddProduct/AddProduct";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import AddSupplier from "../AddSupplier/AddSupplier";
import Swal from "sweetalert2";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Select from "react-select"; // Import react-select

const NewPurchase = () => {
  const {
    user,
    allProducts,
    supplier,
    setReFetch,
    reFetch,
    mainBalance,
    userName,
    setItemsPerPage,
    supplierCount,
  } = useContext(ContextData);
  const axiosSecure = useAxiosSecure();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [supplierSerial, setSupplierSerial] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [normsQuantity, setNormsQuantity] = useState("");
  const [tempProductList, setTempProductList] = useState([]);
  let [discount, setDiscount] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [dueAmount, setDueAmount] = useState("");

  const handleInputPurchaseQuantity = (event) => {
    const purchaseQuantityValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(purchaseQuantityValue)) {
      setPurchaseQuantity(purchaseQuantityValue);
    }
  };

  const handleInputPurchasePrice = (event) => {
    const purchasePriceValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(purchasePriceValue)) {
      setPurchasePrice(purchasePriceValue);
    }
  };

  const handleInputSalesPrice = (event) => {
    const salesPriceValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(salesPriceValue)) {
      setSalesPrice(salesPriceValue);
    }
  };

  const handleInputNormsQuantity = (event) => {
    const normsQuantityValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(normsQuantityValue)) {
      setNormsQuantity(normsQuantityValue);
    }
  };

  // Transform products array into options array for react-select
  const productOptions = allProducts.map((product) => ({
    value: product.productCode,
    label: `${product.productCode}-${product.productName}`,
  }));

  // Handle product change
  const handleProductChange = (selectedOption) => {
    const selectedProduct = allProducts.find(
      (product) => product.productCode === selectedOption?.value
    );
    setSelectedProduct(selectedProduct);
    setUnit(selectedProduct?.unitName);
    setBrand(selectedProduct?.brandName);
    setCategory(selectedProduct?.categoryName);
  };

  // add purchase product for temporary display

  const handlePurchaseProduct = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      return toast.error("Select product");
    }
    const userMail = user?.email;

    const form = e.target;
    const productID = selectedProduct.productCode;
    const productTitle = selectedProduct.productName;
    const purchaseQuantity = form.purchase_quantity.value;
    const purchaseUnit = unit;
    const purchasePrice = form.purchase_price.value;
    const salesPrice = form.sales_price.value;
    const reOrderQuantity = parseInt(normsQuantity);
    const storageLocation = form.storage.value;
    if(storageLocation === 'Storage'){
      return toast.error("Select storage");
    }
    const purchaseProductInfo = {
      productID,
      productTitle,
      brand,
      purchaseQuantity,
      purchaseUnit,
      purchasePrice,
      salesPrice,
      storageLocation,
      reOrderQuantity,
      category,
      userMail
    };

    axiosSecure
      .post(`/adTempPurchaseProductList`, purchaseProductInfo)
      .then((data) => {
        if (data.data.insertedId) {
          toast.success("Product added");
          form.reset();
          setPurchaseQuantity("");
          setPurchasePrice("");
          setSalesPrice("");
          setNormsQuantity("");
          setReFetch(!reFetch);
        } else {
          toast.error(data.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Server error", error);
      });
  };

  // get purchase product temporarily list

  useEffect(() => {
    axiosSecure
      .get(`/tempPurchaseProductList/${user?.email}`)
      .then((data) => {
        setTempProductList(data.data);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  // delete temp product
  const handleTempProduct = (_id) => {
    axiosSecure
      .delete(`/deleteTempProduct/${_id}`)
      .then((data) => {
        if (data.data.deletedCount === 1) {
          setReFetch(!reFetch);
          setDiscount("");
        } else {
          toast.error(data.data);
        }
      })
      .catch((error) => {
        toast.error("Server error", error);
      });
  };

  const purchaseProductListAmount = tempProductList.map(
    (product) => product.purchaseQuantity * product.purchasePrice
  );
  let purchaseAmount = 0;
  for (let i = 0; i < purchaseProductListAmount.length; i++) {
    purchaseAmount += purchaseProductListAmount[i];
  }

  let purchaseInvoiceAmount = parseFloat(purchaseAmount).toFixed(2);
  useEffect(() => {
    setGrandTotal(purchaseInvoiceAmount);
    setDueAmount(purchaseInvoiceAmount);
  }, [purchaseInvoiceAmount]);

  const handleDiscountOnchange = (event) => {
    const discountValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(discountValue)) {
      setDiscount(discountValue);
    }
    const discountNumber = parseInt(document.getElementById("discount").value);
    if (discountNumber) {
      const discountAmount = parseFloat(
        (purchaseInvoiceAmount * discountNumber) / 100
      );
      const newGrandTotal = parseFloat(
        purchaseInvoiceAmount - discountAmount
      ).toFixed(2);
      setGrandTotal(newGrandTotal);
      setDueAmount(newGrandTotal);
    } else {
      setGrandTotal(purchaseInvoiceAmount);
      setDueAmount(purchaseInvoiceAmount);
    }
  };

  // pay amount onchange
  const handlePayAmountOnchange = (event) => {
    const payAmountValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(payAmountValue)) {
      setPayAmount(payAmountValue);
    }
    const payAmountNumber = parseFloat(
      document.getElementById("pay-amount").value
    );
    const dueAmount = parseFloat(grandTotal - payAmountNumber).toFixed(2);
    setDueAmount(dueAmount);
  };

  const handleNext = () => {
    setItemsPerPage(supplierCount);
    document.getElementById("purchase_step_1").classList.add("hidden");
    document.getElementById("add_product").classList.add("hidden");
    document.getElementById("purchase_step_2").classList.remove("hidden");
  };
  const handlePrevious = () => {
    document.getElementById("purchase_step_1").classList.remove("hidden");
    document.getElementById("add_product").classList.remove("hidden");
    document.getElementById("purchase_step_2").classList.add("hidden");
  };

  //   change the supplier name if supplier changed
  const handleSupplierChange = (event) => {
    const selectedIndex = event.target.selectedIndex;

    if (selectedIndex > 0) {
      const selectedSupplier = supplier[selectedIndex - 1];
      setSelectedSupplier(selectedSupplier);

      // Set the unit of the selected product
      setSupplierSerial(selectedSupplier.serial);
    } else {
      setSelectedSupplier(null);
      setSupplierSerial("");
    }
  };

  const navigate = useNavigate();

  const handleProceed = (e) => {
    e.preventDefault();
    const date = moment(new Date()).format("DD.MM.YYYY");
    const supplierName = e.target.supplier_name.value;
    let totalAmount = parseFloat(
      parseFloat(e.target.total_amount.value).toFixed(2)
    );
    const discountAmount = parseFloat(
      parseFloat(e.target.discount_amount.value).toFixed(2)
    );
    const grandTotal = parseFloat(
      parseFloat(e.target.grand_total.value).toFixed(2)
    );
    const dueAmount = parseFloat(
      parseFloat(e.target.due_amount.value).toFixed(2)
    );

    if (supplierName === "Select supplier") {
      return toast.error("Select supplier");
    }
    const finalPayAmount = parseFloat(parseFloat(payAmount).toFixed(2));
    const balance = mainBalance[0]?.mainBalance || 0;

    if (finalPayAmount > balance) {
      return toast.error("Insufficient balance");
    }
    const userMail = user?.email;

    const purchaseInvoiceInfo = {
      userName,
      supplierSerial,
      date,
      supplierName,
      totalAmount,
      discountAmount,
      grandTotal,
      finalPayAmount,
      dueAmount,
      userMail
    };
    axiosSecure
      .post("/newPurchaseInvoice", purchaseInvoiceInfo)
      .then((data) => {
        if (data.data.insertedId) {
          setReFetch(!reFetch);
          Swal.fire({
            title: "Success",
            text: "Purchase invoice created successfully",
            icon: "success",
          });
          setItemsPerPage(20);
          e.target.reset();
          setDiscount("");
          setGrandTotal("");
          setPayAmount("");
          setDueAmount("");
          navigate("/purchase");
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
      <div className="flex justify-between items-center py-2">
        <h2 className=" text-xl uppercase">New purchase order:</h2>
        <div className="flex gap-2 items-center">
          <div className="bg-green-500 rounded-md">
            <AddProduct />
          </div>
          <div className="bg-green-500 rounded-md">
            <AddSupplier />
          </div>
        </div>
      </div>

      <div className="mt-5 border py-10 px-5">
        {/* new purchase form */}
        <form
          onSubmit={handlePurchaseProduct}
          className="flex flex-col gap-3"
          id="add_product"
        >
          <label className="flex gap-5 items-center flex-wrap">
            <div className="w-[58%]">
              <Select
                options={productOptions}
                onChange={handleProductChange}
                placeholder="Search and select a product"
                isClearable
                className="flex-grow"
              />
            </div>

            <input
              onChange={handleInputPurchaseQuantity}
              type="text"
              name="purchase_quantity"
              value={purchaseQuantity}
              placeholder="Quantity"
              className="border p-2 rounded-md outline-none"
              size={5}
              required
            />

            <input
              type="text"
              name="purchase_unit"
              defaultValue={unit}
              readOnly
              placeholder="Unit"
              size={5}
              className="border p-2 rounded-md outline-none"
            />

            <input
              onChange={handleInputPurchasePrice}
              type="text"
              name="purchase_price"
              value={purchasePrice}
              placeholder="Purchase price"
              size={10}
              required
              className="border p-2 rounded-md outline-none"
            />
          </label>
          <label className="flex gap-5 items-center flex-wrap mt-3">
            <input
              onChange={handleInputSalesPrice}
              type="text"
              name="sales_price"
              value={salesPrice}
              placeholder="Sales price"
              size={10}
              required
              className="border p-2 rounded-md outline-none"
            />

            <select name="storage" className="border p-2 rounded-md outline-none">
              <option defaultValue='Storage'>Storage</option>
              <option value="W-1">W-1</option>
              <option value="W-2">W-2</option>
              <option value="W-3">W-3</option>
            </select>

            <input
              onChange={handleInputNormsQuantity}
              type="text"
              name="norms_quantity"
              value={normsQuantity}
              placeholder="Re-order QTY"
              size={10}
              required
              className="border p-2 rounded-md outline-none"
            />

            <button className="bg-green-500 text-white py-2 px-3 rounded-md cursor-pointer">
              Add product
            </button>
          </label>
        </form>
        {/* show temp product list */}

        {tempProductList.length > 0 && (
          <div
            className="overflow-x-auto mt-8 border p-5 rounded-md"
            id="purchase_step_1"
          >
            <p className="uppercase mb-2">
              Invoice amount:{" "}
              <span className="text-red-500">BDT {purchaseInvoiceAmount}</span>
            </p>
            <table className="table table-zebra">
              {/* head */}
              <thead>
                <tr>
                  <td>SL No</td>
                  <td>Product ID</td>
                  <td>Product Name</td>
                  <td>QTY</td>
                  <td>Unit</td>
                  <td>Price</td>
                  <td>Amount</td>
                  <td className="text-center">Action</td>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {tempProductList ? (
                  tempProductList.map((product, i) => (
                    <tr key={i}>
                      <td className="w-[5%]">{i + 1}</td>
                      <td className="w-[10%]">{product.productID}</td>
                      <td>{product.productTitle}</td>
                      <td className="w-[10%]">{product.purchaseQuantity}</td>
                      <td className="w-[10%]">{product.purchaseUnit}</td>
                      <td className="w-[10%]">{product.purchasePrice}</td>
                      <td className="w-[10%]">
                        {(
                          product.purchasePrice * product.purchaseQuantity
                        ).toFixed(2)}
                      </td>
                      <td className="w-[5%] text-center text-red-500 font-bold">
                        <button
                          onClick={() => handleTempProduct(product._id)}
                          title="Delete this item"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <p>No product selected</p>
                )}
              </tbody>
            </table>
            <div className="flex justify-end mt-5">
              <button
                onClick={handleNext}
                className="py-1 px-5 rounded-md mt-3 bg-green-500 text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div
          className="mt-5 border p-5 rounded-md mb-5 hidden"
          id="purchase_step_2"
        >
          <form onSubmit={handleProceed}>
            <label className="flex gap-2 items-center justify-between">
              <span className="flex gap-5 items-center">
                Select supplier:
                <select
                  id="supplier_name"
                  className="border py-1 px-2 rounded-md outline-none"
                  onChange={handleSupplierChange}
                >
                  <option>Select supplier</option>
                  {supplier &&
                    supplier.map((supplier) => (
                      <option key={supplier._id}>
                        {supplier.supplierName}
                      </option>
                    ))}
                </select>
              </span>

              <span className="flex gap-5 items-center">
                Total:{" "}
                <input
                  type="text"
                  name="total_amount"
                  value={purchaseInvoiceAmount}
                  className="border py-1 px-2 rounded-md outline-none"
                  size={10}
                  disabled
                />
              </span>

              <span className="flex gap-5 items-center">
                Discount(%):{" "}
                <input
                  id="discount"
                  type="text"
                  name="discount_amount"
                  value={discount}
                  className="border py-1 px-2 rounded-md outline-none"
                  size={5}
                  onChange={handleDiscountOnchange}
                  placeholder="Discount"
                />
              </span>
            </label>

            <label className="flex gap-2 items-center justify-between mt-5">
              <span className="flex items-center gap-5">
                Grand total:{" "}
                <input
                  type="text"
                  name="grand_total"
                  value={grandTotal}
                  className="border py-1 px-2 rounded-md outline-none"
                  size={13}
                  readOnly
                />
              </span>

              <span className="flex items-center gap-5">
                Pay amount:{" "}
                <input
                  type="text"
                  name="pay_amount"
                  id="pay-amount"
                  value={payAmount}
                  onChange={handlePayAmountOnchange}
                  placeholder="Amount"
                  required
                  className="border py-1 px-2 rounded-md outline-none"
                  size={10}
                />
              </span>

              <span className="flex items-center gap-5">
                Due amount:{" "}
                <input
                  type="text"
                  name="due_amount"
                  value={dueAmount}
                  readOnly
                  className="border py-1 px-2 rounded-md outline-none"
                  size={5}
                />
              </span>
            </label>
            <div className="flex justify-between mt-5">
              <p
                className="py-1 px-5 rounded-md mt-3 bg-green-500 text-white cursor-pointer"
                onClick={handlePrevious}
              >
                Previous
              </p>
              <button className="py-1 px-5 rounded-md mt-3 bg-green-500 text-white">
                Proceed
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPurchase;
