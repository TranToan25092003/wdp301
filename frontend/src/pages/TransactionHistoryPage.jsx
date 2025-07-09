import React, { useState, useEffect } from "react";
import { Layout, Typography, Divider, Spin, Tabs, Pagination, Collapse } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
const { Paragraph, Text } = Typography;
const { Content } = Layout;
import { useAuth } from "@clerk/clerk-react";
import { getAllBorrowRecord } from "@/API/duc.api/borrow.api";
import { getAllBuyRecord } from "@/API/duc.api/buy.api";
import erroImg from "../assets/error-image.png";
import { getUserUploadedItems } from "@/API/duc.api/item.api";

const TransactionHistoryPage = () => {
    const [activeTab, setActiveTab] = useState("buy");
    const [buyRecords, setBuyRecords] = useState([]);
    const [borrowRecords, setBorrowRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { getToken } = useAuth();
    const [buyCurrentPage, setBuyCurrentPage] = useState(1);
    const [borrowCurrentPage, setBorrowCurrentPage] = useState(1);
    const [uploadedItems, setUploadedItems] = useState([]);
    const [uploadedCurrentPage, setUploadedCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                const [buyRes, borrowRes, uploadedRes] = await Promise.all([
                    getAllBuyRecord(token),
                    getAllBorrowRecord(token),
                    getUserUploadedItems(token)
                ]);
                if (buyRes.success) setBuyRecords(buyRes.data);
                if (borrowRes.success) setBorrowRecords(borrowRes.data);
                if (uploadedRes.success) setUploadedItems(uploadedRes.data);
            } catch (err) {
                setError("Failed to fetch transaction history");
            }
            setLoading(false);
        };
        fetchData();
    }, [getToken]);

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);

    const paginateData = (data, currentPage) => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    };

    const items = [
        {
            key: "uploaded",
            label: "Uploaded Items",
            children: loading ? (
                <Spin />
            ) : error ? (
                <Paragraph type="danger">{error}</Paragraph>
            ) : uploadedItems.length === 0 ? (
                <Paragraph>No uploaded items found.</Paragraph>
            ) : (
                <div>
                    {paginateData(uploadedItems, uploadedCurrentPage).map((item) => (
                        <div key={item._id || item.name} className="mb-4">
                            <Collapse
                                accordion
                                expandIconPosition="right"
                                defaultActiveKey={[]}
                                className="bg-white border rounded-lg shadow-md"
                            >
                                <Collapse.Panel
                                    header={
                                        <div className="flex items-center w-full">
                                            <img
                                                src={item.images[0] || erroImg}
                                                alt={item.name || "Item"}
                                                className="w-12 h-12 object-cover rounded mr-4"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.name || "Unknown Item"}</p>
                                                <p className="text-gray-600 text-sm">
                                                    {item.category || "N/A"} | {formatPrice(item.price)} | {item.type || "N/A"} | {item.status || "N/A"}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    }
                                    key={item._id || item.name}
                                >
                                    {item.type === "Sell" && item.status === "Sold" && item.purchaseDate && (
                                        <div className="p-4">
                                            <div className="flex items-start space-x-4">
                                                {item.buyer?.imageUrl && (
                                                    <img
                                                        src={item.buyer.imageUrl}
                                                        alt={item.buyer.name || "Buyer"}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p><strong>Purchase Date:</strong> {new Date(item.purchaseDate).toLocaleDateString()}</p>
                                                    <p><strong>Buyer:</strong> {item.buyer?.name || "Unknown"}</p>
                                                    {item.buyer?.emailAddresses && item.buyer.emailAddresses.length > 0 && (
                                                        <p><strong>Email:</strong> {item.buyer.emailAddresses.join(", ")}</p>
                                                    )}
                                                    {item.buyer?.phoneNumbers && item.buyer.phoneNumbers.length > 0 ? (
                                                        <p><strong>Phone:</strong> {item.buyer.phoneNumbers.join(", ")}</p>
                                                    ) : (
                                                        <p><strong>Phone:</strong> None</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {item.type === "Borrow" && item.status === "Borrowed" && item.borrowingHistory && (
                                        <div className="p-4">
                                            {item.borrowingHistory.map((history, index) => (
                                                <div key={index} className="mb-4 border-b pb-4 last:border-b-0 last:pb-0">
                                                    <div className="flex items-start space-x-4">
                                                        {history.borrower?.imageUrl && (
                                                            <img
                                                                src={history.borrower.imageUrl}
                                                                alt={history.borrower.name || "Borrower"}
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                        )}
                                                        <div>
                                                            <p><strong>Start Time:</strong> {new Date(history.startTime).toLocaleDateString()}</p>
                                                            <p><strong>End Time:</strong> {new Date(history.endTime).toLocaleDateString()}</p>
                                                            <p><strong>Total Price:</strong> {formatPrice(history.totalPrice)}</p>
                                                            <p><strong>Borrower:</strong> {history.borrower?.name || "Unknown"}</p>
                                                            {history.borrower?.emailAddresses && history.borrower.emailAddresses.length > 0 && (
                                                                <p><strong>Email:</strong> {history.borrower.emailAddresses.join(", ")}</p>
                                                            )}
                                                            {history.borrower?.phoneNumbers && history.borrower.phoneNumbers.length > 0 ? (
                                                                <p><strong>Phone:</strong> {history.borrower.phoneNumbers.join(", ")}</p>
                                                            ) : (
                                                                <p><strong>Phone:</strong> None</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Collapse.Panel>
                            </Collapse>
                        </div>
                    ))}
                    <div className="mt-4 flex justify-center">
                        <Pagination
                            current={uploadedCurrentPage}
                            total={uploadedItems.length}
                            pageSize={pageSize}
                            onChange={setUploadedCurrentPage}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: "buy",
            label: "Buy History",
            children: loading ? (
                <Spin />
            ) : error ? (
                <Paragraph type="danger">{error}</Paragraph>
            ) : buyRecords.length === 0 ? (
                <Paragraph>No buy records found.</Paragraph>
            ) : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">Image</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Category</th>
                                    <th className="px-4 py-2 border">Price (VND)</th>
                                    <th className="px-4 py-2 border">Purchase Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginateData(buyRecords, buyCurrentPage).map((record) => (
                                    <tr key={record.buyId}>
                                        <td className="px-4 py-2 border">
                                            <img
                                                src={record.item?.images[0] || erroImg}
                                                alt={record.item?.name || "Item"}
                                                className="w-12 h-12 object-cover"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border">{record.item?.name || "Unknown Item"}</td>
                                        <td className="px-4 py-2 border">{record.item?.categoryId?.name || "N/A"}</td>
                                        <td className="px-4 py-2 border">
                                            <Text className="text-green-600 font-bold">{formatPrice(record.item?.price)}</Text>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {new Date(record.purchaseDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <Pagination
                            current={buyCurrentPage}
                            total={buyRecords.length}
                            pageSize={pageSize}
                            onChange={setBuyCurrentPage}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: "borrow",
            label: "Borrow History",
            children: loading ? (
                <Spin />
            ) : error ? (
                <Paragraph type="danger">{error}</Paragraph>
            ) : borrowRecords.length === 0 ? (
                <Paragraph>No borrow records found.</Paragraph>
            ) : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">Image</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Category</th>
                                    <th className="px-4 py-2 border">Price (VND)</th>
                                    <th className="px-4 py-2 border">Rate Type</th>
                                    <th className="px-4 py-2 border">Start Time</th>
                                    <th className="px-4 py-2 border">End Time</th>
                                    <th className="px-4 py-2 border">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginateData(borrowRecords, borrowCurrentPage).map((record) => (
                                    <tr key={record.borrowId}>
                                        <td className="px-4 py-2 border">
                                            <img
                                                src={record.item?.images[0] || erroImg}
                                                alt={record.item?.name || "Item"}
                                                className="w-12 h-12 object-cover"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border">{record.item?.name || "Unknown Item"}</td>
                                        <td className="px-4 py-2 border">{record.item?.categoryId?.name || "N/A"}</td>
                                        <td className="px-4 py-2 border">
                                            <Text className="text-green-600 font-bold">{formatPrice(record.totalPrice)}</Text>
                                        </td>
                                        <td className="px-4 py-2 border">Day</td>
                                        <td className="px-4 py-2 border">
                                            {new Date(record.startTime).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {new Date(record.endTime).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 border">{record.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <Pagination
                            current={borrowCurrentPage}
                            total={borrowRecords.length}
                            pageSize={pageSize}
                            onChange={setBorrowCurrentPage}
                        />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Layout style={{ backgroundColor: "#fff" }}>
            <Content className="h-screen">
                <Tabs
                    tabPosition="left"
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    style={{ width: "100%", minHeight: "80vh" }}
                />
            </Content>
        </Layout>
    );
};

export default TransactionHistoryPage;