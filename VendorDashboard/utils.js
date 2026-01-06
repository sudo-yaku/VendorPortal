import { saveAs } from 'file-saver'

export const WORKPENDING = "WORKPENDING"
export const WORKACCEPTED = "WORKACCEPTED"
export const APPROVED = "APPROVED"
export const QUOTEPENDING = "QUOTEPENDING"
export const QUOTEAPPROVED = "QUOTEAPPROVED"
export const QUOTERECEIVED = "QUOTERECEIVED"
export const QUOTEDECLINED = "QUOTEDECLINED"
export const COMPLETED = "COMPLETED"
export const AWAITING_PO = "AWAITING_PO"
export const PO_REQUEST = "PO_REQUEST"
export const WORKORDERPANEL = "workorder"
export const WORKAWAITEDPANEL = "closed"
export const WORKCOMPLETEDPANEL = "completed"
export const PORTALADMIN = 'PORTALADMIN'
export const PORTALUSER = 'PORTALUSER'
export const WORKCOMPLETE = "WORKCOMPLETE"
export const STATUS_QUOTEPENDING = "QUOTEPENDING"
export const STATUS_QUOTERECEIVED = "QUOTERECEIVED"
export const STATUS_QUOTEAPPROVED = "QUOTEAPPROVED"
export const STATUS_POREQUESTED = "POREQUESTED"
export const STATUS_WORKPENDING = "WORKPENDING"
export const STATUS_WORKCOMPLETED = "WORKCOMPLETED"
export const STATUS_WORKACCEPTED = "WORKACCEPTED"
export const STATUS_COMPLETED = "COMPLETED"
export const STATUS_AWAITING_PO = "AWAITING_PO"
export const QUOTECANCELLED = "QUOTECANCELLED"
export const PENDING_WOAPPROVAL = "PENDING_WOAPPROVAL"



export const getStatus = function (QuoteStatus, WOStatus) {
  if (QuoteStatus === QUOTEPENDING && WOStatus === APPROVED) { return STATUS_QUOTEPENDING }
  if (QuoteStatus === QUOTERECEIVED && WOStatus === APPROVED) { return STATUS_QUOTERECEIVED }
  if (QuoteStatus === QUOTEAPPROVED && WOStatus === APPROVED) { return STATUS_QUOTEAPPROVED }
  if (QuoteStatus === QUOTEAPPROVED && WOStatus === WORKPENDING) { return STATUS_WORKPENDING }
  if (QuoteStatus === COMPLETED && WOStatus === PO_REQUEST) { return STATUS_POREQUESTED }
  if (QuoteStatus === COMPLETED && WOStatus === WORKPENDING) { return STATUS_WORKPENDING }
  if (QuoteStatus === COMPLETED && WOStatus === WORKCOMPLETE) { return STATUS_COMPLETED }
  if (QuoteStatus === COMPLETED && WOStatus === WORKACCEPTED) { return STATUS_WORKACCEPTED }
  if (QuoteStatus === COMPLETED && WOStatus === COMPLETED) { return STATUS_COMPLETED }
  if (QuoteStatus === AWAITING_PO && WOStatus === WORKPENDING) { return STATUS_AWAITING_PO }
}
const WORK_STATUS_APPROVED = "APPROVED"
const WORK_STATUS_CANCELLED = "CANCELLED"
const WORK_STATUS_PO_REQUEST = "PO_REQUEST"
const WORK_STATUS_WORKACCEPTED = "WORKACCEPTED"
const WORK_STATUS_WORKCOMPLETE = "WORKCOMPLETE"
const WORK_STATUS_WORKDECLINED = "WORKDECLINED"
const WORK_STATUS_WORKPENDING = "WORKPENDING"
const WORK_STATUS_PENDINGAPPROVAL = "PENDINGAPPROVAL"
const WORK_STATUS_WORKFUNDING = "WORKFUNDINGAPPROVAL"
const WORK_STATUS_UPFUNDEDREQUEST = "UPFUNDED_PO_REQUEST"

