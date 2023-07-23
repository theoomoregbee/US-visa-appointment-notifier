const config = require('./config');
const fetch = require("node-fetch");

const debug = async (page, logName, saveScreenShot) => {
  if(saveScreenShot){
    await page.screenshot({path: `${logName}.png`});
  }

  await page.evaluate(() => {
    debugger;
  });
};

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const sendText = async (params) => {
  const text = params.text;
  const url = config.telegram.url + "/sendMessage?chat_id="+config.telegram.chat+"&parse_mode=MarkdownV2&text="+ encodeURIComponent(text);
  fetch(url).then((response) => {
    console.log("======>>> Response", response);
  });
}

const logStep = (stepTitle) => {
  console.log("=====>>> Step:", stepTitle);
}

module.exports = {
  debug,
  delay,
  sendText,
  logStep
}
