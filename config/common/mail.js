var nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: "pevvpevv2@gmail.com",
        pass: "top16airivietnam"
    }
})

module.exports = transporter