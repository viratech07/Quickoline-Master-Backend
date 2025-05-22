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