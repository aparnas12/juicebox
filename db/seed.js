

// grab our client with destructuring from the export in index.js
const { client,getAllUsers,createUser } = require('./index');

// this function should call a query which drops all tables from our database
async function dropTables() {
    try {
      await client.query(`
      DROP TABLE IF EXISTS users; 
      `);
    } catch (error) {
      throw error; // we pass the error up to the function that calls dropTables
    }
  }

  async function createTables() {
    try {
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL
        );
      `);
    } catch (error) {
      throw error;
    }
  }

  async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      const albert = await createUser({ username: 'albert', password: 'bertie99' });
  
      console.log(albert);
  
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }

  async function rebuildDB() {
    try {
      client.connect();
     console.log("connected to db");
      await dropTables();
      console.log("tables dropped");
      await createTables();
      console.log("finsihed creating tables");
      await createInitialUsers();
    } catch (error) {
      console.error(error);
    } finally {
        console.log("ended db connection");
    //   client.end();
    }
  }

  async function testDB() {
    try {
      console.log("Starting to test database...");
      
      const users = await getAllUsers();
      console.log("getAllUsers:", users);
  
      console.log("Finished database tests!");
    } catch (error) {
      console.error("Error testing database!");
      throw error;
    }
  }
  

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());