const http = require("http");
const socketIo = require("socket.io");
const app = require("./app"); // Express app
const connectDB = require("./src/config/config"); // DB connection

const PORT = process.env.PORT || 3000;

// Connexion à MongoDB
connectDB();

// Création du serveur HTTP avec Express
const server = http.createServer(app);

// Initialisation de Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*", // à ajuster selon ton frontend
    methods: ["GET", "POST"]
  }
});

// Rendre io accessible ailleurs (dans les controllers par ex.)
app.set("io", io);
module.exports = { server, io };

// Gestion des connexions Socket.io
io.on("connection",async (socket) => {
  console.log(`🔌 Utilisateur connecté : ${socket.id}`);

   socket.on("join", (userId) => {
    console.log(`Utilisateur ${userId} a rejoint la room`);
    socket.join(userId); // L'utilisateur rejoint sa room spécifique
  });

  // Émission de la notification sur taskUpdate
  socket.on("taskUpdated", (taskData) => {
    // Emit à la room spécifique de l'utilisateur
    io.to(taskData.userId).emit("taskUpdated", {
      message: taskData.message,
      taskId: taskData.taskId,
    });
    console.log("Task updated notification envoyée à", taskData.userId);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Utilisateur déconnecté : ${socket.id}`);
  });
});

// Lancer le serveur
server.listen(PORT, () => {
  if (process.env.NODE_ENV !== "prod") {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  }
});

// Shutdown propre
process.on("SIGINT", () => {
  server.close(() => {
    if (process.env.NODE_ENV !== "prod") {
      console.log("🛑 Server Closed.");
    }
    process.exit(0);
  });
});
