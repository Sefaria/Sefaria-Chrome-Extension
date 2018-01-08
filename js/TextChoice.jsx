import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import palette from './palette';


//TODO support language
const TextChoice = ({ onClick, tabObj, isSelected }) => {
  const classes = classNames({ enSerif: 1, choice: 1, selected: isSelected });
  return (
    <div onClick={onClick} className="choiceWrapper">
      <div className="categoryColorLine" style={{backgroundColor: palette.categoryColor(tabObj.title.en)}}></div>
      <div className={ classes }>
        { tabObj.title.en }
      </div>
    </div>
  );
}

TextChoice.propTypes = {
  onClick: PropTypes.func.isRequired,
  tabObj:  PropTypes.object.isRequired,
}

export default TextChoice;
