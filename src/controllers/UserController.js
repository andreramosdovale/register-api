/**
 * @fileoverview Controller de User
 */

const { authSecret } = require('../components/env')
const UserModel = require('../models/UserModel')
const DefaultResponse = require('../components/DefaultResponse')
const jwt = require('jsonwebtoken')
const express = require('express')
const express_app = express()

express_app.use(express.static('../public'));

express_app.post('/register', async (req, res) => {
    let email = req.body.email
    let password = req.body.password
    let encrypted_password = await UserModel.encryptPassword(password)
    // let decrypted_password = await UserModel.decryptPassword(encrypted_password);
    // return res.send(`senha encriptada => ${encrypted_password} || senha decriptada => ${decrypted_password}`);

    let userModel = await UserModel.registerUser(email, encrypted_password)
        .then(object => {
            let response = new DefaultResponse(
                false, {object}, 'RegisterResponse', 200
            )
            return res.status(response.status).send(response)
        })
        .catch(err => {
            let response = new DefaultResponse(
                true, 'Internal Server Error.', 'RegisterException', 500);
            return res.status(response.status).send(response)
        })
})

express_app.post('/login', async (req, res) => {
    let email = req.body.email
    let password = req.body.password
    let encrypted_password = UserModel.encryptPassword(password)

    let userModel = await UserModel.getUserEmail(email, encrypted_password)
        .then(data => {
            UserModel.validatePassword(data)
                .then(data => {
                    let token = UserModel.generateToken(data)
                        .then(token => {
                            UserModel.addToken(token, email)
                            let response = new DefaultResponse(
                                false, {token}, 'LoginResponse', 200
                            )
                            return res.status(response.status).send(response)
                        })
                })
        })
        .catch(err => {
            let response = new DefaultResponse(
                true, 'Internal Server Error.', 'LoginException', 500);
            return res.status(response.status).send(response)
        })
})

express_app.post('/logout', async (req, res) => {
    let token = req.headers.authorization

    let userModel = UserModel.removeToken(token)
        .then(object => {
            let response = new DefaultResponse(
                false, {}, 'LogoutResponse', 200
            )
            return res.status(response.status).send(response);
        })
        .catch(err => {
            let response = new DefaultResponse(
                true, 'Internal Server Error.', 'LoginException', 500);
            return res.status(response.status).send(response);
        })
})

express_app.post('/updateUser', async (req, res) => {
    let token = req.headers.authorization
    let newEmail = req.body.email
    let newPassword = UserModel.encryptPassword(req.body.password)

    await jwt.verify(token, authSecret, function (err, decoded) {
        let userModel = UserModel.updateUserByToken(token, newEmail, newPassword)
            .then(object => {
                let response = new DefaultResponse(
                    false, {}, 'UpdateResponse', 200
                )
                return res.status(response.status).send(response);
            })
            .catch(err => {
                let response = new DefaultResponse(
                    true, 'Internal Server Error.', 'UpdateException', 500);
                return res.status(response.status).send(response);
            })
    })
})

express_app.post('/deleteUser', async (req, res) => {
    let token = req.headers.authorization

    await jwt.verify(token, authSecret, function (err, decoded) {
        let userModel = UserModel.deleteUser(token)
            .then(object => {
                let response = new DefaultResponse(
                    false, {}, 'DeleteResponse', 200
                )
                return res.status(response.status).send(response);
            })
            .catch(err => {
                let response = new DefaultResponse(
                    true, 'Internal Server Error.', 'DeleteException', 500);
                return res.status(response.status).send(response);
            })
    })
})

express_app.post('/getUser', async (req, res) => {
    let token = req.headers.authorization;

    await jwt.verify(token, authSecret, function (err, decoded) {
        let userModel = UserModel.getUser(token)
            .then(object => {
                console.log(object)
                let response = new DefaultResponse(
                false, {object, token}, 'UserResponse', 200
                )
                return res.status(response.status).send(response);
            })
            .catch(err => {
                let response = new DefaultResponse(
                true, 'Internal Server Error.', 'UserException', 500);
                return res.status(response.status).send(response)
            })
    })
})

express_app.post('/resetPassword', async (req, res) => {
    let email = req.body.email

    let userModel = await UserModel.generateNewRandomPassword()
        .then(object => {
            UserModel.updateRandomPassword(email, object)
                .then(data => {
                    UserModel.sendEmail(email)
                    let response = new DefaultResponse(
                        false, {data}, 'ResetPasswordResponse', 200
                    )
                    return res.status(response.status).send(response);
                })
                .catch(err => {
                    console.error(err)
                })
        })
        .catch(err => {
            let response = new DefaultResponse(
                true, 'Internal Server Error.', 'ResetPasswordException', 500);
            return res.status(response.status).send(response)
        })
})

module.exports = app => app.use('/user', express_app)