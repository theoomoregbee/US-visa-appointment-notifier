const Mailgun = require('mailgun.js');
const formData = require('form-data');

const mailgun = new Mailgun(formData);
const config = require('./config');
const mg = mailgun.client({username: 'api', key: config.mailgun.API_KEY});

const debug = async (page, logName, saveScreenShot) => {
  if(saveScreenShot){
    await page.screenshot({path: `${logName}.png`});
  }

  await page.evaluate(() => {
    debugger;
  });
};

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const sendEmail = async (params) => {
  const data = {
    from: 'No reply <noreply@visa-schedule-check>',
    to: config.NOTIFY_EMAILS,
    subject: 'Hello US VISA schedules',
    ...params
  };
  await mg.messages.create(config.mailgun.DOMAIN, data)
};

const logStep = (stepTitle) => {
  console.log("=====>>> Step:", stepTitle);
}

module.exports = {
  debug,
  delay,
  sendEmail,
  logStep
}
