require("dotenv").config()

const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const randToken = require("rand-token")
const axios = require("axios");
const { PARAMS, BUNNY } = require("./consts");
const { Readable } = require("stream")
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars")



exports.sendEmail = (subject, to, html, attachments, envelope) => { //attachments should be an array; envelope is a json containing a 'to' and 'cc'
    try {
        const smtpTransport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PWD,
            }
        });

        const mailOptions = {
            from: `<${process.env.MAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            html,  // html body
        };
        if (attachments) {
            mailOptions.attachments = attachments;
        }

        if (envelope) {
            envelope.from = process.env.MAIL_USER
            mailOptions.envelope = envelope;
        }

        smtpTransport.sendMail(mailOptions, (err, result) => {
            if (err) {
                console.log('Error occurred while sending mail:::', err);
                return false;
            }
            // console.log('Message sent:', result);
            return true;
        });
    } catch (err) {
        console.log('sendEmail', err.message);
    }
}

exports.sendAccountVerificationMail = (email, verificationLink, username) => {

    const year = new Date().getFullYear()

    const subject = "Verify Your Email - RAGS & SOLES"


    const baseDir = path.resolve(__dirname, "../../templates")
    const templatePath = path.join(baseDir, 'temp.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    const data = {
        logo: process.env.LOGO_URL,
        username: username ?? "",
        verification_link: verificationLink,
        year: year
    }

    const html = template(data)

    this.sendEmail(subject, email, html)
}

exports.sendPasswordResetMail = (email, reset_link, username) => {

    const year = new Date().getFullYear()

    const baseDir = path.resolve(__dirname, "../../templates")
    const templatePath = path.join(baseDir, 'pwd.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    const data = {
        logo: process.env.LOGO_URL,
        username: username ?? "",
        reset_link: reset_link,
        year: year
    }

    const html = template(data)

    const subject = "Password Reset - RAGS & SOLES"

    this.sendEmail(subject, email, html)
}

exports.sendAdminMailCredentials = (email, password) => {
    const year = new Date().getFullYear()
    const baseDir = path.resolve(__dirname, "../../templates")
    const templatePath = path.join(baseDir, 'admin.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    const data = {
        logo: process.env.LOGO_URL,
        email,
        password,
        support_mail: process.env.MAIL_USER,
        year

    }

    const html = template(data)

    const subject = "Admin Credentials - Rags & Soles"

    this.sendEmail(subject, email, html)
}

exports.sendOrderMailToUser = (email, subject, data) => {
    const baseDir = path.resolve(__dirname, "../../templates")
    const templatePath = path.join(baseDir, 'order_confirmation_template.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    data.logo = process.env.LOGO_URL
    data.support_mail = process.env.MAIL_USER

    const generatedTemplate = template(data)

    this.sendEmail(subject, email, generatedTemplate)
}

exports.sendApprovedMailToUser = (email, subject, data) => {
    const baseDir = path.resolve(__dirname, "../../templates")
    const templatePath = path.join(baseDir, 'approvedTemplate.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    data.logo = process.env.LOGO_URL
    data.support_mail = process.env.MAIL_USER
    data.dashboard_link = process.env.WEB_BASE_URL

    const generatedTemplate = template(data)

    this.sendEmail(subject, email, generatedTemplate)
}

exports.sendDeclinedMailToUser = (email, subject, data) => {
    const baseDir = path.resolve(__dirname, "../../templates")
    const templatePath = path.join(baseDir, 'declined.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    data.logo = process.env.LOGO_URL
    data.support_mail = process.env.MAIL_USER
    data.dashboard_link = process.env.WEB_BASE_URL

    const generatedTemplate = template(data)

    this.sendEmail(subject, email, generatedTemplate)
}

exports.sendBlockedMailToUser = (email, subject, data) => {
    const baseDir = path.resolve(__dirname, "../../templates")
    const templatePath = path.join(baseDir, 'blocked.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    data.logo = process.env.LOGO_URL
    data.support_mail = process.env.MAIL_USER
    data.dashboard_link = process.env.WEB_BASE_URL

    const generatedTemplate = template(data)

    this.sendEmail(subject, email, generatedTemplate)
}

exports.hashPassword = (pwd) => {
    const salt = bcrypt.genSaltSync()
    return bcrypt.hashSync(pwd, salt)
}

exports.checkPassword = (pwd, hash) => {
    return bcrypt.compareSync(pwd, hash)
}

exports.generateToken = (payload, expiryTme = 1 * 10 * 60, secret) => {
    return jwt.sign(payload, secret, { expiresIn: expiryTme })
}

exports.verifytoken = (token, secret = process.env.AUTH_SECRET) => {

    let err, err_status
    let success = false;
    try {
        const payload = jwt.verify(token, secret)
        success = true
        return { d: payload, success }
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            err = "Session Expired.";
            err_status = 403;

        } else if (error.name === "JsonWebTokenError") {
            err = "Invalid Token";
            err_status = 498;
        }

        return { err, success, err_status }
    }
}

exports.createUUID = () => {
    return randToken.uid(15)
}

exports.createLenUid = (size) => {
    return randToken.uid(size)
}


exports.initializePayment = async (ref, amount, email, meta) => {
    console.log("metaL:::::", meta)

    try {
        const url = "https://api.paystack.co/transaction/initialize"

        const resp = await axios.post(
            url,
            {
                reference: ref,
                amount: `${amount * 100}`,
                email: email,
                channels: ["card", "bank", "apple_pay", "ussd", "qr", "mobile_money", "bank_transfer", "eft"],

                // https://rags-and-soles.netlify.app/order-confirmed/?source=paystack&status=success
                callback_url: process.env.WEB_BASE_URL + `/order-confirmed?source=paystack&status=success`,
                metadata: meta,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`
                }
            }
        );

        // Check the response status
        if (resp.status === 200) {
            const jsn = resp.data;
            return { url: jsn?.data?.authorization_url, success: true };
        } else {
            console.log("status::error::paystack request:::", resp.data)
            return { url: "", success: false, "msg": "Unable to initialize transaction" };
        }

    } catch (error) {
        console.log("error::::Catch:::", error)
        return { success: false, msg: `Error while initializing transaction: ${error.message}` }
    }

}




