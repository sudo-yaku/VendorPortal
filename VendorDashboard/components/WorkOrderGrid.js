
import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { List, Map, fromJS } from "immutable"
import ReactTable from "react-table"
import { getStatus } from '../utils'
import { formatDate } from '../../date_utils'
import moment from 'moment'
import * as utils from "../utils"
import * as XLSX from "xlsx"
import { saveAs } from 'file-saver'
import ReactTooltip from 'react-tooltip'

let DISPLAY_FORMAT_2 = 'MM/DD/YYYY'

class WorkOrderGrid extends React.Component {
  static propTypes = {
    workorders: PropTypes.array,
    onRowClickCallBack: PropTypes.func,
    filtered: PropTypes.array,
    title: PropTypes.string,
    uniqueUId: PropTypes.string,
    path: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = { workorders: [] }
  }

  componentDidMount() {
    let wolist = this.props.workorders
    this.setToState(wolist, this.props)
  }
  setToState(wolist, props) {
    if (!props.isAllWorkOrder) {
      let workorders = []
      if (wolist && wolist.length) {
        for (let i = 0; i < wolist.length; i++) {
          let wo = props.workOrderMap.get(wolist[i])
          if (wo && wo.toJS()) { workorders.push(wo.toJS()) }
        }
      }
      workorders= workorders.map(wo => {
        return {
          ...wo,
          rmaStatus : !!this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id) && this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id).rma_list ? this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id).rma_list.length > 1 ? 'MULTIPLE' : this.props.rmaStatusData.find(rma => wo.workorder_id = rma.vwrs_id).rma_list[0].rma_status : ''
        }
      })
      this.setState({ workorders })

    } else {
      let workorders= wolist.toJS().map(wo => {
        return {
          ...wo,
          rmaStatus : !!this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id) && this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id).rma_list ? this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id).rma_list.length > 1 ? 'MULTIPLE' : this.props.rmaStatusData.find(rma => wo.workorder_id = rma.vwrs_id).rma_list[0].rma_status : ''
        }
      })
      this.setState({ workorders: workorders })
    }
  }

    componentDidUpdate(prevProps){
    if (prevProps.workorders !== this.props.workorders) {
      let wolist = this.props.workorders
      this.setToState(wolist, this.props)
    }
    if (prevProps.uniqueUId !== this.props.uniqueUId) {
      this.createWorkOrderFile()
    }
  }

  createWorkOrderFile() {
    let tableName = this.props.title
    let userRole = this.props.path
    let input = this.state.workorders
    const pages = Array.isArray(input) ? input : [input]
    const data = []
    for (let page = Object.keys(pages), j = 0, end = page.length; j < end; j++) {
      let key = page[j], value = pages[key]
      let exceldata = {
        "WorkOrderNumber": value.workorder_id,
        "Site": value.site_name,
        "Switch": value.switch,
        "Manager": value.sitemanager_name,
        "Priority": value.priority,
        "Work Type": value.work_type,
        "Work Scope": value.work_scope,
        "Work Order Status": value.workorder_status,
        "Quote Status": value.quote_statuses,
        "Work Award Date": value.work_award_date && value.work_award_date.length > 0 ? formatDate(value.work_award_date) : "",
        "Work Completed By": value.work_due_date && value.work_due_date.length > 0 ? formatDate(value.work_due_date) : ""
      }
      if ([utils.QUOTEAPPROVED, utils.COMPLETED].indexOf(value.quote_statuses) > -1) {
        exceldata["PO#"] = value.po_number
        exceldata["PO Status"] = value.po_status
        exceldata["PO received status"] = value.po_rcpt_status
        exceldata["Actual Completion Datetime"] = value.work_completed_date && value.work_completed_date.length > 0 ? formatDate(value.work_completed_date) : ""
      }
      if (!([utils.QUOTECANCELLED, utils.QUOTEPENDING].indexOf(value.quote_statuses) > -1) && userRole === utils.PORTALADMIN) {
        if (value.quoteitems && value.quoteitems.length > 0 && [utils.QUOTERECEIVED, utils.AWAITING_PO].indexOf(value.quote_statuses) > -1) {
          exceldata["Quote SubTotal"] = value.quoteitems[0].quote_total
          exceldata["Materials SubTotal"] = value.quoteitems[0].quote_materials_total
          exceldata["Labor SubTotal"] = value.quoteitems[0].quote_labor_total
          exceldata["Generator Fuel SubTotal"] = value.quoteitems[0].quote_fuel_total
        } else if (value.quoteitems && value.quoteitems.length > 0 && [utils.COMPLETED, utils.QUOTEAPPROVED].indexOf(value.quote_statuses) > -1) {
          exceldata["Actual Invoice Total"] = value.quoteitems[0].actual_total
          exceldata["Actual Invoice Materials"] = value.quoteitems[0].actual_materials_total
          exceldata["Actual Invoice Labor"] = value.quoteitems[0].actual_labor_total
          exceldata["Actual Generator Fuel Total"] = value.quoteitems[0].actual_fuel_total
        }
      }
      data.push(exceldata)
    }
    let ws = XLSX.utils.json_to_sheet(data)
    let wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "WorkOrder")
    let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' })
    let buf = new ArrayBuffer(wbout.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `${tableName}.xlsx`)
  }
  // ,
  //     {
  //       Header: "Day Remaining",
  //       accessor: "work_due_date",
  // Cell: row => (
  //   <div
  //     style={{
  //       width: '100%',
  //       height: '100%',
  //     }}
  //   >
  //   {row.value && row.value.length > 0 ? (moment(row.value).diff(moment().startOf('day'), "days")) >= 0 ?(moment(row.value).diff(moment().startOf('day'), "days")):"":""}

  //   </div>
  // )
  //     }

  render() {
    const { filtered, title } = this.props
    const isQuoting = ["Quote", "Quote Pending", "Quote Received", "Awaiting PO"].indexOf(title) > -1 ? true : false
    const isWorkpending = ["Work", "History", "Work Pending", "Work Completed", "Work Completed", "Work Accepted", "Work Declined", "Work Cancelled", "Work Pending Scheduled", "Work Pending Unscheduled"].indexOf(title) > -1 ? true : false
    let columns = [
{
    Header: () => (<div>
      <span>
        <a data-tip data-for="WorkUrgency">Work Urgency</a>
        <ReactTooltip id="WorkUrgency" place="left" effect="float">
          <span>Priority level of the work order</span>
        </ReactTooltip>
      </span>
    </div>),
    accessor: "work_urgency",
    Cell: row => (
      <div style={{
        width: '100%',
        height: '100%',
      }}>
        {row.value ? row.value.toUpperCase() : ""}
      </div>
    )
  },
  {
    Header: () => (<div>
      <span>
        <a data-tip data-for="TrblTktAging">Trbl Tkt Aging</a>
        <ReactTooltip id="TrblTktAging" place="left" effect="float">
          <span>Days since trouble ticket was created</span>
        </ReactTooltip>
      </span>
    </div>),
    accessor: "trouble_ticket_details",
    Cell: row => (
      <div style={{
        width: '100%',
        height: '100%',
      }}>
        {(() => {
          if (row.value && row.value.length > 0) {
            const createdOn = new Date(row.value[0].ticket_created_on);
            const today = new Date();
            const diffTime = Math.abs(today - createdOn);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `${diffDays} days`;
          }
          return '';
        })()}
      </div>
    )
  },
  {
    Header: () => (<div>
      <span>
        <a data-tip data-for="TroubleType">Trouble Type</a>
        <ReactTooltip id="TroubleType" place="left" effect="float">
          <span>Type of trouble ticket</span>
        </ReactTooltip>
      </span>
    </div>),
    accessor: "trouble_ticket_details",
    Cell: row => (
      <div style={{
        width: '100%',
        height: '100%',
      }}>
        {row.value && row.value.length > 0 ? row.value[0].ticket_trouble_type || "" : ""}
      </div>
    )
  },
      {
        Header: "Site",
        accessor: "site_name",
        filterAll: true,
        Cell: row => {
          return (
          <div
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {row.value && row.value.length && (row.original.site_type !='SWITCH') > 0 ? row.value : ""}

          </div>
        )},
        id: "all",
        filterMethod: (filter, rows) => {
          if (rows) {
            const st = filter.startDate ? filter.startDate.format("YYYY-MM-DD") : null
            const ed = filter.endDate ? filter.endDate.format("YYYY-MM-DD") : null
            const x = rows.filter(row => {
              let isValidInString = false, isValidInWorkType = false, isValidInStatus = false, isValidDate = false
              if (filter.value && filter.value.length > 0) {
                let keys = ["site_name",
                  "priority",
                  "work_type",
                  "work_scope",
                  "workorder_id",
                  "po_number",
                  "po_status",
                  "po_rcpt_status",
                  "workorder_status",
                  "quote_statuses"],
                  dates = [
                    "work_due_date",
                    "Work_Award_Date",
                    "work_order_appr_date"],
                  i = 0
                for (i = 0; i < keys.length; i++) {
                  if (String(String(row._original[keys[i]]).toLowerCase()).includes(filter.value.toLowerCase())) {
                    isValidInString = true
                    break
                  }
                }
                for (i = 0; i < dates.length; i++) {
                  if (String(formatDate(row._original[dates[i]], DISPLAY_FORMAT_2)).startsWith(filter.value.toLowerCase())) {
                    isValidInString = true
                    break
                  }
                }

                if (!isValidInString) {
                  let status = getStatus(row._original.quote_statuses, row._original.workorder_status)
                  if (status && status.length && String(status.toLowerCase()).includes(filter.value.toLowerCase())) {
                    isValidInString = true
                  }
                }
              } else {
                isValidInString = true
              }

              if (filter.vendor_portal_status && filter.vendor_portal_status !== 'All') {
                if (filter.vendor_portal_status === row._original['vendor_portal_status']) { isValidInStatus = true }
              } else {
                isValidInStatus = true
              }

              if (filter.WorkType) {
                if (filter.WorkType === row._original['work_type']) { isValidInWorkType = true }
              } else {
                isValidInWorkType = true
              }

              if (st && ed && row._original['requested_date'] && title === 'History') {
                const reqDt = formatDate(row._original['requested_date'], "YYYY-MM-DD")
                if (moment(reqDt).isBetween(st, ed)) { isValidDate = true }
              } else {
                isValidDate = true
              }

              if (isValidInString && isValidInStatus && isValidInWorkType && isValidDate) { return true } else { return false }
            })
            return x
          }
        }
      },
      {
        Header: "Switch Name",
        accessor: "switch"
      },
      {
        Header: "Manager",
        accessor: "sitemanager_name"
      },
      {
        Header: "Priority",
        accessor: "priority"
      },
      {
        Header: "Work Type",
        accessor: "work_type",
        filterAll: true,
        id: "WorkType",
        filterMethod: (filter, rows) => {
          if (rows && filter.value) {
            const x = rows.filter(row => {
              return (row._original['work_type'] === filter.value) ? true : false
            })
            return x
          } else {
            return rows
          }
        }
      },
      {
        Header: "Work Scope",
        accessor: "work_scope"
      },
      {
        Header: "Work order",
        accessor: "workorder_id"
      },
      {
        Header: "WO Status",
        accessor: "workorder_status"
      },
      {
        Header: "Quote Status",
        accessor: "quote_statuses",
        filterAll: true,
        id: "vendor_portal_status",
        filterMethod: (filter, rows) => {
          if (rows && filter.value) {
            const x = rows.filter(row => {
              return (row._original['vendor_portal_status'] === filter.value) ? true : false
            })
            return x
          } else {
            return rows
          }
        }
      }
    ]
    if (isQuoting) {
      columns.push({
        Header: () => (<div>
          <span>
            <a data-tip data-for="AwardDate">Work Award Date</a>
            <ReactTooltip id="AwardDate" place="left" effect="float">
              <span>This is the date the selected quote will be/was awarded</span>
            </ReactTooltip>
          </span>
        </div>),
        accessor: "work_award_date",
        Cell: row => (
          <div
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {row.value && row.value.length > 0 ? formatDate(row.value, DISPLAY_FORMAT_2) : ""}

          </div>
        )
      })
    }

    // columns.push(
    //   { 
    //     Header: () => (<div>
    //       <span>
    //         <a data-tip data-for="CompleteDate">Work Completed By</a>
    //         <ReactTooltip id="CompleteDate" place="left" effect="float">
    //           <span>This is the date the work needs to be completed by</span>
    //         </ReactTooltip>
    //       </span>
    //     </div>
    //     ),
    //     accessor: "work_due_date",
    //     title: "This is the date the work needs to be completed by",
    //     Cell: row => (
    //       <div style={{
    //         width: '100%',
    //         height: '100%',
    //       }}
    //       >
    //         {row.value && row.value.length > 0 ? formatDate(row.value, DISPLAY_FORMAT_2) : ""}

    //       </div>
    //     )
    //   }
    // )

   
    if (isWorkpending) {
      columns.push({
        Header: "Actual Completion Datetime",
        accessor: "work_completed_date",
        Cell: row => (
          <div style={{
            width: '100%',
            height: '100%',
          }}
          >
            {row.value && row.value.length > 0 ? formatDate(row.value) : ""}

          </div>)
      },
        {
          Header: "PO",
          accessor: "po_number"
        },
        {
          Header: "PO Status",
          accessor: "po_status"
        },
        {
          Header: "PO Receipt Status",
          accessor: "po_rcpt_status"
        }
      )
    }

    return (
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
        <ReactTable
          data={this.state.workorders}
          columns={columns}
          defaultPageSize={10}
          filtered={filtered}
          sortable={true}
          multiSort={true}
          resizable={true}
          className="-striped -highlight"
          getTrProps={(state, rowInfo) => {
            if (rowInfo && rowInfo.row) {
              if (rowInfo.original.workorder_status == 'PO_REQUEST' && rowInfo.original.quote_statuses == 'AWAITING_PO') {
                return {
                  onClick: () => {
                    this.props.onRowClickCallBack(fromJS(rowInfo.original))
                  },
                  style: {
                    background: '#FFD37F',
                    color: '#333333'
                  }
                }
              } else {
                if (!(rowInfo.original.quote_statuses == 'QUOTECANCELLED')) {
                  return {
                    onClick: () => {
                      this.props.onRowClickCallBack(fromJS(rowInfo.original))
                    }
                  }
                } else {
                  return {}
                }
              }
            } else {
              return {}
            }
          }}
        />
      </div>
    )
  }
}


function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let isLoading = state.getIn(["VendorDashboard", loginId, "workOrders", "wrloading"], false)
  let workOrderMap = state.getIn(["VendorDashboard", loginId, "workOrderMap"], Map());
  let user = state.getIn(["Users", "entities", "users", loginId], Map())
  let vendorId = user.toJS().vendor_id

  let rmaStatusData = state.getIn(["VendorDashboard", loginId, vendorId, "rmaStatusData"], List()).toJS()

  return {
    loginId,
    isLoading,
    workOrderMap,
    rmaStatusData
  }
}
export default connect(stateToProps, {})(WorkOrderGrid)
