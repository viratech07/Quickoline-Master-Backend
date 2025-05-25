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
// Add pre-save hook only if it doesn't exist
schema.pre('save', function() {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = new Set();
    
    [this.title, this.message].forEach(text => {
        [...text.matchAll(regex)].forEach(match => vars.add(match[1]));
    });
    
    this.variables = Array.from(vars);
});

module.exports = mongoose.models.NotificationTemplate || 
                 mongoose.model('NotificationTemplate', schema);