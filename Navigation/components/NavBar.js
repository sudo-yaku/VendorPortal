import React from 'react'
import PropTypes from 'prop-types'
import VerizonLogo from '../../Images/VerizonNewLogo2.png'
import CloseIcon from '../../Images/close-alt.svg'
import UserDropdown from './UserDropdown'
import { connect } from 'react-redux'
import * as userUtils from '../../Users/utils'
import { getHost } from '../../http_utils'
import { Map, List, fromJS } from 'immutable'
import { saveFavoriteSubMarket } from '../../Users/schema'
import ajax from '../../ajax'
import './nav.css'
import config from '../../config'
import { getVendorListDef } from '../../Users/schema'
import { getVendorList, switchMarket, logout, makemeUser, getUserIVRDetails,initialNavbarLoadRequest, toggleVendorDeactivateBannerReducer } from '../../Users/actions'
import { logoutQuery } from '../../Users/schema'
import { deleteCookie } from '../../http_utils'
import { Link } from 'react-router-dom'
import Modal from "../../Layout/components/Modal"
import moment from 'moment'
import Reporter from './../../VendorDashboard/components/Reporter'
import { fetchFileData, fetchBannerDetails, fetchTrainingMaterial, setVideoSelection, getPOInvoiceSites } from './../../PreventiveMaintenance/actions'
import ReactTooltip from 'react-tooltip'
import { findDOMNode } from 'react-dom'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils'
import POInvoiceBanner from '../../PreventiveMaintenance/components/POInvoiceBanner'
import store from '../../store'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { disconnectSocket } from '../../AppNotification/socket-client'
import { withRouter } from '../../withRouter'

var NotificationSystem = require('react-notification-system')

class NavBar extends React.Component {

  state = {
    dflt_vendorId: '', trainingDoc: [], trainingVideo: [], groupVendors: null, currCmpDetails: null
    , showLinkedInfo: false, defaultVendor: null, linkedVendor: null, linkedVendorCopy: null,
  }

  constructor() {
    super()
    this.state = { isVWOIssueReportModalShown: false, userInfoForFP: {}, bannerOpen: true, isModalshown: false, isVendorDeactivatedBanner: true, vendorDisabledDate: '', isCompanyProfileVisible: true, isPendingCertification: false, pendingCertificationCount: 0, isUserPendingCertification: false, quarterEndDate: '' }
    this.announcementStyle = null
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem
    let { user } = this.props
    this.props.initialNavbarLoadRequest(true)
    if(this.props.navbarloaded){
      this.setState({bannerOpen:false})
    }
    if (user && user.get("email") && user.get('wno_user') != 'Y') {
        this.props.getVendorList(user.get("email"), { query: getVendorListDef, variables: { vendor_id: user.get("vendor_id") } })
        this.props.fetchBannerDetails(user.get("userid"), user.get("vendor_id"))
        this.props.getPOInvoiceSites(user.get("vendor_id"))
    }
    this.checkIsVendorDisabled(user);
    window.addEventListener('beforeunload', () => {
      disconnectSocket()
    })
  }

  checkIsVendorDisabled(user) {
    let vendorId = user.get("vendor_id"),
        isVendorDeactivatedBanner = false,
        newVendorDisabledDate = '',
        isCompanyProfileVisible= true,
        isPendingCertification = false,
        pendingCertificationCount = 0,
        isUserPendingCertification = false,
        usersList = this.props.UsersList ? this.props.UsersList.toJS() : [];
    const quarterEndMonths = [3, 6, 9, 12]; // End months for each quarter
    const isQuarterEnd = quarterEndMonths.includes(new Date().getMonth() + 1);

    if (user && user.get("group_vendors") && user.get("group_vendors").size > 0) {
        let group_vendors = user.get("group_vendors").toJS();
        let vendor = group_vendors.find(v => v.vendor_id == vendorId);

        if (vendor && vendor.is_vendor_disabled === 'Y') {
            isVendorDeactivatedBanner = true;
            isCompanyProfileVisible = false;
            newVendorDisabledDate = user.get("need_to_delete_date") ? moment(user.get("need_to_delete_date")).format('DD/MMM/YYYY') : '';
        }
    } else {
        if (vendorId && user.get("is_vendor_disabled") === 'Y') {
            isVendorDeactivatedBanner = true;
            isCompanyProfileVisible = false;
            newVendorDisabledDate = user.get("need_to_delete_date") ? moment(user.get("need_to_delete_date")).format('DD/MMM/YYYY') : '';
        }
    }
    if(usersList.length > 0 && user.get("vendor_role") === 'PORTALADMIN') {
      let pendingCertUsers = usersList.filter(u => u.user_status !== "Active");
      if(pendingCertUsers.length > 0) {
        isPendingCertification = true;
        pendingCertificationCount = pendingCertUsers.length;
      }
    }

    if(user.get("user_status") !== "Active" && user.get("user_status") !== null && user.get("vendor_role") === 'PORTALUSER' && isQuarterEnd) {
      const quarterEndDate = this.getQuarterEndDate();
      this.setState({ quarterEndDate: moment(quarterEndDate).format('DD-MMM-YYYY') });
      isUserPendingCertification = true;
    }

    if (
        this.state.isVendorDeactivatedBanner !== isVendorDeactivatedBanner ||
        this.state.vendorDisabledDate !== newVendorDisabledDate ||
        this.state.isCompanyProfileVisible !== isCompanyProfileVisible
    ) {
        this.props.toggleVendorDeactivateBannerReducer(isVendorDeactivatedBanner);
        this.setState({
            isVendorDeactivatedBanner,
            vendorDisabledDate: newVendorDisabledDate,
            isCompanyProfileVisible
        });
    }

    if(this.state.isPendingCertification !== isPendingCertification || 
      this.state.pendingCertificationCount !== pendingCertificationCount ||
    this.state.isUserPendingCertification !== isUserPendingCertification) {
      this.setState({isPendingCertification, pendingCertificationCount, isUserPendingCertification});
    }
}

getQuarterEndDate = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-based, so add 1
  const quarterEndMonths = [3, 6, 9, 12]; // End months for each quarter

  // Find the quarter end month based on the current month
  const quarterEndMonth = quarterEndMonths.find(month => currentMonth <= month);

