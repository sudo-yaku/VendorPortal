import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class Sidebar extends React.Component {
  render () {
    return (
      <div id="sidebar-responsive"
      className="vzwaffix affix sidebar responsive menu-min ace-save-state"
      style={{marginTop: '20px', position: 'fixed'}}
      ref="sidebar-responsive">
        <ul className="nav nav-list">
            {this.props.children}
        </ul>

        <div className="affix sidebar-toggle sidebar-collapse">
          <i id="sidebar3-toggle-icon"
            className="ace-icon fa smaller-80 icon-back-caret"
            data-icon1="ace-icon fa icon-back-caret "
            data-icon2="ace-icon fa icon-forward-caret"
            style={{paddingTop: '3px'}}></i>
        </div>
      </div>
    )
  }
}

Sidebar.propTypes = {children: PropTypes.node}
