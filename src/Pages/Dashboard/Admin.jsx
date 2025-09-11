import { Table } from 'antd'
import React from 'react';
import { FiDelete } from 'react-icons/fi';

const Admin = () => {

    const columns= [
        {
            title: "Serial No.",
            dataIndex: "index",
            key: "index",
            render: (_,record, index) =><p>{index + 1}</p>
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (_,record, index) =><p>{"Admin" + 1}</p>
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (_,record, index) =><p>{"Admin" + 1}</p>
        },
        {
            title: "Admin Type",
            dataIndex: "type",
            key: "type",
            render: (_,record, index) =><p>{"Admin"}</p>
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            render: (_,record) => <FiDelete/>
        },
    ]
    return (
        <div>
            {/* header */}
            <div className='flex items-center justify-between mb-6'>
                <h1 className='text-xl font-semibold'>Admins</h1>
                <button className='bg-primary text-white h-10 px-4 rounded-md'>Add Admin</button>
            </div>

            {/* table container */}
            <Table columns={columns} pagination={false}/>
        </div>
    )
}

export default Admin