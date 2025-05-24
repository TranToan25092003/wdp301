// controllers/borrowController.js
const Borrow = require("../../model/borrow.model");
const Item = require("../../model/item.model");
const Status = require("../../model/status.model");

const createBorrow = async (req, res) => {
    try {
        const { totalPrice, totalTime, borrowers, itemId, startTime, endTime } = req.body;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found." });
        }

        const borrowedStatus = await Status.findOne({ name: "Borrowed" });
        if (!borrowedStatus) {
            return res.status(404).json({ message: 'Status "Borrowed" not found.' });
        }

        const borrow = new Borrow({
            totalPrice,
            totalTime,
            borrowers,
            itemId,
            startTime,
            endTime
        });
        await borrow.save();

        item.statusId = borrowedStatus._id;
        await item.save();

        return res.status(201).json({
            status: 201,
            message: "Borrow created and item status updated.",
            borrow,
            updatedItem: item,
        });
    } catch (error) {
        console.error("Error creating borrow:", error);
        return res.status(500).json({ message: "Server error." });
    }
};

module.exports = {
    createBorrow,
};
