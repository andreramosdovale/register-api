const { authSecret, algorithm } = require('../components/env')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const app = require('express')()
const db = require('../components/db')
const mailer = require('../components/Mailer')
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

    static registerUser = async function (email, password) {
        let query = {}
        if(email) query.email = email
        if(password) query.password = password

        app.db('users')
            .insert(query)
            .then(id => {
                return id
            })
            .catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static getUserEmail = async function (email) {
        return await app.db('users')
            .select('email', 'password')
            .where({email: email})
            .then(data => {
                return data[0]
            }).catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static getUserByToken = async function (token) {
        return await app.db('users')
            .select('email')
            .where({ token: token})
            .then(data => {
                return data[0]
            }).catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static getUser = async function (email) {
        return await app.db('users')
            .select('email')
            .where({ email: email})
            .then(data => {
                return data[0]
            }).catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static getEncryptDataBasePassword = async function (user) {
        return await app.db('users')
            .select('password')
            .where({email: user.email})
            .then(data => {
                return data[0]
            }).catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static validatePassword = async function (user) {
        const decryptLoginPassword = await UserModel.decryptPassword(user.password)
        const encryptDataBasePassword = await UserModel.getEncryptDataBasePassword(user)
        const decryptDataBasePassword = UserModel.decryptPassword(encryptDataBasePassword.password)

        return decryptLoginPassword === decryptDataBasePassword
    }

    static deleteUser = async function (token) {
        const user = await UserModel.getUserByToken(token)

        return await app.db('users')
            .where({email: user.email})
            .del()
            .then(data => {
                return data[0]
            }).catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static updateUserByToken = async function (token, newEmail, newPassword) {
        const user = await UserModel.getUserByToken(token)

        return await app.db('users')
            .update({
                email: newEmail,
                password: newPassword
            })
            .where({email: user.email})
            .then(data => {
                return data[0]
            }).catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static updateRandomPassword = async function (email, newPassword) {
        const newPasswordEncrypted = UserModel.encryptPassword(newPassword)

        return await app.db('users')
            .update({
                password: newPasswordEncrypted
            })
            .where({email: email})
            .then(data => {
                return data[0]
            }).catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static generateToken = async function (data) {
        return jwt.sign({
            email: data.email,
        }, authSecret, { expiresIn: '1h' })
    }

    static addToken = async function (token, email) {
        return await app.db('users')
            .update({token: token})
            .where({email: email})
            .then(id => {
                return id
            })
            .catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static removeToken = async function(token) {
        const user = await UserModel.getUserByToken(token)

        return await app.db('users')
            .update({token: ''})
            .where({email: user.email})
            .then(id => {
                return id
            })
            .catch(err => {
                app.db.destroy()
                console.error(err)
            })
    }

    static checkToken = function(token) {
        let decodedToken = jwt.verify(token, authSecret)

        return new Promise((resolve, reject) => {
            if (decodedToken) {
                resolve(decodedToken)
            } else {
                reject(decodedToken)
            }
        })
    }

    static generateNewRandomPassword = async function () {
        let codeAlphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9']
        let newPassword = '';

        for (let i = 0; i < 8; i++) {
            newPassword += codeAlphabet[Math.floor(Math.random() * codeAlphabet.length)];
        }

        return newPassword
    }

    static sendEmail = async function (email) {
        const user = await UserModel.getUser(email)
        const newRandomPassword = await UserModel.generateNewRandomPassword();

        return await mailer.sendEmail(user.email, newRandomPassword)
            .then(data => {
                return data
            })
            .catch(err => {
                return console.error(err)
            })
    }

}

module.exports = UserModel