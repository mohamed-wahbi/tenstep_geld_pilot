const asyncHandler = require("express-async-handler");
const { User, registerVerify, loginVerify } = require("../models/userModel.js");
const { AuthorizedUser } = require("../models/authorizedUserModel.js")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config()

const Token_Secret = process.env.Token_Secret


/*--------------------------------------------------
* @desc    Register new User
* @router  /api/auth/register
* @methode POST
* @access  Privat
----------------------------------------------------*/
module.exports.registerCtel = asyncHandler(async (req, res) => {
  // Validation
  const { error } = registerVerify(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Verify if the user is authorized to access the platform
  const findAuthorizedUser = await AuthorizedUser.findOne({ authorizedEmail: req.body.email });
  if (!findAuthorizedUser) {
    return res.status(403).json({
        message: "You are not authorized to access this platform. Please contact the financial manager to request access."
    });
  }

  // Is user already exists
  const findUser = await User.findOne({ email: req.body.email });
  if (findUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);


  // New user and save it in DB
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone
  });
  await newUser.save();

  // Change register status of authorized user:
  const updateAuthUser = await AuthorizedUser.findOneAndUpdate(
    {authorizedEmail: req.body.email},
    {isRegistred: true},
    {new:true}
  )

  // Send a response to client
  res.status(201).json({ message: 'You registered successfully, please log in' });
});


/*--------------------------------------------------
* @desc    Login new User
* @router  /api/auth/login
* @methode POST
* @access  privat
----------------------------------------------------*/
module.exports.loginCtrl = asyncHandler(async (req, res) => {
  // Validation
  const { error } = loginVerify(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Find user by email
  const findEmailUser = await User.findOne({ email: req.body.email });
  if (!findEmailUser) {
    return res.status(400).json({ message: 'Email or password is invalid' });
  }

  // Password compare
  const passwordCompare = await bcrypt.compare(req.body.password, findEmailUser.password);
  if (!passwordCompare) {
    return res.status(400).json({ message: 'Email or password is invalid' });
  }

  // Genaration of the Token
  const token = jwt.sign(
    { id: findEmailUser._id,name: findEmailUser.name , isAdmin: findEmailUser.isAdmin},
    Token_Secret,
    { expiresIn: '8h' }
  );

  // Changing the user's connection status: :
  const updatedUser = await User.findByIdAndUpdate(
    (_id=findEmailUser._id),
    {isConnected:true},
    {new:true}
  );

  res.status(200).json({
    _id: findEmailUser._id,
    name: findEmailUser.name,
    phone : findEmailUser.phone,
    isAdmin: findEmailUser.isAdmin,
    profilePhoto: findEmailUser.profilePhoto,
    isConnected: findEmailUser.isConnected,
    token
  });
  
});

/*--------------------------------------------------
* @desc    Get All Users
* @router  /api/auth/get_all_users
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async(req,res)=>{
  const getAllUsers = await User.find({}).sort({ createdAt: -1 })

  if(getAllUsers.length === 0){
    return res.status(400).json({message:"No User regstred in data base!"})
  }

  res.status(200).json({
    getAllUsers
    
  })
})

