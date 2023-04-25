const express = require('express');
const usersRouter = express.Router();
const { getAllUsers,getUserByUsername,createUser } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;



usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");
 next();

});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();
    res.send({
      users
    });
  });

  /* Test your toke using curl http://localhost:3000/api -H 'Authorization: Bearer tokentext'
  */
  usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    // request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
         const user = await getUserByUsername(username);
    
         if (user && user.password == password) {
            // create token & return to user
            const token = jwt.sign({ id: user.id, username: user.username, password : user.password}, process.env.JWT_SECRET);
        
            const decodedFromToken = jwt.verify(token, JWT_SECRET);
            res.send({ token : token ,message: "you're logged in!" });
            
         }  else {
            next({ 
            name: 'IncorrectCredentialsError', 
            message: 'Username or password is incorrect'
            });
         }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
    try {
        const _user = await getUserByUsername(username);
        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }
        //create the user amd store info in the databse 
        const user = await createUser({
            username,
            password,
            name,
            location,
        });

        const token = jwt.sign({ id: user.id, username}, process.env.JWT_SECRET, {expiresIn: '1w'});

        res.send({  token :token ,
            message: "thank you for signing up"
        });
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
  
module.exports = usersRouter;