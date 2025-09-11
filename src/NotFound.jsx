import React from 'react';
import Video from "./assets/notfound.mp4";
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className='w-full h-screen overflow-hidden relative'>
            <video
                src={Video}
                autoPlay
                loop
                muted
                style={{
                    width: "100%",
                    height: "100vh",
                    objectFit: "cover"
                }}
            >
            </video>
            <div className='flex items-center justify-center absolute top-1/2  left-1/2 transform -translate-x-[50%]  -translate-y-[50%] '>

                <Link to={"/"}>
                    <button className='bg-primary text-white px-4 h-10 rounded-md mt-[320px]'>Back to Home</button>
                </Link>
            </div>
        </div>
    );
}

export default NotFound;