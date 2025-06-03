const { clerkClient } = require("@clerk/clerk-sdk-node");

const getUserDetail = async (req, res) => {
    try {
        const {userId} = req.params;

        if (!userId) {
            return res.status(400).json({ error: "Missing user ID" });
        }

        const user = await clerkClient.users.getUser(userId);
        if (user) return res.status(200).json(user);
        else {
            console.error("Error fetching user detail:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } catch (err) {
        console.error("Error fetching user detail:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getUserDetail };
