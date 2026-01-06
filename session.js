import React from 'react'
import {connect} from 'react-redux'
import * as actions from './Users/actions'
import * as userUtils from './Users/utils'
import {logoutQuery, sessionQuery} from './Users/schema'
import {deleteCookie} from './http_utils'
import moment from 'moment'
import config from './config'
import { withRouter } from './withRouter'

class SessionWrap extends React.Component {

  componentDidMount () {
    this.setup()
  }
  constructor (props) {
    super(props)
    window.timeoutID = 0
    this.counterID = 0
    this.startTimeID
    this.state={timer:'', lastRefreshBuffer : 0}
  }


  componentDidUpdate () {
    // this.startTimer()
  }


  setup () {
    this.session.addEventListener("mousemove", this.resetTimer, false)
    this.session.addEventListener("mousedown", this.resetTimer, false)
    this.session.addEventListener("keypress", this.resetTimer, false)
    this.session.addEventListener("DOMMouseScroll", this.resetTimer, false)
    this.session.addEventListener("mousewheel", this.resetTimer, false)
    this.session.addEventListener("touchmove", this.resetTimer, false)
    this.session.addEventListener("MSPointerMove", this.resetTimer, false)
    this.startTimer()
    this.clock()
  }

  startTimer = () => {
    let idleTimeOut = 1000 * 60 * ((config.sessionMaxAge || 15)), fiveMin = 1000 * 60 * 5
    if (typeof this.startTimeID !='undefined') {clearTimeout(this.startTimeID)}
    this.startTimeID = setTimeout(() => {
      const {user, session, navigate} = this.props
      const {lastRefreshBuffer} = this.state;
      if (user && user.get("login_id") && user.get("login_id") .length > 0 && (lastRefreshBuffer > config.sessionRefreshCallBuffer)) {
        this.setState({lastRefreshBuffer:0});
        session(sessionQuery, navigate)
        window.timeOutNotify = setTimeout(() => {this.props.setTimeOutNotification(true)}, idleTimeOut - fiveMin)
        window.timeoutID = setTimeout(this.goInactive, idleTimeOut)
        // this.countdownTimer();
      }
    }, 200)
  };

  resetTimer = () => {

    if (window.timeoutID) {
      clearTimeout(window.timeoutID)
      window.timeoutID = 0
      clearTimeout(window.timeOutNotify)
      window.timeOutNotify = 0
      // clearInterval(this.counterID)
      // this.counterID = 0
    }

    this.goActive()

  }
  clock = () =>{
    setInterval(()=>{
      let {lastRefreshBuffer} = this.state;
      this.setState({lastRefreshBuffer:++lastRefreshBuffer})
    },1000)
  }

  countdownTimer () {
    const timedelay = 150
    let countDownDate = new Date(moment().add(timedelay, 'seconds')).getTime();
    ((countDownDate) => this.counterID = setInterval(() => {
      let now = new Date().getTime()
      let distance = countDownDate - now
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = Math.floor((distance % (1000 * 60)) / 1000)

      let percentage = Math.floor((distance/(timedelay * 1000) * 100))
      this.setState({timer:minutes + "m " + seconds + "s ", percentage})
      if (distance < 0) {
        clearInterval(this.counterID)
      }
    }, 1000))(countDownDate)
  }

  goInactive= () => {

    const {user, push, expires, navigate} = this.props
    if (user.get("login_id") && user.get("login_id") .length > 0) {
      expires(logoutQuery, navigate)
      deleteCookie('IOP_LITE_AUTH')
      deleteCookie('IOP_LITE_AUTH_ERROR')
      navigate(config.filepath+'sesion-expires')
    }
  }
  goActive = () => {
    this.startTimer()
  }
// <div className="col-sm-12" style={{zIndex: "21"}}>Timer:{this.state.timer}</div>

  render () {
    return (
      <div ref={elem => this.session = elem} >
             {this.props.children}
      </div>
    )
  }
}

const props = (state) => {
  const user = userUtils.getCurrentUser(state)
  return {user}
}

export default connect(props, {...actions})(withRouter(SessionWrap))
