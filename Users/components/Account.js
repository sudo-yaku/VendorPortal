import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MainContent from '../../Layout/components/MainContent'
import Sidebar from './Sidebar'

export default function AccountSettings(props) {

  return (
    <div>
      <Sidebar />
      <MainContent {...props}>
        <div className="user-account" style={{ marginTop: "10px" }}>
          {props.children}
        </div>
      </MainContent>
    </div>
  )
}
AccountSettings.propTypes = {
  children: PropTypes.node
}

