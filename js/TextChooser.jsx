import React from 'react';
import PropTypes from 'prop-types';
import TextChoice from './TextChoice';

const TextChooser = ({ onTabClick, calendarMap, calendarKeys, tab }) => {
  let tabMap = {Random : [{title: {en: "Random", he: "אקראי"}}]};
  let tabKeys = ["Random"];
  if (!!calendarMap) {
    tabMap = {
      ...tabMap,
      ...calendarMap,
    };
    tabKeys = calendarKeys.concat(tabKeys);
  }
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
}

export default TextChooser;