const QUOTE_STATUS_AWAITING_PO = "AWAITING_PO"
const QUOTE_STATUS_COMPLETED = "COMPLETED"
const QUOTE_STATUS_QUOTEAPPROVED = "QUOTEAPPROVED"
const QUOTE_STATUS_QUOTECANCELLED = "QUOTECANCELLED"
const QUOTE_STATUS_QUOTEDECLINED = "QUOTEDECLINED"
const QUOTE_STATUS_QUOTEPENDING = "QUOTEPENDING"
const QUOTE_STATUS_QUOTERECEIVED = "QUOTERECEIVED"
const QUOTE_STATUS_PENDINGWOAPPROVAL = "PENDING_WOAPPROVAL"
const QUOTE_STATUS_VENDOR_DECLINED ="QUOTEVENDOREDECLINED"

export const VENDOR_STATUS_PENDING_APPROVAL = "Pending Approval"
export const VENDOR_STATUS_AWAITING_PO = "Awaiting PO"
export const VENDOR_STATUS_WORK_PENDING = "Work Pending"
export const VENDOR_STATUS_QUOTE_DECLINED = "Quote Declined"
export const VENDOR_STATUS_QUOTE_PENDING = "Quote Pending"
export const VENDOR_STATUS_QUOTE_RECEIVED = "Quote Received"
export const VENDOR_STATUS_WORK_CANCELLED = "Work Cancelled"
export const VENDOR_STATUS_WORK_ACCEPTED = "Work Accepted"
export const VENDOR_STATUS_WORK_COMPLETED = "Work Completed"
export const VENDOR_STATUS_WORK_DECLINED = "Work Declined"
export const VENDOR_QUOTE_DECLINED = "Quote Declined"
export const VENDOR_STATUS_ACKNOWLEDGEMENT_PENDING = "Acknowledge Pending"


export const getVendorStatus = function (WOStatus, QuoteStatus, vendorStatus, workType, priority) {
  if(vendorStatus && workType && vendorStatus == "Acknowledge Pending" && workType == "Antenna / Tower" && priority && priority.toUpperCase() == "DIRECT AWARD"){
  return VENDOR_STATUS_ACKNOWLEDGEMENT_PENDING;
  }
  else{
  switch (WOStatus) {
    case WORK_STATUS_APPROVED:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_AWAITING_PO
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_PENDING
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_PENDING
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_QUOTE_PENDING
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_QUOTE_RECEIVED
        case QUOTE_STATUS_VENDOR_DECLINED:
          return VENDOR_QUOTE_DECLINED

        default:
          return
      }
    case WORK_STATUS_CANCELLED:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_CANCELLED
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_CANCELLED
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_CANCELLED
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_WORK_CANCELLED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_WORK_CANCELLED
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_CANCELLED
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_WORK_CANCELLED
          case QUOTE_STATUS_VENDOR_DECLINED:
            return VENDOR_QUOTE_DECLINED
        default:
          return
      }
    case WORK_STATUS_PO_REQUEST:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_AWAITING_PO
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_AWAITING_PO
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_AWAITING_PO
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED
        default:
          return
      }
    case WORK_STATUS_WORKFUNDING:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        default:
          return;
      }
    case WORK_STATUS_UPFUNDEDREQUEST:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_COMPLETED;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_COMPLETED;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        default:
          return;

      }

    case WORK_STATUS_WORKACCEPTED:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_ACCEPTED
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_ACCEPTED
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_ACCEPTED
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_ACCEPTED
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_WORK_ACCEPTED
        case QUOTE_STATUS_PENDINGWOAPPROVAL:
          return VENDOR_STATUS_WORK_ACCEPTED
        default:
          return
      }
    case WORK_STATUS_WORKCOMPLETE:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_COMPLETED
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_COMPLETED
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_COMPLETED
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_COMPLETED
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_WORK_COMPLETED
        default:
          return

      }
    case WORK_STATUS_WORKDECLINED:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_DECLINED
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_DECLINED
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_DECLINED
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_DECLINED
          case QUOTE_STATUS_VENDOR_DECLINED:
            return VENDOR_QUOTE_DECLINED
        default:
          return
      }
    case WORK_STATUS_WORKPENDING:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_PENDING
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_PENDING
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_PENDING
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_PENDING
        default:
          return
      }
    case WORK_STATUS_PENDINGAPPROVAL:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_PENDING_APPROVAL
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_PENDING_APPROVAL
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_PENDING_APPROVAL
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_PENDING_APPROVAL
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_PENDING_APPROVAL
        case QUOTE_STATUS_PENDINGWOAPPROVAL:
          return VENDOR_STATUS_PENDING_APPROVAL
          case QUOTE_STATUS_VENDOR_DECLINED:
            return VENDOR_QUOTE_DECLINED
        default:
          return
      }
    default:
      break
  }
}
}

