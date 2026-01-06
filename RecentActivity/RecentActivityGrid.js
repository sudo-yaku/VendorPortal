import moment from "moment"
import React from "react"
import { DataGrid } from "@mui/x-data-grid"

const RecentActivityGrid = (props) => {
    let columns = [
        {
            headerName: "Market",
            field: "SUB_MARKET",
            flex: 1
        },
        {
            headerName: "Work Request Type",
            field: "WORK_REQUEST_TYPE",
            flex: 1
        },
        {
            headerName: "Work Order ID",
            field: "WORK_ORDER_ID",
            flex: 1
        },
        {
            headerName: "Work Type",
            field: "WORK_TYPE",
            flex: 1
        },
        {
            headerName: "Site Type",
            field: "SITE_TYPE",
            flex: 1
        },
        {
            headerName: "Site Name",
            field: "SITE_NAME",
        },
        {
            headerName: "Work Info",
            field: "WORK_INFO",
            flex: 1
        },
        {
            headerName: "Last Updated Date (UTC)",
            field: "LAST_UPDATE_DATE",
            flex: 1,
            renderCell: row => row.row.LAST_UPDATE_DATE? moment(row.row.LAST_UPDATE_DATE).format("MM/DD/YYYY HH:MM") : "" 
        },
        {
            headerName: "OSW ID",
            field: "LOCK_UNLOCK_REQUEST_ID",
            flex: 1
        },
        {
            headerName: "OSW Status",
            field: "REQUEST_STATUS",
            flex: 1
        }
    ]
    return (
        <div className="Col Col-12 no-padding" style={{ minHeight : '200px', height: '70vh'}}>
            <DataGrid
                columns={columns}
                rows={props.recentActivityData}
                getRowId={(row) => row.SECTOR_REQ_UNQ_ID}
                rowHeight={40}
                columnHeaderHeight={40}
                sx={{
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                    '& .MuiTablePagination-toolbar > *': {fontSize: '1rem'},
                    '& .MuiTablePagination-toolbar': {alignItems: 'flex-end'},
                    '& .MuiTablePagination-input': {marginBottom: '7px'},
                    fontSize: '13px',
                    minheight: '200px',
                }}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10}
                    },
                }}
                onRowClick={props.onRowClicked}
                pagination={true}
                hideFooter={false}
            />
        </div>
    )
}
export default RecentActivityGrid;