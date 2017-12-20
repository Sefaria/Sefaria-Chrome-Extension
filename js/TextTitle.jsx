import React from 'react';
import PropTypes from 'prop-types';

const TextTitle = ({ title, titleUrl }) => (
  <h2 className="text-title">
    <a href={ titleUrl }>
      { title }
    </a>
  </h2>
);

TextTitle.propTypes = {
  title: PropTypes.string,
  title_url: PropTypes.string,
}

export default TextTitle;
