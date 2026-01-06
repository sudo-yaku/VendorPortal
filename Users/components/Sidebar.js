import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Sidebar from '../../Navigation/components/Sidebar'
import * as userUtils from '../../Users/utils'
import { connect } from 'react-redux'
import SidebarNavLink from '../../Navigation/components/SidebarNavLink'

function UserSidebar(props) {

  return (
    <Sidebar>
      <SidebarNavLink to="/account/users">
        <i className="menu-icon fa fa-cog"></i>
        <span className="menu-text"> User Management </span>
      </SidebarNavLink>
    </Sidebar>
  )
}
UserSidebar.propTypes = {
  user: PropTypes.object.isRequired
}
function stateToProps(state) {
  const user = userUtils.getCurrentUser(state)
  return { user }
}

export default connect(stateToProps)(UserSidebar)
