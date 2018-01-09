//zip -r chrome.zip Sefaria-Chrome-Extension -x '*node_modules*'

import $ from 'webpack-zepto';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Component from 'react-class';
import { Provider, connect } from 'react-redux';
import { REDUX_ACTIONS, store } from './ReduxStore';
import TextManager from './TextManager';

const domain = "https://www.sefaria.org";

const init = () => {
  chrome.storage.local.get(['tab', 'lastCleared', 'cachedCalendarDay', 'calendars'] , data => {
    if (!!data.calendars) {
      store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, calendars: data.calendars });
    }

    const initTab = !!data.tab ? data.tab : "Random";
    store.dispatch({type: REDUX_ACTIONS.SET_TAB, tab: initTab});
    getTextForTab(initTab);

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
      chrome.storage.local.set({cachedCalendarDay: now.getDay()});
    }
  });

  getCalendars();
}

const handleScroll = e => {
  console.log(e);
}

const getTextForTab = tab => {
  const currTab = store.getState().tab;
  if (tab === "Random") {
    getRandomSource();
  } else {
    //calendars
    getCalendarText(tab);
  }
}

const flattenArray = (array) => {
  if (array.constructor === String) {
    return [array];
  }
  while (true) {
    if ((array.length > 0 && array[0].constructor === String) || array.length === 0) {
      return array;
    } else {
      array = array.reduce((accum, curr) => accum.concat(curr), []);
    }
  }
}

const getTextFromState = s => {
  if (!s.text) return null;
  return { en: flattenArray(s.text.text), he: flattenArray(s.text.he)};
}

const api2siteUrl = url => (
  //take out api and remove all url params
  url.replace('/api/texts','').replace(/\?[^/]+$/,'')
);

const onTextApi = (text, status, jqXHR, fromCache) => {
  store.dispatch({type: REDUX_ACTIONS.SET_TEXT, text});
  const siteUrl = api2siteUrl(jqXHR.responseURL);
  store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: siteUrl });
  if (!fromCache) {
    console.log("responseURL", jqXHR.responseURL);
    chrome.storage.local.set({[jqXHR.responseURL]: { text, jqXHR: { responseURL: jqXHR.responseURL } }});
  }
}

const getCalendars = () => {
  chrome.storage.local.get('calendars', data => {
    if (data.calendars) {
      store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, calendars: data.calendars });
    } else {
      $.ajax({
        url: `${domain}/api/calendars`,
        success: calendars => {
          store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, calendars });
          chrome.storage.local.set({ calendars });
        }
      });
    }
  })

}

const getCalendarText = calendar => {
  for (let calObj of store.getState().calendars) {
    if (calObj.title.en === calendar) {
      store.dispatch({ type: REDUX_ACTIONS.SET_TEXT, text: null });
      store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: "" });
      const url = `${domain}/api/texts/${calObj.url}?context=0&pad=0&commentary=0`;
      chrome.storage.local.get(url, data => {
        const cached = data[url];
        if (cached) {
          console.log("CACHED");
          onTextApi(cached.text, null, cached.jqXHR, true);
        } else {
          $.ajax({
            url,
            success: onTextApi,
          });
        }
      });
      return;
    }
  }
}

const getRandomSource = () => {
  store.dispatch({ type: REDUX_ACTIONS.SET_TEXT, text: null });
  store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: "" });
  $.ajax({
    url: `${domain}/api/texts/random-by-topic`,
    success: onTextApi,
  });
}

const mapStateToProps = state => {
  return {
    title: state.text ? (state.language === "en" ? state.text.ref : state.text.heRef) : "",
    titleUrl: state.titleUrl,
    text: getTextFromState(state),
    calendars: state.calendars,
    tab: state.tab,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    onTabClick: tab => {
      getTextForTab(tab);
      dispatch({type: REDUX_ACTIONS.SET_TAB, tab});
    },
  }
}

const Root = connect(
  mapStateToProps,
  mapDispatchToProps
)(TextManager);

//Initialize App
init();
ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById("root")
);
