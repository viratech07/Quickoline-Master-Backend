const mongoose = require('mongoose');

// Check if model exists before defining
const NotificationTemplate = mongoose.models.NotificationTemplate || mongoose.model('NotificationTemplate', new mongoose.Schema({
    type: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    variables: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
}));