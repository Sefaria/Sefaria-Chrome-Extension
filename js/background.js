//Originally based on https://developer.chrome.com/extensions/event_pages, now migrated to https://developer.chrome.com/docs/extensions/develop/concepts/service-workers

import dataApi from './dataApi';

const ALARM_MINUTES = 60;

function startRequest() {
  dataApi.init((data) => {
    if (data.calendars) {
      requestAllCalendars(data.calendars);
    } else {
      dataApi.getCalendars((data) => {
        requestAllCalendars(data);
      });
    }
  });
}

function requestAllCalendars(calendars) {
  for (let calendar of calendars) {
    dataApi.getCalendarTextRecursive([calendar], 0, {}, onGetCalendarText);
  }
}

function onGetCalendarText(text, responseURL, initScrollPos, fromCache) {
  const siteUrls = responseURL.map(dataApi.api2siteUrl);
  for (let i = 0; i < fromCache.length; i++) {
    if (!fromCache[i]) {
      dataApi.saveToLocal({ [siteUrls[i]]: { text: text[i], responseURL: responseURL[i] } });
    }
  }
}

function scheduleRequest() {
  chrome.alarms.create('refresh', { periodInMinutes: ALARM_MINUTES });
}

function onAlarm(alarm) {
  if (alarm.name === 'refresh') {
    startRequest();
  } else if (alarm.name === 'watchdog') {
    onWatchdog();
  }
}

function onWatchdog() {
  chrome.alarms.get('refresh', (alarm) => {
    if (!alarm) {
      startRequest();
    }
  });
}

chrome.runtime.onInstalled.addListener(scheduleRequest);
chrome.alarms.onAlarm.addListener(onAlarm);

if (chrome.runtime.onStartup) {
  chrome.runtime.onStartup.addListener(startRequest);
} else {
  chrome.windows.onCreated.addListener(startRequest);
}
