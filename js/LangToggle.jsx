import React from 'react';
import PropTypes from 'prop-types';

const langBitMap = {
  'en': 1,
  'he': 2,
  'bi': 3,
};

const bitLangMap = {};
for (let key in langBitMap) { bitLangMap[langBitMap[key]] = key; }

const getNewLang = (curr, langToToggle) => {
  const newBitLang = langBitMap[curr] ^ langBitMap[langToToggle];
  return bitLangMap[newBitLang];
}

const LangToggle = ({ language, setLanguage }) => (
  <div className="langToggle">
    <div className={`aye letter enSerif ${language !== 'he' ? 'selected' : ''}`} onClick={()=>{ setLanguage(getNewLang(language, 'en')); }}>
      A
    </div>
    <div className={`aleph letter heSerif ${language !== 'en' ? 'selected' : ''}`} onClick={()=>{ setLanguage(getNewLang(language, 'he')); }}>
      א
    </div>
  </div>
);

LangToggle.propTypes = {
  language: PropTypes.oneOf(['en', 'bi', 'he']).isRequired,
  setLanguage: PropTypes.func.isRequired,
};

export default LangToggle;
