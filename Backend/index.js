// create server
const express = require("express");

const app = express();

const comp = require("./model/index");

//end create server

require("dotenv").config(); // .env

// database
const database = require("./config/database");
const port = process.env.PORT;
database.connectToDatabase();
//end database

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

// run server
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
