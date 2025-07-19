require("dotenv").config()

const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const randToken = require("rand-token")
const axios = require("axios");
const { PARAMS, BUNNY } = require("./consts");
const { Readable } = require("stream")



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
            from: `"RAG_N_SOLES" <${process.env.MAIL_USER}>`, // sender address
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

        // mailOptions.cc = envelope.cc

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
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Rag_n_Soles</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #4a148c; /* Deep purple */
            padding: 20px;
            text-align: center;
        }
        .logo {
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        .content {
            padding: 30px;
        }
        .verification-box {
            background-color: #f3e5f5; /* Light purple background */
            border-radius: 5px;
            padding: 25px;
            margin: 20px 0;
            text-align: center;
        }
        .button {
            display: inline-block;
            background-color: #7b1fa2; /* Medium purple */
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
            font-size: 16px;
        }
        .disclaimer {
            background-color: #ede7f6; /* Very light purple */
            padding: 15px;
            border-left: 4px solid #9575cd; /* Light-medium purple */
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f5f5f5;
            color: #757575;
            font-size: 12px;
        }
        a {
            color: #6a1b9a; /* Dark purple for links */
            text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">Rag_n_Soles</h1>
        </div>
        
        <div class="content">
            <h2>Verify Your Email Address</h2>
            
            <p>Hello ${username ?? ''},</p>
            
            <p>Thank you for creating an account with Rag_n_Soles, your premier destination for phones and the latest gadgets. We're excited to have you join our tech community!</p>
            
            <p>To complete your registration and access exclusive deals on the newest tech products, please verify your email address by clicking the button below:</p>
            
            <div class="verification-box">
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}" >Verify My Email</a>
                <p>This link will expire shortly.</p>
            </div>
            
            <p>Once verified, you'll have access to:</p>
            <ul>
                <li>Exclusive member-only deals</li>
                <li>Early access to new product releases</li>
                <li>Special promotions and discounts</li>
                <li>Personalized tech recommendations</li>
            </ul>
            
            <div class="disclaimer">
                <strong>IMPORTANT:</strong> If you did not create an account with Rag_n_Soles, please disregard this email. No action is needed, and your email will not be used without your permission. This email was sent as a result of a sign-up request for your email address.
            </div>
            
            <p>If you have any questions or need assistance, our customer support team is here to help. Simply reply to this email or contact us at support@Rag_n_Soles.com.</p>
            
            <p>Thank you for choosing Rag_n_Soles for all your technology needs!</p>
            
            <p>Best regards,<br>
            The Rag_n_Soles Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Rag_n_Soles. All rights reserved.</p>
            <p>123 Tech Avenue, Innovation City, TC 12345</p>
            <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
    `

    const subject = "Verify Your Email - Rag_n_Soles"

    this.sendEmail(subject, email, html)
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
                // callback_url:"https://deestar.netlify.app/",
                // https://rags-and-soles.netlify.app/order-detail/{orderId}?source=paystack&status=true
                callback_url: process.env.WEB_BASE_URL+ `/order-detail/{orderId}?source=paystack&status=true`,
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

exports.sendAdminMailCredentials = (email, password) => {
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin credentials - Rag_n_Soles</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #4a148c; /* Deep purple */
            padding: 20px;
            text-align: center;
        }
        .logo {
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        .content {
            padding: 30px;
        }
        .verification-box {
            background-color: #f3e5f5; /* Light purple background */
            border-radius: 5px;
            padding: 25px;
            margin: 20px 0;
            text-align: center;
        }
        .button {
            display: inline-block;
            background-color: #7b1fa2; /* Medium purple */
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
            font-size: 16px;
        }
        .credentials {
            background-color: #f1f1f1;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
        }
        .disclaimer {
            background-color: #ede7f6; /* Very light purple */
            padding: 15px;
            border-left: 4px solid #9575cd; /* Light-medium purple */
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f5f5f5;
            color: #757575;
            font-size: 12px;
        }
        a {
            color: #6a1b9a; /* Dark purple for links */
            text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">Rag_n_Soles</h1>
        </div>
        
        <div class="content">
            
            
            <p>Hello,</p>
            
            
            <p>Your administrator account has been successfully created. Please find your credentials below:</p>

            <div class="credentials">
                <p><strong>Username / Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password} </p>
            </div>

            <p>For security reasons, we recommend changing your password upon first login.</p>

            <p>If you did not request this account, please contact us immediately.</p>
            
        
            <p>If you have any questions or need assistance, our customer support team is here to help. Simply reply to this email or contact us at support@rag_n_Soles.com.</p>
            
            
            
            <p>Best regards,<br>
            The Rag_n_Soles Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Rag_n_Soles. All rights reserved.</p>
            <!-- <p>123 Tech Avenue, Innovation City, TC 12345</p> -->
            <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
    `

    const subject = "Admin Credentials - Rag_n_Soles"

    this.sendEmail(subject, email, html)
}

// exports.uploadToBunny = async(blob, )

exports.processFile = async (buffer, fileName) => {
    const stream = Readable.from(buffer)
    const url = await uploadToBunny(stream, fileName)

    if (!url) {
        return null
    }

    return url

}

const uploadToBunny = async (stream, fileName) => {

    // const REGION = 'YOUR_REGION'; // If German region, set this to an empty string: ''
    // const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;

    // console.log("credentials::::",BUNNY)

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
                    [PARAMS.productId]:productId,
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