//zip -r chrome.zip Sefaria-Chrome-Extension -x '*node_modules*'

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { REDUX_ACTIONS, store } from './ReduxStore';
import TextManager from './TextManager';
import dataApi from './dataApi';

//Initialize App
//chrome.storage.local.clear(()=>{ console.log("cleared"); });
dataApi.init((data) => {
  if (!!data.calendars && !dataApi.DISABLE_CACHE) {
    store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, ...dataApi.mapCalendars(data.calendars) });
  }

  const initTab = !!data.tab ? data.tab : "Random";
  store.dispatch({type: REDUX_ACTIONS.SET_TAB, tab: initTab});
  dataApi.getCalendars((data) => {
    store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, ...dataApi.mapCalendars(data) });
    dataApi.getTextForTab(initTab);
  });
});
ReactDOM.render(
  <Provider store={store}>
    <TextManager />
  </Provider>,
  document.getElementById("root")
);
