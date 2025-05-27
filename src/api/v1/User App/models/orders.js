const mongoose = require('mongoose')

const FinalizedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  documents: [{
    documentName: String,
    s3Url: String,
    ocrData: mongoose.Schema.Types.Mixed
  }],
  orderIdentifier: {
    type: String,
    default: ''
  },
  selectorField: {
    type: String,
    default: ''
  },
  additionalFields: {
    type: [{
      fieldName: {
        type: String,
        required: true
      },
      fieldValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      fieldType: {
        type: String,
        enum: ['text', 'number', 'date', 'select', 'boolean'],
        default: 'text'
      },
      _id: false
    }],
    default: []
  },
  trackingStatus: {
    type: String,
    default: 'Approved',
    enum: ['Approved', 'Completed']
  },
  approvedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});



const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  documents: {
    documentNumber: {
      type: String,
      required: true
    },
    p2pHash: String,
    p2pUrl: String,
    ocrData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    fileUploaded: {
      type: Boolean,
      default: false
    }
  },
  orderIdentifier: {
    type: String,
    default: ''
  },
  selectorField: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'completed',
      'rejected',
      'finalized',
      'cancelled',
      'approved',
      'payment_pending',
      'payment_completed'
    ],
    default: 'pending'
  },
  trackingStatus: {
    type: String,
    enum: [
      'Order Placed',
      'Payment Pending',
      'Payment Completed',
      'Documents Under Review',
      'Documents Rejected',
      'Review Completed',
      'Processing Started',
      'Pending Approval',
      'Approved',
      'Cancelled',
      'Completed Successfully'
    ],
    default: 'Order Placed'
  },
  chatStatus: {
    type: String,
    enum: ['Enabled', 'Disabled'],
    default: 'Enabled'
  },
  approveStatus: {
    type: String,
    enum: ['Enabled', 'Disabled'],
    default: 'Disabled'
  },
  additionalFields: {
    type: [{
      fieldName: {
        type: String,
        required: true
      },
      fieldValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      fieldType: {
        type: String,
        enum: ['text', 'number', 'date', 'select', 'boolean'],
        default: 'text'
      },
      _id: false
    }],
    default: [],
    validate: {
      validator: function(fields) {
        const fieldNames = fields.map(f => f.fieldName);
        return fieldNames.length === new Set(fieldNames).size;
      },
      message: 'Duplicate field names are not allowed'
    }
  },
  statusHistory: [{
    status: String,
    trackingStatus: String,
    chatStatus: String,
    approveStatus: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

/**
 * Utility Functions for Order Processing
 */
const orderUtils = {
    // Clear document data
    clearDocumentData: (documents) => {
        if (!documents) return [];
        return Array.isArray(documents) 
            ? documents.map(doc => ({ ...doc, ocrData: {} }))
            : { ...documents, ocrData: {} };
    },

    // Process additional fields into standard format
    formatAdditionalFields: (fields) => {
        // Handle string input (JSON parsing)
        if (typeof fields === 'string') {
            try {
                fields = JSON.parse(fields);
            } catch (e) {
                console.error('Invalid JSON in additional fields');
                return [];
            }
        }

        // Handle object input
        if (fields && !Array.isArray(fields) && typeof fields === 'object') {
            fields = Object.entries(fields).map(([name, value]) => ({
                fieldName: name,
                fieldValue: value,
                fieldType: typeof value === 'number' ? 'number' : 'text'
            }));
        }

        // Ensure array format and validate fields
        return Array.isArray(fields) 
            ? fields
                .filter(field => field && typeof field === 'object')
                .map(field => ({
                    fieldName: field.fieldName || '',
                    fieldValue: field.fieldValue || '',
                    fieldType: field.fieldType || 'text'
                }))
                .filter(field => field.fieldName && field.fieldValue)
            : [];
    },

    // Create status history entry
    createStatusHistoryEntry: (order) => ({
        status: order.status,
        trackingStatus: order.trackingStatus,
        chatStatus: order.chatStatus,
        approveStatus: order.approveStatus,
        updatedBy: order.updatedBy || order.userId,
        updatedAt: new Date()
    })
};

/**
 * Finalized Order Middleware
 */
FinalizedSchema.pre('save', function(next) {
    if (this.isNew) {
        // Clear data for new finalized orders
        this.documents = orderUtils.clearDocumentData(this.documents);
        this.additionalFields = [];
    }
    next();
});

/**
 * Review Order Middleware
 */
ReviewSchema.pre('save', function(next) {
    try {
        // Handle status changes
        if (this.isModified('status') || 
            this.isModified('trackingStatus') || 
            this.isModified('chatStatus') || 
            this.isModified('approveStatus')) {
            
            // Add status history entry
            this.statusHistory.push(orderUtils.createStatusHistoryEntry(this));

            // Clear data if order is completed or cancelled
            if (['completed', 'cancelled'].includes(this.status)) {
                this.documents = orderUtils.clearDocumentData(this.documents);
                this.additionalFields = [];
            }
        }

        // Process additional fields if modified
        if (this.isModified('additionalFields') || this.isNew) {
            this.additionalFields = orderUtils.formatAdditionalFields(this.additionalFields);
        }

        next();
    } catch (error) {
        console.error('Review order middleware error:', error);
        next(error);
    }
});

/**
 * Review Schema Methods
 */
ReviewSchema.methods.getFormattedFields = function() {
    return orderUtils.formatAdditionalFields(this.additionalFields);
};

const Review = mongoose.model('Review', ReviewSchema);
const Finalized = mongoose.model('Finalized', FinalizedSchema);

module.exports = {Review, Finalized};
