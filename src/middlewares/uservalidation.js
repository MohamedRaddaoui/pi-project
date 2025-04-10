const yup = require('yup');

async function validate(req, res, next) {
    try {
        // Définition du schéma de validation avec yup
        const schema = yup.object().shape({
            firstname: yup.string().min(2).required(), // Le prénom doit avoir au moins 2 caractères
            lastname: yup.string().min(2).required(),  // Le nom doit avoir au moins 2 caractères
            email: yup.string().email().required(),    // L'email doit être valide
            password: yup.number().positive().required(), // Le mot de passe doit être un nombre positif (à ajuster si c'est une chaîne)
            role: yup.number().min(1).max(3).required(),  // Le rôle doit être un nombre entre 1 et 3
            createdAt: yup.date().default(() => new Date()) // La date doit être valide, et utilise la date actuelle si non fournie
        });

        // Validation des données du corps de la requête
        await schema.validate(req.body);

        // Si tout est valide, passer au middleware suivant
        next();
    } catch (err) {
        // Si une erreur de validation se produit, renvoyer l'erreur avec un code 400
        res.status(400).json({ message: err.message });
    }
}

module.exports = validate;
