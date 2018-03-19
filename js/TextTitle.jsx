import React from 'react';
import PropTypes from 'prop-types';

const TextTitle = ({ title, titleUrl, isRandom, topic, topicUrl, language }) => (
  <div className="text-title-outer">
    { !!topic && isRandom ?
      <h2 className="text-title text-topic">
        <b><a href={ topicUrl }>{ `${topic}` }</a></b>
      </h2> : null
    }
    <h2 className="text-title">
      <a href={ titleUrl }>
        { title }
      </a>
    </h2>
  </div>
);

TextTitle.propTypes = {
  title: PropTypes.string,
  title_url: PropTypes.string,
  isRandom:  PropTypes.bool,
  topic:     PropTypes.string,
  topicUrl:  PropTypes.string,
  language: PropTypes.oneOf(["en", "bi", "he"]).isRequired,
}

export default TextTitle;
