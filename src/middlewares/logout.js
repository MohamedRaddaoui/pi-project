const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklist");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Vérifie si le token est en blacklist
    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Token expiré. Veuillez vous reconnecter." });
    }

    // Vérifie la validité du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attacher les informations de l'utilisateur au request object
    next();  // Passer au middleware suivant
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré", error: error.message });
  }
};

module.exports = verifyToken;
