const { authSecret, algorithm } = require('../components/env')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const app = require('express')()
const db = require('../components/db')
app.db = db

class UserModel {

    static encryptPassword = function (password) {
        const iv = Buffer.from(crypto.randomBytes(16))
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(authSecret), iv)
        let encrypted_password = cipher.update(password)
        encrypted_password = Buffer.concat([encrypted_password, cipher.final()])

        return `${encrypted_password.toString('hex')}:${iv.toString('hex')}`
    }

    static decryptPassword = function (encrypted_password) {
        const [encrypted, iv] = encrypted_password.split(':')
        const ivBuffer = Buffer.from(iv, 'hex')
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(authSecret), ivBuffer)
        let content = decipher.update(Buffer.from(encrypted, 'hex'))
        content = Buffer.concat([content, decipher.final()])

        return content.toString()
    }

    static registerUser = async function (login, password) {
        let query = {}
        if(login) query.login = login
        if(password) query.password = password

        app.db('users')
            .insert(query)
            .then()
            .catch()
    }

    static getUserLogin = async function (login) {
        return await app.db('users')
            .select('login', 'password')
            .where({login: login})
            .then(data => {
                return data[0]
            }).catch(err => {
                return err
            })
    }

    static getUser = async function (token) {
        return await app.db('users')
            .select('login')
            .where({ token: token})
            .then(data => {
                return data[0]
            }).catch(err => {
                return err
            })
    }

    static validatePassword = async function (user) {
        const decryptLoginPassword = await UserModel.decryptPassword(user.password)
        const encryptDataBasePassword = await app.db('users')
            .select('password')
            .where({login: user.login})
            .then(data => {
                return data[0]
            }).catch(err => {
                return err
            })
        const decryptDataBasePassword = UserModel.decryptPassword(encryptDataBasePassword.password)

        return decryptLoginPassword === decryptDataBasePassword
    }

    static generateToken = async function (data) {
        let login = data.login

        return jwt.sign({
            login: login,
        }, authSecret, { expiresIn: '1h' })
    }

    static addToken = async function (token, login) {
        return await app.db('users')
            .update({token: token})
            .where({login: login})
            .then(() => {})
            .catch(err => {
                console.error(err)
            })
    }

    static removeToken = async function(token, login) {
        return await app.db('users')
            .update({token: ''})
            .where({login: login})
            .then(() => {})
            .catch(err => {
                console.error(err)
            })
    }

    static checkToken = function(token) {
        let decodedToken = jwt.verify(token, authSecret);

        return new Promise((resolve, reject) => {
            if (decodedToken) {
                resolve(decodedToken);
            } else {
                reject(decodedToken);
            }
        });
    };

}

module.exports = UserModel