import { SyncOutlined } from '@ant-design/icons';

const Spinner = () => {
    return (
        <div className="flex items-center gap-2">
            <SyncOutlined  spin />
            <p className="text-[15px]">Loading...</p>
        </div>
    )
}

export default Spinner;