import { combineReducers, createStore } from 'redux';

chrome.storage.sync.get('tab', data => {
  // Notify that we saved.
  if (data.tab) {
    store.dispatch({type: REDUX_ACTIONS.SET_TAB, tab: data.tab});
  }
});


const REDUX_ACTIONS = {
    SET_TEXT: 'SET_TEXT',
    SET_CALENDARS: 'SET_CALENDARS',
    SET_LANGUAGE: 'SET_LANGUAGE',
    SET_TAB: 'SET_TAB',
    SET_TITLE_URL: 'SET_TITLE_URL',
};

const DEFAULT_STATE = {
    text: null,
    calendars: [],
    language: "en",
    tab: "Random",
    titleUrl: "",
};

const reducer = function (state = DEFAULT_STATE, action) {
  switch (action.type) {
    case REDUX_ACTIONS.SET_TEXT:
      return {
        ...state,
        text: action.text,
      };
    case REDUX_ACTIONS.SET_CALENDARS:
      return {
        ...state,
        calendars: action.calendars,
      }
    case REDUX_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.language,
      }
    case REDUX_ACTIONS.SET_TAB:
      chrome.storage.sync.set({'tab': action.tab}, ()=>{});
      return {
        ...state,
        tab: action.tab,
      }
    case REDUX_ACTIONS.SET_TITLE_URL:
      return {
        ...state,
        titleUrl: action.titleUrl,
      }
    default:
      return state;
    }
};

let store = createStore(reducer);
export { REDUX_ACTIONS, store };
