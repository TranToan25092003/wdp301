const Buy = require("../../model/buy.model");
const Item = require("../../model/item.model");
const Status = require("../../model/status.model");
const { clerkClient } = require("../../config/clerk");

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
        
            console.log(item)

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        // Verify item is of type "Sell" and status "Available"
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
        if (item.owner === buyerId) {
            return res.status(400).json({
                success: false,
                message: "You cannot purchase your own item",
            });
        }

        // Fetch buyer's coin balance from Clerk
        const user = await clerkClient.users.getUser(buyerId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "BuyerId is not exist in the system",
            });
        }

        const currentCoins = Number.parseInt(user.publicMetadata?.coin) || 0;

        // Verify sufficient coins
        if (currentCoins < item.price) {
            return res.status(400).json({
                success: false,
                message: "Insufficient coins to purchase this item",
            });
        }

        // Find the "Sold" status
        const notAvailableStatus = await Status.findOne({ name: "Sold" });
        if (!notAvailableStatus) {
            return res.status(500).json({
                success: false,
                message: "Server error: Status configuration missing",
            });
        }

        // Deduct coins and update user's metadata
        const newCoinBalance = currentCoins - item.price;
        await clerkClient.users.updateUserMetadata(buyerId, {
            publicMetadata: {
                coin: newCoinBalance,
            },
        });

        // Create Buy record
        const buy = await Buy.create({
            total: item.price,
            buyer: buyerId,
            itemId,
        });

        // Update item status to "Not Available"
        item.statusId = notAvailableStatus._id;
        await item.save();

        return res.status(200).json({
            success: true,
            message: "Purchase successful",
            data: {
                buyId: buy._id,
                itemId,
                total: item.price,
                remainingCoins: newCoinBalance,
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

module.exports = {
    purchaseItem,
};
