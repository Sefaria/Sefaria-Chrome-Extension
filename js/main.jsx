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
  const state = store.getState();
  getTextForTab(state.tab);
  getCalendars();
}

const getTextForTab = (tab) => {
  const currTab = store.getState().tab;
  if (tab === "Random") {
    getRandomSource();
  } else if (currTab !== tab){
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

const onTextApi = (text, status, jqXHR) => {
  store.dispatch({type: REDUX_ACTIONS.SET_TEXT, text});
  const siteUrl = api2siteUrl(jqXHR.responseURL);
  store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: siteUrl });
}

const getCalendars = () => {
  $.ajax({
    url: `${domain}/api/calendars`,
    success: calendars => {
      store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, calendars });
    }
  });
}

const getCalendarText = calendar => {
  for (let calObj of store.getState().calendars) {
    if (calObj.title.en === calendar) {
      store.dispatch({ type: REDUX_ACTIONS.SET_TEXT, text: null });
      store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: "" });
      const url = `${domain}/api/texts/${calObj.url}?context=0&pad=0&commentary=0`;
      $.ajax({
        url,
        success: onTextApi,
      })
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
