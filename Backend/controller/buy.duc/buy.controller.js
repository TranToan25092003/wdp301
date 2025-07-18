const Buy = require("../../model/buy.model");
const Item = require("../../model/item.model");
const Status = require("../../model/status.model");
const Category = require("../../model/category.model");
const Type = require("../../model/type.model");
const { clerkClient } = require("../../config/clerk");
const mongoose = require('mongoose');

/**
 * ====================================
 * [POST] /buy/purchase
 * ====================================
 * Handles the purchase of an item using system coins.
 * - Verifies the item is available, of type "Sell," and not owned by the buyer.
 * - Checks if the buyer has sufficient coins.
 * - Deducts the item price from the buyer's coin balance.
 * - Creates a Buy record.
 * - Updates the item status to "Not Available."
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing itemId
 * @param {string} req.userId - Clerk authenticated user ID
 * @param {Object} res - Express response object
 */

const purchaseItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const buyerId = req.userId;

        // Validate itemId as a MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Item ID format",
            });
        }

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "Item ID is required",
            });
        }

        // Fetch the item with populated typeId and statusId
        const item = await Item.findById(itemId)
            .populate("typeId")
            .populate("statusId");

        console.log('Fetched item:', item);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        // Verify item is of type "Sell" and status "Available" or "Approved"
        if (item.typeId?.name !== "Sell") {
            return res.status(400).json({
                success: false,
                message: "This item is not available for purchase",
            });
        }

        if (item.statusId?.name !== "Available" && item.statusId?.name !== "Approved") {
            return res.status(400).json({
                success: false,
                message: "This item is no longer available",
            });
        }

        // Prevent buyer from purchasing their own item
        if (item.owner.toString() === buyerId) {
            return res.status(400).json({
                success: false,
                message: "You cannot purchase your own item",
            });
        }

        // Fetch buyer and seller
        const buyer = await clerkClient.users.getUser(buyerId);
        if (!buyer) {
            return res.status(400).json({
                success: false,
                message: "BuyerId is not exist in the system",
            });
        }

        const seller = await clerkClient.users.getUser(item.owner);
        if (!seller) {
            return res.status(400).json({
                success: false,
                message: "SellerId is not exist in the system",
            });
        }

        const currentBuyerCoins = Number.parseInt(buyer.publicMetadata?.coin) || 0;
        const currentSellerCoins = Number.parseInt(seller.publicMetadata?.coin) || 0;

        // Verify sufficient coins
        const requiredCoins = item.price;
        if (currentBuyerCoins < requiredCoins) {
            return res.status(400).json({
                success: false,
                message: "Insufficient coins to purchase this item",
            });
        }

        // Find the "Sold" status
        const soldStatus = await Status.findOne({ name: "Sold" });
        if (!soldStatus) {
            return res.status(500).json({
                success: false,
                message: "Server error: Status configuration missing",
            });
        }

        // Update seller's coins
        const newSellerCoinBalance = currentSellerCoins + item.price;
        await clerkClient.users.updateUserMetadata(item.owner, {
            publicMetadata: {
                coin: newSellerCoinBalance,
            },
        });

        // Update buyer's coins
        const newBuyerCoinBalance = currentBuyerCoins - item.price;
        await clerkClient.users.updateUserMetadata(buyerId, {
            publicMetadata: {
                coin: newBuyerCoinBalance,
            },
        });

        // Create Buy record
        const buy = await Buy.create({
            total: item.price,
            buyer: buyerId,
            itemId,
        });

        // Update item status to "Sold"
        item.statusId = soldStatus._id;
        await item.save();

        return res.status(200).json({
            success: true,
            message: "Purchase successful",
            data: {
                buyId: buy._id,
                itemId,
                total: item.price,
                remainingCoins: newBuyerCoinBalance,
            },
        });
    } catch (error) {
        console.error("Error purchasing item:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getAllBuyRecordByUserId = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const buyRecords = await Buy.find({ buyer: userId })
            .populate({
                path: "itemId",
                populate: [
                    { path: "statusId", select: "name" },
                    { path: "typeId", select: "name" },
                    { path: "categoryId", select: "name" },
                ],
            })
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        // Check if records exist
        if (!buyRecords || buyRecords.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No buy records found for this user",
                data: []
            });
        }

        // Map records to include the full item object with populated fields
        const formattedRecords = buyRecords.map(record => ({
            buyId: record._id,
            item: record.itemId, 
            total: record.total,
            purchaseDate: record.createdAt,
        }));

        return res.status(200).json({
            success: true,
            message: "Buy history retrieved successfully",
            data: formattedRecords,
        });
    } catch (error) {
        console.error("Error fetching buy records:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = {
    purchaseItem,
    getAllBuyRecordByUserId
};
