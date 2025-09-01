const asyncHandler = require("express-async-handler");
const { AuthorizedUser, validateAuthUser } = require("../models/authorizedUserModel.js");
const { User } = require("../models/userModel.js");

/*--------------------------------------------------
* @desc    Create new authorization for a new platform user
* @route   POST /api/authorization/create
* @access  Admin only
----------------------------------------------------*/
module.exports.createAuthorizationCrtl = asyncHandler(async (req, res) => {
    // Validation with Joi
    const { error } = validateAuthUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if the email is already authorized
    const existingAuthEmail = await AuthorizedUser.findOne({ authorizedEmail: req.body.email });
    if (existingAuthEmail) {
        return res.status(400).json({ message: "This email is already authorized." });
    }

    // Create new email authorization
    const newAuthorizedUser = await AuthorizedUser.create({
        authorizedEmail: req.body.email,
    });

    res.status(201).json({
        message: "Your authorization has been successfully created.",
        newAuthorizedUser,
    });
});


/*--------------------------------------------------
* @desc    Get all authorized platform users
* @route   GET /api/authorization/get_all
* @access  Admin only
----------------------------------------------------*/
module.exports.getAllAuthCtrl = asyncHandler(async (req, res) => {
    const allAuthorizedUsers = await AuthorizedUser.find({}).sort({ createdAt: -1 });

    // if (allAuthorizedUsers.length === 0) {
    //      res.status(404).json({
    //         message: "No authorized users found. Please create one.",
    //     });
    // }

    res.status(200).json({
        allAuthorizedUsers,
    });
});







/*--------------------------------------------------
* @desc    Delete one authorized user
* @route   DELETE /api/authorization/delete_one/:id
* @access  Admin only
----------------------------------------------------*/
module.exports.deleteOneAuthorizationCrtl = asyncHandler(async (req, res) => {
    // Check if the authorization exists in the database
    const authorizedUser = await AuthorizedUser.findById(req.params.id);
    if (!authorizedUser) {
        return res.status(404).json({ message: "This authorized user does not exist!" });
    }

    const userRegistred = await User.findOne({email: authorizedUser.authorizedEmail})
    
if (userRegistred) {        
        await User.findOneAndDelete({email: authorizedUser.authorizedEmail});
     }
    // Remove the found email authorization and the registred user
    await AuthorizedUser.findByIdAndDelete(req.params.id);

    

    res.status(200).json({
        message: "Authorization and User deleted successfully.",
    });
});
