import { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import Modal from './Layout/components/Modal'
import UserForm from './Users/components/UserForm'
import UpdateIVRDomains from './IVRDomains/components/UpdateIVRDomains'
import * as formActions from "./Forms/actions"
import * as UserActions from './Users/actions'
import { fetchBuyerListDetails } from './PreventiveMaintenance/actions';
import { getVendorListDef, deleteContactDef,getUserInfoLinkedDef } from './Users/schema'
import NotificationSystem from 'react-notification-system'
const withUserHOC = (OriginalComponent) => {
  class NewComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        showCreateModel: false,
        showUpdateModel: false,
        vendor_region: '',
        vendor_area:'',
        confirmDelete: false,
        vendor_id: 0,
        linkedDetails : null,
        createEsso: false
      }
      this.deleteObj = {}

    }

    intiateUserDelete = (row, extraInfo) => {

      let { user } = this.props;
      const deleteUser = extraInfo.deleteESSOUser ? row.data : row.original;
      const isPortalAdmin = deleteUser?.vendor_role === 'PORTALADMIN';

      this.refs.notificationSystem2.addNotification({
        title: 'Success',
        position: "br",
        level: 'success',
        autoDismiss: 2,
        message: "Please wait deleting user...",
      })
      this.props.deleteUser(user.get("email"), { query: deleteContactDef, variables: { contact_unid:extraInfo.deleteESSOUser?row.data.contact_unid:row.original.contact_unid } }).then(action => {

        if (!action || action && action.type !== "DELETE_USER_FAILURE") {


          if (action.response && action.response.data && action.response.data.deleteContact) {
            const successMessage = isPortalAdmin ? `User ${deleteUser.fname} ${deleteUser.lname} with PORTALADMIN role has been deleted successfully` : action.response.data.deleteContact.message;

            this.refs.notificationSystem2.addNotification({
              title: 'Success',
              position: "br",
              level: 'success',
              message: successMessage,
            })
            if(extraInfo && !extraInfo.deleteESSOUser){
              extraInfo.setSearchValue();
            }
            setTimeout(() => { extraInfo.onUserLoad() }, 2200)


            this.props.deleteIvrUser("S-iopvp", extraInfo.deleteESSOUser?row.data.userid:row.original.userid).then(action => {
              if (action.response && action.response.data && action.response.data.deleteIvrTechUser && action.response.data.deleteIvrTechUser.code == "200") {
                this.refs.notificationSystem2.addNotification({
                  title: 'Success',
                  position: "br",
                  level: 'success',
                  message: action.response.data.deleteIvrTechUser.message
                })
                setTimeout(() => { extraInfo.onUserLoad() }, 2200)

              }

            })
          } else {
            this.refs.notificationSystem2.addNotification({
              title: 'Error',
              position: "br",
              level: 'error',
              message: "Somthing went wrong!"
            })
          }

        }

        this.props.getVendorList(user.get("email"), { query: getVendorListDef, variables: { vendor_id: user.get("vendor_id") } })
        this.setState({ searchVal: "" });
      })
    }

    onClickDelete = (row, linkedUserDetail, extraInfo) => {
      this.deleteObj.row = row;
      this.deleteObj.linkedUserDetail = linkedUserDetail;
      this.deleteObj.extraInfo = extraInfo;
      this.setState({ confirmDelete: true })
    }

    
  getBuyerList = (extraInfo={}) => {
    let { user } = this.props;
    this.props.fetchBuyerListDetails(this.state.vendor_id, user.get("loginId"), _.isArray(this.state.vendor_area) ? this.state.vendor_area[0] : this.state.vendor_area, _.isArray(this.state.vendor_region) ? this.state.vendor_region[0] : this.state.vendor_region).then((action) => {
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
              this.setState({
                vendorAdminName: action.buyerListDetails.getBuyerList.fieldsList.feandmgrs[ind].fname + ' ' + action.buyerListDetails.getBuyerList.fieldsList.feandmgrs[ind].lname,
                vendorAdminPhone: action.buyerListDetails.getBuyerList.fieldsList.
                  feandmgrs[ind].contact
              })
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
        this.setState({ manager_emails: emails })
      }
    })
    Object.keys(extraInfo).length > 0 ? extraInfo.onUserLoad : null
  }

    onCreateUser = (sponsor_id, region, extraInfo, area) => {
      this.setState({ modelTitle: "Create User", buttonText: "Submit" })
      this.setState({
        userdata: {
          vendor_id: '',
          vendor_name: '',
          vendor_sponsor_id: '',
          vendor_category: '',
          vendor_area: '',
          vendor_region: '',
          vendor_service_email: '',
          vendor_phone: '',
          vendor_address: '',
          vendor_city: '',
          vendor_state: '',
          vendor_zip: '',
          vendor_peoplesoft_id: '',
          userid: '',
          fname: '',
          lname: '',
          name: '',
          phone: '',
          email: '',
          title: '',
          vendor_role: '',
          contact_unid: ''
        }
      })
      this.props.reset("UserForm")
      this.setState({ showCreateModel: true, createEsso :extraInfo.createEsso })
      this.setState({ ivr_access: "No Access" })
      this.setState({ vendor_sponsor_id: sponsor_id })
      this.setState({ vendor_region: region })
      this.setState({ vendor_area: area })
      this.setState({onUserLoad: extraInfo.onUserLoad})
      this.setState({ ...extraInfo }, () => {
        this.getBuyerList(extraInfo)
      })
    }

    onClickEdit = (row, linkedUserDetail, extraInfo) => {
      let modalDetails = {};
      this.setState({linkedDetails: linkedUserDetail});
      modalDetails.modelTitle = "Update User"
      modalDetails.buttonText = "Update"
      modalDetails.userdata =extraInfo.updateESSOUser?row.data:row.original
      modalDetails.vendor_sponsor_id =extraInfo.updateESSOUser?row.data.vendor_sponsor_id:row.original.vendor_sponsor_id
      let userId = ''
      if (row?.data?.userid) 
      { 
        userId = row.data.userid 
      }
      else if(row?.original?.userid){
        userId = row.original.userid 
      }

      if (linkedUserDetail) {
        this.props.getUserInfoLinked(this.props.user.get("login_id"), { query: getUserInfoLinkedDef, variables: { vendorEmail: extraInfo.updateESSOUser?row.data.email:row.original.email } }).then(inAction => {
          if (inAction && inAction.response && inAction.response.data && inAction.response.data.getUserInfoLinked && inAction.response.data.getUserInfoLinked.userinfo) {
            const vendorId = inAction.response.data.getUserInfoLinked.userinfo.VENDOR_ID;
            let hasParentIvrAccessInUpdate = false;
            this.props.getIvrVendorTech("S-iopvp", vendorId).then((action) => {
              if (action.type === 'GET_IVR_VENDOR_TECH_LIST_SUCCESS') {
                if (action.response.data.getVendorTechForVendorId && action.response.data.getVendorTechForVendorId.data.length > 0) {
                  hasParentIvrAccessInUpdate = action.response.data.getVendorTechForVendorId.data.find(tech => tech.SUBMARKET_COUNT > 0 && tech.USERID === inAction.response.data.getUserInfoLinked.userinfo.OPSTRACKER_USERID);
                }
              }
              modalDetails.hasParentIvrAccessInUpdate = !!hasParentIvrAccessInUpdate
              modalDetails.isLinkedUser = true
              modalDetails.linkedVendorId = linkedUserDetail.linkedVendorId
              modalDetails.showCreateModel = true
              modalDetails.linkedUserInParent = linkedUserDetail.loggedInVendorId === linkedUserDetail.linkedParentVendorId
              if(extraInfo.updateESSOUser){
                modalDetails.showUpdateModel = true;
                modalDetails.showCreateModel=false;
               }else{
                modalDetails.showCreateModel=true;
                modalDetails.showUpdateModel = false;
               }
                           this.setState({ ...extraInfo }, () => {
                this.getBuyerList()
              })
        
              this.setState({ ...modalDetails })
                          })
          }
        });
      } else {
        modalDetails.isLinkedUser = false
        modalDetails.linkedUserInParent = false
        modalDetails.hasParentIvrAccessInUpdate = false
        if (extraInfo.ivrTechdata && extraInfo.ivrTechdata.length > 0) {
          for (let j = 0; j < extraInfo.ivrTechdata.length; j++) {
            if (userId == extraInfo.ivrTechdata[j].USERID) {
              if (extraInfo.ivrTechdata[j].ACCTLOCKEDIND == 0) {
                modalDetails.ivr_access = "Enabled"
              } else if (extraInfo.ivrTechdata[j].ACCTLOCKEDIND == 1) {
                modalDetails.ivr_access = "Disabled"
              }
            }
          }
        }

          extraInfo.updateESSOUser?modalDetails.showUpdateModel = true:modalDetails.showCreateModel=true;
          this.setState({ ...extraInfo }, () => {
            this.getBuyerList()
          })
    
          this.setState({ ...modalDetails })
      }

    }

    hideCreateEditEventModal = () => {
      this.setState({ showCreateModel: false, showUpdateModel: false })
      this.setState({ modelTitle: "Create User", buttonText: "Submit" })
      this.setState({ ivr_access: "No Access" })
      this.setState({
        userdata: {
          vendor_id: '',
          vendor_name: '',
          vendor_sponsor_id: '',
          vendor_category: '',
          vendor_area: '',
          vendor_region: '',
          vendor_service_email: '',
          vendor_phone: '',
          vendor_address: '',
          vendor_city: '',
          vendor_state: '',
          vendor_zip: '',
          vendor_peoplesoft_id: '',
          userid: '',
          fname: '',
          lname: '',
          name: '',
          phone: '',
          email: '',
          title: '',
          vendor_role: '',
          contact_unid: ''
        }
      })
      this.props.reset("UserForm")
      let { user } = this.props
      this.props.getVendorList(user.get("email"), { query: getVendorListDef, variables: { vendor_id: this.state.vendor_id?.length>0?this.state.vendor_id:user.get("vendor_id") } })
      this.props.getIvrVendorTech("S-iopvp", this.state.vendor_id?.length>0?this.state.vendor_id:user.get("vendor_id")).then((action) => {
        if (action.type === 'GET_IVR_VENDOR_TECH_LIST_SUCCESS') {
          if (action.response.data.getVendorTechForVendorId && action.response.data.getVendorTechForVendorId.data.length > 0) {
            let ivrData = []
            for (let i = 0; i < action.response.data.getVendorTechForVendorId.data.length; i++) {
              ivrData.push(action.response.data.getVendorTechForVendorId.data[i])
            }
            this.setState({ ivrTechdata: ivrData })
          }
        }
      })
      this.state.onUserLoad() 
    }

    renderCreateUserModel() {
      let { userdata, createEsso, modelTitle, buttonText, ivr_access, linkedDetails, vendor_sponsor_id, vendor_region, manager_emails, vendorAdminName, vendorAdminPhone, userReg, isLinkedUser, hasParentIvrAccessInUpdate, linkedUserInParent, modalDetails, onUserLoad, setSearchValue } = this.state
      let { user } = this.props
      return (
        <Modal large title={modelTitle} handleHideModal={() => {
          this.setState({ showCreateModel: false })
        }}
          style={{ display: "block", marginTop: "30px" }}>
          <UserForm user={user} onUserLoad={onUserLoad} setSearchValue={setSearchValue} createEsso={createEsso} selectedvendor_id={this.state.vendor_id} createCompany={this.state.companyInfo} userdata={userdata} handleHideModal={this.hideCreateEditEventModal} notificationSystem={this.refs.notificationSystem2} vendorAdminName={vendorAdminName} vendorAdminPhone={vendorAdminPhone} userReg={userReg}
            buttonText={buttonText} ivr_access={ivr_access} vendor_sponsor_id={vendor_sponsor_id} vendor_region={vendor_region} manager_emails={manager_emails}
            isLinkedUser={isLinkedUser} linkedDetails={linkedDetails} linkedUserId={this.state.linkedUserId} linkedVendorId={this.state.linkedVendorId} hasParentIvrAccessInUpdate={hasParentIvrAccessInUpdate} linkedUserInParent={linkedUserInParent} />
        </Modal>)
    }


    renderUpdateUserModel() {
      let { userdata, modelTitle, buttonText, ivr_access, linkedDetails, vendor_sponsor_id, vendor_region, linkedUserId, companyInfo, manager_emails, vendorAdminName, linkedVendorId, vendorAdminPhone, userReg, isLinkedUser, hasParentIvrAccessInUpdate, linkedUserInParent } = this.state;
      let { user } = this.props;

    return (
      <Modal large title={modelTitle} handleHideModal={this.hideCreateEditEventModal}
        style={{ display: "block", marginTop: "30px" }}>
        <UpdateIVRDomains updateESSOUser={true} user={user} vendor_id={this.state.vendor_id} userInfo={user} createCompany={companyInfo} userdata={userdata} handleHideModal={this.hideCreateEditEventModal} notificationSystem={this.refs.notificationSystem2} vendorAdminName={vendorAdminName} vendorAdminPhone={vendorAdminPhone} userReg={userReg}
          buttonText={buttonText} ivr_access={ivr_access} vendor_sponsor_id={vendor_sponsor_id} vendor_region={vendor_region} manager_emails={manager_emails} onUserLoad={this.state.onUserLoad}
          isLinkedUser={isLinkedUser} linkedUserId={linkedUserId} linkedDetails={linkedDetails} linkedVendorId={linkedVendorId} hasParentIvrAccessInUpdate={hasParentIvrAccessInUpdate} linkedUserInParent={linkedUserInParent} />
      </Modal>)
    }
  renderdeletePopUp(){
      const { row } = this.deleteObj;
      const user = row?.original || row?.data;
      const isPortalAdmin = user?.vendor_role === 'PORTALADMIN';
      const deleteMessage = isPortalAdmin  ? `Are you sure you want to delete ${user.fname} ${user.lname} with PORTALADMIN role?` : 'Are you sure you want to Delete?';
      return(
      <Modal large title="Delete User Confirmation" handleHideModal={()=>{this.setState({confirmDelete:false})}}
      style={{ width: "70%", maxWidth: "70%", display: "block", marginTop: "30px" }}>
        <p style={{fontSize:"1.4rem"}}>{deleteMessage}</p>
        <button style={{ fontSize: "0.8rem",marginRight:"0.35rem" }} onClick={()=>this.deleteUser()}>YES</button>
        <button style={{ fontSize: "0.8rem" }} onClick={()=>this.setState({confirmDelete:false})}>NO</button>
      </Modal>)
    }

    deleteUser = () => {
      const { row, linkedUserDetail, extraInfo } = this.deleteObj
      if (linkedUserDetail) {
        const { user } = this.props
        let loginId = user.get('login_id');
        let linkedUserId = linkedUserDetail.linkedUserId;
        this.props.unlinkUserFromVendorId(loginId, linkedUserId).then(action => {
          if (action && action.type === "UNLINK_USER_FROM_VENDOR_ID_SUCCESS") {
            this.intiateUserDelete(row, extraInfo);
          } else {
            this.setState({ isUnlinkUserLoading: false, showUnlinkUserModal: false })
            this.refs.notificationSystem2.addNotification({
              title: 'error',
              position: "tc",
              level: 'error',
              message: "Unable to unlink the user!"
            })
          }
        })
      } else {
        this.intiateUserDelete(row, extraInfo);
      }
      this.setState({ confirmDelete: false })
    }

    

    render() {
            return (
        <React.Fragment>
          {this.state.confirmDelete ? this.renderdeletePopUp() : null}
          <OriginalComponent onclickEdit={this.onClickEdit} deleteObj={this.deleteObj} intiateUserDelete={this.intiateUserDelete} onCreateUser={this.onCreateUser} onClickDelete={this.onClickDelete} renderdeletePopUp={this.renderdeletePopUp} formData={this.state} />
          {this.state.showCreateModel ? this.renderCreateUserModel() : null}
          {this.state.showUpdateModel ? this.renderUpdateUserModel() : null}
          <NotificationSystem ref="notificationSystem2" />
        </React.Fragment>
      )
    }
  }

  function stateToProps(state) {
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
    return {
      user,
    }
  }
  return connect(stateToProps, { fetchBuyerListDetails, ...UserActions, ...formActions })(NewComponent);
}
export default withUserHOC;