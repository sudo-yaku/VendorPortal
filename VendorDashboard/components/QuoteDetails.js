import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { List, Map } from "immutable"
import * as formActions from "../../Forms/actions"
import MessageBox from '../../Forms/components/MessageBox'
import SiteInformation from '../../sites/components/SiteInformation'
import SQIInformation from "../../sites/components/SQIInformation"
import SiteDetails from '../../sites/components/SiteDetails'

import SwitchDetails from '../../Switch/components/SwitchDetails'
import WorkOrderFormFixedPricing from './WorkOrderFormFixedPricing'
import ElogForm from '../../Elog/components/ElogForm'
import { Step, Stepper, StepLabel, StepContent } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/AlarmAdd'
import BackIcon from '@material-ui/icons/Undo'
import VSMinimalCalendar from '../../Calendar/components/VSMinimalCalendar'
import VSMinimalCreateScheduler from "../../Calendar/components/VSMinimalCreateScheduler"
import moment from "moment"
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as utils from "../utils"
import * as VendorActions from "../actions"
import * as elogActions from "../../Elog/actions"
import * as VendorActionsNew from "../../sites/actions"
import Loader from '../../Layout/components/Loader'
import WorkorderFileUpload from './WorkorderFileUpload'
import Select from 'react-select'
import { formatDate, utcToLocal } from '../../date_utils'
import { fetchSiteDetails } from "../../sites/actions"
import { getIssueDetails} from "../../sites/actions"
import { fetchSwitchDetails } from "../../Switch/actions"
import { getCalenderEventsForSite,getConflictkirkeEventsForSite, submitScheduleRequest, updateScheduleRequest } from "../../VendorDashboard/actions"
import { getVendorStatus } from '../utils'
import isEqual from 'lodash/isEqual'
import { ivrEmailNotify } from '../../Users/actions'
import { ivrEmailNotification } from '../../Users/schema'
import Datetime from 'react-datetime'
import '../../../node_modules/react-datetime/css/react-datetime.css'
import RescheduleIcon from '../../Calendar/assets/Rescheduled.png'
import RootActive from './../../Images/Root_Active.png'
import blackbird from './../../Images/black-bird.png'
import { FaSnowflake } from 'react-icons/fa';
import VSI from './../../Images/VSI.svg'
import Arrow from './../../Images/Arrow.svg'
import HealthCheck from "../../sites/components/HealthCheck"
import FastHistory from "../../sites/components/FastHistory"
import RMAComponent from "./RMAComponentAccordion"
import AnteenaInformation from "../../sites/components/AnteenaInformation"
import VendorScheduleCalender from "../../Calendar/components/VendorScheduleCalender"
import RMADetails from "./RMADetails"
import CbandTools from "../../CapitalProjectDashboard/CbandTools"
import ReactTooltip from "react-tooltip"

const formName = "WorkOrderDetails"
const DATE_TIME_FORMAT = "MM-DD-YYYY hh:mm A"

