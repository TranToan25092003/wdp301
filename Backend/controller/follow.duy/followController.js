// controllers/follow.duy/followController.js
const { Follow, Notification } = require("../../model");
const { clerkClient } = require("../../config/clerk");
const {
  createNotification,
} = require("../notification.duy/notificationController");
const logActivity = require("../../utils/activityLogger"); // Hàm logActivity

/**
 * ====================================
 * [POST] /api/follow/:followedId
 * ====================================
 */
const followUser = async (req, res) => {
  try {
    const followerId = req.userId;
    const { followedId } = req.params;

    if (!followerId || !followedId) {
      return res.status(400).json({
        success: false,
        message: "Follower ID and Followed ID are required.",
      });
    }

    if (followerId === followedId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    const existingFollow = await Follow.findOne({ followerId, followedId });
    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: "You are already following this user.",
      });
    }

    const newFollow = await Follow.create({ followerId, followedId }); // Lưu bản ghi follow để lấy _id

    let followerUser = null;
    let followedUser = null; 
    try {
      followerUser = await clerkClient.users.getUser(followerId);
      followedUser = await clerkClient.users.getUser(followedId); 
    } catch (err) {
      console.warn(`Cannot fetch user data for follow log:`, err.message);
    }

    const notificationMessage = `${
      followerUser?.username || followerUser?.firstName || "Một người dùng"
    } vừa theo dõi bạn.`;
    const notificationLink = `/users/${followerId}`;

    // Tạo thông báo
    const newNotification = await createNotification({
      recipientId: followedId,
      senderId: followerId,
      type: "follow",
      message: notificationMessage,
      entityId: newFollow._id, // Gắn entityId là ID của bản ghi Follow
      entityRef: 'Follow', // Gắn entityRef là 'Follow'
      link: notificationLink,
    });

    const io = req.app.get("socketio");
    if (io) {
      io.to(followedId).emit("new_notification", {
        ...newNotification._doc,
        sender: {
          id: followerUser?.id,
          username: followerUser?.username || followerUser?.firstName,
          imageUrl: followerUser?.imageUrl,
        },
      });
    }

    try {
      const followerName =
        followerUser?.username ||
        followerUser?.firstName ||
        "Người dùng ẩn danh";
      const followedName =
        followedUser?.username ||
        followedUser?.firstName ||
        "Người dùng ẩn danh";

      await logActivity(
        followerId,
        "USER_FOLLOWED",
        `${followerName} đã theo dõi ${followedName}.`,
        'Follow', // ✅ Thay đổi từ null thành 'Follow'
        newFollow._id, // ✅ Truyền ID của bản ghi Follow vừa tạo
        req,
        { followedUserId: followedId }
      );

      console.log(`Activity logged: ${followerName} followed ${followedName}.`);
    } catch (logError) {
      console.error("Error logging USER_FOLLOWED activity:", logError);
    }

    return res.status(201).json({
      success: true,
      message: "Successfully followed user.",
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({
      success: false,
      message: "Server error during follow operation.",
      error: error.message,
    });
  }
};


/**
 * ====================================
 * [DELETE] /api/follow/:followedId
 * ====================================
 * Xử lý yêu cầu bỏ theo dõi một người dùng.
 * @param {Object} req - Express request object
 * @param {string} req.userId - ID của người dùng hiện tại (người bỏ theo dõi)
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.followedId - ID của người dùng bị bỏ theo dõi
 * @param {Object} res - Express response object
 */
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.userId;
    const { followedId } = req.params;

    if (!followerId || !followedId) {
      return res.status(400).json({
        success: false,
        message: "Follower ID and Followed ID are required.",
      });
    }

    if (followerId === followedId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself.",
      });
    }

    const result = await Follow.deleteOne({ followerId, followedId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "You are not following this user.",
      });
    }
    try {
      let followerUser = null;
      let followedUser = null;
      try {
        followerUser = await clerkClient.users.getUser(followerId);
        followedUser = await clerkClient.users.getUser(followedId);
      } catch (err) {
        console.warn(
          `Cannot fetch user details for logging unfollow:`,
          err.message
        );
      }

      const followerName =
        followerUser?.username ||
        followerUser?.firstName ||
        "Người dùng ẩn danh";
      const followedName =
        followedUser?.username ||
        followedUser?.firstName ||
        "Người dùng ẩn danh";

      // Khi unfollow, bản ghi Follow đã bị xóa, nên không có _id để truyền vào entityId.
      // Tuy nhiên, chúng ta vẫn có thể truyền entityType là 'Follow' để phân loại.
      await logActivity(
        followerId,
        "USER_UNFOLLOWED",
        `${followerName} đã bỏ theo dõi ${followedName}.`,
        'Follow', // ✅ Thay đổi từ null thành 'Follow'
        null, // Giữ nguyên null vì bản ghi Follow đã bị xóa
        req,
        { unfollowedUserId: followedId } // ✅ Lưu ID thủ công vào payload
      );

      console.log(
        `Activity logged: ${followerName} unfollowed ${followedName}.`
      );
    } catch (logError) {
      console.error("Error logging USER_UNFOLLOWED activity:", logError);
    }
    return res.status(200).json({
      success: true,
      message: "Successfully unfollowed user.",
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({
      success: false,
      message: "Server error during unfollow operation.",
      error: error.message,
    });
  }
};

