import { combineReducers, createStore } from 'redux';

const REDUX_ACTIONS = {
    SET_TEXT: 'SET_TEXT',
    SET_CALENDARS: 'SET_CALENDARS',
    SET_LANGUAGE: 'SET_LANGUAGE',
    SET_TAB: 'SET_TAB',
    SET_TITLE_URL: 'SET_TITLE_URL',
    SET_SCROLL_POS: 'SET_SCROLL_POS',
    SET_TOPIC: 'SET_TOPIC',
};

const DEFAULT_STATE = {
    text: [],
    calendarMap: {},
    calendarKeys: [],
    language: "en", /* en, he, bi */
    tab: "",
    titleUrl: [],
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
        calendarMap: action.calendarMap,
        calendarKeys: action.calendarKeys,
      }
    case REDUX_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.language,
      }
    case REDUX_ACTIONS.SET_TAB:
      chrome.storage.local.set({'tab': action.tab});
      return {
        ...state,
        tab: action.tab,
      }
    case REDUX_ACTIONS.SET_TITLE_URL:
      return {
        ...state,
        titleUrl: action.titleUrl,
      }
    case REDUX_ACTIONS.SET_SCROLL_POS:
      return {
        ...state,
        initScrollPos: action.initScrollPos,
      }
    case REDUX_ACTIONS.SET_TOPIC:
      return {
        ...state,
        topic: action.topic,
      }
    default:
      return state;
    }
};

let store = createStore(reducer);
export { REDUX_ACTIONS, store };
