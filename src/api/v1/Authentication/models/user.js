const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    whatsappNumber: {
        type: String,
        required: [true, 'WhatsApp number is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    },
    
    role: {
        type: String,
        default: 'user',
        enum: ['user']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true,
    strict: true,
    validateBeforeSave: true
});

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

const comparePasswords = async (plain, hashed) => {
    return await bcrypt.compare(plain, hashed);
};


const User = mongoose.model('User', userSchema);

module.exports = { User, hashPassword, comparePasswords };
