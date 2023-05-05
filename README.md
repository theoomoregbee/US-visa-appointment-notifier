# US-visa-appointment-notifier


This is forked from [theoomoregbee/US-visa-appointment-notifier](https://github.com/theoomoregbee/US-visa-appointment-notifier) Thanks [theoomoregbee](https://github.com/theoomoregbee) for creating it!

This version would not only notify you when a time slot found, but also would try to reschedule the appointment for you.

Changes:

- Push notifications via PushOver
- Notifications sent when slot is found, rescheduling success or failure, cooldown started.
- Rescheduling. (Works as per 01 May 2023. Would definitely break in the future) 


```
$ npm start
=====>>> Step: starting process with 250 tries left
=====>>> Step: logging in
=====>>> Step: checking for schedules
[{"date":"2023-02-08","business_day":true},{"date":"2023-04-26","business_day":true},{"date":"2023-10-11","business_day":true}]
=====>>> Step: starting process with 249 tries left
=====>>> Step: checking for schedules
[{"date":"2023-04-26","business_day":true},{"date":"2023-10-11","business_day":true}]
=====>>> Step: starting process with 248 tries left
=====>>> Step: checking for schedules
[{"date":"2023-10-11","business_day":true}]
=====>>> Step: sending an email to schedule for 2023-10-11
...
```

![email notification sample](./email-screen-shot.png)


## How it works

* Logs you into the portal
* Checks for schedules by day 
* If there's a date before your initial appointment, it notifies you via email and tries to reschedule the appointment for you
* If no dates found, the process waits for set amount of seconds and will stop when it reaches the set max retries.
* Once you get temporarily banned, the cooldown period would start.
> see `config.js` or `.env.example` for values you can configure

## Configuration

copy the example configuration file exampe in `.env.example`, rename the copied version to `.env` and replace the values.

### MailGun config values 

You can create a free account with https://www.mailgun.com/ which should be sufficient and use the provided sandbox domain on your dashboard. The `MAILGUN_API_KEY` can be found in your Mailgun dashboard, it starts with `key-xxxxxx`. You'll need to add authorised recipients to your sandbox domain for free accounts

### PushOver config values 

Create a free trial account with https://pushover.net/. Create a new app at https://pushover.net/apps/build and copy API Token/Key to PUSHOVER_TOKEN at .env. Put your user_key to PUSHOVER_USER.



## FAQ

* How do I get my facility ID - https://github.com/theoomoregbee/US-visa-appointment-notifier/issues/3
* How do I get my schedule ID - https://github.com/theoomoregbee/US-visa-appointment-notifier/issues/8, https://github.com/theoomoregbee/US-visa-appointment-notifier/issues/7#issuecomment-1372565292
* How to setup Mailgun Authorised recipients - https://github.com/theoomoregbee/US-visa-appointment-notifier/issues/5

## How to use it

* clone the repo 
* run `npm i` within the cloned repo directory
* start the process with `npm start`


