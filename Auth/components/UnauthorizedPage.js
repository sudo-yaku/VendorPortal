import React from 'react'
import MainContent from '../../Layout/components/MainContent'

export default class UnauthorizedPage extends React.Component {
  render () {
    return (
      <MainContent {...this.props}>
        <div className="text-center">
          <h3>Unauthorized</h3>
        </div>
      </MainContent>
    )
  }
}