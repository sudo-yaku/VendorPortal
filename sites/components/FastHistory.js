import React, { Component } from "react"
import PropTypes, { bool } from "prop-types"
import { connect } from "react-redux"
import { Map, fromJS, List } from "immutable"
import Modal from "../../Layout/components/Modal"
import moment from 'moment'
import ReactTable from "react-table"
import Loader from '../../Layout/components/Loader'
import { getFastHistory,fetchSiteDetails,fetchLockData, downloadLockFile } from "../actions"
import "../../PreventiveMaintenance/assets/pmstyles.css"
import {createAndDownloadBlobFile} from '../../VendorDashboard/utils'
import { DataGrid } from "@mui/x-data-grid"


class FastHistory extends React.Component {
    static propTypes = {
        site: PropTypes.array,
        fetchSiteDetails: PropTypes.func,
        }
    constructor(props) {
        super(props)
       
        this.state = {
            pageLoading: false,
            selectedRequest :{
                WORK_ORDER_ID :'',
                LOCK_UNLOCK_REQUEST_ID:''
            },
            errorMessage :'',
            errMessage:false,
            expanded : {}
            }
        this.siteDetails = this.siteDetails.bind(this);
        this.getFastHistoryDetails = this.getFastHistoryDetails.bind(this);
        
    }

    async siteDetails(site_unid){
        await this.props.fetchSiteDetails(this.props.loginId, site_unid).then(res=>{
                this.getFastHistoryDetails(site_unid);
        })
    }
  
    async getFastHistoryDetails(unid){
        await this.props.getFastHistory(this.props.loginId,unid).then(res=> 
            {
            if(res.type=="FETCH_FAST_HISTORY_FAILURE"&& res.errors){
                this.setState({errMessage: true,errorMessage:res.errors})
            }
        })
            
    }
    
    componentDidMount(){
        let site_unid="";
        if(this.props.selectedRow){
            site_unid= this.props.selectedRow.site_unid
            this.siteDetails(site_unid)
        }
        else if(this.props.selectedWO){
            site_unid= this.props.workORderInfo.toJS().site_unid
            this.siteDetails(site_unid)
        }   
    }
    
    renderStatusLoading = () => {
        return (<
          Loader color="#cd040b"
          size="35px"
          margin="4px"
          className="text-center" />
        )
    }

    onExpandedChange = (expanded) => {
        this.setState({ expanded });
    }

    addLastUpdatedDate = (history) => {
        history.sort((a, b) => new Date(b.LAST_UPDATE_DATE) - new Date(a.LAST_UPDATE_DATE)); 
        history.forEach(item => {
          item.LAST_UPDATE_DATE = moment(item.LAST_UPDATE_DATE).format('YYYY-MM-DD');
        });
      }

    render() {
        const {fastHistory, siteDetaisLoading, fastHistoryloading, lockDataLoading } = this.props;
        let columns = [
            {
                Header: "Work Request ID",
                accessor: "WORK_ORDER_ID"
            }, 
            {
                Header: "Work request Type",
                accessor: "WORK_REQUEST_TYPE"
            }, 
            {
                Header: "Work Type",
                accessor: "WORK_TYPE"
            }, 
            {
                Header: "GC Request ID",
                accessor: "GC_USER_ID"
            }, 
            {
                Header: "Requested State",
                accessor: "REQUEST_STATUS"
            },
            {
                Header: "Last Updated Date",
                accessor: "LAST_UPDATE_DATE"
            }
        ];
        if (fastHistoryloading || lockDataLoading || siteDetaisLoading ) {
            return this.renderStatusLoading()
        }
        if (fastHistory.length > 0) {
            this.addLastUpdatedDate(fastHistory);
        }

        return (
            <div className="col-md-12">
            {this.state.errMessage
                ? <div className='text-danger'>
                    <label>{this.state.errorMessage}</label>
                </div> 
                :<div className="Col Col-12 no-padding">
                    <style>
                        {`
                            .rt-resizable-header-content {
                                font-weight: 600;
                                color: #060606;
                                padding: 5px;
                            }
                            .ReactTable .rt-thead .rt-th.-sort-asc, .ReactTable .rt-thead .rt-td.-sort-asc {
                                box-shadow: inset 0 3px 0 0 rgb(2, 2, 2);
                            }
                        `}
                    </style>
                    <ReactTable
                    data={fastHistory}
                    columns={columns}
                    defaultPageSize={fastHistory.length<5 ? fastHistory.length : 5}
                    sortable={true}
                    multiSort={true}
                    resizable={true}
                    className="-striped -highlight"
                    expanded={this.state.expanded}
                    getTrProps={(state, rowInfo, column, instance, expanded) => {
                        return {
                        onClick: e => {
                            const expanded = {...this.state.expanded};
                            expanded[rowInfo.viewIndex] = this.state.expanded[rowInfo.viewIndex] ? false : true;
                            this.setState({ expanded });
                        }
                        };
                    }}
                    SubComponent={row => {
                        return (
                        <div style={{ padding: "20px" }}>
                            <CommentsAndAttachments data={row.original}/>
                        </div>
                        );
                    }}
                    />
                </div>}
            </div>
        )
    }
}

