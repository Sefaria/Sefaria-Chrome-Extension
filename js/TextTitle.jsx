import React from 'react';
import PropTypes from 'prop-types';

const TextTitle = ({ title, titleUrl }) => (
  <div className="text-title-outer">
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
}

export default TextTitle;
