import React, { useContext, useState } from 'react';
import { ContextData } from '../../Provider';
import { toast } from 'react-toastify';
import useAxiosSecure from '../hooks/useAxiosSecure';

const AddProduct = () => {
    const axiosSecure = useAxiosSecure();
    const [productValue, setProductValue] = useState('');

    const {categories, brands, units, reFetch, setReFetch} = useContext(ContextData);


    const handleInputProduct = (event) => {
        const productNameValue = event.target.value;
        const regex = /^(?!\s+$)[\s\S]*$/; 
        if (regex.test(productNameValue)) {
            setProductValue(productNameValue);
        }
    };

    // add product
    const handleAddProduct = (e) => {
        e.preventDefault();
        const form = e.target;
        const product = form.product_name.value;

        const categoryName = form.category.value;

    


        if(categoryName === 'Select category'){
            toast.warning('Select category');
            return;
        }
        const brandName = form.brand.value;
        if(brandName === 'Select brand'){
            toast.warning('Please select brand');
            return;
        }
        const unitName = form.unit.value;
        if(unitName === 'Select unit'){
            toast.warning('Please select unit');
            return;
        }
        const productInfo = {product, categoryName, brandName, unitName};

        axiosSecure.post('/addProducts', productInfo)
        .then(data => {
            if(data.data.insertedId){
                setReFetch(!reFetch);
                toast.success('Product added successfully');
                setProductValue('');
                form.reset();
            } else{
                toast.error(data.data);
            }
        }).catch(error => {
            toast.error('Server error', error);
        })
        
    };

    return (
        <div>
            <div className='text-white font-semibold text-xl cursor-pointer flex gap-2 items-center py-2 px-10' onClick={()=>document.getElementById('addProduct').showModal()}>
                <span>+ Add Product</span>
            </div>

    {/* Modal */}
            <div>
            <dialog id="addProduct" className="modal">
                <div className="modal-box">
                <h3 className="font-bold text-lg mb-3 uppercase">Add new product:</h3>
                <hr/>
                <form method="dialog"> 
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">✕</button> 
                    
                </form>
                    <form onSubmit={ handleAddProduct}>
                
                    <div className="mt-5 flex items-center gap-5 py-5">
                        <div className="space-y-5 font-semibold">
                        <p className="p-1">Product Name:</p>
                        <p className="p-1">Category:</p>
                        <p className="p-1">Brand:</p>
                        <p className="p-1">Unit:</p>
                        </div>
                        <div className=" space-y-5 flex-grow">
                            <p>
                            <input onChange={handleInputProduct} value={productValue} type="text" name="product_name" placeholder="Product Name" className="border p-1 w-full max-w-xs rounded-md outline-none" size='30' required/>
                            </p>
                            <p>
                            <select className="border w-full max-w-xs rounded-md p-1 outline-none" id="category" defaultValue='Select category'>
                                <option>Select category</option>
                                {
                                    Array.isArray(categories)? categories.map(category => <option key={category._id}>{category.category}</option>) : []
                                }
                                
                            </select>
                            </p>
                            <p>
                            <select className="border w-full max-w-xs rounded-md p-1 outline-none" id="brand" defaultValue='Select brand'>
                                <option>Select brand</option>
                                {Array.isArray(brands)?
                                    brands.map(brand => <option key={brand._id}>{brand.brand}</option>) : []
                                }
                            </select>
                            </p>
                            <p>
                            <select className="border w-full max-w-xs rounded-md p-1 outline-none" id="unit" defaultValue='Select unit'>
                                <option>Select unit</option>
                                {Array.isArray(units)?
                                    units.map(unit =><option key={unit._id}>{unit.unit}</option>): []
                                }
                            </select>
                            </p>
        
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-3">
                
                    <input onClick={()=> setProductValue('')} type="reset" value='Reset' className="bg-yellow-300 py-2 px-4 rounded-md"/>
                    <button className="bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600">Add product</button>
                    </div>   
                    </form>
                
                
                </div>
            </dialog>
        </div> 
        </div>
    );
};

export default AddProduct;