class CommentsAttachments extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount(){
        let {WORK_ORDER_ID, LOCK_UNLOCK_REQUEST_ID}=this.props.data
        this.props.fetchLockData(this.props.loginId, this.props.vendorId, WORK_ORDER_ID, LOCK_UNLOCK_REQUEST_ID)
    }
    renderStatusLoading = () => {
        return (<
          Loader color="#cd040b"
          size="35px"
          margin="4px"
          className="text-center" />
        )
    }
    onGridReady = params => {
        this.gridOptions = params
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
        this.gridApi.setFilterModel(null)
        if (params.api && params.api.sizeColumnsToFit) {params.api.sizeColumnsToFit()}
        params.api.sizeColumnsToFit()
      };
      
      fileDownload = (file_name, file_Id) => {
        let {loginId, downloadLockFile} = this.props
        downloadLockFile(loginId, file_Id).then(action => {
          if (action.attachmentData && action.attachmentData.attachmentData) {
            let binaryString = window.atob(action.attachmentData.attachmentData)
            let bytes = new Uint8Array(binaryString.length)
            let blob= bytes.map((byte, i) => binaryString.charCodeAt(i))
            createAndDownloadBlobFile(blob, file_name)
          }
        })
      }
      cellRenderer= (row) => {
        return (<span style={{color: 'blue', cursor: 'pointer'}} onClick={() => this.fileDownload(row.row.file_name, row.row.lock_unlock_attachment_id)}>
                                {row.row.file_name}</span>)
      }
      getrowId =(params) =>{
        return params.lock_unlock_note_id
      }
      getattchmentId =(params) =>{
        return params.lock_unlock_attachment_id
      }
      
      render(){
        let columns = [
            {
                headerName: "Comments",
                field: "text",
                flex:1,
            }, 
            {
                headerName: "Source",
                field: "source",
                flex:1,
            }, 
            {
                headerName: "Created By",
                field: "created_by_name",
                flex:1,
            }, 
            {
                headerName: "Created On",
                field: "created_on",
                flex:1,
            }, 
        ]
        
 let columnsAtach = [
    {
        headerName: "File Name",
        field: "file_name",
        flex:1,
        renderCell: row => this.cellRenderer(row)

    }, 
    {
        headerName: "File Size",
        field: "file_size",
        flex:1,
    }, 
    {
        headerName: "Uploaded By",
        field: "uploaded_by",
        flex:1,
    }, 
    {
        headerName: "Source",
        field: "source",
        flex:1,
    },
    {
        headerName: "Uploaded On",
        field: "uploaded_on",
        flex:1,
    }
]

        const {lockDataLoading } = this.props;
        if( lockDataLoading ){
            return this.renderStatusLoading()
          }
        return( 
           
        <div style={{"background": "#FFF"}}>
            {!!this.props.lockData && !!this.props.lockData.errors && !!this.props.lockData.errors.length>0 ? 
                    (<div className='text-danger ml-5'>
                        <label>{this.props.lockData.errors[0].message} </label>
                    </div> )
                :null}
          <div style={{"padding": "10px 10px 10px 10px",overflow:"hidden", minHeight : '200px', height: '300px'}}>
            <div><b>Comments</b></div>
              {!!this.props.lockData && !!this.props.lockData.lockRequest && !!this.props.lockData.lockRequest.notes ? 
                    (<DataGrid 
                        columns={columns}
                        rows={this.props.lockData.lockRequest.notes}
                        getRowId={this.getrowId}
                        rowHeight={27}
                        columnHeaderHeight={35}
                        initialState={{
                            pagination: {
                              paginationModel: { page: 0, pageSize: 5}
                            },
                          }}
                        sx={{ 
                            '& .MuiTablePagination-toolbar > *': {fontSize: '1rem'},
                            '& .MuiTablePagination-toolbar': {alignItems: 'flex-end'},
                            '& .MuiTablePagination-input': {marginBottom: '7px'},
                            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                            fontSize:'13px',
                            minheight:'100px'  
                            }}
                        disableRowSelectionOnClick

                    /> )
                : null}
          </div>
          <div style={{padding: "10px 10px 10px 10px", minHeight: "200px", height: '300px'}} >
              <div><b>Attachments</b></div>
              
                      {!!this.props.lockData && !!this.props.lockData.lockRequest && !!this.props.lockData.lockRequest.attachments ?

                        (<DataGrid 
                            columns={columnsAtach}
                            rows={this.props.lockData.lockRequest.attachments}
                            getRowId={this.getattchmentId}
                            rowHeight={27}
                            columnHeaderHeight={35}
                            initialState={{
                                pagination: {
                                  paginationModel: { page: 0, pageSize: 5}
                                },
                              }}
                            sx={{ 
                                '& .MuiTablePagination-toolbar > *': {fontSize: '1rem'},
                                '& .MuiTablePagination-toolbar': {alignItems: 'flex-end'},
                                '& .MuiTablePagination-input': {marginBottom: '7px'},
                                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                                fontSize:'13px',
                                minheight:'100px' 
                                }}
                            disableRowSelectionOnClick
    
                        /> 
                      ) : null}
              </div>
      </div>
          )
      }

}
const CommentsAndAttachments = connect(editProps, { fetchLockData,downloadLockFile })(CommentsAttachments)
function editProps(state, props) {
   let {LOCK_UNLOCK_REQUEST_ID = '',WORK_ORDER_ID} = props.data 
    let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
    let user = state.getIn(["Users", "entities", "users", loginId], Map()).toJS()
    let vendorId = user.vendor_id
    let lockDataLoading = state.getIn(["Sites", loginId, vendorId, WORK_ORDER_ID, LOCK_UNLOCK_REQUEST_ID, "lockDataLoading"])
    let lockData = state.getIn(["Sites", loginId, vendorId, WORK_ORDER_ID, LOCK_UNLOCK_REQUEST_ID, "lockReqData"], Map()).toJS()
    return {
        site: state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()).toJS(),
        siteDetaisLoading: state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false),
        fastHistory: state.getIn(["Sites", loginId, "siteDetails", "fastHistory"],List()),
        fastHistoryloading : state.getIn(["Sites", loginId,"siteDetails", "fastHistoryLoading"],false),
        loginId,
        vendorId,
        user,
        lockDataLoading,
        lockData
    }
}
function stateToProps(state, props) {
    let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
    let user = state.getIn(["Users", "entities", "users", loginId], Map()).toJS()
    let vendorId = user.vendor_id
    return {
        site: state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()).toJS(),
        siteDetaisLoading: state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false),
        fastHistory: state.getIn(["Sites", loginId, "siteDetails", "slrhistory"],List()).toJS(),
        fastHistoryloading : state.getIn(["Sites", loginId,"siteDetails", "fastHistoryLoading"],false),
        loginId,
        vendorId,
        user,
    }
}
export default connect( stateToProps, { fetchSiteDetails,getFastHistory,fetchLockData })(FastHistory)