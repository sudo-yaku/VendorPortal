import React from 'react'
import PropTypes from 'prop-types'
import * as userUtils from '../../Users/utils'
import Checkbox from '@material-ui/core/Checkbox';
import { FormControlLabel } from '@material-ui/core'

class LoginForm extends React.Component {

  state = { isEmailValid: true, username: '', password: '', timer: '' }

  constructor(props) {
    super(props)
    this.state = { isEmailValid: true, username: '', password: '', rememberMe: false }
    this.counterID = 0
  }

  onSubmit(e) {
    e.preventDefault()
    const username = this.refs.username.value
    const password = ""
    this.props.onSubmit( username, password,this.props.navigate)
  }

  onEmailChange = (e) => {
    const isEmailValid = userUtils.validateEmail(e.target.value)
    this.setState({ isEmailValid })
    if (localStorage.getItem('rememberMe') != null) {
      let rememberMeUserName = localStorage.getItem('rememberMe')
      if (rememberMeUserName === e.target.value.trim().toLowerCase()) {
        this.setState({ rememberMe: true })
      } else {
        this.setState({ rememberMe: false })
      }
    }
  }

  getErrors() {
    return this.props.errors && this.props.errors.length > 0 ? this.props.errors.toJS().map(error => {
      return error.detail
    }) : []
  }
  
  componentDidMount() {
    this.setState({ isEmailValid: true })
    let storedUsername = localStorage.getItem('rememberMe')
    if (storedUsername != null) {
      this.refs.username.value = storedUsername
      this.setState({
        rememberMe: true
      })
    }
  }

  toggleRememberMe = (event) => {
    if (event.target.checked && this.state.isEmailValid) {
      const username = this.refs.username.value
      if (username) {
        localStorage.setItem('rememberMe', username.toLowerCase())
        this.setState({ rememberMe: true })
      }
    } else {
      if (localStorage.getItem('rememberMe') != null) {
        localStorage.removeItem('rememberMe')
        this.setState({ rememberMe: false })
      }
    }
  }

  render() {
    let { isloadingLoginValidation, isloadingPin, percentage, timer } = this.props
    return (
      <div>
        <style>
          {`.progress-button{
              background: -webkit-linear-gradient(right, #d8dada ${percentage}%, #000 ${percentage}%);
              background:    -moz-linear-gradient(right, #d8dada ${percentage}%, #000 ${percentage}%);
              background:     -ms-linear-gradient(right, #d8dada ${percentage}%, #000 ${percentage}%);
              background:      -o-linear-gradient(right, #d8dada ${percentage}%, #000 ${percentage}%);
              background:         linear-gradient(to left, #d8dada ${percentage}%, #000 ${percentage}%);
              padding-top: 5px;
              color: #FFF !important;
              border-radius: 15px;
              cursor:pointer;
              padding:3px 15px;
              margin-top:5px;
              font-size:12px;
          }
          .progress-button:hover{
            color: #FFF;
          }`}
        </style>
        <form role="form" onSubmit={this.onSubmit.bind(this)} >
          <ul className="text-danger">
            {this.getErrors().map(error => {
              return <li key={error}>{error}</li>
            })}
          </ul>
          <div className="Form-group">
            <label htmlFor="username" className="Form-label">Email ID</label>
            <input type="text" ref="username" className="Form-input" id="username" placeholder="Login ID" required onChange={this.onEmailChange} />

            <FormControlLabel
                control={
                  <Checkbox
                    onChange={this.toggleRememberMe}
                    checked={this.state.rememberMe}
                    name="rememberMe"
                    color="default"
                    style={{ marginTop: '5px' }}
                  />
                }
                label={"Remember Me"}
              />

            <div className="text-right">
              <button type="submit" className="Button--secondary" disabled={isloadingLoginValidation || !this.state.isEmailValid}>
                {isloadingLoginValidation ? 'Logging in...' : 'Login'}
              </button>
            </div>

          </div>

        </form>
      </div>
    )
  }
}

export default LoginForm
