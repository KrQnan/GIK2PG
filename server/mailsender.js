let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply.comfy@gmail.com',
    pass: 'ohEoRxF4#JVR!gp4gZsg'
  }
});

const sendComfirmation = async (email, name, items) => {

    let mailContents = `Thank you ${name} for ordering at Comfy!

We have now recieved your order and will soon start to pack it and send it to you!

Order Contents:
`;
    let ordertotal = 0;
    for (let i = 0; i < items.length; ++i) {
        let itemString = `${items[i].quantity} st ${items[i].pname} for ${items[i].price} each\n`;
        mailContents += itemString;
        ordertotal += items[i].quantity * items[i].price;
    }

    mailContents += `Order total:
${ordertotal} SEK`;

    let mailOptions = {
        from: "noreply.comfy@gmail.com",
        to: email,
        subject: "Comfy has recieved your order!",
        text: mailContents
    }

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        }
      });
}

module.exports = {
    sendComfirmation:sendComfirmation
}