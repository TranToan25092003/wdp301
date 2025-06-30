import React, { useState, useEffect } from "react";
import { Layout, Typography, Divider, Spin, Tabs, Pagination } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
const { Paragraph, Text } = Typography;
const { Content } = Layout;
import { useAuth } from "@clerk/clerk-react";
import { getAllBorrowRecord } from "@/API/duc.api/borrow.api";
import { getAllBuyRecord } from "@/API/duc.api/buy.api";
import erroImg from "../assets/error-image.png";

const TransactionHistoryPage = () => {
    const [activeTab, setActiveTab] = useState("buy");
    const [buyRecords, setBuyRecords] = useState([]);
    const [borrowRecords, setBorrowRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { getToken } = useAuth();
    const [buyCurrentPage, setBuyCurrentPage] = useState(1);
    const [borrowCurrentPage, setBorrowCurrentPage] = useState(1);
    const pageSize = 10; // Items per page

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                const [buyRes, borrowRes] = await Promise.all([
                    getAllBuyRecord(token),
                    getAllBorrowRecord(token),
                ]);
                if (buyRes.success) setBuyRecords(buyRes.data);
                if (borrowRes.success) setBorrowRecords(borrowRes.data);
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
                                            {new Date(record.item.createdAt).toLocaleDateString()}
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