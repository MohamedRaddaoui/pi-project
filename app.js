var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const setupSwagger = require("./swagger");

// Importation des tâches cron
require('./cron/deadlineReminderJob'); // Assure-toi que le chemin est correct

// Use the base URL from the .env file for all routes
const baseUrl = process.env.BASE_URL || "/api"; // Default to '/api' if not specified

var indexRouter = require("./src/routes/index");

var app = express();

// view engine setup
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(baseUrl + "/", indexRouter);
setupSwagger(app); // Setup Swagger
app.set("view engine", "twig");

// Indiquer le dossier contenant les vues
app.set("views", path.join(__dirname, "views"));

module.exports = app;
