import { createContext, useEffect, useState } from "react";
import useAxiosSecure from "./Components/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import auth from "./firebase.config";
import axios from "axios";



export const ContextData = createContext(null);


const Provider = ({ children }) => {
  const axiosSecure = useAxiosSecure();
  
  


  const [reFetch, setReFetch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [mainBalance, setMainBalance] = useState(0);
  const [stock, setStock] = useState([]);
  const [user, setUser] = useState(null);

  const [count, setCount] = useState({});
  const [customerCount, setCustomerCount] = useState({});
  const [productCount, setProductCount] = useState({});
  const [supplierCount, setSupplierCount] = useState({});

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchStock, setSearchStock] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");



 


  let userName;
  user?.email === "asad4design@gmail.com"? userName = 'ASAD1010' : 
  user?.email === "mozumdarhattraders@gmail.com"? userName = 'ARIF2020' : null;

      // get customer
      useEffect(() => {
        axiosSecure
          .get(`/customers`, {
            params: {
              page: currentPage,
              size: itemsPerPage,
              search: searchCustomer,
            },
          })
          .then((data) => {
            setCustomer(data.data.result);
            setCustomerCount(data.data.count);
          })
          .catch((err) => {
            toast("Error fetching data", err);
          });
      }, [reFetch, currentPage, itemsPerPage, searchCustomer, axiosSecure]);


  // email login
  const loginWithEmail = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout
  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };


 

  // get categories
  useEffect(() => {
    axiosSecure.get("/categories").then((data) => setCategories(data.data));
  }, [reFetch]);

  // get brands
  useEffect(() => {
    axiosSecure.get("/brands").then((data) => setBrands(data.data));
  }, [reFetch]);

  // get units
  useEffect(() => {
    axiosSecure.get("/units").then((data) => setUnits(data.data));
  }, [reFetch]);

  // get products
  useEffect(() => {
    axiosSecure
      .get(`/products`, {withCredentials: true} ,{
        params: {
          userEmail: user?.email,
          page: currentPage,
          size: itemsPerPage,
          search: searchTerm,
        },
      })
      .then((data) => {
        setProducts(data.data.products);
        setProductCount(data.data.count);
        setLoading(false);
      });
  }, [reFetch, currentPage, itemsPerPage, searchTerm, axiosSecure]);

  

  // total stock count
  useEffect(() => {
    axiosSecure
      .get("/stockCount")
      .then((res) => {
        setCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  // total customer count
  useEffect(() => {
    axiosSecure
      .get("/customerCount")
      .then((res) => {
        setCustomerCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  // total product count
  useEffect(() => {
    axiosSecure
      .get("/productTotalCount")
      .then((res) => {
        setProductCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  // get supplier
  useEffect(() => {
    axiosSecure
      .get(`/suppliers`, {
        params: {
          userEmail: user?.email,
          page: currentPage,
          size: itemsPerPage,
          search: searchSupplier,
        },
      })
      .then((data) => {
        setSupplier(data.data.result);
        setSupplierCount(data.data.count);
      })
      .catch((err) => {
        toast("Error fetching data", err);
      });
  }, [reFetch, currentPage, itemsPerPage, searchSupplier, axiosSecure]);

  // total supplier count
  useEffect(() => {
    axiosSecure
      .get("/supplierTotalCount")
      .then((res) => {
        setSupplierCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      const userEmail = currentUser?.email || user?.email;
      const email = { email: userEmail };
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        axios.post("https://hardware-shop-server.vercel.app/jwt", email, { withCredentials: true })
          .then((res) => {
            // console.log(res.data);
          })
          .catch((err) => {
            toast.error(err);
          });
      } else {

        axios.post("https://hardware-shop-server.vercel.app/logOut", email, { withCredentials: true })
          .then((res) => {
            // console.log(res.data);
          })
          .catch((err) => {
            toast.error(err);
          });
      }

     
  });
    return () => {
      unSubscribe();
    };
  }, [reFetch]);

  const info = {
    userName,
    logOut,
    loginWithEmail,
    user,
    setUser,
    categories,
    brands,
    units,
    products,
    loading,
    setReFetch,
    reFetch,
    supplier,
    mainBalance,
    stock,
    customer,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    count,
    customerCount,
    productCount,
    supplierCount,
    setSearchTerm,
    setSearchStock,
    setCustomer,
    setCustomerCount,
    setSupplier,
    setSupplierCount,
    setMainBalance,
    searchStock,
    setStock,
    setCount
  };

  return <ContextData.Provider value={info}>{children}</ContextData.Provider>;
};

export default Provider;
