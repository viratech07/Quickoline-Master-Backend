const mongoose = require('mongoose');

/**
 * Notification Template Schema
 * Handles email/SMS/push notification templates with variable substitution
 */
const NotificationTemplateSchema = new mongoose.Schema({
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
});

/**
 * Extract variables from a single template string
 * @param {string} text - Template text containing variables like {{varName}}
 * @returns {string[]} Array of variable names without duplicates
 * @example
 * extractFieldVariables("Hello {{name}}!") // returns ['name']
 */
function extractFieldVariables(text) {
    if (!text) return [];
    
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.matchAll(regex);
    return [...new Set([...matches].map(match => match[1]))];
}

/**
 * Combine variables from multiple template fields
 * @param {Object} fields - Object containing template fields
 * @returns {string[]} Combined array of unique variables
 * @example
 * extractTemplateVariables({
 *   title: "Hello {{name}}",
 *   message: "{{name}}'s order {{orderId}}"
 * }) // returns ['name', 'orderId']
 */
function extractTemplateVariables(fields) {
    const allVariables = Object.values(fields)
        .filter(Boolean)
        .flatMap(extractFieldVariables);
    
    return [...new Set(allVariables)];
}

/**
 * Pre-save middleware to automatically extract variables from title and message
 */
NotificationTemplateSchema.pre('save', function(next) {
    try {
        this.variables = extractTemplateVariables({
            title: this.title,
            message: this.message
        });
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.models.NotificationTemplate || 
                 mongoose.model('NotificationTemplate', NotificationTemplateSchema);