  // Get the last date of the quarter end month
  return new Date(currentDate.getFullYear(), quarterEndMonth, 0);
};

  formGroupVendors = () => {
    let groupVendors = this.props.currCmpDetails && this.props.currCmpDetails.data && this.props.currCmpDetails.data.companies.length > 0 ? this.props.currCmpDetails.data.companies : null
    let currCmpDetails = this.props.currCmpDetails && this.props.currCmpDetails.data && this.props.currCmpDetails.data.users.length > 0 ? this.props.currCmpDetails.data.users[0] : null
    groupVendors = groupVendors ? groupVendors.map(val => ({
      vendor_area: val.VENDOR_AREA ? val.VENDOR_AREA : '',
      vendor_category: val.VENDOR_CATEGORY ? val.VENDOR_CATEGORY : '',
      vendor_id: val.VENDOR_ID,
      vendor_name: val.VENDOR_NAME,
      vendor_pricing_macro_ant_tow: "0",
      vendor_region: val.VENDOR_REGION,
      vendor_unid: val.VENDOR_UUID ? val.VENDOR_UUID : '',
      is_vpauto_enabled :  val.IS_VPAUTO_ENABLED ? val.IS_VPAUTO_ENABLED : "",
      is_vendor_disabled : val.IS_VENDOR_DISABLED ? val.IS_VENDOR_DISABLED : ""
    })) : []
    let defaultVendor = this.props.currUser ? this.props.currUser.toJS() : ''
    let linkedVendor = groupVendors && currCmpDetails && groupVendors.find(v => v.vendor_id == currCmpDetails.LINKED_VENDOR_ID) ? groupVendors.find(v => v.vendor_id == currCmpDetails.LINKED_VENDOR_ID) : ''
    this.setState({ groupVendors, currCmpDetails, defaultVendor, linkedVendor, linkedVendorCopy: linkedVendor })
  }

  componentDidUpdate(prevProps, prevState) {
    let { user, loginId } = this.props
    if (prevProps.loginId !== loginId && user?.get('wno_user') != 'Y') {
      this.props.getUserIVRDetails(loginId)
    }
    if (this.props.vendorId && this.props.vendorId !== prevProps.vendorId && user?.get('wno_user') != 'Y') {
      this.props.getPOInvoiceSites(user.get("vendor_id"))
    }
    if (user.get("email") && user.get("email") !== prevProps.user.get("email")) {
      if(user.get('wno_user') != 'Y') {
        this.props.getVendorList(user.get("email"), { query: getVendorListDef, variables: { vendor_id: user.get("vendor_id") } })
      }
      let group_vendors = this.props.user.get('group_vendors')

      let vendor_data = group_vendors ? group_vendors.toJS() : null
      let region = vendor_data && vendor_data.find(v => user.get("vendor_id") == v.vendor_id) ? vendor_data.find(v => user.get("vendor_id") == v.vendor_id).vendor_region : ''
      let vendor_id = vendor_data && vendor_data.find(v => user.get("vendor_id") == v.vendor_id) ? vendor_data.find(v => user.get("vendor_id") == v.vendor_id).vendor_id : ''
      let userInfoForFP = user.toJS()
      if (vendor_data) {
        for (let i = 0; i < vendor_data.length; i++) {
          if (vendor_data[i].vendor_region == region && vendor_data[i].vendor_id == vendor_id) {
            userInfoForFP["vendor_region"] = vendor_data[i].vendor_region
            userInfoForFP["vendor_area"] = vendor_data[i].vendor_area
            userInfoForFP["vendor_id"] = vendor_data[i].vendor_id
            userInfoForFP["vendor_name"] = vendor_data[i].vendor_name
            userInfoForFP["vendor_category"] = vendor_data[i].vendor_category
            userInfoForFP["vendor_unid"] = vendor_data[i].vendor_unid
            //userInfoForFP["vendor_pricing_macro_ant_tow"] = vendor_data[i].vendor_pricing_macro_ant_tow
          }
        }
      }

      this.setState({ dflt_vendorId: user.get("default_vendor_id"), userInfoForFP })
    }
    if (JSON.stringify(prevProps.currCmpDetails) != JSON.stringify(this.props.currCmpDetails)) {
      this.formGroupVendors()
    }
    let elem = findDOMNode(this.refs.announcement)
    if (elem) {
      let x_val = elem.getBoundingClientRect().x
      this.announcementStyle = { transform: `translate(${x_val - 600}px, 50px` }
    }    

    if (prevProps.user !== this.props.user || prevProps.UsersList !== this.props.UsersList) {
      this.checkIsVendorDisabled(this.props.user);
    }

  }


  getBreadcrumbExcludes() {
    const common = []
    return common
  }

  subMarketList = () => {
    const { currUser } = this.props
    let group_vendors = this.state.showLinkedInfo ? fromJS(this.state.groupVendors) : currUser.get('group_vendors')
    let vendor_data = group_vendors ? group_vendors.toJS() : null
    let optionsSubMarket = []
    vendor_data.sort(function (a, b) {
      const subMarketA = a.vendor_region.toUpperCase(); // ignore upper and lowercase
      const subMarketB = b.vendor_region.toUpperCase(); // ignore upper and lowercase
      if (subMarketA < subMarketB) {
        return -1;
      }
      if (subMarketA > subMarketB) {
        return 1;
      }
      return 0;
    });
    if (vendor_data && vendor_data.length > 0) {
      for (let i = 0; i < vendor_data.length; i++) {
        if(vendor_data[i].is_vendor_disabled == 'N' || currUser.get('need_to_delete_date') && currUser.get('need_to_delete_date') !== null) {
          optionsSubMarket.push(
            <li key={i}>
              <a
                data-tip data-for={`submarket-vendor-category-${i + 1}`}
                onClick={e => this.onSubMarketChange(e, vendor_data[i].vendor_region, vendor_data[i].vendor_id)}
                className="subnav-vendor-dash"
                style={{ cursor: 'pointer', padding: '10px', fontSize: '1em', textAlign: "left", color: "black" }}>
                {this.state.dflt_vendorId == vendor_data[i].vendor_id ? <span style={{ color: "red", float: 'left' }}>*</span> : null}
                <span style={{ color: currUser.get('vendor_id') == vendor_data[i].vendor_id ? "red" : "black" }}>{vendor_data[i].vendor_region}-{vendor_data[i].vendor_id}</span>
              </a>
              <ReactTooltip id={`submarket-vendor-category-${i + 1}`} place="top" effect="float">
                <div style={{paddingBottom:"4px"}}>{vendor_data[i].vendor_category}</div>
              </ReactTooltip>
            </li>
          )
        }
      }
    }
    return optionsSubMarket
  }

  onSubMarketChange = (e, region, vendor_id, isVendorChanged) => {
    let { currUser } = this.props
    this.checkIsVendorDisabled(currUser);
    const input = {
      "subMarketInfo": {
        "FAVORITE_SUBMARKET": currUser && currUser.toJS() && currUser.toJS().favoriteSubMarket,
        "LAST_ACCESSED_SUBMARKET": region + '-' + vendor_id,
        "OPSTRACKER_USERID": this.props.loginId
      }
    }
    ajax.post(`/graphql4g`, { query: saveFavoriteSubMarket, variables: { input } })
    const { switchMarket } = this.props
    let user = this.props.user.toJS()
    let default_region = this.props.user.get("vendor_region")
    let default_vendorId = this.props.user.get("vendor_id")
    let defaultVendor = this.props.initUser ? this.props.initUser.toJS() : ''
    let group_vendors = this.state.showLinkedInfo ? this.state.groupVendors : defaultVendor.group_vendors
    let vendor_data = group_vendors.length > 0 ? group_vendors : []
    if (default_region != region || default_vendorId != vendor_id) {
      for (let i = 0; i < vendor_data.length; i++) {
        if (vendor_data[i].vendor_region == region && vendor_data[i].vendor_id == vendor_id) {
          user["vendor_region"] = vendor_data[i].vendor_region
          user["vendor_area"] = vendor_data[i].vendor_area
          user["vendor_id"] = vendor_data[i].vendor_id
          user["vendor_name"] = vendor_data[i].vendor_name
          user["vendor_category"] = vendor_data[i].vendor_category
          user["vendor_unid"] = vendor_data[i].vendor_unid
          user["vendor_pricing_macro_ant_tow"] = vendor_data[i].vendor_pricing_macro_ant_tow
          user["vendor_pricing_small_cell"] = vendor_data[i].vendor_pricing_small_cell
          user["incentive_eligible"] = vendor_data[i].incentive_eligible
          user["is_vpauto_enabled"] = vendor_data[i].is_vpauto_enabled
          user["is_pricing_matrix"] = vendor_data[i].is_pricing_matrix
        }
      }
      this.setState({ userInfoForFP: user, linkedVendor: user, defaultVendor: this.props.initUser ? this.props.initUser.toJS() : null });
      if (isVendorChanged) {
        if (user.vendor_role === 'PORTALADMIN' && !user.roleChanged) {
          user.vendor_role = 'PORTALUSER';
          user.roleChanged = true;
        } else if (user.roleChanged && user.vendor_role === 'PORTALUSER') {
          user.vendor_role = 'PORTALADMIN';
          user.roleChanged = false;
        }
      }
      switchMarket(user);
      this.props.navigate(userUtils.getHomePath(store.getState()))
    }
  }

  showVWOIssueReportModal = () => {
    this.setState({ isVWOIssueReportModalShown: true })
  }
  openModal = () => this.setState({ isModalshown: true })
  handleHideModal = () => this.setState({ isModalshown: false })

  renderModal() {
    let sites = this.props.receivedSites.receivedSitesData.map(s =>
    ({
      ...s,
      DUE_DATE: s.DUE_DATE ? moment.utc(s.DUE_DATE).format('YYYY-MM-DD') : '',
      START_DATE: s.START_DATE ? moment.utc(s.START_DATE).format('YYYY-MM-DD') : '',
      COMPLETED_DATE: s.COMPLETED_DATE ? moment.utc(s.COMPLETED_DATE).format('YYYY-MM-DD') : '',
    })
    )
    return (
      <Modal title="PO Invoice Reminder" handleHideModal={this.handleHideModal}
        style={{ width: "95%", maxWidth: "95%", display: "block", marginTop: "30px" }}>
        <b className="text-align-left">The lines on the POs below have been received by Verizon, Please follow your BAU process to submit the invoice. </b><br />
        <POInvoiceBanner sites={sites} />
      </Modal>
    )
  }
  hideVWOIssueReportModal = () => {
    this.setState({ isVWOIssueReportModalShown: false })
  }
  renderVWOIssueReportModal = () => {
    return (
      <Modal title="Issue Report" handleHideModal={this.hideVWOIssueReportModal} style={{ width: "70%", maxWidth: "97%", top: "25%" }}>
        <Reporter notifref={this._notificationSystem} />
      </Modal>)
  }
  handleLinkClick = (curId) => {
    const { loginId, vendorId } = this.props
    this.props.setVideoSelection(vendorId, loginId, curId)
  }
  goUserDashboard = (navigate) => {
    const { user, path, UsersList, logout, realLoginId, loginId } = this.props

    if (path === config.filepath + 'logged-out' || path === config.filepath + 'login') {
      window.location = getHost()
    } else {
      this.props.makemeUser(this.props.user ? this.props.user.toJS() : {})
      navigate(config.filepath + 'userdashboard')
    }
  }
  swapVendComp = () => {
    let currCmpDetails = this.props.currCmpDetails && this.props.currCmpDetails.data && this.props.currCmpDetails.data.users.length > 0 ? this.props.currCmpDetails.data.users[0] : null
    let defaultVendor = this.props.initUser ? this.props.initUser.toJS() : ''

    let linkedVendor = this.state.groupVendors && this.state.groupVendors.find(v => v.vendor_id == currCmpDetails.LINKED_VENDOR_ID) ? this.state.groupVendors.find(v => v.vendor_id == currCmpDetails.LINKED_VENDOR_ID) : ''
    this.setState({ defaultVendor: defaultVendor, linkedVendor }, async () => {
      await this.setState({ showLinkedInfo: !this.state.showLinkedInfo })
      let linkedVendor = this.state.groupVendors && this.state.groupVendors.find(v => v.vendor_id == currCmpDetails.LINKED_VENDOR_ID) ? this.state.groupVendors.find(v => v.vendor_id == currCmpDetails.LINKED_VENDOR_ID) : ''
      let region = this.state.showLinkedInfo ? this.state.linkedVendor.vendor_region : this.state.defaultVendor.vendor_region
      let vendorId = this.state.showLinkedInfo ? this.state.linkedVendor.vendor_id : this.state.defaultVendor.vendor_id
      let defaultVendor = this.props.initUser ? this.props.initUser.toJS() : ''
      await this.onSubMarketChange({}, region, vendorId, true)
      await this.setState({ linkedVendor, defaultVendor })
    })

  }

  getGeneratorReportMenu = () => {
    return <div className="subnav">
        <button className="subnavbtn">
          <li>
            <Link to={config.filepath + "genFuelReport"} style={{ color: this.props.path == '/genFuelReport' ? '#D52B1E' : null }}>
              Report Management
            </Link>
          </li>
        </button>
        <div className="subnav-content" style={{ height: "38px" }}>
          <li>
            <Link to={config.filepath + "genFuelReport"} style={{ color: this.props.path == '/genFuelReport' ? '#D52B1E' : null, marginTop: "2px" }}>
              Generator Fuel Report
            </Link>
          </li>
          {this.props.generatorVendorFlag === "YES" ? <li>
            <Link to={config.filepath + "genRunReport"} style={{ color: this.props.path == '/genRunReport' ? '#D52B1E' : null, marginTop: "2px" }}>
              Generator Run Report
            </Link>
          </li> 
          : null}
          <li>
            <Link to={config.filepath + "genRunAlarms"} style={{ color: this.props.path == '/genRunAlarms' ? '#D52B1E' : null, marginTop: "2px" }}>
              Active Gen Run Alarms
            </Link>
          </li>
        </div>
      </div>
  }
  render() {
    const { user, path, UsersList, logout, realLoginId, loginId, currUser, receivedSites, makeMeUserOffshore } = this.props
    let data = (UsersList && UsersList.toJS() && (UsersList.toJS().length > 0)) ? UsersList.toJS() : []
  
    const onLogout = function (navigate) {
      logout(logoutQuery)
      deleteCookie('IOP_LITE_AUTH')
      deleteCookie('IOP_LITE_AUTH_ERROR')
      navigate(config.filepath + 'logged-out')
    }

    let wno_user = user && user.toJS() && user.toJS().wno_user;
    // if user has login_id, show user dropdown

    const userDropdown = (currUser.get('login_id') || currUser.get('userid')) && path !== '/login' ? <UserDropdown user={currUser} /> : null
    const loginButton = path === config.filepath + 'login' ? null : <button onClick={() => this.props.navigate(config.filepath + 'login')} className="Button--secondary u-floatRight" style={{ marginTop: "8px" }}>Login</button>
    // use user dropdown if we have user, else show login button
    // const authElement = userDropdown || loginButton
    // const newNotes = newReleaseNotes()
    let isissoUser = user ? user.get('isssouser') : ''
        let ssoUrl = user ? user.get('ssoLogoutURL') : ''
    let useBreadcrumbs = this.props.routes && this.props.params
    this.props.routes && this.props.routes.forEach(route => {
      if (route.props.path === "login" || route.props.path === "logged-out") {
        useBreadcrumbs = false
      }
    })
    let group_vendors = currUser.get('group_vendors')
    let vendor_data = group_vendors ? group_vendors.toJS() : null
    const params = { ...this.props.params }
    // let tempRoutes = JSON.parse(JSON.stringify(this.props.routes))
    // const breadcrumbs = useBreadcrumbs ? (
    //   <Breadcrumbs
    //     {...this.props}
    //     excludes={this.getBreadcrumbExcludes()}
    //     routes={tempRoutes}
    //     params={params}
    //   />
    // ) : null

    let isUserOffShore = false;
    if (user && user.toJS() && user.toJS().isUserOffShore) {
      isUserOffShore = user.toJS().isUserOffShore
    }

   
    let issoCondition = true
    if ((realLoginId && loginId && realLoginId == loginId && isissoUser && ssoUrl && ssoUrl.includes('ssologin')) || isUserOffShore == 'true') {
      issoCondition = false
    }
    //dispatch action on make me user to enable the tabs
    if (isUserOffShore == 'true'){
      if (makeMeUserOffshore && makeMeUserOffshore.get('makeMeUserForOffshoreUser') == true) {
        issoCondition = true
      } else {
        issoCondition = false
      }
    }
    let { linkedVendor, defaultVendor } = this.state

    const goHome = function (navigate) {
      if (path === config.filepath + 'logged-out' || path === config.filepath + 'login') {
        window.location = getHost()
      } else {
        if (user && user.get('vendor_category') == 'Nest Evaluation') {
          navigate(config.filepath + 'nestEvaluation')
        } else {
          navigate(config.filepath + 'dashboard')
        }
      }
    }
    return (
      <div>
        {this.state.isVWOIssueReportModalShown == true ? this.renderVWOIssueReportModal() : null}
        {this.state.isModalshown ? this.renderModal() : null}

        <div id="navbar" className="Grid" style={{ "borderBottom": "1px solid rgb(216, 218, 218)", "overflow": "hidden", "position": "fixed", "top": "0", "width": "100%", "zIndex": "333", "background": "#FFF", "left": "8px", "padding": "0rem 1.5rem", }}>

          <div className="Grid" style={{ width: "100%" }}>
            <div className="Col Col-2" >
            <a onClick={()=>goHome(this.props.navigate)} className="navbar-brand pointer float-left">
                <small>
                  <img style={{height: '25px'}} src={VerizonLogo} />
                </small>
              </a>
            </div>

            <div className="col col-8">
              {realLoginId && loginId && realLoginId != loginId && <div className="text-center">
                <span>Logged in as: <b>{currUser ? currUser.get('fname') + ' ' + currUser.get('lname') + ' - ' + currUser.get('vendor_name') : ''}</b>
                    <a className="d-inline pl-3" onClick={()=>this.goUserDashboard(this.props.navigate)} style={{ "cursor": "pointer" }}>
                    reset
                  </a>
                </span>
                
              </div>}
              {issoCondition && <div className="Col Col-12" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", lineHeight: 'normal', marginTop: '5px', fontSize: '0.8rem' }}>
                {userDropdown && receivedSites && receivedSites.count > 0 && <span className="Col-12 text-center">
                    <b>PO Invoice Reminder:</b>&nbsp;
                    <a className="subnavbtn" style={{ cursor: 'pointer', color: "red" }} onClick={this.openModal}><strong>{receivedSites.count}</strong>
                    </a>
                  </span>}
                  
                {userDropdown && this.state.isPendingCertification && (
                    
                    <div className='Col-12 text-center banner_div'>
                      <p className='banner_text'>
                        {'  ' + `Action required: ${this.state.pendingCertificationCount} users must complete quarterly recertification by month-end or risk access removal.`}
                      </p>
                      <button
                        className='banner_close_icon'
                        onClick={() => this.setState({ isPendingCertification: false })}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                  </div>
                  )}
                  {userDropdown && this.state.isUserPendingCertification && (
                    
                    <div className='Col-12 text-center banner_div'>
                      <p className='banner_text'>
                        {'  ' + `Your quarterly user recertification is due on ${this.state.quarterEndDate}. Please contact your Portal Admin for recertification.`}
                      </p>
                      <button
                        className='banner_close_icon'
                        onClick={() => this.setState({ isUserPendingCertification: false })} aria-label="Close"
                      >
                        &times;
                      </button>
                  </div>
                  )}
                {userDropdown && this.state.isVendorDeactivatedBanner && (
                    
                    <div className='Col-12 text-center banner_div' >
                      <p  className='banner_text'>
                        {'  ' + `Your company has been set to inactive in the system. You have until ${this.state.vendorDisabledDate}
                          to submit quotes in the Quote Pending status and invoices in Work Pending status if the work has been completed.`}
                      </p>
                      <button
                        className='banner_close_icon'
                        onClick={() => this.setState({ isVendorDeactivatedBanner: false })}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                  </div>
                  )}
                {!this.props.showRmaBanner && <>
                  {this.props.OemAeRmaCount >= 1 && <div className="text-center" style={{ marginTop: "5px" }}>
                    <span style={{ color: "red", fontWeight: "bold" }}>
                      You have {this.props.OemAeRmaCount} RMAs shipped, please ensure the part is scanned on time (within 7 business days of the shipped date)
                    </span>
                  </div>}
                  {this.props.fslDCRmaCount >= 1 && <div className="text-center" style={{ marginTop: "5px" }}>
                    <span style={{ color: "red", fontWeight: "bold" }}>
                      You have {this.props.fslDCRmaCount} RMAs delivered, please ensure the part is scanned on time (within 5 business days of the delivered date)
                    </span>
                  </div>}
                  {this.props.pendingWorkOrdersCount > 0 && <div className="Col-12 text-center" style={{ marginTop: "5px" }}>
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        You have {this.props.pendingWorkOrdersCount} unscheduled work orders or expired schedules, please check
                      </span>
                    </div>}
                </>}
              </div>}
            </div>
            {/* <div className="Col Col-2">
              <div className="user_dropdown">
                <a className="user_container" href="#">
                  <div style={{margin: '5px'}}>
                    <span style={{fontSize: '1.3em'}}> {currUser.get('fname')} </span>
                  </div>
                  <div style={{fontSize: '5px'}}>
                    <img id="avatar" alt="Profile Image" src="https://profilepicture.verizon.com/apps/photoapp/ImageServlet?eid=4841413066" />
                  </div>
                </a>
                <div className="drop_overlay">Hello</div>
              </div>
            </div> */}
            {!this.props.authLoading ?
              (<div className="Col Col-2" style={{display:"flex",alignItems:"center",justifyContent:"end"}}>
                {/* <div style={{ "float": "right", "marginRight": "20px", "marginTop": "18px" }}> */}
                  {isissoUser && (userDropdown || isissoUser) && (!!this.props.notificationDetals && this.props.notificationDetals.length > 0) &&
                    <div style={{ position: "relative",paddingRight:"0.7rem" }} id="cus-notification" ref="announcement">
                      <a onClick={() => { this.setState({ bannerOpen: !this.state.bannerOpen }) }}><i className="fas fa-bell" style={{ "cursor": "pointer", fontSize: "18px" }} ></i></a>
                      {this.state.bannerOpen && isissoUser && (userDropdown || isissoUser) && (!!this.props.notificationDetals && this.props.notificationDetals.length > 0) && this.announcementStyle != null &&
                        <div className="drop_overlay" style={this.announcementStyle}>
                          <div className="">
                            <img className="float-right" onClick={() => { this.setState({ bannerOpen: false }) }} style={{ "position": "relative", "top": "2px", "fontSize": "19px", "color": "black", "cursor": "pointer", "display": "inline-block", "float": "right", width: "3%" }} src={CloseIcon} />
                            <div style={{ "marginTop": "1vw" }}>
                              {this.props.notificationDetals.map(val => ((
                                <p style={{ wordBreak:"break-word" }}><i className="fa fa-asterisk" style={{ 'color': 'orange' }}></i>{'  ' + val}</p>
                              )))}
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                {/* </div> */}
                <div>
                {linkedVendor && this.state.linkedVendorCopy && this.state.linkedVendorCopy.vendor_name && <a style={{ "cursor": "pointer", "position": "inherit", color: "blue", paddingLeft: "15px", "marginRight": "20px", "marginTop": "18px" }} data-tip data-for="exchange" onClick={this.swapVendComp}><b>Change Vendor</b></a>}
                {linkedVendor && this.state.linkedVendorCopy && this.state.linkedVendorCopy.vendor_name &&
                  <ReactTooltip id="exchange" place="bottom" effect="float">
                    <div style={{ backgroundColor: 'white', color: 'black', padding: '0.5vw' }}>
                      <div style={{ backgroundColor: '#ECECEC', color: 'black', padding: '0.5vw' }} className="mb-2"><b>{`Switch to ${this.state.showLinkedInfo ? 'Home ' : 'Linked '} Company`} <i className="fas fa-arrow-right"></i></b></div>
                      <div className="mb-2"><b>{this.state.showLinkedInfo ? (defaultVendor ? defaultVendor.vendor_name : '') : (this.state.linkedVendorCopy ? this.state.linkedVendorCopy.vendor_name : '')}</b></div>
                      <div><b>Area: </b>{this.state.showLinkedInfo ? (defaultVendor ? defaultVendor.vendor_area : '') : (this.state.linkedVendorCopy ? this.state.linkedVendorCopy.vendor_area : '')}</div>
                      <div><b>Market: </b>{this.state.showLinkedInfo ? (defaultVendor ? defaultVendor.vendor_region : '') : (this.state.linkedVendorCopy ? this.state.linkedVendorCopy.vendor_region : '')}</div>
                    </div>
                  </ReactTooltip>}
                {userDropdown ? (<div className="cus-nav-container">
                  <ul className="cus-nav-items">
                    <li className="cus-nav-item cus-nav-item-dropdown">
                      {this.state.showLinkedInfo ?
                        <div href="#">
                          <span style={{ fontSize: '12px' }} className="cus-lable">
                            <span data-tip data-for="market1" style={{ fontSize: '1.3em', display: "inherit" }}> {currUser.get('fname')+', '+ currUser.get('lname')}
                              {vendor_data && vendor_data.length > 1 ?
                                <ExpandMoreIcon style={{ color: "red" }} fontSize='large'></ExpandMoreIcon> : null}<br></br>
                            </span>
                            {wno_user != 'Y' && <ReactTooltip id="market1" place="bottom" effect="float" top="5px">
                              <div style={{ backgroundColor: 'white', color: 'black', border: '1px solid gray', margin: "0px", padding: "10px" }}>
                                <div><b>Area: </b>{linkedVendor['vendor_area'] ? linkedVendor['vendor_area'] : ''}</div>
                                <div><b>Market: </b>{linkedVendor['vendor_region'] ? linkedVendor['vendor_region'] : ''}</div>
                              </div>
                            </ReactTooltip>}
                            {linkedVendor && linkedVendor['vendor_id'] && linkedVendor['vendor_name'] && wno_user != 'Y' ? <span style={{ fontSize: '1em', float: 'left', overflow: 'hidden', maxHeight: '35px', textOverflow: 'ellipsis ellipsis' }}>{linkedVendor['vendor_id']}-{linkedVendor['vendor_name']}</span> : null}{linkedVendor['vendor_id'] && linkedVendor['vendor_name'] ? <br></br> : null}
                          </span>
                        </div> :
                        <div href="#">
                          <span style={{ fontSize: '12px' }} className="cus-lable">
                            <span data-tip data-for="market" style={{ fontSize: '1.3em', display: "inherit" }}> {currUser.get('fname')+', '+ currUser.get('lname')}
                              {wno_user != 'Y' && <ExpandMoreIcon style={{ color: "red" }} fontSize='large'></ExpandMoreIcon>}
                            </span>
                            {wno_user != 'Y' && <ReactTooltip id="market" place="bottom" effect="float" top="5px">
                              <div style={{ backgroundColor: 'white', color: 'black', border: '1px solid gray', margin: "0px", padding: "10px" }}>
                                <div><b>Area: </b>{currUser.get('vendor_area') ? currUser.get('vendor_area') : ''}</div>
                                <div><b>Market: </b>{currUser.get('vendor_region') ? currUser.get('vendor_region') : ''}</div>
                              </div>
                            </ReactTooltip>}
                            {currUser.get('vendor_id') && currUser.get('vendor_name') && wno_user != 'Y' ? <span style={{ fontSize: '1em', float: 'left', overflow: 'hidden', maxHeight: '35px', textOverflow: 'ellipsis ellipsis' }}>{currUser.get('vendor_id')}-{currUser.get('vendor_name')}</span> : null}{currUser.get('vendor_id') && currUser.get('vendor_name') ? <br></br> : null}
                          </span>
                        </div>}
                    </li>
                  </ul>

                </div>) : loginButton}
                </div>
              </div>) : null}
            <div className="Col Col-12">
              {userDropdown ? (

                <div className="navbar-header navbar-expand-lgs" style={{ marginRight: '-16px' }}>
                  {issoCondition && <div className="subnav">
                    <a onClick={()=>goHome(this.props.navigate)} style={{ marginTop: -3, fontSize: 16, paddingLeft: '0px', paddingRight: '0px' }} className="subnavbtn vz-home-icon-link" id="vz-home-icon-link">
                      <span className="fa fa-lg fa-home pointer" id="icon-home"></span>
                    </a> &nbsp;&nbsp;&nbsp;
                    <button style={{ fontweight: 'bold', fontsize: '14pt', paddingLeft: '0px', paddingRight: '0px' }} className="subnavbtn-noColor">|</button>
                  </div>}
                  {currUser.get('vendor_category') !== 'Nest Evaluation' && issoCondition && <div className="subnav">
                    <button  className="subnavbtn">
                    <li>
                        <Link to={config.filepath+"dashboard"} style={{ color: path == config.filepath+"dashboard" ? '#D52B1E' : null }}>
                        Vendor Work Order
                          &nbsp; <i className="fa fa-angle-down"></i>
                        </Link>
                      </li>
                    </button>
                    <div className="subnav-content" style={{ height: "38px" }}>

                    <a className="subnav-vendor-dash" style={{ cursor: 'pointer' }} onClick={()=>goHome(this.props.navigate)}>Vendor Dashboard</a>
                      <a className="subnav-vendor-dash" onClick={() => {
                        this.props.fetchFileData(this.props.loginId, this.props.vendorId, 0, 0, 'VP_COMMON', 'FAQ', true).then(action => {
                          if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
                            action.fileDetails.getFileDataForPmlist.result.forEach(fd => {
                              if (!!fd && !!fd.PM_FILE_TYPE && !!fd.PM_FILE_NAME && !!fd.PM_FILE_DATA) {
                                let blob = dataURItoBlob(fd.PM_FILE_DATA)
                                startDownload(blob, `${fd.PM_FILE_NAME}.${fd.PM_FILE_TYPE}`)
                              }
                            })
                          }
                        })
                      }}>FAQ</a>
                      <a className="subnav-vendor-dash" style={{ cursor: 'pointer' }} onClick={this.showVWOIssueReportModal}>Issue Report</a>
                      <a className="subnav-vendor-dash" onClick={() => {
                        this.props.fetchFileData(this.props.loginId, this.props.vendorId, 0, 0, 'VP_COMMON', 'Release_Notes', true).then(action => {
                          if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
                            action.fileDetails.getFileDataForPmlist.result.forEach(fd => {
                              if (!!fd && !!fd.PM_FILE_TYPE && !!fd.PM_FILE_NAME && !!fd.PM_FILE_DATA) {
                                let blob = dataURItoBlob(fd.PM_FILE_DATA)
                                startDownload(blob, `${fd.PM_FILE_NAME}.${fd.PM_FILE_TYPE}`)
                              }
                            })
                          }
                        })
                      }}>
                        <i className="ace-icon icon-settings" style={{ "fontStyle": "normal" }}>
                          Release Notes - New
                        </i>
                      </a>
                      {
                        <a className="dropdown">
                          <span onMouseEnter={() => {
                            this.props.fetchTrainingMaterial(this.props.vendorId, this.props.loginId).then(async action => {
                              if (action.type === 'FETCH_TRAININGMATERIAL_SUCCESS' && !!action.TrainingMaterial && !!action.TrainingMaterial.trainingList) {
                                this.setState({
                                  trainingDoc: action.TrainingMaterial.trainingList.filter(i => i.TRAINING_CATEGORY === "Training Document" && i.TRAINING_MATERIALENABLED === 'YES'),
                                  trainingVideo: action.TrainingMaterial.trainingList.filter(i => i.TRAINING_CATEGORY === "Training Video" && i.TRAINING_MATERIALENABLED === 'YES')
                                })
                              }
                            })
                          }}>Training Document &nbsp; <i className="fa fa-angle-down" style={{ fontSize: '10px' }}></i></span>
                          <div className="dropdown-content">
                            <ul className="list-content" style={{ paddingLeft: "0px" }}>
                              {this.state.trainingDoc && this.state.trainingDoc.length > 0 && this.state.trainingDoc.filter(val => this.state.userInfoForFP['vendor_pricing_macro_ant_tow'] == '1' || val.TRAINING_NAME != 'Fixed Pricing Matrix').map(doc => (
                                <li key={doc.TRAINING_FILENAME}><a className="subnav-vendor-dash" onClick={() => {
                                  this.props.fetchFileData(this.props.loginId, this.props.vendorId, 0, 0, doc.TRAINING_TYPE, doc.TRAINING_FILENAME, true).then(action => {
                                    if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
                                      action.fileDetails.getFileDataForPmlist.result.forEach(fd => {
                                        if (!!fd && !!fd.PM_FILE_TYPE && !!fd.PM_FILE_NAME && !!fd.PM_FILE_DATA) {
                                          let blob = dataURItoBlob(fd.PM_FILE_DATA)
                                          startDownload(blob, `${fd.PM_FILE_NAME}.${fd.PM_FILE_TYPE}`)
                                        }
                                      })
                                    }
                                  })
                                }
                                } style={{ textAlign: "left", color: "black" }}>{doc.TRAINING_NAME} </a></li>
                              ))
                              }
                            </ul>
                          </div>
                        </a>}
                      <a className="dropdown">
                        <span onMouseEnter={() => {
                          // this.props.fetchTrainingMaterial(this.props.vendorId, this.props.loginId).then(async action => {
                          //   if (action.type === 'FETCH_TRAININGMATERIAL_SUCCESS' && !!action.TrainingMaterial && !!action.TrainingMaterial.trainingList) {
                          //     this.setState({
                          //       trainingVideo: action.TrainingMaterial.trainingList.filter(i => i.TRAINING_CATEGORY === "Training Video" && i.TRAINING_MATERIALENABLED === 'YES')
                          //     })
                          //   }
                          // })
                        }}>Training Video &nbsp; <i className="fa fa-angle-down" style={{ fontSize: '10px' }}></i></span>
                        <div className="dropdown-content">
                          <ul className="list-content" style={{ paddingLeft: "0px" }}>
                            {this.state.trainingVideo && this.state.trainingVideo.length > 0 && this.state.trainingVideo.filter(val => this.state.userInfoForFP['vendor_pricing_macro_ant_tow'] == '1' || val.TRAINING_NAME != 'Fixed Pricing Matrix').map(doc => (
                              <li key={doc.UNQ_SEQ_ID}><Link to={config.filepath + 'videos/' + doc.UNQ_SEQ_ID} style={{ textAlign: "left" }}> {doc.TRAINING_NAME}</Link></li>
                            ))
                            }
                          </ul>
                        </div>
                      </a>
                    </div>
                  </div>}
                  {currUser.get('vendor_category') == 'Nest Evaluation' && issoCondition ? (<div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "nestEvaluation"} style={{ color: path == config.filepath + "nestEvaluation" ? '#D52B1E' : null }}>
                          Nest Evaluation
                        </Link> </li>
                    </button>
                  </div>) : null}

                  {issoCondition && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "capitalProject"} style={{ color: path == config.filepath + "capitalProject" ? '#D52B1E' : null }}>
                          Capital Project
                        </Link> </li>
                    </button>
                  </div>}

                  {issoCondition && <div className="subnav">

                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "pmdashboard"} style={{ color: path == config.filepath + "pmdashboard" ? '#D52B1E' : null }}>
                          Bulk PO Management
                          &nbsp; <i className="fa fa-angle-down"></i>
                        </Link>
                      </li>
                    </button>
                    <div className="subnav-content" style={{ height: "38px" }}>
                      <li>
                        <Link to={config.filepath + "pmdashboard"} style={{ color: path == config.filepath + "pmdashboard" ? '#D52B1E' : null, marginTop: "2px" }}>
                          Bulk PO Dashboard
                        </Link>
                      </li>
                      <a onClick={() => {
                        this.props.fetchFileData(this.props.loginId, this.props.vendorId, 0, 0, 'VP_PM', 'VP USER GUIDE', true).then(action => {
                          if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
                            action.fileDetails.getFileDataForPmlist.result.forEach(fd => {
                              if (!!fd && !!fd.PM_FILE_TYPE && !!fd.PM_FILE_NAME && !!fd.PM_FILE_DATA) {
                                let blob = dataURItoBlob(fd.PM_FILE_DATA)
                                startDownload(blob, `${fd.PM_FILE_NAME}.${fd.PM_FILE_TYPE}`)
                              }
                            })
                          }
                        })
                      }}>User Guide</a>
                    </div>
                  </div>}
                  {currUser.get('vendor_category') == 'Capital Vendor' && issoCondition ? (<div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "capitalDashboard"} style={{ color: path == config.filepath + "capitalDashboard" ? '#D52B1E' : null }}>
                          Capital Dashboard
                        </Link> </li>
                    </button>
                  </div>) : null}



                  { issoCondition && this.getGeneratorReportMenu()}

                  {issoCondition && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "recentActivity"} style={{ color: path == config.filepath + "recentActivity" ? '#D52B1E' : null }}>
                          Recent OnSiteWork
                        </Link> </li>
                    </button>
                  </div>}

                  {/* {issoCondition && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "capitalProject"} style={{ color: path == config.filepath + "capitalProject" ? '#D52B1E' : null }}>
                          Capital Project
                        </Link> </li>
                    </button>
                  </div>} */}

                  {issoCondition && vendor_data && vendor_data.length > 1 ?
                    <div className="subnav">
                      <button className="subnavbtn">
                        <div
                          className="dropdown" style={{ margin: '-3px' }}>
                          <span >Market List &nbsp; <i className="fa fa-angle-down" style={{ fontSize: 'initial' }}></i></span>
                          <div className="dropdown-content" id="sub-market-container">
                            <ul className="list-content" style={{ paddingLeft: "0px" }}>
                            {this.subMarketList()}
                            </ul>
                          </div>
                        </div>
                      </button>
                    </div> : null
                  }

                  {issoCondition && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "userProfile"} style={{ color: path == config.filepath + "userProfile" ? '#D52B1E' : null }}>
                          My Profile
                        </Link> </li>
                    </button>
                  </div>}

                    {issoCondition && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "siteTools"} style={{ color: path == config.filepath + "siteTools" ? '#D52B1E' : null }}>
                          Site Tools
                        </Link> </li>
                    </button>
                  </div>}

                  {/* start  */}
                  {issoCondition && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={!this.state.isCompanyProfileVisible ? "#" : config.filepath + "companyProfile"}
                          className={`sub-nav ${!this.state.isCompanyProfileVisible ? 'disabled-link' : ''}`}
                          style={{ color: !this.state.isCompanyProfileVisible ? 'gray' : path == config.filepath + "companyProfile" ? '#D52B1E' : null}}>
                          Company Profile &nbsp; <i className="fa fa-angle-down"></i>
                        </Link> </li>
                    </button>
                    <div className={`subnav-content ${!this.state.isCompanyProfileVisible ? 'hide-subnav' : ''}`} style={{ height: "38px" }}>
                      <li>
                        <Link to={config.filepath + "companyProfile"} style={{ color: path == config.filepath + "companyProfile" ? '#D52B1E' : null, borderRight: 'solid silver', borderWidth: 'thin' }}>
                          Manage Users
                        </Link>
                      </li>
                      <li>
                        <Link to={config.filepath + "dispatchAddress"} style={{ color: path == config.filepath + "dispatchAddress" ? '#D52B1E' : null, borderRight: 'solid silver', borderWidth: 'thin' }}>
                          Manage Dispatch Address
                        </Link>
                      </li>
                      <li>
                        <Link to={config.filepath + "ivrDomain"} style={{ color: path == config.filepath + "ivrDomain" ? '#D52B1E' : null, }}>
                          Manage IVR Domains
                        </Link>
                      </li>
                    </div>
                  </div>}

                  {/* End */}

                  {/* {issoCondition && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "userProfile"} style={{ color: path == config.filepath + "userProfile" ? '#D52B1E' : null }}>
                          My Profile
                        </Link> </li>
                    </button>
                  </div>} */}
                  {/* {issoCondition && vendor_data && vendor_data.length > 1 ?
                    <div className="subnav">
                      <button className="subnavbtn">
                        <div
                          className="dropdown" style={{ margin: '-3px' }}>
                          <span >Market List &nbsp; <i className="fa fa-angle-down" style={{ fontSize: 'initial' }}></i></span>
                          <div className="dropdown-content" id="sub-market-container">
                            <ul className="list-content" style={{ paddingLeft: "0px" }}>
                            {this.subMarketList()}
                            </ul>
                          </div>
                        </div>
                      </button>
                    </div> : null
                  } */}
                  {!issoCondition && wno_user != 'Y' && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "userdashboard"} style={{ color: path == config.filepath + "userdashboard" ? '#D52B1E' : null }}>
                          User Management
                        </Link> </li>
                    </button>
                  </div>}
                  {!issoCondition && wno_user != 'Y' && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "companymanagement"} style={{ color: path == config.filepath + "companymanagement" ? '#D52B1E' : null }}>
                          Company Management
                        </Link> </li>
                    </button>
                  </div>}
                  {!issoCondition && wno_user == 'Y' && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "vwrsSerach"} style={{ color: path == config.filepath + "vwrsSearch" ? '#D52B1E' : null }}>
                          VWRS Search
                        </Link> </li>
                    </button>
                  </div>}
                  {/* {issoCondition && <div className="subnav">
                    <button className="subnavbtn">
                      <li>
                        <Link to={config.filepath + "recentActivity"} style={{ color: path == config.filepath + "recentActivity" ? '#D52B1E' : null }}>
                          Recent OnSiteWork
                        </Link> </li>
                    </button>
                  </div>} */}
                  <div className="subnav" style={{ float: 'right' }}>
                     <button onClick={()=>onLogout(this.props.navigate)} className="subnavbtn" style={{ color: '#D52B1E', fontWeight: 'bold' }}>Logout</button>
                  </div>
                </div>
              ) : null
              }
            </div>
            <NotificationSystem ref="notificationSystem" />
          </div>

        </div>
      </div>
    )
  }
}



