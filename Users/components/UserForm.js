import React, { Component, useState, useEffect } from "react"
import PropTypes from "prop-types"
import * as formActions from "../../Forms/actions"
import { connect } from "react-redux"

import { Map, fromJS, List } from 'immutable'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import Loader, { OverlayLoader } from '../../Layout/components/Loader'
import MessageBox from '../../Forms/components/MessageBox'
import Select from 'react-select'
import { createContactDef, activeDomainsDef, updateContactDef, createUpdIvrUser, ivrEmailNotification, getUserInfoLinkedDef, linkUserToCmpDef } from '../../Users/schema'
import { createUser, updateUser, deleteMsg, activeDomains, createUpdIvr, ivrEmailNotify, clearCreateCompany, linkUserToCmp, getUserInfoLinked, getIvrVendorTech } from '../actions'
import { Radio, RadioGroup } from '@material-ui/core'
import { validateEmail } from '../utils'
import moment from "moment"
import { Picky } from 'react-picky';
import 'react-picky/dist/picky.css';
import "./style.css"
// import "../../custom.css"
import { debounce } from "lodash"
import ajax from '../../ajax'
import { findDOMNode } from "react-dom"
import { FormControlLabel } from "@material-ui/core"
import { logActioninDB } from '../../VendorDashboard/actions'


