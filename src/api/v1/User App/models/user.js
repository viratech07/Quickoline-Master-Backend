const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
});

const userSchema = new mongoose.Schema({
    // Reference to Auth document (will be same as JWT subject)
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true,
        unique: true
    },

    // Display fields (cached from Auth, updated via sync)
    displayEmail: String,
    displayWhatsapp: String,
    
    // Profile Fields
    firstName: {
        type: String,
        trim: true,
        default: null
    },
    lastName: {
        type: String,
        trim: true,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    profilePicture: String,
    address: AddressSchema,

    // Feature Fields
    referCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    referralRewards: {
        type: Number,
        default: 0
    },
    referredUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Embedded Feedback Schema
    feedbacks: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            enum: ['Service', 'Bug Report', 'Suggestion', 'Other'],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        status: {
            type: String,
            enum: ['Pending', 'Reviewed', 'Resolved'],
            default: 'Pending'
        }
    }, { timestamps: true }],

    // Embedded Contact Schema
    contacts: [{
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
        },
        notes: String,
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Closed'],
            default: 'Open'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        }
    }, { timestamps: true }],

    // Sync tracking
    lastSyncedWithAuth: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes
userSchema.index({ authId: 1 });
userSchema.index({ referCode: 1 });

// Middleware for referCode generation
userSchema.pre('save', async function(next) {
    try {
        if (!this.referCode) {
            let isUnique = false;
            let newReferCode;
            
            while (!isUnique) {
                newReferCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
                const existingUser = await mongoose.models.User.findOne({ referCode: newReferCode });
                if (!existingUser) {
                    isUnique = true;
                }
            }
            
            this.referCode = newReferCode;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || 'Anonymous';
});

// Instance Methods
userSchema.methods = {
    // Get profile data including auth details
    async getFullProfile() {
        await this.populate('authId', 'email whatsappNumber role isActive');
        return {
            _id: this._id,
            email: this.authId.email,
            whatsappNumber: this.authId.whatsappNumber,
            role: this.authId.role,
            isActive: this.authId.isActive,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName,
            phone: this.phone,
            profilePicture: this.profilePicture,
            address: this.address,
            referCode: this.referCode
        };
    },

    // Sync display fields with auth
    async syncWithAuth() {
        await this.populate('authId', 'email whatsappNumber');
        this.displayEmail = this.authId.email;
        this.displayWhatsapp = this.authId.whatsappNumber;
        this.lastSyncedWithAuth = new Date();
        await this.save();
    }
};

// Static Methods
userSchema.statics = {
    // Find by auth ID (from JWT)
    async findByAuthId(authId) {
        return await this.findOne({ authId })
            .populate('authId', 'email whatsappNumber role isActive');
    },

    // Create new user profile
    async createProfile(authId, profileData) {
        const user = new this({
            authId,
            ...profileData
        });
        await user.syncWithAuth();
        return user;
    }
};

// Clear existing model if it exists
if (mongoose.models.User) {
    delete mongoose.models.User;
}

const User = mongoose.model('User', userSchema);

module.exports = User;