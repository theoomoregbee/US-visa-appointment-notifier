const Mailgun = require('mailgun.js');
const formData = require('form-data');
var Push = require('pushover-notifications');

var TelegramBot = require('node-telegram-bot-api');



const mailgun = new Mailgun(formData);
const config = require('./config');
const mg = mailgun.client({
    username: 'api',
    key: config.mailgun.API_KEY
});

var tg_token = config.TG_TOKEN;

var bot = new TelegramBot(tg_token, { polling: false });




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
            console.log()
            logStep("Notification sent: " + result);

        } catch (err) {
            console.log(err);
        }
        
 
    })

};

const sendTg = async (params) => {

        var chatId = config.TG_CHAT_TO_NOTIFY; // Берем ID чата (не отправителя)
       
        await bot.sendMessage(chatId, params.text );
 
};


const sendEmail = async (params) => {
    const data = {
        from: config.NOTIFY_EMAILS_FROM,
        to: config.NOTIFY_EMAILS,
        subject: 'US VISA schedules',
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
    sendTg,
    logStep
}