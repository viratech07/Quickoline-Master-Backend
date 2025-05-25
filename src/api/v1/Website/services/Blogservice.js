const { Post, Page, Category, Tag } = require('../model/blog.model');
const slugify = require('slugify');



//  +++++++++++++++++++  Post Services ++++++++++++++++++++

exports.createPost = async (postData) => {
    try {
        // Process featured image
        postData.featured_image = postData.featured_image?.hash || postData.featured_image?.url;

        // Validate IDs helper
        const validateIds = async (model, ids, name) => {
            if (ids?.length) {
                const valid = await model.find({ _id: { $in: ids } });
                if (valid.length !== ids.length) throw new Error(`Invalid ${name} IDs`);
            }
        };

        await Promise.all([
            validateIds(Category, postData.categories, 'category'),
            validateIds(Tag, postData.tags, 'tag')
        ]);

        return await Post.create(postData);
    } catch (error) {
        throw new Error(`Post creation failed: ${error.message}`);
    }
}

// Post Services
exports.getAllPosts = async (queryParams = {}) => {
    try {
        /**
         * STEP 1: Process Client Query Parameters
         * Example client request: GET /api/posts?page=2&limit=20&category=tech&status=published
         * queryParams: Raw data from the client/request (HTTP query parameters)
         */
        const {
            // Pagination params (from URL query string)
            page = 1,        // ?page=2
            limit = 10,      // ?limit=20
            sort = '-created_at',  // ?sort=-created_at (descending) or created_at (ascending)

            // Filter params (from URL query string)
            status,         // ?status=published
            category,       // ?category=tech
            tag,           // ?tag=javascript
            author,        // ?author=12345
            isPublished = true  // ?isPublished=true
        } = queryParams;

        /**
         * STEP 2: Build MongoDB Query Filters
         * Converts client filters to MongoDB query syntax
         * Example MongoDB query: { published: true, categories: 'tech', status: 'published' }
         */
        const filters = {};

        // Set base published status
        if (isPublished !== undefined) {
            filters.published = isPublished;  // MongoDB: { published: true }
        }

        // Map client filters to MongoDB fields
        const filterMapping = {
            status: { 
                field: 'status',           // MongoDB field name
                value: status              // Client value
            },
            category: { 
                field: 'categories',       // References Category model via ObjectId
                value: category
            },
            tag: { 
                field: 'tags',            // References Tag model via ObjectId
                value: tag
            },
            author: { 
                field: 'author.employeeId',  // Nested field in Post model
                value: author
            }
        };

        // Build filters dynamically
        Object.entries(filterMapping).forEach(([clientParam, mongoField]) => {
            if (mongoField.value) {
                filters[mongoField.field] = mongoField.value;
            }
        });

        /**
         * STEP 3: Configure MongoDB/Mongoose Options
         * Sets up pagination, sorting, and field selection
         * options: Formatted data for MongoDB/Mongoose pagination
         */
        const mongooseOptions = {
            // Pagination settings
            page: Math.max(1, parseInt(page)),     // Ensure minimum page is 1
            limit: Math.min(100, Math.max(1, parseInt(limit))), // Limit between 1-100

            // Sort settings
            sort,

            // Field population (resolving references)
            populate: [
                { 
                    path: 'categories',    // Field to populate
                    select: 'name slug'    // Fields to return
                },
                { 
                    path: 'tags',          // Field to populate
                    select: 'name slug'    // Fields to return
                }
            ],
            
            // Exclude unnecessary fields
            select: '-__v'  // Exclude version key
        };

        /**
         * STEP 4: Execute Query
         * Use mongoose-paginate-v2 plugin to execute query with pagination
         */
        const result = await Post.paginate(filters, mongooseOptions);

        /**
         * STEP 5: Transform for Client Response
         * Format the data for API response
         */
        return {
            posts: result.docs,
            pagination: {
                total: result.totalDocs,      // Total documents in collection
                currentPage: result.page,     // Current page number
                totalPages: result.totalPages, // Total number of pages
                limit: result.limit,          // Documents per page
                hasNextPage: result.hasNextPage,  // More pages after this?
                hasPrevPage: result.hasPrevPage  // More pages before this?
            }
        };
    } catch (error) {
        throw new Error(`Failed to fetch posts: ${error.message}`);
    }
}

exports.getPostById = async (postId) => {
    try {
        const post = await Post.findById(postId)
            .populate(['categories', 'tags']);

        if (!post) throw new Error('Post not found');
        return post;
    } catch (error) {
        throw new Error(`Post fetch failed: ${error.message}`);
    }
}


