import React, { Component } from "react"
import Select from 'react-select'
import moment from "moment"
import { startDownload } from "../VendorDashboard/utils"
import RefreshIcon from '../sites/images/RefreshIcon.png'
import ReactTooltip from 'react-tooltip'
import { fetchCbandTools, downloadMMUResult, mmuLinkDisable, mmuLinkEnable, loadCqData, generateValidationMMU } from "../sites/actions"
import Loader from '../Layout/components/Loader'
import PropTypes, { bool } from "prop-types"
import { connect } from "react-redux"
import { Map, fromJS, List } from "immutable"
import ViewHealthCheck from "../sites/components/ViewHealthCheck"
import { DataGrid, useGridApiRef } from "@mui/x-data-grid"
import {postTaskType} from '../SiteTools/actions'
import {startCase} from 'lodash';

class CbandTools extends React.Component {
  static propTypes = {
    fetchCbandTools: PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      testTypeDropdown: [{ value: 'LS6 MMU Links Check', label: 'LS6 MMU Links Check' }],
      testType: '',
      vduList: [],
      vduIdDropdown: [],
      vduId: '',
      iloIp: '',
      hostname: '',
      cbandToolsTableData: [],
      errors: false,
      errorMessage: '',
      cqDataError: '',
      running: false,
      inProgresError: '',
      cqError: false,
      success: false,
      successMessage: '',
      isModalshown: false,
      viewDetail: {},
      requestId: '',
      timeStamp: '',
      workOrProjId : null
    }
    this.getFormValues = this.getFormValues.bind(this);
    this.onClickDownload = this.onClickDownload.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.handleGenerateValidatilon = this.handleGenerateValidatilon.bind(this);
    this.enableBtn = this.enableBtn.bind(this);
    this.disableBtn = this.disableBtn.bind(this);

  }

  componentDidMount() {
    let {selectedRow, samsung5gnodes, isWO} = this.props;
    let Id = isWO ?  selectedRow?.workorder_id : selectedRow?.proj_number;
    this.setState({workOrProjId : Id},()=>{
      if(!isWO){
        this.getFormValues();
      }else{
        let vduIdDropdown = samsung5gnodes.length > 0 ? samsung5gnodes.map(id => {
          return {
            "label": id.node,
            "value": id.node
          }
        }) : []
        let vduList =  samsung5gnodes.length > 0 ? samsung5gnodes.map(id => {
          return {
            "vdu_id": id.node
          }
        }) : []
        this.setState({ vduIdDropdown: vduIdDropdown, vduList: vduList })
      }
      this.handleRefresh()
    })

  }

  handleRefresh = () => {
   if (!this.props.sitetools) {
    this.refreshData()
  }
  }

  async disableBtn() {
    await this.props.mmuLinkDisable()
  }

  async enableBtn() {
    await this.props.mmuLinkEnable()
  }
  getMMUData = () => {
    this.getCbandTools(this.state.workOrProjId).then(res => {
      this.checkRequestDisable()
    })
  }
  async getCbandTools(project_id) {
    await this.props.fetchCbandTools(this.props.loginId, project_id).then(res => {
      if (res.type == "FETCH_CBANDTOOLS_SUCCESS")
        this.setState({ cbandToolsTableData: res && res.cbandTools && res.cbandTools.cfg_requests })
      if (res.type == "FETCH_CBANDTOOLS_FAILURE") {
        this.setState({ errors: true, errorMessage: res.errors[0].message, cbandToolsTableData: [] })
      }
    })
    this.setState({ vduId: '', iloIp: '', testType: '', hostname: '', isModalshown: false })
  }

  async refreshData() { 
    let {workOrProjId} = this.state;
    this.getCbandTools(workOrProjId).then((res) =>
      this.checkRequestDisable())
    this.timer = setInterval(() => {
      this.getCbandTools(workOrProjId).then((res) => {
        this.checkRequestDisable();
      })
    }, 300000)
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  checkRequestDisable() {
    let filterdByTime = this.state.cbandToolsTableData && this.state.cbandToolsTableData.filter(ct => ct.STATUS.toLowerCase() === "running" &&
      moment.utc(moment.utc().format('YYYY-MM-DD HH:mm')).diff(moment.utc(moment.utc(ct.CREATED_ON, 'YYYY-MM-DD HH:mm').subtract(5,'hours')), 'minutes') < 40
     )
    if (filterdByTime && filterdByTime.length > 0) {
      let { success } = this.state
      this.disableBtn();
      this.setState({ running: success ? false : true, inProgresError: "MMU Link Test is Running." })
    }
    else {
      this.setState({ running: false })
      this.enableBtn();
    }
  }

  async getFormValues() {
    let cqDataReq = {
      "user_id": this.props.user.userid,
      "cfg_request": {
        "test_type": "",
        "vdu_type01": "LS6",
        "project_id": this.state.workOrProjId
      }
    }
    this.props.loadCqData(this.props.loginId, cqDataReq).then(res => {
      if (res.type == "LOAD_CQ_DATA_SUCCESS") {
        let vdu_list = res.loadCqData && res.loadCqData.cfg_request && res.loadCqData.cfg_request.vdu_list ? res.loadCqData.cfg_request.vdu_list : []
        let cqError = res.loadCqData && res.loadCqData.errors && res.loadCqData.errors.length > 0;
        if (cqError) {
          this.setState({ cqError: true, cqDataError: res.loadCqData.errors[0].detail })
        }
        let vduIdDropdown = vdu_list.length > 0 ? vdu_list.map(id => {
          return {
            "label": id.vdu_id,
            "value": id.vdu_id
          }
        }) : []
        this.setState({ vduIdDropdown: vduIdDropdown, vduList: vdu_list })
      } else if (res.type == "LOAD_CQ_DATA_FAILURE") {
        this.setState({ cqError: true, cqDataError: res.loadCqData.errors[0].detail })
      }
    })
  }
  handleTypeChange = e => {
    this.setState({ testType: e ? e.value : '' })
  }

  handleVduChange = e => {
    let { vduList } = this.state
    let vdu = e && vduList.find(v => v.vdu_id == e.value)
    this.setState({
      vduId: e ? e.value : '',
      iloIp: e ? vdu.ilo_ip : '',
      hostname: e ? vdu.hostname : ''
    })
  }

  async handleGenerateValidatilon() {
    let { testType, vduId, vduList } = this.state;
    let { isWO } = this.props;
    let vdu = vduList.find(v => v.vdu_id == vduId)
    let generatePayload = {
      "user_id": this.props.user.userid,
      "cfg_request": {
        "project_id": this.state.workOrProjId,
        "clusterName": isWO ? "" : "not found",
        "namespaceName": isWO ? "" : "not found",
        "test_type": testType,
        "oam_ip": vdu.oam_ip,
        "f1c_gw_ip": vdu.f1c_gw_ip,
        "vdu_type": vdu.vdu_type,
        "oam_gw_ip": vdu.oam_gw_ip,
        "hostname": vdu.hostname,
        "vdu_id": vduId,
        "vdu_type01": isWO ? "" : "LS6 ZT",
        "edn_mgmt_ip": vdu.edn_mgmt_ip,
        "edn_mgmt_gw": vdu.edn_mgmt_gw,
        "ilo_ip": vdu.ilo_ip
      }
    }
    await this.props.generateValidationMMU(this.props.loginId, generatePayload).then(async res => {
      if (res.type == 'GENERATE_VALIDATION_SUCCESS') {
        await this.setState({ success: true, running: false, successMessage: res.generateValidationMMU && res.generateValidationMMU.output.message, isModalshown: false })

        setTimeout(() => {
          this.setState({ success: false, running: true })
        }, 10000)
     if (!this.props.sitetools) {
      this.getMMUData()
    }
      }
      else {
        this.setState({ cqError: true, cqDataError: "Failed to Request MMU Link test", isModalshown: false })
      }
    })
  }

  triggerCbandTaskType = () => {
    const { selectedRow, user, loginId,sitetools } = this.props;
    if (!selectedRow || !sitetools) return;

    const payload = {
      payload: {
        type_name: "Samsung CBAND Tools",
        external_team_support: "",
        users: [
          {
            assigned_to: `${startCase(user?.vendor_name || '')}-${(this.props?.loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
            name: `${startCase(user?.fname || '')} ${startCase(user?.lname || '')}`.trim()
          }
        ],
        start_date: moment().format('YYYY-MM-DD'),
        sites: [
          {
            site_unid: selectedRow?.site_unid,
            switch_name: selectedRow?.switch,
            switch_unid: "",
            site_id: selectedRow?.site_id,
            site_name: selectedRow?.site_name,
            assigned_to: `${startCase(user?.vendor_name || '')}-${(this.props?.loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`
          }
        ],
        market_code: null,
        create_date: moment().format('YYYY-MM-DD'),
        email_address: null,
        include_healthcheck: "0",
        include_sites: "1",
        due_date: moment().format('YYYY-MM-DD'),
        market: user?.vendor_area,
        submarket: user?.vendor_region,
        description: `Vendor Portal Inquiry - Samsung CBAND Tools`,
        command_list_5g: "",
        user_id: `${startCase(user?.vendor_name || '')}-${(this.props?.loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
        switches: [],
        bucket_truck: "0",
        drone: "0",
        ladder: "0",
        fuel_truck: "0",
        gc_email: "",
        created_by: `${startCase(user?.vendor_name || '')}-${(this.props?.loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
        notify: false,
        fromsystem: "OPSPORTAL"
      }
    };

    this.props.postTaskType(payload);
  };

  onGridReady = params => {
    this.gridOptions = params
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    this.gridApi.setFilterModel(null)
    if (params.api && params.api.sizeColumnsToFit) { params.api.sizeColumnsToFit() }
    params.api.sizeColumnsToFit()
  };

  EyeIconRenderer = (params) => {
     const { row } = params
    return (
      <div className="col-md-12 no-padding">
        <div className="col-md-12 float-left" onClick={() => this.onClickView(row)}>
          <i className="fa fa-eye" title="View" style={{ "color": "rgb(255, 167, 38)", "fontSize": "18px", "cursor": "pointer" }}
           ></i>
        </div>
      </div>
    )
  }

  async onClickView(row) {
    await this.props.downloadMMUResult(this.props.loginId, row.SCT_REQ_HEADER_ID).then((res) => {
      let enodeb_id = res.downloadResult && res.downloadResult.req_details && res.downloadResult.req_details.enodeb_num || ''
      let output = [res.downloadResult && res.downloadResult.req_details && res.downloadResult.req_details.config_txt] || []
      this.setState({ isModalshown: true, viewDetail: { enodeb_id, output }, requestId: row.SCT_REQ_HEADER_ID, timeStamp: row.CREATED_ON })
    })
  }
  async onClickDownload(row) {
    await this.props.downloadMMUResult(this.props.loginId, row.SCT_REQ_HEADER_ID).then((res) => {
      let text = res.downloadResult && res.downloadResult.req_details && res.downloadResult.req_details.config_txt
      let blob = new Blob([text], {
        type: "text/plain;charset=utf-8"
      });
      let filename = `Req_${row.SCT_REQ_HEADER_ID}_mmu_test_result.txt`
      startDownload(blob, filename);
    })
  }
  DownloadIconRenderer = (params) => {
    const { row } = params
    return (
      <div className="col-md-12 no-padding">
        <div className="col-md-12 float-left" onClick={() => this.onClickDownload(row)}>
          <i className="fa fa-download" title="Download" style={{ "color": "rgb(255, 167, 38)", "fontSize": "18px", "cursor": "pointer" }}
           ></i>
        </div>
      </div>
    )
  }

  renderStatusLoading = () => {

    return (<
      Loader color="#cd040b"
      size="35px"
      margin="4px"
      className="text-center" />
    )
  }
  getRowId = (row) => {
    return row.SCT_REQ_HEADER_ID
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
    let { cbandToolsLoading, generateValidationLoading, mmudownloadLoading, cqDataLoading } = this.props
    let disableBtn = this.state.testType && this.state.vduId ? false : true
    if (cbandToolsLoading || generateValidationLoading || cqDataLoading) {
      return this.renderStatusLoading()
    }
    let columns = [
      {
        headerName: "Requested On (UTC)",
        field: "CREATED_ON",
        flex: 1.6,
      },
      {
        headerName: "Requested By",
        field: "CREATED_BY",
        flex: 1,
      },
      {
        headerName: "Status",
        field: "STATUS",
        flex: 0.7,
      },
      {
        headerName: "Request Id",
        field: "SCT_REQ_HEADER_ID",
        filterable:true,
        flex: 1,
      },
      {
        headerName: "VDU ID",
        field: "ENODEB_ID",
        flex: 1,
      },
      {
        headerName: "Test Type",
        field: "ACTION",
        flex: 1,
      },
      {
        headerName: "Description",
        field: "DESCRIPTION",
        filterable:true,
        flex: 1,
      },
      {
        headerName: "View Result",
        field:"View Result",
        renderCell: row => this.EyeIconRenderer(row),
        filterable:false,
        flex: 0.7,
      },
      {
        headerName: "Download Result",
        renderCell: row => this.DownloadIconRenderer(row),  
        flex: 0.7,
        filterable:false
      }
    ]
    let cfg_requests = this.state.cbandToolsTableData && this.state.cbandToolsTableData
      // .map(s =>
      // ({
      //   ...s,
      //   CREATED_ON: s.CREATED_ON ? moment.utc(s.CREATED_ON).format('YYYY-MM-DD') : '',
      // })
      // )


    return (

      <div>
        <div style={{ padding: 10 }}>
          <label style={{float:"left",width:"9%"}} className="Form-label mt-1" htmlFor="cell" >Test type <span style={{ color: 'red' }}>*</span></label>
          <span style={{display:"inline-block", width:"33%"}}>
            <Select
              name="Test Type"
              value={{value:this.state.testType, label:this.state.testType}}
              className="col-12 col-md-12 no-padding"
              onChange={(e) => this.handleTypeChange(e)}
              options={this.state.testTypeDropdown}
              required
            />
         </span>
         <label style={{display:"inline-block", width:"10%", position:"relative", left:'5em'}} className="Form-label mt-1" htmlFor="cell" >VDU ID<span style={{ color: 'red' }}>*</span></label>
          <span style={{display:"inline-block", width:"33%"}}>
            <Select
              name="VDU ID"
              value={{value: this.state.vduId, label: this.state.vduId}}
              // value={this.state.vduId}
              className="col-12 col-md-12 no-padding"
              onChange={(e) => this.handleVduChange(e)}
              options={this.state.vduIdDropdown}
              required
            />
          </span>
        
        </div>
        
        <div style={{ padding: 10 }}>
          <div style={{ display: 'inline-block', width: '85%', paddingLeft: '-100px' }}><button className="col-sm-2 float-right btn-sm mr-4" style={{ width: 300 }} onClick={() => { this.triggerCbandTaskType(); this.handleGenerateValidatilon();}} disabled={disableBtn || this.props.isDisabled}>Request</button>  </div>
          <div style={{ display: 'inline-block' }}> <a  onClick={() => {
      if (!this.props.sitetools) {
        this.getMMUData()
      }
    }}  className="pointer float-right" data-tip data-for="Refresh" >
            <small>
              <img src={RefreshIcon} style={{ height: '20px' }} />
            </small>
          </a>
            <ReactTooltip id="Refresh" place="top" effect="float">
              <span>Refresh</span>
            </ReactTooltip>
          </div>
        </div>


        <div style={{ padding: 10 }}>
          <div style={{ float: 'left', width: '100%' }}></div>
          {this.state.success ?
            <div className='text-success'>
              <label>{this.state.successMessage} </label>
            </div>
            : null
          }
          {this.state.errors ?
            <div className='text-danger'>
              <label>{this.state.errorMessage} </label>
            </div>
            : null
          }
          {this.state.running ?
            <div className='text-warning'>
              <label>{this.state.inProgresError} </label>
            </div>
            : null
          }
          {this.state.cqError ? <div className='text-danger'>
            <label>{this.state.cqDataError} </label>
          </div>
            : null}    
          <DataGrid
          columns={columns}
          rows={cfg_requests}
          getRowId={this.getRowId}
          apiRef={this.apiRef}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5}
            },
          }}
          rowHeight={30}
          columnHeaderHeight={35}
          disableRowSelectionOnClick
          componentsProps={{ panel: { disablePortal: true } }}
          sx={{ 
            
          '& .MuiTablePagination-toolbar > *': {fontSize: '1rem'},
          '& .MuiTablePagination-toolbar': {alignItems: 'flex-end'},
          '& .MuiTablePagination-input': {marginBottom: '7px'},
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
          fontSize:'13px',
          minHeight:'100px' 
          }}
          />
              {mmudownloadLoading &&
        < Loader color="#CD040B"
          size="35px"
          margin="4px"
          className="text-center" />}

        </div>
        {this.state.isModalshown && !mmudownloadLoading ?
          <ViewHealthCheck
            requestId={this.state.requestId}
            requestType={"LS6 MMU Links Check"}
            cbandtools = {true}
            hcData={[this.state.viewDetail] || []}
            timeStamp={this.state.timeStamp}
            close={() => this.setState({ isModalshown: false })}
          /> : null
        }
      </div>

    )
  }
}

function stateToProps(state, props) {
  let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
  let user = state.getIn(["Users", "entities", "users", loginId], Map()).toJS()
  let cbandToolsData = state.getIn(["Sites", loginId, "cbandToolsData"], List())
  let cbandToolsLoading = state.getIn(["Sites", loginId, "siteDetails", "cbandToolsLoading"], false)
  let isDisabled = state.getIn(["Sites", "isDisabled"], false)
  let generateValidationLoading = state.getIn(["Sites", loginId, "siteDetails", "validationLoading"], false)
  let mmudownloadLoading = state.getIn(['Sites', loginId, 'siteDetails', 'mmudownloadLoading'])
  let cqDataLoading = state.getIn(["Sites", loginId, "siteDetails" , "cqDataLoading"], false)
  return {
    cbandToolsData,
    isDisabled,
    cbandToolsLoading,
    user,
    loginId,
    generateValidationLoading,
    mmudownloadLoading,
    cqDataLoading
  }
}
export default connect(stateToProps, { fetchCbandTools, downloadMMUResult, mmuLinkDisable, mmuLinkEnable, loadCqData, generateValidationMMU, postTaskType })(CbandTools)