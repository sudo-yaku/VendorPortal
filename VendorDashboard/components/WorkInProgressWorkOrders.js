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
import WorkPendingDetails from "./WorkPendingDetails"
import QuoteDetails from "./QuoteDetails"

const formName = "WorkOrderDetails"
const DATE_TIME_FORMAT = "MM-DD-YYYY hh:mm A"

class WorkInProgressWorkOrders extends React.Component {
  static propTypes = {
    stepIndex: PropTypes.number,
    formHeader: PropTypes.string,
    toggleSiteDetails: PropTypes.func,
    toggleSwitchDetails: PropTypes.func,
    isSiteDetailShown: PropTypes.bool,
    isSwitchDetailShown: PropTypes.bool,
    isGeneratorInfo: PropTypes.bool,
    selectedWorkOrderTitle: PropTypes.string,
    workPendingElog: PropTypes.object,
    setIsElogEmpty: PropTypes.func,
    isHvacInfo: PropTypes.bool,
    isWRFShown: PropTypes.bool,
    isWRFEditable: PropTypes.bool,
    isWodEditable: PropTypes.bool,
    isWoPending: PropTypes.bool,
    isWoloading: PropTypes.bool,
    siteDetaisLoading: PropTypes.bool,
    switchDetailsLoading: PropTypes.bool,
    site: PropTypes.object,
    workORderInfo: PropTypes.object,
    workOrderDetailInfo: PropTypes.object,
    elogs: PropTypes.object,
    getQuotes: PropTypes.bool,
    isWorkInProgress: PropTypes.bool,
    isAcceptedWork: PropTypes.bool,
    handleNext: PropTypes.func,
    role: PropTypes.string,
    isCompleted: PropTypes.bool,
    elogLoading: PropTypes.bool,
    onDirtyChange: PropTypes.func,
    handleHideModal: PropTypes.func,
    isLoading: PropTypes.bool,
    savedMessage: PropTypes.object,
    isErrorMessageShown: PropTypes.bool,
    validationMessage: PropTypes.bool,
    setElogState: PropTypes.func,
    hasScheduledTimePassed: PropTypes.bool
  };
  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )
  }

  render() {
    const { stepIndex, workORderInfo, getQuotes, isWorkInProgress, isCompleted, isAcceptedWork, handleNext, elogs, onDirtyChange, onSubmitVendorStatus,
      elogLoading, startDate, siteRegion, siteArea, quoteVendorId, quoteVendorName, endDate, startDateValErr, endDateValErr, role, handleHideModal, bannerName, isAcknowledgementPending, isWRFShown, isWRFEditable, isWodEditable, isWoPending,user , workOrderDetailInfo, isWoloading, workPendingElog, setIsElogEmpty, selectedWorkOrderTitle, setElogState } = this.props
    const workType = workORderInfo.get("work_type")?.toLowerCase();
    const isApRadioOrMdu = workType === 'ap radio' || workType === 'mdu';
    let formLabel = this.props.formHeader
    const serviceType = this.props.workOrderDetailInfo.get("work_type")?.toLowerCase();
    let { rmaStatusData, vendorWorkOrderSelectedRowObj, appNotification} = this.props;
    const incentiveEligible = ((user.get("incentive_eligible") == "1" && serviceType == 'antenna / tower') || (user.get("smallcell_incentive_eligible") == 1 && serviceType == 'small cell'));
    let rmaStatus = rmaStatusData.find(rma => appNotification.notificaionProject == rma.vwrs_id) && rmaStatusData.find(rma => appNotification.notificaionProject == rma.vwrs_id).rma_list ? rmaStatusData.find(rma => appNotification.notificaionProject == rma.vwrs_id).rma_list.length > 1 ? 'MULTIPLE' : rmaStatusData.find(rma => appNotification.notificaionProject = rma.vwrs_id).rma_list[0].rma_status : this.props.vendorWorkOrderSelectedRowObj.rmaStatus
    if (elogLoading || isWoloading) {
      return this.renderLoading()
    }
    if (this.props.formHeader === "Submit Invoice") {
      formLabel = "Submit Invoice (Please follow the BAU process to submit the invoice to Accounts Payable also)"
    }
    let stepArray = [<Step active={(stepIndex >= 0)} key="stepworkorder1">
      <StepLabel>Work Order Details </StepLabel>
      <StepContent >
        {(isWorkInProgress || isCompleted) ? <WorkPendingDetails {...this.props} renderStatusLoading={this.renderStatusLoading} /> : <QuoteDetails {...this.props} />}
      </StepContent>
    </Step>]
    
    if (isWRFShown && isWoPending && user && user.get('vendor_pricing_macro_ant_tow') && user.get('vendor_pricing_macro_ant_tow') == '1' && ['Antenna / Tower','RF / Transport / Alarm/ Power / Grounding Equipment','RMA / Spare Parts'].includes(this.props.vendorWorkOrderSelectedRowObj.work_type) && rmaStatus && rmaStatus.length) {
      stepArray.push(<Step active={(stepIndex >= 1)} completed={stepIndex == 1 ? true : false} key="stepworkorder2">
        <StepLabel>RMA Details</StepLabel>
        <StepContent>
          <div className="table-responsive vp_stepper_content">
            <RMADetails loginId={this.props.loginId} vendorId={quoteVendorId} vendorWorkOrderSelectedRowObj={this.props.vendorWorkOrderSelectedRowObj} />
          </div>
        </StepContent>
      </Step>)
    }
    console.log("workOOrderDetailInfo", workOrderDetailInfo.toJS());
    const workorder_vendor_status = this.props.workOrderDetailInfo.get("vendor_status")?.toLowerCase();
    const workorder_work_type = this.props.workOrderDetailInfo.get("work_type")?.toLowerCase();
    const isVendorEligibleForIncentive = workorder_work_type == 'antenna / tower' ? (user.get("incentive_eligible") == 1) : workorder_work_type == 'small cell' ? (user.get("smallcell_incentive_eligible") == 1) : false;
    const shouldShowPendingVendorMsg = isVendorEligibleForIncentive ? !['pending vendor invoice','work completed', 'acknowledge pending'].includes(workorder_vendor_status) : false;
    const showFiveGHRScheduleMsg = isApRadioOrMdu && workorder_vendor_status === 'accepted';
    const showFiveGHRUnScheduleMsg = isApRadioOrMdu && workorder_vendor_status === 'unscheduled';
    const shouldShowInvoiceStep = isApRadioOrMdu
      ? workorder_vendor_status === 'service restored'
      : isVendorEligibleForIncentive
        ? ['pending vendor invoice', 'work completed'].includes(workorder_vendor_status)
        : true;

    if (isWRFShown) {
      stepArray.push(<Step active={(stepIndex >= 1)} completed={stepIndex == 1 ? true : false} key="stepworkorder2">
        <StepLabel>Work Request Comments</StepLabel>
        <StepContent>
          <div className="table-responsive vp_stepper_content">
            <table className="table sortable table-bordered text-center site-table" style={{ maxHeight: "100px", "background": "#FFF" }}>
              <tbody className="vzwtable text-left">
                {this.props.renderVendorStatusEdit()}
              </tbody>
            </table>
              
            {/* Display vendor status update message if needed */}
            {shouldShowPendingVendorMsg && (
              <div
                className="vendor-status-message"
                style={{ margin: "10px 0", color: "#0000FF" }}
              >
                <p>
                  <strong>
                  Please update Vendor Status to "Pending Vendor Invoice" to enable the Invoice Submit screen.
                  </strong>
                </p>
              </div>
            )}
            {(showFiveGHRScheduleMsg || showFiveGHRUnScheduleMsg) && (
              <div
                className="vendor-status-message"
                style={{ margin: "10px 0", color: "#0000FF" }}
              >
                <p>
                  <strong>
                  Please create a schedule before going to On-Site.
                  </strong>
                </p>
              </div>
            )}
            {isApRadioOrMdu && this.props.hasScheduledTimePassed && (
              <div
                className="vendor-status-message"
                style={{ margin: "10px 0", color: "#0000FF" }}
              >
                <p>
                  <strong>
                  Existing schedule has expired. Please create a new schedule before going to On-Site.
                  </strong>
                </p>
              </div>
            )}
    
            {/*{(!elogs || !elogs.toJS() || elogs.toJS().length === 0) && isCompleted && (<MessageBox messages={List(["No ELog found."])} />)}*/}
            <ElogForm startDate ={startDate} 
            endDate = {endDate} onSubmitVendorStatus={onSubmitVendorStatus}
            startDateValErr={startDateValErr}
            currentWorkOrderOEvent={this.props.currentWorkOrderOEvent}
            endDateValErr={endDateValErr} isAcknowledgementPending={isAcknowledgementPending} handleHideModal={handleHideModal} bannerName={bannerName} selectedWorkOrderTitle={selectedWorkOrderTitle} vendor_status={this.props.vendor_status} workOrderInfo={workOrderDetailInfo} setIsElogEmpty={setIsElogEmpty} isWorkInProgress={isWorkInProgress} isWRFEditable={isWRFEditable} setElogState={setElogState} handleNext={handleNext} elog={elogs} isCompleted={isCompleted} isWodEditable={isWodEditable} vendor_status_wo={this.props.vendor_status_wo}/>
          </div>
        </StepContent>
      </Step>)
    }


    if (!isAcknowledgementPending && (role === utils.PORTALADMIN ||
      (role === utils.PORTALUSER && (workOrderDetailInfo.get("priority") == "MAINTENANCE"
        || workOrderDetailInfo.get("priority") == "EMERGENCY")))) {
    
      // Check if the user is eligible for incentive and vendor status is not "Pending Vendor Invoice"
      if (shouldShowInvoiceStep || formLabel=="Submit Quote" || formLabel == "Quote Information") {
      stepArray.push(<Step active={(isWorkInProgress || isCompleted) ? (stepIndex >= 2) : (stepIndex >= 1)} key="stepworkorder12">
        <StepLabel>{formLabel}</StepLabel>
        <StepContent>
          <div className="table-responsive">



            <WorkOrderFormFixedPricing
              siteArea={siteArea} siteRegion={siteRegion} quoteVendorId={quoteVendorId} quoteVendorName={quoteVendorName}
              workORderInfo={workORderInfo} wo_meta_universalid={workORderInfo.get('meta_universalid')}
              isCompleted={isCompleted} isAcceptedWork={isAcceptedWork} getQuotes={getQuotes} isWorkInProgress={isWorkInProgress}
              formName={isWorkInProgress || isCompleted ? "Invoice" : "SubmitQuote"} workPendingElog={workPendingElog}
              onDirtyChange={onDirtyChange} handleHideModal={handleHideModal} setIsElogEmpty={setIsElogEmpty}
              vendorInvoice={workOrderDetailInfo.get("vendor_invoice_num")} workOrderDetailInfo={workOrderDetailInfo}
              onSubmitVendorStatus={onSubmitVendorStatus} 
              selectedWorkOrderTitle={selectedWorkOrderTitle}
              elog={elogs} role={role} switch_name={workORderInfo.get("switch")} requested_by={workORderInfo.get("requested_by_name")}
              isQuoteReceived={this.props.isQuoteReceived ? this.props.isQuoteReceived : false}
              notifref={this.props.notifref}
              formHeader={this.props.formHeader}
              vendor_status={this.props.vendor_status}
              work_pending_timestamp={workOrderDetailInfo.get("work_pending_timestamp")}
              work_completed_timestamp={workOrderDetailInfo.get("work_completed_timestamp")}
              source_system={workOrderDetailInfo.get("source_system")}
            />
          </div>
        </StepContent>
      </Step>)
    }
    }
    return (
      <div>
        <style>
          {`td.Form-group>label {
        display:block
      }`}
        </style>
        <Stepper activeStep={stepIndex} orientation="vertical">
          {stepArray.map((component) => component)}
        </Stepper>
      </div>

    )
  }
}

export default WorkInProgressWorkOrders