import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

// 1. Compile the Handlebars Template
const templatePath = path.join(__dirname, 'order-email-template.html');
const source = fs.readFileSync(templatePath, 'utf8');
const template = handlebars.compile(source);

// 2. Sample Data
const data = {
  customerName: 'Jane Doe',
  orderId: 'RNS-294102',
  status: 'Paid',
  orderDate: '2025-08-01',
  totalAmount: '35,000',
  items: [
    {
      name: 'Tan Leather Sneakers',
      size: 'EU 42',
      quantity: 1,
      price: '22,000',
      image: 'https://cdn.example.com/products/1234.jpg',
    },
    {
      name: 'Vintage Denim Jacket',
      size: 'L',
      quantity: 1,
      price: '13,000',
      image: 'https://cdn.example.com/products/5678.jpg',
    },
  ],
  delivery: {
    recipient: 'Jane Doe',
    address: '14 Awolowo Road, Lagos, Nigeria',
    phone: '+2348012345678',
    zone: 'Mainland',
    estimate: '2-3 business days',
  },
  orderLink: 'https://ragsandsoles.com/orders/RNS-294102',
};

exports.createTemplate = (data) =>{
  return template(data)
}


// 3. Render HTML from template
// const htmlContent = template(data);

// // 4. Create Nodemailer Transport
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // or 'SendGrid', 'Mailgun', etc.
//   auth: {
//     user: 'youremail@example.com',
//     pass: 'yourpassword', // use app password for Gmail
//   },
// });

// // 5. Define Email Options
// const mailOptions = {
//   from: '"Rags & Soles" <youremail@example.com>',
//   to: 'jane@example.com',
//   subject: `Your Order Confirmation - ${data.orderId}`,
//   html: htmlContent,
// };

// // 6. Send the Email
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     return console.error('❌ Failed to send email:', error);
//   }
//   console.log(`✅ Email sent to ${mailOptions.to}:`, info.response);
// });