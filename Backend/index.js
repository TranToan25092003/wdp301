// create server
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const mongoose = require("mongoose");

const comp = require("./model/index");

//end create server

require("dotenv").config(); // .env

// database
const database = require("./config/database");
const port = process.env.PORT;
database.connectToDatabase();
//end database

// Define Chat schema
const chatSchema = new mongoose.Schema({
  roomId: String,
  participants: [String],
  messages: [
    {
      senderId: String,
      content: String,
      timestamp: Date,
    },
  ],
  lastMessage: String,
  lastMessageTime: Date,
  unreadCounts: {
    type: Map,
    of: Number,
    default: new Map(),
  },
});

const Chat = mongoose.model("Chat", chatSchema);

// check health
const cron = require("node-cron");
cron.schedule("* * * * *", async () => {
  try {
    await comp.Test.find({});

    console.log("system is healthy 💪💪💪");
  } catch (error) {
    console.log("System is broken 😰😰😰");
  }
});
// end check health

// body parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
// end body parser

// cors
const cors = require("cors");
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
  })
);
//end cors

// cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());
//end cookie-parser

// client router
const clientRouter = require("./API/client/index.router");
clientRouter(app);
// admin router

// admin router
const adminRouter = require("./API/admin/index.router");
adminRouter(app);
// admin router

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Swagger

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  pingTimeout: 10000,
  pingInterval: 5000,
  connectTimeout: 10000,
  path: "/socket.io",
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  // Join auction room
  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId);
    console.log(`User ${socket.id} joined auction ${auctionId}`);
  });

  // Leave auction room
  socket.on("leaveAuction", (auctionId) => {
    socket.leave(auctionId);
    console.log(`User ${socket.id} left auction ${auctionId}`);
  });

  // Join chat room
  socket.on("joinChat", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined chat ${roomId}`);
    // Notify room that user joined
    io.to(roomId).emit("userJoined", { userId: socket.id });
  });

  // Leave chat room
  socket.on("leaveChat", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left chat ${roomId}`);
    // Notify room that user left
    io.to(roomId).emit("userLeft", { userId: socket.id });
  });

  // Load chat list
  socket.on("loadChatList", async (userId, callback) => {
    try {
      console.log(`Loading chat list for user ${userId}`);
      const chats = await Chat.find({
        participants: userId,
      }).sort({ lastMessageTime: -1 });

      const chatList = chats.map((chat) => ({
        roomId: chat.roomId,
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        timestamp: chat.lastMessageTime,
        unreadCount: chat.unreadCounts.get(userId) || 0,
      }));

      console.log(`Found ${chatList.length} chats for user ${userId}`);
      callback(chatList);
    } catch (error) {
      console.error("Error loading chat list:", error);
      callback({ error: error.message });
    }
  });

  // Load messages for a specific chat
  socket.on("loadMessages", async (roomId, callback) => {
    try {
      console.log(`Loading messages for room ${roomId}`);
      const chat = await Chat.findOne({ roomId });
      if (chat) {
        console.log(`Found ${chat.messages.length} messages in room ${roomId}`);
        callback(chat.messages);
      } else {
        console.log(`No messages found for room ${roomId}`);
        callback([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      callback({ error: error.message });
    }
  });

  // Handle new message
  socket.on("sendMessage", async (messageData, callback) => {
    try {
      console.log("Received message:", messageData);
      const { roomId, senderId, receiverId, content, timestamp } = messageData;

      if (!roomId || !senderId || !receiverId || !content) {
        throw new Error("Missing required message data");
      }

      // Find or create chat
      let chat = await Chat.findOne({ roomId });
      if (!chat) {
        chat = new Chat({
          roomId,
          participants: [senderId, receiverId],
          messages: [],
          unreadCounts: new Map([[receiverId, 0]]),
        });
      }

      // Add message
      const newMessage = {
        senderId,
        content,
        timestamp,
      };
      chat.messages.push(newMessage);
      chat.lastMessage = content;
      chat.lastMessageTime = timestamp;

      // Update unread count for receiver
      const currentUnread = chat.unreadCounts.get(receiverId) || 0;
      chat.unreadCounts.set(receiverId, currentUnread + 1);

      await chat.save();
      console.log(`Message saved and emitted to room ${roomId}`);

      // Emit to all users in the room
      io.to(roomId).emit("newMessage", newMessage);

      // Send success callback
      callback(null);
    } catch (error) {
      console.error("Error sending message:", error);
      callback(error.message);
    }
  });

  // Mark messages as read
  socket.on("markAsRead", async (data) => {
    try {
      const { roomId, userId } = data;
      console.log(
        `Marking messages as read for user ${userId} in room ${roomId}`
      );
      await Chat.updateOne(
        { roomId },
        { $set: { [`unreadCounts.${userId}`]: 0 } }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
  });
});

// run server
server.listen(port, () => {
  console.log(`Server is running at port ${port} with Socket.IO enabled`);
});