/**
 * ====================================
 * [GET] /api/follow/status/:followedId
 * ====================================
 * Kiểm tra xem người dùng hiện tại có đang theo dõi người dùng khác hay không.
 * @param {Object} req - Express request object
 * @param {string} req.userId - ID của người dùng hiện tại
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.followedId - ID của người dùng cần kiểm tra trạng thái theo dõi
 * @param {Object} res - Express response object
 */
const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.userId;
    const { followedId } = req.params;

    if (!followerId || !followedId) {
      return res.status(400).json({
        success: false,
        message: "Follower ID and Followed ID are required.",
      });
    }

    const isFollowing = await Follow.exists({ followerId, followedId });

    return res.status(200).json({
      success: true,
      isFollowing: !!isFollowing, // Convert to boolean
      message: "Follow status retrieved successfully.",
    });
  } catch (error) {
    console.error("Error getting follow status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting follow status.",
      error: error.message,
    });
  }
};

/**
 * ====================================
 * [GET] /api/follow/followers/:userId
 * ====================================
 * Lấy danh sách những người đang theo dõi một người dùng cụ thể.
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - ID của người dùng cần lấy danh sách người theo dõi
 * @param {Object} res - Express response object
 */
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const followers = await Follow.find({ followedId: userId }).select(
      "followerId -_id"
    );
    const followerIds = followers.map((f) => f.followerId);

    let followerDetails = [];
    if (followerIds.length > 0) {
      try {
        // Lấy thông tin chi tiết từ Clerk cho tất cả người theo dõi
        const users = await clerkClient.users.getUserList({
          userId: followerIds,
          limit: 100, // Giới hạn để tránh quá tải, điều chỉnh nếu cần
        });
        followerDetails = users.map((user) => ({
          id: user.id,
          username:
            user.username ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.id,
          profileImageUrl: user.imageUrl,
          // Thêm các thông tin khác nếu cần
        }));
      } catch (clerkError) {
        console.warn(
          "Could not fetch some follower details from Clerk:",
          clerkError.message
        );
        // Vẫn tiếp tục nếu không lấy được tất cả thông tin từ Clerk
      }
    }

    return res.status(200).json({
      success: true,
      data: followerDetails,
      count: followerIds.length,
      message: "Followers retrieved successfully.",
    });
  } catch (error) {
    console.error("Error getting followers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting followers.",
      error: error.message,
    });
  }
};

/**
 * ====================================
 * [GET] /api/follow/following/:userId
 * ====================================
 * Lấy danh sách những người mà một người dùng cụ thể đang theo dõi.
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - ID của người dùng cần lấy danh sách đang theo dõi
 * @param {Object} res - Express response object
 */
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const following = await Follow.find({ followerId: userId }).select(
      "followedId -_id"
    );
    const followedIds = following.map((f) => f.followedId);

    let followedDetails = [];
    if (followedIds.length > 0) {
      try {
        // Lấy thông tin chi tiết từ Clerk cho tất cả người đang theo dõi
        const users = await clerkClient.users.getUserList({
          userId: followedIds,
          limit: 100, // Giới hạn để tránh quá tải
        });
        followedDetails = users.map((user) => ({
          id: user.id,
          username:
            user.username ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.id,
          profileImageUrl: user.imageUrl,
          // Thêm các thông tin khác nếu cần
        }));
      } catch (clerkError) {
        console.warn(
          "Could not fetch some followed user details from Clerk:",
          clerkError.message
        );
        // Vẫn tiếp tục nếu không lấy được tất cả thông tin từ Clerk
      }
    }

    return res.status(200).json({
      success: true,
      data: followedDetails,
      count: followedIds.length,
      message: "Following list retrieved successfully.",
    });
  } catch (error) {
    console.error("Error getting following list:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting following list.",
      error: error.message,
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing,
};