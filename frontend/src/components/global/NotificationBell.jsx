import React, { useEffect, useState } from "react";
import { Badge, Dropdown, Spin, Tabs, message } from "antd";
import { Bell, X, User, MessageCircle, Heart, UserPlus } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const API_URL = import.meta.env.VITE_API_URL;

const NotificationBell = () => {
  const { userId, getToken } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = await getToken();

      const [resAll, resUnread] = await Promise.all([
        fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/notifications?status=unread`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataAll = await resAll.json();
      const dataUnread = await resUnread.json();

      if (dataAll.success) setAllNotifications(dataAll.data);
      if (dataUnread.success) {
        setUnreadNotifications(dataUnread.data);
        setUnreadCount(dataUnread.unreadCount || 0);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      message.error("Không thể tải thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(API_URL, { transports: ["websocket"] });
    socket.emit("join", userId);

    socket.on("notification", (newNotification) => {
      setAllNotifications((prev) => [newNotification, ...prev]);
      setUnreadNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [userId]);

  const handleNotificationClick = async (notification) => {
    try {
      const token = await getToken();

      // Đánh dấu đã đọc
      await fetch(`${API_URL}/notifications/mark-read/${notification._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Cập nhật lại danh sách
      setUnreadNotifications((prev) =>
        prev.filter((n) => n._id !== notification._id)
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));

      // Điều hướng nếu có link và không phải loại follow
      if (notification.link && notification.type !== "follow") {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo:", error);
      message.error("Không thể xử lý thông báo.");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAllNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        setUnreadNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } else {
        throw new Error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
      message.error("Không thể xóa thông báo.");
    }
  };

  // Hàm lấy icon phù hợp với loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Hàm lấy màu viền cho loại thông báo
  const getNotificationColor = (type) => {
    switch (type) {
      case "follow":
        return "border-l-blue-500";
      case "like":
        return "border-l-red-500";
      case "comment":
        return "border-l-green-500";
      default:
        return "border-l-gray-400";
    }
  };

  const renderList = (data) =>
    data.length ? (
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {data.map((n) => (
          <div
            key={n._id}
            className={`group relative flex items-start gap-3 p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 border-l-4 ${getNotificationColor(
              n.type
            )} ${!n.isRead ? "bg-blue-50/30" : ""}`}
          >
            {/* Icon thông báo */}
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(n.type)}
            </div>

            {/* Nội dung thông báo */}
            <div
              onClick={() => handleNotificationClick(n)}
              className="flex-1 cursor-pointer min-w-0"
            >
              <div
                className={`text-sm leading-relaxed break-words ${
                  !n.isRead ? "font-semibold text-gray-900" : "text-gray-700"
                }`}
              >
                {n.message}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-gray-500">
                  {dayjs(n.createdAt).fromNow()}
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Nút xóa */}
            <button
              onClick={() => handleDeleteNotification(n._id)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              title="Xóa thông báo"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-gray-500 text-center">
          <div className="font-medium">Không có thông báo</div>
          <div className="text-sm text-gray-400 mt-1">
            Bạn sẽ nhận được thông báo mới tại đây
          </div>
        </div>
      </div>
    );

  if (!userId) return null;

  return loading ? (
    <div className="flex items-center justify-center p-2">
      <Spin size="small" />
    </div>
  ) : (
    <Dropdown
      dropdownRender={() => (
        <div className="w-96 max-h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thông báo</h3>
              {unreadCount > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                  {unreadCount} mới
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white">
            <Tabs
              defaultActiveKey="all"
              centered
              className="notification-tabs"
              items={[
                {
                  key: "all",
                  label: (
                    <div className="flex items-center gap-2 px-2">
                      <Bell className="w-4 h-4" />
                      <span>Tất cả</span>
                    </div>
                  ),
                  children: renderList(allNotifications),
                },
                {
                  key: "unread",
                  label: (
                    <div className="flex items-center gap-2 px-2">
                      <Badge count={unreadCount} size="small">
                        <Bell className="w-4 h-4" />
                      </Badge>
                      <span>Chưa đọc</span>
                    </div>
                  ),
                  children: renderList(unreadNotifications),
                },
              ]}
            />
          </div>
        </div>
      )}
      trigger="click"
      placement="bottomRight"
    >
      <div className="flex items-center justify-center relative">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
