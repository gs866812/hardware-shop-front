import { useContext, useEffect, useState } from "react";
import AddCustomer from "../AddCustomer/AddCustomer";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const NewSale = () => {
  const { products, customer, setReFetch, reFetch, userName, setItemsPerPage, customerCount } = useContext(ContextData);
  const axiosSecure = useAxiosSecure();

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salesQuantity, setSalesQuantity] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [available, setAvailable] = useState(null);
  const [tempProductList, setTempProductList] = useState([]);
  let [discount, setDiscount] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [customerSerial, setCustomerSerial] = useState("");

  const handleInputSalesQuantity = (event) => {
    const salesQuantityValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(salesQuantityValue)) {
      setSalesQuantity(salesQuantityValue);
    }
  };

  const handleInputSalesPrice = (event) => {
    const salesPriceValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(salesPriceValue)) {
      setSalesPrice(salesPriceValue);
    }
  };

  //   change the unit name if product changed
  const handleProductChange = (event) => {
    const selectedIndex = event.target.selectedIndex;
    const form = event.target;
    const productID = form.value.slice(0, 8);

    axiosSecure
      .post(`/getSalesPrice/${productID}`)
      .then((res) => {
        if (res.data.salesPrice) {
          setSalesPrice(res.data.salesPrice);
          setAvailable(null);
          setPurchasePrice(res.data.purchasePrice);
        }else {
          setAvailable("Stock not available");
          return toast.error("Stock not available");
        }
         
      })
      .catch((err) => {
        toast.error("Error fetching data", err);
      });

    if (selectedIndex > 0) {
      const selectedProduct = products[selectedIndex - 1];
      setSelectedCustomer(selectedProduct);

      // Set the unit of the selected product
      setUnit(selectedProduct.unitName);
      setBrand(selectedProduct.brandName);
      setCategory(selectedProduct.categoryName);
    } else {
      setSelectedCustomer(null);
      setUnit("");
      setCategory("");
    }
  };

  const handleSalesProduct = (e) => {
    e.preventDefault();
    if (
      document.getElementById("selected_product").value === "Select product"
    ) {
      return toast.error("Select product");
    }

    const form = e.target;
    const productID = form.selected_product.value.slice(0, 8);
    const productTitle = form.selected_product.value.slice(9);
    const salesQuantity = parseInt(form.purchase_quantity.value);
    const salesUnit = unit;
    const salesPrice = parseFloat(form.sales_price.value);

    const salesProductInfo = {
      productID,
      productTitle,
      brand,
      salesQuantity,
      salesUnit,
      salesPrice,
      purchasePrice,
      category,
    };


    axiosSecure
      .post(`/adTempSalesProductList`, salesProductInfo)
      .then((data) => {
        if (data.data.insertedId) {
          toast.success("Product added");
          form.reset();
          setSalesQuantity("");
          setSalesPrice("");
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

  // get sales product temporarily list

  useEffect(() => {
    axiosSecure
      .get("/tempSalesProductList")
      .then((data) => {
        setTempProductList(data.data);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  const salesProductListAmount = Array.isArray(tempProductList)
    ? tempProductList.map(
        (product) => product.salesQuantity * product.salesPrice
      )
    : [];

 


  let salesAmount = 0;
  for (let i = 0; i < salesProductListAmount.length; i++) {
    salesAmount += salesProductListAmount[i];
  }

  const salesProfitProductListAmount = Array.isArray(tempProductList)
  ? tempProductList.map(
      (product) => product.salesQuantity * product.purchasePrice
    )
  : [];


  let salesProfitAmount = 0;
  for (let i = 0; i < salesProfitProductListAmount.length; i++) {
    salesProfitAmount += salesProfitProductListAmount[i];
  }

const profit = parseFloat(salesAmount - salesProfitAmount);


  let salesInvoiceAmount = parseFloat(salesAmount).toFixed(2);
  useEffect(() => {
    setGrandTotal(salesInvoiceAmount);
    setDueAmount(salesInvoiceAmount);
  }, [salesInvoiceAmount]);

  // delete temp product
  const handleTempProduct = (_id) => {
    axiosSecure
      .delete(`/deleteSalesTempProduct/${_id}`)
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

  const handleNext = () => {
    setItemsPerPage(customerCount);
    document.getElementById("sales_step_1").classList.add("hidden");
    document.getElementById("add_product").classList.add("hidden");
    document.getElementById("sales_step_2").classList.remove("hidden");
  };
  const handlePrevious = () => {
    document.getElementById("sales_step_1").classList.remove("hidden");
    document.getElementById("add_product").classList.remove("hidden");
    document.getElementById("sales_step_2").classList.add("hidden");
  };

  const handleCustomerChange = (event) => {
    const selectedIndex = event.target.selectedIndex;

    if (selectedIndex > 0) {
      const selectedCustomer = customer[selectedIndex - 1];
      setSelectedCustomer(selectedCustomer);

      // Set the unit of the selected product
      setCustomerSerial(selectedCustomer.serial);
    } else {
      setSelectedCustomer(null);
      setCustomerSerial("");
    }
  };

  const handleDiscountOnchange = (event) => {
    const discountValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(discountValue)) {
      setDiscount(discountValue);
    }
    const discountNumber = parseInt(document.getElementById("discount").value);
    if (discountNumber) {
      const discountAmount = parseFloat(
        (salesInvoiceAmount * discountNumber) / 100
      );
      const newGrandTotal = parseFloat(
        salesInvoiceAmount - discountAmount
      ).toFixed(2);
      setGrandTotal(newGrandTotal);
      setDueAmount(newGrandTotal);
    } else {
      setGrandTotal(salesInvoiceAmount);
      setDueAmount(salesInvoiceAmount);
    }
  };

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

  const navigate = useNavigate();

  const handleProceed = (e) => {
    e.preventDefault();
    const date = moment(new Date()).format("DD.MM.YYYY");
    const customerName = e.target.customer_name.value;
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

    if (customerName === "Select customer") {
      return toast.error("Select customer");
    }
    const finalPayAmount = parseFloat(parseFloat(payAmount).toFixed(2));

    if (finalPayAmount > grandTotal) {
      return toast.error("Payment exceeded");
    }

    const salesInvoiceInfo = {
      customerSerial,
      date,
      customerName,
      totalAmount,
      discountAmount,
      grandTotal,
      finalPayAmount,
      dueAmount,
      profit,
      userName
    };
    axiosSecure
      .post("/newSalesInvoice", salesInvoiceInfo)
      .then((data) => {
        if (data.data.insertedId) {
          setReFetch(!reFetch);
          Swal.fire({
            title: "Success",
            text: "Sales invoice created successfully",
            icon: "success",
          });
          setItemsPerPage(20);
          e.target.reset();
          setDiscount("");
          setGrandTotal("");
          setPayAmount("");
          setDueAmount("");
          navigate("/sales");
        } else {
          Swal.fire({
            text: data.data,
            icon: "error",
          });
        }
      })
      .catch((error) => {
        toast.error("Server error", error);
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center py-2">
        <h2 className=" text-xl uppercase">New sales order:</h2>
        <div className="flex gap-2 items-center bg-green-500 rounded-md">
          <AddCustomer />
        </div>
      </div>
      {/* ........................................... */}

      <div>
        <form
          onSubmit={handleSalesProduct}
          className="flex flex-col gap-3"
          id="add_product"
        >
          <label className="flex gap-2 items-center flex-wrap">
            <select
              className="border p-2 rounded-md outline-none flex-grow"
              onChange={handleProductChange}
              id="selected_product"
            >
              <option>Select product</option>

              {Array.isArray(products) &&
                products.map((product) => (
                  <option key={product._id}>
                    {product.productCode}-{product.productName}
                  </option>
                ))}
            </select>

            <input
              onChange={handleInputSalesQuantity}
              type="text"
              name="purchase_quantity"
              value={salesQuantity}
              placeholder="Quantity"
              className="border p-2 rounded-md outline-none"
              size={5}
              required
            />

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
            <button
              className={`bg-green-500 text-white py-2 px-3 rounded-md cursor-pointer ${
                available ? "opacity-50 cursor-default" : ""
              }`}
              disabled={available}
            >
              Add
            </button>
          </label>
        </form>

        {/* show temp product list */}

        {tempProductList.length > 0 && (
          <div
            className="overflow-x-auto mt-8 border p-5 rounded-md"
            id="sales_step_1"
          >
            <p className="uppercase mb-2">
              Invoice amount:{" "}
              <span className="text-red-500">BDT {salesInvoiceAmount}</span>
            </p>
            <table className="table table-zebra">
              {/* head */}
              <thead>
                <tr>
                  <td>SL No</td>
                  <td>Product ID</td>
                  <td>Product Name</td>
                  <td>QTY</td>
                  <td>Price</td>
                  <td>Amount</td>
                  <td className="text-center">Action</td>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {Array.isArray(tempProductList) ? (
                  tempProductList.map((product, i) => (
                    <tr key={i}>
                      <td className="w-[5%]">{i + 1}</td>
                      <td className="w-[10%]">{product.productID}</td>
                      <td>{product.productTitle}</td>
                      <td className="w-[10%]">{product.salesQuantity}</td>
                      <td className="w-[10%]">{product.salesPrice}</td>
                      <td className="w-[10%]">
                        {(product.salesPrice * product.salesQuantity).toFixed(
                          2
                        )}
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
          id="sales_step_2"
        >
          <form onSubmit={handleProceed}>
            <label className="flex gap-2 items-center justify-between">
              <span className="flex gap-5 items-center">
                Select customer:
                <select
                  id="customer_name"
                  className="border py-1 px-2 rounded-md outline-none"
                  onChange={handleCustomerChange}
                >
                  <option>Select customer</option>
                  {Array.isArray(customer) &&
                    customer.map((customer) => (
                      <option key={customer._id}>
                        {customer.customerName}
                      </option>
                    ))}
                </select>
              </span>

              <span className="flex gap-5 items-center">
                Total:{" "}
                <input
                  type="text"
                  name="total_amount"
                  value={salesInvoiceAmount}
                  className="border py-1 px-2 rounded-md outline-none"
                  size={10}
                  disabled
                />
              </span>

              <span className="flex gap-5 items-center">
                Discount:{" "}
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

export default NewSale;
