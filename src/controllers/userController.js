const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Blacklist = require("../models/blacklist");
const sendEmail = require("../../utils/sendEmail");

dotenv.config();

async function adduser(req, res) {
  try {
    const { firstname, lastname, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    res.status(201).json({ message: "Utilisateur ajouté avec succès" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function showuser(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function showById(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteuser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateuser(req, res) {
  try {
    const { firstname, lastname, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstname, lastname, email, role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email non trouvé" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ error: "Compte inactif" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    // Générer un code 2FA
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.twoFACode = code;
    user.twoFACodeExpires = expiration;
    await user.save();

    // Envoi du code 2FA par email
    try {
      await sendEmail(
        user.email,
        "Code de vérification 2FA",
        `Voici votre code de vérification : ${code} (valide 10 minutes).`
      );
      res.status(200).json({
        message: "Code 2FA envoyé par email",
        email: user.email,
      });
    } catch (emailError) {
      console.log("Erreur lors de l'envoi de l'email:", emailError);
      return res.status(500).json({ error: "Erreur d'envoi de l'email" });
    }
  } catch (err) {
    console.log("Erreur dans la fonction login:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function verify2FA(req, res) {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.twoFACode || !user.twoFACodeExpires) {
      return res
        .status(400)
        .json({ error: "Code non généré ou utilisateur introuvable" });
    }

    if (user.twoFACode !== code) {
      return res.status(400).json({ error: "Code incorrect" });
    }

    // Vérifier si le code est expiré
    if (user.twoFACodeExpires < new Date()) {
      return res.status(400).json({ error: "Code expiré" });
    }

    // Supprimer le code 2FA une fois validé
    user.twoFACode = undefined;
    user.twoFACodeExpires = undefined;
    await user.save();

    // Générer un token JWT pour l'utilisateur
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1000h" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

const logout = (req, res) => {
  res.clearCookie("token"); // Efface le cookie contenant le token
  return res.status(200).json({ message: "Déconnexion réussie" });
};

// Réinitialisation de mot de passe

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `http://localhost:5000/api/users/reset-password/${token}`;
    await sendEmail(
      email,
      "Réinitialisation de mot de passe",
      `
        <p>Bonjour,</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetLink}">${resetLink}</a>
        <p><strong>Ce lien expirera dans 15 minutes.</strong></p>
      `
    );

    res.json({ message: "Email de réinitialisation envoyé !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 2. Mettre à jour le mot de passe avec le token (fonction déjà ajoutée)
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(decoded.id, {
      password: hashedPassword,
    });

    res.json({ message: "Mot de passe mis à jour avec succès !" });
  } catch (err) {
    res.status(400).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = {
  adduser,
  showuser,
  showById,
  deleteuser,
  updateuser,
  login,
  verify2FA,
  logout,
  forgotPassword,
  resetPassword,
};
