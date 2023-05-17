const puppeteer = require('puppeteer');
const {
  parseISO,
  compareAsc,
  isBefore,
  format
} = require('date-fns')
require('dotenv').config();
const fs = require("fs");
const os = require("os");
const {
  delay,
  sendEmail,
  sendPush,
  logStep
} = require('./utils');
const {
  siteInfo,
  loginCred,
  selectors,
  IS_PROD,
  NEXT_SCHEDULE_POLL,
  MAX_NUMBER_OF_POLL,
  COOLDOWN_TIMEOUT,
  NOTIFY_ON_DATE_BEFORE_ENV,
  RESCHEDULE_MODE,
  ACCEPTABLE_DATES_START,
  ACCEPTABLE_DATES_END
} = require('./config');
var notifyOn = NOTIFY_ON_DATE_BEFORE_ENV;
let isLoggedIn = false;
let maxTries = MAX_NUMBER_OF_POLL
var cooldownMode = false;
const timeout = 5000;

var DEBUG = !IS_PROD ? false : true

const acceptableDatesStart = parseISO(ACCEPTABLE_DATES_START);
const acceptableDatesEnd = parseISO(ACCEPTABLE_DATES_END);

var rescheduleMode = (RESCHEDULE_MODE === 'true');


const login = async (page) => {
  logStep('Logging in');
  try {
    await page.goto(siteInfo.LOGIN_URL);
    const form = await page.$(selectors.SIGN_IN_FORM);
    const email = await form.$(selectors.SIGN_IN_FORM_EMAIL);
    const password = await form.$(selectors.SIGN_IN_FORM_PASSWORD);
    const privacyTerms = await form.$(selectors.SIGN_IN_FORM_POLICY_CHECKBOX);
    const signInButton = await form.$(selectors.SIGN_IN_FORM_SUBMIT);
    await email.type(loginCred.EMAIL);
    await password.type(loginCred.PASSWORD);
    await privacyTerms.click();
    await signInButton.click();
    await page.waitForNavigation();
    return true;
  } catch (err) {
    console.log(err)
  }
}
const notifyMe = async (topic, earliestDate) => {
  var formattedDate
  if (earliestDate) {
    formattedDate = format(earliestDate, 'yyyy-MM-dd');
  }
  var subject = "";
  var body = "";
  var priority = 0;
  switch (topic) {
    case "rescheduleSuccess":
      subject = `Rescheduled to ${formattedDate}`;
      body = `Your new appointment date is ${formattedDate}`;
      priority = 1;
      logStep(`Sending a notification for reschedule success: ${formattedDate}`);

      break;
    case "newSlotAvailable":
      subject = `New date available: ${formattedDate}`;
      body = `Trying to reschedule...`;
      priority = 1;
      logStep(`Sending a notification: There is a slot on ${formattedDate}`);

      break;
    case "rescheduleFailure":
      subject = `Auto rescheduling failed`;
      body = `Try to reschedule manually ${formattedDate}`;
      priority = 0;
      logStep(`Sending a notification for reschedule failure ${formattedDate}`);

      
      break;
    case "cooldownStarted":
      subject = `Cooldown mode started`;
      var startDate = new Date();
      var time = startDate.getTime(); //convert to milliseconds since epoch
      var newTime = time + parseInt(COOLDOWN_TIMEOUT)
      var nextAttemptAt = new Date(newTime).toLocaleString()
      body = `The next attempt at ${nextAttemptAt}. Polling pace decreased. I'll notify you once ban is over.`;
      priority = 0;
      
      logStep(`Sending a notification: Cooldown started ${nextAttemptAt}`);

      break;
    case "cooldownFinished":
      subject = `Cooldown mode finished`;
      body = `Polling pace is back to regular`;
      priority = 0;
      logStep(`Sending a notification: Cooldown finished`);
      break;
    default:
      // code block
  }
  await sendPush({
    subject: subject,
    text: body,
    priority: priority
  })
  await sendEmail({
    subject: subject,
    text: body
  })
}
const reschedule = async (page, earliestDate) => {
  

  try {
    const targetPage = page;
    await page.goto(siteInfo.RESCHEDULE_URL);
    await delay(500);
    const element = await page.waitForSelector(selectors.APPOINTMENT_DATE_FIELD, targetPage, {
      timeout,
      visible: true
    });
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({
      offset: {
        x: 11.5,
        y: 8.015625,
      },
    });


    await page.waitForSelector(selectors.DATE_PICKER, {
      timeout: 5000
    })
    for (let i = 0; i < 24; i++) {
      var nextBtn = await page.$(selectors.DATE_PICKER_NEXT_MONTH_BTN);
      await page.waitForSelector(selectors.DATE_PICKER_WEEK_ROW, {
        timeout: 5000
      })
      const weeks = await page.$$(selectors.DATE_PICKER_WEEK_ROW);
      var data = [];
      for (let i = 0; i < weeks.length; i++) {
        try {
          const week = weeks[i];
          data = await week.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('td[data-handler="selectDay"]'))
            return tds.map(td => td.getAttribute("data-handler"))
          });
        } catch (e) {
          console.log(`Error: ${e}`);
        }
      }
      //If no available days in this month click next
      if (!data.includes('selectDay')) {
        await delay(100);
        // console.log("click next")
        await page.waitForSelector(selectors.DATE_PICKER_NEXT_MONTH_BTN, {
          timeout: 5000
        });
        nextBtn = await page.$(selectors.DATE_PICKER_NEXT_MONTH_BTN);
        await delay(100);
        nextBtn.click();
      } else {
        //If there is an available day — proceed
        await delay(1000);
        var theDay = await page.waitForSelector(selectors.DATE_PICKER_THE_DAY);

        var dayNumber = await page.$eval(selectors.DATE_PICKER_THE_DAY, element => element.innerHTML);


        var month = await page.$eval(selectors.DATE_PICKER_AVAILABLE_DAY, element => element.getAttribute("data-month"));
        month++; //because they start from 0
        var year = await page.$eval(selectors.DATE_PICKER_AVAILABLE_DAY, element => element.getAttribute("data-year"));

        var pageDateString = `${year}-${month}-${dayNumber}`;

        if (pageDateString === format(earliestDate, 'yyyy-MM-dd')) {
          logStep(`Cal date is the same, everything is ok`);
        } else {
          logStep(`Cal date is different: ${pageDateString} vs ${format(earliestDate, 'yyyy-MM-dd')}`);
          throw `Cal date is different: ${pageDateString} vs ${format(earliestDate, 'yyyy-MM-dd')}`;
        }

        logStep("About to click the day");
        await theDay.click({
          offset: {
            x: 2,
            y: 2,
          },
        });
        logStep("The day clicked");
        try {
          const timeSelect = await page.$('select[name="appointments[consulate_appointment][time]"]');
          await timeSelect.click({ delay: 1000 });
        } catch (err) {
          dumpError(err);
        }
        await delay(2500);
        try {
          await page.waitForSelector(selectors.TIME_PICKER_ALL_OPTIONS);
          let optionValue = await page.$$eval(selectors.TIME_PICKER_ALL_OPTIONS, options => options.find(o => o.innerText.includes(":"))?.value)
          console.log(`optionValue: ${optionValue}`);
          await delay(1500);
          await page.select(selectors.TIME_PICKER, optionValue);
        } catch (err) {
          console.log(`Select option error: ${err}`);
          dumpError(err);
        }
        try {
          await delay(500);
          const resheduleBtn = await page.$(selectors.RESCHEDULE_BTN);
          resheduleBtn.click();
        } catch (err) {
          dumpError(err)
        }
        try {
          await delay(500);
          var confirmBtn = await page.waitForSelector(selectors.RESCHEDULE_CONFIRM_BTN);
          if (IS_PROD) {
          await confirmBtn.click({
            offset: {
              x: 2,
              y: 2,
            },
          });
        } else {
          logStep(`DEV MODE: Would not confirm rescheduling in DEV mode.`);

        }
        } catch (err) {
          dumpError(err);
        }
        break;
      }
    }
    await delay(500);
    await notifyMe("rescheduleSuccess", earliestDate);
    //update env saved date
    setEnvValue("NOTIFY_ON_DATE_BEFORE_ENV", format(earliestDate, 'yyyy-MM-dd'));
    notifyOn = format(earliestDate, 'yyyy-MM-dd');
    logStep(`Reschedule success: ${format(earliestDate, 'yyyy-MM-dd')} `);
    return true
  } catch (error) {
    logStep(`Reschedule failed: ${error}`);
    dumpError(error);
    await notifyMe("rescheduleFailure", earliestDate);
  }
}
const checkForSchedules = async (page) => {
  logStep('Checking for schedules');
  await page.setExtraHTTPHeaders({
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest'
  });
  try {
    await page.goto(siteInfo.APPOINTMENTS_JSON_URL);
  } catch (err) {
    logStep("Error getting JSON dates object");
    dumpError(err);
  }
  const originalPageContent = await page.content();
  const bodyText = await page.evaluate(() => {
    return document.querySelector('body').innerText
  });
  try {
    const parsedBody = JSON.parse(bodyText);
    if (!Array.isArray(parsedBody)) {
      isLoggedIn = false;
      throw "Failed to parse dates, probably because you are not logged in";
    } else {
      if (parsedBody.length > 0) {

        if (cooldownMode) {
          await notifyMe("cooldownFinished");
          cooldownMode = false;
        }

        logStep(`Earliest slot available: ${parsedBody[0].date}`);
        const dates = parsedBody.map(item => parseISO(item.date));
        const [earliest] = dates.sort(compareAsc)
        return earliest;


      } else {
        if (!cooldownMode) {
          await notifyMe("cooldownStarted");
          logStep("No slots available, starting cooldown");
        } else {
          logStep("Still no slots available, cooldown continue");
        }
        cooldownMode = true;
        await page.close();
      }
    }
  } catch (err) {
    console.log(`catch called: ${err}`);
    console.log("Unable to parse page JSON content", originalPageContent);
    dumpError(err);

    isLoggedIn = false;
  }
}
const process = async (browser) => {
  logStep(`New attempt. ${maxTries} tries left`);
  if (maxTries-- <= 0) {
    logStep('Reached Max tries');

    return
  }

  let page = null;
  const pages = await browser.pages();
  page = pages.length ? pages[0] : await browser.newPage();

  if (!isLoggedIn) {
    isLoggedIn = await login(page);
  }
  const earliestDate = await checkForSchedules(page);
  if (earliestDate && isBefore(earliestDate, parseISO(notifyOn))) {
    if (!earliestDate.isBetween(acceptableDatesStart, acceptableDatesEnd)) {

      logStep("The date available IS NOT within the range you set as acceptable");
      
    } else {
      DEBUG && logStep("The date available IS within the range you set as acceptable");

      await notifyMe("newSlotAvailable", earliestDate);
      if (rescheduleMode) {
        await reschedule(page, earliestDate);
        DEBUG && logStep(`Reschedule mode enabled`);
      } else {
        console.log("Reschedule mode disabled, so that's it.");
      }

    }
    


  } else {
    logStep(`No earlier timeslots ¯|_(ツ)_|¯ `);

  }
  if (!cooldownMode) {
    await delay(NEXT_SCHEDULE_POLL)
  } else {
    isLoggedIn = false;

    logStep("Cooldown started");

    await delay(COOLDOWN_TIMEOUT);
    if (COOLDOWN_TIMEOUT >= 1800000) {
      isLoggedIn = false;
    }

    logStep("Cooldown passed");


  }
  await process(browser)
}
//MARK: 
(async () => {
  var browser;
  if (os.platform() == 'linux') {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] //This line for running as root in docker. Remove it if you run app differently
    });
  } else {
    browser = await puppeteer.launch({
      headless: !IS_PROD ? false : true
    });
  }

  try {
    await process(browser);
  } catch (err) {
    console.error(err);
  }
  await browser.close();
})();

