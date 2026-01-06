import React from "react"
import PropTypes from "prop-types"
import './Capital.css'
import { formatDate } from "../../src/date_utils"
import DateRangeIcon from '@material-ui/icons/DateRange';
import { DataGrid } from "@mui/x-data-grid"
let DISPLAY_FORMAT_2 = "MM/DD/YYYY"


function CapitalProjectGrid (props){
    const scheduledDateCalendarClicked = (event, row) => {
        event.stopPropagation()
        props.vendorCalenderIconClicked(row)
      }
    const onCellValueChanged = (params) => {
       params.api.refreshCells();
      }
const getrowId = (params) =>{
    return params.proj_number
}
    const renderSechduleDateCalenderIcon = (row) => {
        let styles = { display: 'flex', justifyContent: 'end', cursor: 'pointer' }
        let activeSechduledEvents = props.projects && props.projects.length>0 && props.projects[0].events && props.projects[0].events.length>0 &&  props.projects[0].events.filter((item => { if ((item.status === 'SCHEDULED' || item.status.toUpperCase() === 'RESCHEDULED') && props.projects[0].proj_number == item.workId) return item }))
        if (activeSechduledEvents && activeSechduledEvents.length > 0) {
            let recentEventId = activeSechduledEvents.sort((a,b) => a.eventId - b.eventId)
            let currentWorkOrderOEvent = recentEventId[recentEventId.length-1]
            return (
              <div style={styles} onClick={(event) => scheduledDateCalendarClicked(event, row)}>
                <span>{formatDate(currentWorkOrderOEvent.start, DISPLAY_FORMAT_2)}</span>
                <span><DateRangeIcon /></span>
              </div>
            )
          } else {
            return <div style={styles} onClick={(event) => scheduledDateCalendarClicked(event, row)}><DateRangeIcon /></div>
          }
      }
      const renderSechduleDateIcon = (row) => {
        let styles = { display: 'flex', justifyContent: 'end', cursor: 'pointer' }
        let activeSechduledEvents = row?.ops_events?.filter(item => ((item.status === 'SCHEDULED' || item.status.toUpperCase() === 'RESCHEDULED') && row.proj_number == item.title))
        if (activeSechduledEvents && activeSechduledEvents.length > 0) {
          let recentEventId = activeSechduledEvents.sort((a,b) => a.eventId - b.eventId)
            let currentWorkOrderOEvent = recentEventId[recentEventId.length-1]
            return (
              <div style={styles} onClick={(event) => scheduledDateCalendarClicked(event, row)}>
                <span>{formatDate(currentWorkOrderOEvent.start, DISPLAY_FORMAT_2)}</span>
                <span><DateRangeIcon /></span>
              </div>
            )
          } else {
            return <div style={styles} onClick={(event) => scheduledDateCalendarClicked(event, row)}><DateRangeIcon /></div>
          }
      }
        let columns = [
            {
                headerName: "Project ID",
                field: "proj_number",
                flex:1,
            },
            {
                headerName: "Project Name",
                field: "project_name",
                flex:1,
            },
            {
                headerName: "Project Status",
                field: "project_status",
                flex:1,
            },
            {
                headerName: "Site ID",
                field: "siteid",
                flex:1,
            },
            {
                headerName: "Site Name",
                field: "sitename",
                flex:1,

            },
            {
                headerName: "Manager",
                field: "manager",
                flex:1,
            },
            {
                headerName: "Field Engineer",
                field: "field_engineer",
                flex:1,
            },
            {
                headerName: "Project Initiative",
                field: "project_initiative",
                flex:1,
                renderCell:  row => row.row.project_initiative !== "null" ? row.row.project_initiative : ""
            },
            {
                headerName: "Scheduled Date",
                field: "events",
                flex:1,
                cellClassName: row => "margin"  ,
                renderCell: row => props.hideFooter ? renderSechduleDateCalenderIcon(row.row) : renderSechduleDateIcon(row.row)
              }
        ]
        return (
            <div className="Col Col-12 no-padding">
                <DataGrid
                    columns={columns}
                    rows={props.projects}
                    headerHeight={35}
                    getRowId={getrowId}
                    rowHeight={30}
                    columnHeaderHeight={35}
                    hideFooterSelectedRowCount
                    hideFooter={props.hideFooter}
                    onRowClick={(params,event,details) => { 
                        return props.onRowClicked(params.row)
                    } }
                    initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 10}
                        }
                      }}
                    pageSizeOptions={[10, 15, 20]}
                    sx={{'& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' }, 
                    fontSize: '1rem',
                    minHeight: props.minHeight,
                    '& .margin': { paddingTop: '5px' , paddingRight:'50px'},
                    '& .MuiTablePagination-toolbar > *': {
                          fontSize: '1rem'
                      },
                      '& .MuiTablePagination-toolbar': {
                          alignItems: 'flex-end'
                      },
                      '& .MuiTablePagination-input': {
                          marginBottom: '7px'
                      }
                    }}
                />
                {" "}
            </div>
        )
    }
    CapitalProjectGrid.propTypes = {
        projects: PropTypes.array,
        onGridReady: PropTypes.func,
        onRowClicked: PropTypes.func
    }

export default CapitalProjectGrid