//based on https://developer.chrome.com/extensions/event_pages
//and https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/extensions/gmail/background.js

import dataApi from './dataApi';
import $ from 'webpack-zepto';

const oldChromeVersion = !chrome.runtime;
var requestTimerId;
const ALARM_MINUTES = 60;

function startRequest() {
  const now = new Date();
  //DEBUG dataApi.sendSlackMessage(`Starting request at  ${now.toString()}`);
  dataApi.init((data) => {
    if (!!data.calendars) {
      requestAllCalendars(data.calendars);
    } else {
      dataApi.getCalendars((data) => {
        requestAllCalendars(data);
      });
    }
  });
}

function requestAllCalendars(calendars) {
  for (let c of calendars) {
    dataApi.getCalendarTextRecursive([c], 0, {}, onGetCalendarText);
  }
}

function onGetCalendarText(text, status, jqXHR, initScrollPos, fromCache) {
  const siteUrl = jqXHR.map((tempJqXHR)=>dataApi.api2siteUrl(tempJqXHR.responseURL));
  for (let i = 0; i < fromCache.length; i++) {
    const tempFromCache = fromCache[i];
    if (!tempFromCache) {
      console.log("caching", siteUrl[i]);
      chrome.storage.local.set({[siteUrl[i]]: { text: text[i], jqXHR: { responseURL: jqXHR[i].responseURL } }});
    }
  }
}

function scheduleRequest() {
  if (oldChromeVersion) {
    if (requestTimerId) {
      window.clearTimeout(requestTimerId);
    }
    requestTimerId = window.setTimeout(onAlarm, ALARM_MINUTES*60*1000);
  } else {
    console.log('Creating alarm');
    // Use a repeating alarm so that it fires again if there was a problem
    // setting the next alarm.
    chrome.alarms.create('refresh', {periodInMinutes: ALARM_MINUTES});
  }
}

function onInit() {
  scheduleRequest();
}
function onAlarm(alarm) {
  console.log('Got alarm', alarm);
  // |alarm| can be undefined because onAlarm also gets called from
  // window.setTimeout on old chrome versions.
  if (alarm && alarm.name == 'watchdog') {
    onWatchdog();
  } else {
    startRequest();
  }
}
function onWatchdog() {
  chrome.alarms.get('refresh', function(alarm) {
    if (alarm) {
      console.log('Refresh alarm exists. Yay.');
    } else {
      console.log('Refresh alarm doesn\'t exist!? ' +
                  'Refreshing now and rescheduling.');
      startRequest();
    }
  });
}

if (oldChromeVersion) {
  onInit();
} else {
  chrome.runtime.onInstalled.addListener(onInit);
  chrome.alarms.onAlarm.addListener(onAlarm);
}

if (chrome.runtime && chrome.runtime.onStartup) {
  console.log('Starting browser... updating icon.');
  startRequest();
} else {
  // This hack is needed because Chrome 22 does not persist browserAction icon
  // state, and also doesn't expose onStartup. So the icon always starts out in
  // wrong state. We don't actually use onStartup except as a clue that we're
  // in a version of Chrome that has this problem.
  chrome.windows.onCreated.addListener(function() {
    console.log('Window created... updating icon.');
    startRequest();
  });
}
