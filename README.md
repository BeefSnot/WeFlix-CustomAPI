WeFlix APIWelcome to WeFlix, a custom-built API dedicated to the Star Wars universe. This project provides a backend service to query data about films, characters, and planets from the iconic saga. It is built with a modern JavaScript stack and is designed to be scalable and easy to use.This project was created as part of a school project with the theme "Movies / TV Shows".Table of ContentsFeaturesTech StackProject SetupRunning the ApplicationAPI EndpointsFuture DevelopmentFeaturesRESTful API: A clean, predictable API for interacting with Star Wars data.Relational Database: Uses PostgreSQL with Sequelize ORM for robust data modeling and relationships.Data Seeding: Includes a script to automatically populate the database with initial data.Scalable Structure: Organized codebase that is easy to extend with new models, routes, and features.Tech StackBackend: Node.js, Express.jsDatabase: PostgreSQLORM: SequelizeDependencies: pg (PostgreSQL client for Node.js)Project SetupFollow these steps to get the WeFlix API running on your local machine.PrerequisitesNode.js: Make sure you have Node.js installed (v14 or newer recommended). You can download it from nodejs.org.PostgreSQL: You need a running instance of PostgreSQL. You can download it from postgresql.org.InstallationClone the repository:git clone <your-repository-url>
cd weflix-api
Install dependencies:Use npm to install the required packages listed in package.json.npm install
Create the Database:Open your PostgreSQL administration tool (like psql or pgAdmin) and create a new database.CREATE DATABASE weflix_db;
Configure the Database Connection:Open the db.js file and update the connection details with your local PostgreSQL credentials (specifically your password).// db.js
const sequelize = new Sequelize('weflix_db', 'your_username', 'your_password', {
    host: 'localhost',
    dialect: 'postgres'
});
Running the ApplicationSeed the Database:Run the seed script from your terminal. This will create the necessary tables and populate them with the initial data for "Revenge of the Sith".node seed.js
You should see a Seeding complete! 🌱 message upon success.Start the Server:Once the database is seeded, you can start the API server.node server.js
The server will start, and you will see the message: 🚀 Server is running on http://localhost:3000.API EndpointsYou can now test the API using a web browser or an API client like Postman.MethodEndpointDescriptionGET/Displays a welcome message for the API.GET/api/filmsRetrieves a list of all films in the database.GET/api/peopleRetrieves a list of all people (characters), including their homeworld.Example Response: GET /api/films[
    {
        "id": 1,
        "title": "Revenge of the Sith",
        "episode_id": 3,
        "director": "George Lucas",
        "release_date": "2005-05-19",
        "createdAt": "2023-10-27T19:45:00.123Z",
        "updatedAt": "2023-10-27T19:45:00.123Z"
    }
]
Future DevelopmentThis is the foundational MVP for the WeFlix API. Future enhancements will include:More Data: Adding data for all Star Wars films, characters, planets, species, and starships.Expanded Endpoints: Creating more specific endpoints, such as:GET /api/films/:idGET /api/films/:id/charactersGET /api/people/:idPagination: Implementing pagination for endpoints that return large lists of data.Unit Testing: Adding a testing framework like Jest to ensure API reliability.User Authentication: Securing the API with user accounts and authentication.