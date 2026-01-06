import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { get, size } from 'lodash'
import Loader from '../../Layout/components/Loader'
import {
  resendUserActivationInvite, issoResetAccountReq, activeDomains, getVendorList, getIvrDetailsForVendor, unlinkUserFromVendorId, deleteUser, getIvrVendorTech, deleteIvrUser, getManagerInfoSubmarket, createUpdVendorTechCompany, assignVendorTech, updateUser, createUpdIvr, getCurrentIvrPin,
  getUserInfoLinked
} from '../actions'
import { createUpdVendorCompany, updateMultipleMarketIvr, updateContactDef, createUpdIvrUser, resendUserActivationInviteDef, getUserInfoLinkedDef, issoResetAccount, postUserRecertifySchema, deleteBulkUserSchema } from '../../Users/schema'
import UserForm from './UserForm'
import TextField from '@material-ui/core/TextField'
import { settingsForUser, user } from '../selectors'
import ReactTable from "react-table"
import "react-table/react-table.css"
import Modal from '../../Layout/components/Modal'
var NotificationSystem = require('react-notification-system')
import * as formActions from "../../Forms/actions"
import config from "../../config"
import { fetchBuyerListDetails } from "../../PreventiveMaintenance/actions"
import { getVendorListDef, deleteContactDef } from '../../Users/schema'
import emailImage from '../../Users/images/send-notification.svg'
import resetAccountIcon from '../images/account-reset.svg'
import withUserHOC from '../../withUserHOC'
import ajax from '../../ajax'
import { countVPAutomation } from '../../Users/schema'
import excel from '../../Excel/images/Excel.svg'
import * as XLSX from 'xlsx-js-style';
import moment from 'moment'
import store from '../../store'
function Users(props) {
  const formName = "UserForm"
  const [showCreateModel, setShowCreateModel] = useState(false)
  const [showRequestPinModal, setShowRequestPinModal] = useState(false)
  const [showEnableIVRModal, setShowEnableIVRModal] = useState(false)
  const [linkedDetail, setLinkedDetail] = useState({})
  const [showConfirmPinModel, setShowConfirmPinModel] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showResetAccountModal, setShowResetAccountModal] = useState(false)
  const [isIssoReg, setIsIssoReg] = useState(false)
  const [isIssoReset, setIsIssoReset] = useState(false)
  const [currentEventObj, setCurrentEventObj] = useState(null)
  const [modelTitle, setModelTitle] = useState("Create User")
  const [buttonText, setButtonText] = useState("Submit")
  const [userdata, setUserdata] = useState({})
  const [ivrTechdata, setIvrTechdata] = useState({})
  const [companyInfo, setCompanyInfo] = useState({})
  const [ivr_access, setIvr_access] = useState("No Access")
  const [vendor_sponsor_id, setVendor_sponsor_id] = useState('')
  const [vendor_region, setVendor_region] = useState('')
  const [vendor_area, setVendor_area] = useState('')
  const [manager_emails, setManager_emails] = useState([])
  const [userPhoneNo, setUserPhoneNo] = useState(null)
  const [is_Vp_Enabled, setIs_Vp_Enabled] = useState(false)
  const [validPhoneNo, setValidPhoneNo] = useState(true)
  const [isIVRResetLoading, setIsIVRResetLoading] = useState(false)
  const [isEnableIVRLoading, setIsIVREnableLoading]= useState(false)
  const [vendorAdminName, setVendorAdminName] = useState('')
  const [vendorAdminPhone, setVendorAdminPhone] = useState('')
  const [userReg, setUserReg] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [isIssoResetLoading, setIsIssoResetLoading] = useState(false)
  const [showUnlinkUserModal, setShowUnlinkUserModal] = useState(false)
  const [unlinkVendorMessage, setUnlinkVendorMessage] = useState(null)
  const [linkedUserId, setLinkedUserId] = useState(null)
  const [linkedOpstrackerId, setLinkedOpstrackerId] = useState(null)
  const [isUnlinkUserLoading, setIsUnlinkUserLoading] = useState(false)
  const [hasParentIvrAccessInUpdate, setHasParentIvrAccessInUpdate] = useState(false)
  const [activeDomain, setActiveDomain] = useState([])
  const [isLinkedUser, setIsLinkedUser] = useState(false)
  const [linkedVendorId, setLinkedVendorId] = useState(null)
  const [linkedUserInParent, setLinkedUserInParent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [errorExits, setErrorExits] = useState(false)
  const [linkedUserDetail, setLinkedUserDetail] = useState({})
  const [searchMatched, setSearchMatched] = useState(false)
  const [data, setData] = useState((props.UsersList && props.UsersList.toJS() && (props.UsersList.toJS().length > 0)) ? props.UsersList.toJS() : [])
  const [isRecertifyLoading, setIsRecertifyLoading] = useState(false)
  const [showRecertifyModal, setShowRecertifyModal] = useState(false)
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [isBulkDeleteLoading, setIsBulkDeleteLoading] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  let _notificationSystem = useRef()
  const search = useRef("search")
  useEffect(() => {
    let vendor_id = props.user.get("vendor_id");
    ajax.post(`/graphql4g`, { query: countVPAutomation, variables: { vendor_id }, }).then((res) => {
      if (res?.data?.data?.getCountforVPAutomation?.VPAutomationCount[0].COUNT > 0) {
        setIs_Vp_Enabled(true)
      }
    });
    onUserLoad()
    setHasParentIvrAccessInUpdate(false)
  }, [])

  useEffect(() => {
    setCompanyInfo({})
    onUserLoad()
  }, [props.user.get("vendor_id")])
  // componentDidMount() {
  //   let vendor_id=props.user.get("vendor_id");
  //   ajax.post(`/graphql4g`, { query: countVPAutomation, variables: {vendor_id},}).then((res)=>{
  //     if(res?.data?.data?.getCountforVPAutomation?.VPAutomationCount[0].COUNT>0){
  //       this.setState({is_Vp_Enabled:true});        
  //     }
  //   });
  //   this.onUserLoad()
  //   this.setState({ hasParentIvrAccessInUpdate: false })
  // }
  // componentDidUpdate(prevProps) {
  //   let prev_user = props.user
  //   let new_user = prevProps.user
  //   if (prev_user.get("vendor_id") != new_user.get("vendor_id")) {
  //     this.setState({ companyInfo: {} })
  //     this.onUserLoad()
  //   }
  // }


  const onUserLoad = async () => {
    let { user, getIvrVendorTech, getManagerInfoSubmarket, UsersList, createUpdVendorTechCompany, assignVendorTech, fetchBuyerListDetails } = props
    setUserReg(user.get('vendor_region'))
    let data = (UsersList && UsersList.toJS() && (UsersList.toJS().length > 0)) ? UsersList.toJS() : []
    props.getVendorList(user.get("email"), { query: getVendorListDef, variables: { vendor_id: user.get("vendor_id") } })
    
    tableSearch()
    getIvrVendorTech("S-iopvp", user.get("vendor_id")).then((action) => {
      if (action.type === 'GET_IVR_VENDOR_TECH_LIST_SUCCESS') {
        if (action.response.data.getVendorTechForVendorId && action.response.data.getVendorTechForVendorId.data.length > 0) {
          let ivrData = [];
          for (let i = 0; i < action.response.data.getVendorTechForVendorId.data.length; i++) {
            ivrData.push(action.response.data.getVendorTechForVendorId.data[i])
          }
          setIvrTechdata(ivrData)
        } else if (action.response.data.getVendorTechForVendorId && action.response.data.getVendorTechForVendorId.code == 404) {
          let values = {
            companyName: user.get("vendor_name"),
            vendorId: user.get("vendor_id"),
            login: "S-iopvp"
          }
          createUpdVendorTechCompany("S-iopvp", { query: createUpdVendorCompany, variables: { vendor_comp_input: values } }).then((action) => {
            setCompanyInfo(action.response)
          })
        }
        tableSearch()
      }
    })

    if (data && data.length > 0) {
      fetchBuyerListDetails(user.get("vendor_id"), user.get("login_id"), user.get("vendor_area"), user.get("vendor_region")).then((action) => {
        if (action.type === 'FETCH_BUYERLISTDETAILS_SUCCESS') {
          let emails = []
          if (action.buyerListDetails && action.buyerListDetails.getBuyerList && action.buyerListDetails.getBuyerList.fieldsList &&
            action.buyerListDetails.getBuyerList.fieldsList.
              feandmgrs.length > 0) {
            for (let ind = 0; ind < action.buyerListDetails.getBuyerList.fieldsList.
              feandmgrs.length;) {
              if (action.buyerListDetails.getBuyerList.fieldsList.
                feandmgrs[ind].title
                && action.buyerListDetails.getBuyerList.fieldsList.
                  feandmgrs[ind].title == "Sr Mgr-Ntwk Operations" && (!!action.buyerListDetails.getBuyerList.fieldsList.
                    feandmgrs[ind].fname || !!action.buyerListDetails.getBuyerList.fieldsList.
                      feandmgrs[ind].lname) && !!action.buyerListDetails.getBuyerList.fieldsList.
                        feandmgrs[ind].contact) {
                setVendorAdminName(action.buyerListDetails.getBuyerList.fieldsList.feandmgrs[ind].fname + ' ' + action.buyerListDetails.getBuyerList.fieldsList.feandmgrs[ind].lname)
                setVendorAdminPhone(action.buyerListDetails.getBuyerList.fieldsList.
                  feandmgrs[ind].contact)
                break;
              } else ind++
            }
            for (let i = 0; i < action.buyerListDetails.getBuyerList.fieldsList.
              feandmgrs.length; i++) {
              if (action.buyerListDetails.getBuyerList.fieldsList.
                feandmgrs[i].title
                && action.buyerListDetails.getBuyerList.fieldsList.
                  feandmgrs[i].title == "Sr Mgr-Ntwk Operations" && !!action.buyerListDetails.getBuyerList.fieldsList.
                    feandmgrs[i].email) {
                emails.push(action.buyerListDetails.getBuyerList.fieldsList.
                  feandmgrs[i].email)
              }
            }
          }
          setManager_emails(emails)
        }
      })
    }

    let group_vendors = user.get('group_vendors')
    let vendor_data = group_vendors ? group_vendors.toJS() : null
    let group_region = []
    let group_area = []
    if (vendor_data && vendor_data.length > 0) {
      for (let i = 0; i < vendor_data.length; i++) {
        group_region.push(vendor_data[i].vendor_region)
      }
      for (let i = 0; i < vendor_data.length; i++) {
        group_area.push(vendor_data[i].vendor_area)
      }
      setVendor_region(group_region)
      setVendor_area(group_area)
    }

    if (group_region && group_region.length > 0 && config.assignMultiMarket) {
      let assignTech = {
        vendorId: user.get("vendor_id"),
        login: "S-iopvp",
        submarkets: group_region
      }

      assignVendorTech("S-iopvp", { query: updateMultipleMarketIvr, variables: { ivr_request_mulMarket: assignTech } });
    }

  }

  const renderLoading = () => {
    return (<
      Loader color="#cd040b"
      size="50px"
      margin="4px"
      className="text-center" style={{ "paddingTop": "50px" }} />
    )
  }
  useEffect(() => {
    if (isUnlinkUserLoading == true) {
      setUnlinkVendorMessage("Please wait, unlinking the user")
    }
  }, [isUnlinkUserLoading])

  const renderUnlinkModal = () => {
    let message = null;
    // if (isUnlinkUserLoading) {
    //   setUnlinkVendorMessage("Please wait, unlinking the user")
    // }

    return (
      <Modal title="Unlink User" handleHideModal={() => {
        setShowUnlinkUserModal(false)
        setSearchVal("")
      }}
        style={{ display: "flex", width: "52%", maxWidth: "97%", top: '20%' }}>
        <div className="row margin-top-bottom-10" style={{ width: "100%" }}>
          <div className="col-12">
            <div style={{ width: "100%", padding: "10px 0 10px 2rem", display: "flex", flexWrap: "wrap" }}>
              <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ float: 'left' }}>{unlinkVendorMessage}</h5></label>
            </div>
            <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button"
                className="Button--secondary u-floatLeft" disabled={isUnlinkUserLoading} onClick={() => unlinkUser()}
                style={{ marginRight: "5px" }}>
                YES
              </button>
              <button type="button"
                className="Button--secondary u-floatRight" onClick={() => { setShowUnlinkUserModal(false) }}
                style={{ marginRight: "5px" }}>
                NO
              </button>
            </div>
          </div>
        </div>
      </Modal>)
  }


  const renderUnlink = (row) => {
    const { user } = props
    const linkedUsersForVendor = store.getState().getIn(['Users', 'getVendorUserAuthForVendorId', 'data']);
    let linkedUserId = null;
    let linkedParentVendorId = null;
    let linkedVendorId = null;
    let opstrackerId = null;
    let ivrStatus = null;
    let linkedParentVendorName = null;
    let linkedParentRegion = null;
    let linkedRegion = null;
    if (linkedUsersForVendor) {
      opstrackerId = row.original.userid;
      const users = linkedUsersForVendor.users;
      for (let linkedUser of users) {
        let opstrackerUserId = linkedUser.OPSTRACKER_USERID;
        if (opstrackerUserId === opstrackerId) {
          linkedUserId = linkedUser.LINKED_USER_ID;
          linkedParentVendorId = parseInt(linkedUser.VENDOR_ID);
          linkedVendorId = parseInt(linkedUser.LINKED_VENDOR_ID);
          opstrackerId = linkedUser.OPSTRACKER_USERID;
          ivrStatus = linkedUser.IVR_ACTIVE;
          break;
        }
      }
      const companies = linkedUsersForVendor.companies;
      for (let company of companies) {
        if (linkedParentVendorId === company.VENDOR_ID) {
          linkedParentVendorName = company.VENDOR_NAME;
          linkedParentRegion = company.VENDOR_REGION
          break;
        }
      }

    }

    if (linkedUserId && user.get('vendor_role') == 'PORTALADMIN' && linkedUsersForVendor
      && linkedUsersForVendor.companies) {

      const companies = linkedUsersForVendor.companies;
      let linkedVendorName = null;
      for (let company of companies) {
        if (company.VENDOR_ID === linkedVendorId) {
          linkedVendorName = company.VENDOR_NAME;
          linkedRegion = company.VENDOR_REGION
          break;
        }
      }

      let loggedInVendorId = user.get('vendor_id');
      let vendorMessage = "Do you want to unlink the user from " + linkedVendorName + " ?";
      /*  if(loggedInVendorId === linkedParentVendorId){
          vendorMessage = "Do you want to unlink from company "+linkedVendorName;
        } else {
          vendorMessage = "Do you want to unlink from parent company "+linkedParentVendorName;
        }*/
      return {
        "linkedUserId": linkedUserId,
        "unlinkVendorMessage": vendorMessage,
        "opstrackerId": opstrackerId,
        "linkedParentVendorId": linkedParentVendorId,
        "ivrStatus": ivrStatus,
        "linkedVendorName": linkedVendorName,
        "linkedParentVendorName": linkedParentVendorName,
        "loggedInVendorId": loggedInVendorId,
        "linkedVendorId": linkedVendorId,
        "linkedParentRegion": linkedParentRegion,
        "linkedRegion": linkedRegion
      }
    } else {
      return null;
    }

  }


  const unlinkUser = async () => {
    const _NotificationSystem = _notificationSystem.current
    const { user } = props
    let loginId = user.get('name');
    // let self = this;
    //setIsUnlinkUserLoading(true)
    //this.setState({ isUnlinkUserLoading: true });
    // let selfNoficationSystem = useRef(notificationSystem2)


    props.unlinkUserFromVendorId(loginId, linkedUserId).then(async action => {
      if (action && action.type === "UNLINK_USER_FROM_VENDOR_ID_SUCCESS") {
        setIsUnlinkUserLoading(true)
        props.getIvrDetailsForVendor("S-iopvp", linkedVendorId).then((actions) => {
          if (actions && actions.type === 'GET_IVR_VENDOR_TECH_LIST_SUCCESS') {
            if (actions && actions.response && actions.response.data && actions.response.data.getVendorTechForVendorId &&
              actions.response.data.getVendorTechForVendorId.data) {
              let ivrList = actions.response.data.getVendorTechForVendorId.data;
              let isIvrExistsForUser = null;
              if (actions.response.data.getVendorTechForVendorId.data.length > 0) {
                for (let ivrData of ivrList) {
                  if (ivrData.USERID === linkedOpstrackerId) {
                    isIvrExistsForUser = true;
                    break;
                  }
                }
              }

              if (isIvrExistsForUser) {
                let userData = data.find(e => e.userid == linkedOpstrackerId)

                let regions = []

                props.getUserInfoLinked(props.user.get("login_id"), { query: getUserInfoLinkedDef, variables: { vendorEmail: userData.email } }).then(inAction => {

                  if (inAction && inAction.response && inAction.response.data && inAction.response.data.getUserInfoLinked && inAction.response.data.getUserInfoLinked.userinfo) {
                    let linked_region = inAction.response.data.getUserInfoLinked.userinfo.VENDOR_REGION;

                    regions.push(linked_region)
                    let ivrUser = {
                      sponsor: userData.vendor_sponsor_id,
                      phone: userData.phone,
                      subMarketList: regions,
                      userLastName: userData.lname,
                      vendorId: userData.vendor_id,
                      userFirstName: userData.fname,
                      accountLocked: false,
                      email: userData.email,
                      login: "S-iopvp",
                      userId: linkedOpstrackerId,
                      managerName: vendorAdminName,
                      managerPhone: vendorAdminPhone
                    }
                    props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUser } }).then(action => {
                      if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
                        && action.techId.data.createUpdIvrUser.techId != null) {
                        _NotificationSystem.addNotification({
                          title: 'Success',
                          position: "br",
                          level: 'success',
                          message: "User has been unlinked and Updated the IVR successfully",
                          autoDismiss: 2,
                          onRemove: () => {
                            setIsUnlinkUserLoading(false)
                            setShowUnlinkUserModal(false)
                            onUserLoad();
                          }

                        })
                        props.ivrEmailNotify(user.get("login_id"), { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } }).then(action => {
                          if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
                            _NotificationSystem.addNotification({
                              title: 'Success',
                              position: "br",
                              level: 'success',
                              message: action.response.data.ivrEmailNotification.message,
                              autoDismiss: 10
                            })
                          }
                        })
                      } else if (action.techId && action.techId.data && action.techId.data.createUpdIvrUser.techId == null) {
                        _NotificationSystem.addNotification({
                          title: 'Error',
                          position: "br",
                          level: 'error',
                          message: "Oops! Some thing went wrong, IVR Access Request failed",
                          autoDismiss: 10,
                          onRemove: () => {
                            setIsUnlinkUserLoading(false)
                            setShowUnlinkUserModal(false)
                            onUserLoad();
                          }
                        })
                      }
                    })
                  }
                });


              } else {
                _NotificationSystem.addNotification({
                  title: 'Success',
                  position: "br",
                  level: 'success',
                  message: "User has been unlinked successfully",
                  autoDismiss: 2,
                  onRemove: () => {
                    setIsUnlinkUserLoading(false)
                    setShowUnlinkUserModal(false)
                    onUserLoad();
                  }
                })
              }


            } else {
              setIsUnlinkUserLoading(false)
              setShowUnlinkUserModal(false)
              _NotificationSystem.addNotification({
                title: 'error',
                position: "br",
                level: 'error',
                message: "User has been unlinked successfully, Unable to get IVR Status for the linked company :" + action.response.data.getVendorTechForVendorId.message
              })
            }
          }
        })
      } else {
        setIsUnlinkUserLoading(false)
        setShowUnlinkUserModal(false)
        _NotificationSystem.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: "Unable to unlink the user!"
        })
      }
    })
  }

   const setSearchValue = ()=>{
    setSearchVal('')
   }

  const renderIcon=(row, issoCondition)=> {
    const { user } = props;
    const loggedInVendorId = user.get("vendor_id");
    const rowVendorId = row.original.vendor_id;
    let linkedUserDetail = renderUnlink(row);
    return (
      <span>
        {issoCondition ? null : <a onClick={(e) => props.onclickEdit(row, linkedUserDetail, 
        {
          ivrTechdata: ivrTechdata,
          manager_emails:manager_emails,
          vendorAdminName: vendorAdminName,
          vendorAdminPhone: vendorAdminPhone,
          userReg: userReg,
          onUserLoad:onUserLoad,
          setSearchValue:setSearchValue,
          updateESSOUser:false
         })}>
           <i title='Edit User' className="fas fa-pencil-alt" style={{ color: "rgb(255, 167, 38)", fontSize: "18px", cursor: "pointer", marginRight: "15px" }}></i></a>}
       <img src={emailImage}
          title='Notify User'
          style={{ height: '21px', verticalAlign: 'baseline', marginRight: '15px', cursor: "pointer" }}
          onClick={(e) => emailIconClick(e, row)}>
        </img>
         <img src={resetAccountIcon}
          title='Reset ISSO Account'
          style={{ height: '21px', verticalAlign: 'baseline', marginRight: '15px' }}
          onClick={(e) => resetAccountClick(e, row)}
        >
        </img>
        {linkedUserDetail && <a>
          <i className="fa fa-tag"
            style={{ cursor: 'pointer', marginRight: "15px", fontSize: "18px" }}
            aria-hidden="true"
            title={linkedUserDetail && linkedUserDetail.loggedInVendorId !== linkedUserDetail.linkedParentVendorId ? `Linked from: ${linkedUserDetail.linkedParentVendorName} (${linkedUserDetail.linkedParentRegion})` : `Linked to: ${linkedUserDetail.linkedVendorName} (${linkedUserDetail.linkedRegion})`}>
          </i></a>}
        {linkedUserDetail && !issoCondition ? <a onClick={
          (e) => {
          setShowUnlinkUserModal(true)
          setLinkedUserDetail(linkedUserDetail)
          setUserdata(row.original)
          setLinkedUserId(linkedUserDetail.linkedUserId)
          setLinkedOpstrackerId(linkedUserDetail.opstrackerId)
          setLinkedVendorId(linkedUserDetail.linkedVendorId)
          setUnlinkVendorMessage(linkedUserDetail.unlinkVendorMessage)
        }
          }>
           <i title='Unlink User' className="fa fa-unlink" style={{ marginRight: "15px", fontSize: "18px", cursor: "pointer" }}></i></a> : null}
        {(row.original.userid !== user.get('login_id') && loggedInVendorId === rowVendorId  && !issoCondition) ? <a onClick={(e) => props.onClickDelete( row, linkedUserDetail,{onUserLoad:onUserLoad,deleteESSOUser:false,setSearchValue:setSearchValue})}><i title='Remove user' className="fa fa-trash" style={{ "color": "#F44336", "fontSize": "18px", "cursor": "pointer" }} ></i></a> : null}
        {/* {<i className="fa fa-envelope" onClick={(e) => this.emailIconClick(e, row)}></i>} */}
      </span>)
  }


  const emailIconClick = (e, row) => {
    setUserdata(row.original)
    setShowEmailModal(true)
  }
  const resetAccountClick = (e, row) => {

    let userEmail = row.original.email
    props.getUserInfoLinked(props.user.get("login_id"), { query: getUserInfoLinkedDef, variables: { vendorEmail: userEmail } }).then(inAction => {
      if (inAction && inAction.response && inAction.response.data && inAction.response.data.getUserInfoLinked && inAction.response.data.getUserInfoLinked.userinfo) {
        let isIssoReg = inAction.response.data.getUserInfoLinked.userinfo.IS_ISSO_REG;
        if (isIssoReg === 'Y') {
          setUserdata(inAction.response.data.getUserInfoLinked.userinfo)
          setShowResetAccountModal(true)
          setIsIssoReg(true)
          setIsIssoReset(false)
          setIsIssoResetLoading(false)
          setErrorExits(false)
        }
        else {
          setUserdata(inAction.response.data.getUserInfoLinked.userinfo)
          setShowResetAccountModal(true)
          setIsIssoReg(false)
          setIsIssoResetLoading(false)
          setErrorExits(false)

        }
      } else {
        setUserdata(inAction.response.data.getUserInfoLinked.userinfo)
        setShowResetAccountModal(true)
        setIsIssoReg(false)
        setIsIssoResetLoading(false)
        setErrorExits(false)

      }
    });
  }

  const requestPin = (row) => {
    let linkedUserDetail = renderUnlink(row);
    return (
      <span>
        {(props.user && props.user.get('vendor_role') && props.user.get('vendor_role') == 'PORTALUSER') && (row.original.userid != props.loginId) ? <span style={{ cursor: 'pointer', color: 'blue' }}>{row.original.ivr_PinStatus}</span> :
          <a style={{ cursor: 'pointer', color: 'blue' }} onClick={(e) => {onClickPinEdit(e, row.original); setLinkedDetail(linkedUserDetail)}}>{row.original.ivr_PinStatus}</a>}
      </span>
    )
  }

  const requestEnableIVR = (row) => {
    let linkedUserDetail = renderUnlink(row);
    let ivr_access_value = row?.original?.ivr_access?.toLowerCase() == "disabled" ? "Locked" : row?.original?.ivr_access?.toLowerCase() == "enabled" ? "Unlocked" : row?.original?.ivr_access;
    return (
      <span>
        {(props.user && props.user.get('vendor_role') && props.user.get('vendor_role') == 'PORTALUSER') && (row.original.userid != props.loginId) ? <span style={{ cursor: 'pointer', color: 'black' }}>{ivr_access_value}</span> :
          <a style={{ cursor: 'pointer', color: 'blue' }} onClick={(e) => {onClickEnableIVR(e, row.original); setLinkedDetail(linkedUserDetail)}}>{ivr_access_value}</a>}
      </span>
    )
  }

  const getRecertifiedStatus = (row) => {
    let recertified_status = row?.original?.user_status != null ? row?.original?.user_status : 'N/A';
    return (
    <span style={{ color: 'black' }}>{recertified_status}</span>
    )
  }

  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (row, e) => {
    if (e.target.checked) {
      setSelectedRows(prevSelected => {
        const isAlreadySelected = prevSelected.some(r => r.userid === row.original.userid);
        if (!isAlreadySelected) {
          return [...prevSelected, row.original];
        }
        return prevSelected;
      });
    } else {
      setSelectedRows(prevSelected => prevSelected.filter(r => r.userid !== row.original.userid));
    }
    setIsUserSelected(e.target.checked || selectedRows.length > 0);
  };