exports.processFile = async (buffer, fileName) => {
    const stream = Readable.from(buffer)
    const url = await uploadToBunny(stream, fileName)

    if (!url) {
        return null
    }

    return url

}

const uploadToBunny = async (stream, fileName) => {

    const url = `${BUNNY.BUNNY_BASE_HOSTNAME}/${BUNNY.BUNNY_STORAGE_ZONE_NAME}/${fileName}`

    const response = await fetch(url, {
        method: "PUT",
        body: stream,
        duplex: "half",
        headers: {
            AccessKey: BUNNY.BUNNY_ACCESS_KEY,
            'Content-Type': 'application/octet-stream',
        }
    })

    if (!response.ok) {
        const txt = await response.text()
        console.log("error on file upload:::", txt)
        // return {success: false, url:null, msg: txt }
        null
    }

    console.log("body::::here:::", await response.json())


    return `${BUNNY.BUNNY_CUSTOM_FILE_UPLOAD_HOSTNAME}/${fileName}`
}

exports.processAllImages = async (files, productId) => {
    const img_list = []
    const promises = []
    files.forEach((item) => {
        const splitted = item.originalname.split(".")
        const ext = splitted[splitted.length - 1]
        const file_name = `${this.createUUID()}.${ext}`
        promises.push(this.processFile(item.buffer, file_name))

    })

    const fulfiled = await Promise.allSettled(promises)
    fulfiled.forEach((promise, index) => {
        if (promise.status == "fulfilled") {
            // console.log("fulfiled:::::",promise.value)
            img_list.push(
                {
                    [PARAMS.productId]: productId,
                    [PARAMS.url]: promise.value,
                    [PARAMS.isDefault]: true ? index == 0 : false
                }
            )
        } else {
            console.log("rejected:::::", promise.reason)
        }
    })

    return img_list
}