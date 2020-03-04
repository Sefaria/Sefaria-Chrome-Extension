import React from 'react';
import PropTypes from 'prop-types';

const TextTitle = ({ title, titleUrl, isRandom, topic, topicUrl, language }) => (
  <div className="text-title-outer">
    { !!topic && isRandom ?
      <h2 className={`text-title text-topic ${language === 'he' ? 'heSerif' : 'enSerif'}`}>
        <b><a href={ topicUrl }>{ `${topic.primaryTitle ? topic.primaryTitle[language === 'bi' ? 'en' : language] : topic}` }</a></b>
      </h2> : null
    }
    <h2 className={`text-title ${language === 'he' ? 'heSerif' : 'enSerif'}`}>
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
  topic:     PropTypes.shape({
    slug: PropTypes.string,
    primaryTitle: PropTypes.shape({
      en:   PropTypes.string,
      he:   PropTypes.string,
    })
  }),
  topicUrl:  PropTypes.string,
  language: PropTypes.oneOf(["en", "bi", "he"]).isRequired,
}

export default TextTitle;
