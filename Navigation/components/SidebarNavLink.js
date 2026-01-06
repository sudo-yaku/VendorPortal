import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Link, IndexLink, withRouter} from 'react-router'

class SidebarNavLink extends React.Component {
  static get propTypes () {
    return {
      to: PropTypes.string,
      params: PropTypes.object,
      query: PropTypes.object,
      children: PropTypes.array,
      index: PropTypes.string,
      router: PropTypes.object,
      onClick: PropTypes.func
    }
  }

  render () {
    let path = {
      pathname: this.props.to,
      query: this.props.query
    }
    var isActive = this.props.router.isActive(path, true)
    var className = isActive ? 'active' : ''

    let link = ''
    const onClick = this.props.onClick || null

    if (this.props.index === "true") {
      link = (
        <Link to={this.props.to} onClick={onClick}>
          {this.props.children}
        </Link>
      )
    } else {
      link = (
        <IndexLink to={this.props.to} onClick={onClick}>
          {this.props.children}
        </IndexLink>
      )
    }

    return (
      <li className={className}>
        {link}
        <b className="arrow"></b>
      </li>
    )
  }
}

export default withRouter(SidebarNavLink)