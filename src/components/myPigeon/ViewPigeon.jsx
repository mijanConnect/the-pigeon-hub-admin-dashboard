import { Descriptions, Modal, Spin, Table } from "antd";
import VerifyIcon from "../../assets/verify.png";
import { getImageUrl } from "../common/imageUrl";

const safeValue = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    if (value?.name) return value.name;
    return JSON.stringify(value);
  }
  return String(value);
};

const ViewPigeon = ({ visible, onCancel, pigeonData, loading }) => {
  return (
    <Modal
      open={visible}
      title={`Pigeon Details`}
      onCancel={onCancel}
      footer={null}
      width={1000}
    >
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : pigeonData ? (
        <>
          {/* Main Image */}
          {/* Pigeon Photos Gallery */}
          {/* Pigeon Photos Gallery */}
          {(pigeonData?.pigeonPhoto ||
            pigeonData?.eyePhoto ||
            pigeonData?.ownershipPhoto ||
            pigeonData?.pedigreePhoto ||
            pigeonData?.DNAPhoto) && (
            <div className="mb-4">
              <h3 className="mb-2 font-semibold">Pigeon Photos</h3>
              <div className="flex flex-wrap justify-start gap-4 border p-4 rounded-lg">
                {[
                  {
                    key: "pigeonPhoto",
                    label: "Pigeon Photo",
                    url: pigeonData?.pigeonPhoto,
                  },
                  {
                    key: "eyePhoto",
                    label: "Eye Photo",
                    url: pigeonData?.eyePhoto,
                  },
                  {
                    key: "ownershipPhoto",
                    label: "Ownership Card",
                    url: pigeonData?.ownershipPhoto,
                  },
                  {
                    key: "pedigreePhoto",
                    label: "Pedigree",
                    url: pigeonData?.pedigreePhoto,
                  },
                  { key: "DNAPhoto", label: "DNA", url: pigeonData?.DNAPhoto },
                ]
                  .filter((p) => p.url) // keep only those that exist
                  .map((p) => (
                    <div key={p.key} className="flex flex-col items-center">
                      <img
                        src={getImageUrl(p.url)}
                        alt={p.label}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                      <span className="mt-1 text-sm text-gray-500">
                        {p.label}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex gap-10 flex-col md:flex-row">
            <div className="flex-1">
              {/* Pigeon Info */}
              <h3 className="mt-6 mb-2 font-semibold">Pigeon Information</h3>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Name">
                  {safeValue(pigeonData.name)}
                </Descriptions.Item>
                <Descriptions.Item label="Ring Number">
                  {safeValue(pigeonData.ringNumber)}
                </Descriptions.Item>
                <Descriptions.Item label="Country">
                  {safeValue(pigeonData.country)}
                </Descriptions.Item>
                <Descriptions.Item label="Birth Year">
                  {safeValue(pigeonData.birthYear)}
                </Descriptions.Item>
                <Descriptions.Item label="Short Information">
                  {safeValue(pigeonData.shortInfo)}
                </Descriptions.Item>
                <Descriptions.Item label="Breeder">
                  {safeValue(pigeonData.breeder?.breederName)}
                </Descriptions.Item>
                <Descriptions.Item label="Breeder Rating">
                  {safeValue(pigeonData.breederRating)}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {safeValue(pigeonData.gender)}
                </Descriptions.Item>
                <Descriptions.Item label="Color & Pattern">
                  {safeValue(pigeonData.color)}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {safeValue(pigeonData.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {safeValue(pigeonData.location)}
                </Descriptions.Item>
                <Descriptions.Item label="Iconic">
                  {pigeonData.iconic ? "Yes" : "No"}
                </Descriptions.Item>
                <Descriptions.Item label="Iconic Score">
                  {safeValue(pigeonData.iconicScore)}
                </Descriptions.Item>
                <Descriptions.Item label="Father Ring Number">
                  {safeValue(pigeonData.fatherRingId?.ringNumber)}
                </Descriptions.Item>
                <Descriptions.Item label="Mother Ring Number">
                  {safeValue(pigeonData.motherRingId?.ringNumber)}
                </Descriptions.Item>
                <Descriptions.Item label="Racing Rating">
                  {safeValue(pigeonData.racingRating)}
                </Descriptions.Item>
                <Descriptions.Item label="Racer Rating">
                  {safeValue(pigeonData.racherRating)}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">
                  {safeValue(pigeonData.notes)}
                </Descriptions.Item>
                <Descriptions.Item label="Verified">
                  {pigeonData.verified ? (
                    <img
                      src={VerifyIcon}
                      alt="verified"
                      style={{ width: 24, height: 24 }}
                    />
                  ) : (
                    "No"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="flex-1">
              {/* User Info */}
              {pigeonData.user && (
                <>
                  <h3 className="mt-6 mb-2 font-semibold">Owner Information</h3>
                  <Descriptions bordered column={1} size="small">
                    {/* <Descriptions.Item label="Name">
                      {safeValue(pigeonData.user.name)}
                    </Descriptions.Item> */}
                    <Descriptions.Item label="Username">
                      {safeValue(pigeonData.user.name)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {safeValue(pigeonData.user.email)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Contact">
                      {safeValue(pigeonData.user.contact)}
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="Role">
                      {safeValue(pigeonData.user.role)}
                    </Descriptions.Item> */}
                  </Descriptions>
                </>
              )}

              {/* Breeder Info */}
              {pigeonData.breeder && (
                <>
                  <h3 className="mt-6 mb-2 font-semibold">
                    Breeder Information
                  </h3>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Loft Name">
                      {safeValue(pigeonData.breeder.loftName)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Breeder Name">
                      {safeValue(pigeonData.breeder.breederName)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Country">
                      {safeValue(pigeonData.breeder.country)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {safeValue(pigeonData.breeder.email)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {safeValue(pigeonData.breeder.phone)}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </div>
          </div>
          {/* Race Results */}
          {pigeonData.results?.length > 0 && (
            <>
              <h3 className="mt-6 mb-2 font-semibold">Race Results</h3>
              <Table
                dataSource={pigeonData.results}
                rowKey="_id"
                pagination={false}
                size="small"
                bordered
                columns={[
                  {
                    title: "SL",
                    key: "index",
                    render: (_, __, index) => index + 1,
                    width: 60,
                  },
                  { title: "Name", dataIndex: "name", key: "name" },
                  {
                    title: "Date",
                    dataIndex: "date",
                    key: "date",
                    render: (d) => new Date(d).toLocaleDateString(),
                  },
                  { title: "Distance", dataIndex: "distance", key: "distance" },
                  { title: "Total", dataIndex: "total", key: "total" },
                  { title: "Place", dataIndex: "place", key: "place" },
                ]}
              />
            </>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400">No data found 🕊️</div>
      )}
    </Modal>
  );
};

export default ViewPigeon;
