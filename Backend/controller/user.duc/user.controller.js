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
const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ error: "Missing email" });
        }

        const users = await clerkClient.users.getUserList({ emailAddress: [email] });

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy người dùng với email này." });
        }

        const user = users[0]; // lấy user đầu tiên (đúng nhất)
        return res.status(200).json({
            id: user.id,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.emailAddresses[0]?.emailAddress || '',
            imageUrl: user.imageUrl || '',
        });
    } catch (err) {
        console.error("Error fetching user by email:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getUserDetail, getUserByEmail };
