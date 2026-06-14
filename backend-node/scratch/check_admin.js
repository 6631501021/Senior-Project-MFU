'use strict';

const mongoose = require('mongoose');
const Information_Accounts = require('../server/Project/accounts/models/account.model');
const accountAccess = require('../server/Project/security/service/account-access');

async function checkAdminDetails() {
  await mongoose.connect('mongodb://127.0.0.1:27017/NewSystem');
  
  const admin = await Information_Accounts.findOne({ email: 'admin@gmail.com' });
  if (!admin) {
    console.log('Admin user not found!');
    await mongoose.connection.close();
    return;
  }
  
  console.log('Admin document in MongoDB:');
  console.log(JSON.stringify(admin, null, 2));

  console.log('Checking local permissions...');
  const perms = await accountAccess.getEffectivePermissions(admin._id);
  console.log('Matrix:', JSON.stringify(perms.matrix, null, 2));

  await mongoose.connection.close();
}

checkAdminDetails();