const isChecked = (userId) => selectedRows.some(r => r.userid === userId);

const handleCheckBoxDisabled = (row) => {
  const { user } = props;
  if (row.original.userid === user.get('login_id')) {
    return true;
  }
  return false;
}

  const onClickPinEdit = (e, data) => {
    setShowRequestPinModal(true)
    setUserdata(data)
  }

  const onClickEnableIVR = (e, data) => {
    setUserPhoneNo(data.phone ? parseInt(data.phone, 10) : null)
    setShowEnableIVRModal(true)
    setUserdata(data)
  }

  const hideEnableIVRModal = () => {
    setShowEnableIVRModal(false)
  }
  
  const [selectedUsersId, setSelectedUsersId] = useState([]);

  const onClickRecertifyUsers = (e) => {
    const userStatusFilteredRows = selectedRows.filter(row => {
      const userStatus = row.user_status ? row.user_status.toLowerCase() : null;
      return userStatus === 'active' && userStatus === null;
    });

    userStatusFilteredRows.forEach(row => {
      const checkbox = document.querySelector(`input[type="checkbox"][data-userid="${row.userid}"]`);
      if (checkbox) {
        checkbox.checked = false;
      }
    });

    setSelectedRows(prevSelected => prevSelected.filter(row => {
      const userStatus = row.user_status ? row.user_status.toLowerCase() : null;
      return userStatus !== 'active' && userStatus !== null;
    }));
    setShowRecertifyModal(true);
  }

  const hideRecertifyModal = () => {
    setShowRecertifyModal(false)
  }

  const onClickBulkDeleteUsers = (e) => {
    const user = props;
    const vendorId = user.user.get("vendor_id");  
    const userVendorIdFilteredRows = selectedRows.filter(row => {
      const userVendorId = row.vendor_id ? row.vendor_id : null;
      return userVendorId === vendorId && row.userid !== user.user.get('login_id');
    });

    userVendorIdFilteredRows.forEach(row => {
      const checkbox = document.querySelector(`input[type="checkbox"][data-userid="${row.userid}"]`);
      if (checkbox) {
        checkbox.checked = false;
      }
    });

    setSelectedRows(prevSelected => prevSelected.filter(row => {
      const userVendorId = row.vendor_id ? row.vendor_id : null;
      return userVendorId === vendorId && row.userid !== user.user.get('login_id');
    }));
    setShowBulkDeleteModal(true);
  }

  const hideBulkDeleteModal = () => {
    setShowBulkDeleteModal(false)
  }

  const requestPinModal = () => {
    return (
      <Modal title="Request IVR PIN" handleHideModal={() => hidePinModal()} style={{ width: "52%", maxWidth: "97%", top: '20%' }}>
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
      </Modal>)
  }

  const requestEnableIVRModal = () => {
    return (
      <Modal title="Unlock IVR Account" handleHideModal={() => hideEnableIVRModal()} style={{ width: "52%", maxWidth: "97%", top: '20%' }}>
        <div className="row margin-top-bottom-10" style={{ width: "100%" }}>
          <div className="col-12">
            <div style={{ width: "100%", padding: "10px 0 10px 2rem", display: "flex", flexWrap: "wrap" }}>
              <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ float: 'left' }}>Would you like to unlock IVR Account?</h5></label>
            </div>
            <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button"
                className="Button--secondary u-floatLeft" onClick={() => submitEnableIVR()}
                style={{ marginRight: "5px" }} disabled={isEnableIVRLoading}>
                  {isEnableIVRLoading ? "Acitivating" : "YES"}
              </button>
              <button type="button"
                className="Button--secondary u-floatRight" onClick={() => hideEnableIVRModal()}
                style={{ marginRight: "5px" }}>
                NO
              </button>
            </div>
          </div>
        </div>
      </Modal>)
  }

  const requestEmailModal = () => {
    return (
      <Modal title="Request email" handleHideModal={() => hideEmailModal()} style={{
        marginTop: "30px",
        display: "block",
      }}>
        <div className="row margin-top-bottom-10" style={{ width: "100%" }}>
          <div className="col-12">
            <div>
              <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ float: 'left' }}>Do you want to notify user ?</h5></label>
            </div>
            <div style={{ display: "flex" }}>
              <button type="button"
                className="Button--secondary" onClick={() => sendEmail()}
                style={{ marginRight: "10px" }}>
                YES
              </button>
              <button type="button"
                className="Button--secondary" onClick={() => hideEmailModal()}
                style={{ marginRight: "5px" }}>
                NO
              </button>
            </div>
          </div>
        </div>
      </Modal>)
  }

  const requestResetAccountModal = () => {
    return (
      <Modal title="Reset ISSO Account" handleHideModal={() => hideResetAccountModal()} style={{
        marginTop: "30px",
        display: "block",
      }}>
        <div className="row margin-top-bottom-10" style={{ width: "100%" }}>

          {isIssoReg ?
            <div className="col-12">

              <div style={{ width: "100%", padding: "10px 0 10px 0.2em", marginLeft: "0.5vh", display: "flex", flexWrap: "wrap" }}>
                <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ float: 'left' }}>Do you want to Reset ISSO Account of {userdata.FIRST_NAME + ' ' + userdata.LAST_NAME} ?</h5></label>
              </div>
              {isIssoResetLoading ? renderLoading() :
                <div >
                  <button type="button"
                    className="Button--secondary " onClick={() => resetAccount()} disabled={isIssoReset}
                    style={{ marginRight: "5px", marginLeft: "1.5em" }}>
                    YES
                  </button>
                  <button type="button"
                    className="Button--secondary" onClick={() => hideResetAccountModal()} disabled={isIssoReset}
                    style={{ marginRight: "5px" }}>
                    NO
                  </button>
                  {isIssoReset ?
                    <div className='text-primary' style={{ marginLeft: "1em" }}>New ISSO registration link has been sent to the recipients mail</div>
                    : null}
                  {errorExits ?
                    <div className='text-danger' style={{ marginLeft: "1em" }}>{errorMsg}</div>
                    : null}
                </div>
              } </div>
            : <div>User has not yet registered for ISSO</div>}
        </div>
      </Modal>)
  }

  const requestRecertifyModal = () => {
    return (
      <Modal title="Recertify" handleHideModal={() => hideRecertifyModal()} style={{ width: "52%", maxWidth: "97%", top: '20%' }}>
        <div className="row margin-top-bottom-10" style={{ width: "100%" }}>
          <div className="col-12">
            <div style={{ width: "100%", padding: "10px 0 10px 2rem", display: "flex", flexWrap: "wrap" }}>
              <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ float: 'left' }}>Are you sure you want to Recertify the selected user(s)?</h5></label>
            </div>
            <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button"
                className="Button--secondary u-floatLeft" onClick={() => submitRecertify()}
                style={{ marginRight: "5px", width:'30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} disabled={isRecertifyLoading}>
                  {isRecertifyLoading ? "Updating" : "YES"}
              </button>
              <button type="button"
                className="Button--secondary u-floatRight" onClick={() => {hideRecertifyModal(); setSelectedRows([]);}}
                style={{ marginRight: "5px", width:'30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                NO
              </button>
            </div>
          </div>
        </div>
      </Modal>)
  }

  const requestBulkDeleteModal = () => {
    return (
      <Modal title="Bulk Delete" handleHideModal={() => hideBulkDeleteModal()} style={{ width: "52%", maxWidth: "97%", top: '20%' }}>
        <div className="row margin-top-bottom-10" style={{ width: "100%" }}>
          <div className="col-12">
            <div style={{ width: "100%", padding: "10px 0 10px 2rem", display: "flex", flexWrap: "wrap" }}>
              <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ float: 'left' }}>Are you sure you want to Delete the selected user(s)?</h5></label>
            </div>
            <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button"
                className="Button--secondary u-floatLeft" onClick={() => submitBulkDelete()}
                style={{ marginRight: "5px", width:'30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} disabled={isBulkDeleteLoading}>
                  {isBulkDeleteLoading ? "Deleting" : "YES"}
              </button>
              <button type="button"
                className="Button--secondary u-floatRight" onClick={() => {hideBulkDeleteModal(); setSelectedRows([]);}}
                style={{ marginRight: "5px", width:'30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                NO
              </button>
            </div>
          </div>
        </div>
      </Modal>)
  }

  const resetAccount = () => {
    const _NotificationSystem = _notificationSystem.current

    let { ISSO_USERID, OPSTRACKER_USERID } = userdata;
    setIsIssoResetLoading(true)

    issoResetAccountReq({ query: issoResetAccount, variables: { issoUserId: ISSO_USERID, opstrackerUserId: OPSTRACKER_USERID } }).then((res) => {
      if (res.data.data.issoResetAccount.emailsSent) {
        setIsIssoReset(true)
        setIsIssoResetLoading(false)
        setErrorExits(false)
        _NotificationSystem.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: `Email sent successfully to ${userdata.EMAIL_ADDRESS}`
        })
        setTimeout(() => {
          hideResetAccountModal()
        }, 10000);
      } else if (res.data.data.issoResetAccount.output) {
        setIsIssoResetLoading(false)
        setErrorExits(true)
        setErrorMsg(res.data.data.issoResetAccount.output.errors[0].detail)
        _NotificationSystem.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: res.data.data.issoResetAccount.output.errors[0].detail
        })
      } else {
        setIsIssoResetLoading(false)
        setErrorExits(true)
        setErrorMsg("Sorry unable to send email!")
        _NotificationSystem.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: "Sorry unable to send email!"
        })
      }
    }).catch((e) => {
      setIsIssoResetLoading(false)
      setErrorExits(true)
      setErrorMsg("Sorry unable to send email!")
      _NotificationSystem.addNotification({
        title: 'error',
        position: "br",
        level: 'error',
        message: "Sorry unable to send email!"
      })
    })

  }
  const sendEmail = () => {
    const _NotificationSystem = _notificationSystem.current

    resendUserActivationInvite({ query: resendUserActivationInviteDef, variables: { userId: userdata.userid } }).then((res) => {
      if (get(res, 'data.data.resendUserActivationInvite')) {
        _NotificationSystem.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: `Email sent successfully to ${userdata.email}`
        })
      } else if (get(res, 'data.errors[0].data.detail')) {
        _NotificationSystem.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: res.data.errors[0].data.detail
        })
      } else {
        _NotificationSystem.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: "Sorry unable to send email!"
        })
      }
    }).catch((e) => {
      _NotificationSystem.addNotification({
        title: 'error',
        position: "br",
        level: 'error',
        message: "Sorry unable to send email!"
      })
    })
    hideEmailModal();
  }

  const requestConfirmModal = (issoCondition) => {
    return (
      // add loader
      <Modal title="Confirm your Contact Information" handleHideModal={() => hideConfirmModel()} >
        {activePinRetrievel(issoCondition)}
      </Modal>
    )
  }

  const hideConfirmModel = () => {
    setShowConfirmPinModel(false)
    setUserPhoneNo(null)
    setValidPhoneNo(true)
  }

  const showConfirmModel = () => {
    setUserPhoneNo(userdata.phone ? parseInt(userdata.phone, 10) : null)
    setShowRequestPinModal(false)
    setShowConfirmPinModel(true)
  }

  const hidePinModal = () => {
    setShowRequestPinModal(false)
    setValidPhoneNo(true)
  }

  const hideEmailModal = () => {
    setShowEmailModal(false)
  }
  const hideResetAccountModal = () => {
    setShowResetAccountModal(false)
  }
  const handleKeyPress = (e) => {
    if (e.target.value.length > 9) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const onDataChange = (e) => {
    if (e.target) {
      if (e.target.name === 'phone') {
        let val = parseInt(e.target.value, 10)
        setUserPhoneNo(e.target.value)
        if (isNaN(val) || val < 0 || e.target.value.length < 10) {
          setValidPhoneNo(false)
        } else {
          setValidPhoneNo(true)
        }
      }
    }
  }

  const activePinRetrievel = (issoCondition) => {
    return (
      <div className="row margin-top-bottom-10" style={{ width: "100%" }}>
        <div className="col-12">
          <div style={{ width: "100%", padding: "5px 0 10px 2.5rem", display: "flex", flexWrap: "wrap" }}>

            {userdata.ivr_PinStatus && userdata.ivr_PinStatus.toLowerCase() == "expired" ?
              <p style={{ float: 'left', color: "black", fontSize: "1.15em" }}>Your IVR PIN has expired. The Old PIN will be texted to your contact number.
                Once you receive your old PIN, please call 888-611-0029 to update your PIN. Please stay on the phone until you are promoted with the new PIN.
                You will need to write down the new PIN at the end of the call.</p>
              : null}
          </div>
          {userdata.ivr_access == "Disabled" ? (
            <div style={{ width: "100%", padding: "5px 0 10px 2.5rem", display: "flex", flexWrap: "wrap" }}>
              <label style={{ color: "black", fontsize: "1.15em" }}><h5 style={{ float: 'left' }}>The IVR access has been locked due to no usage in the past 120 days.</h5></label>
              <label style={{ color: "black", fontsize: "1.15em" }}><h5 style={{ float: 'left' }}>To re-activate your IVR access, you will need to IVR into a cell site today.
                Otherwise, your IVR PIN will be locked tomorrow.</h5></label>
              <label style={{ color: "black", fontSize: "1.15em" }}><h5 style={{ float: 'left'}}>Please confirm your contact number. It will be used to text you the IVR PIN.</h5></label>
            </div>
          ) : null}
          {userdata.ivr_access != "Disabled" ? <label style={{ color: "black", fontSize: "1.15em" }}><h5 style={{ float: 'left', marginLeft: '24px' }}>Please confirm your contact number. It will be used to text you the IVR PIN.</h5></label> : null}
        </div>
        {isIVRResetLoading ? renderLoading() : (<div className="col-12" style={{ marginLeft: '24px' }}>
          {!issoCondition ?
            (<TextField
              floatingLabelText="Phone No"
              floatingLabelFixed={true}
              type="number"
              name="phone"
              error={!validPhoneNo}
              helperText={validPhoneNo ? null : "Please enter valid 10 digit phone number without dashs and dot"}
              value={userPhoneNo} onChange={(e) => onDataChange(e)}
              className="required"
              inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
              fullWidth={false} autoFocus={true} maxLength="10" onKeyPress={(e) => handleKeyPress(e)}
            >

            </TextField>) :

            <div>
              <div><b>Phone No</b></div>
              <div>{userPhoneNo}</div>
            </div>
          }



          <button type="button"
            className="Button--secondary u-floatRight" onClick={() => submitPinRequest(issoCondition)}
            disabled={!validPhoneNo}
            style={{ marginRight: "5px", marginTop: "20px" }}>
            Confirm
          </button>
        </div>)}
      </div>
    )
  }
  const submitEnableIVR = () => {
    let { user } = props;
    const _NotificationSystem = _notificationSystem.current;

    setIsIVREnableLoading(true)
    let subMars = []
    props.activeDomains(user.get("login_id"), userdata && userdata.userid).then(res => {
            if (res && res.type == "ACTIVE_DOMAIN_SUCCESS") {
              subMars = res && res.response && res.response.subMarket
              let ivrUpdUser = {
                phone: userPhoneNo, vendorId: userdata.vendor_id, login: "S-iopvp", accountLocked: false, userId: userdata.userid,
                email: userdata.email, userLastName: userdata.lname, userFirstName: userdata.fname, sponsor: userdata.vendor_sponsor_id, subMarketList: subMars
              }
    props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUpdUser } }).then(action => {
      if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
        && action.techId.data.createUpdIvrUser.techId != null) {
          setShowEnableIVRModal(false)
          setIsIVREnableLoading(false)
          _NotificationSystem.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            message: "IVR activated successfully for the account"
          })
          setTimeout(() => onUserLoad(), 2200);
      } else {
        setIsIVREnableLoading(false)
        setShowEnableIVRModal(false)
        _NotificationSystem.addNotification({
          title: 'Error',
          position: "br",
          level: 'error',
          message: action.techId.data.createUpdIvrUser.message
        })
      }

    })
  }
  })

  }
  const submitPinRequest = (issoCondition) => {
    let { user } = props
    const _NotificationSystem = _notificationSystem.current

    setIsIVRResetLoading(true)
    if (userdata.phone && userPhoneNo && parseInt(userdata.phone, 10) != userPhoneNo) {
      let values = { phone: userPhoneNo, contact_unid: userdata.contact_unid, vendor_id: linkedDetail && linkedDetail.linkedParentVendorId ? linkedDetail.linkedParentVendorId : userdata.vendor_id, created_by: userdata.name }
      let ivrUpdUser = {
        phone: userPhoneNo, vendorId: userdata.vendor_id, login: "S-iopvp", accountLocked: false, userId: userdata.userid,
        email: userdata.email, userLastName: userdata.lname, userFirstName: userdata.fname, sponsor: userdata.vendor_sponsor_id, subMarketList: vendor_region
      }
      props.updateUser(user.get("login_id"), { query: updateContactDef, variables: { VendorInput: values } }).then(action => {
        if ((!action || action && action.type !== "UPDATE_USER_FAILURE") &&
          action.response && action.response.data && action.response.data.updateContact &&
          action.response.data.updateContact.data && action.response.data.updateContact.data.phone && action.response.data.updateContact.data.phone == (userPhoneNo + '')) {

          props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUpdUser } }).then(action => {
            if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
              && action.techId.data.createUpdIvrUser.techId != null) {

              props.getCurrentIvrPin("S-iopvp", userdata.userid).then(action => {
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
                  setTimeout(() => onUserLoad(), 2200);
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
    } else if (userdata.phone && userPhoneNo && parseInt(userdata.phone, 10) == userPhoneNo) {
      if (userdata.ivr_access.toLowerCase() == 'disabled') {
        if (issoCondition) {
          let subMars = []
          props.activeDomains(props.loginId, userdata && userdata.userid).then(res => {
            if (res && res.type == "ACTIVE_DOMAIN_SUCCESS") {
              subMars = res && res.response && res.response.subMarket
              let ivrUpdUser = {
                phone: userPhoneNo, vendorId: userdata.vendor_id, login: "S-iopvp", accountLocked: false, userId: userdata.userid,
                email: userdata.email, userLastName: userdata.lname, userFirstName: userdata.fname, sponsor: userdata.vendor_sponsor_id, subMarketList: subMars
              }
              props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUpdUser } }).then(action => {
                if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
                  && action.techId.data.createUpdIvrUser.techId != null) {

                  props.getCurrentIvrPin("S-iopvp", userdata.userid).then(action => {
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
                      setTimeout(() => onUserLoad(), 2200);
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
            }
          })
        }
        else {
          let ivrUpdUser = {
            phone: userPhoneNo, vendorId: userdata.vendor_id, login: "S-iopvp", accountLocked: false, userId: userdata.userid,
            email: userdata.email, userLastName: userdata.lname, userFirstName: userdata.fname, sponsor: userdata.vendor_sponsor_id, subMarketList: vendor_region
          }
          props.createUpdIvr(user.get("login_id"), { query: createUpdIvrUser, variables: { ivr_request_input: ivrUpdUser } }).then(action => {
            if (!action || action && action.type !== "CREATE_UPD_IVR_USER_FAILURE" && action.techId && action.techId.data
              && action.techId.data.createUpdIvrUser.techId != null) {

              props.getCurrentIvrPin("S-iopvp", userdata.userid).then(action => {
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
                  setTimeout(() => onUserLoad(), 2200);
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

        }
      } else {
        props.getCurrentIvrPin("S-iopvp", userdata.userid).then(action => {
          if (action && action.type !== "GET_CURRENT_IVRPIN_FAILURE" &&
            action.response && action.response.data
            && action.response.data.getCurrentPinByUserId && action.response.data.getCurrentPinByUserId.code == 200) {
            setIsIVRResetLoading(false)
            setShowConfirmPinModel(false)
            _NotificationSystem.addNotification({
              title: 'Success',
              position: "br",
              level: 'success',
              message: "Ivr Pin has been successfully Sent to your mobile"
            })
          } else {
            setIsIVRResetLoading(false)
            setShowConfirmPinModel(false)
            _NotificationSystem.addNotification({
              title: 'error',
              position: "br",
              level: 'error',
              message: "Sorry unable to retieve the Pin!"
            })
          }
        })
      }
    }
  }

  const submitRecertify = async() => {
    const _NotificationSystem = _notificationSystem.current,
           selectedUserIds = selectedRows.map(row => row.userid);
    setSelectedUsersId(selectedUserIds);
    setIsRecertifyLoading(true);
    let { user } = props;
    ajax.post(`/graphql4g`, { query: postUserRecertifySchema, variables: {opstrackerUserId: selectedUserIds, updatedBy: user.get('login_id')} })
    .then(res =>{
      if(res?.data?.data?.updateUserStatus?.message === 'User status updated successfully') {
        setIsRecertifyLoading(false);
        onUserLoad(); 
        setSelectedUsersId([]);
        setSelectedRows([]);
        hideRecertifyModal();
        setIsUserSelected(false);
        _NotificationSystem.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: "User(s) status updated successfully"
        })
      } else {
        setIsRecertifyLoading(false);
        _NotificationSystem.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: res.error || "Sorry. Unable to Recertify user(s)!"
        })
        hideRecertifyModal();
      }
      return res?.data?.data;
    })
    .catch(errors => {
      return errors
    })
  }

  const submitBulkDelete = () => {
    const _NotificationSystem = _notificationSystem.current,
           selectedUserIds = selectedRows.map(row => row.contact_unid);
    setIsBulkDeleteLoading(true);
    setSelectedUsersId(selectedUserIds);
    ajax.post(`/graphql4g`, { query: deleteBulkUserSchema, variables: {contactUnid: selectedUserIds} })
      .then(res =>{
        if(res.data?.data?.deleteUsers?.successfulDeletes?.length > 0) {
          setIsBulkDeleteLoading(false);
          onUserLoad(); 
          setSelectedUsersId([]);
          hideBulkDeleteModal();
          setIsUserSelected(false);
          _NotificationSystem.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            message: "Users deleted successfully"
          })
        } if (res.data?.data?.deleteUsers?.failedDeletes?.length > 0) {
          setIsBulkDeleteLoading(false);
          _NotificationSystem.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: res.data?.data?.deleteUsers?.errors[0]?.detail || "Sorry. Unable to delete user(s)!"
          })
          hideBulkDeleteModal();
        } else {
          setIsBulkDeleteLoading(false);
          _NotificationSystem.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: res.data?.data?.deleteUsers?.errors[0]?.detail || "Sorry. Unable to delete user(s)!"
          })
          hideBulkDeleteModal();
        }
      })
  }

  const onSearchValueChange = (event) => {
    setSearchVal(event.target.value)
  }
  useEffect(()=>{
    if(!props.isLoading)
    tableSearch()
  },[props.isLoading])
  useEffect(() => {
    tableSearch()
  }, [searchVal])

  const tableSearch = () => {
    let filteredData = []
    if (searchVal?.length >= 3) {
      filteredData = data?.filter(value => {
        return (
          value?.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
          value?.phone?.toLowerCase().includes(searchVal.toLowerCase()) ||
          value?.email?.toLowerCase().includes(searchVal.toLowerCase()) ||
          value?.userid?.toLowerCase().includes(searchVal.toLowerCase()) ||
          value?.vendor_role?.toString().toLowerCase().includes(searchVal.toLowerCase())
        );
      });
    }
    if (filteredData?.length > 0) {
      setData(filteredData)
      setSearchMatched(true)
    } else {
      setData((props?.UsersList && props?.UsersList.toJS() && (props?.UsersList.toJS().length > 0)) ? props?.UsersList.toJS() : [])
      setSearchMatched(false)
    }
  }

  const { UsersList, isLoading, user } = props
  let issoCondition = false
  let loginId = user.get('userid');
  let { realLoginId, isssouser, ssoUrl } = props
  if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.toLowerCase().includes('ssologin')) {
    issoCondition = true
  }

  let is_vpauto_enabled;
  if (user?.toJS()?.is_vpauto_enabled === 'Y') {
    is_vpauto_enabled = true;
  }
  else if (user?.toJS()?.is_vpauto_enabled === 'N') {
    is_vpauto_enabled = false;
  }

  if (data && data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      let userId = data[i].userid;
      let ivrStatus = data[i].ivr_status ? data[i].ivr_status : null;
      if (ivrTechdata && ivrTechdata.length > 0) {
        for (let j = 0; j < ivrTechdata.length; j++) {
          if (userId == ivrTechdata[j].USERID) {
            if (ivrTechdata[j].ACCTLOCKEDIND == 0) {
              data[i]["ivr_access"] = "Enabled"
            } else if (ivrTechdata[j].ACCTLOCKEDIND == 1) { data[i]["ivr_access"] = "Disabled" }
            if (ivrTechdata[j].PIN_EXPIRED && ivrTechdata[j].PIN_EXPIRED.toLowerCase() == "false") {
              data[i].ivr_access == undefined ? null : data[i]["ivr_PinStatus"] = "Active"
            } else {
              data[i].ivr_access == undefined ? null : data[i]["ivr_PinStatus"] = "Expired"
            }
          } else if (ivrStatus === "Y") {
            data[i]["ivr_access"] = "Enabled";
            data[i]["ivr_PinStatus"] = "Active";
          }

        }
        if (data[i].ivr_access == undefined) { data[i]["ivr_access"] = "No Access" }
      } else {
        data[i]["ivr_access"] = "No Access"
      }

    }
  }

  let columns = [
    {
      Header: "First Name",
      accessor: "fname"
    },
    {
      Header: "Last Name",
      accessor: "lname"
    },
    {
      Header: "Role",
      accessor: "vendor_role"
    },
    {
      Header: "Email",
      accessor: "email"
    },
    {
      Header: "Phone",
      accessor: "phone"
    },
    {
      Header: "User ID",
      accessor: "userid"
    },
    {
      Header: "IVR Access",
      accessor: "ivr_access",
      Cell: row => user.get('vendor_role') == 'PORTALADMIN' && row?.original?.ivr_access?.toLowerCase()=="disabled" ? requestEnableIVR(row) : row?.original?.ivr_access?.toLowerCase() == "disabled" ? "Locked" : row?.original?.ivr_access?.toLowerCase() == "enabled" ? "Unlocked" : row?.original?.ivr_access
    },
    {
      Header: "IVR PIN Status",
      accessor: "ivr_PinStatus",
      Cell: row => requestPin(row)
    },    
    {
      Header: "Recertification Status",
      accessor: "is_recertified",
      Cell: row => getRecertifiedStatus(row)
    },
    {
      Header: "OSW Trained",
      accessor: "is_vendor_trained"
    },
  ]
  if ((props.user && props.user.get('vendor_role') && props.user.get('vendor_role') == 'PORTALADMIN')) {    
    columns.push({
      Header: '',
      id: 'click-me-button',
      Cell: row => renderIcon(row, issoCondition),
      width: 200
    });
    columns.unshift({
      Header: "",
      accessor: "select",
      Cell: row => (
        <input
          type="checkbox"
          style={{ marginTop: '4px' }}
          checked={isChecked(row.original.userid)}
          onChange={(e) => handleCheckboxChange(row, e)}
          disabled={handleCheckBoxDisabled(row)}          
        />
      ),
      width: 30,
    })
  }
  const formExcelData = (item) => {
    let data = []
    let style = { font: { bold: true } }
    const header = ["VENDOR NAME", "VENDOR_ID", "VENDOR_AREA", "VENDOR_MARKET", "VENDOR_MDGID",
     "FIRST_NAME", "LAST_NAME", "EMAIL_ADDRESS", "PHONE_NUMBER", "VENDOR_ROLE", "IVR_ACCESS", "ISSO_ACCOUNT_REG", "OSW-TRAINED"]
    let headers = []
    headers.push(header.map(el => {
      return { v: el, t: "s", s: style }
    }))

    for (let j = 0, end = item.length; j < end; j++) {
      let value = item[j]
      data.push([
        { v: value.vendor_name, t: "s" },
        { v: value.vendor_id, t: "n" },
        { v: value.vendor_area, t: "s" },
        { v: value.vendor_region, t: "s" },
        { v: value.vendor_mdg_id, t: "s" },
        { v: value.fname, t: "s" },
        { v: value.lname, t: "s" },
        { v: value.email, t: "s" },
        { v: value.phone, t: "s" },
        { v: value.vendor_role, t: "s" },
        { v: value.ivr_access, t: "s" },
        { v: value.is_isso_reg, t: "s" },
        { v: value.is_vendor_trained, t: "s" },
      ])
    }
    return [ ...headers, ...data]
  }
  const getExportToExcel = () => {
    let tableName = `User Information ${moment(new Date()).format(`MM-DD-YYYY hh_mm`)}`
    let item = data
    if (item && item.length > 0) {
      let excelData = formExcelData(item)
      let ws = XLSX.utils.aoa_to_sheet([...excelData])
      let wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "UserInfo")
      XLSX.writeFile(wb, `${tableName}.xlsx`)
    }
  }

  return (
    <div className="Col Col-12" >
      {showRequestPinModal ? requestPinModal() : null}
      {showEnableIVRModal ? requestEnableIVRModal() : null} 
      {showConfirmPinModel ? requestConfirmModal(issoCondition) : null}
      {showEmailModal ? requestEmailModal() : null}
      {showResetAccountModal ? requestResetAccountModal() : null}
      {showUnlinkUserModal ? renderUnlinkModal() : null}
      {showRecertifyModal ? requestRecertifyModal() : null}
      {showBulkDeleteModal ? requestBulkDeleteModal() : null}
      <div>
        <div className="Grid test" style={{ "display": "flex", "background": "#FFF", "WebkitBoxShadow": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)", "boxShadow": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)", "padding": "18px 7px" }}>
          {data && data.length > 0 ?
            <div className="Col Col-5" >
              <div className="Col Col-12 h3" >
                <span style={{ fontSize: "15px" }}>
                  {data[0].vendor_id} - {data[0].vendor_name}
                </span>
              </div>
              <div className="Col Col-12 h4" >
                {data[0].vendor_address},{data[0].vendor_city},{data[0].vendor_state} - {data[0].vendor_zip}
              </div>
              <div className="Col Col-12 h5">
                <span style={{display: 'flex', alignItems:'center'}}><i className="fa fa-phone" style={{ "color": "#546E7A", "padding": "0px 5px", "fontSize": "20px" }}></i>{data[0].vendor_phone} </span>
                <span style={{display: 'inline-flex', wordBreak: 'break-all', alignItems: 'center'}}><i className="fa fa-envelope" style={{ "color": "#546E7A", "padding": "0px 5px", "fontSize": "25px" }}></i>{data[0].vendor_service_email}</span>
              </div>
            </div>
            : <div className="Col Col-5" ></div>}
          <div className="Col Col-7">
            <div style={{ "float": "right", "padding": "0 0.2rem", "background": "black", "color": "rgb(255, 255, 255)", "textAlign": "center" }}>
              <div style={{ "fontSize": "2rem" }}>{data ? data.length : 0}</div>
              <div style={{ "fontSize": "0.9rem", "padding": "0.2rem" }}>User Count</div>
            </div>
            {issoCondition || (props.user && props.user.get('vendor_role') && props.user.get('vendor_role') == 'PORTALUSER') ? null : <button type="button" className="Button--small u-floatRight"
              onClick={(e) => props.onCreateUser(data.length > 0 ? data[0].vendor_sponsor_id : "", vendor_region.length > 0 ? vendor_region : data.length > 0 && data[0].vendor_region, {
                ivrTechdata: ivrTechdata,
                manager_emails: manager_emails,
                vendorAdminName: vendorAdminName,
                vendorAdminPhone: vendorAdminPhone,
                userReg: userReg,
                onUserLoad: onUserLoad(),
                vendor_id: user.get("vendor_id")
              }, vendor_area.length > 0 ? vendor_area : data.length > 0 && data[0].vendor_area)}
              style={{ marginRight: "5px", color: "#FFFFFF", fontSize: "0.9rem", border: "1px solid black" }}>  Create User </button>}
            {is_vpauto_enabled === true && <div style={{ marginTop: '1.55rem' }}><b>VP Sector Lock Automation is Enabled</b></div>}
            {is_vpauto_enabled === false && is_Vp_Enabled && <div style={{ marginTop: '1.55rem' }}><b>VP Sector Lock Automation is Disabled</b></div>}
          </div>
        </div>
        <div className="Col Col-12 no-padding">
          {!isLoading && data && data.length > 0 ?
            <div className="row margin-top-bottom-10 justify-content-end">
              <div className="col-12 col-sm-6 col-md-6 no-padding justify-content-end" style={{display:'flex'}}> 
                {props.user.get('vendor_role') == 'PORTALADMIN' && <button type="button" 
                  className="u-floatRight"
                  onClick={(e) => onClickBulkDeleteUsers(e)} 
                  style={{ marginRight: "5px", 
                          color: "#FFFFFF", 
                          fontSize: "0.9rem", 
                          border: "1px solid black", 
                          width: '150px' }}
                  disabled={selectedRows.length === 0 || !isUserSelected}>
                    Bulk Delete
                </button>}
                {props.user.get('vendor_role') == 'PORTALADMIN' && <button type="button" className="Button--small u-floatRight"
                  onClick={(e) => onClickRecertifyUsers(e)} 
                  style={{ marginRight: "5px", color: "#FFFFFF", fontSize: "0.9rem", border: "1px solid black" }}
                  disabled={selectedRows.length === 0 || !isUserSelected}>
                    Recertify
                </button>}
                <input
                  style={{ borderRadius: "0rem", height: "32px", width: '300px' }}
                  placeholder="Search Any"
                  className="form-control title-div-style"
                  id="search-bar"
                  ref={search}
                  value={searchVal}
                  onChange={(e) => onSearchValueChange(e)}
                />
                 <a className="navbar-brand pointer" data-tip data-for="export to excel" >
                          <small>
                            <img
                              src={excel}
                              style={{ height: '30px', marginTop:"-5px", marginLeft:'8px' }}
                              onClick={()=> getExportToExcel()}
                            />
                          </small>
                        </a>
              </div>
            </div> : null}
        </div>
        <div className="Col Col-12 no-padding">
          <style>
            {`
                    .rt-resizable-header-content {
                        font-weight: 600;
                            color: #060606;
                            padding: 8px;
                    }
                    .ReactTable .rt-thead .rt-th.-sort-asc, .ReactTable .rt-thead .rt-td.-sort-asc {
                        box-shadow: inset 0 3px 0 0 rgb(2, 2, 2);
                    }
                    `}
          </style>
      {isLoading ? renderLoading() : 
          <ReactTable
            data={searchVal.length >= 3 && searchMatched === false ? [] : data}
            columns={columns}
            defaultPageSize={10}            
            className="-striped -highlight"
          />}
        </div>
      </div>
      <NotificationSystem ref={_notificationSystem} />
    </div>
  )
}

Users.propTypes = {
  market: PropTypes.string,
  submarket: PropTypes.string,
  getVendorList: PropTypes.func,
  getIvrVendorTech: PropTypes.func,
  getManagerInfoSubmarket: PropTypes.func,
  createUpdVendorTechCompany: PropTypes.func,
  deleteIvrUser: PropTypes.func,
  assignVendorTech: PropTypes.func,
  updateUser: PropTypes.func,
  deleteUser: PropTypes.func,
  activeDomains: PropTypes.func,
  reset: PropTypes.func,
  user: PropTypes.object,
  UsersList: PropTypes.object,
  isLoading: PropTypes.bool,
}
const UserHOC = connect( settingsForUser, { getVendorList, getIvrDetailsForVendor, unlinkUserFromVendorId, deleteUser, getIvrVendorTech, deleteIvrUser, getManagerInfoSubmarket, createUpdVendorTechCompany, assignVendorTech, updateUser, createUpdIvr, getCurrentIvrPin, fetchBuyerListDetails, activeDomains, getUserInfoLinked, ...formActions })(Users)

export default withUserHOC(UserHOC)
