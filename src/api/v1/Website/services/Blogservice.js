const { Post, Page, Category, Tag } = require('../model/blog.model');
const slugify = require('slugify');

class BlogService {

    //  +++++++++++++++++++  Post Services ++++++++++++++++++++

    async createPost(postData) {
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
    async getAllPosts({ page = 1, limit = 10, filters = {} } = {}) {
        try {
            return await Post.paginate(
                { published: true, ...filters },
                {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                    sort: { created_at: -1 },
                    populate: ['categories', 'tags']
                }
            );
        } catch (error) {
            throw new Error(`Posts fetch failed: ${error.message}`);
        }
    }

    async getPostById(postId) {
        try {
            const post = await Post.findById(postId)
                .populate(['categories', 'tags']);

            if (!post) throw new Error('Post not found');
            return post;
        } catch (error) {
            throw new Error(`Post fetch failed: ${error.message}`);
        }
    }


    async updatePost(postId, updateData) {
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

    async deletePost(postId) {
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

    async searchPosts(searchQuery) {
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
    
    async createCategory(categoryData) {
        try {
            return await Category.create(categoryData);
        } catch (error) {
            throw new Error(`Category creation failed: ${error.message}`);
        }
    }

    async getAllCategories() {
        try {
            return await Category.find().sort('name');
        } catch (error) {
            throw new Error(`Category fetch failed: ${error.message}`);
        }
    }


    async updateCategory(categoryId, updateData) {
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


    async deleteCategory(categoryId) {
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

    async createTag(tagData) {
        try {
            return await Tag.create(tagData);
        } catch (error) {
            throw new Error(`Tag creation failed: ${error.message}`);
        }
    }

    async getAllTags() {
        try {
            return await Tag.find().sort('name');
        } catch (error) {
            throw new Error(`Tag fetch failed: ${error.message}`);
        }
    }


    async getTagById(tagId) {
        try {
            return await Tag.findById(tagId) || Promise.reject('Tag not found');
        } catch (error) {
            throw new Error(`Tag fetch failed: ${error.message}`);
        }
    }

    async updateTag(tagId, updateData) {
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

    async deleteTag(tagId) {
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

    async createPage(pageData) {
        try {
            pageData.featured_image = pageData.featured_image?.hash || pageData.featured_image?.url;
            return await Page.create(pageData);
        } catch (error) {
            throw new Error(`Page creation failed: ${error.message}`);
        }
    }
    
    async getAllPages() {
        try {
            return await Page.find().sort('title');
        } catch (error) {
            throw new Error(`Page fetch failed: ${error.message}`);
        }
    }

    async getPageById(pageId) {
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


    async updatePage(pageId, updateData) {
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

    async deletePage(pageId) {
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
}

module.exports = new BlogService();