import React from 'react';
import PropTypes from 'prop-types';
import TextChoice from './TextChoice';

const TextChooser = ({ onTabClick, calendars, tab }) => {
  let tabArray = [{title: {en: "Random", he: "אקראי"}}];
  if (!!calendars) {
    tabArray = tabArray.concat(calendars);
  }
  return (
    <div className="text-chooser">
      {
        tabArray.map(tabObj =>
          <TextChoice
            key={tabObj.title.en}
            tabObj={tabObj}
            onClick={()=>{onTabClick(tabObj.title.en)}}
            isSelected={tabObj.title.en === tab}
          />
        )
      }
    </div>
  );
};

TextChooser.propTypes = {
  onTabClick: PropTypes.func.isRequired,
  calendars:  PropTypes.array,
  tab:        PropTypes.string,
}

export default TextChooser;
