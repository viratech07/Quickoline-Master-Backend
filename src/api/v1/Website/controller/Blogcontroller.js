const Blogservice = require('../services/Blogservice')


//Posts

exports.createPost = async (req, res) => {
    try {
        const postData = {
            author: {
                name: req.user.name,
                employeeId: req.user.employeeId
            },
            ...req.body
        };

        // JSON Parsing
        ['meta', 'categories', 'tags'].forEach(field => {
            if (postData[field] && typeof postData[field] === 'string') {
                try {
                    postData[field] = JSON.parse(postData[field]);
                } catch (e) {
                    console.warn(`Failed to parse ${field} as JSON`);
                }
            }
        });

        // File Upload Add to postData
        if (req.file) {
            postData.featured_image = req.file;
        }

        const post = await Blogservice.createPost(postData);
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        console.error('Error creating post:', error);
        const statusCode = error.message.includes('Invalid') ? 400 : 500;
        res.status(statusCode).json({ 
            success: false, 
            error: error.message 
        });
    }
}



exports.updatePost = async (req, res) => {
    try {
        const updateData = { ...req.body };

        ['meta', 'categories', 'tags'].forEach(field => {
            if (updateData[field] && typeof updateData[field] === 'string') {
                try {
                    updateData[field] = JSON.parse(updateData[field]);
                } catch (e) {
                    console.warn(`Failed to parse ${field} as JSON`);
                }
            }
        });

        if (req.file) {
            updateData.featured_image = req.file;
        }

        const post = await Blogservice.updatePost(req.params.id, updateData);
        res.json({ success: true, data: post });
    } catch (error) {
        console.error('Error updating post:', error);
        const statusCode = error.message.includes('Invalid') ? 400 : 500;
        res.status(statusCode).json({ 
            success: false, 
            error: error.message 
        });
    }
}



exports.getAllPosts = async (req, res) => {
    try {
      const posts = await BlogService.getAllPosts(req.query);
      res.json({ success: true, data: posts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }



  exports.getPost = async (req, res) => {
    try {
      const post = await BlogService.getPostById(req.params.id);
      res.json({ success: true, data: post });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }



  exports.deletePost = async (req, res) => {
    try {
      await BlogService.deletePost(req.params.id);
      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  exports.searchPosts = async (req, res) => {
    try {
      const posts = await BlogService.searchPosts(req.query.q);
      res.json({ success: true, data: posts });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  // Categories

  exports.getAllCategories = async (req, res) => {
    try {
      const categories = await BlogService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }


  exports.getCategory = async (req, res) => {
    try {
      const category = await BlogService.getCategoryById(req.params.categoryId);
      res.json({ success: true, data: category });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }


  exports.createCategory = async (req, res) => {
    try {
      const category = await BlogService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  exports.updateCategory = async (req, res) => {
    try {
      const category = await BlogService.updateCategory(req.params.categoryId, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  exports.deleteCategory = async (req, res) => {
    try {
      await BlogService.deleteCategory(req.params.categoryId);
      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }



  // Tags

  exports.getAllTags = async (req, res) => {
    try {
      const tags = await BlogService.getAllTags();
      res.json({ success: true, data: tags });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }


  exports.getTag = async (req, res) => {
    try {
      const tag = await BlogService.getTagById(req.params.tagId);
      res.json({ success: true, data: tag });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }


  exports.createTag = async (req, res) => {
    try {
      const tag = await BlogService.createTag(req.body);
      res.status(201).json({ success: true, data: tag });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  exports.updateTag = async (req, res) => {
    try {
      const tag = await BlogService.updateTag(req.params.tagId, req.body);
      res.json({ success: true, data: tag });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  exports.deleteTag = async (req, res) => {
    try {
      await BlogService.deleteTag(req.params.tagId);
      res.json({ success: true, message: 'Tag deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  // Pages


  exports.getAllPages = async (req, res) => {
    try {
      const pages = await BlogService.getAllPages();
      res.json({ success: true, data: pages });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }


  exports.getPage = async (req, res) => {
    try {
      const page = await BlogService.getPageById(req.params.pageId);
      res.json({ success: true, data: page });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }


   exports.createPage = async (req, res) => {
    try {
      const page = await BlogService.createPage(req.body);
      res.status(201).json({ success: true, data: page });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


exports.updatePage = async (req, res) => {
    try {
      const page = await BlogService.updatePage(req.params.pageId, req.body);
      res.json({ success: true, data: page });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  exports.deletePage = async (req, res) => {
    try {
      await BlogService.deletePage(req.params.pageId);
      res.json({ success: true, message: 'Page deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  // Privacy Policy 

  exports.getCurrentPrivacyPolicy = async (req, res) => {
    try {
        const policy = await BlogService.getCurrentPrivacyPolicy();
        res.json({ success: true, data: policy });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
  }


  exports.getAllPrivacyPolicyVersions = async (req, res) => {
    try {
        const policies = await BlogService.getAllPrivacyPolicies(req.query);
        res.json({ 
            success: true, 
            data: policies.docs,
            pagination: policies.pagination
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
  }


  exports.getPrivacyPolicyVersion = async (req, res) => {
    try {
        const policy = await BlogService.getPrivacyPolicyByVersion(req.params.version);
        res.json({ success: true, data: policy });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
  }


  exports.createPrivacyPolicy = async (req, res) => {
    try {
        const policy = await BlogService.createPrivacyPolicy(req.body);
        res.status(201).json({ success: true, data: policy });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
  }


  exports.updatePrivacyPolicy = async (req, res) => {
    try {
        const policy = await BlogService.updatePrivacyPolicy(req.params.version, req.body);
        res.json({ success: true, data: policy });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
  }


  exports.deletePrivacyPolicy = async (req, res) => {
    try {
        await BlogService.deletePrivacyPolicy(req.params.version);
        res.json({ success: true, message: 'Privacy policy version deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
  }


  
