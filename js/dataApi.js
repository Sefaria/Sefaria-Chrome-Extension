import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import { REDUX_ACTIONS, store, DEFAULT_STATE } from './ReduxStore';
import { domain } from './const'

const dataApi = {
  DISABLE_CACHE: false,
  init: (cb) => {
    chrome.storage.local.get(['tab', 'lastCleared', 'cachedCalendarDay', 'calendars', 'language'] , data => {
      const now = new Date();


      if (!data.cachedCalendarDay && data.cached) {
        dataApi.saveToLocal({cachedCalendarDay: (new Date()).toDateString()})
      } else if (now.toDateString() !== data.cachedCalendarDay) {
        chrome.storage.local.remove('calendars');
        data.calendars = null; // this datum is too old
        dataApi.saveToLocal({cachedCalendarDay: now.toDateString()});
      }

      cb(data);
    });

  },
  _currentRequest: null,
  _currentRequestName: null,
  _setRunningRequest: (controller, name) => {
    dataApi._currentRequest = controller;
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
      if (data[calendarKey] && !dataApi.DISABLE_CACHE) {
        if (cb) { cb(data[calendarKey]); }
      } else {
        const controller = new AbortController();
        const signal = controller.signal;
        fetch(`${domain}/api/calendars`, {method: 'GET', signal})
        .then(dataApi._handle_response)
        .then(calendars => {
          calendars = !!calendars.calendar_items ? calendars.calendar_items : calendars;  // future-proof for updated calendars api
          calendars = calendars.filter((x) => x.title.en !== 'Chok LeYisrael');
          dataApi.saveToLocal({ [calendarKey]: calendars });
          if (cb) { cb(calendars); }
        })
        .catch(dataApi._handle_error);
        dataApi._setRunningRequest(controller, 'getCalendars');
      }
    });
  },
  getCalendarTextRecursive: (calObjArray, i, resultArray, cb) => {
    const realCb = (text, responseURL, initScrollPos, fromCache) => {
      if (!!resultArray.text) { resultArray.text.push(text); }
      else                    { resultArray.text = [text]; }
      if (!!resultArray.responseURL) { resultArray.responseURL.push(responseURL); }
      else                           { resultArray.responseURL = [responseURL]; }
      if (!!resultArray.fromCache) { resultArray.fromCache.push(fromCache); }
      else                         { resultArray.fromCache = [fromCache]; }

      if (i === calObjArray.length - 1 ) {
        cb(resultArray.text, resultArray.responseURL, initScrollPos, resultArray.fromCache);
      } else {
        dataApi.getCalendarTextRecursive(calObjArray, i+1, resultArray, cb);
      }
    }
    const calObj = calObjArray[i];
    let urlRef = calObj.url;
    const url = `${domain}/api/texts/${urlRef}?context=0&pad=0&commentary=0&stripItags=1`;
    const siteUrl = dataApi.api2siteUrl(url);
    chrome.storage.local.get(siteUrl, data => {
      const cached = data[siteUrl];
      if (!!cached && !dataApi.DISABLE_CACHE) {
        //console.log(calendar, "from cache");
        realCb(cached.text, cached.responseURL, cached.initScrollPos, true);
      } else {
        //console.log(calendar, "NOT from cache");
        const controller = new AbortController();
        const signal = controller.signal;
        var responseURL;
        fetch(url, {method: 'GET', signal})
        .then(response => {
          responseURL = response.url;
          return dataApi._handle_response(response);
        })
        .then(text=> { realCb(text, responseURL); })
        .catch(dataApi._handle_error);
        dataApi._setRunningRequest(controller, 'getCalendarText');
      }
    });
  },
  getCalendarText: (calendarMap, calendar, cb) => {
    const calObjArray = calendarMap[calendar];
    if (!!calObjArray) {
      dataApi.getCalendarTextRecursive(calObjArray, 0, {}, cb);
    }
  },
  getRandomSource: cb => {
    const controller = new AbortController();
    const signal = controller.signal;
    var responseURL;
    var topic;
    fetch(`${domain}/api/texts/random-by-topic`, {method: 'GET', signal})
      .then(dataApi._handle_response)
      .then(data => {
        topic = data.topic;
        const controller = new AbortController();
        const signal = controller.signal;
        const url = `${domain}/api/texts/${!!data.url ? data.url : data.ref}?context=0&pad=0&commentary=0`;
        fetch(url, {method: 'GET', signal})
        .then(response => {
          responseURL = response.url;
          return dataApi._handle_response(response);
        })
        .then(text=>{ cb(text, topic, responseURL); })
        .catch(dataApi._handle_error);
        dataApi._setRunningRequest(controller, 'random get text api');
      })
      .catch(dataApi._handle_error);
    dataApi._setRunningRequest(controller, 'random-by-topic api');
  },
  getTextForTab: tab => {
    const currTab = store.getState().tab;
    store.dispatch({ type: REDUX_ACTIONS.SET_TEXT, text: [] });
    store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: [] });
    if (tab === "Random") {
      dataApi.getRandomSource(dataApi.onRandomApi);
    } else {
      //calendars
      dataApi.getCalendarText(store.getState().calendarMap, tab, dataApi.onTextApi);
    }
  },
  mapCalendars: calendars => {
    const calendarMap = {};
    const calendarKeys = [];
    for (let c of calendars) {
      if (c.title.en in calendarMap) { calendarMap[c.title.en].push(c); }
      else {
        calendarMap[c.title.en] = [c];
        calendarKeys.push(c.title.en);
      }
    }
    return {calendarMap, calendarKeys};
  },
  onTextApi: (text, responseURL, initScrollPos, fromCache) => {
    store.dispatch({ type: REDUX_ACTIONS.SET_SCROLL_POS, initScrollPos });
    store.dispatch({type: REDUX_ACTIONS.SET_TEXT, text});
    const siteUrl = responseURL.map(tempURL=>dataApi.api2siteUrl(tempURL));
    store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: siteUrl });
    for (let i = 0; i < fromCache.length; i++) {
      const tempFromCache = fromCache[i];
      if (!tempFromCache) {
        dataApi.saveToLocal({[siteUrl[i]]: { text: text[i], responseURL: responseURL[i] }});
      }
    }
  },
  onRandomApi: (text, topic, responseURL, initScrollPos, fromCache) => {
    store.dispatch({ type: REDUX_ACTIONS.SET_TOPIC, topic: topic });
    dataApi.onTextApi([text], [responseURL], initScrollPos, [fromCache]);
  },
  api2siteUrl: url => (
    //take out api and remove all url params
    url.replace('/api/texts','').replace(/\?[^/]+$/,'')
  ),
  siteUrl: (title, section, segment) => {
    const siteRef = `${title}.${section}.${segment}`.replace(/:/g,'.');
    return `${domain}/${siteRef}?with=all`;
  },
  _handle_error: error => {
    if (error.name == "AbortError") {
      console.log("abort abort!!");
      return;
    } else {
      console.log(error);
    }
  },
  _handle_response: response => {
    if (!response.ok) { throw Error(response.statusText); }
    else { return response.json(); }
  },
  encodeHebrewNumeral: n => {
    // Takes an integer and returns a string encoding it as a Hebrew numeral.
    n = parseInt(n);
    if (n >= 1300) {
      return n;
    }

    var values = dataApi.hebrewNumerals;

    var heb = "";
    if (n >= 100) {
      var hundreds = n - (n % 100);
      heb += values[hundreds];
      n -= hundreds;
    }
    if (n === 15 || n === 16) {
      // Catch 15/16 no matter what the hundreds column says
      heb += values[n];
    } else {
      if (n >= 10) {
        var tens = n - (n % 10);
        heb += values[tens];
        n -= tens;
      }
      if (n > 0) {
        if (!values[n]) {
            return undefined
        }
        heb += values[n];
      }
    }

    return heb;
  },
  encodeHebrewDaf: (daf, form) => {
    // Returns Hebrew daf strings from "32b"
    var form = form || "short"
    var n = parseInt(daf.slice(0,-1));
    var a = daf.slice(-1);
    if (form === "short") {
      a = {a: ".", b: ":"}[a];
      return dataApi.encodeHebrewNumeral(n) + a;
    }
    else if (form === "long"){
      a = {a: 1, b: 2}[a];
      return dataApi.encodeHebrewNumeral(n) + " " + dataApi.encodeHebrewNumeral(a);
    }
  },
  incrementHebrewDaf: (daf, increment) => {
    const num = parseInt(daf.substring(0,daf.length-1)) + Math.floor(increment/2);
    let letter = daf.substring(daf.length-1);
    letter = increment % 2 ?  (letter === 'a' ? 'b' : 'a') : letter;
    return `${num}${letter}`;
  },
  hebrewNumerals: {
    "\u05D0": 1,
    "\u05D1": 2,
    "\u05D2": 3,
    "\u05D3": 4,
    "\u05D4": 5,
    "\u05D5": 6,
    "\u05D6": 7,
    "\u05D7": 8,
    "\u05D8": 9,
    "\u05D9": 10,
    "\u05D8\u05D5": 15,
    "\u05D8\u05D6": 16,
    "\u05DB": 20,
    "\u05DC": 30,
    "\u05DE": 40,
    "\u05E0": 50,
    "\u05E1": 60,
    "\u05E2": 70,
    "\u05E4": 80,
    "\u05E6": 90,
    "\u05E7": 100,
    "\u05E8": 200,
    "\u05E9": 300,
    "\u05EA": 400,
    "\u05EA\u05E7": 500,
    "\u05EA\u05E8": 600,
    "\u05EA\u05E9": 700,
    "\u05EA\u05EA": 800,
    1: "\u05D0",
    2: "\u05D1",
    3: "\u05D2",
    4: "\u05D3",
    5: "\u05D4",
    6: "\u05D5",
    7: "\u05D6",
    8: "\u05D7",
    9: "\u05D8",
    10: "\u05D9",
    15: "\u05D8\u05D5",
    16: "\u05D8\u05D6",
    20: "\u05DB",
    30: "\u05DC",
    40: "\u05DE",
    50: "\u05E0",
    60: "\u05E1",
    70: "\u05E2",
    80: "\u05E4",
    90: "\u05E6",
    100: "\u05E7",
    200: "\u05E8",
    300: "\u05E9",
    400: "\u05EA",
    500: "\u05EA\u05E7",
    600: "\u05EA\u05E8",
    700: "\u05EA\u05E9",
    800: "\u05EA\u05EA",
    900: "\u05EA\u05EA\u05E7",
    1000: "\u05EA\u05EA\u05E8",
    1100: "\u05EA\u05EA\u05E9",
    1200: "\u05EA\u05EA\u05EA"
  },
  saveToLocal: (obj, cb, _i=0) => {
    if (_i > 5) {
      console.error("Trying too many times to save", obj);
      return;
    }
    chrome.storage.local.set(obj, dataApi._saveToLocalCB.bind(null, obj, cb, _i))
  },
  _saveToLocalCB: (obj, cb, _i) => {
    if (chrome.runtime.lastError) {
      dataApi.clearLocal(() => {
        dataApi.saveToLocal(obj, cb, _i + 1);
      });
    } else {
      if (cb) cb();
    }
  },
  clearLocal: () => {
    // clear the main portion of local storage while retaining user preferences
    const importantValues = {
      "cachedCalendarDay": null,
      "language": DEFAULT_STATE.language,
      "tab": DEFAULT_STATE.tab,
    };
    chrome.storage.local.get(importantValues, data => {
      chrome.storage.local.clear(() => {
        chrome.storage.local.set(data);
      });
    });
  }
}

export default dataApi;