async function scrollIntoViewIfNeeded(element, timeout) {
  await waitForConnected(element, timeout);
  const isInViewport = await element.isIntersectingViewport({
    threshold: 0
  });
  if (isInViewport) {
    return;
  }
  await element.evaluate(element => {
    element.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'auto',
    });
  });
  await waitForInViewport(element, timeout);
}

async function waitForConnected(element, timeout) {
  await waitForFunction(async () => {
    return await element.getProperty('isConnected');
  }, timeout);
}

async function waitForFunction(fn, timeout) {
  let isActive = true;
  setTimeout(() => {
    isActive = false;
  }, timeout);
  while (isActive) {
    const result = await fn();
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Timed out');
}

async function waitForInViewport(element, timeout) {
  await waitForFunction(async () => {
    return await element.isIntersectingViewport({
      threshold: 0
    });
  }, timeout);
}

function setEnvValue(key, value) {
  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);
  // find the env we want based on the key
  const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
    return line.match(new RegExp(key));
  }));
  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}=${value}`);
  // write everything back to the file system
  fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

function dumpError(err) {
  if (typeof err === 'object') {
    if (err.message) {
      console.log('\nMessage: ' + err.message)
    }
    if (err.stack) {
      console.log('\nStacktrace:')
      console.log('====================')
      console.log(err.stack);
    }
  } else {
    console.log('dumpError :: argument is not an object');
  }
}
try {
  // not_defined.function_call();
} catch (err) {
  dumpError(err);
}

Date.prototype.isBetween = isBetween
function isBetween(minDate, maxDate) {
  if (!this.getTime)
    throw new Error("isBetween() was called on a non Date object")
    
  DEBUG && console.log("isBetween minDate: " + minDate);
  DEBUG && console.log("isBetween maxDate: " + maxDate);
  DEBUG && console.log("isBetween this: " + this);
    
    return this.getTime() >= minDate.getTime() && this.getTime() <= maxDate.getTime();

}
