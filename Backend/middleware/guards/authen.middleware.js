const { verifyToken } = require("@clerk/backend");
const { Clerk } = require("@clerk/clerk-sdk-node");
const { clerkClient } = require("../../config/clerk");

module.exports.authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies.__session || req.headers?.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const tokenPayload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const user = await clerkClient.users.getUser(tokenPayload.sub);

    req.user = user;

    console.log(user);

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
