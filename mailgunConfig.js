const mailgun = require('mailgun-js');
require('dotenv').config();

const mailgunConfig = {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
};

const mg = mailgun(mailgunConfig);

module.exports = mg;
