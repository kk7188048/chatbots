# Chatbot Database Seeder
==========================

This project provides a simple database seeder for a chatbot application. It uses Mongoose to connect to a MongoDB database and seed it with initial data.

## Getting Started
---------------

To use this project, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Create a new MongoDB database and add the connection string to a `.env` file in the root of the project.
4. Run the seeder by executing `node src/index.js`.
5. Run `node oepnapi.js` to pass your query for now you can pass only one time your query

## Environment Variables
-----------------------

The following environment variables are required:

* `MONGODB`: the connection string to your MongoDB database.

## Project Structure
-------------------

* `src/`: contains the source code for the project.
	+ `index.js`: the main entry point for the project.
	+ `seedDatabase.js`: the database seeder script.
	+ `seedmenu.js`: defines the menu schema and model.
* `package.json`: defines the project dependencies and scripts.

## Dependencies
------------

* `mongoose`: a MongoDB ORM for Node.js.
* `dotenv`: a library for loading environment variables from a `.env` file.

## License
-------

This project is licensed under the MIT License. See the `LICENSE` file for details.