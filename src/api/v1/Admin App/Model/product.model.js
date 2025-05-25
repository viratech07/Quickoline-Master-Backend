const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['Documentation', 'Legal', 'Financial', 'Education', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  visitLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  requiredDocuments: [{
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true
    },
    requiresOCR: {
      type: Boolean,
      default: false
    },
    compressionSettings: {
      fileSize: {
        type: Number,
        required: [true, 'File size is required'],
        default: 5  // 5MB
      },
      format: {
        type: String,
        required: [true, 'Format is required'],
        enum: ['jpg', 'jpeg', 'png', 'pdf'],
        default: 'pdf'
      },
      allowedFormats: [{
        type: String,
        enum: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        default: ['pdf']
      }]
    }
  }],
  customDropdowns: [{
    label: {
      type: String,
      required: [true, 'Dropdown label is required'],
      trim: true
    },
    options: [{
      label: {
        type: String,
        required: [true, 'Option label is required'],
        trim: true
      },
      documents: [{
        type: String,
        trim: true
      }]
    }]
  }],
  applicationDetails: {
    type: Map,
    of: String,
    default: new Map()
  },
  additionalFields: {
    type: Map,
    of: {
      label: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['text', 'number', 'date', 'select', 'file'],
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      placeholder: String,
      options: [String]
    },
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
ProductSchema.index({ category: 1 });
ProductSchema.index({ title: 'text', description: 'text' });

ProductSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price?.toFixed(2) || '0.00'}`;
});

ProductSchema.methods.isComplete = function() {
  return Boolean(this.title && this.description && this.price && this.category);
};

ProductSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Title cannot be empty'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['Documentation', 'Legal', 'Financial', 'Education', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Description cannot be empty'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  visitLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  requiredDocuments: [{
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true
    },
    requiresOCR: {
      type: Boolean,
      default: false
    },
    compressionSettings: {
      fileSize: {
        type: Number,
        required: [true, 'File size is required'],
        default: 5  // 5MB
      },
      format: {
        type: String,
        required: [true, 'Format is required'],
        enum: ['jpg', 'jpeg', 'png', 'pdf'],
        default: 'pdf'
      },
      allowedFormats: [{
        type: String,
        enum: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        default: ['pdf']
      }]
    }
  }],
  customDropdowns: [{
    label: {
      type: String,
      required: [true, 'Dropdown label is required'],
      trim: true
    },
    options: [{
      label: {
        type: String,
        required: [true, 'Option label is required'],
        trim: true
      },
      documents: [{
        type: String,
        trim: true
      }]
    }]
  }],
  applicationDetails: {
    type: Map,
    of: String,
    default: new Map()
  },
  additionalFields: {
    type: Map,
    of: {
      label: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['text', 'number', 'date', 'select', 'file'],
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      placeholder: String,
      options: [String]
    },
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance

ProductSchema.index({ category: 1 });
ProductSchema.index({ title: 'text', description: 'text' });

ProductSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price?.toFixed(2) || '0.00'}`;
});

ProductSchema.methods.isComplete = function() {
  return Boolean(this.title && this.description && this.price && this.category);
};

ProductSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

ProductSchema.pre('save', function(next) {
  if (!this.title || !this.description || !this.price || !this.category) {
    this.invalidate('title', 'Title is required');
    this.invalidate('description', 'Description is required');
    this.invalidate('price', 'Price is required');
    this.invalidate('category', 'Category is required');
  }
  next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);