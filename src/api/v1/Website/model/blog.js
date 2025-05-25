const mongoose = require('mongoose');
const slugify = require('slugify');
const mongoosePaginate = require('mongoose-paginate-v2');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    name: {
      type: String,
      required: true
    },
    employeeId: {
      type: String,
      required: true
    }
  },
  featured_image: {
    type: String,
    required: false,
    default: null
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  published: {
    type: Boolean,
    default: false
  },
  meta: {
    description: String,
    keywords: [String]
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: String,
  featured_image: {
    type: String,
    required: false,
    default: null
  },
  published: {
    type: Boolean,
    default: false
  },
  meta: {
    description: String,
    keywords: [String]
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: String
}, { timestamps: { createdAt: 'created_at' } });

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: String
}, { timestamps: { createdAt: 'created_at' } });

const PrivacyPolicySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Privacy policy content is required']
  },
  version: {
    type: String,
    required: [true, 'Version number is required'],
    unique: true
  },
  effectiveDate: {
    type: Date,
    required: [true, 'Effective date is required']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  changelog: {
    type: String,
    required: [true, 'Changelog is required']
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});


// Add pagination plugin
PostSchema.plugin(mongoosePaginate);
PageSchema.plugin(mongoosePaginate);
CategorySchema.plugin(mongoosePaginate);
TagSchema.plugin(mongoosePaginate);
PrivacyPolicySchema.plugin(mongoosePaginate);

function addSlugGeneration(schema, sourceField = 'title') {
  schema.pre('save', function (next) {
    if (this.isModified(sourceField)) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const baseSlug = this[sourceField];
      this.slug = `${slugify(baseSlug, { lower: true })}-${timestamp}-${randomString}`;
    }
    next();
  });
}
// Add population options for Post model
PostSchema.pre('find', function() {
  this.populate('categories tags');
});

PostSchema.pre('findOne', function() {
  this.populate('categories tags');
});

// This virtual property 'formattedDate' adds a computed field to the Post schema
// It converts the created_at timestamp into a localized date string
// Example: If created_at is "2023-12-25T08:30:00Z", formattedDate might return "12/25/2023"
// The virtual field is not stored in the database but computed on-the-fly when accessed
PostSchema.virtual('formattedDate').get(function() {
  return new Date(this.created_at).toLocaleDateString();
});

// Middleware to ensure only one active version exists
PrivacyPolicySchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});





 const Post = mongoose.model('Post', PostSchema)
 const Page = mongoose.model('Page', PageSchema)
 const Category = mongoose.model('Category', CategorySchema)
 const Tag = mongoose.model('Tag', TagSchema)
 const PrivacyPolicy = mongoose.model('PrivacyPolicy', PrivacyPolicySchema)



module.exports = {
    Post,
    Page,
    Category,
    Tag,
    PrivacyPolicy
};