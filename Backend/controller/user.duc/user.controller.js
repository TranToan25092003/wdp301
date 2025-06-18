const { clerkClient, phoneNumbers } = require("@clerk/clerk-sdk-node");

const getUserDetail = async (req, res) => {
    try {
        const {userId} = req.params;

        if (!userId) {
            return res.status(400).json({ error: "Missing user ID" });
        }

        const user = await clerkClient.users.getUser(userId);
        if (user) {
            // Filter user data to include only buyer-relevant information
            const buyerInfo = {
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                imageUrl: user.imageUrl || '',
                hasImage: user.hasImage || false,
                emailAddresses: user.emailAddresses.map(email => email.emailAddress) || [],
                phoneNumbers: user.phoneNumbers.map(phone => phone.phoneNumber) || []
            };
            return res.status(200).json(buyerInfo);
        } else {
            console.error("Error fetching user detail: User not found");
            return res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error("Error fetching user detail:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getUserDetail };
