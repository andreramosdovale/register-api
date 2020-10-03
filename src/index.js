const app = require('express')()
const bodyParser = require('body-parser')
const consign = require('consign')
const UserModel = require('./models/UserModel')
const jwt = require('jsonwebtoken')

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization");
    res.header("Content-Type", "application/json")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})

module.exports = app => {
    app.use(function(req, res, next) {
        try {
            const UNCHECKED_PATHS = [
                '/user/login',
                '/user/logout',
                '/user/resetPassword'
            ];

            const CHECKED_METHODS = [
                'POST',
                'GET'
            ];

            if (!UNCHECKED_PATHS.includes(req.path) && CHECKED_METHODS.includes(req.method)) {
                jwt.verify(req.headers.authorization, async function(err) {
                    if (err) {
                        throw err
                    }
                    await UserModel.getUser({
                        'token': req.headers.authorization
                    }).then(objeto => {
                        console.log(objeto)
                        if (objeto) {
                            next()
                        } else {
                            throw 'Email ou senha incorretos.'
                        }
                    })
                })
            } else {
                next()
            }
        } catch(err) {
            console.log(err);
            return res.statusCode.send(err)
        }
    });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.listen(3000)

consign()
    .include('src/controllers')
    .into(app)