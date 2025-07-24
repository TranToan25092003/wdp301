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
  Modal,
  Carousel,
  Tabs,
  Badge,
  Space,
  Tooltip,
  Statistic,
  Rate,
  Avatar,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  DollarOutlined,
  UserOutlined,
  HeartOutlined,
  FireOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import { getAuctionDetailById } from "@/API/huynt.api/auction.api";
import { placeBid } from "@/API/huynt.api/bid.api";
import { initializeSocket } from "@/utils/socket";
import CountdownTimer from "../components/auction/CountdownTimer";
import { useAuth } from "@clerk/clerk-react";
import { getUserInformation } from "@/API/duc.api/user.api";
import AuthRequiredModal from "../components/global/AuthRequiredModal";
import { motion, AnimatePresence } from "framer-motion";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

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
  const navigate = useNavigate();
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
  const { userId, isSignedIn } = useAuth();
  const [userNames, setUserNames] = useState({});
  const [winnerModal, setWinnerModal] = useState({
    visible: false,
    isWinner: false,
    isSeller: false,
    winnerName: "",
    sellerName: "",
    amount: 0,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Add a new state to check if auction has started
  const [auctionStatus, setAuctionStatus] = useState({
    hasStarted: false,
    hasEnded: false,
    isConfigured: false,
    isApproved: false,
    isOwner: false,
  });

  // Function to handle configuring the auction
  const handleConfigureAuction = () => {
    navigate(`/auction-config/${auctionId}`);
  };

  // Function to render a notification when the auction is approved but not configured
  const renderConfigurationAlert = () => {
    if (
      auctionStatus.isOwner &&
      auction &&
      auction.startTime &&
      auction.endTime
    ) {
      // Do nothing - auction is already configured
      return null;
    }

    // Only show configuration alert for auction owners
    if (auctionStatus.isOwner) {
      return (
        <Alert
          message="Configure Your Auction"
          description="You can update your auction settings at any time before it starts."
          type="info"
          showIcon
          action={
            <Button
              type="primary"
              size="small"
              onClick={handleConfigureAuction}
            >
              Configure Now
            </Button>
          }
          className="mb-4"
        />
      );
    }
    return null;
  };

  // Check auction status when auction data changes or at regular intervals
  useEffect(() => {
    if (!auction) return;

    const checkAuctionStatus = () => {
      const now = new Date();
      const start = auction.startTime ? new Date(auction.startTime) : null;
      const end = auction.endTime ? new Date(auction.endTime) : null;
      const isConfigured =
        auction.startTime && auction.endTime && auction.currentPrice > 0;
      const isOwner = auction.itemId?.owner === userId;

      setAuctionStatus({
        hasStarted: start ? now >= start : false,
        hasEnded: end ? now >= end : false,
        isConfigured,
        isOwner,
      });
    };

    // Check immediately
    checkAuctionStatus();

    // Set up interval to check status periodically (every 5 seconds)
    const interval = setInterval(checkAuctionStatus, 5000);

    // Set bid increment based on auction settings
    if (auction.minBidIncrement > 0) {
      setBidIncrement(auction.minBidIncrement);
    } else {
      // Default increment if not specified by seller
      setBidIncrement(Math.max(10, Math.round(auction.currentPrice * 0.01))); // 1% of current price or minimum 10
    }

    return () => clearInterval(interval);
  }, [auction, userId]);

  // Kiểm tra auction đã kết thúc khi load trang
  useEffect(() => {
    if (!auction) return;

    const now = new Date();
    const end = new Date(auction.endTime);

    // Nếu auction đã kết thúc và có highest bid
    if (now > end && bids.length > 0) {
      const highestBid = bids[0];
      console.log("Auction ended on load, highest bid:", highestBid);

      // Get seller info if available
      const sellerId = auction.itemId?.owner;
      const sellerName = sellerId ? userNames[sellerId] || "Seller" : "Seller";

      setWinnerModal({
        visible: true,
        isWinner: highestBid.userId === userId,
        isSeller: sellerId === userId,
        winnerName: userNames[highestBid.userId] || "Another bidder",
        sellerName: sellerName,
        amount: highestBid.amount,
      });
    }
  }, [auction, bids, userId, userNames]);

  // Initialize socket connection with better real-time handling
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

    // Handle bid updates from other users - this is the main bidUpdate event
    socketInstance.on("bidUpdate", (data) => {
      console.log("Received bidUpdate:", data);

      // Update auction data when receiving comprehensive update
      if (data.auction) {
        console.log("Updating auction:", data.auction);
        setAuction((prev) => ({
          ...prev,
          ...data.auction,
          currentPrice: data.auction.currentPrice,
        }));
      }

      // Update bids list with full data refresh
      if (data.bids && Array.isArray(data.bids)) {
        console.log("Updating bids with full data:", data.bids);
        const sortedBids = [...data.bids].sort((a, b) => b.amount - a.amount);
        setBids(sortedBids);
      }
    });

    // Handle new individual bid event (real-time immediate update)
    socketInstance.on("newBid", (bidData) => {
      console.log("Received newBid (immediate update):", bidData);

      if (bidData.auctionId === auctionId) {
        // Optimistically update auction current price
        setAuction((prev) => ({
          ...prev,
          currentPrice: bidData.amount,
        }));

        // Optimistically add new bid to the leaderboard immediately
        setBids((prev) => {
          // Don't add duplicate bids
          const existingBidIndex = prev.findIndex(
            (bid) =>
              bid.id === bidData.id ||
              (bid.userId === bidData.userId &&
                bid.amount === bidData.amount &&
                Math.abs(
                  new Date(bid.createdAt) - new Date(bidData.createdAt)
                ) < 1000)
          );

          if (existingBidIndex !== -1) {
            return prev;
          }

          // Add bid with animation highlight
          const newBid = {
            ...bidData,
            isNew: true, // Flag for highlighting
          };

          // Add to list and re-sort
          const updatedBids = [newBid, ...prev];
          const sortedBids = updatedBids.sort((a, b) => b.amount - a.amount);

          // Remove highlight after 3 seconds
          setTimeout(() => {
            setBids((current) =>
              current.map((bid) =>
                bid.id === newBid.id ? { ...bid, isNew: false } : bid
              )
            );
          }, 3000);

          return sortedBids;
        });

        // Play a sound effect for new bids (optional)
        // Only if this is not the current user's bid
        if (bidData.userId !== userId) {
          try {
            const audio = new Audio("/notification-sound.mp3");
            audio.volume = 0.5;
            audio
              .play()
              .catch(() => console.log("Could not play notification sound"));
          } catch (error) {
            console.log("Sound notification not supported", error);
          }
        }
      }
    });

    // Handle auction end event
    socketInstance.on("auctionEnded", (data) => {
      console.log("Received auctionEnded:", data);
      if (data.auctionId === auctionId) {
        console.log("Setting winner modal for auction:", auctionId);
        console.log("Current user:", userId);
        console.log("Winner:", data.winnerId);

        setWinnerModal({
          visible: true,
          isWinner: data.winnerId === userId,
          isSeller: data.sellerId === userId,
          winnerName: data.winnerName || "Another bidder",
          sellerName: data.sellerName || "Seller",
          amount: data.amount,
        });
      }
    });

    // Listen for coin balance updates related to this auction
    socketInstance.on("coinUpdate", (data) => {
      if (
        data.userId === userId &&
        data.transaction?.description?.includes(auction?.itemId?.name)
      ) {
        console.log("Received coin update for this auction:", data);
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
      if (socketRef.current) {
        socketRef.current.off("bidUpdate");
        socketRef.current.off("newBid");
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("error");
        socketRef.current.off("bidError");
        socketRef.current.off("auctionEnded");
        socketRef.current.off("coinUpdate");
        socketRef.current.emit("leaveAuction", auctionId);
      }
      // Reset modal state
      setWinnerModal({
        visible: false,
        isWinner: false,
        isSeller: false,
        winnerName: "",
        sellerName: "",
        amount: 0,
      });
    };
  }, [auctionId, userId]);

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

  // Tự động trigger settle khi hết giờ
  useEffect(() => {
    if (!auction) return;
    const now = new Date();
    const end = new Date(auction.endTime);
    const msLeft = end - now;
    if (msLeft > 0) {
      const timeout = setTimeout(async () => {
        try {
          await getAuctionDetailById(auction._id);
        } catch {
          /* ignore error */
        }
      }, msLeft + 1000); // +1s để chắc chắn đã hết giờ
      return () => clearTimeout(timeout);
    }
  }, [auction]);

  // Fetch user names cho các userId trong top 10 bids
  useEffect(() => {
    const fetchUserNames = async () => {
      const topBids = bids.slice(0, 10);
      const missingIds = topBids
        .map((bid) => bid.userId)
        .filter((id) => id && !userNames[id]);
      if (missingIds.length === 0) return;
      const updates = {};
      await Promise.all(
        missingIds.map(async (id) => {
          try {
            const info = await getUserInformation(id);
            updates[id] = info.name || id;
          } catch {
            updates[id] = id;
          }
        })
      );
      setUserNames((prev) => ({ ...prev, ...updates }));
    };
    fetchUserNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bids]);

  // Modified onFinish function to check authentication
  const onFinish = async (values) => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate the total bid amount (current price + increment amount)
      const incrementAmount = values.bidAmount;
      const totalBidAmount = auction.currentPrice + incrementAmount;

      // Validate bid amount
      if (incrementAmount <= 0) {
        setError("Increment amount must be greater than 0");
        setLoading(false);
        return;
      }

      // Validate min bid increment if set
      if (bidIncrement && bidIncrement > 0 && incrementAmount < bidIncrement) {
        setError(`Increment must be at least ${bidIncrement}`);
        setLoading(false);
        return;
      }

      // Make the bid with all required fields
      const response = await placeBid({
        auctionId: auctionId,
        amount: totalBidAmount,
      });

      console.log("Bid placed successfully:", response);

      // Optimistically update the form with the same increment
      form.setFieldsValue({
        bidAmount: incrementAmount,
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      setError(error.response?.data?.message || "Failed to place bid");
    } finally {
      setLoading(false);
    }
  };

  // Calculate quick bid options when auction price changes
  useEffect(() => {
    if (auction?.currentPrice) {
      form.setFieldsValue({
        bidAmount: bidIncrement || 1,
      });
    }
  }, [auction?.currentPrice, bidIncrement, form]);

  // Add this function for quick bidding
  const handleQuickBid = (amount) => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    form.setFieldsValue({ bidAmount: amount });
    form.submit();
  };

  // Updated bid form with quick bid options
  const renderBidForm = () => {
    const defaultIncrementAmount = bidIncrement || 1;
    const calculateTotalBid = () => {
      const incrementValue =
        form.getFieldValue("bidAmount") || defaultIncrementAmount;
      return auction?.currentPrice + Number(incrementValue);
    };

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card
          title={
            <motion.div
              className="flex justify-between items-center"
              variants={itemVariants}
            >
              <span>
                <DollarOutlined /> Place a Bid
              </span>
              <Badge
                status={socketConnected ? "success" : "warning"}
                text={socketConnected ? "Live Updates Active" : "Connecting..."}
              />
            </motion.div>
          }
          className="mb-4 shadow-lg rounded-lg"
          style={{ borderTop: "3px solid #1890ff" }}
          extra={
            <div className="text-right">
              <Text type="secondary">
                Current price: {auction?.currency || "$"}
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    marginLeft: "4px",
                  }}
                >
                  {auction?.currentPrice?.toLocaleString()}
                </span>
              </Text>
              {auction?.minBidIncrement > 0 && (
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  (Min increment: {auction?.currency || "$"}
                  {auction.minBidIncrement})
                </Text>
              )}
            </div>
          }
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
                closable
                onClose={() => setError(null)}
              />
            </motion.div>
          )}

          <Form
            form={form}
            name="bid_form"
            initialValues={{ bidAmount: defaultIncrementAmount }}
            onFinish={onFinish}
            onValuesChange={() => {
              // Force re-render to update the total bid display
              setLoading(loading); // This is a trick to force re-render without changing state
            }}
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
              style={{
                marginBottom: 16,
                padding: "16px",
                background: "linear-gradient(to right, #f0f9ff, #e6f7ff)",
                borderRadius: "8px",
                border: "1px solid #91d5ff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Current price:</Text>
                <Text strong>
                  {auction?.currency || "$"}
                  {auction?.currentPrice?.toLocaleString()}
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text>Your increment:</Text>
                <Text strong style={{ color: "#52c41a" }}>
                  + {auction?.currency || "$"}
                  {(
                    form.getFieldValue("bidAmount") || defaultIncrementAmount
                  )?.toLocaleString()}
                </Text>
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>Your total bid:</Text>
                <Text strong style={{ fontSize: "18px", color: "#1890ff" }}>
                  {auction?.currency || "$"}
                  {calculateTotalBid()?.toLocaleString()}
                </Text>
              </div>
            </motion.div>

            {/* Quick bid options */}
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ marginBottom: "8px", display: "block" }}>
                Quick Bid Options:
              </Text>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                {[1, 2, 5].map((multiplier, index) => {
                  const amount = defaultIncrementAmount * multiplier;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type={
                          index === 0
                            ? "primary"
                            : index === 1
                            ? "default"
                            : "dashed"
                        }
                        onClick={() => handleQuickBid(amount)}
                        disabled={
                          !auctionStatus.hasStarted || auctionStatus.hasEnded
                        }
                        style={{ width: "100%" }}
                      >
                        +{auction?.currency || "$"}
                        {amount.toLocaleString()}
                        {index === 0 && " (Min)"}
                        {index === 2 && " 🔥"}
                      </Button>
                    </motion.div>
                  );
                })}
              </Space>
            </div>

            <Form.Item
              name="bidAmount"
              label="Bid Amount"
              rules={[
                { required: true, message: "Please enter bid amount" },
                {
                  type: "number",
                  min: bidIncrement || 1,
                  message: `Minimum bid is ${bidIncrement || 1}`,
                },
              ]}
            >
              <InputNumber
                min={bidIncrement || 1}
                step={bidIncrement || 1}
                style={{ width: "100%" }}
                size="large"
                disabled={!auctionStatus.hasStarted || auctionStatus.hasEnded}
                formatter={(value) =>
                  `${auction?.currency || "$"}${value}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                parser={(value) => value.replace(/[^\d.]/g, "")}
              />
            </Form.Item>

            <Form.Item>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  icon={<DollarOutlined />}
                  disabled={!auctionStatus.hasStarted || auctionStatus.hasEnded}
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    background: auctionStatus.hasEnded
                      ? "#d9d9d9"
                      : !auctionStatus.hasStarted
                      ? "#d9d9d9"
                      : "linear-gradient(to right, #1890ff, #096dd9)",
                  }}
                >
                  {auctionStatus.hasEnded
                    ? "Auction Ended"
                    : !auctionStatus.hasStarted
                    ? "Auction Not Started"
                    : `Place Bid (${
                        auction?.currency || "$"
                      }${calculateTotalBid()?.toLocaleString()})`}
                </Button>
              </motion.div>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    );
  };

  // Render image gallery with animation
  const renderImageGallery = () => {
    const images = auction?.itemId?.images || ["/assets/sample.jpg"];

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="image-gallery-container"
      >
        <Card className="shadow-lg" style={{ marginBottom: "20px" }}>
          <Carousel
            autoplay={images.length > 1}
            effect="fade"
            afterChange={setActiveImageIndex}
            dots={images.length > 1}
          >
            {images.map((image, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div
                  style={{
                    height: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8f8f8",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={image}
                    alt={`${auction?.itemId?.name || "Auction item"} - Image ${
                      index + 1
                    }`}
                    style={{
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    preview={{
                      mask: (
                        <div style={{ fontSize: "16px" }}>Click to preview</div>
                      ),
                    }}
                    fallback="/assets/fallback.png"
                    placeholder={
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Spin size="large" />
                      </div>
                    }
                  />
                </div>
              </motion.div>
            ))}
          </Carousel>

          {images.length > 1 && (
            <motion.div
              variants={itemVariants}
              style={{
                display: "flex",
                overflowX: "auto",
                gap: "8px",
                padding: "10px 0",
                marginTop: "10px",
              }}
            >
              {images.map((image, index) => (
                <motion.div
                  key={`thumb-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const carousel = document.querySelector(".ant-carousel");
                    if (carousel) {
                      carousel.goTo(index);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    border:
                      activeImageIndex === index
                        ? "2px solid #1890ff"
                        : "2px solid transparent",
                    borderRadius: "4px",
                    overflow: "hidden",
                    width: "70px",
                    height: "70px",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: activeImageIndex === index ? 1 : 0.7,
                      transition: "opacity 0.3s ease",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  };

  // Enhanced leaderboard
  const renderLeaderboard = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          className="shadow-lg rounded-lg"
          style={{ borderTop: "3px solid #52c41a" }}
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                <TrophyOutlined style={{ marginRight: "8px" }} /> Leaderboard
              </span>
              <Badge
                count={bids.length}
                showZero
                style={{
                  backgroundColor: bids.length > 0 ? "#52c41a" : "#d9d9d9",
                }}
              />
            </div>
          }
        >
          {bids.length > 0 ? (
            <List
              dataSource={bids.slice(0, 10)}
              renderItem={(bid, index) => (
                <motion.div
                  initial={
                    bid.isNew ? { backgroundColor: "#e6f7ff", scale: 1.02 } : {}
                  }
                  animate={{ backgroundColor: "#ffffff", scale: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  <List.Item style={{ padding: "8px 0" }}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      style={{ width: "100%" }}
                    >
                      <Card
                        size="small"
                        style={{
                          width: "100%",
                          backgroundColor: bid.isNew
                            ? "#e6f7ff"
                            : index === 0
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
                                {userNames[bid.userId] || "Loading..."}
                                {bid.userId === userId && " (You)"}
                              </Text>
                              <br />
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
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
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                  }}
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
                              {((bid.amount / bids[0].amount) * 100).toFixed(1)}
                              % of leading bid
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  </List.Item>
                </motion.div>
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
        </Card>
      </motion.div>
    );
  };

  // Enhanced auction info card
  const renderAuctionInfo = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          className="shadow-lg rounded-lg mb-4"
          style={{ borderTop: "3px solid #1890ff" }}
        >
          <Tabs defaultActiveKey="1" centered>
            <TabPane
              tab={
                <span>
                  <DollarOutlined /> Auction Details
                </span>
              }
              key="1"
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Starting Price"
                    value={auction?.startPrice || 0}
                    precision={2}
                    valueStyle={{ color: "#3f8600" }}
                    prefix="$"
                    style={{ marginBottom: 16 }}
                  />
                  <Statistic
                    title="Current Price"
                    value={auction?.currentPrice || 0}
                    precision={2}
                    valueStyle={{ color: "#1890ff", fontSize: "28px" }}
                    prefix="$"
                  />
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: auctionStatus.hasEnded
                        ? "#ffccc7"
                        : !auctionStatus.hasStarted
                        ? "#d9d9d9"
                        : "#f6ffed",
                      borderRadius: "8px",
                      padding: "15px",
                      marginBottom: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#595959",
                        marginBottom: "8px",
                      }}
                    >
                      <ClockCircleOutlined />{" "}
                      {auctionStatus.hasEnded
                        ? "Ended"
                        : !auctionStatus.hasStarted
                        ? "Starting In"
                        : "Time Remaining"}
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#096dd9",
                      }}
                    >
                      <CountdownTimer
                        endTime={auction?.endTime}
                        startTime={auction?.startTime}
                      />
                    </div>
                  </div>
                  <Statistic
                    title="Total Bids"
                    value={bids.length}
                    prefix={<TrophyOutlined />}
                    valueStyle={{
                      color: bids.length > 0 ? "#722ed1" : "#8c8c8c",
                    }}
                  />
                </Col>
                {auction?.minBidIncrement > 0 && (
                  <Col span={12}>
                    <div style={{ marginTop: "16px" }}>
                      <Text type="secondary">Minimum Bid Increment:</Text>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#fa8c16",
                        }}
                      >
                        ${auction.minBidIncrement}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <InfoCircleOutlined /> Item Info
                </span>
              }
              key="2"
            >
              <Paragraph>
                {auction?.itemId?.description || "No description available"}
              </Paragraph>
              {auction?.itemId?.condition && (
                <div style={{ marginTop: "16px" }}>
                  <Text strong>Condition:</Text>
                  <div>{auction.itemId.condition}</div>
                </div>
              )}
              {auction?.itemId?.brand && (
                <div style={{ marginTop: "16px" }}>
                  <Text strong>Brand:</Text>
                  <div>{auction.itemId.brand}</div>
                </div>
              )}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <UserOutlined /> Seller
                </span>
              }
              key="3"
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Avatar size={64} icon={<UserOutlined />} />
                <div>
                  <Text strong style={{ fontSize: "16px" }}>
                    {userNames[auction?.itemId?.owner] || "Loading seller..."}
                  </Text>
                  <div style={{ color: "#8c8c8c", fontSize: "14px" }}>
                    Member since:{" "}
                    {new Date(
                      auction?.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </div>
                  <Rate
                    disabled
                    defaultValue={4.5}
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>
              {/* You can add more seller info here */}
            </TabPane>
          </Tabs>
        </Card>
      </motion.div>
    );
  };

  // Return the component with animations
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Keep existing modals */}
        <Modal
          open={winnerModal.visible}
          onCancel={() =>
            setWinnerModal((prev) => ({ ...prev, visible: false }))
          }
          footer={null}
          centered
          closable={true}
          maskClosable={true}
          width={450}
          style={{ zIndex: 1001 }}
          maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="text-center p-6">
            <div className="mb-6">
              {winnerModal.isWinner ? (
                <TrophyOutlined
                  style={{
                    fontSize: 64,
                    color: "#faad14",
                    marginBottom: 16,
                  }}
                />
              ) : winnerModal.isSeller ? (
                <DollarOutlined
                  style={{
                    fontSize: 64,
                    color: "#52c41a",
                    marginBottom: 16,
                  }}
                />
              ) : (
                <InfoCircleOutlined
                  style={{
                    fontSize: 64,
                    color: "#1890ff",
                    marginBottom: 16,
                  }}
                />
              )}
            </div>

            <Title level={3} style={{ marginBottom: 16, color: "#262626" }}>
              {winnerModal.isWinner
                ? "Chúc mừng! Bạn đã thắng!"
                : winnerModal.isSeller
                ? "Phiên đấu giá đã kết thúc!"
                : "Phiên đấu giá đã kết thúc"}
            </Title>

            <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
              {winnerModal.isWinner ? (
                <>
                  Bạn đã thắng phiên đấu giá này với giá{" "}
                  <Text strong>{winnerModal.amount.toLocaleString()}₫</Text>
                </>
              ) : winnerModal.isSeller ? (
                <>
                  <Text strong>{winnerModal.winnerName}</Text> đã thắng với giá{" "}
                  <Text strong>{winnerModal.amount.toLocaleString()}₫</Text>
                </>
              ) : (
                <>
                  <Text strong>{winnerModal.winnerName}</Text> đã thắng đấu giá
                  với giá{" "}
                  <Text strong>{winnerModal.amount.toLocaleString()}₫</Text>
                </>
              )}
            </Paragraph>

            <div className="flex justify-center gap-4">
              <Button
                type="primary"
                size="large"
                onClick={() =>
                  setWinnerModal((prev) => ({ ...prev, visible: false }))
                }
              >
                {winnerModal.isWinner ? "Xem chi tiết" : "Đóng"}
              </Button>
            </div>
          </div>
        </Modal>

        <Layout style={{ backgroundColor: "#fff", padding: "20px" }}>
          <Content>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Configuration alert */}
              {renderConfigurationAlert()}

              {/* Error alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      message="Error"
                      description={error}
                      type="error"
                      closable
                      onClose={() => setError(null)}
                      style={{ marginBottom: "16px" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main content */}
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                  <motion.div variants={itemVariants}>
                    <Title level={2} style={{ marginBottom: "16px" }}>
                      {auction?.itemId?.name}
                      {auctionStatus.hasEnded && (
                        <Badge
                          style={{ marginLeft: "12px" }}
                          count="ENDED"
                          color="red"
                        />
                      )}
                      {!auctionStatus.hasStarted && auction?.startTime && (
                        <Badge
                          style={{ marginLeft: "12px" }}
                          count="COMING SOON"
                          color="blue"
                        />
                      )}
                      {auctionStatus.hasStarted && !auctionStatus.hasEnded && (
                        <Badge
                          style={{ marginLeft: "12px" }}
                          count="LIVE NOW"
                          color="green"
                        />
                      )}
                    </Title>
                  </motion.div>

                  {/* Image gallery */}
                  {renderImageGallery()}

                  {/* Auction info */}
                  {renderAuctionInfo()}

                  {/* Description */}
                  <motion.div variants={itemVariants}>
                    <Card className="shadow-md rounded-lg">
                      <Title level={4}>Description</Title>
                      <Paragraph
                        style={{
                          fontSize: "16px",
                          color: "#666",
                          lineHeight: "1.8",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {auction?.itemId?.description ||
                          "No description provided for this item."}
                      </Paragraph>
                    </Card>
                  </motion.div>
                </Col>

                <Col xs={24} lg={10}>
                  <div style={{ position: "sticky", top: "20px" }}>
                    {/* Bid form */}
                    {renderBidForm()}

                    {/* Leaderboard */}
                    {renderLeaderboard()}
                  </div>
                </Col>
              </Row>
            </motion.div>
          </Content>
        </Layout>

        {/* Auth modal */}
        <AuthRequiredModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          featureName="đấu giá"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AuctionDetailPage;
