const { Buy, Borrow, Report, Item } = require("../../model");
const { clerkClient } = require("../../config/clerk");

// Define constants for automatic reporting thresholds
const MIN_PROBLEMATIC_BORROW_VIOLATIONS = 2;
const MIN_REPORT_COUNT_FOR_AUTO_FLAG = 3;
const AUTO_REPORT_COOL_DOWN_DAYS = 7;

async function getClerkUsersInfo(clerkUserIds) {
  const uniqueUserIds = [...new Set(clerkUserIds)].filter(
    (id) => id && !id.startsWith("IP_")
  );
  const userMap = {};

  try {
    const userPromises = uniqueUserIds.map((id) =>
      clerkClient.users.getUser(id).catch((err) => {
        console.warn(`Could not fetch Clerk user ${id}:`, err.message);
        return null;
      })
    );

    const users = await Promise.all(userPromises);
    users.forEach((user) => {
      if (user) {
        userMap[user.id] = {
          id: user.id,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
          email:
            user.emailAddresses && user.emailAddresses.length > 0
              ? user.emailAddresses[0].emailAddress
              : "N/A",
          isBanned: user.publicMetadata.isBanned || false, // Thêm isBanned
        };
      }
    });
  } catch (error) {
    console.error("Error while fetching users from Clerk:", error);
  }

  return userMap;
}

async function getFormattedTransactions(dateFilter, clerkUserMap) {
  const rawBuys = await Buy.find(dateFilter)
    .populate("itemId", "owner name images")
    .lean();
  const rawBorrows = await Borrow.find(dateFilter)
    .populate("itemId", "owner name images")
    .lean();
  let formattedTransactions = [];

  rawBuys.forEach((buy) => {
    formattedTransactions.push({
      type: "Buy",
      transactionId: buy._id.toString(),
      item: buy.itemId
        ? {
            _id: buy.itemId._id.toString(),
            name: buy.itemId.name,
            images: buy.itemId.images,
            price: buy.itemId.price || 0,
            owner: clerkUserMap[buy.owner] || {
              id: buy.owner,
              name: `Unknown (${buy.owner})`,
              email: "N/A",
              isBanned: false,
            },
          }
        : null,
      user: clerkUserMap[buy.buyer] || {
        id: buy.buyer,
        name: `Unknown (${buy.buyer})`,
        email: "N/A",
        isBanned: false,
      },
      totalAmount: buy.total || 0,
      date: buy.createdAt,
      status: "completed",
    });
  });

  rawBorrows.forEach((borrow) => {
    formattedTransactions.push({
      type: "Borrow",
      transactionId: borrow._id.toString(),
      item: borrow.itemId
        ? {
            _id: borrow.itemId._id.toString(),
            name: borrow.itemId.name,
            images: borrow.itemId.images,
            price: borrow.itemId.price || 0,
            owner: clerkUserMap[borrow.owner] || {
              id: borrow.owner,
              name: `Unknown (${borrow.owner})`,
              email: "N/A",
              isBanned: false,
            },
          }
        : null,
      user: clerkUserMap[borrow.borrowers] || {
        id: borrow.borrowers,
        name: `Unknown (${borrow.borrowers})`,
        email: "N/A",
        isBanned: false,
      },
      totalAmount: borrow.totalPrice || 0,
      totalTime: borrow.totalTime,
      startTime: borrow.startTime,
      endTime: borrow.endTime,
      date: borrow.createdAt,
      status: borrow.status,
      actualReturnTime: borrow.actualReturnTime,
    });
  });

  return formattedTransactions;
}

// Hàm ban/unban người dùng đã được di chuyển sang userAdminController.js

