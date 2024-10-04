// index.js
const express = require('express');
const app = express();
const seedDatabase = require('./seedDatabase');

async function main() {
  try {
    await seedDatabase();
    console.log('Database seeded successfully');
  } catch (err) {
    console.error(err);
  }
}

main();