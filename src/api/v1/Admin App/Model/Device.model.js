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
// Index for faster queries
deviceSchema.index({ userId: 1, deviceToken: 1 }, { unique: true });

deviceSchema.pre('save', function() {
    this.lastUsed = new Date();
});

deviceSchema.statics.cleanupInactiveTokens = async function(days = 30) {
    return this.deleteMany({ 
        lastUsed: { $lt: new Date(Date.now() - days * 86400000) } 
    });
};

module.exports = mongoose.model('UserDevice', deviceSchema);