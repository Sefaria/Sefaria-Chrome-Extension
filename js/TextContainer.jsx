import React from 'react';
import PropTypes from 'prop-types';

const getMarkup = content => ({
  __html: content,
});



const TextContainer = ({ text }) => {
  if (!!text) {
    let longer = "he"; let shorter = "en";
    if (text.en.length > text.he.length) {
      longer = "en"; shorter = "he";
    }
    const segments = text[longer].map((longSeg, i) => (
      <div className="segment" key={`${text.ref}:${i+1}`}>
        { longer === "he" || !!text.he[i] ?
          <div className="he heSerif" dangerouslySetInnerHTML={getMarkup(text.he[i])}></div> : null
        }
        { longer === "en" || !!text.en[i] ?
          <div className="en enSerif" dangerouslySetInnerHTML={getMarkup(text.en[i])}></div> : null
        }
      </div>
    ));
    return (
      <div className="text-container">
        { segments }
      </div>
    );
  } else {
    return (
      <div className="text-container">
        { "Loading..." }
      </div>
    );
  }

}

TextContainer.propTypes = {
  text: PropTypes.shape({
    en: PropTypes.array.isRequired,
    he: PropTypes.array.isRequired,
  }),
}

export default TextContainer;
