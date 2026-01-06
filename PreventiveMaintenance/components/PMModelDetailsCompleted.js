import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import ListOfFiles from './ListOfFiles'
import * as pmActions from "../actions"
import { connect } from "react-redux"
import { Map, List, fromJS } from 'immutable'
import moment from 'moment'
import Loader from '../../Layout/components/Loader'
import MessageBox from '../../Forms/components/MessageBox'
import "react-picky/dist/picky.css";
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils.js'
// import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { submitGenReadingsRequest } from '../../VendorDashboard/actions.js'
import { saveElogByWorkOrderID } from '../../Elog/actions.js'
import SiteInformation from '../../sites/components/SiteInformation'

class PMModelDetailsCompleted extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      readOnlyStatus: ['ACCEPTED', 'RECEIVED', 'COMPLETED', 'RESUBMITTED', 'INVOICED', 'RECEIVED'],
      filesData: [],
      fileSizeError: false,
      emptyValue: false,
      mandAttKeys: [],
      updatedData: {},
      submitpostRequest2: {},
      disableSubmit: false,
      compAttError: false,
      compAttDetails: {},
      compAttDetailsGenPdf: {},
      value: { value: 'Yes', label: 'Yes', isFixed: true },
      radioOptions: [{ value: 'Yes', label: 'Yes', isFixed: true }, { value: 'No', label: 'No', isFixed: true }],
      pm_unid: this.randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      drpdwnOptions1: [{ value: 2.5, label: '2.5', isFixed: true }, { value: '2.6', label: '2.6', isFixed: true }, { value: '2.7', label: '2.7', isFixed: true }, { value: '2.8', label: '2.8', isFixed: true }, { value: '2.9', label: '2.9', isFixed: true }, { value: '3', label: '3', isFixed: true }, { value: '3.1', label: '3.1', isFixed: true }, { value: '3.2', label: '3.2', isFixed: true }, { value: '3.3', label: '3.3', isFixed: true }, { value: '3.4', label: '3.4', isFixed: true }, { value: '3.5', label: '3.5', isFixed: true }, { value: '3.6', label: '3.6', isFixed: true }, { value: '3.7', label: '3.7', isFixed: true }, { value: '3.8', label: '3.8', isFixed: true }, { value: '3.9', label: '3.9', isFixed: true }, { value: '4', label: '4', isFixed: true }, { value: '4.1', label: '4.1', isFixed: true }, { value: '4.2', label: '4.2', isFixed: true }, { value: '4.3', label: '4.3', isFixed: true }, { value: '4.4', label: '4.4', isFixed: true }, { value: '4.5', label: '4.5', isFixed: true }, { value: '4.6', label: '4.6', isFixed: true }, { value: '4.7', label: '4.7', isFixed: true }, { value: '4.8', label: '4.8', isFixed: true }, { value: '4.9', label: '4.9', isFixed: true }, { value: '5', label: '5', isFixed: true }, { value: '5.1', label: '5.1', isFixed: true }, { value: '5.2', label: '5.2', isFixed: true }, { value: '5.3', label: '5.3', isFixed: true }, { value: '5.4', label: '5.4', isFixed: true }, { value: '5.5', label: '5.5', isFixed: true }, { value: '5.6', label: '5.6', isFixed: true }, { value: '5.7', label: '5.7', isFixed: true }, { value: '5.8', label: '5.8', isFixed: true }, { value: '5.9', label: '5.9', isFixed: true }, { value: '6', label: '6', isFixed: true }, { value: '6.1', label: '6.1', isFixed: true }, { value: '6.2', label: '6.2', isFixed: true }, { value: '6.3', label: '6.3', isFixed: true }, { value: '6.4', label: '6.4', isFixed: true }, { value: '6.5', label: '6.5', isFixed: true }, { value: '6.6', label: '6.6', isFixed: true }, { value: '6.7', label: '6.7', isFixed: true }, { value: '6.8', label: '6.8', isFixed: true }, { value: '6.9', label: '6.9', isFixed: true }, { value: '7', label: '7', isFixed: true }, { value: '7.1', label: '7.1', isFixed: true }, { value: '7.2', label: '7.2', isFixed: true }, { value: '7.3', label: '7.3', isFixed: true }, { value: '7.4', label: '7.4', isFixed: true }, { value: '7.5', label: '7.5', isFixed: true }, { value: '7.6', label: '7.6', isFixed: true }, { value: '7.7', label: '7.7', isFixed: true }, { value: '7.8', label: '7.8', isFixed: true }, { value: '7.9', label: '7.9', isFixed: true }, { value: '8', label: '8', isFixed: true }, { value: '8.1', label: '8.1', isFixed: true }, { value: '8.2', label: '8.2', isFixed: true }, { value: '8.3', label: '8.3', isFixed: true }, { value: '8.4', label: '8.4', isFixed: true }, { value: '8.5', label: '8.5', isFixed: true }, { value: '8.6', label: '8.6', isFixed: true }, { value: '8.7', label: '8.7', isFixed: true }, { value: '8.8', label: '8.8', isFixed: true }, { value: '8.9', label: '8.9', isFixed: true }, { value: '9', label: '9', isFixed: true }, { value: '9.1', label: '9.1', isFixed: true }, { value: '9.2', label: '9.2', isFixed: true }, { value: '9.3', label: '9.3', isFixed: true }, { value: '9.4', label: '9.4', isFixed: true }, { value: '9.5', label: '9.5', isFixed: true }, { value: '9.6', label: '9.6', isFixed: true }, { value: '9.7', label: '9.7', isFixed: true }, { value: '9.8', label: '9.8', isFixed: true }, { value: '9.9', label: '9.9', isFixed: true }, { value: '10', label: '10', isFixed: true }],

      drpdwnOptions2: [{ value: 50, label: '50', isFixed: true }, { value: 51, label: '51', isFixed: true }, { value: 52, label: '52', isFixed: true }, { value: 53, label: '53', isFixed: true }, { value: 54, label: '54', isFixed: true }, { value: 55, label: '55', isFixed: true }, { value: 56, label: '56', isFixed: true }, { value: 57, label: '57', isFixed: true }, { value: 58, label: '58', isFixed: true }, { value: 59, label: '59', isFixed: true }, { value: 60, label: '60', isFixed: true }, { value: 61, label: '61', isFixed: true }, { value: 62, label: '62', isFixed: true }, { value: 63, label: '63', isFixed: true }, { value: 64, label: '64', isFixed: true }, { value: 65, label: '65', isFixed: true }, { value: 66, label: '66', isFixed: true }, { value: 67, label: '67', isFixed: true }, { value: 68, label: '68', isFixed: true }, { value: 69, label: '69', isFixed: true }, { value: 70, label: '70', isFixed: true }, { value: 71, label: '71', isFixed: true }, { value: 72, label: '72', isFixed: true }, { value: 73, label: '73', isFixed: true }, { value: 74, label: '74', isFixed: true }, { value: 75, label: '75', isFixed: true }, { value: 76, label: '76', isFixed: true }, { value: 77, label: '77', isFixed: true }, { value: 78, label: '78', isFixed: true }, { value: 79, label: '79', isFixed: true }, { value: 80, label: '80', isFixed: true }]


    }
    this.aList = List()
    this.onSubmit = this.onSubmit.bind(this)
    this.reUpload = this.reUpload.bind(this)
    this.generatePDFOndemand = this.generatePDFOndemand.bind(this)
    this.generateInsppdfInit = this.generateInsppdfInit.bind(this)
    this.initForm = this.initForm.bind(this)
  }
  formpostReqGenpdf() {
    let { pmListNamepdf, vendorId, vendorName, poNum } = this.props
    let { PM_LIST_ID, PM_ITEM_STATUS, PM_LIST_ITEM_ID, PM_LIST_ITEM_ID_PS, PS_LOCATION_ID, PM_ITEM_UNID, PM_ITEM_COMPLETED_DATE, PM_LOCATION_NAME, PM_ITEM_COMPLETED_DATE_STAMP, SCHEDULE, LINE } = this.props.PMDetails
    console.log('this.state.compAttDetailsGenPdf', this.state.compAttDetailsGenPdf)
    return {
      "pmListData": {
        "PM_LIST_NAME": pmListNamepdf,
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
        "PO_NUM": poNum,//
        "PS_ITEM_ID": null,
        "MMID": null,
        "PM_LIST_STATUS_1": null,
        "CREATER": null,
        "CREATED_DATE": moment(this.state.compAttDetailsGenPdf.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME == "PM_DATE").PM_TMPLT_ATTR_NEW_VALUE) ? moment(this.state.compAttDetailsGenPdf.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME == "PM_DATE").PM_TMPLT_ATTR_NEW_VALUE) : moment(),
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
        "PM_ITEM_COMPLETED_DATE": moment(this.state.compAttDetailsGenPdf.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME == "PM_DATE").PM_TMPLT_ATTR_NEW_VALUE) ? moment(this.state.compAttDetailsGenPdf.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME == "PM_DATE").PM_TMPLT_ATTR_NEW_VALUE) : moment(),//
        "COMPLETED_BY": this.state.compAttDetailsGenPdf.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME === "VENDORTECHNAME").PM_TMPLT_ATTR_NEW_VALUE,
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
      },
      "attributeData": this.state.compAttDetailsGenPdf.attributeData,
      "sitesInfo": this.state.compAttDetailsGenPdf.sitesInfo
    }
  }
  async generatePDFOndemand() {
    await this.generateInsppdfInit()
    await this.initForm()

  }
  async generateInsppdfInit() {
    const { vendorId, vendorName, loginId, title, submitPMQuote, PMDetails, uploadFiles, currentPmListID,
      fetchPmGridDetails, pmType, isPmSelected, poItemId, fetchCompletedAttDetails } = this.props
    let pdfInputGen = await this.formpostReqGenpdf()
    await this.props.generateInspPDF(vendorId, loginId, this.props.PMDetails.PM_LIST_ITEM_ID, pdfInputGen, 'GENERATOR').then(actionGen => {

      this.props.fetchPmGridDetails(vendorId, loginId, currentPmListID)
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
  async initForm() {
    const { user, loginId, vendorId, fetchCompletedAttDetails, fetchPmModelAttributeDetails, pmType, poItemId, isPmSelected } = this.props
    let pm_type = poItemId && poItemId != '' ? null : pmType
    await fetchCompletedAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID).then(async action => {

      if (action.type === 'FETCH_CMPLTDATTDET_FAILURE') {
        this.props.notiref.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: "Something went wrong please try again after sometime!"
        })
        this.setState({
          compAttError: true
        })

      }
      else if (action.type === 'FETCH_CMPLTDATTDET_SUCCESS') {

        await this.setState({
          compAttError: false,
          compAttDetails: action.pmCompAttDetails,
          compAttDetailsGenPdf: action.pmCompAttDetails
        }, () => {
          fetchPmModelAttributeDetails(vendorId, loginId, pm_type, poItemId).then(async action => {
            if (action.type === 'FETCH_PMMODELATT_DETAILS_SUCCESS') {
              let modelAtts = action.pmModelAttDetails.getPmModelAttDetails
              let mandAttKeys = modelAtts.map((att) => {
                if (att.IS_MANDATORY === "Y") return att.PM_TMPLT_ATTR_NAME
              })
              this.setState({ mandAttKeys })
              await this.formOptionsDropdown()



            }
          })
        })

      }
    })
  }
  componentDidMount() {
    this.initForm()

  }


  renderLoading = () => {
    return (
      <Loader color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center" />
    )
  }

  renderErrorScreen = () => {
    return (
      <MessageBox messages={List(["No record(s) found."])} />
    )
  }
  onSelect = (currentAttribute, e) => {
    const { user, loginId, vendorId, modifyCompAttDetails } = this.props
    const newAttData = this.state.compAttDetails.attributeData.map(cad => {
      if (cad.PM_TMPLT_ATTR_ID === currentAttribute.PM_TMPLT_ATTR_ID) {
        return {
          ...cad,
          PM_TMPLT_ATTR_NEW_VALUE: e.value,
          showReasonForSelVar: true
        }
      }
      else {
        return cad
      }
    })
    const newCompAttDetails = { ...this.state.compAttDetails, attributeData: newAttData }
    modifyCompAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID, newCompAttDetails).then(action => {

      this.setState({ compAttDetails: action.modfdList })

    })



  }
  downloadAttachments = (pmAttachmentId, pmListItemId, pmListId) => {
    const { user, loginId, vendorId, fetchFileData } = this.props
    fetchFileData(loginId, vendorId, pmListId, pmListItemId, 'VP').then(action => {
      if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
        let fileData = action.fileDetails.getFileDataForPmlist.result.filter(fd => fd.PM_ATTACHMENTS_ID === pmAttachmentId)[0]


        if (!!fileData && !!fileData.PM_FILE_TYPE && !!fileData.PM_FILE_NAME && !!fileData.PM_FILE_DATA) {
          let blob = dataURItoBlob(fileData.PM_FILE_DATA)
          startDownload(blob, `${fileData.PM_FILE_NAME}.${fileData.PM_FILE_TYPE}`)
        }

      }



    })
  }
  randomString = (length, chars) => {
    var result = ''
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
    return result
  }
  handleInputChange = (currentAttribute, e) => {
    e.target.value ? (this.setState({ emptyValue: false })) : (this.setState({ emptyValue: true }))
    const { user, loginId, vendorId, modifyCompAttDetails } = this.props

    const newAttData = this.state.compAttDetails.attributeData.map(cad => {
      if (currentAttribute.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID) {
        return {
          ...cad,
          PM_TMPLT_ATTR_NEW_VALUE: e.target.value
        }

      }
      else {
        return cad
      }
    })
    const newCompAttDetails = { ...this.state.compAttDetails, attributeData: newAttData }
    modifyCompAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID, newCompAttDetails).then(action => {

      this.setState({ compAttDetails: action.modfdList }, () => {
        let mandateFields = (Object.entries(this.state.compAttDetails.attributeData)).filter(pair => {
          if (this.state.mandAttKeys.includes(pair[1].PM_TMPLT_ATTR_NAME) && pair[1].PM_TMPLT_ATTR_NAME !== 'GENREADINGUNID') {
            return pair[1]
          }
        })
        if (Object.values(this.toObject(mandateFields)).filter((ad) => !ad.PM_TMPLT_ATTR_NEW_VALUE).length === 0) {
          this.setState({ disableSubmit: false })
        }
        else {
          this.setState({ disableSubmit: true })
        }
      })

    })
  }

  toObject = (pairs) => {
    return Array.from(pairs).reduce(
      (acc, [key, value]) => Object.assign(acc, { [key]: value }),
      {},
    );
  }

  getDate = () => {
    return moment().format('MM/DD/YYYY')
  }

  onFileDrop = (files) => {
    const { vendorId, loginId, currentPmListID, PMDetails } = this.props

    files.forEach(file => {

      if (file['size'] > 0) {

        var reader = new window.FileReader()
        reader.onload = function () {

          var dataURL = reader.result
          var droppedFile = {
            file_name: file['name'],
            file_type: file['type'],
            file_size: file['size'] + '',
            file_data: dataURL,
            preview: file['preview'],
            filename: file['name'],
            last_modified: file['lastModifiedDate']
          }
          this.aList = this.aList.set(this.aList.size, droppedFile)
          if (this.aList.size > 0) {
            let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)

            if (totalFileSize > 24500000) {
              this.setState({ fileSizeError: true })
            }
            if (totalFileSize < 24500000) {
              this.setState({ fileSizeError: false })
            }
          }

          this.setState({
            filesData: this.state.filesData.concat(droppedFile)
          })

          this.forceUpdate()
        }.bind(this)
        reader.readAsDataURL(file)
      }
    })

  }
  onAttachRemove = (index) => {
    this.aList = this.aList.remove(index)
    if (this.aList.size < 1) {
      this.setState({ fileSizeError: false })
    }
    if (this.aList.size > 0) {
      let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
      if (totalFileSize > 24500000) {
        this.setState({ fileSizeError: true })
      }
      if (totalFileSize < 24500000) {
        this.setState({ fileSizeError: false })
      }
    }
    this.setState({
      filesData: this.state.filesData.filter((_, i) => i !== index)
    })
    this.forceUpdate()

  }
  formPostRequest1 = (updateStatus) => {
    const { PM_LIST_ID, PM_LIST_ITEM_ID, PM_ITEM_UNID } = this.props.PMDetails
    const { modelAttributes, userFname, pmType, isPmSelected, poItemId } = this.props
    const data = ((pmType === 'HVAC PM') || (!isPmSelected && poItemId)) ? this.state.updatedData : (pmType === 'GENERATOR PM') ? { ...this.state.updatedData, GENREADINGUNID: this.state.pm_unid } : {}
    const vendortechname = this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME === "VENDORTECHNAME").PM_TMPLT_ATTR_NEW_VALUE
    return this.state.compAttDetails.attributeData.map(ca => {
      const { PM_TMPLT_ATTR_ID, PM_TMPLT_ATTR_NAME, PM_TMPLT_ATTR_OLD_VALUE, PM_TMPLT_ATTR_NEW_VALUE, PM_TEMPLATE_ID, PM_TMPLT_ATTR_NEW_VALUE_SENT } = ca
      return {
        PM_LIST_ID,
        PM_LIST_ITEM_ID,
        PM_TEMPLATE_ID,
        PM_TMPLT_ATTR_ID,
        PM_TMPLT_ATTR_NAME,
        "PM_TMPLT_ATTR_UNID": PM_ITEM_UNID,
        PM_TMPLT_ATTR_OLD_VALUE,
        PM_TMPLT_ATTR_NEW_VALUE,
        PM_TMPLT_ATTR_NEW_VALUE_SENT,
        "PM_TMPLT_ATTR_ACTION": updateStatus,
        "LAST_UPDATED_BY": vendortechname
      }
    })


  }
  formPostRequest2 = () => {
    const { loginId, vendorId, storeTemplateData, pmType, fetchGenTankDetails, fetchPmModelAttributeDetails } = this.props
    const { PM_LIST_ID, PM_LIST_ITEM_ID, PM_ITEM_UNID } = this.props.PMDetails


    if (pmType === 'GENERATOR PM') {

      return fetchGenTankDetails(vendorId, loginId, PM_ITEM_UNID, PM_LIST_ITEM_ID).then(async action => {
        var genTankReadingInput = {}
        if (action.type === "FETCH_GENTANKDETAILS_SUCCESS") {



          const genData = action.genTank

          let readings = []

          let readingsObj = {

            gen_meta_universalid: (!!genData && genData.length > 0 && !!genData[0].gen_meta_universalid) ? genData[0].gen_meta_universalid : '',
            gen_emis_id: (!!genData && genData.length > 0 && !!genData[0].gen_emis_id) ? genData[0].gen_emis_id : '',
            ac_voltage: parseFloat(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 11).PM_TMPLT_ATTR_NEW_VALUE, 10),
            ac_current: parseFloat(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 12).PM_TMPLT_ATTR_NEW_VALUE, 10),
            oil_level: parseFloat(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 10).PM_TMPLT_ATTR_NEW_VALUE, 10),
            fuel_level1: parseInt(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 22).PM_TMPLT_ATTR_NEW_VALUE, 10) / 100,
            fuel_gallonsadded1: parseInt(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 21).PM_TMPLT_ATTR_NEW_VALUE, 10),
            totalruntime: parseInt(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 8).PM_TMPLT_ATTR_NEW_VALUE, 10)
          }
          readings.push(readingsObj)

          genTankReadingInput["source_sys"] = "iopvendorportal"
          genTankReadingInput["source_unid"] = (!!this.state.compAttDetails.attributeData && this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 3)) ? this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 3).PM_TMPLT_ATTR_NEW_VALUE : ''
          genTankReadingInput["readings"] = readings
          await this.setState({ submitpostRequest2: genTankReadingInput }, () => {

          })


        }

      })


    }
    return;
  }
  formFilesPostRequest = () => {
    const { currentPmListID, PMDetails, loginId } = this.props
    return this.state.filesData.map(fd => {
      let file_name = fd.file_name.split('.')[0]
      let file_type = fd.file_name.split('.')[1]
      return {
        "PM_LIST_ID": currentPmListID,
        "ASSOCIATED_PM_LISTS": `${currentPmListID},`,
        "PM_LIST_ITEM_ID": PMDetails.PM_LIST_ITEM_ID,
        "PM_LOCATION_UNID": PMDetails.PM_ITEM_UNID,
        "PM_FILE_CATEGORY": "VP",
        "PM_FILE_NAME": file_name,
        "PM_FILE_TYPE": file_type,
        "PM_FILE_SIZE": fd.file_size,
        "PM_FILE_DATA": fd.file_data,
        "LAST_UPDATED_BY": loginId
      }

    })

  }
  formElogPostRequest = (PMDetails, loginId, vendorId, vendorName, pmType, title) => {

    let verizonFeedback = !!this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME === 'Verizon Feedback') ? this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME === 'Verizon Feedback').PM_TMPLT_ATTR_NEW_VALUE : ''
    return {
      "oprtnType": "I",
      "shift": "Day",
      "sendemail": false,
      "privacyflag": "Public",
      "oncall": "No",
      "red_flag": "No",
      "contenttext": `${pmType.toUpperCase()} has been resubmitted.  The previous result was declined by ${PMDetails.LAST_UPDATED_BY} on ${PMDetails.LAST_UPDATED_DATE} with reason "${verizonFeedback}"`,
      "files": [],
      "elogtype": "CELL_SITE",
      "login_id": loginId,
      "universalid": PMDetails.PM_ITEM_UNID,
      "unvalue": PMDetails.PM_LOCATION_NAME,
      "meta_createdname": this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_ID === 2).PM_TMPLT_ATTR_NEW_VALUE,
      "recorded_on": moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A'),
      "subtype": "VENDORPM",
      "subtypename": "WORKORDER",
      "subtypeid": `${title.PO}, ${title.Line}, ${title.Schedule}`,
      "fromsystem": "IOPLite",
      "subject": "",
      "element": "",
      "emailid": "",
      "worktype": "Vendor",
      "vendor": `${vendorId}-${vendorName}`
    }
  }
  async reUpload() {
    const { vendorId, loginId, PMDetails, uploadFiles, submitPMQuote, fetchPmGridDetails, currentPmListID } = this.props
    var filesPostRequest = {
      "fileList": this.formFilesPostRequest()
    }
    let updateAction = this.props.PMDetails.PM_ITEM_STATUS == 'COMPLETED' ? 'COMPLETE' : this.props.PMDetails.PM_ITEM_STATUS == 'DECLINED' || this.props.PMDetails.PM_ITEM_STATUS == 'RESUBMITTED' ? 'RESUBMIT' : ''
    const submitpostRequest1 = {


      updatedData: await this.formPostRequest1(updateAction)
    }
    if (this.state.filesData.length > 0) {
      submitPMQuote(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, submitpostRequest1)
      uploadFiles(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, filesPostRequest).then((action) => {

        if (action.type === 'UPLOAD_FILES_SUCCESS') {

          this.props.notiref.addNotification({
            title: 'success',
            position: "br",
            level: 'success',
            message: "Files upload successful"
          })
          fetchPmGridDetails(vendorId, loginId, currentPmListID)

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
    }
    this.props.handleHideModal()
  }
  async onSubmit() {
    const { vendorId, vendorName, loginId, title, submitPMQuote, PMDetails, uploadFiles, currentPmListID, fetchPmGridDetails, pmType, submitGenReadingsRequest, saveElogByWorkOrderID, poItemId, isPmSelected } = this.props


    const submitpostRequest1 = {
      updatedData: await this.formPostRequest1('RESUBMIT')
    }

    var filesPostRequest = {
      "fileList": await this.formFilesPostRequest()
    }
    let elogInput = await this.formElogPostRequest(PMDetails, loginId, vendorId, vendorName, pmType, title)


    if (pmType === 'GENERATOR PM') {
      await this.formPostRequest2()



      submitGenReadingsRequest(this.state.pm_unid, this.state.submitpostRequest2).then((action) => {


        if (action.type === 'SUBMIT_GENTANKDETAILS_SUCCESS' && !!action.savedMessage && action.savedMessage.message === 'Generator Readings updated successfully') {

          this.props.notiref.addNotification({
            title: 'success',
            position: "br",
            level: 'success',
            message: action.savedMessage.message
          })

        }
        else {
          this.props.notiref.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: "Generator Readings update failed"
          })

        }
      })
        .catch(e => {
          this.props.notiref.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: "Generator Readings update failed"
          })
        })
      submitPMQuote(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, submitpostRequest1).then((action) => {

        if (action.type === 'SUBMIT_PM_QUOTE_SUCCESS') {
          this.props.notiref.addNotification({
            title: 'success',
            position: "br",
            level: 'success',
            message: "Details Submission successful"
          })
          saveElogByWorkOrderID(loginId, elogInput).then(action => {
            if (action.type === 'FETCH_SAVE_ELOG_SUCCESS') {
              this.props.notiref.addNotification({
                title: 'success',
                position: "br",
                level: 'success',
                message: "Readings submission to Elog succesful"
              })
            }
          }).catch(e => {
            this.props.notiref.addNotification({
              title: 'error',
              position: "br",
              level: 'error',
              message: "Readings Submission to Elog failed"
            })
          })

          this.props.fetchSearchedSites(vendorId, loginId).then(action => {
            this.props.filterSearchedSites(vendorId, loginId, this.props.searchString)
          })

          fetchPmGridDetails(vendorId, loginId, currentPmListID)
          this.props.handleHideModal()
          if (this.state.filesData.length > 0) {
            uploadFiles(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, filesPostRequest).then((action) => {

              if (action.type === 'UPLOAD_FILES_SUCCESS') {

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
          }

        }




      })
        .catch(e => {
          this.props.notiref.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: "Details Submission failed"
          })
        })

    }
    else if ((pmType === 'HVAC PM') || (!isPmSelected && poItemId)) {


      submitPMQuote(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, submitpostRequest1).then((action) => {

        if (action.type === 'SUBMIT_PM_QUOTE_SUCCESS') {
          this.props.notiref.addNotification({
            title: 'success',
            position: "br",
            level: 'success',
            message: "Details Submission successful"
          })

          this.props.fetchSearchedSites(vendorId, loginId).then(action => {
            this.props.filterSearchedSites(vendorId, loginId, this.props.searchString)
          })

          fetchPmGridDetails(vendorId, loginId, currentPmListID)
          saveElogByWorkOrderID(loginId, elogInput).then(action => {
            if (action.type === 'FETCH_SAVE_ELOG_SUCCESS') {
              this.props.notiref.addNotification({
                title: 'success',
                position: "br",
                level: 'success',
                message: "Readings submission to Elog succesful"
              })
            }
          }).catch(e => {
            this.props.notiref.addNotification({
              title: 'error',
              position: "br",
              level: 'error',
              message: "Readings Submission to Elog failed"
            })
          })
          this.props.handleHideModal()
          if (this.state.filesData.length > 0) {
            uploadFiles(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, filesPostRequest).then((action) => {

              if (action.type === 'UPLOAD_FILES_SUCCESS') {

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
          }

        }




      })
        .catch(e => {
          this.props.notiref.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: "Details Submission failed"
          })
        })



    }



  }
  saveAsDraft = () => {
    const { vendorId, vendorName, loginId, title, submitPMQuote, PMDetails, uploadFiles, currentPmListID, fetchPmGridDetails, pmType } = this.props


    const submitpostRequest1 = {
      updatedData: this.formPostRequest1('DECLINED_DRAFT')
    }

    var filesPostRequest = {
      "fileList": this.formFilesPostRequest()
    }

    submitPMQuote(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, submitpostRequest1).then((action) => {

      if (action.type === 'SUBMIT_PM_QUOTE_SUCCESS') {
        this.props.notiref.addNotification({
          title: 'success',
          position: "br",
          level: 'success',
          message: "Details Submission successful"
        })

        this.props.fetchSearchedSites(vendorId, loginId).then(action => {
          this.props.filterSearchedSites(vendorId, loginId, this.props.searchString)
        })

        fetchPmGridDetails(vendorId, loginId, currentPmListID)
        this.props.handleHideModal()
        if (this.state.filesData.length > 0) {
          uploadFiles(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, filesPostRequest).then((action) => {

            if (action.type === 'UPLOAD_FILES_SUCCESS') {

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
        }

      }




    })
      .catch(e => {
        this.props.notiref.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: "Details Submission failed"
        })
      })
  }

  ReasonForSeltextArea = (currentAttribute, e) => {
    const { user, loginId, vendorId, modifyCompAttDetails } = this.props

    const newAttData = this.state.compAttDetails.attributeData.map(cad => {

      if (currentAttribute.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID) {
        return {
          ...cad,
          PM_TMPLT_ATTR_NEW_VALUE_SENT: e.target.value
        }

      }
      else {
        return cad
      }
    })
    const newCompAttDetails = { ...this.state.compAttDetails, attributeData: newAttData }
    modifyCompAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID, newCompAttDetails).then(action => {

      this.setState({ compAttDetails: action.modfdList }, () => {
        let mandateFields = (Object.entries(this.state.compAttDetails.attributeData)).filter(pair => {
          if (this.state.mandAttKeys.includes(pair[1].PM_TMPLT_ATTR_NAME) && pair[1].PM_TMPLT_ATTR_NAME !== 'GENREADINGUNID') {
            return pair[1]
          }
        })
        if (Object.values(this.toObject(mandateFields)).filter((ad) => !ad.PM_TMPLT_ATTR_NEW_VALUE).length === 0) {
          this.setState({ disableSubmit: false })
        }
        else {
          this.setState({ disableSubmit: true })
        }
      })

    })
  }
  formDropdownDefault = (currObj) => {
    return !!currObj.PM_TMPLT_ATTR_NEW_VALUE ? { value: currObj.PM_TMPLT_ATTR_NEW_VALUE, label: currObj.PM_TMPLT_ATTR_NEW_VALUE, isFixed: true } : { value: '', label: '', isFixed: true }
  }
  formDefaultRepairDropdownValue = (currObj) => {

    let selOptions = !!currObj.PM_TMPLT_ATTR_NEW_VALUE ? (currObj.PM_TMPLT_ATTR_NEW_VALUE.split(',').map(option => ({ value: option, label: option, isFixed: true }))) : { value: '', label: '', isFixed: true }
    if (!(!!selOptions[0] && selOptions[0].value === '')) return selOptions
    else return { value: '', label: '', isFixed: true }

  }
  setdiffSetpt = (currObj) => {
    const { user, loginId, vendorId, modifyCompAttDetails } = this.props
    var diffSetPt
    if (currObj.PM_TMPLT_ATTR_ID === 3) {
      diffSetPt = this.state.compAttDetails.attributeData.find(cad => cad.PM_TMPLT_ATTR_ID === 34)
    }
    else if (currObj.PM_TMPLT_ATTR_ID === 15) {
      diffSetPt = this.state.compAttDetails.attributeData.find(cad => cad.PM_TMPLT_ATTR_ID === 36)
    }


    const newAttData = this.state.compAttDetails.attributeData.map(cad => {

      if (diffSetPt.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID) {

        if (currObj.PM_TMPLT_ATTR_NEW_VALUE === 'AirSys') {
          return {
            ...cad,
            PM_TMPLT_ATTR_NEW_VALUE: '',

          }
        }
        else if (currObj.PM_TMPLT_ATTR_NEW_VALUE === 'Bard' || currObj.PM_TMPLT_ATTR_NEW_VALUE === 'Marvair') {

          return {
            ...cad,
            PM_TMPLT_ATTR_NEW_VALUE: '',

          }
        }
        else {
          return {
            ...cad,
            PM_TMPLT_ATTR_NEW_VALUE: 'NOT APPLICABLE',

          }
        }

      }

      else {
        return cad
      }

    })
    const newCompAttDetails = { ...this.state.compAttDetails, attributeData: newAttData }
    modifyCompAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID, newCompAttDetails).then(action => {

      this.setState({ compAttDetails: action.modfdList }, () => {
        let mandateFields = (Object.entries(this.state.compAttDetails.attributeData)).filter(pair => {
          if (this.state.mandAttKeys.includes(pair[1].PM_TMPLT_ATTR_NAME) && pair[1].PM_TMPLT_ATTR_NAME !== 'GENREADINGUNID') {
            return pair[1]
          }
        })
        if (Object.values(this.toObject(mandateFields)).filter((ad) => !ad.PM_TMPLT_ATTR_NEW_VALUE).length === 0) {
          this.setState({ disableSubmit: false })
        }
        else {
          this.setState({ disableSubmit: true })
        }
      })

    })
    return;
  }

  handleDropdownChange = (currObj, e) => {
    const { user, loginId, vendorId, modifyCompAttDetails } = this.props

    const newAttData = this.state.compAttDetails.attributeData.map(cad => {

      if ((this.props.pmType === 'HVAC PM' && currObj.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID && currObj.PM_TMPLT_ATTR_ID === 37) || (this.props.pmType === 'GENERATOR PM' && currObj.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID && cad.PM_TMPLT_ATTR_ID === 26)) {
        let repairValuesArr = !!e && e.map(arr => arr.value)
        let repairValuesStr = !!repairValuesArr && repairValuesArr.toString()
        return {
          ...cad,
          PM_TMPLT_ATTR_NEW_VALUE: repairValuesStr
        }
      }
      if (currObj.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID && e.value === 'Other') {

        return {
          ...cad,
          PM_TMPLT_ATTR_NEW_VALUE: e.value,
          otherSelected: true
        }

      }
      else if (currObj.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID && e.value !== 'Other') {
        return {
          ...cad,
          PM_TMPLT_ATTR_NEW_VALUE: e.value,
          otherSelected: false
        }
      }
      else {
        return cad
      }

    })
    const newCompAttDetails = { ...this.state.compAttDetails, attributeData: newAttData }
    modifyCompAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID, newCompAttDetails).then(action => {

      this.setState({ compAttDetails: action.modfdList }, () => {
        if (currObj.PM_TMPLT_ATTR_ID === 3 || currObj.PM_TMPLT_ATTR_ID === 15) {

          this.setdiffSetpt(this.state.compAttDetails.attributeData.find(cad => cad.PM_TMPLT_ATTR_ID === currObj.PM_TMPLT_ATTR_ID))
        }
        let mandateFields = (Object.entries(this.state.compAttDetails.attributeData)).filter(pair => {
          if (this.state.mandAttKeys.includes(pair[1].PM_TMPLT_ATTR_NAME) && pair[1].PM_TMPLT_ATTR_NAME !== 'GENREADINGUNID') {
            return pair[1]
          }
        })
        if (Object.values(this.toObject(mandateFields)).filter((ad) => !ad.PM_TMPLT_ATTR_NEW_VALUE).length === 0) {
          this.setState({ disableSubmit: false })
        }
        else {
          this.setState({ disableSubmit: true })
        }
      })

    })
  }
  formOptionsDropdown = () => {
    const { user, loginId, vendorId, modifyCompAttDetails } = this.props
    const newAttData = this.state.compAttDetails.attributeData.map(cad => {
      const PM_TMPLT_ATTR_FLD_VALUE = !!this.props.modelAttributes && !!this.props.modelAttributes.find(mat => mat.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID) && !!this.props.modelAttributes.find(mat => mat.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID).PM_TMPLT_ATTR_FLD_VALUE ? this.props.modelAttributes.find(mat => mat.PM_TMPLT_ATTR_ID === cad.PM_TMPLT_ATTR_ID).PM_TMPLT_ATTR_FLD_VALUE.split(',').map(option => ({ value: option, label: option, isFixed: true })) : []
      if ((this.props.pmType === 'HVAC PM' && cad.PM_TMPLT_ATTR_ID === 37) || (this.props.pmType === 'GENERATOR PM' && cad.PM_TMPLT_ATTR_ID === 26)) {
      }
      return {
        ...cad,
        PM_TMPLT_ATTR_FLD_VALUE
      }
    })
    const newCompAttDetails = { ...this.state.compAttDetails, attributeData: newAttData }
    modifyCompAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID, newCompAttDetails).then(action => {

      this.setState({ compAttDetails: action.modfdList })

    })
    return;
  }
  formDifDropdown = (currObj) => {
    var manValue
    if (currObj.PM_TMPLT_ATTR_ID === 34) {

      manValue = !!this.state.compAttDetails && this.state.compAttDetails.attributeData.length > 0 && !!this.state.compAttDetails.attributeData.find(cad => cad.PM_TMPLT_ATTR_ID === 3) ? this.state.compAttDetails.attributeData.find(cad => cad.PM_TMPLT_ATTR_ID === 3) : {}

    }
    else if (currObj.PM_TMPLT_ATTR_ID === 36) {
      manValue = !!this.state.compAttDetails && this.state.compAttDetails.attributeData.length > 0 && !!this.state.compAttDetails.attributeData.find(cad => cad.PM_TMPLT_ATTR_ID === 15) ? this.state.compAttDetails.attributeData.find(cad => cad.PM_TMPLT_ATTR_ID === 15) : {}
    }

    if (!!manValue && !!manValue.PM_TMPLT_ATTR_NEW_VALUE && manValue.PM_TMPLT_ATTR_NEW_VALUE === 'AirSys') {
      return this.state.drpdwnOptions1
    }
    else if (!!manValue && !!manValue.PM_TMPLT_ATTR_NEW_VALUE && (manValue.PM_TMPLT_ATTR_NEW_VALUE === 'Marvair' || manValue.PM_TMPLT_ATTR_NEW_VALUE === 'Bard')) {
      return this.state.drpdwnOptions2
    }
    else {
      return []
    }
  }

  render() {
    let issoCondition = false
    let { realLoginId, loginId, isssouser, ssoUrl, realUser } = this.props

    //offshore condition

    let offShore = false;
    if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
      offShore = realUser.toJS().isUserOffShore
    }

    if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.includes('ssologin') || offShore === "true") {
      issoCondition = true
    }
    return (
      <div className="container-fluid">
        {this.props.compAttLoading ? this.renderLoading() : this.props.compAttError ? this.renderErrorScreen() : (
          <div className="container-fluid">
            <div style={{ margin: 'auto', width: '100%' }}>
              <Accordion
                style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
                TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  Site Information
                </AccordionSummary>
                <AccordionDetails>
                  <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                    <div className="col-lg-12" style={{ float: 'left' }}>
                      <SiteInformation notifref={this.props.notiref} siteUnid={this.props.PMDetails.PM_ITEM_UNID} />
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              <br />
            </div>

            <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
              <tbody className="vzwtable text-center">

                {!!this.state.compAttDetails && !!this.state.compAttDetails.attributeData && this.state.compAttDetails.attributeData.length > 0 && this.state.compAttDetails.attributeData.find(v => v.PM_TMPLT_ATTR_NAME == 'Verizon Feedback') && this.state.compAttDetails.attributeData.find(v => v.PM_TMPLT_ATTR_NAME == 'Verizon Feedback').PM_TMPLT_ATTR_NEW_VALUE && (
                  <tr colSpan={"4"}>
                    <td className="Form-group no-border" colSpan="4" ><h4>{this.state.compAttDetails.attributeData.find(v => v.PM_TMPLT_ATTR_NAME == 'Verizon Feedback').PM_TMPLT_ATTR_NAME}</h4></td>
                    <td className="Form-group no-border" colSpan="4" >
                      {this.state.compAttDetails.attributeData.find(v => v.PM_TMPLT_ATTR_NAME == 'Verizon Feedback').PM_TMPLT_ATTR_NEW_VALUE}
                    </td>
                    <td className="Form-group no-border" colSpan="4" >

                    </td>
                  </tr>

                )}
                {!!this.state.compAttDetails && !!this.state.compAttDetails.attachmentsData && (
                  <tr colSpan={"4"}>
                    <td className="Form-group no-border" colSpan="4" ><h4>PM Report</h4></td>
                    <td className="Form-group no-border" colSpan="4" > <ul>

                      {this.state.compAttDetails.attachmentsData.filter(v => v.PM_FILE_TYPE && v.PM_FILE_TYPE.toLowerCase() == 'pdf' && v.PM_FILE_NAME.includes('GeneratorPMReport')).map(ad => (<li
                        onClick={this.downloadAttachments.bind(this, ad.PM_ATTACHMENTS_ID, ad.PM_LIST_ITEM_ID, ad.PM_LIST_ID)} style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.PM_FILE_NAME}`}</b></li>))}
                    </ul>

                    </td>
                    <td className="Form-group no-border" colSpan="4" >

                    </td>
                  </tr>

                )}




                {!!this.state.compAttDetails && !!this.state.compAttDetails.attachmentsData && (

                  <tr colSpan={"4"}>
                    <td className="Form-group no-border" colSpan="4" ><h4>Attachments</h4></td>
                    <td className="Form-group no-border" colSpan="4" > <ul>

                      {this.state.compAttDetails.attachmentsData.filter(v => v.PM_FILE_TYPE && !v.PM_FILE_NAME.includes('GeneratorPMReport') && !['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(v.PM_FILE_TYPE.toLowerCase())).map(ad => (<li
                        onClick={this.downloadAttachments.bind(this, ad.PM_ATTACHMENTS_ID, ad.PM_LIST_ITEM_ID, ad.PM_LIST_ID)} style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.PM_FILE_NAME}`}</b></li>))}
                    </ul>

                    </td>
                    <td className="Form-group no-border" colSpan="4" >

                    </td>
                  </tr>

                )}


              </tbody>
            </table>
          </div>

        )}



        {
          <div className="pt-3 row">
            <div className="col-md-4">
              {(this.props.PMDetails.PM_ITEM_STATUS !== 'PENDING') &&
                (<Dropzone onDrop={this.onFileDrop.bind(this)}>
                  {/* <div style={{ 'textAlign': 'center', 'paddingTop': '10%' }}>Drop files here, or click to select files to upload</div> */}
                  {({ getRootProps, getInputProps }) => (
                    <section>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>Drag 'n' drop some files here, or click to select files</p>
                      </div>
                    </section>
                  )}
                </Dropzone>)}
            </div>
            <div className="col-md-4">
              {(this.props.PMDetails.PM_ITEM_STATUS !== 'PENDING') && this.state.fileSizeError && (<tr><td colSpan="6" ><MessageBox messages={List(["The size of attachments should be less than 25 MB!"])} /></td></tr>)}
              {(this.props.PMDetails.PM_ITEM_STATUS !== 'PENDING') && <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />}
            </div>
            <div className="col-md-4">
              <button type="submit"
                className="Button--secondary float-right"
                disabled={!this.state.filesData.length > 0 || this.state.fileSizeError || issoCondition}
                onClick={this.reUpload.bind(this)}
                style={{ marginRight: "5px" }}
              >
                Re-upload
              </button>
            </div>


          </div>
        }
        {this.state.compAttDetailsGenPdf && this.state.compAttDetailsGenPdf.attachmentsData && this.state.compAttDetailsGenPdf.attachmentsData.filter(v => v.PM_FILE_TYPE && v.PM_FILE_NAME.includes('GeneratorPMReport')).length == 0 && <div className="text-center mt-3" style={{ display: 'flex', flexDirection: 'row-reverse' }}><b style={{ cursor: "pointer", color: "blue" }} onClick={this.generatePDFOndemand.bind(this)} >Generate Inspection Result</b></div>}
      </div>
    )
  }
}

function stateToProps(state, ownProps) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user.toJS().vendor_id
  let vendorName = user.toJS().vendor_name
  let userFname = state.getIn(['Users', 'entities', 'users', loginId, "fname"])

  let compAttLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmCompAttDetailsLoading", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let CompAttDetails = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmCompAttDetails", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let compAttError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmCompAttError", ownProps.PMDetails.PM_LIST_ITEM_ID])

  let modelAttributes = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'pmModelAttDetails', 'getPmModelAttDetails'], List()).toJS()
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''



  return {
    user,
    userFname,
    loginId,
    vendorId,
    compAttLoading,
    CompAttDetails,
    compAttError,
    vendorName,
    modelAttributes,
    realLoginId,
    realUser,
    ssoUrl,
    isssouser,


  }

}
export default connect(stateToProps, { ...pmActions, submitGenReadingsRequest, saveElogByWorkOrderID })(PMModelDetailsCompleted)