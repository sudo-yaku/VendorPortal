import React,{useCallback, useEffect, useRef, useState} from "react"
import excel from '../../src/Excel/images/Excel.svg';
import './EssoVendorDashboard.css'
import info from '../../src/Images/CircleInfo.svg'
import DownloadUsers from '../../src/Images/DownloadUsers.svg'
import exclamation from '../../src/Images/CircleExclamation.svg'
import ReactTooltip from 'react-tooltip'
import { DataGrid } from "@mui/x-data-grid";
const VendorDashboardGrid = (props) => {
    const [selected, setSelected]= useState([])
    const [rowData, setRowData] = useState(props.vendorData || [])
    const inputRef = useRef(null);
    
    let selectedValuesStatus = selected?.map(i => i.IS_VPAUTO_ENABLED)
    let infoFlag = selectedValuesStatus?.every(val => val === selectedValuesStatus[0]);
    
    let columns = [
        {
            headerName: "Vendor Id",
            field: "VENDOR_ID",
            flex: 1
        },
        {
            headerName: "Vendor Name",
            field: "VENDOR_NAME",
            flex: 1
        },
        {
            headerName: "Area",
            field: "VENDOR_AREA",
            flex: 1
        },
        {
            headerName: "Market",
            field: "VENDOR_REGION",
            flex: 1
        },
        {
            headerName: "MDG ID",
            field: "VENDOR_MDGLC",
            flex: 1
        },
        {
            headerName: "Service Email",
            field: "VENDOR_SERVICE_EMAIL",
            flex: 1
        },
        {
            headerName: "Group Vendor",
            field: "IS_GROUP_VISIBILITY",
            flex: 1
        },
        {
            headerName: "City",
            field: "VENDOR_CITY",
            flex: 1
        },
        {
            headerName: "State",
            field: "VENDOR_STATE",
            flex: 1
        },
        {
            headerName: "OSW Auto",
            field: "IS_VPAUTO_ENABLED",
            flex: 1,
            cellClassName: params => {
                return params.value
            },
        }
    ]

    const onSelectionChangedRes = (ids) => {
        const selectedRows = rowData.filter(row => ids.includes(row.VENDOR_ID))
        setSelected(selectedRows)
        props.getSelecteddata(selectedRows)
    }

    const onFilterTextBoxChanged = () => {
        const filterValue = inputRef.current.value
        let searchCoulmns = columns.map(column => column.field)
        const filteredRows = props.vendorData.filter(row => {
            let filterRow = {}
            searchCoulmns.forEach(field => {
                filterRow[field] = row[field]
            })
            return Object.values(filterRow).some(value => {
                if(value !== null && value !== undefined) {
                    let matchValue = value.toString().toLowerCase().includes(filterValue.toLowerCase())
                    return matchValue
                }
                return false
            })
        })
        setRowData(filteredRows)
    }
    const apiRef = params =>{
        window.addEventListener('resize', function() {
          setTimeout(function() {
            params?.autosizeColumns({
              includeHeaders: true,
              includeOutliers: true,
            })
          })
        })
    }
    const getRowId = params => {
        return params.VENDOR_ID
    }
    return (
        <div className="Col Col-12 no-padding">
            <div style={{display:"flex", border:"1px solid #bdc3c7", borderTop: infoFlag && infoFlag === true ? "2px solid #ffcb41" : "2px solid rgb(213, 43, 30)", paddingTop:"6px", width:"99.4%"}}>
                <div className="col-md-9">
                    {props.isFastUser ?
                    <p>
                    <img 
                    src={infoFlag && infoFlag === true ? info :exclamation}
                    style={{ height: '16px', marginTop:"-2px"}}
                    />  You cannot select Enabled and Disabled vendors together. Please deselect to use action buttons</p>
                    : null
                    }
                </div>
                <div className="col-md-3">
                    <input
                    ref={inputRef}
                    type="text"
                    id="filter-text-box"
                    placeholder="Quick Search Vendor"
                    // onChange={(e)=>setText(e.target.value)}
                    onInput={onFilterTextBoxChanged}
                    style={{height:"30px"}}
                />
                <small>
                        <ReactTooltip id="DownloadUsers" place="top" effect="float">
                        {props.vendorIds.length <=1000 ? <span>User Info Download</span> : <span>Select up to 1000 companies to enable</span>}
                        </ReactTooltip>
                         <img
                            src={DownloadUsers}
                            data-tip data-for="DownloadUsers"
                            style={props.vendorIds.length <=1000 ? {height: '20px', marginTop:"-5px", marginLeft:"10px", cursor:"pointer"}:{height: '20px', marginTop:"-5px", marginLeft:"10px", cursor:"pointer",opacity:"0.5" }}
                          onClick={()=> props.vendorIds.length <=1000 && props.getUsersExportToExcel()}
                        /> 
                    </small>
                    <ReactTooltip id="CompanyInfo" place="top" effect="float">
                        <span>Company Info Download</span>
                    </ReactTooltip>
                    <small>
                         <img
                            src={excel}
                            data-tip data-for="CompanyInfo"
                            style={{ height: '20px', marginTop:"-5px", marginLeft:"10px", cursor:"pointer" }}
                          onClick={()=> props.getExportToExcel()}
                        /> 
                    
                    </small>
                       
                </div>
            </div>

            <DataGrid 
                apiRef={apiRef}
                columns={columns}
                rows={rowData}
                checkboxSelection={props.isFastUser}
                rowHeight={30}
                columnHeaderHeight={35}
                autoHeight
                initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 6}
                    },
                }}
                sx={{ 
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                    '& .css-levciy-MuiTablePagination-displayedRows': {paddingTop: '10px'},
                    width: '99.4%'
                }}
                disableRowSelectionOnClick
                onRowSelectionModelChange={onSelectionChangedRes}
                getRowId={getRowId}
            />
        </div>
    )
}
export default VendorDashboardGrid;