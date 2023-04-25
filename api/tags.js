const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName} = require('../db');


tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");
 next();

});

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();
    res.send({
      tags
    });
  });

  tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    // read the tagname from the params
    console.log("entering tagname");
   
    const {tagName} = req.params;
   
    try {
      // use our method to get posts by tag name from the db
      const allPosts = await getPostsByTagName(tagName);

      const posts = allPosts.filter(post => {
        // keep a post if it is either active, or if it belongs to the current user
        return post.active || (req.user && post.author.id === req.user.id);
      });
      
      console.log(posts);
      if(posts)
      {
        res.send({posts : posts});
      }
      
      
    } catch ({ name, message }) {
      next({ name, message });
      }
  });
  
module.exports = tagsRouter;