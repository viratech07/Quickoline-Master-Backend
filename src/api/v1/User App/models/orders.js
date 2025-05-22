const mongoose = require('mongoose')


const finalizedSchema = new mongoose.Schema({
userId: {
 type: mongoose.Schema.Types.ObejectId,
 ref: 'Use',
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
 selecterField: {
      type: String,
      default: ''
 },
 additionalFields: {
      type: Array,
      default: []
 },
 trackingStatus: {
    type: String,
     default: 'Approved',
     enum: ['Approved', 'Copleted']
 },
 approvedAt: {
      type: Date,
      default: Date.now
   },
      timestamps: true
});

const AdditionalFieldSchema = new mongoose.Schema({
  fieldName: {
     type: String,
     required: true
},
  fieldValue: {
     type: mongoose.Schema.Types.Mixed,
     requried: true
}, 
fieldType: {
    type: String,
    default: 'text',
    enum: ['text', 'number', 'date', 'select', 'boolean']
  },
     _id: false
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
  documentNumber:{
    type:String,
    required:true
  },
  p2pHash: {
    type: String,
    required: false
  },
  p2pUrl: {
    type: String,
    required: false
  },
  ocrData: {
    type: mongoose.Schema.Types.Mixed,
    default:{}
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
      type: string,
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
     requried: true
}, 
fieldType: {
    type: String,
    default: 'text',
    enum: ['text', 'number', 'date', 'select', 'boolean']
  },
     _id: false
 }],
    default: [],
  validate: {
      validator: function(fields) {
        // Ensure no duplicate field names
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

