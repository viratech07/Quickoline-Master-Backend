const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceToken: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        enum: ['android', 'ios', 'web'],
        default: 'android'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
