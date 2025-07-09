// routes/api/follow.duy/followRoutes.js
const express = require('express');
const { authenticate } = require('../../../middleware/guards/authen.middleware'); // Đường dẫn middleware đã đúng và được giữ nguyên

// ĐÃ SỬA ĐƯỜNG DẪN CHÍNH XÁC: Dùng 'controller' (số ít) và 'followController'
const {
    followUser,
    unfollowUser,
    getFollowStatus,
    getFollowers,
    getFollowing,
} = require('../../../controller/follow.duy/followController'); // ĐƯỜNG DẪN ĐÃ CHÍNH XÁC

const router = express.Router();

// Route để theo dõi một người dùng
// POST /api/follow/:followedId
router.post('/:followedId', authenticate, followUser);

// Route để bỏ theo dõi một người dùng
// DELETE /api/follow/:followedId
router.delete('/:followedId', authenticate, unfollowUser);

// Route để kiểm tra trạng thái theo dõi giữa người dùng hiện tại và người khác
// GET /api/follow/status/:followedId
router.get('/status/:followedId', authenticate, getFollowStatus);

// Route để lấy danh sách người theo dõi của một người dùng
// GET /api/follow/followers/:userId
router.get('/followers/:userId', getFollowers);

// Route để lấy danh sách những người mà một người dùng đang theo dõi
// GET /api/follow/following/:userId
router.get('/following/:userId', getFollowing);

module.exports = router;