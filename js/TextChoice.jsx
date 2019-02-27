import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import palette from './palette';

// see https://stackoverflow.com/questions/6600868/set-default-value-of-javascript-object-attributes
const handler = {
  get: function(target, name) {
    return target.hasOwnProperty(name) ? target[name] : {};
  }
};

const HARD_CODED_NAMES = new Proxy({
  "Daily Rambam": {
    en: "Rambam",
    he: "רמב״ם",
  },
  "Daily Mishnah": {
    en: "Mishnah",
    he: "משנה",
  },
  "Parashat Hashavua": {
    en: "Parasha",
    he: "פרשה",
  },
  "Daily Rambam (3)": {
    en: "Rambam (3)",
    he: "רמב״ם (3)",
  },
}, handler);

const TextChoice = ({ onClick, tabObj, isSelected, language }) => {
  const classes = classNames({ enSerif: language !== 'he', heSerif: language === 'he', choice: 1, selected: isSelected });
  const menuLanguage = language === 'he' ? 'he' : 'en';
  return (
    <div onClick={onClick} className="choiceWrapper">
      <div className="categoryColorLine" style={{backgroundColor: palette.categoryColor(tabObj.title.en)}}></div>
      <div className={ classes }>
        { HARD_CODED_NAMES[tabObj.title.en][menuLanguage] || tabObj.title[menuLanguage] }
      </div>
    </div>
  );
}

TextChoice.propTypes = {
  onClick: PropTypes.func.isRequired,
  tabObj:  PropTypes.object.isRequired,
  language:   PropTypes.oneOf(["en", "bi", "he"]).isRequired,
}

export default TextChoice;
