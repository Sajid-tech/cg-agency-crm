import React, { useEffect, useState } from 'react'
import Layout from '../../layout/Layout'
import BASE_URL from '../../base/BaseUrl';
import axios from 'axios';
import { toast } from 'sonner';
import { IconArrowBack, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';

const status = [
    {
      value: "Active",
      label: "Active",
    },
    {
      value: "Inactive",
      label: "Inactive",
    },
  ];
const EditBuyer = () => {
      const { id } = useParams();
    const navigate = useNavigate();
    const [buyer, setBuyer] = useState({
      buyer_company: "",
      buyer_name: "",
      buyer_mobile: "",
      buyer_email: "",
      buyer_address: "",
      buyer_status:""
      
    });
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const fetchBuyerEdit = async () => {
        try {
          setIsButtonDisabled(true);
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${BASE_URL}/api/panel-fetch-buyer-by-id/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          setBuyer(response.data?.buyer);
        } catch (error) {
          console.error("Error fetching buyer data", error);
        } finally {
          setIsButtonDisabled(false);
        }
      };
    
      useEffect(() => {
        fetchBuyerEdit();
      }, []);
    const validateOnlyDigits = (inputtxt) => {
      var phoneno = /^\d+$/;
      if (inputtxt.match(phoneno) || inputtxt.length == 0) {
        return true;
      } else {
        return false;
      }
    };
  
    const onInputChange = (e) => {
      if (e.target.name == "buyer_mobile") {
        if (validateOnlyDigits(e.target.value)) {
          setBuyer({
            ...buyer,
            [e.target.name]: e.target.value,
          });
        }
      }
       else {
          setBuyer({
          ...buyer,
          [e.target.name]: e.target.value,
        });
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const form = document.getElementById("addIndiv");
      if (!form.checkValidity()) {
        toast.error("Fill all required");
        setIsButtonDisabled(false);
  
        return;
      }
      const data = {
          buyer_company: buyer.buyer_company,
          buyer_name: buyer.buyer_name,
          buyer_mobile: buyer.buyer_mobile,
          buyer_email: buyer.buyer_email,
          buyer_address: buyer.buyer_address,
          buyer_status: buyer.buyer_status,
      
      };
  
      setIsButtonDisabled(true);
      axios({
        url: BASE_URL + `/api/panel-update-buyer/${id}`,
        method: "PUT",
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((res) => {
        toast.success("Buyer Updated Sucessfully");
  
        navigate("/buyer-list");
        
      });
    };
  
    const FormLabel = ({ children, required }) => (
      <label className="block text-sm font-semibold text-black mb-1 ">
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
    const inputClassSelect =
    "w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-blue-500";
    const inputClass =
      "w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 border-blue-500";
  return (
  <Layout>
       <div className=" bg-[#FFFFFF] p-2  rounded-lg  ">
                    <div className="sticky top-0 p-2  mb-4 border-b-2 border-red-500 rounded-lg  bg-[#E1F5FA] ">
                      <h2 className=" px-5 text-[black] text-lg   flex flex-row  justify-between items-center  rounded-xl p-2 ">
                        <div className="flex  items-center gap-2">
                          <IconInfoCircle className="w-4 h-4" />
                          <span>Edit Buyer </span>
                        </div>
                        <IconArrowBack
                          onClick={() => navigate("/buyer-list")}
                          className="cursor-pointer hover:text-red-600"
                        />
                      </h2>
                    </div>
                    <hr />
                    <form
                      onSubmit={handleSubmit}
                      id="addIndiv"
                      className="w-full max-w-7xl  rounded-lg mx-auto p-4 space-y-6 "
                    >
                      <div className="grid grid-cols-1  md:grid-cols-1 lg:grid-cols-4   gap-6">
                        {/* Buyer Company  */}
                        <div>
                          <FormLabel required>Buyer Company</FormLabel>
                          <input
                            type="text"
                            name="buyer_company"
                            value={buyer.buyer_company}
                            onChange={(e) => onInputChange(e)}
                            className={inputClass}
                            required
                          />
                        </div>
                        {/* Buyer Name  */}
                        <div>
                          <FormLabel required>Buyer Name</FormLabel>
                          <input
                            type="text"
                            name="buyer_name"
                            value={buyer.buyer_name}
                            onChange={(e) => onInputChange(e)}
                            className={inputClass}
                            required
                          />
                        </div>
                         {/* Mobile  */}
                         <div>
                          <FormLabel required>Mobile</FormLabel>
                          <input
                            type="tel"
                            name="buyer_mobile"
                            value={buyer.buyer_mobile}
                            onChange={(e) => onInputChange(e)}
                            className={inputClass}
                            required
                            maxLength={10}
                          />
                        </div>
            
                        {/* Email  */}
                        <div>
                          <FormLabel required>Email</FormLabel>
                          <input
                            type="email"
                            name="buyer_email"
                            value={buyer.buyer_email}
                            onChange={(e) => onInputChange(e)}
                            className={inputClass}
                            required
                          />
                        </div>
                       
                        {/* Address  */}
                        <div className="col-span-0 lg:col-span-4">
                          <FormLabel required>Address</FormLabel>
                          <textarea
                            type="text"
                            name="buyer_address"
                            value={buyer.buyer_address}
                            onChange={(e) => onInputChange(e)}
                            className={inputClass}
                            required
                            rows={2}
                            multiline
                          />
                        </div>
            
                       
            {/* status  */}
            <div>
              <FormLabel required>Status</FormLabel>
              <select
                name="buyer_status"
                value={buyer.buyer_status}
                onChange={(e) => onInputChange(e)}
                required
                className={inputClassSelect}
              >
                <option value="">Select Status</option>
                {status.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
                      
                      </div>
            
                      {/* Form Actions */}
                      <div className="flex flex-wrap gap-4 justify-start">
                        <button
                          type="submit"
                          className="text-center text-sm font-[400] cursor-pointer  w-36 text-white bg-blue-600 hover:bg-green-700 p-2 rounded-lg shadow-md"
                          disabled={isButtonDisabled}
                        >
                          {isButtonDisabled ? "Updating..." : "Update"}
                        </button>
            
                        <button
                          type="button"
                          className="text-center text-sm font-[400] cursor-pointer  w-36 text-white bg-red-600 hover:bg-red-400 p-2 rounded-lg shadow-md"
                          onClick={() => {
                            navigate("/buyer-list");
                          }}
                        >
                          Back
                        </button>
                      </div>
                    </form>
                  </div>
  </Layout>
  )
}

export default EditBuyer