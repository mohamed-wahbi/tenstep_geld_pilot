const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    phone:{
        type:String,
        trim:true,
        minlength:8,
        maxlength:8,
        default:null
    },
    
    profilePhoto: [{
        type: Object,
        default: {
            url: "https://yourteachingmentor.com/wp-content/uploads/2020/12/istockphoto-1223671392-612x612-1.jpg",
            publicId: null
        }
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    // To track the user's connection status:
    isConnected: {
        type: Boolean,
        default: false
    }

}
, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

// Vérification de l'inscription d'un nouvel utilisateur
function registerVerify(obj) {
    const schema = Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
        phone: Joi.string().trim().length(8).required()
    });
    return schema.validate(obj);
}

// Vérification de la connexion de l'utilisateur
function loginVerify(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required()
    });
    return schema.validate(obj);
}

module.exports = {
    User,
    registerVerify,
    loginVerify
};
