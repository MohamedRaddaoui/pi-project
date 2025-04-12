const {body,validationResult} = require ('express-validator');
const mongoose = require('mongoose')

// Middleware to validate MongoDB ObjectId
exports.validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }
  next();
};

//Middleware to validate Project
exports.validateProject =[
    body('title')
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({min:3})
    .withMessage("Project name must be at least 3 characters long.")
    .trim(),

    body('description')
    .notEmpty()
    .withMessage("Description is required")
    .isLength({min : 200}).withMessage("description name must be at least 200 characters long.")
    .trim(),

    body('startDate')
    .notEmpty().withMessage(" Start date is required")
    .isISO8601()  // Checks if startDate follows the ISO 8601 format.
    .withMessage("Invalid date format")
    .bail()
    .customSanitizer((value) => new Date(value))  // Convert to date object
    .custom((startDate, {req}) => {
           const endDate = new Date(req.body.endDate) // Get the endDate from the request body
           const today = new Date();
        
           // Remove time part to compare only dates
          today.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);

          if (startDate < today) {  // checks if startDate is not in the past 
           throw new Error("Start date must not be in the past.");
          }
         if (startDate >= endDate) { // checks if startDate is greater than or equal to endDate
             throw new Error("Start date must be before the end date.");
         }
         return true;

     }),
    body('endDate')
    .notEmpty().withMessage("End date is required")
    .isISO8601()  // Checks if startDate follows the ISO 8601 format.
    .withMessage("Invalid date format")
    .bail()
    .customSanitizer((value) => new Date(value))  // Convert to date object
    .custom((endDate) => {
        const today = new Date();
         // Remove time part to compare only dates
         today.setHours(0, 0, 0, 0);
         endDate.setHours(0, 0, 0, 0);

         if (endDate < today) {  // checks if endDate is not in the past 
          throw new Error("end date must not be in the past.");
      }
       return true;

      }),

    //   body('ownerID')
    //   .notEmpty().withMessage("Owner ID is required")
    //   .isMongoId() // Checks if ownerId is a valid MongoDB ObjectId
    //   .withMessage("Invalid owner ID")
    //   .customSanitizer((value)=> value.map((user) => user._id))
    //   .custom(async (ownerId) => {
    //   const existingOwnerId = await User.find({ _id: { $in: ownerId } });
    //   if (existingOwnerId.length !== users.length) {
    //     throw new Error("User not exist");
    //   }
    // }),

    body('status')
    .optional()
    .trim()
    .isIn(["Not Started","In Progress", "Done", "Canceled"])
    .withMessage("Invalid Status"),

    //   body('usersID')
    //   .customSanitizer((value) => value.map((user) => user._id)) // Extract only the user IDs
    //   .custom(async (users) => {
    //     if (users.length === 0) {
    //       throw new Error("At least one user is required");
    //       }
    //        // Database verification to check if the users exist
    // const existingUsers = await User.find({ _id: { $in: users } });
    // if (existingUsers.length !== users.length) {
    //   throw new Error("Users not exist");
    // }
    //       return true;
    
    //  }),

    //  body('tasksID')
    //  .customSanitizer((value) => value.map((task) => task._id)) // Extract only the user IDs
    //   .custom(async (tasksID) => {
    //     if (tasksID.length === 0) {
    //       throw new Error("At least one user is required");
    //       }
    //       return true;
    
    //  }),
     
    
          
// Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },



    


    
]

