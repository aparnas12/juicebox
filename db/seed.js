

// grab our client with destructuring from the export in index.js
const {  
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser
  } = require('./index');

// this function should call a query which drops all tables from our database
async function dropTables() {
    try {
      await client.query(`
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users; 
      `);
    } catch (error) {
      throw error; // we pass the error up to the function that calls dropTables
    }
  }

  /*************************************************USERS******************************************/

  async function createTables() {
    try {
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT true
        );
      `);
    } catch (error) {
      throw error;
    }
  }

  async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      await createUser({ username: 'albert', password: 'bertie99',name: 'Al bert', location: 'Sidney, Australia' });
      await createUser({ username: 'sandra', password: '2sandy4me',name: 'Just Sandra',location: "Ain't tellin'" });
     await createUser({ username: 'glamgal', password: 'soglam',name: 'Joshua',location: 'Upper East Side' });
  
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }

  async function updateUsersTable(users){
    try{
            console.log("Calling updateUser on users[0]")
            const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);
    }
    catch(error){
        console.log(error);
    }

  }

 
/*************************************************POSTS******************************************/
  async function createTablePosts() {
    console.log("creating post table");
    try {
      await client.query(`
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
        );
      `);
    } catch (error) {
        console.error("error creating posts");
      throw error;
    }
  }

  async function createInitialPosts() {
    console.log("Starting to create posts...");
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my second post. I hope I love reading blogs as much as I love writing them."
      });
      await createPost({
        authorId:  sandra.id,
        title: "Second Post",
        content: "This is my second post. I hope I love writing blogs as much as I reading."
      });
      await createPost({
        authorId: glamgal.id,
        title: "Third Post",
        content: "This is my third post. I hope I love writing blogs as much as I love writing in my journal."
      });
      console.log("Finished creating posts...");
     
    } catch (error) {
      throw error;
    }
  }

  async function updatePostsTable(posts){
    try{
            console.log("Calling updatePosts on posts[0]")
            const updateUserResult = await updatePost(posts[0].id, {
            title: "Random Title",
            content: "Random Content"
        });
        console.log("Result:", updateUserResult);
    }
    catch(error){
        console.log(error);
    }

  }

  async function rebuildDB() {
    try {
      client.connect();
      await dropTables();
      await createTables();
      await createTablePosts();
      await createInitialUsers();
      await createInitialPosts();
      

      
    } catch (error) {
      console.error(error);
    }
  }

  async function testDB() {
    try {
      console.log("Starting to test database...");
      
      const users = await getAllUsers();
      console.log("getAllUsers:", users);

      console.log("Calling getAllPosts");
      const posts = await getAllPosts();
   

     await updateUsersTable(users);
     await updatePostsTable(posts);

     console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

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