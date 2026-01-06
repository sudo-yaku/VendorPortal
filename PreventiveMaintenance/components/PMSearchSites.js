import React, { Component } from "react"
import { connect } from "react-redux"
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import { DataGrid } from "@mui/x-data-grid"
import moment from 'moment'
import Loader from '../../Layout/components/Loader'
import Modal from "../../Layout/components/Modal"
import PMModelDetails from './PMModelDetails'
import PMModelDetailsCompleted from './PMModelDetailsCompleted'
import DynamicHvacPm from './DynamicHvacPm'
import config from '../../config'
import TowerInspection from './TowerInspection'
import GO95Inspection from "./GO95Inspection"

class PMSearchSites extends React.Component {

  constructor(props) {
    super(props)
  }
  state = {
    columns: [
      {
        headerName: "PM List Name", field: "PM_LIST_NAME", flex: 1.7
      },
      {
        headerName: "PO", field: "PO_NUM", flex: 1
      },
      {
        headerName: "PS Location Id", field: "PS_LOCATION_ID", flex: 1
      },
      {
        headerName: "Site Id", field: "SITE_ID", flex: 1
      },
      {
        headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 1.6
      },
      {
        headerName: "Status", field: "PM_ITEM_STATUS", flex: 0.8
      },
      {
        headerName: "Due Date", field: "PM_ITEM_DUE_DATE", flex: 0.6
      },

      {
        headerName: "Completed By", field: "COMPLETED_BY", flex: 1.5
      },


    ],



    rowClassRules: {
      "orange-row": function (params) {
        return (params.data.workorder_status == 'PO_REQUEST' && params.data.quote_statuses == 'AWAITING_PO')
      }
    },
    selectedPM: null,
    isModalshown: false,
    isModalshownGO95: false, selectedGO95: null, selectedTOWER:null, isModalshownTOWER:null

  }