const formName = "UserForm"
function UserForm(props) {
  const [isLinkLoader, setLinkLoader] = useState(false)
  const [isCreateUser, setIsCreateUser] = useState(true)
  const [inValidEmail, setInValidEmail] = useState(false)
  const [inValidPhoneNo, setInValidPhoneNo] = useState(false)
  const [isIvrRequested, setIsIvrRequested] = useState(false)
  const [companyError, setCompanyError] = useState(false)
  const [multiSubmarSelLinked, setMultiSubmarSelLinked] = useState(false)
  const [multiSubmarSel, setMultiSubmarSel] = useState(false)
  const [selSubmarkets, setSelSubmarkets] = useState([])
  const [justification, setJustification] = useState('')
  const [disableSubmit, setDisableSubmit] = useState(false)
  const [showLinkDiv, setShowLinkDiv] = useState(false)
  const [userInfoLink, setUserInfoLink] = useState(null)
  const [linkUserSelected, setLinkUserSelected] = useState(false)
  const [hasPreviousIvrAccess, setHasPreviousIvrAccess] = useState(false)
  const [isLinkIvrRequested, setIsLinkIvrRequested] = useState(false)
  const [userInfoLinkCopy, setUserInfoLinkCopy] = useState(null)
  const [isUserDataLoading, setIsUserDataLoading] = useState(false)
  const [disableIfEmailExists, setDisableIfEmailExists] = useState(true)
  const [renderIfDiffUser, setRenderIfDiffUser] = useState(false)
  const [notifyIfEmailExist, setNotifyIfEmailExist] = useState(false)
  const [isLinked, setIsLinked] = useState(false)
  const [disableIfCompanyNameLong, setDisableIfCompanyNameLong] = useState(true)
  const [email, setEmail] = useState('')
  const [uniqueActiveDomains, setuniqueActiveDomains] = useState([])
  const [ivrSetValue, setIvrSetValue] = useState('No')
  let roleDisable = props.linkedDetails && props.linkedDetails.loggedInVendorId != props.linkedDetails.linkedParentVendorId;
  useEffect(() => {
        let { setInitialValues, userdata, deleteMsg, userReg, createCompany, isLinkedUser } = props
    if (createCompany && createCompany.data && createCompany.data.createUpdVendorCompany && createCompany.data.createUpdVendorCompany.message && createCompany.data.createUpdVendorCompany.message.includes("Company name too long")) {
      setDisableIfCompanyNameLong(true)
      setCompanyError(true)
    }
    else {
      setDisableIfCompanyNameLong(false)
      setCompanyError(false)
    }

    let selSubmarkets = [{ value: userReg, label: userReg }]
    setSelSubmarkets(selSubmarkets)
    let { vendor_region } = props;
    let uniqueReg = []
    if (typeof vendor_region != 'string')
      uniqueReg = vendor_region && vendor_region.length > 0 && [...new Set(vendor_region)]
    else if (vendor_region && vendor_region.length > 0)
      uniqueReg.push(vendor_region)

    let rows = []
    uniqueReg && uniqueReg.map((submarket) => {
      rows.push({ 'value': submarket, 'label': submarket })
    })
    deleteMsg()
    setInitialValues(formName, userdata)
    let userPhone = userdata && userdata.phone ? userdata.phone.trim() : ''
    setValue('phone', userPhone)
    if (userdata && userdata.fname && userdata.fname.length > 0) {
      setIsCreateUser(false)
      setDisableIfEmailExists(false)
    }
    // var debounce_fun = _.debounce(onEmailChange(), 1000);
    // debounce_fun()
  }, [])




  const setValue = (field, value) => {
    props.setValue(formName, field, value)
  }

  const changeUserInfoPhone = (e) => {
    setUserInfoLink({ ...userInfoLink, PHONE_NUMBER: e.target.value })

    if (e.target.name === 'phone') {
      let val = parseInt(e.target.value)
      if (isNaN(val) || val < 0 || e.target.value.length < 10) {
        setInValidPhoneNo(true)
      } else {
        setInValidPhoneNo(false)
      }
    }
  }
  const renderLinkUserData = () => {
        return (
      <div className="row">
        <div className="col-lg-12 row_top_space float-left">
          {!hasPreviousIvrAccess && (props.currentValues.get("phone") && props.currentValues.get("phone") != "") ?
            <div> <div className="col-lg-6 float-left ml-4">

              <label>IVR Access Required</label>
              <RadioGroup
                name="LinkIvrAccess"
                onChange={(e) => onDataChange(e)}
                style={{ flexDirection: "inherit" }}>
                <FormControlLabel label="Yes" labelPlacement="end" value="Yes" control={<Radio color="primary" checked={!!isLinkIvrRequested} />} />
                <FormControlLabel label="No" labelPlacement="end" value="No" control={<Radio color="primary" />} />
              </RadioGroup>
            </div>
              {/* {(isLinkIvrRequested) ? <div className="col-md-1.5"> <span style={{ paddingLeft: '12px', color: "blue", cursor: "pointer" }} onClick={this.handleIvrRequestLinked} ><b>Need additional IVR access to other submarkets?</b></span>
              </div> : null
              } */}
            </div>
            : null}
          <div className="col-lg-12 float-left" style={{ paddingBottom: '30px' }} >
            {
              (multiSubmarSelLinked && isLinkIvrRequested) ? (<div className="col-lg-12 float-left">
                <h6>
                  To edit access location use the dropdown below
                </h6>
                <div className="col-lg-6 float-left" style={{ marginLeft: '-1em', backgroundColor: 'white' }} >
                  <Picky
                    styles={{ fontSize: '12px', marginTop: '5px', width: '130px', backgroundColor: 'black' }}
                    value={selSubmarkets}
                    options={renderSubmarOptsLinked()}
                    onChange={(e) => handleSubmarSel(e)}
                    open={false}
                    valueKey="value"
                    labelKey="label"
                    multiple={true}
                    includeSelectAll={false}
                    includeFilter={true}
                    clearFilterOnClose={true}
                    dropdownHeight={120}
                  />

                </div>
                <div className="col-lg-12 float-left" style={{ marginTop: '1em', marginLeft: '-2em' }}>
                  <div className="col-lg-6 float-left">

                    <label>Justification{selSubmarkets.length > 1 ? <span style={{ color: 'red' }}>*</span> : null}</label>
                    <input type="text"
                      label="Justification"
                      name="justification"
                      value={justification || ''} onChange={(e) => handleJustification(e)}
                      className="form-control Form-input"
                      style={{ height: '3em', borderRadius: "0rem", border: "1px solid black" }}
                      disabled={props.isAcceptedWork} fullWidth={true}
                    />
                  </div> </div>
              </div>)
                : null
            }
          </div>
          <div className="col-lg-12 row_top_space float-right" style={{ paddingBottom: '30px', paddingLeft: '3em', marginTop: '-2em' }} >
            <FormControlLabel
              control={<Checkbox
                onChange={() => { setLinkUserSelected(!linkUserSelected) }}
                checked={linkUserSelected}
                color="default"
                name="linkUser"
              />} label={"Do you want to add this user from " + (!!userInfoLink && !!userInfoLink.VENDOR_NAME ? userInfoLink.VENDOR_NAME : '') + " in " + (!!userInfoLink && !!userInfoLink.VENDOR_REGION ? userInfoLink.VENDOR_REGION : '') + " as a subcontractor with portal user role?"} />
          </div>

          <div className="col-lg-12 row_top_space row">
            <div className="col-md-6"></div>
            <div className="col-md-6">
              <button type="submit" className="Button--secondary u-floatRight mr-3" onClick={(e) => donotLink(e)}  >
                Cancel
              </button>
              <button type="submit" className="Button--secondary u-floatRight mr-3" disabled={isLinkLoader || !linkUserSelected || (!userInfoLink['PHONE_NUMBER'] && isLinkIvrRequested)} onClick={(e) => linkUser(e)} >
                Link
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formPostRequest = () => {

    let {
      CONTACT_UNID = '',
      EMAIL_ADDRESS = '',
      FIRST_NAME = '',
      ISSO_USERID = '',
      IS_ISSO_REG = '',
      LAST_NAME = '',
      LAST_UPDATED_BY = '',
      LAST_UPDATED_DATE = '',
      MARKET = '',
      OPSTRACKER_USERID = '',
      PHONE_NUMBER = '',
      SUB_MARKET = '',
      USER_UUID = '',
      VDR_UNQ_ID = '',
      VENDOR_ID = '',
      VENDOR_ROLE = '',
    } = userInfoLink;
    let { userInfo, UsersList } = props
    UsersList = UsersList ? UsersList.toJS() : null
    return {
      "data": {
        "email": EMAIL_ADDRESS,
        "to_link_vendor_id": userInfo.get('vendor_id') ? userInfo.get('vendor_id') : props.selectedvendor_id ? props.selectedvendor_id : 0,
        "to_link_vendor_name": userInfo.get('vendor_name'),
        "to_link_vendor_region": userInfo.get('vendor_area'),
        "to_link_vendor_sponser_email": UsersList && UsersList.length > 0 ? UsersList[0].vendor_sponsor_email : '',
        "created_by": userInfo.get('name'),
        "ivr_status": hasPreviousIvrAccess ? "Y" : "N"
      }
    }
  }
  const linkUser = (e) => {
    e.preventDefault()
    let { user, userInfo, currentValues, handleHideModal, notificationSystem, userdata, loginId, vendor_region, vendor_sponsor_id, manager_emails, vendorAdminName, vendorAdminPhone } = props
    let { EMAIL_ADDRESS: email, FIRST_NAME: fname, LAST_NAME: lname, PHONE_NUMBER: phone } = userInfoLink;
    let postReq = formPostRequest()
    setLinkLoader(true)
    props.linkUserToCmp(loginId, { query: linkUserToCmpDef, variables: { linkExistingVendorToNewCompanyInp: postReq } }).then(action => {

      if (action && action.type == 'LINK_USER_SUCCESS' && action.response && action.response.data && action.response.data.linkExistingVendorToNewCompany && action.response.data.linkExistingVendorToNewCompany.output && action.response.data.linkExistingVendorToNewCompany.output.linkStatus == 'Success') {
        notificationSystem.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: 'User linked Successfully',
          autoDismiss: 10
        })
        if (!hasPreviousIvrAccess && isLinkIvrRequested) {
          let ivrUser = {
            sponsor: vendor_sponsor_id,
            phone: phone,
            subMarketList: getAllSubMarForCurrentVendor(),
            userLastName: lname,
            vendorId: userInfo.get('vendor_id') ? userInfo.get('vendor_id') : props.selectedvendor_id ? props.selectedvendor_id : 0,
            userFirstName: fname,
            accountLocked: false,
            email: email,
            login: "S-iopvp",
            managerName: vendorAdminName,
            managerPhone: vendorAdminPhone,
            userId: userdata.userid || userInfoLink.OPSTRACKER_USERID
          }

          //send ivr
          props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUser } }).then(action => {
            
            if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
              && action.techId.data.createUpdIvrUser.techId != null) {
              notificationSystem.addNotification({
                title: 'Success',
                position: "br",
                level: 'success',
                message: action.techId.data.createUpdIvrUser.message,
                autoDismiss: 10
              })
              let logMsg= `IVR access added for ${userInfoLink.OPSTRACKER_USERID}`

              props.logActioninDB(user.get('userid'), user.get('email'), user.get('vendor_id'), null, user.get('vendor_area'), user.get('vendor_region'), logMsg,'','','');

            }
          })
        }
        let logMsg= `${userInfoLink.OPSTRACKER_USERID} is linked to ${postReq.data.to_link_vendor_id}`
        props.logActioninDB(user.get('userid'), user.get('email'), user.get('vendor_id'), null, user.get('vendor_area'), user.get('vendor_region'), logMsg,'','','');

      }
      else if (action.response && action.response.errors.length > 0 && action.response.errors[0].data && action.response.errors[0].data.detail) {
        let errorMsg = action.response.errors[0]
        notificationSystem.addNotification({
          title: 'Error',
          position: "br",
          level: 'error',
          message: action.response.errors[0].data.detail,
          autoDismiss: 10
        });
      }
    })
    setTimeout(() => {
      props.handleHideModal();
      setLinkLoader(false)
    }, 2200)
  }
  const donotLink = () => {
    setTimeout(() => {
      props.handleHideModal()
    }, 2200)
  }

  const updateUser = (updateValues, ivrUser, emailNotification) => {

    const { user, notificationSystem, handleHideModal } = props;

    props.updateUser(user.get("login_id"), { query: updateContactDef, variables: { VendorInput: updateValues } }).then(action => {

      if (!action || (action && action.type !== "UPDATE_USER_FAILURE")) {

        if (action.response && action.response.data && action.response.data.updateContact) {
          notificationSystem.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            message: action.response.data.updateContact.message,
            autoDismiss: 10
          })
          setTimeout(() => {
            handleHideModal()
          }, 2200)

          if(props.onUserLoad){
            props.onUserLoad();
          }
          if(props.setSearchValue){
            props.setSearchValue();
          }
          
          // if (isIvrRequested) {
          if(ivrUser?.phone) {
            props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUser } }).then(action => {
              if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
                && action.techId.data.createUpdIvrUser.techId != null) {
                notificationSystem.addNotification({
                  title: 'Success',
                  position: "br",
                  level: 'success',
                  message: action.techId.data.createUpdIvrUser.message,
                  autoDismiss: 10
                })
                // props.ivrEmailNotify(user.get("login_id"), { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } }).then(action => {
                //   if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
                //     notificationSystem.addNotification({
                //       title: 'Success',
                //       position: "br",
                //       level: 'success',
                //       message: action.response.data.ivrEmailNotification.message,
                //       autoDismiss: 10
                //     })
                //   }
                // })
              } else if (action.techId && action.techId.data && action.techId.data.createUpdIvrUser.techId == null) {
                notificationSystem.addNotification({
                  title: 'Error',
                  position: "br",
                  level: 'error',
                  message: "Oops! Some thing went wrong",
                  autoDismiss: 10
                })
              }
            })
          // } else {
            // setTimeout(() => {
            //   handleHideModal()
            // }, 2200)
          // }
        }
        } else if (action.response && action.response.data && action.response.errors && action.response.errors.length > 0) {
          notificationSystem.addNotification({
            title: 'Error',
            position: "br",
            level: 'error',
            message: action.response.errors[0].data.message,
            autoDismiss: 10
          })
        } else {
          notificationSystem.addNotification({
            title: 'Error',
            position: "br",
            level: 'error',
            message: "Somthing went wrong!",
            autoDismiss: 10
          })
        }

      }

    })
  }

  const onSubmit = (e) => {
    e.preventDefault()

    let { user, currentValues, handleHideModal, selectedvendor_id, notificationSystem, userdata, loginId, vendor_region, vendor_sponsor_id, manager_emails, vendorAdminName, vendorAdminPhone, isLinkedUser, hasParentIvrAccessInUpdate, linkedUserInParent } = props
    let { email, fname, lname, phone, title, vendor_role, contact_unid } = currentValues.toJS()
    const vendor_id = selectedvendor_id ? selectedvendor_id : user.get("vendor_id")
    let values = {
      email,
      fname,
      lname,
      phone,
      title,
      vendor_role,
      contact_unid,
      vendor_id,
      created_by: user.get("name"),
    }

    let ivrUser = {
      sponsor: vendor_sponsor_id,
      phone: phone,
      subMarketList: selSubmarkets.length > 0 ? selSubmarkets.map(item => item.label) : vendor_region ? vendor_region : user.get("vendor_region"),
      userLastName: lname,
      vendorId: props.selectedvendor_id,
      userFirstName: fname,
      accountLocked: false,
      email: email,
      login: "S-iopvp",
      managerName: vendorAdminName,
      managerPhone: vendorAdminPhone
    }
    if (manager_emails)
      manager_emails.push(email)
    let emailNotification = {}
    if (selSubmarkets.length > 1) {
      emailNotification = {
        body: fname + " " + lname + " from Vendor Company " + user.get("vendor_name")
          + " has been granted IVR access in " + props.userReg + ", the vendor contractor has been granted additional IVR access to " + selSubmarkets.map(i => { if (i.value !== props.userReg) return i.value }) + " due to the reason of " + justification
          + ". If you have any objection/concern, Please use IVR Admin GUI to make correction.(https://ivr.vh.vzwnet.com/)",
        from: "IOP Vendor Portal",
        recipients: manager_emails,
        sourceName: "IOP Vendor Portal",
        subject: "New IVR Access added",
        transactionId: "iopvendorportal-" + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
      }
    } else {
      emailNotification = {
        body: fname + " " + lname + " from Vendor Company " + user.get("vendor_name")
          + " has been granted IVR access in your " + props.userReg + " submarket."
          + "If you have any objection/concern, Please use IVR Admin GUI to make correction.(https://ivr.vh.vzwnet.com/)",
        from: "IOP Vendor Portal",
        recipients: manager_emails,
        sourceName: "IOP Vendor Portal",
        subject: "New IVR Access added",
        transactionId: "iopvendorportal-" + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
      }
    }
    if (userdata.userid && userdata.userid != null) {
      ivrUser["userId"] = userdata.userid
    }

    if (inValidEmail || inValidPhoneNo) {
      return
    }


    if (isCreateUser) {
      // props.getUserInfoLinked(user.get("login_id"), { query: getUserInfoLinkedDef, variables: { vendorEmail: email } }).then(inAction => {
      // if (inAction && inAction.response && inAction.response.data && inAction.response.data.getUserInfoLinked && inAction.response.data.getUserInfoLinked.userinfo) {
      //   const vendorId = inAction.response.data.getUserInfoLinked.userinfo.VENDOR_ID;
      //   let hasPreviousIvrAccess = false;
      //   props.getIvrVendorTech("S-iopvp", vendorId).then((action) => {
      //     if (action.type === 'GET_IVR_VENDOR_TECH_LIST_SUCCESS') {
      //       if (action.response.data.getVendorTechForVendorId && action.response.data.getVendorTechForVendorId.data.length > 0) {
      //         hasPreviousIvrAccess = action.response.data.getVendorTechForVendorId.data.find(tech => tech.SUBMARKET_COUNT > 0 && tech.USERID === inAction.response.data.getUserInfoLinked.userinfo.OPSTRACKER_USERID);
      //       }
      //     }
      //     this.setState({
      //       hasPreviousIvrAccess: !!hasPreviousIvrAccess
      //     })
      //     this.setState({ userInfoLink: inAction.response.data.getUserInfoLinked.userinfo, showLinkDiv: true, userInfoLinkCopy: inAction.response.data.getUserInfoLinked.userinfo })
      //   })
      // }
      // else {



      props.createUser(user.get("login_id"), { query: createContactDef, variables: { VendorInput: values } }).then(action => {

        //  setTimeout(() => { props.onUserLoad() }, 2200)
        if (!action || (action && action.type !== "CREAT_USER_FAILURE")) {
          if (action.response && action.response.errors && action.response.errors.length > 0 && action.response.errors[0] && action.response.errors[0].data && action.response.errors[0].data.message.includes('user with this email id already exists')) {
          }
          if (action.response && action.response.data && action.response.data.createContact) {

            notificationSystem.addNotification({
              title: 'Success',
              position: "br",
              level: 'success',
              message: action.response.data.createContact.message,
              autoDismiss: 10
            })
            setTimeout(() => {
              props.handleHideModal()
            }, 2200)

            if (action.response.data.createContact.data && action.response.data.createContact.data.userid) {
              ivrUser["userId"] = action.response.data.createContact.data.userid
            }
            if (isIvrRequested) {
              props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUser } }).then(action => {
                if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
                  && action.techId.data.createUpdIvrUser.techId != null) {
                  notificationSystem.addNotification({
                    title: 'Success',
                    position: "br",
                    level: 'success',
                    message: action.techId.data.createUpdIvrUser.message,
                    autoDismiss: 10
                  })
                  props.ivrEmailNotify(user.get("login_id"), { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } }).then(action => {
                    if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
                      notificationSystem.addNotification({
                        title: 'Success',
                        position: "br",
                        level: 'success',
                        message: action.response.data.ivrEmailNotification.message,
                        autoDismiss: 10
                      })
                    }
                  })
                  let logMsg= `IVR access added for ${ivrUser["userId"]}`

                  props.logActioninDB(user.get('userid'), user.get('email'), user.get('vendor_id'), null, user.get('vendor_area'), user.get('vendor_region'), logMsg,'','','');
    
                  setTimeout(() => {
                    handleHideModal()
                  }, 2200)
                } else if (action.response && action.response.data && action.response.data.createUpdIvrUser.techId == null) {
                  notificationSystem.addNotification({
                    title: 'Error',
                    position: "br",
                    level: 'error',
                    message: "Oops! Some thing went wrong IVR Access Request failed",
                    autoDismiss: 10
                  })
                }

              })
            } else {

              // setTimeout(() => {
              //   handleHideModal()
              // }, 2200)
            }

          } else if (action.response && action.response.data && action.response.errors && action.response.errors.length > 0) {
            notificationSystem.addNotification({
              title: 'Error',
              position: "br",
              level: 'error',
              message: action.response.errors[0].data.message,
              autoDismiss: 10
            })
          } else {
            notificationSystem.addNotification({
              title: 'Error',
              position: "br",
              level: 'error',
              message: "Somthing went wrong!",
              autoDismiss: 10
            })
          }

        }

      })
      // }
      // })


    }
    else {
       if(props.isLinkedUser && !props.linkedUserInParent){
        props.getUserInfoLinked(user.get("login_id"), { query: getUserInfoLinkedDef, variables: { vendorEmail: email } }).then(inAction => {
          if (inAction && inAction.response && inAction.response.data && inAction.response.data.getUserInfoLinked && inAction.response.data.getUserInfoLinked.userinfo) {
            const vendorId = inAction.response.data.getUserInfoLinked.userinfo.VENDOR_ID;
            let contactUnid = inAction.response.data.getUserInfoLinked.userinfo.CONTACT_UNID
            let updateValues = {
              ...values,
              vendor_id: vendorId ? Number(vendorId) : null,
              contact_unid: contactUnid, 
              created_by: user.get("name"),
            }
            ivrUser["vendorId"] = vendorId ? Number(vendorId) : null
            updateUser(updateValues, ivrUser, emailNotification)
          }
            })
      } 
      else {
        let updateValues = {
          ...values,
          vendor_id: userdata.vendor_id ? Number(userdata.vendor_id) : null,
          contact_unid: userdata.contact_unid
        }
          ivrUser["vendorId"] = userdata.vendor_id ? Number(userdata.vendor_id) : null
         updateUser(updateValues, ivrUser, emailNotification)
          }
        
      }
  }

  const handleChange = event => {
    if (event.target) {
      setIsIvrRequested(event.target.checked)
    }
  }

  const renderLoading = () => {
    return (
      <Loader color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center" />
    )
  }

  // useEffect(() => {
  //   if (email.length > 0)
  //     onEmailChange(email)
  // }, [email])

  
  const handleBlur = (e) =>{
      onEmailChange(email);
 }

  const handleKeyDown = (e) =>{
    if (e.key === 'Enter'){
      onEmailChange(email);
    } 
 }

  const onDataChange = (e) => {
    if (e.target) {
      setValue(e.target.name, e.target.value);

      if (e.target.name === 'email') {
        if (!validateEmail(e.target.value)) {
          let selSubmarkets = [{ value: props.userReg, label: props.userReg }]
          setSelSubmarkets(selSubmarkets)
          setIsLinkIvrRequested(false)
          setMultiSubmarSelLinked(false)
          setInValidEmail(true)
          setDisableIfEmailExists(true)
          setRenderIfDiffUser(false)
          setNotifyIfEmailExist(false)
          if (isCreateUser) {
            props.setInitialValues(formName, {
              "email": e.target.value
            });
          }
        } else {
          let selSubmarkets = [{ value: props.userReg, label: props.userReg }]
          setSelSubmarkets(selSubmarkets)
          setIsLinkIvrRequested(false)
          setMultiSubmarSelLinked(false)
          let email = e.target.value
          setInValidEmail(false)
          setEmail(email)
        }
      } else if (e.target.name === 'phone') {
        let val = parseInt(e.target.value)
        if (props.buttonText === 'Update') {
          if ((isNaN(val) || val < 0 || e.target.value.length < 10)) {
            setInValidPhoneNo(true)
            setDisableSubmit(true)
          } else {
            setInValidPhoneNo(false)
            setDisableSubmit(false)
          }

        }
        else {
          if ((isIvrRequested) && (isNaN(val) || val < 0 || e.target.value.length < 10)) {
            setInValidPhoneNo(true)
          } else {
            setInValidPhoneNo(false)
          }
        }
        if ((isNaN(val) || val < 0 || e.target.value.length < 10))
          setInValidPhoneNo(true)
      }
      else if (e.target.name === 'IvrAccess') {
        if(e.target.value == "Yes"){
          setIvrSetValue("Yes")
        }
        else{
          setIvrSetValue("No")
        }
        setIsIvrRequested(e.target.value == "Yes")
        setMultiSubmarSel(e.target.value == "Yes")
        let currentph = props.currentValues.toJS().phone
        if (props.buttonText === 'Update') {
          if (e.target.value == "Yes" && (isNaN(currentph) || currentph < 0 || currentph.length < 10)) {
            setInValidPhoneNo(true)
          } else {
            setInValidPhoneNo(false)
          }
        }
      } else if (e.target.name === 'LinkIvrAccess') {
        setIsLinkIvrRequested(e.target.value == "Yes")
        setMultiSubmarSel(e.target.value == "Yes")
      }
      else if (e.target.name === "vendor_role") {
        if (e.target.value === 'PORTALUSER') {
          if (renderIfDiffUser) {
            setIsLinkIvrRequested(true)
            setMultiSubmarSelLinked(false)
          } else {
                setIvrSetValue('Yes')
                setIsIvrRequested(true)
          }
          if (props.buttonText === 'Update') {
            setIvrSetValue('No')
            setIsIvrRequested(false)
            setMultiSubmarSel(false)
          } else {
            setMultiSubmarSel(true)
          }
          let currentph = props.currentValues.toJS().phone
          if (isIvrRequested) {
            if ((isNaN(currentph) || currentph < 0 || currentph.length < 10)) {
              setInValidPhoneNo(true)
            } else {
              setInValidPhoneNo(false)
            }
          }
        } else if (e.target.value === 'PORTALADMIN') {
          if(ivrSetValue==''){
            setIvrSetValue('No')
            setIsIvrRequested(false)}
          
          if (renderIfDiffUser) {
            setIsLinkIvrRequested(false)
            setMultiSubmarSelLinked(false)
          } else {
            setIvrSetValue('No')
            setIsIvrRequested(false)
          }
        }
      }
    }
    else {
      setValue(e.name, e.value)
      if (e.value === 'PORTALUSER') {
        if (renderIfDiffUser) {
          setIsLinkIvrRequested(true)
          setMultiSubmarSelLinked(false)
        } else {
          setIvrSetValue('Yes')
          setIsIvrRequested(true)
        }

        let currentph = props.currentValues.toJS().phone
        if (isIvrRequested) {
          if ((isNaN(currentph) || currentph < 0 || currentph.length < 10)) {
            setInValidPhoneNo(true)
          } else {
            setInValidPhoneNo(false)
          }
        }
      } else if (e.value === 'PORTALADMIN') {
        if (renderIfDiffUser) {
          setIsLinkIvrRequested(false)
          setMultiSubmarSelLinked(false)
        } else {
          if(ivrSetValue==''){
            setIvrSetValue('No')
          setIsIvrRequested(false)}
        }
      }
    }
  }


  const resetValidation = () => {
    setInValidPhoneNo(false)
  }


  const onEmailChange = (email) => {
    if (!inValidEmail && isCreateUser) {
      let selSubmarkets = [{ value: props.userReg, label: props.userReg }]
      setSelSubmarkets(selSubmarkets)
      setIsUserDataLoading(true)
      setJustification('')
      props.getUserInfoLinked(props.user.get("login_id"), { query: getUserInfoLinkedDef, variables: { vendorEmail: props.currentValues.toJS().email } }).then(async (res) => {
        setIsUserDataLoading(false)
        let userInfoLinked = res && res.response && res.response.data && res.response.data.getUserInfoLinked && res.response.data.getUserInfoLinked.userinfo;
        resetValidation()
        if (userInfoLinked != null) {
          setIsLinked(false)
          props.setInitialValues(formName, {
            "vendor_id": userInfoLinked.VENDOR_ID,
            "vendor_name": userInfoLinked.VENDOR_NAME,
            "vendor_sponsor_id": "",
            "vendor_category": "",
            "vendor_area": userInfoLinked.VENDOR_AREA,
            "vendor_region": userInfoLinked.VENDOR_REGION,
            "vendor_service_email": "",
            "vendor_phone": "",
            "vendor_address": "",
            "vendor_city": "",
            "vendor_state": "",
            "vendor_zip": "",
            "vendor_peoplesoft_id": "",
            "userid": "",
            "fname": userInfoLinked.FIRST_NAME,
            "lname": userInfoLinked.LAST_NAME,
            "name": "",
            "phone": userInfoLinked.PHONE_NUMBER,
            "email": userInfoLinked.EMAIL_ADDRESS,
            "title": '',
            "vendor_role": userInfoLinked.VENDOR_ROLE,
            "contact_unid": ""
          });
          setDisableIfEmailExists(true)
          setNotifyIfEmailExist(true)
          let vId = props.createEsso ? props.vendorEsso?.toJS()[0].vendor_id : props.user.get('vendor_id') ;
          if (vId != userInfoLinked.VENDOR_ID) {
            setRenderIfDiffUser(true)
            setUserInfoLink(userInfoLinked)
            props.activeDomains(props.loginId, userInfoLinked.OPSTRACKER_USERID).then(res => {
              let allSubmarkets = props.submarketList && props.submarketList.toJS().submarketData;
              if (res && res.type == "ACTIVE_DOMAIN_SUCCESS") {
                let activeDomain = res && res.response && res.response.subMarket

                let { vendor_region } = props;
                let uniqueReg = []

                if (typeof vendor_region != 'string')
                  uniqueReg = vendor_region && vendor_region.length > 0 && [...new Set(vendor_region)]

                else if (vendor_region && vendor_region.length > 0)
                  uniqueReg.push(vendor_region)

                if (userInfoLink && userInfoLink.VENDOR_REGION)
                  uniqueReg.push(userInfoLink.VENDOR_REGION)

                uniqueReg = [...new Set(uniqueReg)]
                let uniqueActiveDomains = [...new Set(activeDomain)]
                setuniqueActiveDomains(uniqueActiveDomains)
                uniqueActiveDomains = uniqueActiveDomains.map(e => e.toLowerCase())

                uniqueReg = uniqueReg && uniqueReg.filter(e => uniqueActiveDomains.includes(e.toLowerCase()))

                if (activeDomain.length > 0) {

                  let subs = allSubmarkets.filter(e => uniqueActiveDomains.includes(e.toLowerCase()))

                  uniqueReg = [...uniqueReg, ...subs]
                }

                uniqueReg = [...new Set(uniqueReg)]

                let rows = []
                uniqueReg && uniqueReg.map((submarket) => {
                  rows.push({ 'value': submarket, 'label': submarket })
                })
                setSelSubmarkets(rows)
              }
            })


          } else {
            setRenderIfDiffUser(false)
          }
        } else {
          setIsLinked(true)

          props.setInitialValues(formName, {
            "email": email
          });
          setDisableIfEmailExists(false)
          setRenderIfDiffUser(false)
          setNotifyIfEmailExist(false)
        }
      }).catch((err) => {
        setIsUserDataLoading(false)
        console.log(err)
      })
    }
  }

  const handleKeyPress = (e) => {
    if (e.target.value.length > 9) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const renderOptions = () => {
    const rows = [
      { 'value': 'PORTALUSER', 'label': 'PORTALUSER', 'name': 'vendor_role' },
      { 'value': 'PORTALADMIN', 'label': 'PORTALADMIN', 'name': 'vendor_role' }]
    return rows
  }
  const handleIvrRequest = (e) => {
    e.preventDefault();
    this.setState({ multiSubmarSel: true })
  }
  const handleIvrRequestLinked = (e) => {
    e.preventDefault();
    setMultiSubmarSelLinked(true)
  }
  const renderSubmarOpts = () => {
    let { vendor_region } = props;
    let uniqueReg = []
    if (typeof vendor_region != 'string')
      uniqueReg = vendor_region && vendor_region.length > 0 && [...new Set(vendor_region)]
    else if (vendor_region && vendor_region.length > 0)
      uniqueReg.push(vendor_region)
    let rows = []
    uniqueReg && uniqueReg.map((submarket) => {
      rows.push({ 'value': submarket, 'label': submarket })
    })
    return rows
  }
  const renderSubmarOptsLinked = () => {
    let { vendor_region } = props;
    let uniqueReg = []

    if (typeof vendor_region != 'string')
      uniqueReg = vendor_region && vendor_region.length > 0 && [...new Set(vendor_region)]
    else if (vendor_region && vendor_region.length > 0)
      uniqueReg.push(vendor_region)

    if (userInfoLink && userInfoLink.VENDOR_REGION)
      uniqueReg.push(userInfoLink.VENDOR_REGION)

    uniqueReg = [...new Set(uniqueReg)]
    let allSubmarkets = props.submarketList && props.submarketList.toJS().submarketData
    let uniqueDomain = uniqueActiveDomains
    if (uniqueDomain && uniqueDomain.length > 0) {
      let smalluniqueDomain = uniqueDomain.map(e => e.toLowerCase())
      let allSubs = allSubmarkets.filter(e => smalluniqueDomain.includes(e.toLowerCase()))
      uniqueReg = [...uniqueReg, ...allSubs]
    }


    uniqueReg = [...new Set(uniqueReg)]
    let rows = []
    uniqueReg && uniqueReg.map((submarket) => {
      rows.push({ 'value': submarket, 'label': submarket })
    })
    return rows
  }
  const getAllSubMarForCurrentVendor = () => {
    let { vendor_region, user } = props

    let uniqueReg = []
    // if(typeof vendor_region != 'string')
    // uniqueReg = vendor_region && vendor_region.length > 0 && [...new Set(vendor_region)]
    // else if(vendor_region && vendor_region.length > 0)
    // uniqueReg.push(vendor_region)

    uniqueReg = selSubmarkets.length > 0 ? selSubmarkets.map(item => item.label) : vendor_region ? vendor_region : user.get("vendor_region")

    return uniqueReg;
  }
  const handleSubmarSel = (e) => {
    if (e.length > 1) {
      setDisableSubmit(true)
    } else {
      setDisableSubmit(false)
    }
    setSelSubmarkets(e)
  }
  const handleJustification = (e) => {
    if (!!e.target.value) {
      setDisableSubmit(false)
    } else {
      setDisableSubmit(true)
    }
    setJustification(e.target.value)
  }
  const disablingSubmit = () => {
    let { currentValues } = props;
    if (!currentValues.get('email') || !currentValues.get('fname') || !currentValues.get('lname') || !currentValues.get('vendor_role')) {
      return true;
    }
    else {
      return false;
    }
  }
  let { hasParentIvrAccessInUpdate, linkedUserInParent, currentValues, isAcceptedWork, isLoading, savedMessage, buttonText, errorsMessage, deleteMsg, ivr_access, ivrErrorMsg, isIVRLoading, isLinkedUser, createCompany, vendor_region } = props;
  let disableAllExceptPhoneIVR = false, dontShowUpdate = false;
  let customStyle = { fontSize: '12px', marginTop: '5px', width: '130px', backgroundColor: 'black' }
  if (isLinkedUser && buttonText === "Update") {
    if (!linkedUserInParent) {
      if (!hasParentIvrAccessInUpdate) {
        disableAllExceptPhoneIVR = true;
      } else {
        dontShowUpdate = true;
      }
    }
  }
  
  return (
    <div className="">
      {isLoading ? renderLoading() : null}
      {savedMessage && savedMessage.get("message") && (<MessageBox messages={List([savedMessage.get("message")])} className="alert-success" onClear={() => deleteMsg} />)}
      {errorsMessage && (<MessageBox messages={List([errorsMessage])} onClear={() => deleteMsg} />)}
      {ivrErrorMsg && (<MessageBox messages={List([ivrErrorMsg])} onClear={() => deleteMsg} />)}

      <form className="float-label">

        {/* {!currentValues.get("phone") && isIvrRequested && <h4 className="text-danger text-center"><b>Please input all mandatory fields</b></h4>} */}
        <div className="row ">
          {isUserDataLoading ? <OverlayLoader /> : null}
          <div className="col-lg-12 float-left">
            {
              notifyIfEmailExist && !inValidEmail ?
                <h4 className="text-info text-center">
                  <b>The user already exists {renderIfDiffUser ? (`with the same vendor in ${userInfoLink && userInfoLink.VENDOR_REGION} under vendor name: ${userInfoLink && userInfoLink.VENDOR_NAME} (Vendor ID: ${userInfoLink && userInfoLink.VENDOR_ID}). To view this user's profile, please switch to the correct market`) : 'with the same Vendor'}</b>
                </h4> : null
            }
            <div className="col-lg-6 float-left ">

              <label>Email<span style={{ color: 'red' }}>*</span></label>
              <input type="text"
                label="Email"
                name="email"
                value={currentValues.get("email") || ''} onChange={(e) => onDataChange(e)}
                onKeyDown={(e)=>handleKeyDown(e)}
                onBlur={(e)=> handleBlur(e)}
                className="form-control Form-input required"
                style={{ fontSize: '0.9em', fontFamily: 'Arial, Helvetica, sans-serif', height: '3em', borderRadius: "0rem", border: inValidEmail ? "1px solid red" : "1px solid black" }}
                disabled={buttonText == "Update" || isAcceptedWork || disableAllExceptPhoneIVR}
              />
              {!inValidEmail ? null : <div style={{ color: 'red', fontSize: '11px' }} className="text text-sm"> Invalid Email</div>}
            </div>
            {(buttonText != "Update" && isIvrRequested)?
              <div className="col-lg-5 float-left ml-3">

                <label>Phone Number<span style={{ color: 'red' }}>*</span></label>
                <input type="number"
                  label="Phone No"
                  name="phone"
                  value={currentValues.get("phone") || ''} onChange={(e) => onDataChange(e)}
                  className={!isIvrRequested ? "form-control Form-input" : "form-control Form-input required"}
                  style={{ fontSize: '0.9em', fontFamily: 'Arial, Helvetica, sans-serif', height: '3em', borderRadius: "0rem", border: inValidPhoneNo ? "1px solid red" : "1px solid black" }}
                  disabled={isAcceptedWork} fullWidth={true} minLength="10" maxLength="10" onKeyPress={(e) => handleKeyPress(e)}
                />
                {!inValidPhoneNo ? null : <div style={{ color: 'red', fontSize: '11px' }} className="text text-sm"> Please enter valid 10 digit phone number without dashs and dot</div>}
              </div>
              :
              <div className="col-lg-5 float-left ml-3">

                <label>Phone Number</label>
                <input type="number"
                  label="Phone No"
                  name="phone"
                  value={currentValues.get("phone") || ''} onChange={(e) => onDataChange(e)}
                  className="form-control Form-input"
                  style={{ fontSize: '0.9em', fontFamily: 'Arial, Helvetica, sans-serif', height: '3em', borderRadius: "0rem", border: inValidPhoneNo ? "1px solid red" : "1px solid black" }}
                  disabled={isAcceptedWork || disableIfEmailExists} fullWidth={true} minLength="10" maxLength="10" onKeyPress={(e) => handleKeyPress(e)}
                />
                {!inValidPhoneNo ? null : <div style={{ color: 'red', fontSize: '11px' }} className="text text-sm"> Please enter valid 10 digit phone number without dashs and dot</div>}


              </div>
            }
            <div className="col-lg-12 float-left ">
            </div>

            <div className="col-lg-3 float-left mt-3">
              <style>
                {`.Select-control{
                      border-color: #e6e6e6;
                      border-top: 0px;
                      border-right: 0px;
                      border-left: 0px;
                    }
                    .rt-resizable-header-content {
                        font-weight: 600;
                        color: #607D8B;
                    }
                    input[type=number]::-webkit-inner-spin-button, 
                    input[type=number]::-webkit-outer-spin-button { 
                      -webkit-appearance: none; 
                      margin: 0; 
                    }`}
              </style>


              <label>First Name<span style={{ color: 'red' }}>*</span></label>
              <input type="text"
                label="First Name"
                name="fname"
                value={currentValues.get("fname") || ''} onChange={(e) => onDataChange(e)}
                className="form-control Form-input required"
                style={{ fontSize: '0.9em', fontFamily: 'Arial, Helvetica, sans-serif', height: '3em', borderRadius: "0rem", border: "1px solid black" }}
                disabled={isAcceptedWork || disableAllExceptPhoneIVR || disableIfEmailExists} fullWidth={true}
              />
            </div>

            <div className="col-lg-3 float-left mt-3">

              <label>Last Name<span style={{ color: 'red' }}>*</span></label>
              <input type="text"
                label="Last Name"
                name="lname"
                value={currentValues.get("lname") || ''} onChange={(e) => onDataChange(e)}
                className="form-control Form-input required"
                style={{ fontSize: '0.9em', fontFamily: 'Arial, Helvetica, sans-serif', height: '3em', borderRadius: "0rem", border: "1px solid black" }}
                disabled={isAcceptedWork || disableAllExceptPhoneIVR || disableIfEmailExists} fullWidth={true}
              />
            </div>

            <div className="col-lg-5 float-left mt-3 ml-3">

              <label>Title</label>
              <input type="text"
                label="Title"
                name="title"
                value={currentValues.get("title") || ''} onChange={(e) => onDataChange(e)}
                className="form-control Form-input"
                style={{ fontSize: '0.9em', fontFamily: 'Arial, Helvetica, sans-serif', height: '3em', borderRadius: "0rem", border: "1px solid black" }}
                disabled={isAcceptedWork || disableAllExceptPhoneIVR || disableIfEmailExists} fullWidth={true}
              />
            </div>
            {!(notifyIfEmailExist && !inValidEmail) && 
              <div className="col-lg-6 float-left mt-3">
                <label style={{ marginBottom: '-2em' }}>Type<span style={{ color: 'red' }}>*</span></label>
                <RadioGroup
                  className="col-12 col-md-12 no-padding float-left"
                  name="vendor_role"
                  required
                  onChange={(e) => onDataChange(e)}
                  style={{ flexDirection: "inherit" }}>
                  <FormControlLabel style={{ fontSize: '0.9em', fontFamily: 'Arial, Helvetica, sans-serif' }} label="Portal User" labelPlacement="end" value="PORTALUSER" control={<Radio disabled={(buttonText == "Update" && roleDisable) || disableIfEmailExists || disableIfCompanyNameLong} checked={currentValues.get("vendor_role") == "PORTALUSER"} color="primary" />} />
                  <FormControlLabel label="Portal Admin" labelPlacement="end" value="PORTALADMIN" control={<Radio disabled={(buttonText == "Update" && roleDisable) || disableIfEmailExists || disableIfCompanyNameLong} checked={currentValues.get("vendor_role") == "PORTALADMIN"} color="primary" />} />
                </RadioGroup>
              </div>
            }
          </div>
        </div>
      </form>

      <div className="row">
        {(notifyIfEmailExist && !inValidEmail) ? 
          <div className="col-lg-12 row_top_space">
            <button type="button" className="Button--secondary u-floatRight mr-3" onClick={() => props.handleHideModal()}>
              Close
            </button>
          </div>
          :
          renderIfDiffUser ?
            renderLinkUserData() :
            <div className="col-lg-12 float-left">

              {(!hasParentIvrAccessInUpdate && buttonText != "Update" && props.userInfo.get('vendor_category') != 'Nest Evaluation' && ivr_access != "Enabled")
                || (buttonText !== "Update" && props.userInfo.get('vendor_category') != 'Nest Evaluation' && ivr_access != "Enabled") ?
                <div>
                  <div className="col-lg-6 float-left">
                    {/* <label style={{ "fontSize": "12px", "marginTop": "10px", "color": "#a8a8a8" }}>{ivr_access == "Disabled" ? "Unlock IVR Access" : "Request IVR Access"}</label> */}
                    <label style={{ marginBottom: '-2em' }}>{ivr_access == "Disabled" ? "Unlock IVR Access" : "IVR Access Required"}<span style={{ color: 'red' }}>*</span></label>
                    <RadioGroup
                      name="IvrAccess"
                      onChange={(e) => onDataChange(e)}
                      style={{ flexDirection: "inherit" }}>
                      <FormControlLabel label="Yes" labelPlacement="end" value="Yes" control={<Radio color="primary" checked={!!isIvrRequested} disabled={disableIfEmailExists || disableIfCompanyNameLong} />} />
                      <FormControlLabel label="No" labelPlacement="end" value="No" control={<Radio color="primary" checked = {ivrSetValue == "No" && !isIvrRequested} disabled={disableIfEmailExists || disableIfCompanyNameLong} />} />
                    </RadioGroup>
                    {companyError ? <div className="col-md-1.5"><span style={{ paddingLeft: '0px', color: "blue", cursor: "pointer" }}><b>IVR access cannot be requested as Company Name is too long (Maximum length allowed is 50). Please contact Verizon sponsor for assistance</b></span></div> : null}
                  </div>  </div> : null}
              {/*                     
                    {
                      (isIvrRequested) ? <div className="col-md-1.5"> <span style={{ paddingLeft: '12px', color: "blue", cursor: "pointer" }} onClick={()=>handleIvrRequest()} ><b>Need additional IVR access to other submarkets?</b></span>
                      </div> : null
                    } */}


              <div className="col-lg-12 float-left" style={{ paddingLeft: '0px' }} >
                {
                                     (multiSubmarSel && isIvrRequested) ? (<div className="col-lg-12 float-left">
                    <h6>
                      <i className="fa fa-info-circle"></i> To edit access location use the dropdown below
                    </h6>
                    <div className="col-lg-6 float-left" style={{ marginLeft: '-1em', backgroundColor: 'white' }}>
                      <Picky
                        styles={customStyle}
                        value={selSubmarkets ? selSubmarkets : []}
                        options={renderSubmarOpts()}
                        onChange={(e) => handleSubmarSel(e)}
                        valueKey="value"
                        labelKey="label"
                        multiple={true}
                        includeFilter
                        clearFilterOnClose={true}
                        dropdownHeight={120}
                      />

                    </div>
                    <div className="col-lg-12 float-left" style={{ marginTop: '1em', marginLeft: '-2em' }}>
                      <div className="col-lg-6 float-left">

                        <label>Justification{selSubmarkets.length > 1 ? <span style={{ color: 'red' }}>*</span> : null}</label>
                        <input type="text"
                          label="Justification"
                          name="justification"
                          value={justification || ''} onChange={(e) => handleJustification(e)}
                          className="form-control Form-input"
                          style={{ fontSize: '0.9em', fontFamily: 'Arial, Helvetica, sans-serif', height: '3em', borderRadius: "0rem", border: "1px solid black" }}
                          disabled={isAcceptedWork} fullWidth={true}
                        />
                      </div> </div>
                  </div>)
                    : null
                }
              </div>

              <div className="col-lg-12 row_top_space">
                <button type="submit" onClick={(e) => onSubmit(e)} className="Button--secondary u-floatRight" disabled={disablingSubmit() || disableSubmit || (!currentValues.get("phone") && isIvrRequested)}  >
                  {isLoading ? (buttonText === "Update" ? "Updating" : "Saving") : buttonText}
                </button> </div>
            </div>
        }
      </div>
    </div>
  )
}
UserForm.propTypes = {
  workORderInfo: PropTypes.object,
  currentValues: PropTypes.object,
  setValue: PropTypes.func,
  setInitialValues: PropTypes.func,
  deleteMsg: PropTypes.func,
  aList: PropTypes.object,
  isAcceptedWork: PropTypes.bool,
  getQuotes: PropTypes.bool,
  isWorkInProgress: PropTypes.bool,
  formName: PropTypes.string,
  errorsMessage: PropTypes.string,
  buttonText: PropTypes.string,
  loginId: PropTypes.string,
  isLoading: PropTypes.bool,
  savedMessage: PropTypes.object,
  userdata: PropTypes.object,
  user: PropTypes.object,
  handleHideModal: PropTypes.func,
  notificationSystem: PropTypes.object,
  createUser: PropTypes.func,
  updateUser: PropTypes.func,
  ivr_access: PropTypes.string,
  createUpdIvr: PropTypes.func,
  vendor_sponsor_id: PropTypes.string,
  vendor_region: PropTypes.array,
  ivrEmailNotify: PropTypes.func,
  manager_emails: PropTypes.array,
  isLinkedUser: PropTypes.bool,
  hasParentIvrAccessInUpdate: PropTypes.bool,
  linkedUserInParent: PropTypes.bool
}
function props(state) {
  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let userInfo = state.getIn(['Users', 'entities', 'users', loginId], Map())
  const UsersList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let submarketList = state.getIn(['Users', 'configData', 'configData'], List())
  let vendorEsso = state.getIn(['Users', "singleProfile", "data"])
  return {
    currentValues: state.getIn(["Forms", formName, "currentValues"], List()),
    isLoading: state.getIn(["Users", 'usercreate', 'isLoading'], false),
    errorsMessage: state.getIn(["Users", 'usercreate', 'errorsMessage'], null),
    ivrErrorMsg: state.getIn(["Users", 'ivrCreateupd', 'errorMessage'], null),
    vendorEsso,
    savedMessage: state.getIn(["VendorDashboard", loginId, formName, "savedMessage"], null),
    loginId,
    userInfo,
    submarketList,
    UsersList
  }
}

export default connect(props, { ...formActions, createUser, updateUser, createUpdIvr, ivrEmailNotify, deleteMsg, getUserInfoLinked, linkUserToCmp, getIvrVendorTech, activeDomains,logActioninDB })(UserForm)