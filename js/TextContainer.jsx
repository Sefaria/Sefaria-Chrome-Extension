import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'webpack-zepto';
import { connect } from 'react-redux';
import Component from 'react-class';
import PropTypes from 'prop-types';
import TextTitle from './TextTitle';
import { domain } from './const';
import dataApi from './dataApi';


const SCROLL_DEBOUNCE_CONST = 150;

class TextContainer extends Component {
  componentDidMount() {
    var node = ReactDOM.findDOMNode(this);
    this.$container = $(node);
    this.currScrollY = 0;
    node.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    var node = ReactDOM.findDOMNode(this);
    node.removeEventListener("scroll", this.handleScroll);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.initScrollPos !== nextProps.initScrollPos) {
      if (!!nextProps.initScrollPos) {
        console.log("scrolling to", nextProps.initScrollPos);
        //TODO this doesn't work right now for some reason
        this.$container.scrollTop(nextProps.initialScrollPos);
      }
    }
  }
  handleScroll(e) {
    const currY = this.$container.scrollTop();
    if (Math.abs(currY - this.currScrollY) > SCROLL_DEBOUNCE_CONST) {
      this.currScrollY = currY;
      const key = this.props.titleUrl;
      chrome.storage.local.get(key, data => {
        if (!!data[key]) {
          data[key].initScrollPos = currY;
          chrome.storage.local.set({[key]: data[key]});
        }
      });
    }
  }

  getMarkup(content) {
    return {
      __html: content,
    };
  }
  //from: https://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
  zip(...rows) {
    let maxLenRow;
    for (let r of rows) {
      if (!maxLenRow || (!!r && r.length > maxLenRow.length)) { maxLenRow = r; }
    }
    return [...maxLenRow].map((_,c) => rows.map(row => !!row ? row[c] : null));
  }

  recursivelyRender(en, he, alts, title, heTitle, addressType, sectionNum, segmentNum, titleUrl, dontAddTitle) {
    // dontAddTitle == true for the first iteration of recursivelyRender(). this helps in cases where you're only rendering a single segment and no sections
    const menuLanguage = this.props.language === 'he' ? 'he' : 'en';
    if ((typeof en === "undefined") || en.constructor === String) {
      // segment level
      const ref = `${title} ${sectionNum}:${segmentNum}`;
      const altEl = (typeof alts === "object" && !!alts && !Array.isArray(alts)) ?
        (<div className={!!alts.whole ? "parashahHeader" : "parashahHeader aliyah"}>{alts[menuLanguage][0]}</div>) : null;
      return (
        <div className="segment" key={ref}>
          { altEl }
          {
            <div className="heWrapper">
              { !!he && this.props.language !== 'en' ? <div className="he heSerif" dangerouslySetInnerHTML={this.getMarkup(he)}></div> : null }
              { <div className="verseNumber">{segmentNum}</div> }
            </div>
          }
          { !!en && this.props.language !== 'he' ?
            <div className="en enSerif" dangerouslySetInnerHTML={this.getMarkup(en)}></div> : null
          }
        </div>
      );
    } else {
      const isSectionLevel = (en.length > 0 && en[0].constructor === String) || en.length === 0;
      let segments = [];
      if (isSectionLevel && !dontAddTitle) {
        const titleRef = this.makeRef(title, heTitle, addressType, sectionNum); //`${title} ${!!sectionNum ? sectionNum : ""}`;
        segments.push(
          <TextTitle
            isRandom={this.props.tab === "Random"}
            key={titleRef}
            title={titleRef}
            titleUrl={titleUrl}
            topic={this.props.topic}
            topicUrl={this.props.topicUrl}
            language={this.props.language}
          />
        );
      }
      const zipped = this.zip(en, he, alts);
      for (let i = 0; i < zipped.length; i++) {
        const [tempEn, tempHe, tempAlt] = zipped[i];
        const currSectionNum = !isSectionLevel ? sectionNum + i : sectionNum;
        const currSegmentNum = isSectionLevel ? segmentNum + i : segmentNum;
        const tempRet = this.recursivelyRender(tempEn, tempHe, tempAlt, title, heTitle, null, currSectionNum, currSegmentNum, null, dontAddTitle && i === 0);
        if (Array.isArray(tempRet)) {
          segments = segments.concat(tempRet);
        } else {
          segments.push(tempRet);
        }
      }
      return segments;
    }
  }
  makeRef(title, heTitle, addressType, sectionNum) {
    if (this.props.language === 'he') {
      const sectionStr = !!sectionNum ? (addressType === 'Talmud' ? dataApi.encodeHebrewDaf(sectionNum, 'long') : dataApi.encodeHebrewNumeral(sectionNum)) : "";
      return `${heTitle} ${sectionStr}`;
    } else {
      return `${title} ${sectionNum || ""}`;
    }
  }
  render() {
    const { text, titleUrl, tab, language } = this.props;
    if (!!text && !!text.length) {
      const titleRef = this.makeRef(text[0].indexTitle, text[0].heIndexTitle, text[0].addressTypes[0], text[0].sections[0]);
      let segments = [(
        <TextTitle
          isRandom={tab === "Random"}
          key={titleRef}
          title={titleRef}
          titleUrl={titleUrl}
          topic={this.props.topic}
          topicUrl={this.props.topicUrl}
          language={language}
        />
      )];
      segments = segments.concat(this.zip(text, titleUrl).reduce((
        accum, [t, tempTitleUrl], itext) => accum.concat(
        this.recursivelyRender(t.text, t.he, t.alts, t.indexTitle, t.heIndexTitle, t.addressTypes[0],
        t.sections[0], !!t.sections[1] ? t.sections[1] : 1, tempTitleUrl, itext === 0)), []));
      return (
        <div className="text-container-outer">
          <div className="text-container">
            { segments }
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-container-outer">
          <div className="text-container-loading">
            { "Loading..." }
          </div>
        </div>
      );
    }
  }
}

TextContainer.propTypes = {
  text: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    he:   PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    alts: PropTypes.array,
  })).isRequired,
  title:      PropTypes.string,
  titleUrl:   PropTypes.array,
  initScrollPos: PropTypes.number,
  tab:        PropTypes.string.isRequired,
  topic:      PropTypes.string,
  topicUrl:   PropTypes.string,
  language:   PropTypes.oneOf(["en", "bi", "he"]).isRequired,
}

const mapStateToProps = state => ({
  title: state.text && state.text.length > 0 ? (state.language === "en" ? state.text[0].ref : state.text[0].heRef) : "",
  titleUrl: state.titleUrl,
  text: state.text,
  calendarMap: state.calendarMap,
  calendarKeys: state.calendarKeys,
  tab: state.tab,
  initScrollPos: state.initScrollPos,
  topic: state.topic,
  topicUrl: `${domain}/topics/${state.topic}`,
  language: state.language,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TextContainer);
