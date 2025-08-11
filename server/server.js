'use strict';
require("dotenv").config();

const PORT = process.env.PORT || 3010;
const cors = require("cors");
const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket = require('./module/socket');
const io = socket.init(server);

// Middlewares
app.use(express.json());
app.use(cors());
const auth = require("./middleware/auth");

// Rate Limiting
const limiter = require('express-rate-limit');
const rateLimiter = limiter({
  windowMs: 1 * 60 * 1000,
  max: 10
});
app.use((req, res, next) => {
  if (req.method === 'POST') {
    rateLimiter(req, res, next);
  } else {
    next();
  }
});

// socket
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinReqResponse", (userId) => {
    socket.join(userId); 
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routes
const register = require("./routes/OAUTH/register");
const login = require('./routes/OAUTH/login');
const resetCode = require('./routes/OAUTH/resetCode');
const passwordReset = require('./routes/OAUTH/passwordReset');
const accDeletion = require('./routes/routers/accDeletion');
const usersData = require('./routes/routers/usersData');
const { Org, db } = require('./db');
const organizationLeaders = require('./routes/routers/organizationMembers');
const joinReqs = require('./routes/routers/joinReqs'); 
const notifications=require('../server/routes/routers/notifications')

app.get('/orgs', async (req, res) => {
  const orgs = await Org.findAll({ where: { is_private: false } });
  if (!orgs || orgs.length === 0) {
    return res.status(404).json({ error: 'No public organizations found' });
  }
  res.status(200).json({ orgs });
});

app.use('/users', usersData);
app.use('/register', register);
app.use('/login', login);
app.use('/resetCode', resetCode);
app.use('/password-reset', passwordReset);

app.use(auth);
app.get('/auth', (req, res) => {
  return res.status(200).json({ message: 'authorized' });
});
app.use('/join-req', joinReqs);
app.use('/delete', accDeletion);
app.use('/notifications',notifications)
app.use('/org-tasks', organizationLeaders);

// Start server
async function start() {
  try {
    await db.sync({ alter: true });

    server.listen(PORT, () => {
      console.log(` Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
  }
}

module.exports = {
  app,
  start,
  io
};
