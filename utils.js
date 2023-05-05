const Mailgun = require('mailgun.js');
const formData = require('form-data');
var Push = require('pushover-notifications');

const mailgun = new Mailgun(formData);
const config = require('./config');
const mg = mailgun.client({
    username: 'api',
    key: config.mailgun.API_KEY
});



const debug = async (page, logName, saveScreenShot) => {
    if (saveScreenShot) {
        await page.screenshot({
            path: `${logName}.png`
        });
    }

    await page.evaluate(() => {
        //debugger;
    });
};

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const sendPush = async (params) => {

    var msg = {
        // These values correspond to the parameters detailed on https://pushover.net/api
        // 'message' is required. All other values are optional.
        message: params.text, // required
        title: params.subject,
        sound: 'magic',
        device: 'devicename',
        priority: params.priority
    }

    var p = new Push({
        user: process.env['PUSHOVER_USER'],
        token: process.env['PUSHOVER_TOKEN'],
    })
    
    p.send(msg, function(err, result) {
        try {
            console.log(result)
        } catch (err) {
            console.log(err);
        }
        
 
    })

};


const sendEmail = async (params) => {
    const data = {
        from: config.NOTIFY_EMAILS,
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
    sendPush,
    logStep
}