export const VENDORSTATUSOPTIONS = [
  // { value: 'Scheduled', label: 'Scheduled' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Work Completed', label: 'Work Completed' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Pending Vendor Invoice', label: 'Pending Vendor Invoice' }
]

export const UNSCHEDULEDVENDORSTATUSOPTIONS = [
  // { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Awaiting Parts', label: 'Awaiting Parts' },
  { value: 'Pending Vendor Invoice', label: 'Pending Vendor Invoice' }
]

export const UNSCHEDULEDACKNOWLEDGESTATUSOPTIONS = [
  { value: 'Acknowledged', label: 'Acknowledged' },
  // { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Awaiting Parts', label: 'Awaiting Parts' },
  { value: 'Pending Vendor Invoice', label: 'Pending Vendor Invoice' }
]

export const SCHEDULEDVENDORSTATUSOPTIONS = [
  // { value: 'Scheduled', label: 'Scheduled' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Awaiting Parts', label: 'Awaiting Parts' },
  // { value: 'Rescheduled', label: 'Rescheduled' },
  { value: 'Pending Vendor Invoice', label: 'Pending Vendor Invoice' }
]


export const INPROGRESSVENDORSTATUSOPTIONS = [
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Awaiting Parts', label: 'Awaiting Parts' },
  { value: 'Pending Vendor Invoice', label: 'Pending Vendor Invoice' }
]

export const REJECTEDVENDORSTATUSOPTIONS = [
  { value: 'Rejected', label: 'Rejected' },
  // { value: 'Rescheduled', label: 'Rescheduled' },
  { value: 'Pending Vendor Invoice', label: 'Pending Vendor Invoice' }
]

export const RESCHEDULEDVENDORSTATUSOPTIONS = [
  // { value: 'Rescheduled', label: 'Rescheduled' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Awaiting Parts', label: 'Awaiting Parts' },
  { value: 'Pending Vendor Invoice', label: 'Pending Vendor Invoice' }
]

export const COMPLETEDVENDORSTATUSOPTIONS = [
  { value: 'Work Completed', label: 'Work Completed' }
]

export const PENDINGINVOICESTATUSOPTIONS = [
  { value: 'Pending Vendor Invoice', label: 'Pending Vendor Invoice' }
]

export const ACKNOWLEDGEMENTPENDINGOPTIONS = [
  {value : 'Acknowledge Pending', label: 'Acknowledge Pending'},
  {value : 'Acknowledged', label: 'Acknowledged'},
  {value : 'Declined', label: 'Declined'}
]

// Options for AP Radio and MDU work types
export const APRADIO_MDU_ACKNOWLEDGEMENT_PENDING_OPTIONS = [
  {value : 'Acknowledge Pending', label: 'Acknowledge Pending'},
  {value : 'Accepted', label: 'Accepted'}
]

export const APRADIO_MDU_ACCEPTED_OPTIONS = [
  {value : 'Accepted', label: 'Accepted'}
]

export const APRADIO_MDU_SCHEDULED_OPTIONS = [
  {value : 'Scheduled', label: 'Scheduled'},
  {value : 'OnSite Now', label: 'OnSite Now'}
]

export const APRADIO_MDU_RESCHEDULED_OPTIONS = [
  {value : 'Rescheduled', label: 'Rescheduled'},
  {value : 'OnSite Now', label: 'OnSite Now'}
]

export const APRADIO_MDU_UNSCHEDULED_OPTIONS = [
  {value : 'Unscheduled', label: 'Unscheduled'},
]

export const APRADIO_MDU_ONSITE_OPTIONS = [
  {value : 'OnSite Now', label: 'OnSite Now'},
  {value : 'Service Restored', label: 'Service Restored'}
]

export const APRADIO_MDU_REPAIR_RESTORED_OPTIONS = [
  {value : 'Service Restored', label: 'Service Restored'}
]

export const dataURItoBlob = function (dataURI) {
  var byteString = atob(dataURI.split(',')[1]) // eslint-disable-line
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  var ab = new ArrayBuffer(byteString.length)
  var ia = new Uint8Array(ab)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  var blob = new Blob([ab], { type: mimeString })
  return blob

}

export function createAndDownloadBlobFile(body, filename) {
  const blob = new Blob([body])
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename)
  } else {
    const link = document.createElement('a')
    // Browsers that support HTML5 download attribute
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}



