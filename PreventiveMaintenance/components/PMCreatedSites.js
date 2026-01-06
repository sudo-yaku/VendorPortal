import React from "react"
import moment from 'moment'
import Modal from "../../Layout/components/Modal"
import PMModelDetails from './PMModelDetails'
import PMModelDetailsCompleted from './PMModelDetailsCompleted'
import GO95Inspection from './GO95Inspection'
import TowerInspection from './TowerInspection'
import { DataGrid } from "@mui/x-data-grid"

class PMCreatedSites extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isModalshown: false,
      selectedPM: null,
      isModalshownGO95: false, selectedGO95: null,
      isModalshownTOWER:false,
      selectedTOWER:null
    }
  }
    onGridReady = params => {
    this.gridOptions = params
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    this.gridApi.setFilterModel(null)
    if (params.api && params.api.sizeColumnsToFit) {params.api.sizeColumnsToFit()}
    params.api.sizeColumnsToFit()
    this.gridApi.sizeColumnsToFit()
  };
  modifyGridDetails = () => {
    
    
    return this.props.pmGridDetailsDraft.filter(val => val.INCLUDED_IN_PMLIST !== 'N').map((pmGridDetail) => ({
      ...pmGridDetail,
      PS_LOCATION_ID : !!pmGridDetail.PS_LOCATION_ID ? pmGridDetail.PS_LOCATION_ID : '',      
      PM_SITE_ID : !!pmGridDetail.PM_SITE_ID ? pmGridDetail.PM_SITE_ID : '',
    
      PM_LOCATION_NAME : !!pmGridDetail.PM_LOCATION_NAME ? pmGridDetail.PM_LOCATION_NAME : '',
      PM_COST : !!pmGridDetail.PM_COST ? pmGridDetail.PM_COST : '', 
      SCHEDULED_DATE : pmGridDetail.SCHEDULED_DATE ? moment(pmGridDetail.SCHEDULED_DATE).format('MM/DD/YYYY') : '',
      PO_ITEM_ID : !!pmGridDetail.PO_ITEM_ID ? pmGridDetail.PO_ITEM_ID : '',
      DESCRIPTION : !!pmGridDetail.DESCRIPTION ? pmGridDetail.DESCRIPTION : '',
      TOTAL_COST : !!pmGridDetail.TOTAL_COST ? pmGridDetail.TOTAL_COST : '',
      
      PM_ITEM_STATUS: pmGridDetail.PM_ITEM_STATUS,
      PM_ITEM_DUE_DATE: pmGridDetail.PM_ITEM_DUE_DATE ? moment(pmGridDetail.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : '',
      PM_ITEM_COMPLETED_DATE: pmGridDetail.PM_ITEM_COMPLETED_DATE ? moment(pmGridDetail.PM_ITEM_COMPLETED_DATE.split(' ')[0]).format('MM/DD/YYYY') : '',
      LAST_UPDATED_DATE: pmGridDetail.LAST_UPDATED_DATE ? moment(pmGridDetail.LAST_UPDATED_DATE).format('MM/DD/YYYY') : '',
      COMPLETED_BY: pmGridDetail.COMPLETED_BY ? pmGridDetail.COMPLETED_BY : '',
      INSP_STATUS: pmGridDetail.INSP_STATUS ? pmGridDetail.INSP_STATUS : '' 
      
      
    }))

  }
  handleHideModal = () => this.setState({ isModalshown: false })
  handleHideModalGO95 = (attrAction) => {
    this.setState({ isModalshownGO95: false })
    if(this.state.selectedGO95.PM_ITEM_STATUS !== "COMPLETED") {
      if(["PENDING_DRAFT", "COMPLETED"].includes(attrAction)) this.props.handleHideModalGO95()
    }
  }
  handleHideModalTOWER = () => this.setState({ isModalshownTOWER: false })
  onRowClicked = (pmTypeName, e) => {
    var selectedRows = [e.row]
    if(pmTypeName === 'GO95'){
        if (selectedRows[0].PM_ITEM_STATUS !== 'DRAFT' ) { this.setState({ isModalshownGO95: true, selectedGO95: selectedRows[0] }) }
    }
    else if(pmTypeName === 'TOWER INSPECTION'){
      if (selectedRows[0].PM_ITEM_STATUS !== 'DRAFT' && selectedRows[0].PM_ITEM_STATUS !== 'CANCELLED') { this.setState({ isModalshownTOWER: true, selectedTOWER: selectedRows[0] }) }
  }
    else{
        if (selectedRows[0].PM_ITEM_STATUS !== 'CANCELLED' && selectedRows[0].PM_ITEM_STATUS !== 'CANCEL' && selectedRows[0].PM_ITEM_STATUS !== 'CLOSED' && ((this.props.currentPmList.IS_VENDOR_REQUESTED == 'Y' && !!this.props.currentPmList.PO_NUM && this.props.currentPmList.IS_COMPLETED === 'N') || this.props.currentPmList.IS_VENDOR_REQUESTED == 'N')) { this.setState({ isModalshown: true, selectedPM: selectedRows[0] }) }
    }
  };
  renderPmDetailsModal() {
    let title = {
      site_id: (!!this.state.selectedPM && !!this.state.selectedPM.SITE_ID) ? `Site Id : ${this.state.selectedPM.SITE_ID}` : '',
      site_name: (!!this.state.selectedPM && !!this.state.selectedPM.PM_LOCATION_NAME) ? `Site Name : ${this.state.selectedPM.PM_LOCATION_NAME}` : '',
      PO: (!!this.props.currentPmList && !!this.props.currentPmList.PO_NUM) ? `PO : ${this.props.currentPmList.PO_NUM}` : '',
      Line: (!!this.state.selectedPM && !!this.state.selectedPM.LINE) ? `Line : ${this.state.selectedPM.LINE}` : '',
      Schedule: (!!this.state.selectedPM && !!this.state.selectedPM.SCHEDULE) ? `Schedule : ${this.state.selectedPM.SCHEDULE}` : '',
    }
    let data = JSON.stringify(this.state.selectedPM)
    let poItemId = this.state.selectedPM && this.state.selectedPM.PO_ITEM_ID ? this.state.selectedPM.PO_ITEM_ID : ''
    let isPmSelected = this.state.selectedPM && this.props.currentPmList && (poItemId == 'EXP-GNRTRS-CELL' ||
      poItemId == 'EXP-HVAC-MAIN-CELL' || this.props.currentPmList.PM_TYPE_NAME == 'GENERATOR PM' || this.props.currentPmList.PM_TYPE_NAME == 'HVAC PM') ? true : false
    if (this.state.selectedPM.PM_ITEM_STATUS !== 'PENDING' && this.state.selectedPM.PM_ITEM_STATUS !== 'PENDING_DRAFT') {
      return (<div className='disable-click'>
        <Modal large={true} handleHideModal={this.handleHideModal}
          data-backdrop="static" data-keyboard="false"
          style={{ width: "80%", maxWidth: "80%", display:"block", marginTop:"30px" }}
          title={`${title.site_id}  ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`} >

          <PMModelDetailsCompleted title={title} handleHideModal={this.handleHideModal} notiref={this.props.notiref} currentPmListID={this.props.currentPmList.PM_LIST_ID} 
          PMDetails={this.state.selectedPM} pmType={this.props.currentPmList.PM_TYPE_NAME} isPmSelected={isPmSelected} poItemId={poItemId} />
        </Modal></div>)

    } else if (this.state.selectedPM.PM_ITEM_STATUS === 'PENDING' || this.state.selectedPM.PM_ITEM_STATUS === 'PENDING_DRAFT') {
      return (<div className='disable-click'>
        <Modal large={true} handleHideModal={this.handleHideModal}
          data-backdrop="static" data-keyboard="false"
          style={{ width: "80%", maxWidth: "80%", display:"block", marginTop:"30px" }}
          title={`${title.site_id}  ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`}>

          <PMModelDetails title={title} handleHideModal={this.handleHideModal} notiref={this.props.notiref} currentPmListID={this.props.currentPmList.PM_LIST_ID} PMDetails={this.state.selectedPM}
            pmType={this.props.currentPmList.PM_TYPE_NAME} isPmSelected={isPmSelected} poItemId={poItemId} />
        </Modal></div>)
    }


  }

  getRowId = (row) => {
    return row.PM_LIST_ITEM_ID
  }
  apiRef = params =>{
    window.addEventListener('resize', function() {
      setTimeout(function() {
        params?.autosizeColumns({
          includeHeaders: true,
          includeOutliers: true,
        })
      })
    })
  }

    render(){
      let title = {
        site_id: (!!this.state.selectedGO95 && !!this.state.selectedGO95.PM_SITE_ID) ? `Site Id : ${this.state.selectedGO95.PM_SITE_ID}` : '',
        site_name: (!!this.state.selectedGO95 && !!this.state.selectedGO95.PM_LOCATION_NAME) ? `Site Name : ${this.state.selectedGO95.PM_LOCATION_NAME}` : '',
        PO: (!!this.props.currentPmList && !!this.props.currentPmList.PO_NUM) ? `PO : ${this.props.currentPmList.PO_NUM}` : '',
        Line: (!!this.state.selectedGO95 && !!this.state.selectedGO95.LINE) ? `Line : ${this.state.selectedGO95.LINE}` : '',
        Schedule: (!!this.state.selectedGO95 && !!this.state.selectedGO95.SCHEDULE) ? `Schedule : ${this.state.selectedGO95.SCHEDULE}` : '',
      }
      let titleTOWER = {
        site_id: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.PM_SITE_ID) ? `Site Id : ${this.state.selectedTOWER.PM_SITE_ID}` : '',
        site_name: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.PM_LOCATION_NAME) ? `Site Name : ${this.state.selectedTOWER.PM_LOCATION_NAME}` : '',
        PO: (!!this.props.currentPmList && !!this.props.currentPmList.PO_NUM) ? `PO : ${this.props.currentPmList.PO_NUM}` : '',
        Line: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.LINE) ? `Line : ${this.state.selectedTOWER.LINE}` : '',
        Schedule: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.SCHEDULE) ? `Schedule : ${this.state.selectedTOWER.SCHEDULE}` : '',
      }
    const modfdGridDetails = this.modifyGridDetails()
     let columnsGO95 = [
      {
        headerName: "PS Loc ID",  field: "PS_LOCATION_ID",  minWidth: 100, flex: 1
      },
      {
        headerName: "Site ID", field: "PM_SITE_ID", minWidth: 80, flex: 1
      },

      {
        headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 2
      },
      {
        headerName: "Item Status", field: "PM_ITEM_STATUS",flex: 1
      },
      
      {
        headerName: "Inspection Status", field: "INSP_STATUS", flex: 1
      },
      {
        headerName: "Due Date", field: "PM_ITEM_DUE_DATE", flex: 1
      },
      {
        headerName: "Schedule Date", field: "SCHEDULED_DATE", flex: 1
      },
      {
        headerName: "Completed Date", field: "PM_ITEM_COMPLETED_DATE", flex: 1
      },
      {
        headerName: "Completed By", field: "COMPLETED_BY", flex: 1.6
      },
      {
        headerName: "PO Item Id", field: "PO_ITEM_ID", flex: 1
      }
      

    ]

    let columns = [
      {
        headerName: "Location ID", field: "PS_LOCATION_ID", minWidth: 100, flex: 1
      },
      {
        headerName: "Site ID", field: "PM_SITE_ID", minWidth: 130,flex: 1
      },

      {
        headerName: "Site Name", field: "PM_LOCATION_NAME", minWidth:300, flex: 2.5
      },
      {
        headerName: "PM Cost", field: "PM_COST", flex: 1
      },
      {
        headerName: "Schedule Date", field: "SCHEDULED_DATE",flex: 1
      },
      
      {
        headerName: "PO Item Id", field: "PO_ITEM_ID", flex: 1
      },
      {
        headerName: "Description", field: "PO_ITEM_DESCRIPTION", flex: 1
      },
       {
        headerName: "Total Cost", field: "TOTAL_COST", flex: 1
      }
      
    ]

