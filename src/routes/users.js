var express = require("express");
var router = express.Router();
var usercontroller = require("../controllers/userController.js");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/user");

/* CRUD */
router.post("/adduser", usercontroller.adduser);
router.get("/showuser", usercontroller.showuser);
router.delete("/deleteuser/:id", usercontroller.deleteuser);
router.put("/updateuser/:id", usercontroller.updateuser);

// Endpoint pour la connexion avec 2FA
router.post("/login", usercontroller.login);

// Endpoint pour activer la 2FA (générer la clé secrète et le QR code)
router.post("/enable-2fa", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId requis" });

    // Générer une clé secrète
    const secret = speakeasy.generateSecret({ name: "MonApp" });

    // Mettre à jour l'utilisateur avec la clé secrète et activer 2FA
    await User.findByIdAndUpdate(userId, {
      twoFASecret: secret.base32,
      isTwoFAEnabled: true,
    });

    // Générer un QR Code à partir de l'URL d'authentification
    QRCode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
      if (err) return res.status(500).json({ error: "Erreur lors de la génération du QR Code" });
      res.json({ message: "2FA activé", secret: secret.base32, qrCode: imageUrl });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour vérifier le code 2FA
router.post("/verify-2fa", async (req, res) => {
  const { userId, token } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.isTwoFAEnabled) {
      return res.status(400).json({ error: "2FA non activé" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: token
    });

    if (verified) {
      res.json({ message: "Code valide, accès accordé" });
    } else {
      res.status(400).json({ error: "Code invalide" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la vérification du code" });
  }
});

module.exports = router;
