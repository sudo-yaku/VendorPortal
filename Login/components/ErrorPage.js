import React from 'react'
import {getCookie, deleteCookie} from '../../http_utils'

export default class errorPage extends React.Component {
  render () {
    const error = getCookie('IOP_AUTH_ERROR')
    deleteCookie('IOP_AUTH_ERROR')

    return (
      <div className="text-center">
        <h2> We're Sorry!</h2>
        <h3> Vendor Portal is unable to log you in. The most likely causes are:</h3><br/>
        <ul className="center list-unstyled">
          {error ? <li>{decodeURI(error)}</li> : null}
          <li>You don't have an Vendor Portal account</li>
          <p>To request an Vendor Portal account, please click <a href="mailto:BRobert.White@verizonwireless.com?Subject=Vendor%20Portal%20Registration">here</a></p><br/>
          <li>Your IOP username doesn't match your USWIN username</li>
          <p>To request an IOP account change, please click <a href="mailto:BRobert.White@verizonwireless.com?Subject=Vendor%20Portal%20Registration">here</a></p><br/>
        </ul>
        <p>If you think that you have an active account with the correct username, or if you're not sure what the problem is, please click <a href="mailto:BRobert.White@verizonwireless.com?Subject=Vendor%20Portal%20Registration">here</a> to send an email requesting support.</p>
      </div>
    )
  }
}