exports.updatePost = async (postId, updateData) => {
    try {
        // Process featured image
        updateData.featured_image = updateData.featured_image?.hash || updateData.featured_image?.url;

        // Generate slug if title changes
        if (updateData.title) {
            updateData.slug = `${slugify(updateData.title, { lower: true })}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            updateData,
            { new: true, runValidators: true }
        ).populate(['categories', 'tags']);

        return post || Promise.reject('Post not found');
    } catch (error) {
        throw new Error(`Post update failed: ${error.message}`);
    }
}

exports.deletePost = async (postId) => {
    try {
        const post = await Post.findByIdAndDelete(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        return true;
    } catch (error) {
        throw new Error(`Error deleting post: ${error.message}`);
    }
}

exports.searchPosts = async (searchQuery) => {
    try {
        const regex = new RegExp(searchQuery, 'i');
        return await Post.find({
            published: true,
            $or: [{ title: regex }, { content: regex }]
        })
            .populate(['categories', 'tags'])
            .sort('-created_at');
    } catch (error) {
        throw new Error(`Search failed: ${error.message}`);
    }
}

// +++++++++++++++ Category Services ++++++++++++++++++++

exports.createCategory = async (categoryData) => {
    try {
        return await Category.create(categoryData);
    } catch (error) {
        throw new Error(`Category creation failed: ${error.message}`);
    }
}

exports.getAllCategories = async () => {
    try {
        return await Category.find().sort('name');
    } catch (error) {
        throw new Error(`Category fetch failed: ${error.message}`);
    }
}


exports.updateCategory = async (categoryId, updateData) => {
    try {
        const category = await Category.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        );
        return category || Promise.reject('Category not found');
    } catch (error) {
        throw new Error(`Category update failed: ${error.message}`);
    }
}


exports.deleteCategory = async (categoryId) => {
    try {
        if (await Post.exists({ categories: categoryId })) {
            throw new Error('Category in use - cannot delete');
        }

        const result = await Category.deleteOne({ _id: categoryId });
        if (result.deletedCount === 0) throw new Error('Category not found');

        return true;
    } catch (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

// ++++++++++++++++++ Tag Services ++++++++++++++++++++

exports.createTag = async (tagData) => {
    try {
        return await Tag.create(tagData);
    } catch (error) {
        throw new Error(`Tag creation failed: ${error.message}`);
    }
}

exports.getAllTags = async () => {
    try {
        return await Tag.find().sort('name');
    } catch (error) {
        throw new Error(`Tag fetch failed: ${error.message}`);
    }
}


exports.getTagById = async (tagId) => {
    try {
        return await Tag.findById(tagId) || Promise.reject('Tag not found');
    } catch (error) {
        throw new Error(`Tag fetch failed: ${error.message}`);
    }
}

exports.updateTag = async (tagId, updateData) => {
    try {
        return await Tag.findByIdAndUpdate(
            tagId,
            updateData,
            { new: true, runValidators: true }
        ) || Promise.reject('Tag not found');
    } catch (error) {
        throw new Error(`Tag update failed: ${error.message}`);
    }
}

exports.deleteTag = async (tagId) => {
    try {
        if (await Post.exists({ tags: tagId })) {
            throw new Error('Tag in use - cannot delete');
        }

        const { deletedCount } = await Tag.deleteOne({ _id: tagId });
        if (!deletedCount) throw new Error('Tag not found');

        return true;
    } catch (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}


//  ++++++++++++++++= Page Services ++++++++++++++++++=

exports.createPage = async (pageData) => {
    try {
        pageData.featured_image = pageData.featured_image?.hash || pageData.featured_image?.url;
        return await Page.create(pageData);
    } catch (error) {
        throw new Error(`Page creation failed: ${error.message}`);
    }
}

exports.getAllPages = async () => {
    try {
        return await Page.find().sort('title');
    } catch (error) {
        throw new Error(`Page fetch failed: ${error.message}`);
    }
}

exports.getPageById = async (pageId) => {
    try {
        const page = await Page.findById(pageId);
        if (!page) {
            throw new Error('Page not found');
        }
        return page;
    } catch (error) {
        throw new Error(`Error fetching page: ${error.message}`);
    }
}


exports.updatePage = async (pageId, updateData) => {
    try {
        updateData.featured_image = updateData.featured_image?.hash || updateData.featured_image?.url;

        return await Page.findByIdAndUpdate(
            pageId,
            updateData,
            { new: true, runValidators: true }
        ) || Promise.reject('Page not found');
    } catch (error) {
        throw new Error(`Page update failed: ${error.message}`);
    }
}

exports.deletePage = async (pageId) => {
    try {
        const page = await Page.findByIdAndDelete(pageId);
        if (!page) {
            throw new Error('Page not found');
        }
        return true;
    } catch (error) {
        throw new Error(`Error deleting page: ${error.message}`);
    }
}


