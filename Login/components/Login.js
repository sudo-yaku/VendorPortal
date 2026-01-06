import React from 'react'
import * as userUtils from '../../Users/utils'
import { connect } from 'react-redux'
import { withRouter } from '../../withRouter'
import MainLoginFormContainer from './MainLoginForm'

class LoginPage extends React.Component {
  componentDidMount() {
    this.redirect(this.props)
  }
    

  redirect(props) {
    if (props.user.get('role')) {
      props.navigate(userUtils.getHomePath(props.user))
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-4 offset-4" style={{ marginTop: '100px' }}>
            <MainLoginFormContainer />
          </div>
        </div>
      </div>
    )
  }
}

function stateToProps(state) {
  return { user: userUtils.getCurrentUser(state) }
}

const MappedLoginPage = connect(stateToProps, { })(LoginPage)

export default withRouter(MappedLoginPage)
