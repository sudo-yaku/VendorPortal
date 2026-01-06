import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Map, fromJS, List } from "immutable"
import { formatDate } from "../../date_utils"
import * as utils from "../utils"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import * as vendorActions from "../actions"
import * as recentActivityActions from "../../RecentActivity/actions"
import DateRangeIcon from '@material-ui/icons/DateRange';
import {DataGrid} from '@mui/x-data-grid';
import VSI from './../../Images/VSI.svg'
let DISPLAY_FORMAT_2 = "MM/DD/YYYY"
class MDUWorkorderGrid extends React.Component {
  static propTypes = {
    workorders: PropTypes.array,
    onRowClickCallBack: PropTypes.func,
    title: PropTypes.string,
    uniqueUId: PropTypes.string,
    path: PropTypes.string,
    user: PropTypes.object,
  };

  constructor(props) {
    super(props)
    this.state = { 
      workorders: [], 
      acknowledgeRows: [], 
      disableButton: false,
      quoteUnidListFromRedis: []
    }
  }

  componentDidMount() {
    const { fetchPendingWorkOrderDetails, loginId, vendorId,getRmaStatus, rmaStatusData } = this.props
    fetchPendingWorkOrderDetails(loginId, vendorId).then(action => {
      let wolist = this.props.workorders
      this.setToState(wolist, this.props)
    })
    this.getDataFromRedis()
  }
  setToState(wolist, props) {
    let workorders = [];
    let { historyMap } = props;
    (props.title == 'Advanced History') ? (historyMap = historyMap.toJS()) : null;
    if (wolist && wolist.length) {
      for (let i = 0; i < wolist.length; i++) {
        if (props.title != 'Advanced History') {
          let wo = props.workOrderMap.get(wolist[i])
          if (wo && wo.toJS()) {
            workorders.push(wo.toJS())
          }
        } else {
          let filteredWo = historyMap[wolist[i]];
          filteredWo ? workorders.push(filteredWo) : null;
        }
      }
    }
    if (props.title === 'Work Pending' || props.title === 'Work Pending Scheduled' || props.title === 'Work Pending Unscheduled') {
      workorders.sort((w1, w2) => w2.work_declined_count - w1.work_declined_count);
      workorders = workorders.map(row => {
        if (row.work_declined_count >= 1) {
          return {
            ...row,
            oneTimeDeclined: row.work_declined_count === 1,
            workorder_status: row.workorder_status === 'WORKPENDING' ? 'WORKDECLINED' : row.workorder_status
          }
        }
        return row;
      });
    }

    const newWorkOrders = workorders.map(wo => {
      return {
        ...wo,
        isPmAvailable: !!this.props.WODetailsPMAvlbl.find(wa => wa.PM_LOCATION_UNID === wo.site_unid) ? 'PM Available' : '',
        rmaStatus : !!this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id) && this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id).rma_list ? this.props.rmaStatusData.find(rma => wo.workorder_id == rma.vwrs_id).rma_list.length > 1 ? 'MULTIPLE' : this.props.rmaStatusData.find(rma => wo.workorder_id = rma.vwrs_id).rma_list[0].rma_status : ''
      }
    })
    this.setState({ workorders: newWorkOrders }, () => this.getRecentActivityDetails(newWorkOrders))
  }
  getRecentActivityDetails = (newWorkOrders) => {
    this.props.getRecentActivity(this.props.loginId).then(async (response) => {
      if (response && response.length > 0) {
        let recentActivityWorkOrders = []
        response.forEach(recentItem => {
          if (recentItem.WORK_TYPE.toUpperCase() != "PROJECT") {
            recentActivityWorkOrders.push(Number(recentItem.WORK_ORDER_ID))
          }
        })
        if (recentActivityWorkOrders && recentActivityWorkOrders.length > 0) {
          let latestWorkOrders = []
          let oldWorkOrders = []
          newWorkOrders.forEach(item => {
            if (recentActivityWorkOrders.includes(item.workorder_id)) {
              latestWorkOrders.push(item)
            } else {
              oldWorkOrders.push(item)
            }
          })
          if (latestWorkOrders.length > 0) {
            this.setState({ workorders: [...latestWorkOrders, ...oldWorkOrders] })
          } else {
            this.setState({ workorders: newWorkOrders })
          }
        }
      }
    })
  }

  onSelectionChanged = (e) => {
      var selectedRows = [e]
      if (!(['QUOTECANCELLED', 'QUOTEDECLINED'].includes(selectedRows[0].quote_statuses))) {
        this.props.onRowClickCallBack(fromJS(selectedRows[0]))
      }
  };


  componentDidUpdate(prevProps) {
    if (prevProps.workorders !== this.props.workorders) {
      let wolist = this.props.workorders
      this.setToState(wolist, this.props)
    }
    if (this.props.title !== prevProps.title) {
      this.setState({acknowledgeRows: [], disableButton: false})
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
        "Site": value.site_type == 'SITE' ? value.site_name : null,
        "Switch": value.switch,
        "Manager": value.sitemanager_name,
        "Requested By": value.requested_by_name,
        "Priority": value.priority,
        "Work Type": value.work_type,
        "Work Scope": value.work_scope,
        "Work Order Status": value.workorder_status,
        "Quote Status": value.quote_statuses,
        "Work Award Date": value.work_award_date && value.work_award_date.length > 0 ? formatDate(value.work_award_date, DISPLAY_FORMAT_2) : "",
        "Work Completed By": value.work_due_date && value.work_due_date.length > 0 ? formatDate(value.work_due_date, DISPLAY_FORMAT_2) : ""
      }
      if (tableName === 'Work Pending' || tableName === 'Work Pending Scheduled' || tableName === 'Work Pending Unscheduled') {
        exceldata["Vendor Status"] = value.vendor_status
      }
      exceldata["WO approved date"] = value.work_order_appr_date && value.work_order_appr_date.length > 0 ?
        formatDate(value.work_order_appr_date, DISPLAY_FORMAT_2) : ""
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
   onSelectionChangedAP=(e) => {
   if(this.props.title == "DA Acknowledge Pending"){
    const selectedRows = this.state.workorders.filter(f=> e.includes(f.meta_universalid) );
    let { quoteUnidListFromRedis } = this.state;
    this.setState({
      acknowledgeRows: selectedRows?.filter(item => !quoteUnidListFromRedis?.includes(item.meta_universalid))
    });
   }
    
  }
  scheduledDateCalendarClicked = (event, row) => {
    event.stopPropagation()
    this.props.vendorCalenderIconClicked(row)
  }
  renderSelected(row){
    return null;
  }
  getDataFromRedis() {
    this.props.bulkUpdatePendingAckFromRedis(this.props.loginId, this.props.vendorId).then(action => {
      if(action?.bulkUpdatePendingAckFromRedis) {
        this.setState({quoteUnidListFromRedis : action?.bulkUpdatePendingAckFromRedis?.redisData?.length > 0 ? action?.bulkUpdatePendingAckFromRedis?.redisData?.split(",") : []})
      }
    })
  }
  onSubmitAcknowledge = (vendorStatus)=> {
    this.setState({disableButton : true})
    let {acknowledgeRows} = this.state;
    if(acknowledgeRows?.length) {
      let quoteUnidList = acknowledgeRows?.map(item =>  item.quoteitems[0].meta_universalid)
      let bulkUpdatePendingAckInput = {
        "data": {
          "vendorId":this.props.vendorId,
          "status":vendorStatus,
          "userid":this.props.loginId,
          "quoteIdList":quoteUnidList.toString(),
          "vendorstatuscomments" : vendorStatus == "Declined" ? "Bulk Decline" : ""
        }
      }
      this.props.bulkUpdatePendingAck(bulkUpdatePendingAckInput).then(action => {
        if(action?.message) {
          this.props.notifref.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            autoDismiss: 3,
            message: action.message
          })
          setTimeout(() => {
            this.getDataFromRedis()
            this.props.handleHideModal("Updating Details...");
          }, 1000);
        }
      })
    }
  }
  renderSechduleDateCalenderIcon(row) {
    let styles = { display: 'flex', justifyContent: 'end', cursor: 'pointer' }
    if (row?.workorder_status == "WORKPENDING") {
      let activeSechduledEvents = row.events && row.events.length > 0 && row.events.filter((item => { if (item.status.toUpperCase() === 'SCHEDULED' || item.status.toUpperCase() === 'RESCHEDULED' || item.status.toUpperCase() === 'UNSCHEDULED') return item }))
        if (activeSechduledEvents && activeSechduledEvents.length > 0) {
        let recentEventId = activeSechduledEvents.sort((a,b) => a.eventId - b.eventId)
        let currentWorkOrderOEvent = recentEventId[recentEventId.length-1]
        return (
          <div style={styles} onClick={(event) => this.scheduledDateCalendarClicked(event, row)}>
            <span>{formatDate(currentWorkOrderOEvent.start, DISPLAY_FORMAT_2)}</span>
            <span><DateRangeIcon /></span>
          </div>
        )
      } else {
        return <div style={styles} onClick={(event) => this.scheduledDateCalendarClicked(event, row)}><DateRangeIcon /></div>
      }
    } else {
      return <div></div>
    }
  }
  apiRef = params =>{
    window.addEventListener('resize', function() {
      setTimeout(function() {
        params.autosizeColumns({
          includeHeaders: true,
          includeOutliers: true,
        })
      })
    })
  }
  getRowId =(row) => {
    return row.meta_universalid;
  }
  
   dateFormatter = (date) => {
    const formattedDate = date ? String(date.getMonth() + 1).padStart(2, '0') + '/' +
    String(date.getDate()).padStart(2, '0') + '/' + 
    date.getFullYear() : null;
   return  <span title={formattedDate || null}>{formattedDate || null}</span>;
  }
  isRowSelectable = (params) =>{
    return this.state.quoteUnidListFromRedis?.includes(params?.meta_universalid) ? false : true;
  }

  render() {

    const { title,user } = this.props
    let { acknowledgeRows, disableButton } = this.state
    const isPendingVzApproval = ["Pending VZ Approval"].includes(title)
    const isQuoting =
      ["Quote", "Quote Pending", "Quote Received", "Awaiting PO"].indexOf(
        title
      ) > -1
        ? true
        : false
    const isWorkpending =
      [
        "Work",
        "History",
        "Work Pending",
        "Work Pending Scheduled",
        "Work Pending Unscheduled",
        "Work Completed",
        "Work Completed",
        "Work Accepted",
        "Work Declined",
        "Work Cancelled"
      ].indexOf(title) > -1
        ? true
        : false
    let columns = [
        {
            headerName: "Work Order ID",
            field: "workorder_id",
            flex:1
          },
           {
        headerName: "MDU Site Name",
        field: "site_name",
        renderCell: row => {
          return row?.row?.site_type == "SITE" ?  <p>{row?.row?.is_donor === true && <img src={VSI} width={28} />} {row?.row?.site_name}  </p> : null
        },
        flex:1,
        cellClassName: function (params) {
          if (params.row.site_type == 'SWITCH') {
            return "lightcoral-left-border"
          } else {
            return null;
          }
        }
      },
      {
        headerName: "Donor Site Name",
        field: "switch",
        flex:1
      },
      {
        headerName: "Requested By",
        field: "requested_by_name",
        flex:1
      },
      {
        headerName: "Priority",
        field: "priority",
        flex:1
      },
      {
        headerName: "Work Type",
        field: "work_type",
        flex:1
      },
      {
        headerName: "Work Order Status",
        field: "workorder_status",
        flex:1
      } ,
     
      
        
    ]

    columns.push({
        headerName: "Quote Status",
        field: "quote_statuses",
        flex:1
      })
    if(user && user.get('vendor_pricing_macro_ant_tow') && user.get('vendor_pricing_macro_ant_tow') == '1' && ((this.props.workOrderStatus == "WORKPENDING" && title === 'Advanced History') || title.includes('Work Pending'))) {
      columns.push({
          headerName: "RMA Status",
          field: "rmaStatus",
          flex:0.7
        }
      )
    }
  
    if ((title && title.includes('Work Pending')) || title == "DA Acknowledge Pending") {
      columns.push(
        {
          headerName: "Vendor Status",
          field: "vendor_status",
          flex:1
        })
    }

    if (isQuoting) {
      columns.push({
        headerName: "WO approved date",
        description: "This is the date the work order has been approved",
        field: "work_order_appr_date",
        renderCell : (params) =>{
          let data = params.value;
          const date = data ? new Date(params.value) : null;
          return this.dateFormatter(date);
        },
        valueGetter: function (value) {
          return value ? new Date(value) : null;
        },
        type: "date",
        flex:1
      },
        {
          headerName: "Work Award Date",
          description:
          "This is the date the selected quote will be/was awarded",
          field: "work_award_date",
          renderCell : (params) =>{
            let data = params.value;
            const date = data ? new Date(params.value) : null;
            return this.dateFormatter(date);
          },
          valueGetter: function (value) {
            return value ? new Date(value) : null;
          },
          type: "date",
          flex:1
        })
    }

       if (isPendingVzApproval) {
          columns.push({
            headerName: "Work Created on",
            description: "This is the date the work order is created on",
            field: "requested_date",   
            renderCell : (params) =>{
              let data = params.row.requested_date; 
              const formattedDate = data ? formatDate(data, DISPLAY_FORMAT_2) : null;
              return formattedDate
            },
            flex:1
          })
        } else {
      if (!isQuoting) {
        columns.push({
          headerName: "WO approved date",
          description: "This is the date the work order has been approved",
          field: "work_order_appr_date",
          renderCell : (params) =>{
            let data = params.value;
            const date = data ? new Date(params.value) : null;
            return this.dateFormatter(date);
          },
          valueGetter: function (value) {
            return value ? new Date(value) : null;
          },
          type: "date",
          flex:1
        })
      }

    
    columns.push({
      headerName: "Work Completed By Date",
      field: "work_due_date",
      description: "This is the date the work needs to be completed by",
      renderCell : (params) =>{
        let data = params.value;
        const date = data ? new Date(params.value) : null;
        return this.dateFormatter(date);
      },
      valueGetter: function (value) {
        return value ? new Date(value) : null;
      },
      type: "date",
      flex:1
    })
    }


    if (isWorkpending) {
      if (!title.includes('Work Pending')) {
        columns.push({
          headerName: "Actual Completion Datetime",
          field: "work_completed_date",
          renderCell : (params) =>{
            let data = params.value;
            const date = data ? new Date(params.value) : null;
            return this.dateFormatter(date);
          },
          valueGetter: function (value) {
            return value ? new Date(value) : null;
          },
          type: "date",
          flex:1
        })
      }
      columns.push(
        {
          headerName: "PO Number",
          field: "po_number",
          flex:1
        }
      )
    }
    if((this.props.workOrderStatus == "WORKPENDING" && title === 'Advanced History') || (title === 'Work Pending' || title === 'Work Pending Scheduled' || title === 'Work Pending Unscheduled')) {
      columns.push(
        {
          headerName: "Scheduled Date",
          field: "events",
          renderCell: row => this.renderSechduleDateCalenderIcon(row.row),
          flex:1.5
        }
      )
    }

    return (
      <div className="Col Col-12 no-padding">
      
           <DataGrid
                    apiRef={this.apiRef}
                    checkboxSelection ={false}
                    rows={this.state.workorders}
                    isRowSelectable={this.isRowSelectable}
                    columns={columns}
                    getRowClassName={(params)=> {
                      if(params.row.oneTimeDeclined === true || (params.row.workorder_status == 'PO_REQUEST' && params.row.quote_statuses == 'AWAITING_PO' && params.row.priority != 'DIRECT AWARD')){
                        return 'orange-row';
                      }
                      if(params.row.oneTimeDeclined === false){
                        return "red-row";
                      }
                    }}
                    onRowClick={(params)=>this.onSelectionChanged(params.row)}
                    onRowSelectionModelChange={this.onSelectionChangedAP}
                    hideFooterSelectedRowCount
                    rowHeight={30}
                    disableMultipleRowSelection={true}
                    disableSelectionOnClick
                    columnHeaderHeight={35}
                    getRowId={this.getRowId}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10}
                      }
                    }}
                    pageSizeOptions={[10, 15, 20]}
                    sx={{
                      fontSize: '1rem',
                      minHeight: 300,
                      '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold',  },
                      '& .MuiTablePagination-toolbar > *': {
                          fontSize: '1rem'
                      },
                      '& .MuiTablePagination-toolbar': {
                          alignItems: 'flex-end'
                      },
                      '& .MuiTablePagination-input': {
                          marginBottom: '7px'
                      },
                      '& .orange-row': { background: 'sandybrown',
                      '&:hover': {
                        background: 'sandybrown',
                        cursor: 'default'
                      },
                      '&.Mui-selected': {
                        background: 'sandybrown',
                        cursor: 'default',
                        '&:hover': {
                        background: 'sandybrown',
                        cursor: 'default'
                      }
                  },                  
                },
                '& .red-row': { background: 'red',
                  '&:hover': {
                    background: 'red',
                    cursor: 'default'
                  },
                  '&.Mui-selected': {
                    background: 'red',
                    cursor: 'default',
                    '&:hover': {
                    background: 'red',
                    cursor: 'default'
                  }
              },                  
            },
            "& .lightcoral-left-border": { borderLeft: "6px solid lightcoral"
        },
                  }}
                  />
      
      </div>
    )
  }
}

function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")

  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user.toJS().vendor_id
  let isLoading = state.getIn(
    ["VendorDashboard", loginId, "workOrders", "wrloading"],
    false
  )
  let workOrderMap = state.getIn(
    ["VendorDashboard", loginId, "workOrderMap"],
    Map()
  )
  let historyMap = state.getIn(["VendorDashboard", loginId, "historyMap"])
  let WODetailsPMAvlbl = state.getIn(["VendorDashboard", loginId, vendorId, "WODetails", "getPendingWorkOrderDetails", "listItems"], List()).toJS()
  let rmaStatusData = state.getIn(["VendorDashboard", loginId, vendorId, "rmaStatusData",], List()).toJS()

  return {
    loginId,
    isLoading,
    workOrderMap,
    historyMap,
    user,
    vendorId,
    WODetailsPMAvlbl,
    rmaStatusData
  }
}
export default connect(
  stateToProps,
  { ...vendorActions, ...recentActivityActions }
)(MDUWorkorderGrid)
