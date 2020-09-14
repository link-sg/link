const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const getChat = require("./utils/getChat");

// set up socket.io for live chat
const app = express();
//const server = require("http").createServer(app);
const server = app.listen(5000);
const io = require("socket.io").listen(server);
let usersOnChatPage = [];

const searchRoutes = require("./routes/search-routes");
const listingRoutes = require("./routes/listing-routes");
const userRoutes = require("./routes/user-routes");
const gameRoutes = require("./routes/game-routes");
const chatRoutes = require("./routes/chat-routes");

io.on("connection", function (socket) {
  // runs when the connection is first established at the chat page
  const socketHeader = socket.handshake.headers.cookie;
  if (!socketHeader.includes("access_token")) {
    socket.emit("loggedIn", false);
  } else {
    socket.emit("loggedIn", true);
    const userID = getChat.decodeHeader(socketHeader);
    socket.emit("Error");

    getChat
      .getChatLogsOverview(userID)
      .then((chats) => socket.emit("chatOverview", chats));
  }

  /*
  socket.on("getChatSpecific", function(data,callback){
    const socketHeader = socket.handshake.headers.cookie;
    if (!socketHeader.includes("access_token")) {
      socket.emit("loggedIn", false);
    } else {
      socket.emit("loggedIn", true);
      let userID;
      try {
        userID = getChat.decodeHeader(socketHeader);
      } catch (err) {
        socket.emit("Error");
      }

      getChat.getChatLogSpecific(userID)
  }});

  socket.on("newMessage", function (data, callback) {
    console.log("newMessage", data);
  }); */

  socket.on("error", () => {
    socket.emit(
      "serverError",
      "There are some issues with the chat server right now"
    );
  });
});

app.use(bodyParser.json());

app.use("/images", express.static("images"));

// Boilerplate to bypass CORS
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": req.headers.origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, *",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE",
  });

  next();
});

app.use(cookieParser());

// api requests for searches/filters
app.use("/api/search", searchRoutes);

// api requests for listings
app.use("/api/listing", listingRoutes);

// api requests for user info/ login/signup
app.use("/api/user", userRoutes);

// api requests for images of games
app.use("/api/game", gameRoutes);

app.use("/api/chat", chatRoutes);

// if api calls a wrong address
app.use((req, res, next) => {
  const error = new Error(
    "API endpoint not valid. Note that it is case sensitive"
  );
  error.status = 400;

  return next(error);
});

// custom error handler if any middleware threw an error
app.use((error, req, res, next) => {
  // delete profile pic that have been added if theres an error
  if (req.file) {
    fs.unlink(req.file.path);
  }

  // calls express' default error handler if res has already been sent
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.status || 500);
  res.json({
    message: error.message || "An unknown error has occured on the server",
    status: error.status || 500,
  });
});

mongoose
  .connect(
    "mongodb+srv://admin:8cfrMF1Y6UCM5nc0@linkdb.f9q9h.mongodb.net/users?retryWrites=true&w=majority",
    // avoid some deprecation warnings
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .catch((err) => {
    console.log(err);
  });
