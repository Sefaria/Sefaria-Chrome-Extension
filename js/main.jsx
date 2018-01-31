//zip -r chrome.zip Sefaria-Chrome-Extension -x '*node_modules*'

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Component from 'react-class';
import { Provider, connect } from 'react-redux';
import { REDUX_ACTIONS, store } from './ReduxStore';
import TextManager from './TextManager';
import dataApi from './dataApi';
import { domain } from './const';


const getTextForTab = tab => {
  const currTab = store.getState().tab;
  store.dispatch({ type: REDUX_ACTIONS.SET_TEXT, text: [] });
  store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: [] });
  if (tab === "Random") {
    dataApi.getRandomSource(onRandomApi);
  } else {
    //calendars
    dataApi.getCalendarText(store.getState().calendarMap, tab, onTextApi);
  }
}

const mapCalendars = calendars => {
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
}

const onTextApi = (text, status, jqXHR, initScrollPos, fromCache) => {
  store.dispatch({ type: REDUX_ACTIONS.SET_SCROLL_POS, initScrollPos });
  store.dispatch({type: REDUX_ACTIONS.SET_TEXT, text});
  const siteUrl = jqXHR.map((tempJqXHR)=>dataApi.api2siteUrl(tempJqXHR.responseURL));
  store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: siteUrl });
  for (let i = 0; i < fromCache.length; i++) {
    const tempFromCache = fromCache[i];
    if (!tempFromCache) {
      chrome.storage.local.set({[siteUrl[i]]: { text: text[i], jqXHR: { responseURL: jqXHR[i].responseURL } }});
    }
  }
}

const onRandomApi = (topic, text, status, jqXHR, initScrollPos, fromCache) => {
  store.dispatch({ type: REDUX_ACTIONS.SET_TOPIC, topic: topic });
  onTextApi([text], [status], [jqXHR], initScrollPos, [fromCache]);
}

const mapStateToProps = state => {
  return {
    title: state.text && state.text.length > 0 ? (state.language === "en" ? state.text[0].ref : state.text[0].heRef) : "",
    titleUrl: state.titleUrl,
    text: state.text,
    calendarMap: state.calendarMap,
    calendarKeys: state.calendarKeys,
    tab: state.tab,
    initScrollPos: state.initScrollPos,
    topic: state.topic,
    topicUrl: `${domain}/topics/${state.topic}`,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    onTabClick: tab => {
      dataApi.abortRunningRequest();
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
//chrome.storage.local.clear(()=>{ console.log("cleared"); });
dataApi.init((data) => {
  if (!!data.calendars) {
    store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, ...mapCalendars(data.calendars) });
  }

  const initTab = !!data.tab ? data.tab : "Random";
  store.dispatch({type: REDUX_ACTIONS.SET_TAB, tab: initTab});
  dataApi.getCalendars((data) => {
    store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, ...mapCalendars(data) });
    getTextForTab(initTab);
  });
});
ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById("root")
);
