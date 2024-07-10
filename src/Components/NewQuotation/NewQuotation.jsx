import React, { useContext, useEffect, useState } from "react";
import { ContextData } from "../../Provider";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddCustomer from "../AddCustomer/AddCustomer";
import moment from "moment";
import Swal from "sweetalert2";
import Select from "react-select";

const NewQuotation = () => {
  const {
    user,
    allProducts,
    customer,
    setReFetch,
    reFetch,
    userName,
    setItemsPerPage,
    customerCount,
    productCount
  } = useContext(ContextData);
  const axiosSecure = useAxiosSecure();


  const [selectedProduct, setSelectedProduct] = useState(null);
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
  const [customerSerial, setCustomerSerial] = useState("");
  const [contactNumber, setContactNumber] = useState("");

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

  const productOptions = allProducts.map((product) => ({
    value: product.productCode,
    label: `${product.productCode}-${product.productName}`,
  }));

  //   change the unit name if product changed
  const handleProductChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = allProducts.find(
        (product) => product.productCode === selectedOption.value
      );
      setSelectedProduct(selectedProduct);

      setUnit(selectedProduct?.unitName);
      setBrand(selectedProduct?.brandName);
      setCategory(selectedProduct?.categoryName);

      axiosSecure
        .post(`/getSalesPrice/${selectedOption.value}`)
        .then((res) => {
          if (res.data.salesPrice) {
            setSalesPrice(res.data.salesPrice);
            setAvailable(null);
            setPurchasePrice(res.data.purchasePrice);
          } 
        })
        .catch((err) => {
          toast.error("Error fetching data", err);
        });
    } else {
      setSelectedProduct(null);
      setUnit("");
      setBrand("");
      setCategory("");
    }
  };

  const handleSalesProduct = (e) => {
    e.preventDefault();
    if (
      !selectedProduct
    ) {
      return toast.error("Select product");
    }

    const form = e.target;
    const productID = selectedProduct.productCode;
    const productTitle = selectedProduct.productName;
    const salesQuantity = parseInt(form.purchase_quantity.value);
    const salesUnit = unit;
    const salesPrice = parseFloat(form.sales_price.value);
    const userMail = user?.email;

    const quotationInfo = {
      productID,
      productTitle,
      brand,
      salesQuantity,
      salesUnit,
      salesPrice,
      purchasePrice,
      category,
      userMail
    };

    axiosSecure
      .post(`/adTempQuotationProductList`, quotationInfo)
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

  // get quotation product temporarily list

  useEffect(() => {
    axiosSecure
      .get(`/tempQuotationProductList/${user?.email}`)
      .then((data) => {
        setTempProductList(data.data);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  const quotationProductListAmount = Array.isArray(tempProductList)
    ? tempProductList.map(
        (product) => product.salesQuantity * product.salesPrice
      )
    : [];

  let quotationAmount = 0;
  for (let i = 0; i < quotationProductListAmount.length; i++) {
    quotationAmount += quotationProductListAmount[i];
  }

  const quotationProfitProductListAmount = Array.isArray(tempProductList)
    ? tempProductList.map(
        (product) => product.salesQuantity * product.purchasePrice
      )
    : [];

  let quotationProfitAmount = 0;
  for (let i = 0; i < quotationProfitProductListAmount.length; i++) {
    quotationProfitAmount += quotationProfitProductListAmount[i];
  }

  let quotationInvoiceAmount = parseFloat(quotationAmount).toFixed(2);
  useEffect(() => {
    setGrandTotal(quotationInvoiceAmount);
  }, [quotationInvoiceAmount]);

  // delete temp product
  const handleTempProduct = (_id) => {
    axiosSecure
      .delete(`/deleteQuotationTempProduct/${_id}`)
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

  const customerOptions = customer.map((customer) => ({
    value: customer.contactNumber,
    label: customer.customerName,
  }));


  const handleCustomerChange = (selectedOption) => {
    const selectedCustomer = customer.find(
      (customer) => customer.contactNumber === selectedOption?.value
    );


    if (selectedCustomer) {
      setSelectedCustomer(selectedCustomer);

      // Set the unit of the selected product
      setCustomerSerial(selectedCustomer.serial);
      setContactNumber(selectedCustomer.contactNumber);
    } else {
      setSelectedCustomer(null);
      setCustomerSerial("");
      setContactNumber("");
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
        (quotationInvoiceAmount * discountNumber) / 100
      );
      const newGrandTotal = parseFloat(
        quotationInvoiceAmount - discountAmount
      ).toFixed(2);
      setGrandTotal(newGrandTotal);
    } else {
      setGrandTotal(quotationInvoiceAmount);
    }
  };

  const navigate = useNavigate();

  const handleProceed = (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      return toast.error("Select customer");
    }

    const date = moment(new Date()).format("DD.MM.YYYY");
    const customerName = selectedCustomer.customerName;
    let totalAmount = parseFloat(
      parseFloat(e.target.total_amount.value).toFixed(2)
    );
    const discountAmount = parseFloat(
      parseFloat(e.target.discount_amount.value).toFixed(2)
    );
    const grandTotal = parseFloat(
      parseFloat(e.target.grand_total.value).toFixed(2)
    );

    const userMail = user?.email;

    const quotationInfo = {
      userName,
      customerSerial,
      contactNumber,
      date,
      customerName,
      totalAmount,
      discountAmount,
      grandTotal,
      userMail
    };
    axiosSecure
      .post("/newQuotation", quotationInfo)
      .then((data) => {
        if (data.data.insertedId) {
          setReFetch(!reFetch);
          Swal.fire({
            title: "Success",
            text: "Quotation created successfully",
            icon: "success",
          });
          setItemsPerPage(20);
          e.target.reset();
          setDiscount("");
          setGrandTotal("");
          navigate("/quotation");
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
        <h2 className=" text-xl uppercase">Customer quotation:</h2>
        <div className="flex gap-2 items-center bg-green-500 rounded-md">
          <AddCustomer />
        </div>
      </div>
      {/* ........................................... */}

      <div className="mt-5 border py-10 px-5">
        <form
          onSubmit={handleSalesProduct}
          className="flex flex-col gap-3"
          id="add_product"
        >
          <label className="flex gap-2 items-center flex-wrap">
            <Select
              options={productOptions}
              onChange={handleProductChange}
              placeholder="Search and select a product"
              isClearable
              className="flex-grow"
            />

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
              type="text"
              name="purchase_unit"
              defaultValue={unit}
              readOnly
              placeholder="Unit"
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
              <span className="text-red-500">BDT {quotationInvoiceAmount}</span>
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
                {Array.isArray(tempProductList) ? (
                  tempProductList.map((product, i) => (
                    <tr key={i}>
                      <td className="w-[5%]">{i + 1}</td>
                      <td className="w-[10%]">{product.productID}</td>
                      <td>{product.productTitle}</td>
                      <td className="w-[10%]">{product.salesQuantity}</td>
                      <td className="w-[10%]">{product.salesUnit}</td>
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
              <span className="flex gap-5 items-center w-[40%]">
              <Select
                options={customerOptions}
                onChange={handleCustomerChange}
                placeholder="Search and select a customer"
                isClearable
                className="flex-grow"
              />
              </span>

              <span className="flex gap-5 items-center">
                Total:{" "}
                <input
                  type="text"
                  name="total_amount"
                  value={quotationInvoiceAmount}
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

export default NewQuotation;