export const startDownload = function (blob, fileName) {
  saveAs(blob, fileName)
}

export const FILTER_STATUS = {
  "Quote": [
    { label: "Quote Pending", value: "Quote Pending" },
    { label: "Quote Received", value: "Quote Received" },
    { label: "Awaiting PO", value: "Awaiting PO" },
    { label: "All", value: "All" }
  ],
  "Work": [
    { label: "Work Pending Unscheduled", value: "Work Pending Unscheduled" },
    { label: "Work Pending Scheduled", value: "Work Pending Scheduled" },
    { label: "Work Pending", value: "Work Pending" },
    { label: "Work Completed", value: "Work Completed" },
    { label: "Work Accepted", value: "Work Accepted" },
    { label: "Work Declined", value: "Work Declined" },
    { label: "Work Cancelled", value: "Work Cancelled" },
    { label: "All", value: "All" }
  ],
  "History": [
    { label: "Work Accepted", value: "Work Accepted" },
    { label: "Work Declined", value: "Work Declined" },
    { label: "Work Cancelled", value: "Work Cancelled" },
    { label: "All", value: "All" }
  ],
  "Advanced_History": [
    { label: "Work Accepted", value: "WORKACCEPTED" },
    { label: "Work Cancelled", value: "CANCELLED" },
    { label: "Work Completed", value: "WORKCOMPLETE" }
  ]
}
export const WOREQUESTPRIORITY = [
  { name: "priority", label: "Direct Award / Maintenance - No Bid (No PO at Dispatch)", value: "DIRECT AWARD" },
  { name: "priority", label: "Demand Maintenance Bid / Vendor Availability (PO Pending)", value: "BID / AVAILABILITY" }
]
export const DISASTERRECOVERY = [
  { name: "disaster", label: "No", value: "No" },
  { name: "disaster", label: "Yes", value: "Yes" }
]
export const WORKTYPE = [
  { name: "work_type", label: "Antenna Feed line problem", value: "Antenna Feed line problem" },
  { name: "work_type", label: "Antenna Replacement", value: "Antenna Replacement" },
  { name: "work_type", label: "Antenna/Tower", value: "Antenna/Tower" },
  { name: "work_type", label: "Battery", value: "Battery" },
  { name: "work_type", label: "Blanket PO", value: "Blanket PO" },
  { name: "work_type", label: "Building", value: "Building" },
  { name: "work_type", label: "Building/Site cleaning", value: "Building/Site cleaning" },
  { name: "work_type", label: "Copper Stolen", value: "Copper Stolen" },
  { name: "work_type", label: "Disaster/Incident", value: "Disaster/Incident" },
  { name: "work_type", label: "ECOVA-FUEL||Ecova Fuel Pay (3rd party billing - No PO Needed)", value: "ECOVA-FUEL" },
  { name: "work_type", label: "Electrical", value: "Electrical" },
  { name: "work_type", label: "Energy Reduction", value: "Energy Reduction" },
  { name: "work_type", label: "FOPM (Found on Preventive Maintenance)", value: "FOPM" },
  { name: "work_type", label: "Generator", value: "Generator" },
  { name: "work_type", label: "Generator Fueling", value: "Generator Fueling" },
  { name: "work_type", label: "Generator Repair", value: "Generator Repair" },
  { name: "work_type", label: "Grounding", value: "Grounding" },
  { name: "work_type", label: "HVAC", value: "HVAC" },
  { name: "work_type", label: "Landscaping", value: "Landscaping" },
  { name: "work_type", label: "Other", value: "Other" },
  { name: "work_type", label: "PIM/VSWR problem", value: "PIM/VSWR problem" },
  { name: "work_type", label: "RET/TMA", value: "RET/TMA" },
  { name: "work_type", label: "RMA", value: "RMA" },
  { name: "work_type", label: "RNC", value: "RNC" },
  { name: "work_type", label: "Road Repair", value: "Road Repair" },
  { name: "work_type", label: "RRH Replacement", value: "RRH Replacement" },
  { name: "work_type", label: "Snow Plowing", value: "Snow Plowing" },
  { name: "work_type", label: "Spares/Parts", value: "Spares/Parts" },
  { name: "work_type", label: "Tower", value: "Tower" },
  { name: "work_type", label: "Tower Lighting", value: "Tower Lighting" },
  { name: "work_type", label: "Walking/Working Surfaces", value: "Walking/Working Surfaces" }
]

