var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

/* CRUD */
router.post("/adduser", userController.adduser);
router.get("/showuser", auth, userController.showuser); // Obtenir tous les utilisateurs
router.get("/showById/:id", userController.showById); // Obtenir un utilisateur spécifique par ID
router.delete("/deleteuser/:id", userController.deleteuser);
router.put("/updateuser/:id", userController.updateuser);

// Route pour la connexion avec 2FA
router.post("/login", userController.login);

// Endpoint pour vérifier le code 2FA
router.post("/verify-2fa", userController.verify2FA);

// Route de déconnexion
router.post("/logout", userController.logout);

router.post("/forgot-password", userController.forgotPassword);

router.post("/reset-password/:token", userController.resetPassword);

router.post("/find-by-email", userController.getUserByEmail);

module.exports = router;