if(this.props.esaFlag === "Y") {
            columns = columns.filter(obj => obj.headerName!== 'Location ID')
            columnsGO95 = columnsGO95.filter(obj => obj.headerName!== 'PS Loc ID')
        } 
    let autoGroupColumnDef =  {
        headerName: 'Select',
        field: 'Select',
        minWidth: 250,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: { checkbox: true }
      }

    let rowClassRules = {
      "orange-row": function (params) {
        return (params.data.workorder_status == 'PO_REQUEST' && params.data.quote_statuses == 'AWAITING_PO')
      }
    }
   let totalP = (this.props.currentPmList.PM_TYPE_NAME === 'GO95' ||this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION') && !!this.props.currentPmList.PO_NUM && this.props.pmGridDetailsDraft.filter(val => val.INCLUDED_IN_PMLIST !== 'N').length > 0? this.props.pmGridDetailsDraft.filter(val => val.INCLUDED_IN_PMLIST !== 'N').length :0
    let pendingP =(this.props.currentPmList.PM_TYPE_NAME === 'GO95' ||this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION') && !!this.props.currentPmList.PO_NUM && this.props.pmGridDetailsDraft.filter(val => val.INCLUDED_IN_PMLIST !== 'N').length > 0? ((this.props.pmGridDetailsDraft.filter(val => val.PM_ITEM_STATUS == 'PENDING' &&val.INCLUDED_IN_PMLIST !== 'N').length /totalP)  * 100).toFixed(0):0
    
    let completionP = (this.props.currentPmList.PM_TYPE_NAME === 'GO95' ||this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION') && !!this.props.currentPmList.PO_NUM  && this.props.pmGridDetailsDraft.length > 0? (this.props.pmGridDetailsDraft.filter(val => val.PM_ITEM_STATUS == 'COMPLETED' && val.INCLUDED_IN_PMLIST !== 'N').length / totalP * 100).toFixed(0) :0
    let acceptedP = (this.props.currentPmList.PM_TYPE_NAME === 'GO95' ||this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION') && !!this.props.currentPmList.PO_NUM  && this.props.pmGridDetailsDraft.length > 0? (this.props.pmGridDetailsDraft.filter(val => val.PM_ITEM_STATUS == 'ACCEPTED' && val.INCLUDED_IN_PMLIST !== 'N').length / totalP  * 100).toFixed(0):0
    let receivedP = (this.props.currentPmList.PM_TYPE_NAME === 'GO95' ||this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION') && !!this.props.currentPmList.PO_NUM  && this.props.pmGridDetailsDraft.length > 0? (this.props.pmGridDetailsDraft.filter(val => val.PM_ITEM_STATUS == 'RECEIVED' && val.INCLUDED_IN_PMLIST !== 'N').length / totalP * 100).toFixed(0) :0
    let declinedP = (this.props.currentPmList.PM_TYPE_NAME === 'GO95' ||this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION') && !!this.props.currentPmList.PO_NUM  && this.props.pmGridDetailsDraft.length > 0? (this.props.pmGridDetailsDraft.filter(val => val.PM_ITEM_STATUS == 'DECLINED' && val.INCLUDED_IN_PMLIST !== 'N').length / totalP  * 100).toFixed(0):0
    let cancelledP = (this.props.currentPmList.PM_TYPE_NAME === 'GO95' ||this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION') && !!this.props.currentPmList.PO_NUM  && this.props.pmGridDetailsDraft.length > 0? (this.props.pmGridDetailsDraft.filter(val => val.PM_ITEM_STATUS == 'CANCELLED' && val.INCLUDED_IN_PMLIST !== 'N').length / totalP * 100).toFixed(0) :0
    let closedP = (this.props.currentPmList.PM_TYPE_NAME === 'GO95' ||this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION') && !!this.props.currentPmList.PO_NUM  && this.props.pmGridDetailsDraft.length > 0? (this.props.pmGridDetailsDraft.filter(val => val.PM_ITEM_STATUS == 'CLOSED' && val.INCLUDED_IN_PMLIST !== 'N').length / totalP * 100).toFixed(0):0
        return (
            <div className="Col Col-12 no-padding">
          <div className="card-header  text-left  font-weight-bold card-styles row" >
            
            <div className='col-md text-center border percentage-div'>
                Pending : {pendingP}%
            </div>
             <div className='col-md text-center border  percentage-div'>
               Vendor Completed : {completionP}%
            </div>
             <div className='col-md text-center border  percentage-div'>
                NA Accepted : {acceptedP}%
            </div>
             <div className='col-md text-center border  percentage-div'>
                NA Declined : {declinedP}%
            </div>
            <div className='col-md text-center border  percentage-div'>
                PO Received : {receivedP}%
            </div>
             <div className='col-md text-center border  percentage-div'>
                PO Closed : {closedP}%
            </div>
             <div className='col-md text-center border  percentage-div'>
                PO Cancelled : {cancelledP}%
            </div>
            

           
          </div>

         <div className ='row'>
            <DataGrid 
              columns={this.props.currentPmList.PM_TYPE_NAME === 'GO95'  ? columnsGO95 :this.props.currentPmList.PM_TYPE_NAME === 'TOWER INSPECTION' ? columnsGO95.filter(i => i.field !== 'INSP_STATUS'): columns}
              rows={!modfdGridDetails ? [] : modfdGridDetails}
              apiRef={this.apiRef}
              columnHeaderHeight={35}
              rowHeight={30}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 15, 20]}
              getRowId={this.getRowId}
              onRowClick={(e)=> this.onRowClicked(this.props.currentPmList.PM_TYPE_NAME, e)}
              sx={{
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold',  },
                fontSize: '1rem',
                minHeight: 200,
                '& .orange-row': { background: 'orange',
                  '&:hover': {
                    background: 'orange',
                    cursor: 'default'
                  },
                  '&.Mui-selected': {
                    background: 'orange',
                    cursor: 'default',
                    '&:hover': {
                    background: 'orange',
                    cursor: 'default'
                  }
                  },                  
                },
                '& .MuiTablePagination-toolbar > *': {
                    fontSize: '1rem'
                },
                '& .MuiTablePagination-toolbar': {
                  alignItems: 'flex-end'
                },
                '& .MuiTablePagination-input': {
                  marginBottom: '7px'
                },
              }}
              getRowClassName={(params)=> {
                return params.row.workorder_status == 'PO_REQUEST' && params.row.quote_statuses == 'AWAITING_PO' ? 'orange-row' : ''
              }}
            />
         </div>
         {" "}
      {this.state.isModalshown ? this.renderPmDetailsModal() : null}
      {this.state.isModalshownGO95 && 
      <Modal  title={`Pole Inspection ${title.site_id}  ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`}  handleHideModal={this.handleHideModalGO95} 
        style={{ width: this.state.selectedGO95.PM_ITEM_STATUS === "COMPLETED" ? "75%" : "90%", maxWidth: "90%", display:"block", marginTop:"30px" }}>
        <GO95Inspection 
          selectedGO95={this.state.selectedGO95} 
          handleHideModalGO95={this.handleHideModalGO95} 
          notiref={this.props.notiref} 
          // title={title}
        />
    </Modal>}
    {this.state.isModalshownTOWER && (<Modal  title={`Tower Inspection ${titleTOWER.site_id}  ${titleTOWER.site_name}  ${titleTOWER.PO}  ${titleTOWER.Line}  ${titleTOWER.Schedule}`}  handleHideModal={this.handleHideModalTOWER} style={{ width: "90%", maxWidth: "90%", display:"block", marginTop:"30px" }}>
        <TowerInspection selectedTOWER={this.state.selectedTOWER} handleHideModalTOWER={this.handleHideModalTOWER} notiref={this.props.notiref} title={titleTOWER} currentPmList={this.props.currentPmList}/>
    </Modal>)}
       </div>
        )
         
    }
}

export default PMCreatedSites

