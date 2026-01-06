import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import * as actions from '../../Users/actions'
import {deleteCookie} from '../../http_utils'
import {Link} from 'react-router-dom'
import * as userUtils from '../../Users/utils'
import {logoutQuery} from '../../Users/schema'
import config from '../../config'


export class UserDropdown extends React.Component {
  static get propTypes () {
    return {
      user: PropTypes.object.isRequired,
      logout: PropTypes.func,
      push: PropTypes.func,
      isReadOnly: PropTypes.bool
    }
  }

  render () {

    const {user, push, logout} = this.props

    const onLogout = function () {
      logout(logoutQuery)
      deleteCookie('IOP_LITE_AUTH')
      deleteCookie('IOP_LITE_AUTH_ERROR')
      push(config.filepath+ 'logged-out')
    }

            // <li>
            //   <Link to="/account/profile">
            //     <i className="ace-icon fa fa-user"></i>
            //     Profile
            //   </Link>
            // </li>
            //


        // <a data-toggle="dropdown" href="#" className="dropdown-toggle" aria-expanded="false" style={{'paddingTop':'5px',"backgroundColor": "white","color": "rgb(0, 0, 0)"}}>
          // <span className="user-info">
          //   <small>Welcome</small>, {user.get('fname')}
          // </span>
        // </a>

        // {user.get('vendor_role') === 'PORTALADMIN' ?

    return (

      <li className="cus-dropdown-menu-item">

          { user.get('vendor_role') === 'PORTALADMIN' && (<li>
            <Link to={config.filepath+"account"}>
              <i className="ace-icon icon-settings bigger-120"></i>
              User Management
            </Link>
          </li>)}
          {(user.get('vendor_role') === 'PORTALADMIN' || user.get('vendor_role') === 'PORTALSUPERVISOR') && (<li>
            <Link to={config.filepath+"device"}>
              <i className="ace-icon icon-settings bigger-120"></i>
              Device Management
            </Link>
          </li>)}
        {/* {(user.get('vendor_role') === 'PORTALADMIN' || user.get('vendor_role') === 'PORTALSUPERVISOR') && (category5G.indexOf(user.get('vendor_category')) > -1) && (<li>
          <Link to={config.filepath+"performance"}>
            <i className="ace-icon icon-settings bigger-120"></i>
            Performance Management
          </Link>
        </li>)} */}

        {/* {(user.get('vendor_role') === 'PORTALADMIN' || user.get('vendor_role') === 'PORTALSUPERVISOR') && (category5G.indexOf(user.get('vendor_category')) > -1) && (<li>
          <Link to={config.filepath+"permission"}>
            <i className="ace-icon icon-settings bigger-120"></i>
            Permission Management
          </Link>
        </li>)} */}

          {/* {(user.get('vendor_role') === 'PORTALADMIN' || user.get('vendor_role') === 'PORTALSUPERVISOR') && (<li>
          <Link to="/techschedule">
              <i className="ace-icon icon-settings bigger-120"></i>
              Tech Schedule
            </Link>
          </li>
          )} */}
          
          {(user.get('vendor_role') === 'PORTALADMIN' || user.get('vendor_role') === 'PORTALSUPERVISOR') && (<li>
            <Link to={config.filepath+"release-notes"}>
              <i className="ace-icon icon-settings bigger-120"></i>
              Release Notes
            </Link>
          </li>)}
          <li>
            <a onClick={onLogout}>
              <i className="ace-icon icon-power"></i>
              Logout
            </a>
          </li>
      </li>
    )
  }
}


// <li className="dropdown-modal user-min">

//         <a data-toggle="dropdown" href="#" className="dropdown-toggle" aria-expanded="false" style={{'paddingTop':'5px',"backgroundColor": "white","color": "rgb(0, 0, 0)"}}>
//               <span style={{fontSize:'12px'}}>
//                   <span style={{fontSize:'1.3em'}}> {user.get('fname')} </span><br></br>
//                   <span style={{fontSize:'1em', float:'left'}}> {user.get('vendor_name')}</span>
//               </span>
//           <span className="user-info">
//             <small>Welcome</small>, {user.get('fname')}
//           </span>
//           <i className="ace-icon fa fa-caret-down white" style={{float:'right'}}></i>
//         </a>

//         <ul className="user-menu dropdown-menu-right dropdown-menu dropdown-yellow dropdown-caret dropdown-close">
//             {user.get('vendor_role') === 'PORTALADMIN' ?<li>
//               <Link to="/account">
//                 <i className="ace-icon icon-settings bigger-120"></i>
//                 User Management
//               </Link>
//             </li>:null}
//             {user.get('vendor_role') === 'PORTALADMIN' ? <li className="divider"></li>:null}
//             <li>
//               <a onClick={onLogout}>
//                 <i className="ace-icon icon-power"></i>
//                 Logout
//               </a>
//             </li>
//         </ul>
//       </li>
function stateToProps (state) {
  const user = userUtils.getCurrentUser(state)
  // const role = state.getIn(['Users','loginValidation', 'message','data','vendor_role'])
  return {user}
}

export default connect(stateToProps, {...actions, push})(UserDropdown)
