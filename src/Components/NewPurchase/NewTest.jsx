import { useContext, useEffect, useState } from "react";
import AddProduct from "../AddProduct/AddProduct";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import AddSupplier from "../AddSupplier/AddSupplier";
import Swal from "sweetalert2";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Select from "react-select";  // Import react-select

const NewPurchase = () => {
  const {
    products,
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
  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.productCode}-${product.productName}`
  }));

  // Handle product change
  const handleProductChange = (selectedOption) => {
    const selectedProduct = products.find(product => product._id === selectedOption.value);
    setSelectedProduct(selectedProduct);
    setUnit(selectedProduct.unitName);
    setBrand(selectedProduct.brandName);
    setCategory(selectedProduct.categoryName);
  };
  

  // add purchase product for temporary display
  const handlePurchaseProduct = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      return toast.error("Select product");
    }

    const productID = selectedProduct._id;
    const productTitle = `${selectedProduct.productCode}-${selectedProduct.productName}`;
    const purchaseQuantity = e.target.purchase_quantity.value;
    const purchaseUnit = unit;
    const purchasePrice = e.target.purchase_price.value;
    const salesPrice = e.target.sales_price.value;
    const reOrderQuantity = parseInt(normsQuantity);
    const purchaseProductInfo = {
      productID,
      productTitle,
      brand,
      purchaseQuantity,
      purchaseUnit,
      purchasePrice,
      salesPrice,
      reOrderQuantity,
      category,
    };

    axiosSecure
      .post(`/adTempPurchaseProductList`, purchaseProductInfo)
      .then((data) => {
        if (data.data.insertedId) {
          toast.success("Product added");
          e.target.reset();
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
      .get("/tempPurchaseProductList")
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

  // change the supplier name if supplier changed
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
    const discount = parseInt(e.target.discount.value) || 0;
    const payAmount = parseFloat(parseFloat(e.target.pay_amount.value).toFixed(2));
    const dueAmount = parseFloat(parseFloat(e.target.due_amount.value).toFixed(2));
    const purchaseSerial = parseInt(mainBalance.purchaseSerial) + 1;
    const purchaseInvoice = {
      purchaseSerial,
      supplierName,
      supplierSerial,
      tempProductList,
      totalAmount,
      discount,
      grandTotal,
      payAmount,
      dueAmount,
      userName,
      date,
    };

    Swal.fire({
      title: "Are you sure?",
      text: "You want to proceed with this purchase?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, proceed!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.post("/createPurchaseInvoice", purchaseInvoice).then((data) => {
          if (data.data.result.insertedId) {
            const newPurchaseSerial = {
              mainPurchaseSerial: purchaseSerial,
            };
            axiosSecure
              .put(`/updatePurchaseSerial/${mainBalance._id}`, newPurchaseSerial)
              .then((data) => {
                if (data.data.modifiedCount === 1) {
                  Swal.fire(
                    "Success!",
                    "Your purchase has been created.",
                    "success"
                  ).then(() => {
                    navigate("/purchase-invoice");
                  });
                } else {
                  toast.error(data.data);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                toast.error("Server error", error);
              });
          } else {
            toast.error(data.data);
          }
        });
      }
    });
  };

  return (
    <div className="w-full md:w-11/12 mx-auto mt-4 bg-white">
      <div className="bg-white shadow-md p-3">
        <h2 className="text-xl font-semibold">Create New Purchase</h2>
      </div>
      <form onSubmit={handlePurchaseProduct}>
        <div className="p-3 shadow-md" id="purchase_step_1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700">Select Product</label>
              <Select
                options={productOptions}
                onChange={handleProductChange}
                placeholder="Search and select a product"
                isClearable
                className="mb-4"
              />
            </div>
            <div>
              <label className="block text-gray-700">Brand</label>
              <input
                type="text"
                value={brand}
                className="form-input w-full"
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700">Category</label>
              <input
                type="text"
                value={category}
                className="form-input w-full"
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700">Unit</label>
              <input
                type="text"
                value={unit}
                className="form-input w-full"
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700">Purchase Quantity</label>
              <input
                type="text"
                name="purchase_quantity"
                value={purchaseQuantity}
                onChange={handleInputPurchaseQuantity}
                className="form-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Purchase Price</label>
              <input
                type="text"
                name="purchase_price"
                value={purchasePrice}
                onChange={handleInputPurchasePrice}
                className="form-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Sales Price</label>
              <input
                type="text"
                name="sales_price"
                value={salesPrice}
                onChange={handleInputSalesPrice}
                className="form-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Norms Quantity</label>
              <input
                type="text"
                name="norms_quantity"
                value={normsQuantity}
                onChange={handleInputNormsQuantity}
                className="form-input w-full"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Add Product
            </button>
          </div>
        </div>
        {/* Other parts of your component */}
      </form>
      {/* Other parts of your component */}
    </div>
  );
};

export default NewPurchase;
