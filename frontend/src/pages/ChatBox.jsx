import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { getUserInformation } from "@/API/duc.api/user.api";
import { Input, Button, Avatar, Spin, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { initializeSocket } from "@/utils/socket";

const ChatBox = () => {
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get("seller");
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch seller information
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        console.log("Fetching seller info for:", sellerId);
        const info = await getUserInformation(sellerId);
        console.log("Seller info:", info);
        setSellerInfo(info);
      } catch (error) {
        console.error("Error fetching seller info:", error);
        message.error("Could not load seller information");
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerInfo();
    } else {
      console.error("No seller ID provided");
      message.error("No seller ID provided");
      setLoading(false);
    }
  }, [sellerId]);

  // Initialize socket connection
  useEffect(() => {
    if (!user || !sellerId) {
      console.log("Missing user or seller ID:", { user, sellerId });
      return;
    }

    console.log("Initializing socket connection...");
    const socketInstance = initializeSocket();
    socketRef.current = socketInstance;

    // Join chat room
    const roomId = [user.id, sellerId].sort().join("-");
    console.log("Joining chat room:", roomId);
    socketInstance.emit("joinChat", roomId);

    // Listen for new messages
    socketInstance.on("newMessage", (message) => {
      console.log("Received new message:", message);
      setMessages((prev) => [...prev, message]);
    });

    // Load previous messages
    console.log("Loading previous messages for room:", roomId);
    socketInstance.emit("loadMessages", roomId, (loadedMessages) => {
      console.log("Loaded messages:", loadedMessages);
      setMessages(loadedMessages || []);
    });

    // Socket connection events
    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      message.success("Connected to chat server");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      message.error("Failed to connect to chat server");
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
      message.error("Chat error occurred");
    });

    return () => {
      console.log("Cleaning up socket connection...");
      if (socketRef.current) {
        socketRef.current.off("newMessage");
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("error");
        const roomId = [user.id, sellerId].sort().join("-");
        socketRef.current.emit("leaveChat", roomId);
      }
    };
  }, [user, sellerId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) {
      console.log("Cannot send message:", {
        messageEmpty: !newMessage.trim(),
        socketMissing: !socketRef.current,
      });
      return;
    }

    const roomId = [user.id, sellerId].sort().join("-");
    const messageData = {
      roomId,
      senderId: user.id,
      receiverId: sellerId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("Sending message:", messageData);
    socketRef.current.emit("sendMessage", messageData, (error) => {
      if (error) {
        console.error("Error sending message:", error);
        message.error("Failed to send message");
      } else {
        console.log("Message sent successfully");
        // Optimistically add message to UI
        setMessages((prev) => [...prev, messageData]);
        setNewMessage("");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-120px)]">
      {/* Chat header */}
      <div className="flex items-center gap-4 p-4 border-b bg-white rounded-t-lg shadow">
        <Avatar src={sellerInfo?.imageUrl} size={48}>
          {!sellerInfo?.imageUrl && sellerInfo?.name?.[0]}
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">
            {sellerInfo?.name || "Unknown Seller"}
          </h2>
          <p className="text-sm text-gray-500">
            {sellerInfo?.emailAddresses?.[0] || "No email"}
          </p>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-180px)] bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.senderId === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow ${
                  message.senderId === user.id
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                }`}
              >
                <p className="break-words">{message.content}</p>
                <span className="text-xs opacity-70 block mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-4 bg-white rounded-b-lg shadow">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={sendMessage}
            placeholder="Type a message..."
            size="large"
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            size="large"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
