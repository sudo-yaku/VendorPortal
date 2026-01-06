import React from 'react'
import PropTypes from 'prop-types'
import * as actions from '../../Users/actions'
import * as userUtils from '../../Users/utils'
import { connect } from 'react-redux'
import { List } from 'immutable'
var NotificationSystem = require('react-notification-system')
import moment from 'moment'
import { withRouter } from '../../withRouter'
import LoginForm from './LoginForm'

class MainLoginForm extends React.Component {
  state = { timer: '', percentage: -1 };
  constructor(props) {
    super(props)
    this.state = { timer: '', percentage: -1, showOTPTextBox: false }
    this.counterID = 0

  }
  onSubmit( username, password ,navigate) {
    this.props.login(username, password,navigate).then(action => { 
      if (this._notificationSystem) { this._notificationSystem.clearNotifications() }
      if (action && action.errors && action.errors.length > 0) {
        let message = action.errors[0].data ? action.errors[0].data.message ? action.errors[0].data.message : action.errors[0].data.detail ? action.errors[0].data.detail : action.errors[0].message : action.errors[0].message
        if (message) {
          this._notificationSystem.addNotification({
            title: 'Error',
            position: "br",
            level: 'error',
            autoDismiss: 0,
            message: message
          })
        } else {
          this._notificationSystem.addNotification({
            title: 'Error',
            position: "br",
            level: 'error',
            message: "Somthing went wrong! Please contact administrator."
          })
        }
      }
    })
  }
  componentWillUnmount() {
    clearInterval(this.counterID)
  }
  countdownTimer() {
    const timedelay = 120
    let countDownDate = new Date(moment().add(timedelay, 'seconds')).getTime();
    ((countDownDate) => this.counterID = setInterval(() => {
      let now = new Date().getTime()
      let distance = countDownDate - now
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = Math.floor((distance % (1000 * 60)) / 1000)

      let percentage = Math.floor((distance / (timedelay * 1000) * 100))
      this.setState({ timer: minutes + "m " + seconds + "s ", percentage })
      if (distance < 0) {
        clearInterval(this.counterID)
      }
    }, 1000))(countDownDate)
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem
  }
  render() {
    return <div><LoginForm
      onSubmit={this.onSubmit.bind(this)}
      navigate={this.props.navigate}
      percentage={this.state.percentage}
      timer={this.state.timer}
      loading={this.props.loading}
      isloadingPin={this.props.isloadingPin}
      isloadingLoginValidation={this.props.isloadingLoginValidation}
      errors={this.props.errors}
      showOTPTextBox={this.state.showOTPTextBox}
    /><NotificationSystem ref="notificationSystem" /></div>
  }
}

function mapStateToProps(state) {
  const user = userUtils.getCurrentUser(state)
  const isloadingPin = state.getIn(['Users', 'genetateOTP', 'isLoading'])
  const isloadingLoginValidation = state.getIn(['Users', 'loginValidation', 'isLoading'])

  return {
    user,
    isloadingPin,
    isloadingLoginValidation,
    errors: state.getIn(['Users', 'currentUser', 'errors'], List())
  }
}

const MainLoginFormContainer = connect(mapStateToProps, { ...actions })(withRouter(MainLoginForm))

export default MainLoginFormContainer
