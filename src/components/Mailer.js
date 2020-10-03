const nodemailer = require('nodemailer')

class Mailer {

    static transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
            user: '',
            pass: '',
        }
    })

    static sendEmail = async function(email, newRandomPassword) {
        return await Mailer.transporter.sendMail({
            from: '',
            to: email,
            subject: "New Random Password",
            text: `new random password`,
            html: `<p>Password: ${newRandomPassword}</p>`,
        })
    }
}

module.exports = Mailer