function mapStateToProps(state) {

  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])


  const currCmpDetails = state.getIn(['Users', 'getVendorUserAuth']) ? state.getIn(['Users', 'getVendorUserAuth']).toJS() : null

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let makeMeUserOffshore = state.getIn(["Users", "currentUser"], "")
  const user = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  const initUser = state.getIn(['Users', 'entities', 'users', 'initial'], Map())
  const currUser = state.getIn(['Users', 'entities', 'users', loginId], Map())
  const ivr_Details = state.getIn(['Users', 'ivr_Details'], Map())
  let vendorId = user.toJS().vendor_id
  const UsersList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let authLoading = state.getIn(["Users", "currentUser", "loading"], false)
  const navbarloaded=state.getIn(["Users","NavbarLoaded"],false);
  const dashboardHomePath = userUtils.getHomePath(state)
  let notificationDetals = state.getIn(['PmDashboard', realLoginId, "pm", 'BannerDetails']) ? state.getIn(['PmDashboard', realLoginId, "pm", 'BannerDetails'], List()).toJS() : null
  notificationDetals = notificationDetals?.notifications.filter(n => n.NOTIFY_DISPLAY === 'Y')
  notificationDetals = notificationDetals?.map(n => {
      return n.NOTIFY_MESSAGE.split('^').map(msg => {
        if (msg.includes('July release')) {
          if (currUser.get('incentive_eligible') == '1' || currUser.get('smallcell_incentive_eligible') == '1') {
            return msg;
          }
        } else {
          return msg;
        }
      });
    })
    if (notificationDetals) {
      notificationDetals = notificationDetals
        .flat()
        .filter(val => val !== undefined && val !== null && val !== '');
    }
  const trainingData = state.getIn(['PmDashboard', loginId, vendorId, "pm", "TrainingMaterial"], List())
  const configData = state.getIn(['Users', 'configData', "configData"], Map())
  const vendorIds = configData ? configData.toJS().configData : []
  let vendorIdList = vendorIds && vendorIds.length > 0 ? vendorIds[0].ATTRIBUTE_VALUE.split(",") : []
  let receivedSites = state.getIn(['PmDashboard', vendorId, "poInvoiceBanner", "receivedSites"]) ? state.getIn(['PmDashboard', vendorId, "poInvoiceBanner", "receivedSites"], Map()).toJS() : null
  let generatorVendorFlag = configData ? configData.toJS().isGeneratorVendor : ""
  let rma_data = state.getIn(["VendorDashboard", loginId, "rma_data"], List())
  let showRmaBanner = state.getIn(["VendorDashboard", loginId, "workOrders", "wrloading"])
  let pendingWorkOrdersCount = state.getIn(["VendorDashboard", loginId, "unscheduledWos"])
  let rmaDataForWo = rma_data?.toJS()?.filter(rma => rma?.STATUS?.toUpperCase() == "DELIVERED") || []
  let fslDCRmaCount = 0, OemAeRmaCount = 0
  if(rmaDataForWo.length > 0) {
    fslDCRmaCount = rmaDataForWo.filter(rma => ["FSL", "DC"].includes(rma?.S4_FORWARD_DISPOSITION?.toUpperCase())).length
    OemAeRmaCount = rmaDataForWo.filter(rma => rma?.S4_FORWARD_DISPOSITION?.toUpperCase() == "OEM_AE").length
  }
  return {
    generatorVendorFlag,
    user,
    navbarloaded,
    currUser,
    UsersList,
    vendorId,
    loginId,
    authLoading,
    dashboardHomePath,
    notificationDetals,
    trainingData,
    configData,
    vendorIdList,
    realLoginId,
    initUser,
    currCmpDetails,
    receivedSites,
    ivr_Details,
    makeMeUserOffshore, fslDCRmaCount, OemAeRmaCount, showRmaBanner, pendingWorkOrdersCount
  }
}

const NavBarContainer = connect(mapStateToProps, { toggleVendorDeactivateBannerReducer, getVendorList,initialNavbarLoadRequest, getUserIVRDetails, switchMarket, logout, fetchFileData, fetchBannerDetails, fetchTrainingMaterial, setVideoSelection, makemeUser, getPOInvoiceSites })(NavBar)
export default withRouter(NavBarContainer)
