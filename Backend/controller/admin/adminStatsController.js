
const { Buy, Borrow, Item, Report } = require('../../model'); 
const { clerkClient } = require('../../config/clerk');


module.exports.getDashboardStats = async (req, res) => {
    try {
       
        let totalUsers = 0;
        try {
            const usersList = await clerkClient.users.getUserList({ limit: 1 }); 
            totalUsers = usersList.total_count || 0;
        } catch (clerkError) {
            console.error("Lỗi khi lấy tổng số người dùng từ Clerk:", clerkError.message);
            const uniqueBuyerIds = await Buy.distinct('buyer');
            const uniqueBorrowerIds = await Borrow.distinct('borrowers');
            const uniqueReporterIds = await Report.distinct('userId');
            
            const allUniqueDbUserIds = new Set([
                ...uniqueBuyerIds,
                ...uniqueBorrowerIds,
                ...uniqueReporterIds
            ]);
            totalUsers = allUniqueDbUserIds.size;
            console.warn("Đang sử dụng số lượng người dùng ước tính từ DB do lỗi Clerk API.");
        }

        // --- 2. Tổng số Vật phẩm ---
        const totalItems = await Item.countDocuments({});

        // --- 3. Tổng số Giao dịch Mua ---
        const totalBuyTransactions = await Buy.countDocuments({});

        // --- 4. Tổng số Giao dịch Mượn ---
        const totalBorrowTransactions = await Borrow.countDocuments({});

        // --- 5. Tổng Doanh thu từ Giao dịch Mua ---
        const buyRevenueResult = await Buy.aggregate([
            {
                $group: {
                    _id: null, // Nhóm tất cả các tài liệu lại
                    totalRevenue: { $sum: "$total" } // Tính tổng trường 'total'
                }
            }
        ]);
        // Kiểm tra nếu có kết quả, nếu không thì mặc định là 0
        const totalBuyRevenue = buyRevenueResult.length > 0 ? buyRevenueResult[0].totalRevenue : 0;

        // --- 6. Tổng Doanh thu từ Giao dịch Mượn ---
        // Giả sử `totalPrice` trong model Borrow là doanh thu cho lần mượn đó
        const borrowRevenueResult = await Borrow.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" }
                }
            }
        ]);
        const totalBorrowRevenue = borrowRevenueResult.length > 0 ? borrowRevenueResult[0].totalRevenue : 0;

        // --- 7. Tổng số Báo cáo/Phản hồi ---
        const totalReports = await Report.countDocuments({});


        // Gửi phản hồi về client
        res.status(200).json({
            status: 200,
            message: "Thống kê dashboard đã được lấy thành công",
            data: {
                totalUsers,
                totalItems,
                totalBuyTransactions,
                totalBorrowTransactions,
                totalRevenue: totalBuyRevenue + totalBorrowRevenue, // Tổng doanh thu chung
                totalBuyRevenue,
                totalBorrowRevenue,
                totalReports,
                // Bạn có thể thêm các thống kê cụ thể hơn ở đây sau này, ví dụ:
                // pendingItems: await Item.countDocuments({ statusId: 'ID_CUA_TRANG_THAI_PENDING' }),
                // approvedReports: await Report.countDocuments({ status: 'approved' }),
            },
        });

    } catch (error) {
        console.error("Lỗi trong getDashboardStats:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: error.message });
    }
};