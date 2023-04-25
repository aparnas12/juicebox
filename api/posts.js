const express = require('express');
const postsRouter = express.Router();
const { getAllPosts,createPost,updatePost,getPostById } = require('../db');
const { requireUser } = require('./utils');


postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");
 next();

});

postsRouter.get('/', async (req, res) => {
  const allPosts = await getAllPosts();

  const posts = allPosts.filter(post => {
    // keep a post if it is either active, or if it belongs to the current user
    return post.active || (req.user && post.author.id === req.user.id);
  });

  res.send({
    posts
  });
});

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  const tagArr = tags.trim().split(/\s+/)
  const postData = {};
 // only send the tags if there are some to send
 if (tagArr.length) {
  postData.tags = tagArr;
}

try {
  // add authorId, title, content to postData object authorId is the id from the user object table
  if(req.user){
    postData.authorId = req.user.id
  }
  postData.title = title;
  postData.content = content; 
  console.log("This is the post data I created",postData);
  // this will create the post and the tags for us
  const post = await createPost(postData);
  if(post)
  {
     res.send({ post });
  }
  else {
    next({
      name: 'PostNotCreated',
      message: `Failed to create post`
    });
  }
  
} catch ({ name, message }) {
  next({ name, message });
}

  
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.active && originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      if (!originalPost.active)
      {
        next({
          name: 'InActivePostError',
          message: 'You cannot update a post that is not active'
        })
      }
      else{
        next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
      }
      
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});


  
module.exports = postsRouter;