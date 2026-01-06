import React from 'react'
import PropTypes from 'prop-types'
import {Link, withRouter} from 'react-router'

class NavTab extends React.Component {
  static get propTypes () {
    return {
      to: PropTypes.string,
      params: PropTypes.object,
      query: PropTypes.object,
      router: PropTypes.object,
      children: PropTypes.node
    }
  }
  render () {
    var isActive = this.props.router.isActive({...this.props, pathname: this.props.to}, false)
    var className = isActive ? 'active' : ''

    return <li className={className}><Link to={this.props.to} children={this.props.children} /></li>
  }
}


export default withRouter(NavTab)