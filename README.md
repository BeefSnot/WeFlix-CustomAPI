WeFlix API: A Star Wars Universe Backend 🚀

Welcome to WeFlix, a custom-built API dedicated to the Star Wars universe. This project provides a backend service to query data about films, characters, and planets from the iconic saga. It is built with a modern JavaScript stack and designed to be scalable and easy to use.

    This project was created as part of a school project with the theme "Movies / TV Shows".

Table of Contents

    ✨ Features

    🛠️ Tech Stack

    🏁 Getting Started

        Prerequisites

        Installation

    🏃‍♀️ Running the Application

    📚 API Endpoints

    🗺️ Roadmap

    🤝 Contributing

    📄 License

✨ Features

    🌐 RESTful API: A clean, predictable API for interacting with Star Wars data.

    🗄️ Relational Database: Uses PostgreSQL with Sequelize ORM for robust data modeling and relationships.

    🌱 Data Seeding: Includes a script to automatically populate the database with initial data.

    🏗️ Scalable Structure: Organized codebase that is easy to extend with new models, routes, and features.

🛠️ Tech Stack

    Backend: Node.js, Express.js

    Database: PostgreSQL

    ORM: Sequelize

    Dependencies: pg (PostgreSQL client for Node.js)

🏁 Getting Started

Follow these steps to get the WeFlix API running on your local machine.

Prerequisites

    Node.js: Make sure you have Node.js installed (v14 or newer recommended). You can download it from nodejs.org.

    PostgreSQL: You need a running instance of PostgreSQL. You can download it from postgresql.org.

Installation

    Clone the repository:
    Bash

git clone https://github.com/your-username/weflix-api.git
cd weflix-api

Install dependencies:
Use npm to install the required packages listed in package.json.
Bash

npm install

Create the Database:
Open your PostgreSQL administration tool (like psql or pgAdmin) and create a new database.
SQL

CREATE DATABASE weflix_db;

Configure the Database Connection:
Open the db.js file and update the Sequelize constructor with your local PostgreSQL credentials (specifically your username and password).
JavaScript

    // db.js
    const sequelize = new Sequelize('weflix_db', 'your_username', 'your_password', {
      host: 'localhost',
      dialect: 'postgres'
    });

🏃‍♀️ Running the Application

    Seed the Database:
    Run the seed script from your terminal. This will create the necessary tables and populate them with the initial data.
    Bash

node seed.js

You should see a Seeding complete! 🌱 message upon success.

Start the Server:
Once the database is seeded, you can start the API server.
Bash

    node server.js

    The server will start, and you will see the message: 🚀 Server is running on http://localhost:3000.

📚 API Endpoints

You can now test the API using a web browser or an API client like Postman.
Method	Endpoint	Description
GET	/	Displays a welcome message for the API.
GET	/api/films	Retrieves a list of all films in the database.
GET	/api/people	Retrieves a list of all people, including their homeworld.

Example Response: GET /api/films

JSON

[
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

🗺️ Roadmap

This is the foundational MVP for the WeFlix API. Future enhancements will include:

    [ ] More Data: Add data for all Star Wars films, characters, planets, species, and starships.

    [ ] Expanded Endpoints: Create more specific endpoints, such as:

        GET /api/films/:id

        GET /api/films/:id/characters

        GET /api/people/:id

    [ ] Pagination: Implement pagination for endpoints that return large lists of data.

    [ ] Unit Testing: Add a testing framework like Jest or Mocha to ensure API reliability.

    [ ] User Authentication: Secure the API with user accounts and authentication (e.g., JWT).

🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
