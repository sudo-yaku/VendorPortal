import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import Modal from "../../Layout/components/Modal"
import PMModelDetails from './PMModelDetails'
import PMModelDetailsCompleted from './PMModelDetailsCompleted'
import DynamicHvacPm from './DynamicHvacPm'
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import moment from 'moment'
import config from '../../config'
import FireInspection from "./FireInspection"
import BatteryForm from './BatteryForm'
import { DataGrid } from "@mui/x-data-grid"


class PMListItemDetails extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isModalshown: false,
      isModalshownHvac: false,
      isModalShownFire: false,
      selectedPM: null,
      selectedMultPM: null,
      selectedPMHvac: null,
      isModalDialog: false,
      isModalShownBattery: false,
      selectedPMBattery: null,
      isRowSelectable: function (rowNode) {
        return rowNode.data ? true : false;
      },
      markAsCompleted: false,
      attchmnts: [],
      submarketUnidData: null,
      sitesInfo: null,
      towerAttributeDataNew: [],
    }
  }


  handleExportToExcelClick = () => {
    let tableName = this.props.currentPmList.PM_LIST_NAME
    const data = []
    let poNumberVariable, pmListNameVariable
    let input0 = this.props.currentPmList
    const pages0 = Array.isArray(input0) ? input0 : [input0]
    for (let page = Object.keys(pages0), j = 0, end = page.length; j < end; j++) {
      let key = page[j], value = pages0[key]
      poNumberVariable = value.PO_NUM
      pmListNameVariable = value.PM_LIST_NAME
    }

    let input1 = this.props.pmGridDetails
    const pages1 = Array.isArray(input1) ? input1 : [input1]
    for (let page = Object.keys(pages1), j = 0, end = page.length; j < end; j++) {
      let key = page[j], value = pages1[key]
      let exceldata = {
        "PO#": poNumberVariable,
        "Peoplesoft location ID": value.PS_LOCATION_ID,
        "PM list name": pmListNameVariable,
        "Site ID": value.SITE_ID,
        "Site Name": value.PM_LOCATION_NAME,
        "Line #": value.LINE,
        "Schedule #": value.SCHEDULE,
        "PM Status": value.PM_ITEM_STATUS,
        "Cost": value.PM_COST,
        "Due Date": (value.PM_ITEM_DUE_DATE ? moment(value.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : ''),
        "Completed Date": (value.PM_ITEM_COMPLETED_DATE ? moment(value.PM_ITEM_COMPLETED_DATE).format('MM/DD/YYYY') : ''),
        "Completed By": value.COMPLETED_BY
      }
      data.push(exceldata)
    }
    let ws = XLSX.utils.json_to_sheet(data)
    let wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "PMList")
    let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' })
    let buf = new ArrayBuffer(wbout.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `${tableName}.xlsx`)
  }

  onRowClicked = async (pmTypeName, e) => {
    // var selectedRows = e.api.getSelectedRows()
    var selectedRows = [e.row]
    let poItemId = selectedRows[0] && selectedRows[0].PO_ITEM_ID ? selectedRows[0].PO_ITEM_ID : ''
    let isPmSelected = selectedRows[0] && this.props.currentPmList && (poItemId == 'EXP-GNRTRS-CELL' ||
      poItemId == 'EXP-HVAC-MAIN-CELL' || this.props.currentPmList.PM_TYPE_NAME == 'GENERATOR PM' || this.props.currentPmList.PM_TYPE_NAME == 'HVAC PM') ? true : false
    if (["FIRE INSPECTION PM", "FIRE EXTINGUISHER PM", "EXTERMINATOR PM", "LANDSCAPING PM"].includes(this.props.currentPmList.PM_TYPE_NAME)) {
      if (["PENDING", "COMPLETED"].includes(selectedRows[0].PM_ITEM_STATUS)) {
        await this.setState({ isModalShownFire: true, selectedPM: selectedRows[0] })
      } else {
        await this.setState({ isModalShownFire: false, selectedPM: selectedRows[0] })
      }
    } else if (this.props.currentPmList.PM_TYPE_NAME == 'BATTERY PM') {
      await this.setState({ isModalShownBattery: true, selectedPM: selectedRows[0] })
    }
    else if(["SNOW REMOVEAL PM"].includes(this.props.currentPmList.PM_TYPE_NAME)) {
      let data  = selectedRows.map(item => item)
      await this.setState({selectedPM: data})
    }
    else {
      if (!["DRAFT", "DRAFT_DD", "DRAFT_REV", "CANCELLED", "CANCEL"].includes(selectedRows[0].PM_ITEM_STATUS)) {
        if (this.props.currentPmList.PM_TYPE_NAME == 'HVAC PM' && !!this.props.currentPmList.PO_NUM && isPmSelected && config.enableDynamicHvacTmplt) {
          await  this.setState({ isModalshownHvac: true, selectedPMHvac: selectedRows[0] })
        } else {
          if (!(this.props.currentPmList && ["SNOW REMOVEAL PM"].includes(this.props.currentPmList.PM_TYPE_NAME))) {
            await  this.setState({ isModalshown: true, selectedPM: selectedRows[0] })
          }
        }
      }
    }

    this.initModal();
  };
  onSelectionChanged = (pmTypeName, rowData) => {
    if (pmTypeName == 'LANDSCAPING PM' || pmTypeName == 'SNOW REMOVAL PM') {
      this.setState({ selectedPM: rowData })
    }
  }

  handleHideModalHvac = () => this.setState({ isModalshownHvac: false })
  handleHideModalFire = () => this.setState({ isModalShownFire: false })
  handleHideModalDialog = () => this.setState({ isModalDialog: false })
  handleHideModalBattery = () => this.setState({ isModalShownBattery: false })
  handleHideModal = () => this.setState({ isModalshown: false })

  renderModalDialog = () => {
    return (
      <Modal title="Mark as Complete" data-backdrop="static" data-keyboard="false"
        style={{ width: "60%", maxWidth: "80%", display: "block", marginTop: "60px" }}
        large={false} handleHideModal={this.handleHideModalDialog}>
        <div style={{ textAlign: 'center' }}>
          <b>You are about to complete Multiple PM types</b><br />
          <h4>Are you sure want to complete?</h4>
          <button type="button"
            className="Button--primary u-floatRight"
            onClick={() => this.onSubmit('COMPLETED')}
            style={{ marginRight: "5px", marginTop: '10px' }}>
            Yes
          </button>
        </div>

      </Modal>
    )
  }

  renderPmDetailsModal() {
    let title = {
      site_id: (!!this.state.selectedPM && !!this.state.selectedPM.SITE_ID) ? `Site Id : ${this.state.selectedPM.SITE_ID}` : '',
      site_name: (!!this.state.selectedPM && !!this.state.selectedPM.PM_LOCATION_NAME) ? `Site Name : ${this.state.selectedPM.PM_LOCATION_NAME}` : '',
      PO: (!!this.props.currentPmList && !!this.props.currentPmList.PO_NUM) ? `PO : ${this.props.currentPmList.PO_NUM}` : '',
      Line: (!!this.state.selectedPM && !!this.state.selectedPM.LINE) ? `Line : ${this.state.selectedPM.LINE}` : '',
      Schedule: (!!this.state.selectedPM && !!this.state.selectedPM.SCHEDULE) ? `Schedule : ${this.state.selectedPM.SCHEDULE}` : '',
      location_id: this.props.esaFlag == "Y" ? this.state.selectedPM?.MDG_ID ? `MDGLC : ${this.state.selectedPM.MDG_ID}` : '' : this.state.selectedPM?.PS_LOCATION_ID ? `Location Id : ${this.state.selectedPM.PS_LOCATION_ID}` : '',
    }
    let data = JSON.stringify(this.state.selectedPM)
    let poItemId = this.state.selectedPM && this.state.selectedPM.PO_ITEM_ID ? this.state.selectedPM.PO_ITEM_ID : ''
    let isPmSelected = this.state.selectedPM && this.props.currentPmList && (poItemId == 'EXP-GNRTRS-CELL' ||
      poItemId == 'EXP-HVAC-MAIN-CELL' || this.props.currentPmList.PM_TYPE_NAME == 'GENERATOR PM' || this.props.currentPmList.PM_TYPE_NAME == 'HVAC PM') ? true : false
    if (this.state.selectedPM.PM_ITEM_STATUS !== 'PENDING' && this.state.selectedPM.PM_ITEM_STATUS !== 'PENDING_DRAFT' && this.state.selectedPM.COMPLETED_BY) {
      return (<div>
        <Modal large={true} handleHideModal={this.handleHideModal}
          data-backdrop="static" data-keyboard="false"
          style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}
          title={`${title.site_id} ${title.location_id}  ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`} >
          <PMModelDetailsCompleted title={title} handleHideModal={this.handleHideModal} notiref={this.props.notiref} currentPmListID={this.props.currentPmList.PM_LIST_ID}
            PMDetails={this.state.selectedPM} pmType={this.props.currentPmList.PM_TYPE_NAME} isPmSelected={isPmSelected} poItemId={poItemId} />
        </Modal></div>)

    } else if (this.state.selectedPM.PM_ITEM_STATUS === 'PENDING' || this.state.selectedPM.PM_ITEM_STATUS === 'PENDING_DRAFT' || this.state.selectedPM.COMPLETED_BY === "" ) {
      return (<div>
        <Modal large={true} handleHideModal={this.handleHideModal}
          data-backdrop="static" data-keyboard="false"
          style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}
          title={`${title.site_id} ${title.location_id}  ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`}>
          <PMModelDetails title={title} initPMDashboard={this.props.initPMDashboard} handleHideModal={this.handleHideModal} notiref={this.props.notiref} currentPmListID={this.props.currentPmList.PM_LIST_ID} PMDetails={this.state.selectedPM}
            pmType={this.props.currentPmList.PM_TYPE_NAME} isPmSelected={isPmSelected} poItemId={poItemId}
            pmListNamepdf={this.props.currentPmList.PM_LIST_NAME} poNum={this.props.currentPmList.PO_NUM} />
        </Modal></div>)
    }
  }
  renderPmDetailsModalHvac = () => {
    let title = {
      site_id: (!!this.state.selectedPMHvac && !!this.state.selectedPMHvac.SITE_ID) ? `Site Id : ${this.state.selectedPMHvac.SITE_ID}` : '',
      site_name: (!!this.state.selectedPMHvac && !!this.state.selectedPMHvac.PM_LOCATION_NAME) ? `Site Name : ${this.state.selectedPMHvac.PM_LOCATION_NAME}` : '',
      PO: (!!this.props.currentPmList && !!this.props.currentPmList.PO_NUM) ? `PO : ${this.props.currentPmList.PO_NUM}` : '',
      Line: (!!this.state.selectedPMHvac && !!this.state.selectedPMHvac.LINE) ? `Line : ${this.state.selectedPMHvac.LINE}` : '',
      Schedule: (!!this.state.selectedPMHvac && !!this.state.selectedPMHvac.SCHEDULE) ? `Schedule : ${this.state.selectedPMHvac.SCHEDULE}` : '',
      location_id: this.props.esaFlag=="Y" ? this.state.selectedPMHvac?.MDG_ID ? `MDGLC : ${this.state.selectedPMHvac.MDG_ID}` : '' : this.state.selectedPMHvac?.PS_LOCATION_ID ? `Location Id : ${this.state.selectedPMHvac.PS_LOCATION_ID}` : ''
    }
    let poItemId = this.state.selectedPMHvac && this.state.selectedPMHvac.PO_ITEM_ID ? this.state.selectedPMHvac.PO_ITEM_ID : ''
    let isPmSelected = this.state.selectedPMHvac && this.props.currentPmList && (poItemId == 'EXP-GNRTRS-CELL' ||
      poItemId == 'EXP-HVAC-MAIN-CELL' || this.props.currentPmList.PM_TYPE_NAME == 'GENERATOR PM' || this.props.currentPmList.PM_TYPE_NAME == 'HVAC PM') ? true : false
    return (<div>
      <Modal large={true}
        data-backdrop="static" data-keyboard="false"
        style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}
        handleHideModal={this.handleHideModalHvac}
        title={`${title.site_id} ${title.location_id} ${title.site_name}  ${title.PO}  ${title.Line}  ${title.Schedule}`}>
        <DynamicHvacPm title={title} notiref={this.props.notiref} initPMDashboard={this.props.initPMDashboard}
          currentPmListID={this.props.currentPmList.PM_LIST_ID} currentPmList={this.props.currentPmList} PMDetails={this.state.selectedPMHvac}
          pmType={this.props.currentPmList.PM_TYPE_NAME} isPmSelected={isPmSelected}
          pmListNamepdf={this.props.currentPmList.PM_LIST_NAME} poNum={this.props.currentPmList.PO_NUM} />
      </Modal>
    </div>)
  }

  renderPmDetailsModalFire() {
    let selectedPMLocal = Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM
    let title = {
      site_id: (!!selectedPMLocal && !!selectedPMLocal.SITE_ID) ? `Site Id : ${selectedPMLocal.SITE_ID}` : '',
      site_name: (!!selectedPMLocal && !!selectedPMLocal.PM_LOCATION_NAME) ? `Site Name : ${selectedPMLocal.PM_LOCATION_NAME}` : '',
      PO: (!!this.props.currentPmList && !!this.props.currentPmList.PO_NUM) ? `PO : ${this.props.currentPmList.PO_NUM}` : '',
      Line: (!!selectedPMLocal && !!selectedPMLocal.LINE) ? `Line : ${selectedPMLocal.LINE}` : '',
      Schedule: (!!selectedPMLocal && !!selectedPMLocal.SCHEDULE) ? `Schedule : ${selectedPMLocal.SCHEDULE}` : '',
      location_id: this.props.esaFlag == "Y" ? selectedPMLocal?.MDG_ID ? `MDGLC : ${selectedPMLocal.MDG_ID}` : '' : selectedPMLocal?.PS_LOCATION_ID ? `Location Id : ${selectedPMLocal.PS_LOCATION_ID}` : ''
    }
    return (
      <Modal title={`${title.site_id}   ${title.site_name}  ${title.PO}  ${title.Line}   ${title.Schedule}   ${title.location_id}`} handleHideModal={this.handleHideModalFire} style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}>
        <FireInspection
          onSubmit={this.onSubmit.bind(this)}
          pmType={this.props.currentPmList.PM_TYPE_NAME}
          currentList={this.props.currentPmList}
          selectedPM={Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM}
          pmListNamepdf={this.props.currentPmList.PM_LIST_NAME}
          notiref={this.props.notiref}
          poNum={this.props.currentPmList.PO_NUM}
          markAsCompleted={this.state.markAsCompleted}
          attchmnts={this.state.attchmnts}
          sitesInfo={this.state.sitesInfo}
          initPMDashboard={this.props.initPMDashboard}
          submarketUnidData={this.state.submarketUnidData}
          generatePDFOndemand={this.generatePDFOndemand}
        />
      </Modal>
    )
  }

  renderPmDetailsBattery() {
    let selectedPMLocal = Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM
    let title = {
      site_id: (!!selectedPMLocal && !!selectedPMLocal.SITE_ID) ? `Site Id : ${selectedPMLocal.SITE_ID}` : '',
      site_name: (!!selectedPMLocal && !!selectedPMLocal.PM_LOCATION_NAME) ? `Site Name : ${selectedPMLocal.PM_LOCATION_NAME}` : '',
      PO: (!!this.props.currentPmList && !!this.props.currentPmList.PO_NUM) ? `PO : ${this.props.currentPmList.PO_NUM}` : '',
      Line: (!!selectedPMLocal && !!selectedPMLocal.LINE) ? `Line : ${selectedPMLocal.LINE}` : '',
      Schedule: (!!selectedPMLocal && !!selectedPMLocal.SCHEDULE) ? `Schedule : ${selectedPMLocal.SCHEDULE}` : '',
      location_id: this.props.esaFlag=="Y" ? selectedPMLocal?.MDG_ID ? `MDGLC : ${selectedPMLocal.MDG_ID}` : '' : selectedPMLocal?.PS_LOCATION_ID ? `Location Id : ${selectedPMLocal.PS_LOCATION_ID}` : ''
    }
    return (
      <Modal title={`${title.site_id}   ${title.site_name}  ${title.PO}  ${title.Line}   ${title.Schedule}   ${title.location_id}`} handleHideModal={this.handleHideModalBattery} style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}>
        <BatteryForm
          onSubmit={this.onSubmit.bind(this)}
          generatePDFOndemand={this.generatePDFOndemand}
          initPMDashboard={this.props.initPMDashboard}
          currentList={this.props.currentPmList}
          selectedPM={Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM}
          pmListNamepdf={this.props.currentPmList.PM_LIST_NAME}
          notiref={this.props.notiref}
          poNum={this.props.currentPmList.PO_NUM}
          markAsCompleted={this.state.markAsCompleted}
          attchmnts={this.state.attchmnts}
          sitesInfo={this.state.sitesInfo}
          submarketUnidData={this.state.submarketUnidData}
        />
      </Modal>
    )
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

  modifyGridDetails = () => {
    return this.props.pmGridDetails.map((pmGridDetail) => ({
      ...pmGridDetail,
      PM_ITEM_STATUS: pmGridDetail.PM_ITEM_STATUS,
      PM_ITEM_DUE_DATE: pmGridDetail.PM_ITEM_DUE_DATE ? moment(pmGridDetail.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : '',
      SCHEDULED_DATE: pmGridDetail.SCHEDULED_DATE ? moment(pmGridDetail.SCHEDULED_DATE).format('MM/DD/YYYY') : '',
      PM_ITEM_COMPLETED_DATE: pmGridDetail.PM_ITEM_COMPLETED_DATE ? moment(pmGridDetail.PM_ITEM_COMPLETED_DATE).format('MM/DD/YYYY') : '',
      LAST_UPDATED_DATE: pmGridDetail.LAST_UPDATED_DATE ? moment(pmGridDetail.LAST_UPDATED_DATE).format('MM/DD/YYYY') : '',
      COMPLETED_BY: pmGridDetail.COMPLETED_BY ? pmGridDetail.COMPLETED_BY : '',
      PM_ITEM_COMPLETED_DATE_STAMP: pmGridDetail.LAST_UPDATED_DATE ? pmGridDetail.LAST_UPDATED_DATE : '',
      INVOICINGOOS: pmGridDetail.INVOICINGOOS ? pmGridDetail.INVOICINGOOS : ''
    }))
  }

  formPostRequest = (attrAction, data, comm) => {
    let selectedPMLocal = Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM
    let { PM_LIST_ITEM_ID, PM_ITEM_UNID, PM_LIST_ID, EQUIPMENT_UNID, PM_TYPE_NAME } = selectedPMLocal;
    const loopArray = () => {
     let selectedpm =  Array.isArray(this.state.selectedPM) ? this.state.selectedPM : [this.state.selectedPM]
      return selectedpm.map((item) => {
        return {
          "PM_LIST_ID": Number(item.PM_LIST_ID),
          "PM_LIST_ITEM_ID": Number(item.PM_LIST_ITEM_ID),
          "SITE_UNID": item.PM_ITEM_UNID,
          "EQUIPMENT_UNID": item.PM_ITEM_UNID,
          "EQUIPMENT_TYPE": item.PM_TYPE_NAME,
          "INSPECTION_UNID": null,
          "OPSTRACKER_UNID": null,
          "INSP_STATUS": attrAction,
          "INSP_COMPLETED_BY": data ? data.vendorTechName : this.props.user.toJS().name,
          "INSP_COMPLETED_DATE": moment(new Date()).format('DD/MM/YYYY'),
          "INSP_COMMENTS": comm ? comm : "",
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }
      })
    }

    return {
      "updatedData": {
        "inspectionSummary": this.props.currentPmList.PM_TYPE_NAME == 'LANDSCAPING PM' ? loopArray() : [
          {
            "PM_LIST_ID": Number(PM_LIST_ID),
            "PM_LIST_ITEM_ID": Number(PM_LIST_ITEM_ID),
            "SITE_UNID": PM_ITEM_UNID,
            "EQUIPMENT_UNID": PM_ITEM_UNID,
            "EQUIPMENT_TYPE": PM_TYPE_NAME,
            "INSPECTION_UNID": null,
            "OPSTRACKER_UNID": null,
            "INSP_STATUS": attrAction,
            "INSP_COMPLETED_BY": data ? data.vendorTechName : this.props.user.toJS().name,
            "INSP_COMPLETED_DATE": data ? moment(data.completedDate).format('DD/MM/YYYY') : moment(new Date()).format('DD/MM/YYYY'),
            "INSP_COMMENTS": '',
            "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
          }
        ],
        "inspectionDetails": data ? this.props.currentPmList.PM_TYPE_NAME != 'BATTERY PM' ? [{
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 1,
          "ATTRIBUTE_NAME": "Type of Fire Extinguisher",
          "ATTRIBUTE_VALUE": data.fireType,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": null,
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }, {
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 2,
          "ATTRIBUTE_NAME": "Size of Fire Extinguisher",
          "ATTRIBUTE_VALUE": data.fireSize,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": '',
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }, {
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 3,
          "ATTRIBUTE_NAME": "Reason For Replacement",
          "ATTRIBUTE_VALUE": data.replacementReason,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": '',
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }, {
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 4,
          "ATTRIBUTE_NAME": "Last Service Vendor",
          "ATTRIBUTE_VALUE": data.lastServiceVendor,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": '',
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }, {
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 5,
          "ATTRIBUTE_NAME": "Fire Extinguisher Replaced",
          "ATTRIBUTE_VALUE": data.isReplaced,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": '',
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }] : [{
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 1,
          "ATTRIBUTE_NAME": "Battery Replaced",
          "ATTRIBUTE_VALUE": data.isReplaced,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": '',
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }, {
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 2,
          "ATTRIBUTE_NAME": "Last Service Vendor",
          "ATTRIBUTE_VALUE": data.lastServiceVendor,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": '',
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }, {
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 3,
          "ATTRIBUTE_NAME": "Battery Maker",
          "ATTRIBUTE_VALUE": data.batteryMaker,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": '',
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }, {
          "INSPECTION_UNID": null,
          "EQUIPMENT_UNID": PM_ITEM_UNID,
          "ATTRIBUTE_ID": 4,
          "ATTRIBUTE_NAME": "Battery Model",
          "ATTRIBUTE_VALUE": data.batteryModel,
          "ATTRIBUTE_CATEGORY": null,
          "ATTRIBUTE_SUBCATEGORY": '',
          "ATTRIBUTE_FIELDS": "",
          "ATTRIBUTE_COMMENTS": '',
          "LAST_UPDATED_BY": data ? data.vendorTechName : this.props.user.toJS().name
        }] : []
      },
      "opsTrackerCreateReqBody": null,
      "opsTrackerUpdateReqBody": null
    }
  }
  initModal(attrAction, inspPdf) {
    let { fetchTowerInspItems, vendorId, loginId, submarket, fetchCompletedAttDetails } = this.props
    let { PM_LIST_ID, PM_TYPE_ID } = this.props.currentPmList
    let selectedPMLocal = this.state.selectedPM ? Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM : this.state.selectedPMHvac;
    let { PM_LIST_ITEM_ID, PM_ITEM_UNID, PM_ITEM_STATUS } = selectedPMLocal
    fetchTowerInspItems(vendorId, loginId, submarket, PM_LIST_ITEM_ID, PM_ITEM_UNID, PM_LIST_ID, PM_TYPE_ID)
      .then(async action => {
        if (action.type == 'FETCH_TOWERINSP_SUCCESS') {
          let towerAttributeData = action.inspData && action.inspData.getTowerInspItems && action.inspData.getTowerInspItems.output && action.inspData.getTowerInspItems.output.towerAttributeData.length > 0 ? action.inspData.getTowerInspItems.output.towerAttributeData : [];
          fetchCompletedAttDetails(loginId, vendorId, PM_LIST_ITEM_ID)
            .then(async completedAttrDet => {
              if (completedAttrDet.type === 'FETCH_CMPLTDATTDET_SUCCESS') {
                this.setState({
                  attchmnts: completedAttrDet.pmCompAttDetails && completedAttrDet.pmCompAttDetails.attachmentsData.length > 0 ? completedAttrDet.pmCompAttDetails.attachmentsData : [],
                  submarketUnidData: completedAttrDet.pmCompAttDetails.submarketUnidData,
                  sitesInfo: completedAttrDet.pmCompAttDetails.sitesInfo,
                  towerAttributeDataNew: towerAttributeData
                })
                if ((PM_ITEM_STATUS === "PENDING" && attrAction === "COMPLETED") || inspPdf) {
                  this.generatePDFInitial(towerAttributeData, completedAttrDet.pmCompAttDetails.submarketUnidData, completedAttrDet.pmCompAttDetails.sitesInfo)
                }
              }
            })
        }
      })
  }
  formPostRequestForPDFGeneration(towerAttributeDataNew, submarketUnidData, sitesInfo) {
    let { pmListNamepdf, vendorId, vendorName, poNum } = this.props
    let { PM_LIST_NAME, PO_NUM } = this.props.currentPmList;
    let selectedPMLocal = Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM
    let { PM_LIST_ID, PM_ITEM_STATUS, PM_LIST_ITEM_ID, PM_LIST_ITEM_ID_PS, PS_LOCATION_ID, PM_ITEM_UNID, PM_ITEM_COMPLETED_DATE, PM_LOCATION_NAME, PM_ITEM_COMPLETED_DATE_STAMP, SCHEDULE, LINE } = selectedPMLocal

    return {
      "attributeData": towerAttributeDataNew,
      "submarketUnidData": submarketUnidData,
      "sitesInfo": sitesInfo,
      "pmListData": {
        "PM_LIST_NAME": PM_LIST_NAME,
        PM_LIST_ID,
        "FREQUENCY": null,
        "EXPENSE_PROJ_ID": null,
        "COST_CENTER": "8600",
        "PO_BU": "NTSCA",
        "MANAGER_ID": null,
        "PO_ENTERED_DATE": null,
        "PO_EMAIL_DISTRO": null,
        "BUYER": null,
        "PRODUCT_CD": "200",
        "VENDOR_ID": vendorId,
        "VENDOR_NAME": vendorName,
        "PM_TYPE_ID": null,
        "PM_LIST_STATUS": PM_ITEM_STATUS,
        "PO_STATUS": null,
        "PO_NUM": PO_NUM,//
        "PS_ITEM_ID": null,
        "MMID" : null,
        "PM_LIST_STATUS_1": null,
        "CREATER": null,
        "CREATED_DATE": moment(),
        "PS_POLL_IND": null,
        "PM_LIST_STATUS_2": null,
        "APPLY_PM_VENDOR": null,
        "NOTIFY_POTEAM": null,
        "BUYER_ID": null,
        "EMP_ID": null,
        "PM_ATTACHMENTS_ID": null,
        "PM_FILE_NAME": null,
        "PM_FILE_CATEGORY": null,
        "PM_FILE_TYPE": null,
        "ASSOCIATED_TYPE_ID": null,
        "VENDOR_EMAIL": null,
        "IS_COMPLETED": null,
        "IS_VENDOR_REQUESTED": null,
        "PM_GROUP": "PM",
        "BUYER_EMAIL": null,
        "MANAGER_EMAIL": null
      },
      "pmItemInfo": {
        "PM_EQUIPMENTS_COUNT": null,
        "EQUIPMENT_UNIT_SIZE": null,
        "SITE_TYPE": null,
        "LAST_COMPLETED_DATE": null,
        PM_LIST_ID,
        "PM_ITEM_COMPLETED_DATE": towerAttributeDataNew.length > 0 && towerAttributeDataNew[0].PM_ITEM_COMPLETED_DATE ? moment(towerAttributeDataNew[0].PM_ITEM_COMPLETED_DATE.split(' ')[0]) : moment(),//
        "COMPLETED_BY": this.state.techName,
        PM_LIST_ITEM_ID,
        "PO_ITEM_ID": null,
        "DESCRIPTION": null,
        "PM_LIST_ITEM_ID_PS": PM_LIST_ITEM_ID,
        "SWITCH_NAME": null,
        "PM_LOCATION_NAME": PM_LOCATION_NAME,//
        "PM_SITE_ID": null,
        PS_LOCATION_ID,
        "PM_LOCATION_UNID": PM_ITEM_UNID,
        "PM_ITEM_STATUS": PM_ITEM_STATUS,
        "PM_EQUIPMENT_MAKER": null,
        "PM_LOCATION_STATUS": null,
        "FIELDENGINEER": null,
        "LOCATION_PRIORITY": null,
        "EQUIPMENT_STATUS": null,
        "PM_COST": null,
        "LINE": LINE,
        "SCHEDULE": SCHEDULE,
        "LINE_SCH_MATCH_STATUS": null,
        "PM_ITEM_DUE_DATE": null,
        "PO_ITEM_DESCRIPTION": null,
        "PM_ITEM_START_DATE": null
      }
    }
  }
  async generatePDFInitial(towerAttributeDataNew, submarketUnidData, sitesInfo) {
    let pdfInputGen = await this.formPostRequestForPDFGeneration(towerAttributeDataNew, submarketUnidData, sitesInfo)
    let { vendorId, loginId, submitTowerInsp, submarket, PMDetails, fetchPmGridDetails, currentPmList, uploadFiles } = this.props
    let selectedPMLocal = Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM
    let { PM_ITEM_UNID, PM_LIST_ITEM_ID } = selectedPMLocal
    let pm_type = this.props.currentPmList.PM_TYPE_NAME
    let pmListId = this.props.currentPmList.PM_LIST_ID

    let pmType = "";
    switch (this.props.currentPmList.PM_TYPE_NAME) {
      case 'FIRE EXTINGUISHER PM':
        pmType = 'FIREEXTINGUISHER'
        break
      case 'LANDSCAPING PM':
        pmType = 'LANDSCAPING'
        break
      case 'FIRE INSPECTION PM':
        pmType = 'FIREINSPECTION'
        break
      case 'EXTERMINATOR SERVICE PM':
        pmType = 'EXTERMINATOR'
        break
      case 'BATTERY PM':
        pmType = 'BATTERY'
        break
      default:
        pmType = this.props.currentPmList.PM_TYPE_NAME
    }
    await this.props.generateInspPDF(vendorId, loginId, PM_LIST_ITEM_ID, pdfInputGen, pmType)
      .then(actionGen => {
        if (actionGen.type == 'GENERATE_PDF_SUCCESS') {
          this.props.notiref.addNotification({
            title: 'success',
            position: "br",
            level: 'success',
            message: "PDF Generation successful"
          })
        }
        else {
          this.props.notiref.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: "PDF Generation failed"
          })
        }



      })
  }
  generatePDFOndemand = () => {
    this.initModal(null, true)
  }

  async onSubmit(attrAction, data) {
    let postRequest = null;
    let comments = data?.comments ? data.comments : ""
    if(data?.isLand){
      postRequest = this.formPostRequest(attrAction, null, comments)
    }else{
       postRequest = this.formPostRequest(attrAction, data)
    }

    let { vendorId, loginId, submitTowerInsp, submarket, PMDetails, fetchPmGridDetails, currentPmList, uploadFiles, currentPmListID } = this.props
    let selectedPMLocal = Array.isArray(this.state.selectedPM) ? this.state.selectedPM[0] : this.state.selectedPM;
    let pmListItemId = selectedPMLocal.PM_LIST_ITEM_ID
    var filesPostRequest = {
      "fileList": data && data.filesData && data.filesData.map(fd => {
        let file_name = fd.file_name.split('.')[0]
        let file_type = fd.file_name.split('.')[1]
        return {
            "PM_LIST_ID": selectedPMLocal.PM_LIST_ID,
            "ASSOCIATED_PM_LISTS": `${selectedPMLocal.PM_LIST_ID},`,
            "PM_LIST_ITEM_ID": pmListItemId,
            "PM_LOCATION_UNID": selectedPMLocal.PM_ITEM_UNID,
            "PM_FILE_CATEGORY": "VP",
            "PM_FILE_NAME": file_name,
            "PM_FILE_TYPE": file_type,
            "PM_FILE_SIZE": fd.file_size,
            "PM_FILE_DATA": fd.file_data,
            "LAST_UPDATED_BY": loginId
        }

    })
  }
    submitTowerInsp(vendorId, loginId, pmListItemId, postRequest).then(async (action) => {
      if (action.type === 'SUBMIT_TOWERINSP_SUCCESS') {
        this.setState({ markAsCompleted: true });
        this.props.notiref.addNotification({
          title: 'success',
          position: "br",
          level: 'success',
          message: "Details Submission successful"
        })
        if (data && data.filesData && data.filesData.length > 0) {
          uploadFiles(vendorId, loginId, pmListItemId, filesPostRequest).then((action) => {

            if (action.type === 'UPLOAD_FILES_SUCCESS') {

              this.handleHideModalFire()
              this.handleHideModalDialog();
              this.props.fetchPmGridDetails(vendorId, loginId, currentPmList.PM_LIST_ID)
              this.props.notiref.addNotification({
                title: 'success',
                position: "br",
                level: 'success',
                message: "Files upload successful"
              })
            }
          }).catch((error) => {

            if (!!error) {
              this.props.notiref.addNotification({
                title: 'error',
                position: "br",
                level: 'error',
                message: "Files upload failed"
              })
            }
          })
        }else{
          this.handleHideModalDialog();
          this.props.fetchPmGridDetails(vendorId, loginId, currentPmList.PM_LIST_ID);
        }
        await this.initModal(attrAction)

        if (attrAction == 'PENDING_DRAFT') {
          this.props.handleHideModal()
          this.props.fetchSearchedSites(vendorId, loginId).then(action => {
            this.props.filterSearchedSites(vendorId, loginId, this.props.searchString)
          })
        }
        if(this.props.initPMDashboard){
          setTimeout(() => { this.props.initPMDashboard() }, 2200);
        }
      }
    })
    await this.initModal()
  }
  getRowStyle =(params) => {
    if (params.data.PM_ITEM_STATUS !== 'CANCELLED' && !_.isEmpty(params.data.SCHEDULED_DATE) && !moment(params.data.SCHEDULED_DATE, "MM/DD/YYYY").isSame(moment(params.data.PM_ITEM_DUE_DATE, "MM/DD/YYYY"))) {
        return {'background-color': '#FFD580'}
    }
    return null;
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
    let erpflag = this.props.erpFlag && this.props.erpFlag.size > 0 && this.props.erpFlag.toJS() && this.props.erpFlag.toJS().getPmListDetails && this.props.erpFlag.toJS().getPmListDetails.erpFlag
    let mmidOrItemid = {}
    let enableCheckbox = false
    if(erpflag == 'Y'){
      mmidOrItemid = {
        headerName: "MMID", headerTooltip: "MMID", field: "MMID", tooltipField: "MMID", filter: "agSetColumnFilter"
      }
    }else {  
      mmidOrItemid =  {
          headerName: "PO Item Id", headerTooltip: "PO Item Id", field: "PO_ITEM_ID", tooltipField: "PO_ITEM_ID", filter: "agTextColumnFilter"
        }
    }

    const modfdGridDetails = this.modifyGridDetails()
    modfdGridDetails.sort((e1,e2)=>{return e1.LINE_NUMBER-e2.LINE_NUMBER})

    let columns = [
      
      {
        headerName: "MDGLC", field: "MDG_ID", flex: 1
      },
      {
        headerName: "Site ID", field: "SITE_ID", flex: 1
      },
      {
        headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 2.5
      },
      {
        headerName: "Status", field: "PM_ITEM_STATUS", flex: 1
      },
      {
        headerName: "Line", field: "LINE_NUMBER", flex: 0.6
      },
      {
        headerName: "Proposed DD", field: "SCHEDULED_DATE", flex: 1,
      },{
        headerName: "PO DD", field: "PM_ITEM_DUE_DATE", flex: 1
      },
      {
        headerName: "Completed Date", field: "PM_ITEM_COMPLETED_DATE", flex: 1
      },
      {
        headerName: "Completed By", field: "COMPLETED_BY",flex: 1.5
      },
      {
        headerName: "Comments", field: "COMMENTS", flex: 1
      },
      {
        headerName: "PS Loc ID", field: "PS_LOCATION_ID", flex: 1
      }
    ]
    if(this.props.esaFlag == "Y") {
      columns = columns.filter(obj => obj.headerName !== 'PS Loc ID')
    }
    if (["LANDSCAPING PM", "SNOW REMOVAL PM"].includes(this.props.currentPmList.PM_TYPE_NAME)) {
      enableCheckbox = true
    }

    let autoGroupColumnDef = {
      headerName: 'Select',
      field: 'Select',
      minWidth: 250,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: { checkbox: true }
    }

    // let rowClassRules = {
    //   "orange-row": function (params) {
    //     return (params.data.workorder_status == 'PO_REQUEST' && params.data.quote_statuses == 'AWAITING_PO')
    //   }
    // }


    var pendingSites = this.props.pmGridDetails.filter(pg => pg.PM_ITEM_STATUS.includes('PENDING')).length
    var completedSites = this.props.pmGridDetails.filter(pg => pg.PM_ITEM_STATUS === 'COMPLETED' || pg.PM_ITEM_STATUS === 'RESUBMITTED').length
    var receivedSites = this.props.pmGridDetails.filter(pg => pg.PM_ITEM_STATUS === 'RECEIVED').length
    var declinedSites = this.props.pmGridDetails.filter(pg => pg.PM_ITEM_STATUS.includes('DECLINED')).length
    var acceptedSites = this.props.pmGridDetails.filter(pg => pg.PM_ITEM_STATUS.includes('ACCEPTED')).length
    var closedSites = this.props.pmGridDetails.filter(pg => pg.PM_ITEM_STATUS === 'CLOSED').length
    var cancelledSites = this.props.pmGridDetails.filter(pg => pg.PM_ITEM_STATUS === 'CANCELLED').length
    var totalSites = this.props.pmGridDetails.length





    let pendingP = (totalSites === 0) ? 0 : ((pendingSites / totalSites) * 100).toFixed(0)
    let completionP = (totalSites === 0) ? 0 : ((completedSites / totalSites) * 100).toFixed(0)
    let acceptedP = (totalSites === 0) ? 0 : ((acceptedSites / totalSites) * 100).toFixed(0)
    let receivedP = (totalSites === 0) ? 0 : ((receivedSites / totalSites) * 100).toFixed(0)
    let declinedP = (totalSites === 0) ? 0 : ((declinedSites / totalSites) * 100).toFixed(0)
    let cancelledP = (totalSites === 0) ? 0 : ((cancelledSites / totalSites) * 100).toFixed(0)
    let closedP = (totalSites === 0) ? 0 : ((closedSites / totalSites) * 100).toFixed(0)



    if (!this.props.onCloseClicked) {
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
          
          <div className='row'>
            <DataGrid
              columns={columns}
              rows={!modfdGridDetails ? [] : modfdGridDetails}
              apiRef={this.apiRef}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 15, 20]}
              columnHeaderHeight={35}
              rowHeight={30}
              getRowId={this.getRowId}
              checkboxSelection={enableCheckbox}
              isRowSelectable={()=>this.state.isRowSelectable}
              onRowClick={(e)=> this.onRowClicked(this.props.currentPmList.PM_TYPE_NAME, e)}
              sx={{
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                fontSize: '1rem',
                minHeight: 200,
                '& .highlight': { background: '#FFD580' },
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
              onRowSelectionModelChange={(params) => {
                let rowData = modfdGridDetails.filter(row => params.includes(row.PM_LIST_ITEM_ID))
                this.onSelectionChanged(this.props.currentPmList.PM_TYPE_NAME, rowData)
              }}
              disableRowSelectionOnClick={true}
              getRowClassName={(params) => {
                return (params.row.PM_ITEM_STATUS !== 'CANCELLED' && !_.isEmpty(params.row.SCHEDULED_DATE) && !moment(params.row.SCHEDULED_DATE, "MM/DD/YYYY").isSame(moment(params.row.PM_ITEM_DUE_DATE, "MM/DD/YYYY"))) ? 'highlight' : ''
              }}
            />
          </div>
          {
            ["LANDSCAPING PM", "SNOW REMOVAL PM"].includes(this.props.currentPmList.PM_TYPE_NAME) ?
              <button type="button"
                className="Button--primary u-floatRight"
                onClick={() => this.setState({ isModalDialog: true })}
                style={{ marginRight: "5px" }}>
                Mark as Completed
              </button> : null
          }
          {this.state.isModalshown ? this.renderPmDetailsModal() : null}
          {this.state.isModalshownHvac ? this.renderPmDetailsModalHvac() : null}
          {this.state.isModalShownFire ? this.renderPmDetailsModalFire() : null}
          {this.state.isModalDialog ? this.renderModalDialog() : null}
          {this.state.isModalShownBattery ? this.renderPmDetailsBattery() : null}
        </div>
      )


    } else {
      return (null)

    }
  }

}
function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user.toJS().vendor_id
  let erpFlag = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmListDetails"], List())
  let pmGridDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List()).toJS()
  let vendorName = user.toJS().vendor_name
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;

  return {
    user,
    loginId,
    vendorId,
    erpFlag,
    pmGridDetails,
    vendorName,
    submarket,
    esaFlag
  }

}
export default connect(stateToProps, { ...pmActions })(PMListItemDetails)