class QuoteDetails extends React.Component {
  static propTypes = {
    stepIndex: PropTypes.number,
    formHeader: PropTypes.string,
    toggleSiteDetails: PropTypes.func,
    toggleSwitchDetails: PropTypes.func,
    isSiteDetailShown: PropTypes.bool,
    isSwitchDetailShown: PropTypes.bool,
    isGeneratorInfo: PropTypes.bool,
    isHvacInfo: PropTypes.bool,
    isWodEditable: PropTypes.bool,
    isWoPending: PropTypes.bool,
    isWoloading: PropTypes.bool,
    workORderInfo: PropTypes.object,
    workOrderDetailInfo: PropTypes.object,
    getQuotes: PropTypes.bool,
    isWorkInProgress: PropTypes.bool,
    isAcceptedWork: PropTypes.bool,
    isQuoteReceived: PropTypes.bool,
    onDirtyChange: PropTypes.func,
    handleNext: PropTypes.func,
    role: PropTypes.string,
    isCompleted: PropTypes.bool,
    vendor_status: PropTypes.string,
    handleChangeStatus: PropTypes.func,
    renderVendorStatusEdit: PropTypes.func,
    renderCalloutzone: PropTypes.func,
    deviceInfo : PropTypes.Object,
    renderDeviceInformation: PropTypes.func,
    renderSwitchDetails: PropTypes.func,
    renderGeneratorinfo: PropTypes.func,
    renderHvacinfo: PropTypes.func,
    formGenReadings: PropTypes.func,
    resetInfo: PropTypes.func,
    siteDetaisLoading: PropTypes.bool,
    switchDetailsLoading: PropTypes.bool,
    site: PropTypes.object,
    selectedWorkOrderTitle: PropTypes.string

  };
  constructor(){
    super();
    this.state = {
      accordianFlag: false
    }
  }

  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )
  }

  render() {
    const { toggleSiteDetails, toggleSwitchDetails, workORderInfo, isSiteDetailShown, isSwitchDetailShown, isGeneratorInfo, isHvacInfo,
      isWodEditable, isWoPending, workOrderDetailInfo, isWoloading, selectedWorkOrderTitle, siteDetaisLoading, site, switchDetailsLoading, esaFlag } = this.props
    if (isWoloading || siteDetaisLoading || switchDetailsLoading) {
      return this.renderLoading()
    }
    return (
      <div className="table-responsive vp_stepper_content">
        <table className="table  sortable table-bordered text-center site-table" style={{ minHeight: "288px", "background": "#FFF" }}>
          <tbody className="vzwtable text-left">
            <tr>
              <td colSpan="7" className="align-middle" style={{ 'textAlign': 'center' }} >
                <h4>
                  Work Order Information
                </h4>
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="Form-group"><label className="Form-label">Work Scope</label>{workOrderDetailInfo.get("work_scope")}</td>
              <td className="Form-group"><label className="Form-label">Pricing Matrix Eligible</label>{workOrderDetailInfo.get("pricing_matrix_eligible") && workOrderDetailInfo.get("pricing_matrix_eligible") == "1" ? "YES" : "NO"}</td>
              <td className="Form-group"><label className="Form-label">Matrix Type</label>{workOrderDetailInfo.get("pricing_matrix_cost_type") && workOrderDetailInfo.get("pricing_matrix_cost_type") == "S" ? "Standard" : workOrderDetailInfo.get("pricing_matrix_cost_type") && workOrderDetailInfo.get("pricing_matrix_cost_type") == "E" ? "Emergency" : null}</td>
              <td colSpan="2" className="Form-group"><label className="Form-label">Disaster Recovery</label>{workOrderDetailInfo.get("disaster_recovery") && workOrderDetailInfo.get("disaster_recovery") == '1' ? "Yes" : workOrderDetailInfo.get("disaster_recovery") && workOrderDetailInfo.get("disaster_recovery") == '0' ? "No" : null}</td>
            </tr>
            <tr>
              <td className="Form-group"><label className="Form-label">Work Order</label>{workOrderDetailInfo.get("workorder_id")}</td>
              <td className="Form-group"><label className="Form-label">Priority</label>{workOrderDetailInfo.get("priority")}</td>
              <td className="Form-group"><label className="Form-label">Work Type</label>{workOrderDetailInfo.get("work_type")}</td>
              {workORderInfo.get("work_type").toLowerCase() != 'mdu' && <>
              <td className="Form-group"><label className="Form-label">Switch Name</label>{workORderInfo.get("switch")}</td>
              {workORderInfo.get("site_type") == 'SITE' ? <td className="Form-group"><label className="Form-label">Site Name </label>{workOrderDetailInfo.get("site_name")} <img hidden={site.get("root_drive") === false} data-toggle="tooltip" title="Root Active" src={RootActive} /></td> : null}
              <td colSpan="2" className="Form-group"><label className="Form-label">Manager Email</label>{workOrderDetailInfo.get("mgr_email")}</td>
              </>}
            </tr>
            <tr>
              <td className="Form-group"><label className="Form-label">Work Order Status</label>{workOrderDetailInfo.get("workorder_status")}</td>
              <td className="Form-group"><label className="Form-label">Quote Status</label>{workORderInfo.get("quote_statuses")}</td>
              <td className="Form-group"><label className="Form-label">Requested Date</label>{utcToLocal(workOrderDetailInfo.get("requested_date"))}</td>
              <td className="Form-group"><label className="Form-label">Requested By</label>{workORderInfo.get("requested_by_name")}</td>
              <td className="Form-group"><label className="Form-label">Requestor Number</label>{workOrderDetailInfo.get("requestor_phone")}</td>
              <td colSpan="2" className="Form-group"><label className="Form-label">Requestor Email</label>{workOrderDetailInfo.get("requestor_email")}</td>
            </tr>
            { esaFlag == "Y" ? <tr>
            <td className="Form-group"><label className="Form-label">PO Number</label>{workOrderDetailInfo.get("s4_po_num")}</td>
            <td className="Form-group"><label className="Form-label">PO Status</label>{workOrderDetailInfo.get("s4_po_status")}</td>
            {site?.get('is_hazardous_site') === true && (
              <td colSpan="5" className="Form-group">
                <label className="Form-label" style={{fontWeight: 'bold', textDecoration: 'underline'}}>Hazardous Info</label> <br />
                <span>
                  <label className="Form-label" style={{fontWeight: 'bold', display: 'inline'}}>Warning:</label>
                  <span style={{color: 'red', marginLeft: '5px'}}>{site?.get('hazard_type') || '-'}</span>
                </span>
                <br />
                <span>
                  <label className="Form-label" style={{fontWeight: 'bold', display: 'inline'}}>Description:</label>
                  <span style={{color: 'red', marginLeft: '5px'}}>{site?.get('hazard_justification') || '-'}</span>
                </span>
              </td>
            )}
            </tr> : <tr>
            <td className="Form-group"><label className="Form-label">PO Number</label>{workOrderDetailInfo.get("po_number")}</td>
            <td className="Form-group"><label className="Form-label">PO Status</label>{workOrderDetailInfo.get("po_status")}</td>
            <td className="Form-group"><label className="Form-label">PO Received Status</label>{workOrderDetailInfo.get("po_received_status")}</td>
            <td className="Form-group"><label className="Form-label">S4 PO Number</label>{workOrderDetailInfo.get("s4_po_num")}</td>
            <td className="Form-group"><label className="Form-label">S4 PO Status</label>{workOrderDetailInfo.get("s4_po_status")}</td>
            <td colSpan="2" className="Form-group"><label className="Form-label">S4 PR Number</label>{workOrderDetailInfo.get("s4_pr_num")}</td>
            </tr>}
            {
              workORderInfo.get("site_type") == 'SWITCH' ? <tr>
                <td colSpan="7" className="align-middle" style={{ 'textAlign': 'center' }} >
                  <h4>
                    Switch Information
                  </h4>
                </td>
              </tr> : null

            }
            {
              workORderInfo.get("site_type") == 'SWITCH' ? this.props.renderSwitchDetails() : null
            }
            {workORderInfo.get("work_type").toLowerCase() != 'mdu' && 
              <>
            <tr>
              <td colSpan="7" className="align-middle" style={{ 'textAlign': 'center' }} >
                <h4>
                  Callout Zone Information
                </h4>
              </td>
            </tr>
            {this.props.renderCalloutzone()}
            </>}
            {isGeneratorInfo && (workORderInfo.get('work_type') == 'Generator' || workORderInfo.get('work_type') == 'ENGIE-FUEL') ? this.props.renderGeneratorinfo() : null}
          </tbody>
          <tfoot>
            <tr>
              {isHvacInfo && workOrderDetailInfo.get('work_type') == 'HVAC' ? this.props.renderHvacinfo() : null}
              <td colSpan="7">
                <WorkorderFileUpload selectedWorkOrderTitle={selectedWorkOrderTitle} meta_universalid={workORderInfo.get('meta_universalid')} isWodEditable={isWodEditable} />
              </td>
            </tr>
            <tr>
            {this.state.accordianFlag && this.props.deviceInfo.length ? 
            <td colSpan="7" className="align-middle" style={{ 'textAlign': 'center' }} onClick={()=>this.setState({accordianFlag: !this.state.accordianFlag})}>
              <h4>
                Device Information
              </h4>
            </td> : 
            <td colSpan="7" className="align-middle" style={{ 'textAlign': 'left' }} onClick={()=>this.setState({accordianFlag: !this.state.accordianFlag})}>
              <h4>
                Device Information : {this.props.deviceInfo.length} Devices Listed
              </h4>
            </td>}
          </tr>
          {this.state.accordianFlag && this.props.deviceInfo.length ? this.props.renderDeviceInformation() : null}
          
          </tfoot>
        </table>
      </div>
    )
  }

}

export default QuoteDetails