export const CATEGORY = [
  { name: "category", label: "Vendor Work Order", value: "Vendor Work Order" }
]

/* export const CATEGORY = [
  {name: "category", label: "Vendor Work Order", value: "Vendor Work Order"},
  {name: "category", label: "Capital Project", value: "Capital Project"},
  {name: "category", label: "Preventive Maintenance", value: "Preventive Maintenance"},
  {name: "category", label: "Purchase Order", value: "Purchase Order"},
  {name: "category", label: "Contractor ID", value: "Contractor ID"}
] */

export const ComponentList = [
  { name: "component", label: "Dashboard", value: "Dashboard" },
  { name: "component", label: "Work Order Details", value: "Work Order Details" },
  { name: "component", label: "Submit Quote", value: "Submit Quote" },
  { name: "component", label: "Work Request Comments", value: "Work Request Comments" },
  { name: "component", label: "Submit Invoice", value: "Submit Invoice" },
  { name: "component", label: "Create Work Order Request", value: "Create Work Order Request" },
  { name: "component", label: "Site/Swicth Search", value: "Site/Swicth Search" },
  { name: "component", label: "Nest Evaluation", value: "Nest Evaluation" },
  { name: "component", label: "Generator PM", value: "Generator PM" },
  { name: "component", label: "HVAC PM", value: "HVAC PM" },
  { name: "component", label: "Tower Inspection", value: "Tower Inspection" },
  { name: "component", label: "GO95", value: "GO95" },
  { name: "component", label: "Project", value: "Project" }
]

export const QuoteItems = function (data) {
  this.workorder_quote_id = null
  this.vendor_id = data["cfd_quote_vendorid_1"] ? data["cfd_quote_vendorid_1"] : null
  this.workorder_id = data["workorder_id"] ? data["workorder_id"] : null
  this.vendor_email = data["cfd_quote_vendoremail_1"] ? data["cfd_quote_vendoremail_1"] : null
  this.status = data["cfd_quote_status_1"] ? data["cfd_quote_status_1"] : null
  this.status_date = data["cfd_quote_statusdate_1"] ? data["cfd_quote_statusdate_1"] : null
  this.status_by = data["cfd_quote_statusby_1"] ? data["cfd_quote_statusby_1"] : null
  this.quote_request_email_date = data["work_order_appr_date"] ? data["work_order_appr_date"] : null
  this.quote_reply_recv_date = data["cfd_quote_replydate_1"] ? data["cfd_quote_replydate_1"] : null
  this.quote_total = data["cfd_quote_total_1"] ? data["cfd_quote_total_1"] : null
  this.quote_labor_total = data["cfd_quote_labortotal_1"] ? data["cfd_quote_labortotal_1"] : null
  this.quote_materials_total = data["cfd_quote_materialstotal_1"] ? data["cfd_quote_materialstotal_1"] : null
  this.quote_vendor_comments = data["cfd_quote_vendorcomments_1"] ? data["cfd_quote_vendorcomments_1"] : null
  this.quote_vzw_comments = data["cfd_quote_vzwcomments_1"] ? data["cfd_quote_vzwcomments_1"] : null
  this.quote_log = data["cfd_quote_log_1"] ? data["cfd_quote_log_1"] : null
  this.meta_universalid = data["cfd_workorder_quote_id_1"] ? data["cfd_workorder_quote_id_1"] : null
  this.meta_createddate = data["meta_createddate"] ? data["meta_createddate"] : null
  this.meta_createdby = data["meta_createdby"] ? data["meta_createdby"] : null
  this.meta_lastupdatedate = data["meta_lastupdatedate"] ? data["meta_lastupdatedate"] : null
  this.meta_lastupdateby = data["meta_lastupdateby"] ? data["meta_lastupdateby"] : null
  this.actual_fuel_total = data["actual_fuel_total"] ? data["actual_fuel_total"] : null
  this.actual_labor_total = data["actual_labor_total"] ? data["actual_labor_total"] : null
  this.actual_materials_total = data["actual_materials_total"] ? data["actual_materials_total"] : null
  this.actual_total = data["actual_total"] ? data["actual_total"] : null
  this.quote_fuel_total = data["cfd_quote_fueltotal_1"] ? data["cfd_quote_fueltotal_1"] : null
  this.quote_marked_completed = data["cfd_quote_marked_completed_1"] ? data["cfd_quote_marked_completed_1"] : null
  this.source_system = null
}