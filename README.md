# US-visa-appointment-notifier


This is forked from [theoomoregbee/US-visa-appointment-notifier](https://github.com/theoomoregbee/US-visa-appointment-notifier) Thanks [theoomoregbee](https://github.com/theoomoregbee) for creating it!

This version would not only notify you when a time slot found, but also would try to reschedule the appointment for you.

Changes:

- Push notifications via PushOver
- Notifications sent when slot is found, rescheduling success or failure, cooldown started or finished.
- Rescheduling. (Works as per 01 May 2023. Would definitely break in the future)
- Appointment date updates in your .env file, so the script would continue to try moving your appointment earlier until you stop it or the retry limit reaches 0
- There are 4 notifications: a) New time-slot found b) Rescheduling success c) Rescheduling failure d) Cooldown start/finish. a, b, c marked as important, so the might override your phone's 'do not disturb' mode.

```
$ npm start

> us-visa-appointment-notifier@1.0.0 start
> node index.js

=====>>> Step: starting process with 1000 tries left @ 1/1/1970, 1:00:00 AM
=====>>> Step: logging in
=====>>> Step: checking for schedules
Earliest: 2024-09-24
=====>>> Step: sending an notification: There is a slot on 2024-09-24
=====>>> Step: about to click the day
=====>>> Step: The day clicked
optionValue: 09:00
=====>>> Step: sending an notification for rescudule success: 2024-09-24
=====>>> Step: Reschedule success: 2024-09-24 
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


