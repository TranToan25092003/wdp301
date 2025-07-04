import React, { useState, useEffect } from "react";
import { Popover, List, Avatar, Badge, Spin } from "antd";
import { MessageCircle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getUserInformation } from "@/API/duc.api/user.api";
import { initializeSocket } from "@/utils/socket";

const ChatList = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const socket = initializeSocket();

    // Load user's chat list
    socket.emit("loadChatList", user.id, async (chatList) => {
      // Fetch user info for each chat
      const chatsWithInfo = await Promise.all(
        chatList.map(async (chat) => {
          const otherUserId = chat.participants.find((id) => id !== user.id);
          try {
            const userInfo = await getUserInformation(otherUserId);
            return {
              ...chat,
              userInfo,
            };
          } catch (error) {
            console.error("Error fetching user info:", error);
            return {
              ...chat,
              userInfo: { name: "Unknown User" },
            };
          }
        })
      );

      setChats(chatsWithInfo);
      setLoading(false);

      // Calculate unread messages
      const unread = chatsWithInfo.reduce(
        (acc, chat) => acc + (chat.unreadCount || 0),
        0
      );
      setUnreadCount(unread);
    });

    // Listen for new messages
    socket.on("newMessage", async (message) => {
      // Update chat list when new message arrives
      setChats((prev) => {
        const chatIndex = prev.findIndex(
          (chat) => chat.roomId === message.roomId
        );

        if (chatIndex === -1) return prev;

        const newChats = [...prev];
        newChats[chatIndex] = {
          ...newChats[chatIndex],
          lastMessage: message.content,
          timestamp: message.timestamp,
          unreadCount: (newChats[chatIndex].unreadCount || 0) + 1,
        };

        // Sort chats by latest message
        return newChats.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });

      // Update unread count
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [user]);

  const handleChatClick = (userId) => {
    navigate(`/chat?seller=${userId}`);
  };

  const content = (
    <div style={{ width: 300 }}>
      {loading ? (
        <div className="flex justify-center p-4">
          <Spin />
        </div>
      ) : chats.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() =>
                handleChatClick(chat.participants.find((id) => id !== user.id))
              }
            >
              <List.Item.Meta
                avatar={
                  <Badge count={chat.unreadCount || 0}>
                    <Avatar src={chat.userInfo?.imageUrl}>
                      {!chat.userInfo?.imageUrl && chat.userInfo?.name?.[0]}
                    </Avatar>
                  </Badge>
                }
                title={chat.userInfo?.name || "Unknown User"}
                description={
                  <div>
                    <div className="text-sm truncate">{chat.lastMessage}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(chat.timestamp).toLocaleString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      overlayStyle={{ width: 300 }}
    >
      <div className="relative cursor-pointer">
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
    </Popover>
  );
};

export default ChatList;
