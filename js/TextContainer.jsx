import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'webpack-zepto';
import Component from 'react-class';
import PropTypes from 'prop-types';
import TextTitle from './TextTitle';


const getMarkup = content => ({
  __html: content,
});

class TextContainer extends Component {
  componentDidMount() {
    var node = ReactDOM.findDOMNode(this);
    this.$container = $(node);
    node.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    var node = ReactDOM.findDOMNode(this);
    node.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll(e) {
    console.log(this.$container.scrollTop());
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
            <div className="he heSerif" dangerouslySetInnerHTML={getMarkup(text.he[i])}></div> : null
          }
          { longer === "en" || !!text.en[i] ?
            <div className="en enSerif" dangerouslySetInnerHTML={getMarkup(text.en[i])}></div> : null
          }
        </div>
      ));
      return (
        <div className="text-container-outer">
          <div className="text-container">
            <TextTitle
              title={this.props.title}
              titleUrl={this.props.titleUrl}
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
}

export default TextContainer;
