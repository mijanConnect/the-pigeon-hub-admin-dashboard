import React, { useEffect, useState } from 'react'
import { FaTrash } from "react-icons/fa6";
import { useBannersQuery, useCreateBannerMutation, useDeleteBannerMutation, useUpdateStatusMutation } from '../../redux/apiSlices/bannerSlice';
import toast from 'react-hot-toast';
import { imageUrl } from '../../redux/api/baseApi';
import { Checkbox } from 'antd';

const Banner = () => {

    const {data: banners, refetch} = useBannersQuery();
    const [createBanner] = useCreateBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();
    const [updateStatus] = useUpdateStatusMutation();


    const handleChange = async(e) => {
        const file = e.target.files[0];
        try {
            const formData = new FormData();
            if(file){
                formData.append("image", file)
            }
            await createBanner(formData).unwrap().then(({status, message})=>{
                if (status) {
                    toast.success(message);
                    refetch();
                }
            })
        } catch (error) {
            setFile(null)
            toast.error(error?.data?.message || "Something Wrong");
        }
    }

    const handleRemove = async(id)=>{
        try {
            await deleteBanner(id).unwrap().then(({status, message})=>{
                if (status) {
                    toast.success(message);
                    refetch()
                }

            })
        } catch ({message}) {
            toast.error(message || "Something Wrong");
        }
    }

    const handleStatus = async(id)=>{
        try {
            await updateStatus(id).unwrap().then(({status, message})=>{
                if (status) {
                    toast.success(message);
                    refetch()
                }

            })
        } catch (error) {
            toast.error(error.data.message || "Something Wrong");
        }
    }

    return (
        <div>

            {/* header */}
            <div className='flex items-center justify-between mb-6'>
                <h1 className='text-xl font-semibold'>Banners</h1>

                <label htmlFor="img" className='bg-primary text-white flex items-center justify-center h-10 px-4 cursor-pointer rounded-md'>Add Banner</label>
                <input style={{display: "none"}} onChange={handleChange}  type="file" name="" id="img" />
            </div>


            <div className='flex items-center gap-10'>
                {
                    banners?.map((url, index)=>{
                        return(
                            <div key={index} className='w-full h-[200px] border relative rounded-lg p-2'>
                                <img 
                                    style={{width: "100%", height:"100%", objectFit: "contain"}} 
                                    src={`${imageUrl}${url?.banner}`} alt=""
                                />
                                <div className='absolute top-[10px] right-[10px] flex items-center gap-3'>
                                    <div 
                                        className='w-[35px] h-[35px] bg-primary rounded-full p-[5px]  flex items-center justify-center cursor-pointer' 
                                        onClick={()=>handleRemove(url._id)} 
                                    >
                                        <FaTrash color='white' />
                                    </div>
                                    <Checkbox onChange={()=>handleStatus(url._id)} checked={url?.status}>{ url?.status ? "Show" : "Hide" }</Checkbox>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}
export default Banner;