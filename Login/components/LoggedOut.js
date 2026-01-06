import React from 'react'

export default class loggedOut extends React.Component {
  render () {
    return (
      <div className="text-center" style={{marginTop: 100}}>
        <h2> You have successfully logged out.</h2>
        <p>We recommend that you close your web browser when you have finished your online session.</p><br/>
      </div>
    )
  }
}