module.exports.getAdminReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      searchUser,
      searchItem,
      page = 1,
      limit = 10,
    } = req.query;
    const pageSize = parseInt(limit);
    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * pageSize;

    let dateFilter = {};
    if (startDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        $gte: new Date(startDate),
      };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: end };
    }

    const allClerkUserIds = new Set();
    const rawBuysForUserIds = await Buy.find(dateFilter)
      .select("buyer owner")
      .lean();
    rawBuysForUserIds.forEach((b) => {
      if (b.buyer) allClerkUserIds.add(b.buyer);
      if (b.owner) allClerkUserIds.add(b.owner);
    });

    const rawBorrowsForUserIds = await Borrow.find(dateFilter)
      .select("borrowers owner")
      .lean();
    rawBorrowsForUserIds.forEach((b) => {
      if (b.borrowers) allClerkUserIds.add(b.borrowers);
      if (b.owner) allClerkUserIds.add(b.owner);
    });

    const rawReportsForUserIds = await Report.find(dateFilter)
      .select("userId reportedUserId")
      .lean();
    rawReportsForUserIds.forEach((r) => {
      if (r.userId) allClerkUserIds.add(r.userId);
      if (r.reportedUserId) allClerkUserIds.add(r.reportedUserId);
    });

    const itemOwners = await Item.find({}).select("owner").lean();
    itemOwners.forEach((item) => {
      if (item.owner) allClerkUserIds.add(item.owner);
    });

    const clerkUserMap = await getClerkUsersInfo(Array.from(allClerkUserIds));
    let allTransactions = await getFormattedTransactions(
      dateFilter,
      clerkUserMap
    );
    let filteredTransactions = allTransactions;

    if (searchUser) {
      const searchLower = searchUser.toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          (t.user?.name && t.user.name.toLowerCase().includes(searchLower)) ||
          (t.user?.email && t.user.email.toLowerCase().includes(searchLower)) ||
          (t.user?.id && t.user.id.toLowerCase().includes(searchLower))
      );
    }

    if (searchItem) {
      const searchLower = searchItem.toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          t.item &&
          t.item.name &&
          t.item.name.toLowerCase().includes(searchLower)
      );
    }

    filteredTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    const totalTransactions = filteredTransactions.length;
    const paginatedTransactions = filteredTransactions.slice(
      skip,
      skip + pageSize
    );

    const transactionCounts = {};
    allTransactions.forEach((t) => {
      const userId = t.user?.id;
      if (userId) {
        transactionCounts[userId] = (transactionCounts[userId] || 0) + 1;
      }
    });
    const topTransactingUsers = Object.entries(transactionCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([userId, count]) => ({
        user: clerkUserMap[userId] || {
          id: userId,
          name: `Unknown (${userId})`,
          email: "N/A",
          isBanned: false,
        },
        transactionCount: count,
      }));

    const reportedUserCounts = {};
    const userBehaviorReports = await Report.find({
      ...dateFilter,
      reportType: {
        $in: ["user_behavior", "spam", "system_generated_violation"],
      },
      reportedUserId: { $exists: true, $ne: null },
    }).lean();

    userBehaviorReports.forEach((report) => {
      const reportedId = report.reportedUserId;
      reportedUserCounts[reportedId] =
        (reportedUserCounts[reportedId] || 0) + 1;
    });

    const mostReportedUsers = Object.entries(reportedUserCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([userId, count]) => ({
        user: clerkUserMap[userId] || {
          id: userId,
          name: userId.startsWith("IP_")
            ? `Unknown (IP: ${userId.replace("IP_", "")})`
            : `Unknown (${userId})`,
          email: "N/A",
          isBanned: false,
        },
        reportCount: count,
        reports: userBehaviorReports.filter((r) => r.reportedUserId === userId),
      }));

    const sellerPerformance = {};
    const itemReports = await Report.find({
      ...dateFilter,
      itemId: { $exists: true, $ne: null },
    })
      .populate("itemId", "owner")
      .select("itemId rating")
      .lean();

    itemReports.forEach((report) => {
      if (report.itemId && report.itemId.owner) {
        const ownerId = report.itemId.owner;
        sellerPerformance[ownerId] = sellerPerformance[ownerId] || {
          totalTransactions: 0,
          canceledBuys: 0,
          canceledBorrows: 0,
          negativeReports: 0,
          summedRatings: 0,
          ratedReportsCount: 0,
        };
        sellerPerformance[ownerId].negativeReports++;
        if (report.rating != null) {
          sellerPerformance[ownerId].summedRatings += report.rating;
          sellerPerformance[ownerId].ratedReportsCount++;
        }
      }
    });

    const allBuysForSellerPerf = await Buy.find(dateFilter).lean();
    allBuysForSellerPerf.forEach((buy) => {
      const ownerId = buy.owner;
      if (ownerId) {
        sellerPerformance[ownerId] = sellerPerformance[ownerId] || {
          totalTransactions: 0,
          canceledBuys: 0,
          canceledBorrows: 0,
          negativeReports: 0,
          summedRatings: 0,
          ratedReportsCount: 0,
        };
        sellerPerformance[ownerId].totalTransactions++;
        if (buy.status === "canceled") {
          sellerPerformance[ownerId].canceledBuys++;
        }
      }
    });

    const allBorrowsForSellerPerf = await Borrow.find(dateFilter).lean();
    allBorrowsForSellerPerf.forEach((borrow) => {
      const ownerId = borrow.owner;
      if (ownerId) {
        sellerPerformance[ownerId] = sellerPerformance[ownerId] || {
          totalTransactions: 0,
          canceledBuys: 0,
          canceledBorrows: 0,
          negativeReports: 0,
          summedRatings: 0,
          ratedReportsCount: 0,
        };
        sellerPerformance[ownerId].totalTransactions++;
        if (borrow.status === "declined" || borrow.status === "canceled") {
          sellerPerformance[ownerId].canceledBorrows++;
        }
      }
    });

    const reliableSellers = Object.entries(sellerPerformance)
  .map(([ownerId, stats]) => ({
    user: clerkUserMap[ownerId] || {
      id: ownerId,
      name: `Unknown (${ownerId})`,
      email: "N/A",
      isBanned: false,
    },
    ...stats,
    totalCancellations: stats.canceledBuys + stats.canceledBorrows,
    averageRating:
      stats.ratedReportsCount > 0
        ? stats.summedRatings / stats.ratedReportsCount
        : null,
  }))
  .filter((seller) => {
    const meetsTransactionCount = seller.totalTransactions >= 5;
    const meetsCancellationCriteria = seller.totalCancellations <= 2;
    const meetsRatingCriteria = seller.averageRating !== null && seller.averageRating >= 3.0;
    const hasEnoughRatings = seller.ratedReportsCount >= 3;
    return (
      meetsTransactionCount &&
      meetsCancellationCriteria &&
      meetsRatingCriteria &&
      hasEnoughRatings
    );
  })
  .sort((a, b) => {
    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }
    return b.totalTransactions - a.totalTransactions;
  })
  .slice(0, 5);


    const problematicBorrowers = {};
    const lateUnreturnedBorrows = await Borrow.find({
      ...dateFilter,
      status: { $in: ["late", "unreturned"] },
    })
      .select("borrowers status actualReturnTime endTime")
      .lean();

    lateUnreturnedBorrows.forEach((borrow) => {
      const borrowerId = borrow.borrowers;
      problematicBorrowers[borrowerId] = problematicBorrowers[borrowerId] || {
        lateCount: 0,
        unreturnedCount: 0,
        totalViolations: 0,
      };
      if (borrow.status === "late") {
        problematicBorrowers[borrowerId].lateCount++;
      } else if (borrow.status === "unreturned") {
        problematicBorrowers[borrowerId].unreturnedCount++;
      }
      problematicBorrowers[borrowerId].totalViolations++;
    });

    const mostProblematicBorrowers = Object.entries(problematicBorrowers)
      .filter(([, stats]) => stats.totalViolations >= 1)
      .sort(
        ([, statsA], [, statsB]) =>
          statsB.totalViolations - statsA.totalViolations
      )
      .slice(0, 5)
      .map(([userId, stats]) => ({
        user: clerkUserMap[userId] || {
          id: userId,
          name: `Unknown (${userId})`,
          email: "N/A",
          isBanned: false,
        },
        lateCount: stats.lateCount,
        unreturnedCount: stats.unreturnedCount,
        totalViolations: stats.totalViolations,
      }));

    const now = new Date();
    const coolDownDate = new Date(
      now.getTime() - AUTO_REPORT_COOL_DOWN_DAYS * 24 * 60 * 60 * 1000
    );

    for (const borrower of mostProblematicBorrowers) {
      if (borrower.totalViolations >= MIN_PROBLEMATIC_BORROW_VIOLATIONS) {
        const existingAutoReport = await Report.findOne({
          reportedUserId: borrower.user.id,
          reportType: "system_generated_violation",
          description: { $regex: /problematic borrow behavior/i },
          createdAt: { $gte: coolDownDate },
        });

        if (!existingAutoReport) {
          await Report.create({
            title: `System: Problematic Borrow Behavior Detected for ${
              borrower.user.name || borrower.user.id
            }`,
            userId: null,
            reportedUserId: borrower.user.id,
            reportType: "system_generated_violation",
            description: `Automatic report: User has ${borrower.totalViolations} problematic borrow(s) (late: ${borrower.lateCount}, unreturned: ${borrower.unreturnedCount}).`,
            status: "pending",
            createdAt: new Date(),
          });
          console.log(
            `Auto-reported problematic borrower: ${borrower.user.name} (${borrower.user.id})`
          );
        }
      }
    }

    for (const reportedUser of mostReportedUsers) {
      if (reportedUser.reportCount >= MIN_REPORT_COUNT_FOR_AUTO_FLAG) {
        const existingAutoReport = await Report.findOne({
          reportedUserId: reportedUser.user.id,
          reportType: "system_generated_violation",
          description: { $regex: /frequently reported/i },
          createdAt: { $gte: coolDownDate },
        });

        if (!existingAutoReport) {
          await Report.create({
            title: `System: User Frequently Reported - ${
              reportedUser.user.name || reportedUser.user.id
            }`,
            userId: null,
            reportedUserId: reportedUser.user.id,
            reportType: "system_generated_violation",
            description: `Automatic report: User has been frequently reported (${reportedUser.reportCount} times).`,
            status: "pending",
            createdAt: new Date(),
          });
          console.log(
            `Auto-reported frequently reported user: ${reportedUser.user.name} (${reportedUser.user.id})`
          );
        }
      }
    }
    // Thống kê các loại báo cáo KHÁC ngoài spam, user_behavior, system_generated_violation
    const otherTypeReports = await Report.find({
      ...dateFilter,
      reportType: {
        $nin: ["spam", "user_behavior", "system_generated_violation"],
      },
    }).lean();

    const otherReportStats = {};
    otherTypeReports.forEach((report) => {
      const type = report.reportType;
      otherReportStats[type] = (otherReportStats[type] || 0) + 1;
    });

    res.status(200).json({
      transactions: {
        data: paginatedTransactions,
        totalItems: totalTransactions,
        totalPages: Math.ceil(totalTransactions / pageSize),
        currentPage: currentPage,
      },
      statistics: {
        topTransactingUsers,
        mostReportedUsers,
        reliableSellers,
        mostProblematicBorrowers,
         otherReportStats: otherReportStats || {}
      },
    });
  } catch (error) {
    console.error("Error in getAdminReport:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports.getReportDetail = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId).lean();
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    let reportedUser = null;
    if (report.reportedUserId && !report.reportedUserId.startsWith("IP_")) {
      try {
        const user = await clerkClient.users.getUser(report.reportedUserId);
        reportedUser = {
          id: user.id,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
          email:
            user.emailAddresses && user.emailAddresses.length > 0
              ? user.emailAddresses[0].emailAddress
              : "N/A",
          isBanned: user.publicMetadata.isBanned || false,
        };
      } catch (error) {
        console.warn(
          `Could not fetch Clerk user ${report.reportedUserId}:`,
          error.message
        );
      }
    }

    let reporter = null;
    if (report.userId) {
      try {
        const user = await clerkClient.users.getUser(report.userId);
        reporter = {
          id: user.id,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
          email:
            user.emailAddresses && user.emailAddresses.length > 0
              ? user.emailAddresses[0].emailAddress
              : "N/A",
          isBanned: user.publicMetadata.isBanned || false,
        };
      } catch (error) {
        console.warn(
          `Could not fetch Clerk user ${report.userId}:`,
          error.message
        );
      }
    }

    const formattedReport = {
      id: report._id.toString(),
      title: report.title,
      description: report.description,
      reportType: report.reportType,
      reportedUser: reportedUser || {
        id: report.reportedUserId,
        name: report.reportedUserId.startsWith("IP_")
          ? `Unknown (IP: ${report.reportedUserId.replace("IP_", "")})`
          : `Unknown (${report.reportedUserId})`,
        email: "N/A",
        isBanned: false,
      },
      reporter: reporter || {
        id: report.userId || "N/A",
        name: report.userId ? `Unknown (${report.userId})` : "System",
        email: "N/A",
        isBanned: false,
      },
      status: report.status,
      createdAt: report.createdAt,
      payload: report.payload || {},
    };

    res.status(200).json(formattedReport);
  } catch (error) {
    console.error("Error in getReportDetail:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
module.exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Report.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
