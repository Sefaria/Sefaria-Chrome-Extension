import $ from 'webpack-zepto';
import { domain } from './const'

const dataApi = {
  init: (cb) => {
    chrome.storage.local.get(['tab', 'lastCleared', 'cachedCalendarDay', 'calendars'] , data => {
      const now = new Date();
      if (!data.lastCleared) {
        // init lastCleared var
        chrome.storage.local.set({lastCleared: new Date()});
      } else {
        const lastCleared = new Date(data.lastCleared);
        const daysTilSecondShabbat = (7 - lastCleared.getDay()) + 7;
        const expirationMSecs = daysTilSecondShabbat * 24 * 60 * 60 * 1000;
        if ((now.getTime() - lastCleared.getTime()) > expirationMSecs) {
          chrome.storage.local.clear();
        }
      }

      if (!data.cachedCalendarDay) {
        chrome.storage.local.set({cachedCalendarDay: (new Date()).getDay()})
      } else if (now.getDay() !== data.cachedCalendarDay) {
        chrome.storage.local.remove('calendars');
        data.calendars = null; // this datum is too old
        chrome.storage.local.set({cachedCalendarDay: now.getDay()});
      }

      cb(data);
    });

  },
  _currentRequest: null,
  _currentRequestName: null,
  _setRunningRequest: (ajax, name) => {
    dataApi._currentRequest = ajax;
    dataApi._currentRequestName = name;
  },
  abortRunningRequest: () => {
    if (!!dataApi._currentRequest) {
      console.log("aborting", dataApi._currentRequestName);
      dataApi._currentRequest.abort();
      dataApi._currentRequest = null;
      dataApi._currentRequestName = null;
    }
  },
  getCalendars: (cb) => {
    const date = (new Date()).toDateString();
    const calendarKey = 'calendars' + date;
    chrome.storage.local.get(calendarKey, data => {
      if (data[calendarKey]) {
        if (cb) { cb(data[calendarKey]); }
      } else {
        const request = $.ajax({
          url: `${domain}/api/calendars`,
          success: calendars => {
            chrome.storage.local.set({ [calendarKey]: calendars });
            if (cb) { cb(calendars); }
          },
          error: dataApi._handle_error,
        });
        dataApi._setRunningRequest(request, 'getCalendars');
      }
    });
  },
  getCalendarText: (calendars, calendar, cb) => {
    for (let calObj of calendars) {
      if (calObj.title.en === calendar) {
        console.log("cal url", calObj.url);
        const url = `${domain}/api/texts/${calObj.url}?context=0&pad=0&commentary=0`;
        const siteUrl = dataApi.api2siteUrl(url);
        chrome.storage.local.get(siteUrl, data => {
          const cached = data[siteUrl];
          if (cached) {
            console.log(calendar, "from cache");
            cb(cached.text, null, cached.jqXHR, cached.initScrollPos, true);
          } else {
            console.log(calendar, "NOT from cache");
            const request = $.ajax({
              url,
              success: cb,
              error: dataApi._handle_error,
            });
            dataApi._setRunningRequest(request, 'getCalendarText');
          }
        });
        return;
      }
    }
  },
  getRandomSource: (cb) => {
    const request = $.ajax({
      url: `${domain}/api/texts/random-by-topic`,
      success: (data) => {
        const url = `${domain}/api/texts/${!!data.url ? data.url : data.ref}?context=0&pad=0&commentary=0`;
        const request = $.ajax({
          url,
          success: cb.bind(null, data.topic),
          error: dataApi._handle_error,
        });
        dataApi._setRunningRequest(request, 'random get text api');
      },
      error: dataApi._handle_error,
    });
    dataApi._setRunningRequest(request, 'random-by-topic api');
  },
  api2siteUrl: url => (
    //take out api and remove all url params
    url.replace('/api/texts','').replace(/\?[^/]+$/,'')
  ),
  _handle_error: (jqXHR, textStatus, errorThrown) => {
    if (textStatus == "abort") {
      console.log("abort abort!!");
      return;
    } else {
      console.log("actual error", textStatus);
    }
  },
  sendSlackMessage: (text) => {
    $.ajax({
      url: "https://hooks.slack.com/services/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",
      type: "POST",
      data: JSON.stringify({ text }),
    });
  },
}

export default dataApi;
