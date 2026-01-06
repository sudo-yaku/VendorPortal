import React, { Component } from "react"
import { connect } from "react-redux"
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import Loader from '../../Layout/components/Loader'
import Checkbox from '@material-ui/core/Checkbox';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Dropzone from 'react-dropzone'
import ListOfFiles from './ListOfFiles'
import { SingleDatePicker } from 'react-dates'
import moment from 'moment'
import Select from 'react-select'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils.js'
import { PDFExport } from '@progress/kendo-react-pdf'
import towerFoundation from '../../Images/towerFoundation.png'
import towerInventory from '../../Images/towerInventory.png'
import MessageBox from '../../Forms/components/MessageBox'
import SiteInformation from "../../sites/components/SiteInformation"
import { DataGrid } from '@mui/x-data-grid';




class TowerInspection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSummary: false,
      inspectionDate: moment(),
      modelAttributes: [],
      inspectionDateFocused: null,
      minorMaintnceItems: [],
      selectedRows: [],
      disableButton: true,
      inspectionItems: [],
      towerAttributeData: [],
      towerinspCmpltdBasic: [],
      towerinspCmpltdMinor: [],
      towerinspCmpltdInsp: [],
      towerinspFndMeasure: [],
      towerinspInventory: [],
      towerinspCmpldFoundation: [],
      attachmentList: [],
      currDrpdwnVal: { label: '', value: '' },
      drpdwnoptions: [{ label: 'N/A', value: 'N/A' }, { label: 'Critical', value: 'Critical' }, { label: 'Impacting', value: 'Impacting' }, { label: 'Observed potentially impacting', value: 'Observed potentially impacting' }, { label: 'Observed non-impacting', value: 'Observed non-impacting' }, { label: 'Pass', value: 'Pass' }],
      filesData: [],
      fileSizeError: false,
      techName: '',
      commentsVendor: '',
      uniqueGrps: [],
      pageLoading: false,
      exportToPdf: false,
      filterModel : null

    }
    this.aList = List()
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    const { fetchPmModelAttributeDetails, fetchTowerInspItems, vendorId, loginId, currentPmList, submarket, pmListItemIdSearch = '' } = this.props
    let { PM_LIST_ITEM_ID_PS, PM_LOCATION_UNID, PM_LIST_ID, PM_ITEM_UNID = '' } = this.props.selectedTOWER
    let pm_type = currentPmList.PM_TYPE_NAME
    let pmListItemId = pmListItemIdSearch ? pmListItemIdSearch : PM_LIST_ITEM_ID_PS

    let unid = PM_ITEM_UNID ? PM_ITEM_UNID : PM_LOCATION_UNID
    let pmListId = PM_LIST_ID
    let pmTypeId = '12'
    this.setState({ pageLoading: true })
    fetchPmModelAttributeDetails(vendorId, loginId, pm_type, '').then(action => {
      let modelAttributes = this.props.modelAttributes.map(val => ({ ...val, currVal: null }))
      this.setState({ modelAttributes })
    })
    fetchTowerInspItems(vendorId, loginId, submarket, pmListItemId, unid, pmListId, pmTypeId).then(action => {

      if (action.type == 'FETCH_TOWERINSP_SUCCESS' && action.inspData && action.inspData.getTowerInspItems && action.inspData.getTowerInspItems.output && action.inspData.getTowerInspItems.output.towerinspectionsRefData.length > 0) {
        let pdfInput = {
          ...action.inspData.getTowerInspItems, siteInfo: {
            vendorId: this.props.vendorId + "",
            vendorName: this.props.user.get("vendor_name")
          }
        }

        this.setState({
          pageLoading: false,
          minorMaintnceItems: action.inspData.getTowerInspItems.output.towerinspectionsRefData.filter(val => val.ATTRIBUTE_TYPE == "Minor Maintenance").map(inval => ({ ...inval, ATTRIBUTE_FIELDS: '1', COST_QTY: parseFloat(inval.ATTRIBUTE_VALUE) })),
          inspectionItems: action.inspData.getTowerInspItems.output.towerinspectionsRefData.filter(val => val.ATTRIBUTE_TYPE == "Inspection").map(inval => ({ ...inval, RATING: '', PHOTO: '', ICOMMENTS: '' })),
          towerinspFndMeasure: action.inspData.getTowerInspItems.output.towerinspectionsRefData.filter(val => val.ATTRIBUTE_CATEGORY == "Required Foundation").map(inval => ({ ...inval, legA: '', legB: '', legC: '', legD: '' })),
          towerinspInventory: action.inspData.getTowerInspItems.output.towerinspectionsRefData.filter(val => val.ATTRIBUTE_CATEGORY == "Tower Inventory").map(inval => ({ ...inval, height: '', owner: '', type: '' })),
          towerData: action.inspData.getTowerInspItems.output.towerData.length > 0 ? action.inspData.getTowerInspItems.output.towerData[0] : [],
          towerAttributeData: action.inspData.getTowerInspItems.output.towerAttributeData.length > 0 ? action.inspData.getTowerInspItems.output.towerAttributeData : [],
          towerinspCmpltdBasic: action.inspData.getTowerInspItems.output.towerAttributeData.length > 0 ? action.inspData.getTowerInspItems.output.towerAttributeData.filter(i => i.ATTRIBUTE_CATEGORY == 'TOWER INSPECTION') : [],
          towerinspCmpldFoundation: action.inspData.getTowerInspItems.output.towerAttributeData.length > 0 ? action.inspData.getTowerInspItems.output.towerAttributeData.filter(i => i.ATTRIBUTE_CATEGORY == 'Tower Foundation Measurements') : [],
          towerinspCmpltdMinor: action.inspData.getTowerInspItems.output.towerAttributeData.length > 0 ? action.inspData.getTowerInspItems.output.towerAttributeData.filter(i => i.ATTRIBUTE_CATEGORY == 'Minor Maintenance') : [],
          towerinspCmpltdInsp: action.inspData.getTowerInspItems.output.towerAttributeData.length > 0 ? action.inspData.getTowerInspItems.output.towerAttributeData.filter(i => i.ATTRIBUTE_CATEGORY == 'Inspection') : [],
          attachmentList: action.inspData.getTowerInspItems.output.attachmentList.length > 0 ? action.inspData.getTowerInspItems.output.attachmentList : [],
          uniqueGrps: action.inspData.getTowerInspItems.output.towerinspectionsRefData.filter(val => val.ATTRIBUTE_TYPE == "Inspection").map(inval => (inval.ATTRIBUTE_CATEGORY)).reduce((unique, item) => {
            return unique.includes(item) ? unique : [...unique, item]
          }, [])
        })
      }
    })
  }
  renderLoading = () => {
    return (
      <Loader color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center" />
    )
  }
  async exportToPDFClick() {

    await this.setState({ exportToPDF: true })
    await this.towerInspPdf.save()
    await this.setState({ exportToPDF: false })
  }
  handleFndChange = (cur, e) => {
    let towerinspFndMeasure = this.state.towerinspFndMeasure.map(val => {
      if (cur.ATTRIBUTE_NAME == val.ATTRIBUTE_NAME) {
        return {
          ...val,
          [e.target.name]: e.target.value
        }
      }
      else {
        return val
      }

    })
    this.setState({ towerinspFndMeasure })
  }
  handleFndChangeInv = (cur, e) => {
    let towerinspInventory = this.state.towerinspInventory.map(val => {
      if (cur.ATTRIBUTE_NAME == val.ATTRIBUTE_NAME) {
        return {
          ...val,
          [e.target.name]: e.target.value
        }
      }
      else {
        return val
      }

    })
    this.setState({ towerinspInventory })
  }
  downloadAttachments = (currentAtt) => {

    let fileName = currentAtt.file_name
    let unid = currentAtt.source_universalid ? currentAtt.source_universalid : ''
    const { loginId, vendorId, fetchFileDataGO95 } = this.props
    fetchFileDataGO95(loginId, vendorId, fileName, unid).then(action => {
      if (action.type == "FETCH_FILE_DETAILSGO95_SUCCESS" && action.fileDetailsgo95 && action.fileDetailsgo95.getFileDataForGO95 && action.fileDetailsgo95.getFileDataForGO95.data) {

        let blob = dataURItoBlob(action.fileDetailsgo95.getFileDataForGO95.data)

        startDownload(blob, `${fileName}`)
      }
    })
  }
  checkDisable = () => {
    if (this.state.filesData.length > 0 && this.state.inspectionItems.every(i => !!i.RATING) && this.state.modelAttributes && this.state.modelAttributes.filter(val => !!val.PM_TMPLT_ATTR_FLD_GROUP && (val.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') || val.PM_TMPLT_ATTR_FLD_GROUP.includes('4-') || val.PM_TMPLT_ATTR_FLD_GROUP.includes('5-'))).every(i => !!i.currVal) && this.state.techName.length > 0 && this.state.minorMaintnceItems.filter(val => val.itemSelected && val.qtError).length === 0 && !this.state.fileSizeError) { return false } else { return true }
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
  onGridReadyCmp = params => {
    this.gridOptionsCmp = params
    this.gridApiCmp = params.api
    this.gridColumnApiCmp = params.columnApi
    this.gridApiCmp.setFilterModel(null)
    if (params.api && params.api.sizeColumnsToFit) { params.api.sizeColumnsToFit() }
    params.api.sizeColumnsToFit()
    this.gridApiCmp.sizeColumnsToFit()
  };
  modifyGridDetails = () => {
    if (this.state.inspectionItems.length > 0) {
      return this.state.inspectionItems.map((fdata) => ({

        ATTRIBUTE_NAME: fdata.ATTRIBUTE_NAME ? fdata.ATTRIBUTE_NAME : '',
        RATING: fdata.RATING ? fdata.RATING : '',
        PHOTO: fdata.PHOTO ? fdata.PHOTO : '',
        ICOMMENTS: fdata.ICOMMENTS ? fdata.ICOMMENTS : '',

        ATTRIBUTE_TYPE: fdata.ATTRIBUTE_TYPE ? fdata.ATTRIBUTE_TYPE : '',
        ATTRIBUTE_CATEGORY: fdata.ATTRIBUTE_CATEGORY ? fdata.ATTRIBUTE_CATEGORY : '',
        PHOTOTOOLTIP: 'Please add photo file name in the field and attach the photos below'
      }))
    } else { return [] }

  }
  modifyGridDetailsCmp = () => {
    if (this.state.towerinspCmpltdInsp.length > 0) {
      return this.state.towerinspCmpltdInsp.map((fdata) => ({

        ATTRIBUTE_NAME: fdata.ATTRIBUTE_NAME ? fdata.ATTRIBUTE_NAME : '',
        RATING: fdata.ATTRIBUTE_VALUE ? fdata.ATTRIBUTE_VALUE : '',
        PHOTO: fdata.ATTRIBUTE_FIELDS ? fdata.ATTRIBUTE_FIELDS : '',
        ICOMMENTS: fdata.ATTRIBUTE_COMMENTS ? fdata.ATTRIBUTE_COMMENTS : '',


        ATTRIBUTE_CATEGORY: fdata.ATTRIBUTE_SUBCATEGORY ? fdata.ATTRIBUTE_SUBCATEGORY : ''

      }))
    } else { return [] }

  }
  modifyGridDetailsSummary = () => {
    if (this.state.inspectionItems.length > 0) {
      return this.state.inspectionItems.filter(v => !!v.RATING && v.RATING != "N/A" && v.RATING != "Pass").map((fdata) => ({

        ATTRIBUTE_NAME: fdata.ATTRIBUTE_NAME ? fdata.ATTRIBUTE_NAME : '',
        RATING: fdata.RATING ? fdata.RATING : '',
        PHOTO: fdata.PHOTO ? fdata.PHOTO : '',
        ICOMMENTS: fdata.ICOMMENTS ? fdata.ICOMMENTS : '',

        ATTRIBUTE_TYPE: fdata.ATTRIBUTE_TYPE ? fdata.ATTRIBUTE_TYPE : '',
        ATTRIBUTE_CATEGORY: fdata.ATTRIBUTE_CATEGORY ? fdata.ATTRIBUTE_CATEGORY : '',
        PHOTOTOOLTIP: 'Please add photo file name in the field and attach the photos below'
      }))
    } else { return [] }

  }
  async onSelectionChanged(val) {

    var selectedRows = this.state.inspectionItems.filter(e => val.includes(e.ATTRIBUTE_NAME+';'+e.ATTRIBUTE_CATEGORY))
    var disableButton
    if (selectedRows.length > 0) {
      disableButton = false
    } else {

      disableButton = true
    }


    await this.setState({ selectedRows, disableButton })


  }
  handleChangeDrpdown = (e) => {
    this.setState({
      currDrpdwnVal: e
    })
  }
  retainSelection = () => {
    if (this.state.selectedRows.length > 0) {
      var conditionSel = this.state.selectedRows

      this.gridApi.forEachNode(function (node) {

        node.setSelected(!!conditionSel.find(inval => inval.ATTRIBUTE_NAME == node.data.ATTRIBUTE_NAME && inval.ATTRIBUTE_CATEGORY == node.data.ATTRIBUTE_CATEGORY))
      })
    }

  }
  onApply = () => {
    if (this.state.currDrpdwnVal && (this.state.currDrpdwnVal.value == "N/A" || this.state.currDrpdwnVal.value == "Pass" || this.state.selectedRows.every(v => !!v.ICOMMENTS && !!v.PHOTO))) {
      // const model = this.gridOptions.api.getFilterModel()
      // const selectedlistIds = this.state.selectedRows.map(val => val.ATTRIBUTE_NAME)
      const inspectionItems = this.state.inspectionItems.map(val => {
        if (this.state.selectedRows.find(inval => inval.ATTRIBUTE_NAME == val.ATTRIBUTE_NAME && inval.ATTRIBUTE_CATEGORY == val.ATTRIBUTE_CATEGORY)) {
          return {
            ...val,
            RATING: this.state.currDrpdwnVal.value
          }
        } else {
          return val
        }
      })
      this.setState({ inspectionItems, selectedRows: [] }, () => {
        // this.gridOptions.api.setFilterModel(model)
      })
    }
    else {
      alert("Please enter photo(file name) and comments for the selected items and move the cursor out of the cell afterward")
    }


  }

  handleInpChge = (cur, e) => {
    let modelAttributes = this.state.modelAttributes.map(i => {
      if (cur.PM_TMPLT_ATTR_ID == i.PM_TMPLT_ATTR_ID) {
        return {
          ...i,
          currVal: e.target.value
        }
      } else {
        return i
      }
    })
    this.setState({ modelAttributes })

  }
  handleChangeDrpdownModel = (cur, e) => {
    let modelAttributes = this.state.modelAttributes.map(i => {
      if (cur.PM_TMPLT_ATTR_ID == i.PM_TMPLT_ATTR_ID) {
        return {
          ...i,
          currVal: e
        }
      } else {
        return i
      }
    })
    this.setState({ modelAttributes })

  }
  onFileDrop(files) {
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
            if (totalFileSize > 45000000) {
              this.setState({ fileSizeError: true })
            }
            if (totalFileSize < 45000000) {
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
  formPostRequest = () => {
    let { vendorId, loginId, currentPmList, submarket, pmListItemIdSearch } = this.props
    let { PM_LIST_ITEM_ID_PS, PM_LOCATION_UNID, PM_LIST_ID, EQUIPMENT_UNID, PM_ITEM_UNID } = this.props.selectedTOWER
    let pmListItemId = pmListItemIdSearch ? pmListItemIdSearch : PM_LIST_ITEM_ID_PS

    let unid = PM_ITEM_UNID ? PM_ITEM_UNID : PM_LOCATION_UNID
    return {
      "updatedData": {
        "inspectionSummary": [
          {
            "PM_LIST_ID": Number(PM_LIST_ID),
            "PM_LIST_ITEM_ID": Number(pmListItemId),
            "SITE_UNID": unid,
            "EQUIPMENT_UNID": unid ? unid : '',
            "EQUIPMENT_TYPE": "POLE",
            "INSPECTION_UNID": null,
            "OPSTRACKER_UNID": null,
            "INSP_STATUS": "COMPLETED",
            "INSP_COMPLETED_BY": this.state.techName,
            "INSP_COMPLETED_DATE": moment(this.state.inspectionDate).format('DD/MM/YYYY'),
            "INSP_COMMENTS": this.state.commentsVendor ? this.state.commentsVendor : '',
            "LAST_UPDATED_BY": this.state.techName
          }
        ],
        "inspectionDetails": this.inspDetReq()
      },
      "opsTrackerCreateReqBody": {
        "recordtype": "c2towerinspection",
        "retrieve": "*",
        "retrieveformat": "simple",
        "data": {
          "site_universalid": unid,
          "status": this.state.modelAttributes.find(i => i.PM_TMPLT_ATTR_ID == 23).currVal.value == "YES" ? "REMEDIATION_NEW" : "COMPLETED",
          "po_number": currentPmList.PO_NUM,
          "inspection_type": "POLE",
          "inspection_date": moment(this.state.inspectionDate, 'DD/MM/YYYY').format('YYYY-MM-DD hh:mm A'),
          "inspection_tech_name": this.state.techName,
          "vendor_id": vendorId,
          "remediation_required": this.state.modelAttributes.find(i => i.PM_TMPLT_ATTR_ID == 23).currVal.value == "YES" ? "Y" : "N",
          "crit_items_found": this.state.inspectionItems.filter(val => val.RATING == "Critical").map(i => i.ATTRIBUTE_NAME).join(','),
          "impacting_items_found": this.state.inspectionItems.filter(val => val.RATING == "Impacting").map(i => i.ATTRIBUTE_NAME).join(','),

          "OBS_POT_IMPACTING": this.state.inspectionItems.filter(val => val.RATING == "Observed potentially impacting").map(i => i.ATTRIBUTE_NAME).join(','),
          "OBS_NON_IMPACTING": this.state.inspectionItems.filter(val => val.RATING == "Observed non-impacting").map(i => i.ATTRIBUTE_NAME).join(','),
          "struct_manufacturer": this.state.modelAttributes.find(i => i.PM_TMPLT_ATTR_ID == 12).currVal,
          "struct_model": this.state.modelAttributes.find(i => i.PM_TMPLT_ATTR_ID == 13).currVal,
          "tower_highest_point": this.state.modelAttributes.find(i => i.PM_TMPLT_ATTR_ID == 18).currVal,
          "safety_climb_safe": this.state.modelAttributes.find(i => i.PM_TMPLT_ATTR_ID == 24).currVal.value,
          "safety_climb_mfr": this.state.modelAttributes.find(i => i.PM_TMPLT_ATTR_ID == 20).currVal,
          "comments": this.state.commentsVendor,
          "cfd_minormaintenance": this.getminorMData()
        }
      },
      "opsTrackerUpdateReqBody": null
    }
  }
  getminorMData = () => {
    return this.state.minorMaintnceItems.filter(val => !!val.itemSelected).map((i, index) => {
      return {
        "itemid": index + 1,
        "itemname": i.ATTRIBUTE_NAME,
        "cost": i.ATTRIBUTE_VALUE,
        "quantity": i.ATTRIBUTE_FIELDS,
        "itemtotalcost": this.state.minorMaintnceItems.filter(val => !!val.itemSelected).map(i => parseFloat(i.ATTRIBUTE_VALUE) * parseFloat(i.ATTRIBUTE_FIELDS)).reduce((accumulator, item) => {
          return accumulator + item;
        }, 0) + ""

      }
    })
  }
  inspDetReq = () => {

    let { vendorId, loginId, currentPmList, submarket, pmListItemIdSearch } = this.props
    let { PM_LIST_ITEM_ID_PS, PM_LOCATION_UNID, PM_LIST_ID, EQUIPMENT_UNID, PM_ITEM_UNID } = this.props.selectedTOWER
    let pmListItemId = pmListItemIdSearch ? pmListItemIdSearch : PM_LIST_ITEM_ID_PS

    let unid = PM_ITEM_UNID ? PM_ITEM_UNID : PM_LOCATION_UNID
    let basicAttArr = this.state.modelAttributes.filter(val => !!val.PM_TMPLT_ATTR_FLD_GROUP && (val.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') || val.PM_TMPLT_ATTR_FLD_GROUP.includes('4-') || val.PM_TMPLT_ATTR_FLD_GROUP.includes('5-'))).map(i => ({

      "INSPECTION_UNID": null,
      "EQUIPMENT_UNID": unid ? unid : '',
      "ATTRIBUTE_ID": i.PM_TMPLT_ATTR_ID,
      "ATTRIBUTE_NAME": i.PM_TMPLT_ATTR_NAME,
      "ATTRIBUTE_VALUE": typeof i.currVal == 'object' ? i.currVal.value : i.currVal,
      "ATTRIBUTE_CATEGORY": 'TOWER INSPECTION',
      "ATTRIBUTE_SUBCATEGORY": i.PM_TMPLT_ATTR_FLD_GROUP ? i.PM_TMPLT_ATTR_FLD_GROUP : '',
      "ATTRIBUTE_FIELDS": "",
      "ATTRIBUTE_COMMENTS": "",
      "LAST_UPDATED_BY": this.state.techName

    }))
    let minorMaintnceItems = this.state.minorMaintnceItems.filter(val => !!val.itemSelected).map(i => ({
      "INSPECTION_UNID": null,
      "EQUIPMENT_UNID": unid ? unid : '',
      "ATTRIBUTE_ID": 27,
      "ATTRIBUTE_NAME": i.ATTRIBUTE_NAME,
      "ATTRIBUTE_VALUE": i.ATTRIBUTE_VALUE,
      "ATTRIBUTE_CATEGORY": i.ATTRIBUTE_TYPE,
      "ATTRIBUTE_SUBCATEGORY": '',
      "ATTRIBUTE_FIELDS": i.ATTRIBUTE_FIELDS ? i.ATTRIBUTE_FIELDS : '',
      "ATTRIBUTE_COMMENTS": "",
      "LAST_UPDATED_BY": this.state.techName
    }))
    let towerFoundation = this.state.towerinspFndMeasure.map(i => ({
      "INSPECTION_UNID": null,
      "EQUIPMENT_UNID": unid ? unid : '',
      "ATTRIBUTE_ID": 25,
      "ATTRIBUTE_NAME": i.ATTRIBUTE_NAME,
      "ATTRIBUTE_VALUE": `${i.legA ? i.legA : ''}^${i.legB ? i.legB : ''}^${i.legC ? i.legC : ''}^${i.legD ? i.legD : ''}`,
      "ATTRIBUTE_CATEGORY": i.ATTRIBUTE_TYPE,
      "ATTRIBUTE_SUBCATEGORY": i.ATTRIBUTE_CATEGORY,
      "ATTRIBUTE_FIELDS": '',
      "ATTRIBUTE_COMMENTS": "",
      "LAST_UPDATED_BY": this.state.techName
    }))
    let towerInventory = this.state.towerinspInventory.map(i => ({
      "INSPECTION_UNID": null,
      "EQUIPMENT_UNID": unid ? unid : '',
      "ATTRIBUTE_ID": 25,
      "ATTRIBUTE_NAME": i.ATTRIBUTE_NAME,
      "ATTRIBUTE_VALUE": `${i.height ? i.height : ''}^${i.owner ? i.owner : ''}^${i.type ? i.type : ''}`,
      "ATTRIBUTE_CATEGORY": i.ATTRIBUTE_TYPE,
      "ATTRIBUTE_SUBCATEGORY": i.ATTRIBUTE_CATEGORY,
      "ATTRIBUTE_FIELDS": '',
      "ATTRIBUTE_COMMENTS": "",
      "LAST_UPDATED_BY": this.state.techName
    }))
    let inspectionItems = this.state.inspectionItems.map(i => ({
      "INSPECTION_UNID": null,
      "EQUIPMENT_UNID": unid ? unid : '',
      "ATTRIBUTE_ID": 26,
      "ATTRIBUTE_NAME": i.ATTRIBUTE_NAME,
      "ATTRIBUTE_VALUE": i.RATING,
      "ATTRIBUTE_CATEGORY": i.ATTRIBUTE_TYPE,
      "ATTRIBUTE_SUBCATEGORY": i.ATTRIBUTE_CATEGORY,
      "ATTRIBUTE_FIELDS": i.PHOTO,
      "ATTRIBUTE_COMMENTS": i.ICOMMENTS,
      "LAST_UPDATED_BY": this.state.techName
    }))

    return [...basicAttArr, ...minorMaintnceItems, ...inspectionItems, ...towerFoundation, ...towerInventory]

  }
  getCritItems = () => {

    let critArr = this.state.selectedRows.filter(val => val.RATING == 'Critical')
    if (critArr.length > 0) { return critArr.map(i => i.ATTRIBUTE_NAME).join(';') } else { return '' }
  }
  getImpItems = () => {

    let impArr = this.state.selectedRows.filter(val => val.RATING == 'Impacting')
    if (impArr.length > 0) { return impArr.map(i => i.ATTRIBUTE_NAME).join(';') } else { return '' }
  }
  formFilesPostRequest = () => {

    return this.state.filesData.map(fd => {
      let file_name = fd.file_name.split('.')[0]
      let file_type = fd.file_name.split('.')[1]
      return {


        "name": fd.file_name,
        "description": `In description: ${file_name} from vendor portal upload on ${moment().format('MM/DD/YYYY')}`,
        "size": fd.file_size,
        "data": fd.file_data

      }
    })

  }
  reUpload = () => {
    let { vendorId, loginId, uploadFilesGO95, fetchDraftGridDetails } = this.props
    var filesPostRequest = {
      "files": this.formFilesPostRequest()
    }
    if (this.state.filesData.length > 0) {
      let opsUnid = this.state.towerAttributeData[0].OPSTRACKER_UNID
      uploadFilesGO95(vendorId, loginId, opsUnid, filesPostRequest).then((action) => {
        this.setState({ pageLoading: false })
        if (action.type === 'UPLOAD_FILES_SUCCESS') {
          this.props.handleHideModalTOWER()
          fetchDraftGridDetails(vendorId, loginId, this.props.selectedTOWER.PM_LIST_ID, '', false, true)
          this.props.notiref.addNotification({
            title: 'success',
            position: "br",
            level: 'success',
            message: "Attachments uploaded Succesfully"
          })

        }

      }).catch((error) => {

        if (error) {
          this.props.notiref.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: "Attachments upload failed"
          })
        }
      })
    }
  }

  async onSubmit() {
    let postRequest = this.formPostRequest()
    let { PM_LIST_ITEM_ID_PS, PM_LOCATION_UNID, PM_LIST_ID, PM_ITEM_UNID } = this.props.selectedTOWER
    let pmListItemId = this.props.pmListItemIdSearch ? this.props.pmListItemIdSearch : PM_LIST_ITEM_ID_PS

    let unid = PM_ITEM_UNID ? PM_ITEM_UNID : PM_LOCATION_UNID



    let pmListId = PM_LIST_ID
    let pmTypeId = '12'


    let { vendorId, loginId, submitTowerInsp, fetchDraftGridDetails, fetchTowerInspItems, submarket } = this.props

    this.setState({ pageLoading: true })
    await submitTowerInsp(vendorId, loginId, pmListItemId, postRequest).then(async action => {

      var filesPostRequest = {
        "files": this.formFilesPostRequest()
      }
      if (action.type === 'SUBMIT_TOWERINSP_SUCCESS') {
        let opsUnid = !!action.submitTowerInspStatus.opstrackerResponse && !!action.submitTowerInspStatus.opstrackerResponse.meta_universalid ? action.submitTowerInspStatus.opstrackerResponse.meta_universalid : ''


        await fetchDraftGridDetails(vendorId, loginId, this.props.selectedTOWER.PM_LIST_ID, '', false, true)
        this.props.notiref.addNotification({
          title: 'success',
          position: "br",
          level: 'success',
          message: "Inspection completion Succesful"
        })
        if (this.state.filesData.length > 0) {

          await this.props.uploadFilesGO95(vendorId, loginId, opsUnid, filesPostRequest).then(async action => {
            await fetchTowerInspItems(vendorId, loginId, submarket, pmListItemId, unid, pmListId, pmTypeId).then(async action => {
              if (action.type == 'FETCH_TOWERINSP_SUCCESS' && action.inspData && action.inspData.getTowerInspItems && action.inspData.getTowerInspItems.output && action.inspData.getTowerInspItems.output.towerinspectionsRefData.length > 0) {
                let pdfInput = {
                  ...action.inspData.getTowerInspItems, siteInfo: {
                    vendorId: this.props.vendorId + "",
                    vendorName: this.props.user.get("vendor_name")
                  }
                }
                await this.props.generateInspPDF(vendorId, loginId, pmListItemId, pdfInput, 'TOWER').then(action => {
                  this.setState({ pageLoading: false })
                  this.props.handleHideModalTOWER()
                  if (action.type === 'GENERATE_PDF_SUCCESS') {
                  }
                }).catch((error) => {

                  if (error) {
                    this.props.notiref.addNotification({
                      title: 'error',
                      position: "br",
                      level: 'error',
                      message: "Failed to generate PDF"
                    })
                  }
                })
              }
            })


            if (action.type === 'UPLOAD_FILES_SUCCESS') {

              await fetchDraftGridDetails(vendorId, loginId, this.props.selectedTOWER.PM_LIST_ID, '', false, true)
              this.props.notiref.addNotification({
                title: 'success',
                position: "br",
                level: 'success',
                message: "Attachments uploaded Succesfully"
              })

            }

          }).catch((error) => {

            if (error) {
              this.props.notiref.addNotification({
                title: 'error',
                position: "br",
                level: 'error',
                message: "Attachments upload failed"
              })
            }
          })
        }

      }
    }).catch((error) => {

      if (error) {
        this.props.notiref.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: "Something went wrong please try again later"
        })
      }
    })
  }
  oncellValueChanged = (e) => {
    // const model = this.gridOptions.api.getFilterModel()
    const inspectionItems = this.state.inspectionItems.map(val => {
      if (e.ATTRIBUTE_NAME == val.ATTRIBUTE_NAME && e.ATTRIBUTE_CATEGORY == val.ATTRIBUTE_CATEGORY) {
        return {
          ...val,
          ICOMMENTS: e.ICOMMENTS,
          PHOTO: e.PHOTO
        }
      } else {
        return val
      }
    })
    this.setState({ inspectionItems }, () => {
      // this.retainSelection()
      // this.gridOptions.api.setFilterModel(model)
    })

  }
  handleFilterModelChange = (model)=>{
   this.setState({filterModel: model})
  }

  onAttachRemove(index) {
    this.aList = this.aList.remove(index)
    if (this.aList.size < 1) {
      this.setState({ fileSizeError: false })
    }
    if (this.aList.size > 0) {
      let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
      if (totalFileSize > 45000000) {
        this.setState({ fileSizeError: true })
      }
      if (totalFileSize < 45000000) {
        this.setState({ fileSizeError: false })
      }
    }

    this.setState({
      filesData: this.state.filesData.filter((_, i) => i !== index)
    })
    this.forceUpdate()
  }
  handleCheckBoxChange = (currDev, e) => {


    var minorMaintnceItems = this.state.minorMaintnceItems.map(val => {
      if (val.ATTRIBUTE_NAME === currDev.ATTRIBUTE_NAME) {
        return {
          ...val,
          itemSelected: e.target.checked,

        }
      } else {
        return val
      }

    })
    this.setState({ minorMaintnceItems })

  }
  handleMinorQntyChnge = (currDev, e) => {
    var minorMaintnceItems = this.state.minorMaintnceItems.map(val => {
      if (val.ATTRIBUTE_NAME === currDev.ATTRIBUTE_NAME) {
        return {
          ...val,
          ATTRIBUTE_FIELDS: e.target.value,
          qtError: e.target.value > 0 && e.target.value <= 100 ? false : true,
          qtMsg: (e.target.value <= 0 || e.target.value > 100) && e.target.value.length > 0 ? 'Allowed Range is(1-100)' : e.target.value == '' ? 'Quantity cannot be empty for selected Item' : '',
          COST_QTY: e.target.value.length > 0 ? parseFloat(e.target.value) * parseFloat(val.ATTRIBUTE_VALUE) : 0
        }
      } else {
        return val
      }

    })
    this.setState({ minorMaintnceItems })
  }
  renderSections = (v) => {

    if (this.state.inspectionItems.filter(i => !!i.RATING && i.ATTRIBUTE_CATEGORY == v).length == this.state.inspectionItems.filter(i => i.ATTRIBUTE_CATEGORY == v).length) {
      return (
        <div className="col-md-3 row text-success" ><div className="col-md-3"><i className="fa fa-check" aria-hidden="true"></i></div><div className="col-md-9"><b>{v}</b></div></div>
      )
    } else {
      return (
        <div className="col-md-3 row" ><div className="col-md-3"></div><div className="col-md-9"><b>{v}</b></div></div>
      )
    }
  }
  handleViewSummary = () => {
    this.setState({ showSummary: !this.state.showSummary })
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
getRowId =(row) => {
    return row.ATTRIBUTE_NAME+";"+row.ATTRIBUTE_CATEGORY;
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
    let siteName = this.state.towerData ? this.state.towerData.SITE_NAME : '', vendorName = this.props.user.get("vendor_name") ? this.props.user.get("vendor_name") : '', date = this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].PM_ITEM_COMPLETED_DATE ? moment(this.state.towerAttributeData[0].PM_ITEM_COMPLETED_DATE.split(' ')[0]).format('MM/DD/YYYY') : ''
    this.pdfCode = (
      <div hidden={!this.state.exportToPDF}>
        <PDFExport
          fileName={`${siteName}` + "-TowerInspection-" + `${vendorName}` + "-" + `${date ? date.split('/')[2] : ''}` + ".pdf"}
          title={`${siteName}` + "-TowerInspection-" + `${vendorName}` + "-" + `${date ? date.split('/')[2] : ''}`}
          margin="1.5cm"
          ref={(r) => this.towerInspPdf = r}>

          <div >
            <div>
              <div style={{ width: '100%' }} className="container-fluid">

                <h4 className="h4 mb-3 text-center">Tower Info</h4>
                <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                  <tbody className="vzwtable text-left">
                    <tr>
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">Site ID</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                          {this.state.towerData ? this.state.towerData.SITE_ID : ''}</b></div>
                      </div></td>
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">Site Name</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge"> {this.state.towerData ? this.state.towerData.SITE_NAME : ''}</b></div>
                      </div></td>
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">Address</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerData ? this.state.towerData.SITE_ADDRESS : ''}</b></div>
                      </div></td>
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">Lat/Long</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerData ? this.state.towerData.SITE_LATITUDE + ' / ' + this.state.towerData.SITE_LONGITITUDE : ''}</b></div>
                      </div></td>
                    </tr>
                    <tr>
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">Tower type</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerData && this.state.towerData.EQUIPMENT_INFO && this.state.towerData.EQUIPMENT_INFO.length > 0 ? this.state.towerData.EQUIPMENT_INFO[0].towertype : ''}</b></div>
                      </div></td>
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">Inspection Date</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].PM_ITEM_COMPLETED_DATE ? moment(this.state.towerAttributeData[0].PM_ITEM_COMPLETED_DATE.split(' ')[0]).format('MM/DD/YYYY') : ''}</b></div>
                      </div></td>
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">Vendor Tech Name</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].INSP_COMPLETED_BY ? this.state.towerAttributeData[0].INSP_COMPLETED_BY : ''}</b></div>
                      </div></td>

                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">Comments</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].INSP_COMMENTS ? this.state.towerAttributeData[0].INSP_COMMENTS : ''}</b></div>
                      </div>
                      </td>


                    </tr>






                  </tbody>
                </table>

              </div>

              <div style={{ margin: 'auto', width: '100%' }} className="container-fluid">
                <h4 className="h4 mb-3 text-center">Tower Info</h4>
                <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                  <tbody className="vzwtable text-left">
                    <tr>
                      {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).slice(0, this.state.towerinspCmpltdBasic.length - 5).map(val => (
                        <td className="Form-group no-border"><div>
                          <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                          <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                            {val.ATTRIBUTE_VALUE}</b></div>
                        </div></td>
                      ))}


                    </tr>
                    <tr>
                      {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).slice(this.state.towerinspCmpltdBasic.length - 5, this.state.towerinspCmpltdBasic.length - 1).map(val => (
                        <td className="Form-group no-border"><div>
                          <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                          <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                            {val.ATTRIBUTE_VALUE}</b></div>
                        </div></td>
                      ))}


                    </tr>
                    <tr>
                      {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).slice(this.state.towerinspCmpltdBasic.length - 1, this.state.towerinspCmpltdBasic.length).map(val => (
                        <td className="Form-group no-border"><div>
                          <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                          <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                            {val.ATTRIBUTE_VALUE}</b></div>
                        </div></td>
                      ))}
                      <td className="Form-group no-border"></td>
                      <td className="Form-group no-border"></td>
                      <td className="Form-group no-border"></td>

                    </tr>







                  </tbody>
                </table>


                <br />


              </div>
              <div style={{ margin: 'auto', width: '100%' }} className="container-fluid row">
                <div className="col-md-6">
                  <h4 className="h4 mb-3">Safety Climb Info</h4>
                  <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                    <tbody className="vzwtable text-left">
                      <tr>
                        {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('4-')).map(val => (
                          <td className="Form-group no-border"><div>
                            <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                              {val.ATTRIBUTE_VALUE}</b></div>
                          </div></td>
                        ))}
                        <td className="Form-group no-border"></td>

                      </tr>


                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h4 className="h4 mb-3">Tower Inspection</h4>
                  <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                    <tbody className="vzwtable text-left">
                      <tr>
                        {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('5-')).map(val => (
                          <td className="Form-group no-border"><div>
                            <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                              {val.ATTRIBUTE_VALUE}</b></div>
                          </div></td>
                        ))}
                        <td className="Form-group no-border"></td>
                        <td className="Form-group no-border"></td>

                      </tr>


                    </tbody>
                  </table>
                </div>



                <br />


              </div>

              <div className="container-fluid row mt-3">
                {this.state.towerinspCmpltdMinor.length > 0 && <div style={{ "padding": "7pt 10px 10px 10px" }} className="container-fluid col-md-6">
                  <div ><h4 className="text-center">Minor Maintenance</h4></div>
                  <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                    <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                      <tr>

                        <th scope="col">Minor Maintenance Item</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Cost $</th>


                      </tr>
                    </thead>
                    <tbody>
                      {this.state.towerinspCmpltdMinor.map(i => (
                        <tr>

                          <td scope="col">{i.ATTRIBUTE_NAME}</td>
                          <td scope="col">{i.ATTRIBUTE_FIELDS}</td>
                          <td scope="col">{i.ATTRIBUTE_VALUE}</td>


                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}

                <div className="container-fluid col-md-6" style={{ "padding": "7pt 10px 0px 10px" }}>
                  <div ><h4>Site Severity Deficiency Matrix</h4></div>

                  <div >

                    <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center", "tableLayout": "fixed" }}>


                      <tbody className="vzwtable text-left">
                        <tr>

                          <td className="Form-group no-border text-center"><b>Pass</b></td>

                          <td className="Form-group no-border bg-success text-center"><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Pass")).length}</b></td>


                        </tr>
                        <tr>

                          <td className="Form-group no-border text-center"><b>Non-Impacting</b></td>

                          <td className="Form-group no-border text-center" style={{ "backgroundColor": "lightYellow" }}><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Observed non-impacting")).length}</b></td>


                        </tr>
                        <tr>

                          <td className="Form-group no-border text-center"><b>Potentially Impacting</b></td>

                          <td className="Form-group no-border bg-warning text-center" ><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Observed potentially impacting")).length}</b></td>


                        </tr>
                        <tr>

                          <td className="Form-group no-border text-center"><b>Impacting</b></td>

                          <td className="Form-group no-border bg-info text-center"><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Impacting")).length}</b></td>


                        </tr>
                        <tr>

                          <td className="Form-group no-border text-center"><b>Critical</b></td>

                          <td className="Form-group no-border bg-danger text-center"><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Critical")).length}</b></td>


                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                {this.state.towerinspCmpltdMinor.length == 0 && <div style={{ "padding": "7pt 10px 0px 10px" }} className="container-fluid col-md-6"></div>}
              </div>
              {this.state.towerinspCmpltdMinor.length > 0 && <div style={{ "padding": "7pt 10px 0px 10px" }} className="container-fluid text-center">
                <div ><h4>Inspection Items</h4></div>
                <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                  <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                    <tr>

                      <th scope="col">Assessment Item</th>
                      <th scope="col">Rating</th>
                      <th scope="col">Category</th>
                      <th scope="col">Photo (file name)</th>
                      <th scope="col">Comments</th>

                    </tr>
                  </thead>
                  <tbody>
                    {this.state.towerinspCmpltdInsp.map(i => (
                      <tr>

                        <td scope="col">{i.ATTRIBUTE_NAME}</td>
                        <td scope="col">{i.ATTRIBUTE_VALUE}</td>
                        <td scope="col">{i.ATTRIBUTE_SUBCATEGORY}</td>
                        <td scope="col">{i.ATTRIBUTE_FIELDS}</td>
                        <td scope="col">{i.ATTRIBUTE_COMMENTS}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}

              <div style={{ "padding": "7pt 10px 0px 10px" }}>
                <div className="mb-3 text-center"><h4>Attachments</h4></div>
                <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                  <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                    <tr>

                      <th scope="col">Category</th>
                      <th scope="col">Attachment Name</th>

                    </tr>
                  </thead>
                  <tbody>
                    {this.state.attachmentList.length > 0 && this.state.attachmentList.map(inval => (
                      <tr>
                        <td>{inval.category ? inval.category : ''}</td>
                        <td style={{ "cursor": "pointer", "color": "blue" }} onClick={this.downloadAttachments.bind(this, inval)}><b>{inval.file_name ? inval.file_name : ''}</b></td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </PDFExport>
      </div>
    )
    const modfdGridDetails = this.modifyGridDetails()
    const modfdGridDetailsCmp = this.modifyGridDetailsCmp()
    const modfdGridDetailsSummary = this.modifyGridDetailsSummary()
    let columnsCmp = [

      {
        headerName: "Assessment Item", field: "ATTRIBUTE_NAME", flex: 1
      },
      {
        headerName: "Rating",  field: "RATING", flex: 1
      },

      {
        headerName: "Category",  field: "ATTRIBUTE_CATEGORY", flex: 1
      },
      {
        headerName: "Photo (file name)", field: "PHOTO", flex: 1, editable: true,
        valueGetter: function (params) {
          return params
        },
        valueSetter: function (value, params) {
          if (params.PHOTO !== value) {
            params.PHOTO = value
            return params
          } else {
            return params
          }
        }
      },
      {
        headerName: "Comments", field: "ICOMMENTS", flex: 1, editable: true,
        valueGetter: function (params) {
          return params
        },
        valueSetter: function (value, params) {
          if (params.ICOMMENTS !== value) {
            params.ICOMMENTS = value
            return params
          } else {
            return params
          }
        }
      }

    ]
    let columns = [
      // {
      //   headerName: "Select",  checkboxSelection: true, headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true, width: 80
      // },
      {
        headerName: "Assessment Item", field: "ATTRIBUTE_NAME", flex: 1
      },
      {
        headerName: "Rating", field: "RATING", flex: 1
      },

      {
        headerName: "Category",  field: "ATTRIBUTE_CATEGORY", flex: 1
      },
      {
        headerName: "Photo (file name)", description: "Please add photo file name in the field and attach the photos below", field: "PHOTO", flex: 1, editable: true,
        valueGetter: function (params) {
          return params
        },
        valueSetter: function (value, params) {
          if (params.PHOTO !== value) {
            params.PHOTO = value
            return params
          } else {
            return params
          }
        }
      },
      {
        headerName: "Comments", field: "ICOMMENTS", flex: 1, editable: true,
        valueGetter: function (params) {
          return params
        },
        valueSetter: function (value, params) {
          if (params.ICOMMENTS !== value) {
            params.ICOMMENTS = value
            return params
          } else {
            return params
          }
        }
      }

    ]
    if (this.props.selectedTOWER.PM_ITEM_STATUS === 'PENDING') {
      return (<div className="container-fluid">
        {this.state.pageLoading ? this.renderLoading() : <div>
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
                    <SiteInformation notifref={this.props.notiref}
                      siteUnid={this.state.towerData && this.state.towerData.SITE_UNID} />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            <br />
          </div>

          <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
            <thead className="vzwtable text-left">
              <tr colSpan={"4"}>
                <td className="Form-group no-border" colSpan="4"><b>Inspection Date<span className="text-danger">*</span></b></td>
                <td className="Form-group no-border" colSpan="4"><b>Vendor Tech Name <span className="text-danger">*</span></b></td>

                <td className="Form-group no-border" colSpan="4"><b>Comments</b></td>



              </tr>


            </thead>

            <tbody className="vzwtable text-left">

              <tr colSpan={"4"}>
                <td className="Form-group no-border" colSpan="4">
                  <SingleDatePicker orientation={'vertical'} verticalHeight={380}
                    numberOfMonths={1} showDefaultInputIcon={false}
                    onDateChange={inspectionDate => this.setState({ inspectionDate })}
                    onFocusChange={({ focused }) =>
                      this.setState({ inspectionDateFocused: focused })
                    }
                    focused={this.state.inspectionDateFocused} isOutsideRange={() => false}
                    date={this.state.inspectionDate} block
                  />
                </td>
                <td className="Form-group no-border" colSpan="4"><b><input type={"text"} name="Vendor Tech Name" style={{ width: '100%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }} onChange={(e) => {
                  this.setState({ techName: e.target.value })
                }} defaultValue={this.state.techName} /></b></td>

                <td className="Form-group no-border" colSpan="4"><b><textarea cols={30} rows={4} name="comments" style={{ height: '100%', width: '100%', border: "1px solid lightgray" }} onChange={(e) => {
                  this.setState({ commentsVendor: e.target.value })
                }} defaultValue={this.state.commentsVendor} /></b></td>



              </tr>
            </tbody>
          </table>
          <div style={{ margin: 'auto', width: '100%' }} className="container-fluid">
            <h4 className="title-div-style-tower">Site Info</h4>
            <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
              <tbody className="vzwtable text-left">
                <tr>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Verizon Site Name</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge"> {this.state.towerData ? this.state.towerData.SITE_NAME : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Verizon Site ID</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                      {this.state.towerData ? this.state.towerData.SITE_ID : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Tower Owner</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerData && this.state.towerData.EQUIPMENT_INFO && this.state.towerData.EQUIPMENT_INFO.length > 0 ? this.state.towerData.EQUIPMENT_INFO[0].tower_managed_by : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Site Address</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerData ? this.state.towerData.SITE_ADDRESS : ''}</b></div>
                  </div></td>

                </tr>
                <tr>

                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Lat/Long</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerData ? this.state.towerData.SITE_LATITUDE + ' / ' + this.state.towerData.SITE_LONGITITUDE : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Tower Owner Site #</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                      {this.state.towerData ? this.state.towerData.PS_LOCATION_ID : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Inspecting Company</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                      {this.props.vendorCompany ? this.props.vendorCompany : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">ASR #</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                    </b></div>
                  </div></td>




                </tr>






              </tbody>
            </table>


            <br />

          </div>
          <div style={{ margin: 'auto', width: '100%' }} className="container-fluid">

            <div className="row container-fluid">

              <div className="col-md-6">
                <h4 className="mb-4 title-div-style-tower">Tower Info</h4>
                <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                  <tbody className="vzwtable text-left">
                    {this.state.modelAttributes && this.state.modelAttributes.filter(val => !!val.PM_TMPLT_ATTR_FLD_GROUP && val.PM_TMPLT_ATTR_FLD_GROUP.includes('3-')).sort((a, b) => {
                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      } else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      } else {
                        return 0
                      }
                    }).map(inval => (
                      <tr>
                        <td className="Form-group no-border">{inval.PM_TMPLT_ATTR_NAME}<span className="text-danger">*</span></td>
                        <td className="Form-group no-border" >{inval.PM_TMPLT_ATTR_FLD_TYPE == 'TEXT' ? <input type={"text"} name={inval.PM_TMPLT_ATTR_NAME} onChange={this.handleInpChge.bind(this, inval)} style={{ height: '100%', width: '100%' }} /> : inval.PM_TMPLT_ATTR_FLD_TYPE == 'DROPDOWN' || inval.PM_TMPLT_ATTR_FLD_TYPE == 'MULTIDROPDOWN' ? <Select
                          className="basic-single text-center title-div-style-tower"
                          classNamePrefix="select"

                          value={inval.currVal}

                          isLoading={false}
                          clearable={false}
                          isRtl={false}
                          isSearchable={false}

                          options={inval.PM_TMPLT_ATTR_FLD_VALUE ? inval.PM_TMPLT_ATTR_FLD_VALUE.split(',').map(i => ({ label: i, value: i })) : []}
                          onChange={this.handleChangeDrpdownModel.bind(this, inval)}
                        /> : ''}</td>

                      </tr>
                    ))}

                  </tbody></table>
              </div>

              <div className="col-md-6">
                <h4 className="mb-4 title-div-style-tower">Safety Climb Info</h4>
                <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                  <tbody className="vzwtable text-left">
                    {this.state.modelAttributes && this.state.modelAttributes.filter(val => !!val.PM_TMPLT_ATTR_FLD_GROUP && val.PM_TMPLT_ATTR_FLD_GROUP.includes('4-')).sort((a, b) => {
                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      } else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      } else {
                        return 0
                      }
                    }).map(inval => (
                      <tr>
                        <td className="Form-group no-border">{inval.PM_TMPLT_ATTR_NAME}<span className="text-danger">*</span></td>
                        <td className="Form-group no-border" >{inval.PM_TMPLT_ATTR_FLD_TYPE == 'TEXT' ? <input type={"text"} name={inval.PM_TMPLT_ATTR_NAME} onChange={this.handleInpChge.bind(this, inval)} style={{ height: '100%', width: '100%' }} /> : inval.PM_TMPLT_ATTR_FLD_TYPE == 'DROPDOWN' || inval.PM_TMPLT_ATTR_FLD_TYPE == 'MULTIDROPDOWN' ? <Select
                          className="basic-single text-center title-div-style-tower"
                          classNamePrefix="select"

                          value={inval.currVal}

                          isLoading={false}
                          clearable={false}
                          isRtl={false}
                          isSearchable={false}

                          options={inval.PM_TMPLT_ATTR_FLD_VALUE ? inval.PM_TMPLT_ATTR_FLD_VALUE.split(',').map(i => ({ label: i, value: i })) : []}
                          onChange={this.handleChangeDrpdownModel.bind(this, inval)}
                        /> : ''}</td>

                      </tr>
                    ))}

                  </tbody></table>
                <h4 className="mb-4 title-div-style-tower">Tower Inspection</h4>
                <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                  <tbody className="vzwtable text-left">
                    {this.state.modelAttributes && this.state.modelAttributes.filter(val => !!val.PM_TMPLT_ATTR_FLD_GROUP && val.PM_TMPLT_ATTR_FLD_GROUP.includes('5-')).sort((a, b) => {
                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      } else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      } else {
                        return 0
                      }
                    }).map(inval => (
                      <tr>
                        <td className="Form-group no-border">{inval.PM_TMPLT_ATTR_NAME}<span className="text-danger">*</span></td>
                        <td className="Form-group no-border" >{inval.PM_TMPLT_ATTR_FLD_TYPE == 'TEXT' ? <input type={"text"} name={inval.PM_TMPLT_ATTR_NAME} onChange={this.handleInpChge.bind(this, inval)} style={{ height: '100%', width: '100%' }} /> : inval.PM_TMPLT_ATTR_FLD_TYPE == 'DROPDOWN' || inval.PM_TMPLT_ATTR_FLD_TYPE == 'MULTIDROPDOWN' ? <Select
                          className="basic-single text-center title-div-style-tower"
                          classNamePrefix="select"

                          value={inval.currVal}

                          isLoading={false}
                          clearable={false}
                          isRtl={false}
                          isSearchable={false}

                          options={inval.PM_TMPLT_ATTR_FLD_VALUE ? inval.PM_TMPLT_ATTR_FLD_VALUE.split(',').map(i => ({ label: i, value: i })) : []}
                          onChange={this.handleChangeDrpdownModel.bind(this, inval)}
                        /> : ''}</td>

                      </tr>
                    ))}

                  </tbody></table>
              </div>

            </div>

          </div>
          <div className="container row pb-4">
            <div className="col-md-1"></div>
            <div className="col-md-4">

            </div>
            <div className="col-md-3">

            </div>
            {<div className="col-md-4 text-right" style={{ "cursor": "pointer", "color": "blue" }} onClick={this.handleViewSummary.bind(this)}><b>{this.state.showSummary ? <span>Hide Inspection Deficiency Summary <i className="fas fa-chevron-up" style={{ "color": "#B6B6B6" }}></i></span> : <span>View Inspection Deficiency Summary <i className="fas fa-chevron-down" style={{ "color": "#B6B6B6" }}></i></span>}</b></div>}


          </div>
          {this.state.showSummary && <div style={{ "padding": "7pt 10px 0px 10px" }} className="container-fluid mb-3">
            <div className="container mb-5">
              <h4 className="text-center mb-4 title-div-style-tower">Site Severity Deficiency Matrix</h4>
              <div className="row">
                <div className="col-md-3"></div>
                <div className="col-md-6">
                  <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center", "tableLayout": "fixed", "width": "100%" }}>


                    <tbody className="vzwtable text-left">
                      <tr>

                        <td className="Form-group no-border text-center"><b>Pass</b></td>

                        <td className="Form-group no-border bg-success text-center"><b>{this.state.inspectionItems.filter(val => Number(val.RATING == "Pass")).length}</b></td>


                      </tr>
                      <tr>

                        <td className="Form-group no-border text-center"><b>Non-Impacting</b></td>

                        <td className="Form-group no-border text-center" style={{ "backgroundColor": "lightYellow" }}><b>{this.state.inspectionItems.filter(val => Number(val.RATING == "Observed non-impacting")).length}</b></td>


                      </tr>
                      <tr>

                        <td className="Form-group no-border text-center"><b>Potentially Impacting</b></td>

                        <td className="Form-group no-border bg-warning text-center" ><b>{this.state.inspectionItems.filter(val => Number(val.RATING == "Observed potentially impacting")).length}</b></td>


                      </tr>
                      <tr>

                        <td className="Form-group no-border text-center"><b>Impacting</b></td>

                        <td className="Form-group no-border bg-info text-center"><b>{this.state.inspectionItems.filter(val => Number(val.RATING == "Impacting")).length}</b></td>


                      </tr>
                      <tr>

                        <td className="Form-group no-border text-center"><b>Critical</b></td>

                        <td className="Form-group no-border bg-danger text-center"><b>{this.state.inspectionItems.filter(val => Number(val.RATING == "Critical")).length}</b></td>


                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-3"></div>
              </div>
            </div>
            <div ><h4 className="text-center mb-4  title-div-style-tower">Inspection Items Summary</h4></div>
            <div style={{ margin: 'auto', width: '100%' }} className="container">

              <DataGrid
                    apiRef={this.apiRef}
                    checkboxSelection={false}
                    rows={!modfdGridDetailsSummary ? [] : modfdGridDetailsSummary}
                    columns={columnsCmp}
                    // onRowClick={(params)=>this.onRowClicked(params.row)}
                    hideFooterSelectedRowCount
                    rowHeight={30}
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
                      }
                  }}
                  />

            </div>
          </div>}
          <div className="row mb-4 ">

            <h4 className="container-fluid col-md-4  title-div-style" style={{ "height": "5vh" }}>Inspection Items</h4>


            <div className="col-md-6 row">
              <div className="col-md-3"><b>Select a Rating</b></div>
              <div className="col-md-9">
                <Select
                  className="basic-single text-center title-div-style-tower"
                  classNamePrefix="select"

                  value={this.state.currDrpdwnVal}
                  disabled={this.state.disableButton}
                  isLoading={false}
                  clearable={false}
                  isRtl={false}
                  isSearchable={false}

                  options={this.state.drpdwnoptions}
                  onChange={this.handleChangeDrpdown.bind(this)}
                />
              </div>
            </div>
            <div className="col-md-2"><button className="btn btn-danger btn button-class" disabled={this.state.disableButton || issoCondition}
              onClick={this.onApply.bind(this)}>Apply</button></div>
          </div>
          <div style={{ margin: 'auto', width: '100%' }} className="container">

            {this.state.uniqueGrps.length > 0 && <div className="container mb-3" style={{ "marginLeft": "3.5vw" }}><div className=" row pb-3">{
              this.state.uniqueGrps.slice(0, this.state.uniqueGrps.length - 4).map(v => this.renderSections(v))
            }</div>
              <div className="row">{
                this.state.uniqueGrps.slice(this.state.uniqueGrps.length - 4, this.state.uniqueGrps.length).map(v => this.renderSections(v))
              }</div></div>}
            {!this.state.inspectionItems.every(i => !!i.RATING) && <div className="text-danger text-center mb-4 mt-2"><b>Please review assessment items in all 8 categories available above to assign a rating per item</b></div>}
            <div className="text-danger text-center mb-4 mt-2"><b>
              Please add photo (file name )and comments for the items if the rating is not Passed or NA </b>
            </div>
             <DataGrid
                    apiRef={this.apiRef}
                    checkboxSelection
                    rows={!modfdGridDetails ? [] : modfdGridDetails}
                    columns={columns}
                    hideFooterSelectedRowCount
                    rowHeight={30}
                    columnHeaderHeight={35}
                    getRowId={this.getRowId}
                    filterModel={this.state.filterModel || {items: []}}
                    onFilterModelChange={this.handleFilterModelChange}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10}
                      }
                    }}
                    onCellEditStop={
                      (params, event) => {
                          this.oncellValueChanged(params.row)
                      }
                  }
                  disableRowSelectionOnClick={true}
                  onRowSelectionModelChange={ (params) => this.onSelectionChanged(params) }
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
                      }
                  }}
                  />

          </div>

          <div className="mb-5 mt-3">
            <Accordion
              style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
              TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                Minor Maintenance
              </AccordionSummary>
              <AccordionDetails>
                <div>

                  <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                    <thead className="vzwtable text-left" style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                      <tr>

                        <th className="Form-group no-border">Select</th>
                        <th className="Form-group no-border">Minor Maintenance Item</th>
                        <th className="Form-group no-border text-center">Quantity</th>
                        <th className="Form-group no-border text-center">Cost $</th>



                      </tr>
                    </thead>
                    <tbody className="vzwtable text-left">
                      {this.state.minorMaintnceItems.map(val => (
                        <tr>

                          <td className="Form-group no-border">
                            <Checkbox
                              onChange={this.handleCheckBoxChange.bind(this, val)}
                              className={'selection-box'}
                              color="default"
                              name=""
                              value=""
                              checked={val.itemSelected}
                            />
                          </td>
                          <td className="Form-group no-border">{val.ATTRIBUTE_NAME ? val.ATTRIBUTE_NAME : ''}</td>
                          <td className="Form-group no-border text-center"> <div>{val.itemSelected && <input type={"Number"} name={val.ATTRIBUTE_NAME} style={{ height: '100%', width: '50%' }} onChange={this.handleMinorQntyChnge.bind(this, val)} defaultValue={val.ATTRIBUTE_FIELDS} />}
                            {val.qtError && val.itemSelected && <div className="text-danger text-center"><b>{val.qtMsg}</b></div>}
                          </div></td>
                          <td className="Form-group no-border text-center">{val.ATTRIBUTE_VALUE ? val.ATTRIBUTE_VALUE : ''}</td>

                        </tr>
                      ))}
                      {this.state.minorMaintnceItems.filter(i => i.itemSelected).length > 0 && <tr>

                        <td className="Form-group no-border"></td>
                        <td className="Form-group no-border"></td>
                        <td className="Form-group no-border"><b>Total Cost $</b></td>
                        <td className="Form-group no-border"><b>{this.state.minorMaintnceItems.filter(i => i.itemSelected).map(v => v.COST_QTY).reduce(function (total, amount) {
                          return total + amount
                        })}</b></td>
                      </tr>}
                    </tbody>
                  </table>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
          <div className="mb-5 mt-3">
            <Accordion
              style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
              TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                Tower Foundation Measurements
              </AccordionSummary>
              <AccordionDetails>
                <div>
                  <div className="mb-4 text-center" style={{ height: "52vh" }}>
                    <img src={towerFoundation} style={{ height: '100%', width: "40%" }} aria-hidden="true" data-toggle="tooltip" title="Tower Foundation Measurements"
                    ></img>
                  </div>
                  <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                    <thead className="vzwtable text-left" style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                      <tr>

                        <th className="Form-group no-border text-center">Required Foundation Measurements in inches/Feet</th>
                        <th className="Form-group no-border text-center">Leg A</th>
                        <th className="Form-group no-border text-center">Leg B</th>
                        <th className="Form-group no-border text-center">Leg C</th>
                        <th className="Form-group no-border text-center">Leg D</th>



                      </tr>

                    </thead>
                    <tbody className="vzwtable text-left">
                      {this.state.towerinspFndMeasure.length > 0 && this.state.towerinspFndMeasure.map(i =>
                      (<tr>



                        <td className="Form-group text-center">{i.ATTRIBUTE_NAME}</td>
                        {/* <td className="Form-group no-border text-center"> <div>{<input type={"Number"} name={val.ATTRIBUTE_NAME} style={{ height: '100%', width: '80%' }} onChange={this.handleMinorQntyChnge.bind(this, val)} defaultValue={val.ATTRIBUTE_FIELDS} />}
                            
                          </div></td> */}
                        <td className="Form-group text-center">
                          <input type={"Number"} name={`legA`} style={{ height: '100%', width: '80%' }} defaultValue='' onChange={this.handleFndChange.bind(this, i)} />
                        </td>
                        <td className="Form-group text-center">
                          <input type={"Number"} name={`legB`} style={{ height: '100%', width: '80%' }} defaultValue='' onChange={this.handleFndChange.bind(this, i)} />
                        </td>
                        <td className="Form-group text-center">
                          <input type={"Number"} name={`legC`} style={{ height: '100%', width: '80%' }} defaultValue='' onChange={this.handleFndChange.bind(this, i)} />
                        </td>
                        <td className="Form-group text-center">
                          <input type={"Number"} name={`legD`} style={{ height: '100%', width: '80%' }} defaultValue='' onChange={this.handleFndChange.bind(this, i)} />
                        </td>


                      </tr>)
                      )}


                    </tbody>
                  </table>
                  <div className="container">

                    <div>
                      <h4>Notes:</h4>
                      <ul>
                        <li><span>1. </span><span>Single support or northern most leg (301 - 60 degrees)</span></li>
                        <li><span>2. </span><span>South eastern leg (61 - 180 degrees)</span></li>
                        <li><span>3. </span><span>South wastern leg (181 - 300 degrees)</span></li>
                        <li><span>4. </span><span>Southeastern leg (61 - 180 degrees)</span></li>
                        <li><span>6. </span><span>Fourth support leg</span></li>
                        <li><span>6. </span><span>Impacting ratings must be noted on site information summary</span></li>
                        <li><span>7. </span><span>Measurements exceeding tolerance must be noted on site information summary</span></li>

                      </ul>
                    </div>

                  </div>
                  <div className="row">
                    <div className="col-md-8" style={{ "marginTop": "15vh" }}>
                      <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                        <thead className="vzwtable text-left" style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                          <tr>

                            <th className="Form-group no-border text-center"></th>
                            <th className="Form-group no-border text-center"></th>
                            <th className="Form-group no-border text-center" colSpan="2">Appurtenance</th>





                          </tr>
                          <tr>

                            <th className="Form-group no-border text-center">Tower Inventory</th>
                            <th className="Form-group no-border text-center">Height(Feet) (AGL)</th>
                            <th className="Form-group no-border text-center">Owner</th>
                            <th className="Form-group no-border text-center">Type</th>




                          </tr>

                        </thead>
                        <tbody className="vzwtable text-left">
                          {this.state.towerinspInventory.length > 0 && this.state.towerinspInventory.map(i => (<tr>



                            <td className="Form-group text-center">{i.ATTRIBUTE_NAME}</td>
                            {/* <td className="Form-group no-border text-center"> <div>{<input type={"Number"} name={val.ATTRIBUTE_NAME} style={{ height: '100%', width: '80%' }} onChange={this.handleMinorQntyChnge.bind(this, val)} defaultValue={val.ATTRIBUTE_FIELDS} />}
                            
                          </div></td> */}
                            <td className="Form-group text-center">
                              <input type={"text"} name={`height`} style={{ height: '100%', width: '80%' }} defaultValue='' onChange={this.handleFndChangeInv.bind(this, i)} />
                            </td>
                            <td className="Form-group text-center">
                              <input type={"text"} name={`owner`} style={{ height: '100%', width: '80%' }} defaultValue='' onChange={this.handleFndChangeInv.bind(this, i)} />
                            </td>
                            <td className="Form-group text-center">
                              <input type={"text"} name={`type`} style={{ height: '100%', width: '80%' }} defaultValue='' onChange={this.handleFndChangeInv.bind(this, i)} />
                            </td>



                          </tr>)
                          )}






                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-4">
                      <img src={towerInventory} style={{ height: '100%', width: "100%" }} aria-hidden="true" data-toggle="tooltip" title="Tower Foundation Measurements"
                      ></img>
                    </div>

                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>

          <div className="container row">
            <div className="col-md-1"></div>
            <div className="col-md-3">
              <Dropzone onDrop={this.onFileDrop.bind(this)}>{/* <div style={{ 'textAlign': 'center', 'paddingTop': '10%' }}><b><span className="text-danger" style={{ "font-size": "2vh" }}>*</span></b>Drop files here, or click to select files to upload</div> */}
                {({ getRootProps, getInputProps }) => (
                  <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                    </div>
                  </section>
                )}
              </Dropzone>
            </div>
            <div className="col-md-5">
              <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />
            </div>
            <div className="col-md-3">
              {this.state.fileSizeError && (<div colSpan="6" ><MessageBox messages={List(["The size of attachments should be less than 45 MB!"])} /></div>)}
            </div>


          </div>
          {<div className="mt-3 container-fluid">

            <div className="text_right text-info float-right">

              <b>Please ensure all assessment items have been assigned a rating</b>
            </div>
          </div>}
          <div className="container mt-3 mb-3">

            <button type="submit"
              className="Button--secondary float-right mt-2"
              disabled={this.checkDisable() || issoCondition}
              style={{ marginRight: "5px" }}
              onClick={this.onSubmit}>
              Complete Inspection
            </button>
          </div>
        </div>}

      </div>)

    } else if (this.props.selectedTOWER.PM_ITEM_STATUS === 'COMPLETED' || this.props.selectedTOWER.PM_ITEM_STATUS === 'ACCEPTED' || this.props.selectedTOWER.PM_ITEM_STATUS === 'RECEIVED' || this.props.selectedTOWER.PM_ITEM_STATUS === 'INVOICED' || this.props.selectedTOWER.PM_ITEM_STATUS === 'CLOSED') {

      return (<div className="container-fluid">
        {this.state.pageLoading ? this.renderLoading() : <div>
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
                    <SiteInformation notifref={this.props.notiref}
                      siteUnid={this.state.towerData && this.state.towerData.SITE_UNID} />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            <br />
          </div>

          <div style={{ margin: 'auto', width: '100%' }} className="container-fluid mb-3">
            <h4 className="h4 mb-3 title-div-style-tower">Site Info
              {/* <img className="float-right" src={pdf} style={{ height: '27px', width: "30px", cursor: "pointer" }} aria-hidden="true" data-toggle="tooltip" title="Export To PDF"
                onClick={this.exportToPDFClick.bind(this)}></img> */}
            </h4>
            <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
              <tbody className="vzwtable text-left">
                <tr>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Verizon Site Name</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge"> {this.state.towerData ? this.state.towerData.SITE_NAME : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Verizon Site ID</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                      {this.state.towerData ? this.state.towerData.SITE_ID : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Tower Owner</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.state.towerData && this.state.towerData.EQUIPMENT_INFO.length > 0 ? this.state.towerData.EQUIPMENT_INFO[0].tower_managed_by : ''}</b></div>
                  </div></td>

                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Site Address</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerData ? this.state.towerData.SITE_ADDRESS : ''}</b></div>
                  </div></td>

                </tr>
                <tr>

                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Lat/Long</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerData ? this.state.towerData.SITE_LATITUDE + ' / ' + this.state.towerData.SITE_LONGITITUDE : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Tower Owner Site #</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                      {this.state.towerData ? this.state.towerData.PS_LOCATION_ID : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Inspecting Company</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                      {this.props.vendorCompany ? this.props.vendorCompany : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">ASR #</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                    </b></div>
                  </div></td>




                </tr>
                <tr>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Tower type</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.state.towerData && this.state.towerData.EQUIPMENT_INFO.length > 0 ? this.state.towerData.EQUIPMENT_INFO[0].towertype : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Inspection Date</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].PM_ITEM_COMPLETED_DATE ? moment(this.state.towerAttributeData[0].PM_ITEM_COMPLETED_DATE.split(' ')[0]).format('MM/DD/YYYY') : ''}</b></div>
                  </div></td>
                  <td className="Form-group no-border"><div>
                    <div ><b className="fontLarge">Vendor Tech Name</b></div>
                    <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].INSP_COMPLETED_BY ? this.state.towerAttributeData[0].INSP_COMPLETED_BY : ''}</b></div>
                  </div></td>

                  <td className="Form-group no-border"></td>


                </tr>






              </tbody>
            </table>


            <br />
            <div style={{ margin: 'auto', width: '100%' }} className="container-fluid fontLarge mb-3">
              <div className="fontLarge mb-3"><b>Comments</b></div>
              <div style={{ "boxShadow": "3px 3px 5px 6px #ccc", "backgroundColor": "#FAFAFA", "height": "6vh", "color": "#B6B6B6", "lineHeight": "6vh" }}><b style={{ "color": "B6B6B6" }}>{this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].INSP_COMMENTS ? this.state.towerAttributeData[0].INSP_COMMENTS : ''}</b></div>
            </div>

          </div>

          <div style={{ margin: 'auto', width: '100%' }} className="container-fluid">
            <h4 className="h4 mb-3 title-div-style-tower">Tower Info</h4>
            <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
              <tbody className="vzwtable text-left">
                <tr>
                  {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).slice(0, this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).length - 5).map(val => (
                    <td className="Form-group no-border"><div>
                      <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                      <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                        {val.ATTRIBUTE_VALUE}</b></div>
                    </div></td>
                  ))}


                </tr>
                <tr>
                  {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).slice(this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).length - 5, this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).length - 1).map(val => (
                    <td className="Form-group no-border"><div>
                      <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                      <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                        {val.ATTRIBUTE_VALUE}</b></div>
                    </div></td>
                  ))}


                </tr>
                <tr>
                  {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).slice(this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).length - 1, this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('3-')).length).map(val => (
                    <td className="Form-group no-border"><div>
                      <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                      <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                        {val.ATTRIBUTE_VALUE}</b></div>
                    </div></td>
                  ))}
                  <td className="Form-group no-border"></td>
                  <td className="Form-group no-border"></td>
                  <td className="Form-group no-border"></td>

                </tr>







              </tbody>
            </table>


            <br />


          </div>
          <div style={{ margin: 'auto', width: '100%' }} className="container-fluid row">
            <div className="container-fluid col-md-6">
              <div ><h4 className="title-div-style-tower">Safety Climb Info</h4></div>

              <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                <tbody className="vzwtable text-left">
                  <tr>
                    {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('4-')).map(val => (
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                          {val.ATTRIBUTE_VALUE}</b></div>
                      </div></td>
                    ))}
                    <td className="Form-group no-border"></td>

                  </tr>


                </tbody>
              </table>
            </div>
            <div className="container-fluid col-md-6">
              <div ><h4 className="title-div-style-tower">Tower Inspection</h4></div>

              <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                <tbody className="vzwtable text-left">
                  <tr>
                    {this.state.towerinspCmpltdBasic.filter(i => i.ATTRIBUTE_SUBCATEGORY && i.ATTRIBUTE_SUBCATEGORY.includes('5-')).map(val => (
                      <td className="Form-group no-border"><div>
                        <div ><b className="fontLarge">{val.ATTRIBUTE_NAME}</b></div>
                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                          {val.ATTRIBUTE_VALUE}</b></div>
                      </div></td>
                    ))}
                    <td className="Form-group no-border"></td>
                    <td className="Form-group no-border"></td>

                  </tr>


                </tbody>
              </table>
            </div>



            <br />


          </div>
          {<div style={{ "padding": "7pt 10px 0px 10px" }} className="container-fluid">
            <div ><h4 className="title-div-style-tower">Inspection Items</h4></div>
            <div style={{ margin: 'auto', width: '100%' }} className="container">

              <DataGrid
                    apiRef={this.apiRef}
                    checkboxSelection={false}
                    rows={!modfdGridDetailsCmp ? [] : modfdGridDetailsCmp}
                    columns={columnsCmp}
                    hideFooterSelectedRowCount
                    rowHeight={30}
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
                      }
                  }}
                  />

            </div>
          </div>}
          <div className="container-fluid row mt-3">
            {this.state.towerinspCmpltdMinor.length > 0 && <div style={{ "padding": "7pt 10px 0px 10px" }} className="container-fluid col-md-6">
              <div ><h4 className="title-div-style-tower">Minor Maintenance</h4></div>
              <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                  <tr>

                    <th scope="col">Minor Maintenance Item</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Cost $</th>


                  </tr>
                </thead>
                <tbody>
                  {this.state.towerinspCmpltdMinor.map(i => (
                    <tr>

                      <td scope="col">{i.ATTRIBUTE_NAME}</td>
                      <td scope="col">{i.ATTRIBUTE_FIELDS}</td>
                      <td scope="col">{i.ATTRIBUTE_VALUE}</td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}

            <div className="container-fluid col-md-6" style={{ "padding": "7pt 10px 0px 10px" }}>
              <div ><h4 className="title-div-style-tower">Site Severity Deficiency Matrix</h4></div>

              <div >

                <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center", "tableLayout": "fixed" }}>


                  <tbody className="vzwtable text-left">
                    <tr>

                      <td className="Form-group no-border text-center"><b>Pass</b></td>

                      <td className="Form-group no-border bg-success text-center"><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Pass")).length}</b></td>


                    </tr>
                    <tr>

                      <td className="Form-group no-border text-center"><b>Non-Impacting</b></td>

                      <td className="Form-group no-border text-center" style={{ "backgroundColor": "lightYellow" }}><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Observed non-impacting")).length}</b></td>


                    </tr>
                    <tr>

                      <td className="Form-group no-border text-center"><b>Potentially Impacting</b></td>

                      <td className="Form-group no-border bg-warning text-center" ><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Observed potentially impacting")).length}</b></td>


                    </tr>
                    <tr>

                      <td className="Form-group no-border text-center"><b>Impacting</b></td>

                      <td className="Form-group no-border bg-info text-center"><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Impacting")).length}</b></td>


                    </tr>
                    <tr>

                      <td className="Form-group no-border text-center"><b>Critical</b></td>

                      <td className="Form-group no-border bg-danger text-center"><b>{this.state.towerinspCmpltdInsp.filter(val => Number(val.ATTRIBUTE_VALUE == "Critical")).length}</b></td>


                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {this.state.towerinspCmpltdMinor.length == 0 && <div style={{ "padding": "7pt 10px 0px 10px" }} className="container-fluid col-md-6"></div>}
          </div>
          <div>
            <div className="mb-3 title-div-style-tower"><h4>Tower Foundation Measurement</h4></div>
            <div className="row mb-4">
              <div className="col-md-7">
                <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "left" }}>
                  <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                    <tr>

                      <th scope="col">Required Foundation Measurements in inches/Feet</th>
                      <th scope="col">Leg A</th>
                      <th scope="col">Leg B</th>
                      <th scope="col">Leg C</th>
                      <th scope="col">Leg D</th>



                    </tr>

                  </thead>
                  <tbody >
                    {this.state.towerinspCmpldFoundation.length > 0 && this.state.towerinspCmpldFoundation.filter(v => v.ATTRIBUTE_SUBCATEGORY == "Required Foundation").map(i =>
                    (<tr>



                      <td scope="col">{i.ATTRIBUTE_NAME}</td>
                      {/* <td className="Form-group no-border text-center"> <div>{<input type={"Number"} name={val.ATTRIBUTE_NAME} style={{ height: '100%', width: '80%' }} onChange={this.handleMinorQntyChnge.bind(this, val)} defaultValue={val.ATTRIBUTE_FIELDS} />}
                            
                          </div></td> */}
                      {i.ATTRIBUTE_VALUE && i.ATTRIBUTE_VALUE.split('^').map(v => (<td scope="col">
                        {v}
                      </td>))}



                    </tr>)
                    )}


                  </tbody>
                </table>
              </div>
              <div className="mb-4 text-center col-md-5" style={{ height: "52vh" }}>
                <img src={towerFoundation} style={{ height: '100%', width: "80%" }} aria-hidden="true" data-toggle="tooltip" title="Tower Foundation Measurements"
                ></img>
              </div>

            </div>

            <div className="row">
              <div className="col-md-8" style={{ "marginTop": "15vh" }}>
                <table className="table  sortable" style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "left" }}>
                  <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                    <tr>

                      <th scope="col"></th>
                      <th scope="col"></th>
                      <th colSpan="2">Appurtenance</th>





                    </tr>
                    <tr>

                      <th scope="col">Tower Inventory</th>
                      <th scope="col">Height(Feet) (AGL)</th>
                      <th scope="col">Owner</th>
                      <th scope="col">Type</th>




                    </tr>

                  </thead>
                  <tbody>
                    {this.state.towerinspCmpldFoundation.length > 0 && this.state.towerinspCmpldFoundation.filter(v => v.ATTRIBUTE_SUBCATEGORY == "Tower Inventory").map(i => (<tr>



                      <td className="Form-group text-center">{i.ATTRIBUTE_NAME}</td>
                      {/* <td className="Form-group no-border text-center"> <div>{<input type={"Number"} name={val.ATTRIBUTE_NAME} style={{ height: '100%', width: '80%' }} onChange={this.handleMinorQntyChnge.bind(this, val)} defaultValue={val.ATTRIBUTE_FIELDS} />}
                            
                          </div></td> */}
                      {i.ATTRIBUTE_VALUE && i.ATTRIBUTE_VALUE.split('^').map(v => (<td className="Form-group text-center">
                        {v}
                      </td>))}



                    </tr>)
                    )}






                  </tbody>
                </table>
              </div>
              <div className="col-md-4">
                <img src={towerInventory} style={{ height: '100%', width: "100%" }} aria-hidden="true" data-toggle="tooltip" title="Tower Foundation Measurements"
                ></img>
              </div>

            </div>
          </div>

          <div style={{ "padding": "7pt 10px 0px 10px" }}>
            <div className="mb-3 title-div-style-tower"><h4>Attachments</h4></div>
            <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
              <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                <tr>

                  <th scope="col">Category</th>
                  <th scope="col">Attachment Name</th>

                </tr>
              </thead>
              <tbody>
                {this.state.attachmentList.length > 0 && this.state.attachmentList.filter(i => !i.file_name.includes('pm_compressed')).map(inval => (
                  <tr>
                    <td>{inval.category ? inval.category : ''}</td>
                    <td style={{ "cursor": "pointer", "color": "blue" }} onClick={this.downloadAttachments.bind(this, inval)}><b>{inval.file_name ? inval.file_name : ''}</b></td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="container row">

            <div className="col-md-3">
              <Dropzone onDrop={this.onFileDrop.bind(this)}>
                {({ getRootProps, getInputProps }) => (
                  <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                    </div>
                  </section>
                )}
              </Dropzone>
            </div>

            <div className="col-md-5">
              <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />
            </div>

            <div className="col-md-4">
              {this.state.fileSizeError && (<div colSpan="6" ><MessageBox messages={List(["The size of attachments should be less than 25 MB!"])} /></div>)}
              <button type="submit"
                className="Button--secondary float-right mt-2"
                disabled={this.state.filesData.length === 0 || this.state.fileSizeError || issoCondition}
                style={{ marginRight: "5px" }}
                onClick={this.reUpload}>
                Re-upload
              </button>
            </div>

          </div>
        </div>}

        {this.pdfCode}
      </div>)

    }
  }
}
function stateToProps(state, ownProps) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user.toJS().vendor_id
  let vendorCompany = user.toJS().vendor_name
  let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let modelAttributes = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'pmModelAttDetails', 'getPmModelAttDetails'], List()).toJS()
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''

  return {
    user,
    loginId,
    vendorId,
    market,
    vendorCompany,
    submarket,
    modelAttributes,
    realLoginId,
    realUser,
    ssoUrl,
    isssouser,





  }

}
export default connect(stateToProps, { ...pmActions })(TowerInspection)