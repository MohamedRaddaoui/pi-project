const yup = require("yup");

async function validate(req, res, next) {
  try {
    // Définition du schéma de validation avec yup
    const schema = yup.object().shape({
      firstname: yup
        .string()
        .min(2, "Le prénom doit avoir au moins 2 caractères")
        .required("Le prénom est requis"),
      lastname: yup
        .string()
        .min(2, "Le nom doit avoir au moins 2 caractères")
        .required("Le nom est requis"),
      email: yup
        .string()
        .email("L'email doit être valide")
        .required("L'email est requis"),
      password: yup
        .string()
        .min(6, "Le mot de passe doit comporter au moins 6 caractères")
        .required("Le mot de passe est requis"),
      role: yup
        .string()
        .oneOf(["User", "Admin", "Manager", "Developer"], "Rôle invalide")
        .required("Le rôle est requis"),
      createdAt: yup.date().default(() => new Date()), // La date doit être valide, et utilise la date actuelle si non fournie
    });

    // Validation des données du corps de la requête
    await schema.validate(req.body, { abortEarly: false });

    // Si tout est valide, passer au middleware suivant
    next();
  } catch (err) {
    // Si une erreur de validation se produit, renvoyer l'erreur avec un code 400
    res.status(400).json({
      message: "Erreurs de validation",
      errors: err.errors,
    });
  }
}

module.exports = validate;
