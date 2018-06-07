import React from 'react';
import PropTypes from 'prop-types';
import Component from 'react-class';
import LangToggle from './LangToggle';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
    }
  }
  onChange(event) {
    this.setState({query: event.target.value});
  };
  onSubmit(event) {
    if (event.key === 'Enter' && this.state.query.length > 0) {
      window.location.href = `https://www.sefaria.org/search?q=${this.state.query}`;
    }
  }
  render() {
    return (
      <h1 className="header">
        <div className="headerButtonsLeft">
          <a className="menuButton" href="https://www.sefaria.org/texts">
            <i className="fa fa-bars"></i>
          </a>
          <a className="menuButton search" href="#">
            <i className="fa fa-search"></i>
          </a>
          <input className="searchInput" type="text" placeholder="Search" value={this.state.query} onChange={this.onChange} onKeyDown={this.onSubmit} maxLength="75"></input>
        </div>
        <a className="sefaria-logo-link" href="https://www.sefaria.org"><img className="sefaria-logo" src="icons/sefaria.svg"/></a>
        <LangToggle
          language={this.props.language}
          setLanguage={this.props.setLanguage}
        />
      </h1>
    )
  }
}

export default Header;