  onGridReady = params => {
    this.gridOptions = params
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    this.gridApi.setFilterModel(null)
    if (params.api && params.api.sizeColumnsToFit) { params.api.sizeColumnsToFit() }
    params.api.sizeColumnsToFit()
    this.gridApi.sizeColumnsToFit()
  };
  handleHideModalTOWER = () => this.setState({ isModalshownTOWER: false })
  handleHideModalGO95 = () => this.setState({ isModalshownGO95: false })
  onRowClicked = e => {
    const { user, loginId, vendorId, fetchPMmodelAttributes } = this.props
    // var selectedRows = e.api.getSelectedRows()
    let  selectedRows = [e.row]
    if (selectedRows[0].PM_TYPE_NAME == 'GO95') {
      if (selectedRows[0].PM_ITEM_STATUS !== 'DRAFT') {
        this.setState({ isModalshownGO95: true, selectedGO95: selectedRows[0] })
      }
    }
    else if (selectedRows[0].PM_TYPE_NAME == 'TOWER INSPECTION') {
      if (selectedRows[0].PM_ITEM_STATUS !== 'DRAFT') {
        this.setState({ isModalshownTOWER: true, selectedTOWER: selectedRows[0] })
      }
    }
    
    else {
      if (selectedRows[0].PM_ITEM_STATUS !== 'CANCELLED' && selectedRows[0].PM_ITEM_STATUS !== 'CANCEL' && selectedRows[0].PM_ITEM_STATUS !== 'CLOSED' && ((selectedRows[0].IS_VENDOR_REQUESTED == 'Y' && !!selectedRows[0].PO_NUM && selectedRows[0].IS_COMPLETED === 'N') || selectedRows[0].IS_VENDOR_REQUESTED == 'N')) {

        this.setState({ isModalshown: true, selectedPM: selectedRows[0] })
      }
    }


  };
  renderLoading = () => {
    return (
      <Loader color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center" />
    )
  }
  renderPmDetailsModal() {
    let poItemId = this.state.selectedPM && this.state.selectedPM.PO_ITEM_ID ? this.state.selectedPM.PO_ITEM_ID : ''
    let isPmSelected = this.state.selectedPM && (poItemId == 'EXP-GNRTRS-CELL' ||
      poItemId == 'EXP-HVAC-MAIN-CELL' || this.state.selectedPM.PM_TYPE_NAME == 'GENERATOR PM' || this.state.selectedPM.PM_TYPE_NAME == 'HVAC PM') ? true : false

    let title = {
      site_id: (!!this.state.selectedPM && !!this.state.selectedPM.SITE_ID) ? `Site Id : ${this.state.selectedPM.SITE_ID}` : '',
      site_name: (!!this.state.selectedPM && !!this.state.selectedPM.PM_LOCATION_NAME) ? `Site Name : ${this.state.selectedPM.PM_LOCATION_NAME}` : '',
      PO: (!!this.state.selectedPM && !!this.state.selectedPM.PO_NUM) ? `PO : ${this.state.selectedPM.PO_NUM}` : '',
      Line: (!!this.state.selectedPM && !!this.state.selectedPM.LINE) ? `Line : ${this.state.selectedPM.LINE}` : '',
      Schedule: (!!this.state.selectedPM && !!this.state.selectedPM.SCHEDULE) ? `Schedule : ${this.state.selectedPM.SCHEDULE}` : '',
      location_id: this.props.esaFlag=="Y" ? this.state.selectedPM?.MDG_ID ? `MDGLC : ${this.state.selectedPM.MDG_ID}` : '' : this.state.selectedPM?.PS_LOCATION_ID ? `Location id : ${this.state.selectedPM.PS_LOCATION_ID}` : '',
    }
    let data = JSON.stringify(this.state.selectedPM)
    if (this.state.selectedPM.PM_ITEM_STATUS !== 'PENDING' && this.state.selectedPM.PM_ITEM_STATUS !== 'PENDING_DRAFT' &&  !!this.state.selectedPM.PO_NUM && ((this.state.selectedPM.PM_TYPE_NAME != 'HVAC PM') || !config.enableDynamicHvacTmplt)) {

      return (<div className='enable'>
        <Modal large={true} handleHideModal={this.handleHideModal}
          data-backdrop="static" data-keyboard="false"
          style={{ width: "80%", maxWidth: "80%", display:"block", marginTop:"30px" }}
          title={`${title.site_id} ${title.location_id} ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`} >

          <PMModelDetailsCompleted title={title} handleHideModal={this.handleHideModal} notiref={this.props.notiref} currentPmListID={this.state.selectedPM.PM_LIST_ID} PMDetails={this.state.selectedPM} pmType={this.state.selectedPM.PM_TYPE_NAME} searchString={this.props.searchString} isPmSelected={isPmSelected} poItemId={poItemId} />
        </Modal></div>)

    } else {
      if (this.state.selectedPM.PM_TYPE_NAME === 'HVAC PM' && !!this.state.selectedPM.PO_NUM && config.enableDynamicHvacTmplt) {
        return (<div>
          <Modal large={true} handleHideModal={this.handleHideModal}
            data-backdrop="static" data-keyboard="false"
            style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}
            title={`${title.site_id} ${title.location_id}  ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`}>

            <DynamicHvacPm title={title} initPMDashboard={this.props.initPMDashboard} handleHideModal={this.handleHideModal} notiref={this.props.notiref} currentPmList={this.state.selectedPM} PMDetails={this.state.selectedPM}
              pmType={this.state.selectedPM.PM_TYPE_NAME} isPmSelected={isPmSelected} searchString={this.props.searchString} poItemId={poItemId} pmListNamepdf={this.state.selectedPM.PM_LIST_NAME} 
              poNum={this.state.selectedPM.PO_NUM} currentPmListID={this.state.selectedPM.PM_LIST_ID} />
          </Modal></div>)
      }
      else {
        return (<div className='enable'>
          <Modal large={true} handleHideModal={this.handleHideModal}
            data-backdrop="static" data-keyboard="false"
            style={{ width: "80%", maxWidth: "80%", display: "block", marginTop: "30px" }}
            title={`${title.site_id} ${title.location_id}  ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`}>

            <PMModelDetails title={title} initPMDashboard={this.props.initPMDashboard} handleHideModal={this.handleHideModal} notiref={this.props.notiref} currentPmListID={this.state.selectedPM.PM_LIST_ID} PMDetails={this.state.selectedPM} pmType={this.state.selectedPM.PM_TYPE_NAME} searchString={this.props.searchString} isPmSelected={isPmSelected} poItemId={poItemId} pmListNamepdf={this.state.selectedPM.PM_LIST_NAME} 
          poNum={this.state.selectedPM.PO_NUM} />
          </Modal></div>)
      }
    }


  }
  handleHideModal = () => {
    this.setState({ isModalshown: false })

    return;
  }
  modifyGridDetails = () => {
    if (!!this.props.searchResults && this.props.searchResults.length > 0) {
      return this.props.searchResults.map((searchResult) => ({
        ...searchResult,
        PM_ITEM_STATUS: searchResult.PM_ITEM_STATUS,
        // PM_ITEM_DUE_DATE : searchResult.PM_ITEM_DUE_DATE ? moment(searchResult.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : '',
        PM_ITEM_COMPLETED_DATE: searchResult.PM_ITEM_COMPLETED_DATE ? moment(searchResult.PM_ITEM_COMPLETED_DATE.split(' ')[0]).format('MM/DD/YYYY') : '',
        // LAST_UPDATED_DATE : searchResult.LAST_UPDATED_DATE ? moment(searchResult.LAST_UPDATED_DATE).format('MM/DD/YYYY') : '',
        COMPLETED_BY: searchResult.COMPLETED_BY ? searchResult.COMPLETED_BY : '',
        PM_ITEM_COMPLETED_DATE_STAMP:searchResult.PM_ITEM_COMPLETED_DATE ? searchResult.PM_ITEM_COMPLETED_DATE : ''
      }))
    }

    else {
      return []
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

  render() {
    
    let titlego95 = {
      site_id: (!!this.state.selectedGO95 && !!this.state.selectedGO95.SITE_ID) ? `Site Id : ${this.state.selectedGO95.SITE_ID}` : '',
      site_name: (!!this.state.selectedGO95 && !!this.state.selectedGO95.PM_LOCATION_NAME) ? `Site Name : ${this.state.selectedGO95.PM_LOCATION_NAME}` : '',
      PO: (!!this.state.selectedGO95 && !!this.state.selectedGO95.PO_NUM) ? `PO : ${this.state.selectedGO95.PO_NUM}` : '',
      Line: (!!this.state.selectedGO95 && !!this.state.selectedGO95.LINE) ? `Line : ${this.state.selectedGO95.LINE}` : '',
      Schedule: (!!this.state.selectedGO95 && !!this.state.selectedGO95.SCHEDULE) ? `Schedule : ${this.state.selectedGO95.SCHEDULE}` : '',
    }
    let titleTOWER = {
      site_id: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.PM_SITE_ID) ? `Site Id : ${this.state.selectedTOWER.PM_SITE_ID}` : '',
      site_name: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.PM_LOCATION_NAME) ? `Site Name : ${this.state.selectedTOWER.PM_LOCATION_NAME}` : '',
      PO: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.PO_NUM) ? `PO : ${this.state.selectedTOWER.PO_NUM}` : '',
      Line: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.LINE) ? `Line : ${this.state.selectedTOWER.LINE}` : '',
      Schedule: (!!this.state.selectedTOWER && !!this.state.selectedTOWER.SCHEDULE) ? `Schedule : ${this.state.selectedTOWER.SCHEDULE}` : '',
    }
    return (
      <div className="container-fluid no-padding">
        <div className="row card-header bg-dark text-left text-light font-weight-bold card-styles w-100 mr-0 ml-0" >
          <div className="col-5"></div>
          <div className="col-4"><h4>search results for "{this.props.searchString}"</h4></div>
          <div className="col-3">
            {<a onClick={this.props.closeSearchTable.bind(this, true)} ><i className="fa fa-times float-right vz-pointer" ></i></a>}
          </div>


        </div>

        {!!this.props.searchResultsLoading ? this.renderLoading() : <DataGrid 
          rows={this.modifyGridDetails()}
          columns={this.props.esaFlag == "Y" ? this.state.columns.filter(obj => obj.headerName!== 'PS Location Id') : this.state.columns}
          apiRef={this.apiRef}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 15]}
          onRowClick={this.onRowClicked}
          localeText={{
            noResultsOverlayLabel: 'No result found !!!',
          }}
          getRowId={this.getRowId}
          rowHeight={30}
          columnHeaderHeight={35}
          sx={{
            width: '100%',
            fontSize: '1rem',
            minHeight: 200,
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold',  },
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
        />}
        {" "}
        {this.state.isModalshown ? this.renderPmDetailsModal() : null}
        {this.state.isModalshownGO95 && 
        <Modal title={`Pole Inspection ${titlego95.site_id}  ${titlego95.site_name}  ${titlego95.PO}  ${titlego95.Line}  ${titlego95.Schedule}`} handleHideModal={this.handleHideModalGO95} style={{ width: "90%", maxWidth: "90%", display:"block", marginTop:"30px" }}>
          {/* <GO95InspectionResult selectedGO95={this.state.selectedGO95} handleHideModalGO95={this.handleHideModalGO95} notiref={this.props.notiref} title={titlego95} /> */}
          <GO95Inspection 
            selectedGO95={this.state.selectedGO95} 
            handleHideModalGO95={this.handleHideModalGO95} 
            notiref={this.props.notiref} 
            // title={title}
          />
        </Modal>}
        {this.state.isModalshownTOWER && (<Modal  title={`Tower Inspection ${titleTOWER.site_id}  ${titleTOWER.site_name}  ${titleTOWER.PO}  ${titleTOWER.Line}  ${titleTOWER.Schedule}`}  handleHideModal={this.handleHideModalTOWER} style={{ width: "90%", maxWidth: "90%", display:"block", marginTop:"30px" }}>
        <TowerInspection selectedTOWER={this.state.selectedTOWER} handleHideModalTOWER={this.handleHideModalTOWER} notiref={this.props.notiref} title={titleTOWER} currentPmList={this.state.selectedTOWER} pmListItemIdSearch = {this.state.selectedTOWER.PM_LIST_ITEM_ID}/>
    </Modal>)}
      </div>
    )
  }

}

function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user.toJS().vendor_id
  let searchResultsLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSearchresultsLoading"])
  let searchResults = !!state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmfilteredresults"]) ? state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmfilteredresults"]).toJS() : []
  let errorSearchResults = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSearchresultsfailed"])
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;


  return {
    user,
    loginId,
    vendorId,
    searchResultsLoading,
    searchResults,
    errorSearchResults,
    esaFlag



  }

}
export default connect(stateToProps, { ...pmActions })(PMSearchSites)