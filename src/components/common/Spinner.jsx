import { SyncOutlined } from "@ant-design/icons";

const Spinner = () => {
  return (
    // <div className="flex items-center gap-2">
    <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
      <SyncOutlined spin />
      <p className="text-[15px] ml-1">Loading...</p>
    </div>
  );
};

export default Spinner;
