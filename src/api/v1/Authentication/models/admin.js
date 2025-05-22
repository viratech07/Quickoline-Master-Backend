const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        required: true,
        enum: ['app_admin', 'web_admin', 'senior_admin', 'super_admin']
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

const comparePasswords = async (plain, hashed) => {
    return await bcrypt.compare(plain, hashed);
};


const Admin = mongoose.model('Admin', AdminSchema);

module.exports = { Admin, hashPassword, comparePasswords };
