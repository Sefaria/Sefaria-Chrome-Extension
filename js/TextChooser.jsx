import React from 'react';
import PropTypes from 'prop-types';
import TextChoice from './TextChoice';

const TextChooser = ({ onTabClick, calendarMap, calendarKeys, tab, language }) => {
  let tabMap = {Random : [{title: {en: "Random", he: "אקראי"}}]};
  let tabKeys = ["Random"];
  if (!!calendarMap) {
    tabMap = {
      ...tabMap,
      ...calendarMap,
    };
    tabKeys = calendarKeys.concat(tabKeys);
  }
  if (language === 'he') { tabKeys.reverse(); }
  return (
    <div className="text-chooser">
      {
        tabKeys.map(key => {
          const tabObj = tabMap[key][0];
          return (
            <TextChoice
              key={tabObj.title.en + "|" + tabObj.url}
              tabObj={tabObj}
              onClick={()=>{onTabClick(tabObj.title.en)}}
              isSelected={tabObj.title.en === tab}
              language={language}
            />
          );
        })
      }
    </div>
  );
};

TextChooser.propTypes = {
  onTabClick: PropTypes.func.isRequired,
  calendarMap:  PropTypes.object,
  calendarKeys: PropTypes.array,
  tab:        PropTypes.string,
  language:   PropTypes.oneOf(["en", "bi", "he"]).isRequired,
}

export default TextChooser;
