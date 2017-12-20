import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


//TODO support language
const TextChoice = ({ onClick, tabObj, isSelected }) => {
  const classes = classNames({ choice: 1, selected: isSelected });
  return (
    <div onClick={onClick} className={ classes }>
      { tabObj.title.en }
    </div>
  );
}

TextChoice.propTypes = {
  onClick: PropTypes.func.isRequired,
  tabObj:  PropTypes.object.isRequired,
}

export default TextChoice;
