const PORT = 3000;
const express = require('express');

//express() is a function that creates an application for us so can be invoked and a server object is returned
const server = express();
require('dotenv').config();
const apiRouter = require('./api');
const { client } = require('./db');
client.connect();

//It is a middleware for logging, use morgan for logging server requets and responses etc. could be 'dev' or 'tiny' or 'common' 
const morgan = require('morgan');
server.use(morgan('dev'));

//you don't have to use bodyParser.json() anymore if you are on the latest release of express. You can use express.json() instead.
server.use(express.json());
//server.use(express.urlencoded({ extended: false }));

//routes have to  be after all the middleware initialization 
server.use('/api', apiRouter);

server.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");
  
    next();
  });
//listen starts the server on the port provided and lisen also takes a callbackfunction as function that can be executed once the server sucesssfully starts listening
//the callback can have anythin that will run one time when the server is up ex. connect to DB onlky when server is up. 
  server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});
