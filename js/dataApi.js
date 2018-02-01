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
  getCalendarTextRecursive: (calObjArray, i, resultArray, cb) => {
    const realCb = (text, status, jqXHR, initScrollPos, fromCache) => {
      if (!!resultArray.text) { resultArray.text.push(text); }
      else                    { resultArray.text = [text]; }
      if (!!resultArray.status) { resultArray.status.push(status); }
      else                      { resultArray.status = [status]; }
      if (!!resultArray.jqXHR) { resultArray.jqXHR.push(jqXHR); }
      else                     { resultArray.jqXHR = [jqXHR]; }
      if (!!resultArray.fromCache) { resultArray.fromCache.push(fromCache); }
      else                         { resultArray.fromCache = [fromCache]; }

      if (i === calObjArray.length - 1 ) {
        cb(resultArray.text, resultArray.status, resultArray.jqXHR, initScrollPos, resultArray.fromCache);
      } else {
        dataApi.getCalendarTextRecursive(calObjArray, i+1, resultArray, cb);
      }
    }
    const calObj = calObjArray[i];
    const url = `${domain}/api/texts/${calObj.url}?context=0&pad=0&commentary=0`;
    const siteUrl = dataApi.api2siteUrl(url);
    chrome.storage.local.get(siteUrl, data => {
      const cached = data[siteUrl];
      if (!!cached && false) {
        //console.log(calendar, "from cache");
        realCb(cached.text, null, cached.jqXHR, cached.initScrollPos, true);
      } else {
        //console.log(calendar, "NOT from cache");
        const request = $.ajax({
          url,
          success: realCb,
          error: dataApi._handle_error,
        });
        dataApi._setRunningRequest(request, 'getCalendarText');
      }
    });
  },
  getCalendarText: (calendarMap, calendar, cb) => {
    const calObjArray = calendarMap[calendar];
    if (!!calObjArray) {
      dataApi.getCalendarTextRecursive(calObjArray, 0, {}, cb);
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
