'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
require('dotenv').config();

const cfg = require('../../../../config/config');
const AccountService = require('./account');
const Information_Accounts = require('../models/account.model');

let connected = false;

async function ensureConnection() {
    if (connected) return;
    await mongoose.connect(cfg.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    connected = true;
}

test.before(async function () {
    await ensureConnection();
    await Information_Accounts.deleteMany({ email: /test-local-auth/ });
});

test.after(async function () {
    if (connected) {
        await Information_Accounts.deleteMany({ email: /test-local-auth/ });
        await mongoose.disconnect();
    }
});

test('local registration and login workflow', async function () {
    const registerReq = {
        body: {
            username: 'Test User',
            email: 'test-local-auth@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            licensePlate: 'กก 1234 เชียงใหม่'
        }
    };

    let registerStatus, registerBody;
    const registerRes = {
        status: function (code) {
            registerStatus = code;
            return {
                json: function (payload) {
                    registerBody = payload;
                }
            };
        }
    };

    await AccountService.onSignUp(registerReq, registerRes);

    assert.equal(registerStatus, 200);
    assert.ok(registerBody && registerBody.status);
    assert.equal(registerBody.data.email, 'test-local-auth@example.com');
    assert.equal(registerBody.data.username, 'Test User');
    assert.equal(registerBody.data.password, 'Password123!');
    assert.equal(registerBody.data.licensePlate, 'กก 1234 เชียงใหม่');
    assert.equal(registerBody.data.userinfo.licensePlate, 'กก 1234 เชียงใหม่');

    const loginReq = {
        body: {
            email: 'test-local-auth@example.com',
            password: 'Password123!'
        },
        get: function (header) {
            return header === 'User-Agent' ? 'TestAgent' : '';
        },
        ip: '127.0.0.1'
    };

    let loginStatus, loginBody;
    const loginRes = {
        status: function (code) {
            loginStatus = code;
            return {
                json: function (payload) {
                    loginBody = payload;
                }
            };
        }
    };

    await AccountService.onLocalSignIn(loginReq, loginRes);

    assert.equal(loginStatus, 200);
    assert.ok(loginBody && loginBody.status);
    const token = loginBody.data.xAccessToken;
    assert.ok(token);

    const authReq = {
        headers: {
            'x-access-token': token
        },
        body: {}
    };

    let nextCalled = false;
    const authNext = function () {
        nextCalled = true;
    };

    await AccountService.onCheckAuthorization(authReq, {}, authNext);

    assert.ok(nextCalled);
    assert.equal(authReq.authAccount.email, 'test-local-auth@example.com');
    assert.equal(authReq.authSession.xAccessToken, token);
});

test('local registration fails with mismatching passwords', async function () {
    const registerReq = {
        body: {
            username: 'Test User 2',
            email: 'test-local-auth-2@example.com',
            password: 'Password123!',
            confirmPassword: 'MismatchPassword1!',
            licensePlate: 'กก 1234 เชียงใหม่'
        }
    };

    let registerStatus, registerBody;
    const registerRes = {
        status: function (code) {
            registerStatus = code;
            return {
                json: function (payload) {
                    registerBody = payload;
                }
            };
        }
    };

    await AccountService.onSignUp(registerReq, registerRes);

    assert.equal(registerStatus, 400);
    assert.equal(registerBody.status, false);
    assert.equal(registerBody.message, 'Passwords do not match');
});
