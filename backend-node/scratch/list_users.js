'use strict';

const mongoose = require('mongoose');
const Information_Accounts = require('../server/Project/accounts/models/account.model');

async function listUsers() {
  await mongoose.connect('mongodb://127.0.0.1:27017/NewSystem');
  const users = await Information_Accounts.find({}, { username: 1, email: 1, role: 1, licensePlate: 1 });
  console.log('Registered Users:');
  console.log(JSON.stringify(users, null, 2));
  await mongoose.connection.close();
}

listUsers();
