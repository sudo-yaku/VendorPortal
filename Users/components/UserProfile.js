import * as usStateCodes from 'us-state-codes'
import React, { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Loader from '../../Layout/components/Loader'
import { List, Map } from 'immutable'
import * as Actions from "../actions"
import "./style.css"
import PanVZRF from '../../Layout/components/PanVZRF'
import { updateUser } from '../../Users/actions'
import { updateContactDef, createUpdVendorCompany, createUpdIvrUser } from "../../Users/schema"
var NotificationSystem = require('react-notification-system')
import downloadImg from '../../Images/ic_launcher.png'
import NumberFormat from 'react-number-format'
import { NO_PROFILE_PIC } from '../utils'
import config from '../../config'
import enterpin from '../images/enter-pin.svg'
import ResetIVRIcon from '../images/ResetIVRIcon.svg'
import Select from 'react-select'
import SendIVRIcon from '../images/SendIVRIcon.svg'
import Modal from '../../Layout/components/Modal'
import TextField from '@material-ui/core/TextField'
import moment from 'moment'
import ReactTooltip from 'react-tooltip'
import { logActioninDB } from '../../VendorDashboard/actions'
import ajax from '../../ajax'
import { saveFavoriteSubMarket } from '../../Users/schema'

function UserProfile(props) {

  let { user, userList } = props
  let userProfile = userList && userList.toJS() && userList.toJS().length > 0 ? (userList.filter(userlst => userlst.userid == user.toJS().userid)).toJS() : user.toJS()
  const [inValidPhoneNo, setInValidPhoneNo] = useState(false)
  const [phone, setPhone] = useState(userProfile && userProfile.length > 0 ? userProfile[0].phone : null)
  const [userInfo, setUserInfo] = useState(userProfile && userProfile.length > 0 ? userProfile[0] : user.toJS())
  const [showIVRAction, setShowIVRAction] = useState(false)
  const [showRequestPinModal, setShowRequestPinModal] = useState(false)
  const [showConfirmPinModel, setShowConfirmPinModel] = useState(false)
  const [selectedFavoiteSubmarket, setSelectedFavoiteSubmarket] = useState("Select Favourite Market")
  const [updateFavouriteSubmarket, setUpdateFavouriteSubmarket] = useState('')
  const [vendor_region, setVendor_region] = useState('')
  const [showUpdateModel, setShowUpdateModel] = useState(false)
  const [isIVRResetLoading, setIsIVRResetLoading] = useState(false)
  const [validPhoneNo, setValidPhoneNo] = useState(false)
  const [userPhoneNo, setUserPhoneNo] = useState(null)
  const [userPinExpired, setUserPinExpired] = useState(false)
  let _notificationSystem = useRef() 
  useEffect(() => {
    const user = userInfo
    getIvrVendorTech(user)
  }, [])

  useEffect(() => {
    const newUser = user.toJS()
    if (newUser.vendor_id !== userInfo.vendor_id) {
      setShowIVRAction(false)
      setUserInfo({
        ...userInfo,
        vendor_id: newUser.vendor_id
      })
    }
    getIvrVendorTech(newUser)

  }, [])
  const onChangeHandler = (value) => {
    setSelectedFavoiteSubmarket(value)
    // setState({ selectedFavoiteSubmarket: value })
  }
  const hideEditEventModal = () => {
    setSelectedFavoiteSubmarket("Select Favourite Market")
    setShowUpdateModel(false)
  }
  const onClickEdit = () => {
    setShowUpdateModel(true)
  }

  const renderLoading = () => {
    return (<
      Loader color="#cd040b"
      size="50px"
      margin="4px"
      className="text-center" />
    )
  }

  const onDataChange = (e) => {

    if (e.target) {
      if (e.target.name === 'phone') {
        let val = parseInt(e.target.value)
        if (isNaN(val) || val < 0 || e.target.value.length < 10) {
          setInValidPhoneNo(true)
        } else {
          setInValidPhoneNo(false)
        }
        setUserPhoneNo(val)
      }
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const _NotificationSystem = _notificationSystem.current
    if (inValidPhoneNo) {
      return
    }

    let { user } = props
    let { email, fname, lname, title, vendor_role, contact_unid, city, techID, address1, address2, address3, supervisor, zipcode, state, status, country, badge } = user.toJS()
    let values = {
      email,
      fname,
      lname,
      phone: phone,
      title,
      vendor_role,
      contact_unid,
      vendor_id: user.get("vendor_id"),
      state,
      city,
      techID,
      address1,
      address2,
      address3,
      country,
      zipcode,
      supervisor,
      updatedBy: user.get("techID"),
      status,
      badge,
      created_by: user.get("name"),
    }

    props.updateUser(user.get('login_id'), { query: updateContactDef, variables: { VendorInput: values } }, user.toJS()).then(action => {

      if (!action || action && action.type !== "UPDATE_USER_FAILURE") {
        if (action.response && action.response.data && action.response.data.updateContact) {
          _NotificationSystem.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            message: action.response.data.updateContact.message
          })
        } else if (action.response && action.response.data && action.response.errors && action.response.errors.length > 0) {
          _NotificationSystem.addNotification({
            title: 'Error',
            position: "br",
            level: 'error',
            message: action.response.errors[0].data.message
          })
        } else {
          _NotificationSystem.addNotification({
            title: 'Error',
            position: "br",
            level: 'error',
            message: "Somthing went wrong!"
          })
        }
      }
    })

  }

  // downloadAPK() {
  //     var newWindow = window.open()
  //     newWindow.document.write(__html)
  // }

  const sendIVR = () => {
    setShowRequestPinModal(true)
  }

  const resetIVRPin = (ivrData) => {
    const { user, loginId } = props;
    const _NotificationSystem = _notificationSystem.current
    const input = {
      "ivr_profile":
      {
        "ivr_techid": ivrData.ivr_tech_id,
        "pin": ivrData.pin,
        "pin_expired": ivrData.pin_expired,
        "next_pin": ivrData.new_pin,
        "ani": null
      }
    }
    props.updateIVRPin(input).then(response => {
      if (response.type === 'UPDATE_IVRPIN__SUCCESS') {
        props.getCurrentIvrPin("S-iopvp", user && user.get('userid')).then(action => {
          if (action && action.type !== "GET_CURRENT_IVRPIN_FAILURE" &&
            action.response && action.response.data
            && action.response.data.getCurrentPinByUserId && action.response.data.getCurrentPinByUserId.code == 200) {
            setIsIVRResetLoading(false)
            setShowConfirmPinModel(false)
            _NotificationSystem.addNotification({
              title: 'Success',
              position: "br",
              level: 'success',
              message: "IVR PIN has been successfully Sent to your mobile"
            })
            props.getUserIVRDetails(loginId)

          } else {
            setIsIVRResetLoading(false)
            setShowConfirmPinModel(false)
            _NotificationSystem.addNotification({
              title: 'error',
              position: "br",
              level: 'error',
              message: "Sorry unable to retieve the PIN!"
            })
          }
        })
        logActioninDB(loginId, user && user.get('email'), user && user.get('vendor_id'), null, user && user.get('vendor_area'), user && user.get('vendor_region'), "Reset IVR PIN Successful",'','','');
      }
    })
  }

  const requestPinModal = () => {
    return (
      <Modal title="Request IVR PIN" handleHideModal={() => hidePinModal()} style={{
        width: "67%", top: '10%', display: "block",
      }}>
        <div className="row margin-top-bottom-10" style={{ width: "100%" }}>
          <div className="col-12">
            <div style={{ width: "100%", padding: "10px 0 10px 2rem", display: "flex", flexWrap: "wrap" }}>
              <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ float: 'left' }}>Would you like to retreive IVR PIN?</h5></label>
            </div>
            <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button"
                className="Button--secondary u-floatLeft" onClick={() => showConfirmModel()}
                style={{ marginRight: "5px" }}>
                YES
              </button>
              <button type="button"
                className="Button--secondary u-floatRight" onClick={() => hidePinModal()}
                style={{ marginRight: "5px" }}>
                NO
              </button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  const hidePinModal = () => {
    setShowRequestPinModal(false)
    setValidPhoneNo(true)
  }

  const showConfirmModel = () => {
    setUserPhoneNo(userInfo.phone ? parseInt(userInfo.phone, 10) : null)
    setShowRequestPinModal(false)
    setShowConfirmPinModel(true)
  }

  const requestConfirmModal = () => {
    return (
      // add loader
      <Modal title="Confirm your Contact Information" handleHideModal={() => hideConfirmModel()} style={{ width: "80%", maxwidth: "97%", top: '10%', display: "block", }}>
        {activePinRetrievel()}
      </Modal>
    )
  }

  const hideConfirmModel = () => {
    setShowConfirmPinModel(false)
    setUserPhoneNo(null)
    setValidPhoneNo(true)
  }

  const activePinRetrievel = () => {
    return (
      <div className="row margin-top-bottom-10" style={{
        width: "100%"
      }}>
        <div className="col-12">
          <div style={{ width: "100%", padding: "5px 0 10px 2.5rem", display: "flex", flexWrap: "wrap" }}>

            {userPinExpired ?
              <p style={{ float: 'left', color: "black", fontSize: "1.15em" }}>Your IVR PIN has expired. The Old PIN will be texted to your contact number.
                Once you receive your old PIN, please call 888-611-0029 to update your PIN. Please stay on the phone until you are promoted with the new PIN.
                You will need to write down the new PIN at the end of the call.</p>
              : null}
          </div>

          <label style={{ color: "black", fontSize: "1.15em" }}><h5 style={{ float: 'left', marginLeft: '24px' }}>Please confirm your contact number. It will be used to text you the IVR PIN.</h5></label>
        </div>
        {isIVRResetLoading ? renderLoading() : (<div className="col-12" style={{ marginLeft: '24px' }}>
          <TextField
            label="Phone No"
            floatingLabelFixed={true}
            type="number"
            name="phone"
            error={!validPhoneNo}
            helperText={validPhoneNo ? null : "Please enter valid 10 digit phone number without dashs and dot"}
            value={userPhoneNo} 
            onChange={(e) => onDataChange(e)}
            className="required"
            inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
            fullWidth={false} 
            autoFocus={true} 
            maxLength="10" 
            onKeyPress={(e) => handleKeyPress(e)}
          >

          </TextField>
          <button type="button"
            className="Button--secondary u-floatRight" 
            onClick={() => submitPinRequest()}
            disabled={!validPhoneNo}
            style={{ marginRight: "5px", marginTop: "20px" }}>
            Confirm
          </button>
        </div>)}
      </div>
    )
  }

  const selectSubMarketOptions = () => {
    let { user } = props
    let group_vendors = user.get('group_vendors')
    let vendor_data = group_vendors ? group_vendors.toJS() : null
    let group_regions = []
    if (vendor_data && vendor_data.length > 0) {
      for (let i = 0; i < vendor_data.length; i++) {
        if(vendor_data[i].is_vendor_disabled == 'N') {
          group_regions.push(vendor_data[i].vendor_region + '-' + vendor_data[i].vendor_id)
        }
      }
    }
    let vendor_regions = [...new Set(group_regions)];
    let subMarketsData = vendor_regions.map(region => ({ value: region, label: region }))
    return subMarketsData;
  }

  const saveFavouriteSubMarket = () => {
    const _NotificationSystem = _notificationSystem.current
    const input = {
      "subMarketInfo": {
        "FAVORITE_SUBMARKET": selectedFavoiteSubmarket,
        "LAST_ACCESSED_SUBMARKET": props.user && props.user.toJS().lastAccessedSubMarket ? props.user.toJS().lastAccessedSubMarket : '',
        "OPSTRACKER_USERID": props.loginId
      }
    }
    ajax.post(`/graphql4g`, { query: saveFavoriteSubMarket, variables: { input } }).then(res => {
      if (res && res.data && res.data.data && res.data.data.saveFavoriteSubMarket && res.data.data.saveFavoriteSubMarket.saveFavoriteSubMarket === "Sub Market updated successfully") {
        setUpdateFavouriteSubmarket(selectedFavoiteSubmarket)
        _NotificationSystem.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: res.data.data.saveFavoriteSubMarket.saveFavoriteSubMarket
        })
        setTimeout(() => { location.reload(true) }, 4000)
        hideEditEventModal();
      }
      else {
        _NotificationSystem.addNotification({
          title: 'Error',
          position: "br",
          level: 'error',
          message: "Somthing went wrong!"
        })
      }
    }
    )
  }

  const renderUpdateUserModel = () => {
    return (
      <div>
        <Modal large title="Choose Your Favourite Market" handleHideModal={() => hideEditEventModal()}
          style={{ maxWidth: "40%", display: "block", marginTop: "80px" }}>
          <div style={{ paddingTop: '10px', paddingBottom: "10px" }}>
            <h6>To edit access location use the dropdown below</h6>
          </div>
          <Select
            className="title-div-style select-size"
            id="drop_Down_Menu_CD"
            value={{ value: selectedFavoiteSubmarket, label: selectedFavoiteSubmarket }}
            onChange={(e) => onChangeHandler(e.value)}
            options={selectSubMarketOptions()}
            required
            clearable={false}
          />
          <button style={{ paddingRight: '2rem', paddingLeft: '2rem' }} className="Button--secondary u-floatRight" disabled={selectedFavoiteSubmarket && selectedFavoiteSubmarket.length > 0 && selectedFavoiteSubmarket === "Select Favourite Market"} onClick={() => saveFavouriteSubMarket()}>Save</button>

        </Modal></div>)
  }

  const renderSmallLoader = () => <Loader color="#cd040b" size="40px" margin="4px" className="text-left" />


  // const onDataChange = (e) => {
  //   if (e.target) {
  //     if (e.target.name === 'phone') {
  //       let val = parseInt(e.target.value, 10)
  //       setState({ userPhoneNo: e.target.value })
  //       if (isNaN(val) || val < 0 || e.target.value.length < 10) {
  //         setState({ validPhoneNo: false })
  //       } else {
  //         setState({ validPhoneNo: true })
  //       }
  //     }
  //   }
  // }

  const handleKeyPress = (e) => {
    if (e.target.value.length > 9) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const submitPinRequest = () => {
    let { user } = props
    const _NotificationSystem = _notificationSystem.current
    setIsIVRResetLoading(true)

    if (userInfo.phone && userPhoneNo && parseInt(userInfo.phone, 10) != userPhoneNo) {
      let values = { phone: userPhoneNo, contact_unid: userInfo.contact_unid, vendor_id: userInfo.vendor_id, created_by: userInfo.name }
      let ivrUpdUser = {
        phone: userPhoneNo, vendorId: userInfo.vendor_id, login: "S-iopvp", accountLocked: false, userId: userInfo.userid,
        email: userInfo.email, userLastName: userInfo.lname, userFirstName: userInfo.fname, sponsor: userInfo.vendor_sponsor_id, subMarketList: vendor_region
      }
      props.updateUser(user.get("login_id"), { query: updateContactDef, variables: { VendorInput: values } }).then(action => {
        if ((!action || action && action.type !== "UPDATE_USER_FAILURE") &&
          action.response && action.response.data && action.response.data.updateContact &&
          action.response.data.updateContact.data && action.response.data.updateContact.data.phone && action.response.data.updateContact.data.phone == (userPhoneNo + '')) {

          props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUpdUser } }).then(action => {
            if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
              && action.techId.data.createUpdIvrUser.techId != null) {

              props.getCurrentIvrPin("S-iopvp", userInfo.userid).then(action => {
                if (action && action.type !== "GET_CURRENT_IVRPIN_FAILURE" &&
                  action.response && action.response.data
                  && action.response.data.getCurrentPinByUserId && action.response.data.getCurrentPinByUserId.code == 200) {
                  setIsIVRResetLoading(false)
                  setShowConfirmPinModel(false)
                  _NotificationSystem.addNotification({
                    title: 'Success',
                    position: "br",
                    level: 'success',
                    message: "IVR PIN has been successfully Sent to your mobile"
                  })
                } else {
                  setIsIVRResetLoading(false)
                  setShowConfirmPinModel(false)
                  _NotificationSystem.addNotification({
                    title: 'error',
                    position: "br",
                    level: 'error',
                    message: "Sorry unable to retieve the PIN!"
                  })
                }
              })
            } else {
              setIsIVRResetLoading(false)
              setShowConfirmPinModel(false)
              _NotificationSystem.addNotification({
                title: 'Error',
                position: "br",
                level: 'error',
                message: action.techId.data.createUpdIvrUser.message
              })
            }

          })
        } else {
          setIsIVRResetLoading(false)
          setShowConfirmPinModel(false)
          _NotificationSystem.addNotification({
            title: 'Error',
            position: "br",
            level: 'error',
            message: action.response.errors[0].data.message
          })
        }
      })
    } else if (userInfo.phone && userPhoneNo && parseInt(userInfo.phone, 10) == userPhoneNo) {
      props.getCurrentIvrPin("S-iopvp", userInfo.userid).then(action => {
        if (action && action.type !== "GET_CURRENT_IVRPIN_FAILURE" &&
          action.response && action.response.data
          && action.response.data.getCurrentPinByUserId && action.response.data.getCurrentPinByUserId.code == 200) {
          setIsIVRResetLoading(false)
          setShowConfirmPinModel(false)
          _NotificationSystem.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            message: "IVR PIN has been successfully Sent to your mobile"
          })
        } else {
          setIsIVRResetLoading(false)
          setShowConfirmPinModel(false)
          _NotificationSystem.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: "Sorry unable to retieve the PIN!"
          })
        }
      })
    }
  }
  const getIvrVendorTech = (user) => {
    const { getIvrVendorTech, createUpdVendorTechCompany } = props
    getIvrVendorTech("S-iopvp", user.vendor_id).then((action) => {
      if (action.type === 'GET_IVR_VENDOR_TECH_LIST_SUCCESS') {
        if (action.response.data.getVendorTechForVendorId && action.response.data.getVendorTechForVendorId.data.length > 0) {
          for (let i = 0; i < action.response.data.getVendorTechForVendorId.data.length; i++) {
            const vendor = action.response.data.getVendorTechForVendorId.data[i]
            if (vendor.USERID === user.userid && vendor.ACCTLOCKEDIND === 0) {
              setShowIVRAction(true)
              setUserPinExpired(!(vendor.PIN_EXPIRED && vendor.PIN_EXPIRED.toLowerCase() === "false"))
              break
            }
          }
        } else if (action.response.data.getVendorTechForVendorId && action.response.data.getVendorTechForVendorId.code == 404) {
          let values = {
            companyName: user.vendor_name,
            vendorId: user.vendor_id,
            login: "S-iopvp"
          }
          createUpdVendorTechCompany("S-iopvp", { query: createUpdVendorCompany, variables: { vendor_comp_input: values } })
        }
      }
    })
    let group_region = []
    if (user.group_vendors && user.group_vendors.length > 0) {
      for (let i = 0; i < user.group_vendors.length; i++) {
        group_region.push(user.group_vendors[i].vendor_region)
      }
      setVendor_region(group_region)
    }
  }
  let defaultVendor = props.initUser ? props.initUser.toJS() : ''
  let userProfil = (userList.filter(userlst => userlst.userid == user.toJS().userid).toJS())
  return (
    <div className="container" >
      <style>
        {`
                    input[type=number]::-webkit-inner-spin-button, 
                    input[type=number]::-webkit-outer-spin-button { 
                      -webkit-appearance: none; 
                      margin: 0; 
                    }.modal-body {
                      padding-bottom: 40px;
                    }`}
      </style>
      {showRequestPinModal ? requestPinModal() : null}
      {showConfirmPinModel ? requestConfirmModal() : null}
      {showUpdateModel ? renderUpdateUserModel() : null}

      <NotificationSystem ref={_notificationSystem} />


      {/* {config.enableDownload ? (<div className="col-md-12" style={{ marginLeft: '18%', paddingTop: '5%' }}>
                        <a className="link" href="https://opsportal.verizonwireless.com/vpm/download/VPM_PROD.apk" target="_blank" download>
                            <button type="submit" className="Button--secondary">Download Files</button>
                        </a>
                    </div>) : null}*/}

      <div className="col-md-6 float-left" style={{ "paddingTop": "50px" }}>
        <PanVZRF title="Profile" >
          {props.ivr_Details && props.ivr_Details.toJS().length > 0 && props.ivr_Details.toJS()[0].pin_expired === 'yes' &&
            <div className="Form-group width100">
              <div className="Alert" style={{ 'margin-bottom': '10px', background: "#FDBD3D", 'margin-top': '10px' }}>
                <i className="fa fa-info-circle"></i>
                Your IVR PIN is expired. Please use the Reset IVR PIN action below.
              </div>
            </div>}
          <form onSubmit={(e) => onSubmit(e)}>
            <div className="table-responsive">
              <table className="table  sortable  text-center site-table" style={{ minHeight: "288px", "background": "#FFF" }}>
                <tbody className="vzwtable text-left">
                  <tr>
                    <td className="Form-group" width="30%"><label style={{ fontSize: '12.5px' }} className="Form-label">Name</label></td>
                    <td className="Form-group" width="70%">{userInfo.name}</td>
                  </tr>
                  <tr>
                    <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">Title</label></td>
                    <td className="Form-group">{userInfo.title}</td>
                  </tr>
                  <tr>
                    <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">Email</label></td>
                    <td className="Form-group">{userInfo.email ? userInfo.email : ''}</td>
                  </tr>
                  <tr>
                    <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">phone</label></td>

                    {/* <td className="Form-group">
                                                <div className="col-md-6 float-left Form-group no-padding">
                                                    <input type="number" name="phone" className="Form-input" value={phone} onChange={onDataChange} onKeyPress={handleKeyPress} required />
                                                    {!inValidPhoneNo ? null : <span style={{ color: 'red' }}>Please enter valid 10 digit phone number without dashs and dot</span>}
                                                </div>
                                                <div className="col-md-4 float-right Form-group">
                                                    {props.isLoading ? renderLoading() : <button type="submit" className="Button--secondary u-floatRight">Update</button>}
                                                </div>
                                            </td>*/}
                    <td className="Form-group"><NumberFormat format="(###) ###-####" displayType="text" value={userInfo.phone} /></td>
                  </tr>
                  <tr>
                    <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">Role</label></td>
                    <td className="Form-group">{userInfo.vendor_role}</td>
                  </tr>
                  <tr>
                    <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">Address</label></td>
                    <td className="Form-group">{userInfo.vendor_address}</td>
                  </tr>
                  <tr>
                    <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">City</label></td>
                    <td className="Form-group">{userInfo.vendor_city}</td>
                  </tr>
                  <tr>
                    <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">State</label></td>
                    <td className="Form-group">{userInfo.vendor_state} - {userInfo.vendor_zip}</td>
                  </tr>

                  <tr>
                    <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">Action</label></td>
                    <td className="Form-group">
                      {showIVRAction && props.ivr_Details && props.ivr_Details.toJS().length > 0 && props.ivr_Details.toJS()[0].pin_expired.toLowerCase() === 'no' ?
                        <div>
                          <img src={SendIVRIcon}
                            style={{ 'height': '21px', 'verticalAlign': 'baseline', 'marginRight': '15px' }}
                            onClick={() => sendIVR()}
                            data-tip
                            data-for="sendIvr">
                          </img>
                          <ReactTooltip id="sendIvr" place="top" effect="float">
                            <span>Retreive IVR PIN</span>
                          </ReactTooltip>
                        </div> : null

                      }
                      {props.resetPinisLoading && renderSmallLoader()}
                      {props.ivr_Details && props.ivr_Details.toJS().length > 0 && props.ivr_Details.toJS()[0].pin_expired.toLowerCase() === 'yes' ?
                        <div>
                          <img src={ResetIVRIcon}
                            style={{ 'height': '21px', 'verticalAlign': 'baseline', 'marginRight': '15px' }}
                            onClick={() => resetIVRPin(props.ivr_Details.toJS()[0])}
                            data-tip
                            data-for="resetIvr">
                          </img>
                          <ReactTooltip id="resetIvr" place="top" effect="float">
                            <span>Reset IVR PIN</span>
                          </ReactTooltip>
                        </div> : null
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </PanVZRF>
      </div>
      <div className="col-md-6 float-left" style={{ "paddingTop": "50px" }}>
        <PanVZRF title="User Market Information">
          <div className="table-responsive">
            <table className="table  sortable  text-center site-table" style={{ minHeight: "25px", "background": "#FFF" }}>
              <tbody className="vzwtable text-left">
                <tr>
                  <td className="Form-group" width="50%"><label style={{ fontSize: '12.5px' }} className="Form-label">Home Market</label></td>
                  {/* <td className="Form-group" width="50%">{defaultVendor && defaultVendor.vendor_region}</td> */}
                  <td className="Form-group" width="50%">{`${user.toJS().default_vendor_region}-${user.toJS().default_vendor_id}`}</td>
                </tr>
                <tr>
                  <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">Favorite Market</label></td>
                  <td className="Form-group">{updateFavouriteSubmarket ? updateFavouriteSubmarket : user && user.toJS().favoriteSubMarket} &nbsp;
                    <a onClick={() => onClickEdit()}>
                      <i title='Edit User' className="fas fa-pencil-alt" style={{ color: "rgb(255, 167, 38)", fontSize: "18px", cursor: "pointer", marginRight: "15px" }}></i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">Last Accessed Market</label></td>
                  <td className="Form-group"> {user && user.toJS().lastAccessedSubMarket}</td>
                </tr>
                <tr>
                  <td className="Form-group"><label style={{ fontSize: '12.5px' }} className="Form-label">Last Accessed Date/Time</label></td>
                  <td className="Form-group">{moment(user && user.toJS().lastAccessedDate).format('MM-DD-YYYY HH:MM')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </PanVZRF>
      </div>
    </div>
  )



}
function props(state) {

  let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
  const initUser = state.getIn(['Users', 'entities', 'users', 'initial'], Map())
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let isLoading = state.getIn(["Users", 'usercreate', 'isLoading'], false)
  let userList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let apkVersion = state.getIn(['Users', 'entities', 'features', loginId], Map())
  const ivr_Details = state.getIn(['Users', 'ivr_Details'], Map())
  const resetPinisLoading = state.getIn(['Users', 'resetPinisLoading'], false)

  return {
    loginId,
    apkVersion,
    user,
    isLoading,
    userList,
    ivr_Details,
    resetPinisLoading,
    initUser
  }
}

export default connect(props, { updateUser, ...Actions })(UserProfile)
