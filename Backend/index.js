// create server
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();

const comp = require("./model/index");

//end create server

require("dotenv").config(); // .env

// database
const database = require("./config/database");
const port = process.env.PORT;
database.connectToDatabase();
//end database

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
    origin: "http://localhost:5173",
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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store io instance in app for use in other modules (e.g., controllers)
app.set("socketio", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join auction room
  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId);
    console.log(`User ${socket.id} joined auction ${auctionId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// run server
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
