var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var cors=require('cors')
var logger = require("morgan");
require("dotenv").config();
const setupSwagger = require("./swagger");

// Importation des tâches cron
require('./cron/deadlineReminderJob'); // Assure-toi que le chemin est correct

require('./cron/exportProjectSummary');

const corsOptions = {
    origin: "*", // Attention: à modifier en production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  };
  

// Use the base URL from the .env file for all routes
const baseUrl = process.env.BASE_URL || "/api"; // Default to '/api' if not specified

var indexRouter = require("./src/routes/index");


var app = express();
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));


// view engine setup
app.set("view engine", "jade");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(baseUrl + "/", indexRouter);
app.use('/uploads', express.static('uploads'));
setupSwagger(app); // Setup Swagger
app.set("view engine", "twig");

// Indiquer le dossier contenant les vues
app.set("views", path.join(__dirname, "views"));


module.exports = app;
