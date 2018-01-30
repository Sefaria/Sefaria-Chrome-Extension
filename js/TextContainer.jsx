import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'webpack-zepto';
import Component from 'react-class';
import PropTypes from 'prop-types';
import TextTitle from './TextTitle';

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

  render() {
    const { text } = this.props;
    if (!!text) {
      let longer = "he"; let shorter = "en";
      if (text.en.length > text.he.length) {
        longer = "en"; shorter = "he";
      }
      const segments = text[longer].map((longSeg, i) => (
        <div className="segment" key={`${text.ref}:${i+1}`}>
          { longer === "he" || !!text.he[i] ?
            <div className="he heSerif" dangerouslySetInnerHTML={this.getMarkup(text.he[i])}></div> : null
          }
          { longer === "en" || !!text.en[i] ?
            <div className="en enSerif" dangerouslySetInnerHTML={this.getMarkup(text.en[i])}></div> : null
          }
        </div>
      ));
      return (
        <div className="text-container-outer">
          <div className="text-container">
            <TextTitle
              isRandom={this.props.isRandom}
              title={this.props.title}
              titleUrl={this.props.titleUrl}
              topic={this.props.topic}
              topicUrl={this.props.topicUrl}
            />
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
  text: PropTypes.shape({
    en: PropTypes.array.isRequired,
    he: PropTypes.array.isRequired,
  }),
  title:      PropTypes.string,
  titleUrl:   PropTypes.string,
  initScrollPos: PropTypes.number,
  isRandom:   PropTypes.bool.isRequired,
  topic:      PropTypes.string,
  topicUrl:   PropTypes.string,
}

TextContainer.contextTypes = {
  store: PropTypes.object,
}

export default TextContainer;
