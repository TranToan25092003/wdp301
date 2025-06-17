import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Typography,
  Divider,
  Form,
  InputNumber,
  Button,
  List,
  Card,
  Spin,
  Alert,
  Row,
  Col,
  Image,
} from "antd";
import { useLoaderData, useParams } from "react-router-dom";
import { getAuctionDetailById } from "@/API/huynt.api/auction.api";
import { placeBid } from "@/API/huynt.api/bid.api";
import socket, { initializeSocket } from "@/utils/socket";

const { Content } = Layout;
const { Title, Text } = Typography;

export const auctionDetailLoader = async ({ params }) => {
  try {
    const dataAuction = await getAuctionDetailById(params.auctionId);
    return { dataAuction };
  } catch (error) {
    console.error("Error fetching auction details:", error);
    return { dataAuction: null };
  }
};

const AuctionDetailPage = () => {
  const { dataAuction } = useLoaderData();
  console.log(dataAuction);
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(dataAuction?.auction || null);
  const [bids, setBids] = useState(() => {
    const initialBids = dataAuction?.bids || [];
    return [...initialBids].sort((a, b) => b.amount - a.amount);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bidIncrement, setBidIncrement] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [form] = Form.useForm();
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = initializeSocket();
    socketRef.current = socketInstance;

    // Join auction room
    socketInstance.emit("joinAuction", auctionId);
    console.log("Joined auction room:", auctionId);

    // Handle connection events
    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setSocketConnected(true);
      // Re-join auction room on reconnection
      socketInstance.emit("joinAuction", auctionId);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    });

    // Handle bid updates from other users
    socketInstance.on("bidUpdate", (data) => {
      console.log("Received bidUpdate:", data);

      // Update auction data
      if (data.auction) {
        console.log("Updating auction:", data.auction);
        setAuction((prev) => ({
          ...prev,
          ...data.auction,
          currentPrice: data.auction.currentPrice,
        }));
      }

      // Update bids list
      if (data.bids && Array.isArray(data.bids)) {
        console.log("Updating bids:", data.bids);
        const sortedBids = [...data.bids].sort((a, b) => b.amount - a.amount);
        setBids(sortedBids);
      }
    });

    // Handle new bid event (real-time update for all clients)
    socketInstance.on("newBid", (bidData) => {
      console.log("Received newBid:", bidData);

      if (bidData.auctionId === auctionId) {
        // Update auction current price
        setAuction((prev) => ({
          ...prev,
          currentPrice: bidData.amount,
        }));

        // Add new bid to the list
        setBids((prev) => {
          // Check if bid already exists to prevent duplicates
          const existingBid = prev.find(
            (bid) =>
              bid.id === bidData.id ||
              (bid.userId === bidData.userId &&
                bid.amount === bidData.amount &&
                Math.abs(
                  new Date(bid.createdAt) - new Date(bidData.createdAt)
                ) < 1000)
          );

          if (existingBid) {
            return prev;
          }

          const updatedBids = [bidData, ...prev];
          return updatedBids.sort((a, b) => b.amount - a.amount);
        });
      }
    });

    // Error handling
    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
      setError("Real-time connection error. Please refresh the page.");
    });

    socketInstance.on("bidError", (error) => {
      console.error("Bid error:", error);
      setError(error.message || "Error occurred while processing bid");
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket listeners");
      socketInstance.off("bidUpdate");
      socketInstance.off("newBid");
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("error");
      socketInstance.off("bidError");
      socketInstance.emit("leaveAuction", auctionId);
    };
  }, [auctionId]);

  // Refresh auction data periodically as fallback
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!socketConnected) {
        try {
          const response = await getAuctionDetailById(auctionId);
          if (response?.auction) {
            setAuction(response.auction);
          }
          if (response?.bids) {
            const sortedBids = [...response.bids].sort(
              (a, b) => b.amount - a.amount
            );
            setBids(sortedBids);
          }
        } catch (error) {
          console.error("Error refreshing auction data:", error);
        }
      }
    }, 10000); // Refresh every 10 seconds when socket is disconnected

    return () => clearInterval(interval);
  }, [auctionId, socketConnected]);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Tính toán giá trị bid cuối cùng = giá hiện tại + increment
      const finalBidAmount = auction.currentPrice + values.bidIncrement;

      const bidData = {
        auctionId,
        amount: finalBidAmount, // Sử dụng giá trị đã tính toán
        userId: "current-user-id", // Replace with actual user ID from auth context
      };

      console.log("Placing bid:", bidData);
      const result = await placeBid(bidData);
      console.log("Bid placed successfully:", result);

      // Create optimistic update với giá trị cuối cùng
      const optimisticBid = {
        id: `temp-${Date.now()}`,
        userId: bidData.userId,
        amount: finalBidAmount, // Sử dụng giá trị cuối cùng
        createdAt: new Date().toISOString(),
        auctionId: auctionId,
      };

      // Emit bid to socket for real-time updates to other clients
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("placeBid", {
          ...bidData,
          bidId: result.bid?.id || optimisticBid.id,
          createdAt: optimisticBid.createdAt,
        });
      }

      // Optimistic update for current user
      setAuction((prev) => ({
        ...prev,
        currentPrice: finalBidAmount, // Cập nhật với giá trị cuối cùng
      }));

      setBids((prev) => {
        const updatedBids = [optimisticBid, ...prev];
        return updatedBids.sort((a, b) => b.amount - a.amount);
      });

      form.resetFields();
      setBidIncrement(null); // Reset increment state
    } catch (err) {
      console.error("Error placing bid:", err);
      setError(
        err.response?.data?.message || "Failed to place bid. Please try again."
      );

      // Revert optimistic update on error
      try {
        const response = await getAuctionDetailById(auctionId);
        if (response?.auction) {
          setAuction(response.auction);
        }
        if (response?.bids) {
          const sortedBids = [...response.bids].sort(
            (a, b) => b.amount - a.amount
          );
          setBids(sortedBids);
        }
      } catch (refreshError) {
        console.error("Error refreshing after bid failure:", refreshError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!auction) {
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );
  }

  return (
    <Layout style={{ backgroundColor: "#fff", padding: "20px" }}>
      <Content>
        {/* Connection Status Indicator */}
        {/* {!socketConnected && (
          <Alert
            message="Real-time updates unavailable"
            description="Connection lost. Data will be refreshed periodically."
            type="warning"
            style={{ marginBottom: "16px" }}
            closable
          />
        )} */}

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            {/* Leaderboard Section */}
            <Title
              level={3}
              style={{ textAlign: "center", marginBottom: "24px" }}
            >
              🏆 Leaderboard - Top 10 Highest Bids ({bids.length})
              {socketConnected && (
                <Text
                  type="secondary"
                  style={{ fontSize: "12px", display: "block" }}
                >
                  Real-time updates active
                </Text>
              )}
            </Title>

            {bids.length > 0 ? (
              <List
                dataSource={bids.slice(0, 10)}
                renderItem={(bid, index) => (
                  <List.Item style={{ padding: "8px 0" }}>
                    <Card
                      size="small"
                      style={{
                        width: "100%",
                        backgroundColor:
                          index === 0
                            ? "#f6ffed"
                            : index === 1
                            ? "#fff7e6"
                            : index === 2
                            ? "#fff1f0"
                            : "#fafafa",
                        border:
                          index === 0
                            ? "2px solid #52c41a"
                            : index === 1
                            ? "2px solid #faad14"
                            : index === 2
                            ? "2px solid #f5222d"
                            : "1px solid #d9d9d9",
                        transition: "all 0.3s ease",
                        boxShadow:
                          index < 3
                            ? "0 4px 12px rgba(0,0,0,0.1)"
                            : "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              minWidth: "40px",
                              textAlign: "center",
                            }}
                          >
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && `#${index + 1}`}
                          </div>
                          <div>
                            <Text
                              strong
                              style={{
                                color:
                                  index === 0
                                    ? "#52c41a"
                                    : index === 1
                                    ? "#faad14"
                                    : index === 2
                                    ? "#f5222d"
                                    : "inherit",
                                fontSize: index < 3 ? "16px" : "14px",
                              }}
                            >
                              User {bid.userId}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {new Date(bid.createdAt).toLocaleString()}
                            </Text>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Text
                            strong
                            style={{
                              fontSize:
                                index === 0
                                  ? "22px"
                                  : index < 3
                                  ? "18px"
                                  : "16px",
                              color:
                                index === 0
                                  ? "#52c41a"
                                  : index === 1
                                  ? "#faad14"
                                  : index === 2
                                  ? "#f5222d"
                                  : "#1890ff",
                              textShadow:
                                index < 3
                                  ? "0 1px 2px rgba(0,0,0,0.1)"
                                  : "none",
                            }}
                          >
                            ${bid.amount?.toLocaleString()}
                          </Text>
                          {index === 0 && (
                            <div>
                              <Text
                                type="success"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                🏆 LEADING BID
                              </Text>
                            </div>
                          )}
                          {index === 1 && (
                            <div>
                              <Text
                                style={{
                                  fontSize: "12px",
                                  color: "#faad14",
                                  fontWeight: "bold",
                                }}
                              >
                                🥈 2nd Place
                              </Text>
                            </div>
                          )}
                          {index === 2 && (
                            <div>
                              <Text
                                style={{
                                  fontSize: "12px",
                                  color: "#f5222d",
                                  fontWeight: "bold",
                                }}
                              >
                                🥉 3rd Place
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < 3 && bids.length > 1 && (
                        <div style={{ marginTop: "12px" }}>
                          <div
                            style={{
                              width: "100%",
                              height: "6px",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${
                                  (bid.amount / bids[0].amount) * 100
                                }%`,
                                height: "100%",
                                background:
                                  index === 0
                                    ? "linear-gradient(90deg, #52c41a 0%, #73d13d 100%)"
                                    : index === 1
                                    ? "linear-gradient(90deg, #faad14 0%, #ffc53d 100%)"
                                    : "linear-gradient(90deg, #f5222d 0%, #ff4d4f 100%)",
                                transition: "width 0.5s ease",
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              marginTop: "4px",
                              fontSize: "11px",
                              color: "#666",
                              textAlign: "right",
                            }}
                          >
                            {((bid.amount / bids[0].amount) * 100).toFixed(1)}%
                            of leading bid
                          </div>
                        </div>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Card style={{ textAlign: "center", padding: "40px" }}>
                <Alert
                  message="No bids yet"
                  description="Be the first to place a bid and claim the top spot!"
                  type="info"
                  showIcon
                  style={{
                    borderLeft: "4px solid #1890ff",
                    backgroundColor: "#e6f7ff",
                  }}
                />
              </Card>
            )}
          </Col>

          <Col xs={24} md={12}>
            <Card>
              <Image
                width="100%"
                height={400}
                src={auction.itemId?.images?.[0] || "/assets/sample.jpg"}
                alt={auction.itemId?.name || "Auction item"}
                style={{
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                fallback="/assets/sample.jpg"
                placeholder={
                  <div
                    style={{
                      height: 400,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <Spin size="large" />
                  </div>
                }
              />
            </Card>
            <Title level={2}>{auction.itemId?.name}</Title>
            <Text
              style={{ fontSize: "16px", color: "#666", lineHeight: "1.6" }}
            >
              {auction.itemId?.description}
            </Text>
            <Divider />

            <Card style={{ marginBottom: "20px" }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Starting Price: </Text>
                  <br />
                  <Text style={{ fontSize: "16px", color: "#666" }}>
                    ${auction.startPrice?.toLocaleString()}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Current Price: </Text>
                  <br />
                  <Text
                    style={{
                      fontSize: "24px",
                      color: "#1890ff",
                      fontWeight: "bold",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    ${auction.currentPrice?.toLocaleString()}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Start Time: </Text>
                  <br />

                  <Text style={{ fontSize: "14px", color: "#666" }}>
                    {new Date(auction.startTime).toLocaleString()}
                  </Text>
                  <br />
                  <Text strong>End Time: </Text>
                  <br />

                  <Text style={{ fontSize: "14px", color: "#666" }}>
                    {new Date(auction.endTime).toLocaleString()}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Total Bids: </Text>
                  <br />
                  <Text
                    style={{
                      fontSize: "16px",
                      color: "#52c41a",
                      fontWeight: "bold",
                    }}
                  >
                    {bids.length}
                  </Text>
                </Col>
              </Row>
            </Card>

            <Card title="Place a Bid" style={{ marginBottom: "20px" }}>
              {error && (
                <Alert
                  message={error}
                  type="error"
                  style={{ marginBottom: "20px" }}
                  closable
                  onClose={() => setError(null)}
                />
              )}
              <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item
                  name="bidIncrement"
                  label={
                    <div>
                      <Text>Amount to Add</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Current price: ${auction.currentPrice?.toLocaleString()}
                        {bidIncrement && bidIncrement > 0 && (
                          <>
                            <br />
                            <Text
                              style={{ color: "#1890ff", fontWeight: "bold" }}
                            >
                              Your bid will be: $
                              {(
                                auction.currentPrice + bidIncrement
                              )?.toLocaleString()}
                            </Text>
                          </>
                        )}
                      </Text>
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please enter an amount to add",
                    },
                    {
                      type: "number",
                      min: 1,
                      message: "Amount must be at least $1",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    placeholder="Enter amount to add (e.g., 1000)"
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    size="large"
                    onChange={(value) => setBidIncrement(value)}
                    addonBefore="+"
                  />
                </Form.Item>

                {/* Preview của bid cuối cùng */}
                {/* {bidIncrement && bidIncrement > 0 && (
                  <div
                    style={{
                      background: "#e6f7ff",
                      border: "1px solid #91d5ff",
                      borderRadius: "6px",
                      padding: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <Text style={{ fontSize: "14px" }}>
                      <strong>Bid Preview:</strong>
                    </Text>
                    <br />
                    <Text style={{ fontSize: "16px" }}>
                      ${auction.currentPrice?.toLocaleString()} + $
                      {bidIncrement?.toLocaleString()} =
                      <Text
                        style={{
                          color: "#1890ff",
                          fontWeight: "bold",
                          fontSize: "18px",
                          marginLeft: "8px",
                        }}
                      >
                        $
                        {(
                          auction.currentPrice + bidIncrement
                        )?.toLocaleString()}
                      </Text>
                    </Text>
                  </div>
                )} */}

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                    disabled={!bidIncrement || bidIncrement <= 0}
                    style={{
                      background:
                        "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                      border: "none",
                      height: "50px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {loading
                      ? "Placing Bid..."
                      : bidIncrement && bidIncrement > 0
                      ? `Place Bid: $${(
                          auction.currentPrice + bidIncrement
                        )?.toLocaleString()}`
                      : "Place Bid"}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        <Divider />
      </Content>
    </Layout>
  );
};

export default AuctionDetailPage;
