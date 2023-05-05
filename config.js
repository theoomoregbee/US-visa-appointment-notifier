module.exports = {
  
  selectors: {
    SIGN_IN_FORM: "form#sign_in_form",
    SIGN_IN_FORM_EMAIL: 'input[name="user[email]"]',
    SIGN_IN_FORM_PASSWORD: 'input[name="user[password]"]',
    SIGN_IN_FORM_POLICY_CHECKBOX: 'input[name="policy_confirmed"]',
    SIGN_IN_FORM_SUBMIT: 'input[name="commit"]',
    APPOINTMENT_DATE_FIELD: '#appointments_consulate_appointment_date',
    DATE_PICKER: '#ui-datepicker-div',
    DATE_PICKER_NEXT_MONTH_BTN: '#ui-datepicker-div > div.ui-datepicker-group.ui-datepicker-group-last > div > a',
    DATE_PICKER_WEEK_ROW: '#ui-datepicker-div > div.ui-datepicker-group.ui-datepicker-group-last > table > tbody > tr',
    DATE_PICKER_AVAILABLE_DAY: 'td[data-handler="selectDay"]',
    DATE_PICKER_THE_DAY: 'td[data-handler="selectDay"] > a',
    TIME_PICKER: '#appointments_consulate_appointment_time',
    TIME_PICKER_ALL_OPTIONS: '#appointments_consulate_appointment_time > option',
    RESCHEDULE_BTN: '#appointments_submit',
    RESCHEDULE_CONFIRM_BTN: 'body > div.reveal-overlay > div > div > a.button.alert'
  },
  
  loginCred:{
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD
  },

  siteInfo: {
    COUNTRY_CODE: process.env.COUNTRY_CODE || 'en-ae',
    SCHEDULE_ID: process.env.SCHEDULE_ID,
    FACILITY_ID: process.env.FACILITY_ID,

    get APPOINTMENTS_JSON_URL(){
      return `https://ais.usvisa-info.com/${this.COUNTRY_CODE}/niv/schedule/${this.SCHEDULE_ID}/appointment/days/${this.FACILITY_ID}.json?appointments%5Bexpedite%5D=false`
    },

    get LOGIN_URL () {
      return `https://ais.usvisa-info.com/${this.COUNTRY_CODE}/niv/users/sign_in`
    },
    
    get RESCHEDULE_URL () {
      return `https://ais.usvisa-info.com/${this.COUNTRY_CODE}/niv/schedule/${this.SCHEDULE_ID}/appointment`
    }
    
  },
  IS_PROD: process.env.NODE_ENV === 'prod',
  NEXT_SCHEDULE_POLL: process.env.NEXT_SCHEDULE_POLL || 30_000, // default to 30 seconds
  MAX_NUMBER_OF_POLL: process.env.MAX_NUMBER_OF_POLL || 250, // number of polls before stopping
  COOLDOWN_TIMEOUT: process.env.COOLDOWN_TIMEOUT || 18_000_000, //5 hours
  NOTIFY_ON_DATE_BEFORE: process.env.NOTIFY_ON_DATE_BEFORE, // in ISO format i.e YYYY-MM-DD

  NOTIFY_EMAILS: process.env.NOTIFY_EMAILS, // comma separated list of emails
  mailgun: {
    USERNAME: process.env.MAILGUN_USERNAME,
    DOMAIN: process.env.MAILGUN_DOMAIN,
    API_KEY: process.env.MAILGUN_API_KEY,
  }
}
