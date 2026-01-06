import React, { Component } from "react"
import RefreshPage from '../../sites/images/Reload.png'
import "../assets/pmstyles.css"
import PMListItemDetails from "./PMListItemDetails"
import { connect } from "react-redux"
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import Loader from '../../Layout/components/Loader'
import MessageBox from '../../Forms/components/MessageBox'
import ReactTooltip from 'react-tooltip'
var NotificationSystem = require('react-notification-system')
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils'
import excel from '../../Excel/images/Excel.svg'
import BulkUploadPm from './BulkUploadPm'
import Modal from "../../Layout/components/Modal"
import BulkAttachmentPm from './BulkAttachmentPm'
import XLSX from 'xlsx'
import { saveAs } from "file-saver"
import PMSearchSites from './PMSearchSites'
import PMCreatedSites from './PMCreatedSites'
import BulkUpdate from './BulkUpdate'
import GO95InspectionResult from './GO95InspectionResult'

import CreateAList from './CreateAList'
import GenerateTemplate from './GenerateTemplate'
import PMSummary from './PMSummary'
import Select from 'react-select'
import moment from 'moment'
import ReactPaginate from 'react-paginate'
// import Checkbox from '@material-ui/core/Checkbox'
import columnFilterSelector from '../Selectors/columnFilterSelector'
import { Picky } from 'react-picky';
import 'react-picky/dist/picky.css';
import RequestBulkPO from './RequestBulkPO'
import { ivrEmailNotify } from '../../Users/actions'
import { ivrEmailNotification } from '../../Users/schema'
import DetectAppVersion from "../../Utils/DetectAppVersion"
import PMSummaryIcon from "../../Images/PMSummaryIcon.svg";
import VZReviewIcon from "../../Images/VZReviewIcon.svg";
import BulkUpdateIcon from "../../Images/BulkUpdate.svg";
import CreateBulkPORequestIcon from '../../Images/CreateBulkPORequest.svg';
import UploadIcon from "../../Images/UploadIcon.svg";
import DownloadIcon from "../../Images/DownloadIcon.svg";
import AttachIcon from "../../Images/AttachIcon.svg";
import CancelIcon from "../../Images/CancelIcon.svg";
import {uniqBy, sortBy} from 'lodash'
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import {format, parse} from 'date-fns';

// import Checkbox from 'rc-checkbox';
// import 'rc-checkbox/assets/index.css';
class PMDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showModel: false,
      offset: 0,
      data: [],
      perPage: 6,
      currentPage: 0,
      showGO95Modal: false,
      uploadFileClicked: true,
      pageLoading: false,
      isRequestBulkPOClicked: false,
      isBulkUpdateClicked: false,
      isVzReviewClicked: false,
      erpFlag: "",
      columnState: {
        PM_LIST_NAME: false,
        PM_TYPE_NAME: false,
        PO_NUM: false,
        S4_PO_NUM: false,
        PO_STATUS: false,
        PM_LIST_STATUS: false,
        PERCENTAGE: false,
        BUYER: false,
        MANAGER: false
      },
      selectAllChecked: false,
      disableBulkUpdate: true,
      disableVzReview: true,
      selPmTypeName: '',
      selPmListId: '',
      pmListDetails: [],
      filterOptions: {
        PM_LIST_NAME: [],
        PM_TYPE_NAME: [],
        PO_NUM: [],
        S4_PO_NUM: [],
        PO_STATUS: [],
        PM_LIST_STATUS: [],
        PERCENTAGE: [],
        BUYER: [],
        MANAGER: []
      },
      summaryDisable: true,
      currentFilterValues: {
        PM_TYPE_NAME: null,
        PM_LIST_NAME: [],
        PO_NUM: [],
        S4_PO_NUM: [],
        PO_STATUS: [],
        PM_LIST_STATUS: [],
        PERCENTAGE: [],
        BUYER: [],
        MANAGER: []
      },
      filterValuesToSet: {
        PM_TYPE_NAME: '',
        PM_LIST_NAME: [],
        PO_NUM: [],
        S4_PO_NUM: [],
        PO_STATUS: [],
        PM_LIST_STATUS: [],
        PERCENTAGE: [],
        BUYER: [],
        MANAGER: []
      },
      refName: '',
      dropdownvalues: [{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }],
      hideSummary: true,

      pmListIdForFile: 0,
      currentPmList: {},
      onCloseClicked: false,
      closeSearchTable: true,
      isModalshown: false,
      searchString: '',
      isGenerateTempClicked: false,
      currentDropdownValue: { value: `${moment().year()}`, label: `${moment().year()}`, isFixed: true },
      drpdwnOptions: [],
      uploadDownloadAttachFileDisable: true,
      buToolTipMessage: ''
    }
    this.formDropdownoptions = this.formDropdownoptions.bind(this)
    this.validateSelectedItems = this.validateSelectedItems.bind(this)
    this.initialiseDashboard = this.initialiseDashboard.bind(this)
    this.getsearchDetails = this.getsearchDetails.bind(this)
  }
  componentDidMount() {
    this.initPMDashboard()
  }
  initPMDashboard = () => {
    const { loginId, vendorId, fetchpPmListDetails } = this.props
    fetchpPmListDetails(vendorId, loginId, this.state.currentDropdownValue.value)
      .then(async action => {
        if (action.type === "FETCH_PMLISTDETAILS_SUCCESS") {
          let pmListYears = action.pmListDetails.getPmListDetails.pmListYears.sort();
          let erpFlag = action.pmListDetails.getPmListDetails.erpFlag;
          let yearDropdownValues = pmListYears && pmListYears.map(item => {
            return { value: item, label: item, isFixed: true }
          })
          await  this.setState({ pageLoading: true, erpFlag, drpdwnOptions: yearDropdownValues ? yearDropdownValues : [] })
          await this.initialiseDashboard()
          await  this.setState({ pageLoading: false })
          this.props.fetchSearchedSites(vendorId, loginId, '', this.state.currentDropdownValue.value)
        }
      })
  }
  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.user) !== JSON.stringify(this.props.user)) {
      this.initPMDashboard()
    }
  }
  getListStatus = (curList) => {
    if (curList.PM_LIST_STATUS.includes('DRAFT')) {
      return 'DRAFT_REV'
    } else if (curList.PM_LIST_STATUS.includes('PENDING')) {
      return 'PENDING_REV'
    } else if (curList.PM_LIST_STATUS.includes('PARTIAL')) {
      return 'PARTIALCOMPLETED_REV'
    }
  }
  formPostReqVzReview = () => {
    const user = this.props.user.toJS()
    let selectedList = this.state.pmListDetails.filter(({ itemSelected }) => !!itemSelected)
    return selectedList.length > 0 ? selectedList.map(v => {
      return { "ps_poll_ind": "N", "pm_list_status": this.getListStatus(v), "po_status": v.PO_STATUS, "po_num": v.PO_NUM, "pm_list_id": v.PM_LIST_ID, "productCode": "200", "applyPMVendor": "N", "notify_poTeam": "Y", "last_updated_by": this.props.user ? user.lname + ', ' + user.fname : '', "buyer": v.BUYER }
    }) : []
  }
  sendEmailNotification = (currentManagerObj, isManager) => {

    var table = '<table style="border:none;font-weight:bold">'
    this.props.pmListDetails.filter(pl => !!pl.itemSelected && isManager ? (currentManagerObj.MANAGER.toLowerCase() == pl.MANAGER.toLowerCase()) : (currentManagerObj.BUYER.toLowerCase() == pl.BUYER.toLowerCase())).forEach(v => (
      table += '<tr><td style="border:none;font-size:medium">' +
      '***PmListName:'
      + '</td><td style="border:none;color:red;font-size:medium;">' +
      v.PM_LIST_NAME + '</td>' +
      '<td style="border:none;font-size:medium">' + '***PO Number:</td><td style="border:none;color:red;font-size:medium;">' + v.PO_NUM + '</td>' +
      '</tr>'
    ))
    table += '</table>'


    var recepMail = []
    isManager ? recepMail.push(currentManagerObj.MANAGER_EMAIL) : recepMail.push(currentManagerObj.BUYER_EMAIL)
    let emailNotification = {
      body: `<p>The new proposed due date(s) for the following PM list(s)/PO(s) has been provided by ` + this.props.vendorName + '</p>' +
        `<p>Please review and approve in the IOP Vendor PM dashboard</p>` +
        table
        + `
          `,
      from: 'Vendor Portal',
      recipients: recepMail,
      sourceName: 'Vendor Portal',
      subject: "Review List for Vendor PM",
      transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
    }

    if (currentManagerObj && currentManagerObj.MANAGER_EMAIL && currentManagerObj.BUYER_EMAIL) {

      this.props.ivrEmailNotify(this.props.loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } }).then(action => {
        if(action.type=='IVR_EMAIL_NOTIFICATION_SUCCESS'){
          this.setState({
            isVzReviewClicked: true
          })
        }
        else{
          if(action.type == 'IVR_EMAIL_NOTIFICATION_FAILURE'){
            this.setState({
              isVzReviewClicked: false
            })
          }
        }
      })
    }
  }
  async onVzReviewClick() {
    let { vendorId, loginId } = this.props
    let postRequest = {
      "pmListitemsCount": null, "updateList": [], "addList": [],
      "pmList": this.formPostReqVzReview()
    }
    const refName = 'updatePM'
    await this.props.createPMList(vendorId, loginId, refName, false, postRequest, true).then(async action => {

      if (action.type === 'CREATE_PM_LIST_SUCCESS') {
        // await this.props.pmListDetails.filter(pl => !!pl.itemSelected).map(val => val.MANAGER.toLowerCase()).reduce((unique, item) => {
        //   return unique.includes(item) ? unique : [...unique, item]
        // }, []).forEach(async i => {
        //   let curOb = await this.props.pmListDetails.find(pl => pl.MANAGER && pl.MANAGER.toLowerCase() == i.toLowerCase())
        //   await this.sendEmailNotification(curOb, true)
        // })
        await this.props.pmListDetails.filter(pl => !!pl.itemSelected && pl.MANAGER.toLowerCase() != pl.BUYER.toLowerCase()).map(val => val.BUYER.toLowerCase()).reduce((unique, item) => {
          return unique.includes(item) ? unique : [...unique, item]
        }, []).forEach(async i => {
          let curOb = await this.props.pmListDetails.find(pl => pl.BUYER && pl.BUYER.toLowerCase() == i.toLowerCase())
          await this.sendEmailNotification(curOb, false)
        })
        this.setState({ isBulkUpdateClicked: false })
        await this.refreshPmListLoader()
        this.refs.notificationSystem.addNotification({
          title: 'success',
          position: "br",
          level: 'success',
          message: "Review Details updated successfully"
        })
      } else {
        this.refs.notificationSystem.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: "Review Details updation failed"
        })
      }
    })
  }

  onBulkUpdateClick = () => {
    this.setState({
      isBulkUpdateClicked: true
    })
  }
  async initialiseDashboard() {
    const { loginId, vendorId, addDefaultStatusToAllpmLists } = this.props


    const pmListDetails = this.props.pmListDetails


    await addDefaultStatusToAllpmLists(vendorId, loginId, false, false)

    await this.props.setPmFilters(vendorId, loginId, this.state.filterValuesToSet)
    const buToolTipMessage = pmListDetails && pmListDetails.length <= 0 ? 'No PMs are available to PO Due Date Update': 'No PMs are selected to PO Due Date Update'
    this.setState({ pmListDetails, buToolTipMessage }, () => { this.receivedData() })
  }
  async formDropdownoptions() {
    const uniquePmLists = this.props.drpdwnpmListDetails
    const pmTypeNameArray = [{ label: 'Clear Selection', value: '' }, ...uniquePmLists.map(pld => ({ label: pld.PM_TYPE_NAME, value: pld.PM_TYPE_NAME }))]
    const uniqueVisibleList = this.props.pmListDetails
    var filterOptions = {

      PM_TYPE_NAME: pmTypeNameArray,
      PM_LIST_NAME: uniquePmLists.map(pld => ({ label: pld.PM_LIST_NAME, value: pld.PM_LIST_NAME })),
      PO_NUM: uniquePmLists.map(pld => ({ label: pld.PO_NUM, value: pld.PO_NUM })).filter(el => el.value !== null),
      S4_PO_NUM : uniquePmLists.map(pld => ({ label: pld.S4_PO_NUM, value: pld.S4_PO_NUM })).filter(el => el.value !== null),
      PO_STATUS: uniquePmLists.map(pld => ({ label: pld.PO_STATUS, value: pld.PO_STATUS })).filter(el => el.value !== null),
      PM_LIST_STATUS: uniquePmLists.map(pld => ({ label: pld.PM_LIST_STATUS, value: pld.PM_LIST_STATUS })),
      PERCENTAGE: uniquePmLists.map(pld => ({ label: (100 - pld.PERCENTAGE).toFixed(2), value: (100 - pld.PERCENTAGE).toFixed(2) })),
      BUYER: uniquePmLists.map(pld => ({ label: pld.BUYER, value: pld.BUYER })),
      MANAGER: uniquePmLists.map(pld => ({ label: pld.MANAGER, value: pld.MANAGER }))
    }


    await this.setState(() => ({ filterOptions }))
  }
  async validateSelectedItems() {
    let selListPmTypeName = ''
    if (this.state.pmListDetails.every(({ itemSelected }) => !!itemSelected)) {
      if (this.state.pmListDetails.filter(pl => !!pl.itemSelected).length === 1) {
        this.setState({ disableBulkUpdate: false, buToolTipMessage: "Updates the scheduled date / due date for the selected PM" })
      }
      else {
        let count = 0
        let selectedRecord = this.props.pmListDetails.filter(pl => !!pl.itemSelected)
        selListPmTypeName = selectedRecord[0].PM_TYPE_NAME
        selectedRecord.forEach(pl => {
          if (pl.PM_TYPE_NAME === selListPmTypeName)
            count += 1
        })
        if (count == selectedRecord.length)
        await this.setState({ disableBulkUpdate: false, buToolTipMessage: "Updates the scheduled date / due date for the selected PM", selectAllChecked: true })
        else
        await this.setState({ disableBulkUpdate: true, buToolTipMessage: "Select PMs of same PO Type to PO Due Date Update", selectAllChecked: true })
        selectedRecord.forEach(pl=>{
          if(pl.S4_PO_NUM !=null && pl.S4_PO_NUM.startsWith('9000'))
             this.setState({disableBulkUpdate: true, buToolTipMessage: "Select Non-converted PMs to PO Due Date Update"} )
        })
      }
    } else {
      await this.setState({ selectAllChecked: false, disableBulkUpdate: true, buToolTipMessage:"No PMs are selected to PO Due Date Update" })
    }
  }
  handleHideModal = () => this.setState({ isModalshown: false })

  handleHideTemplateModel = () => {
    this.setState({ isGenerateTempClicked: false })
  }
  handleHideBulkAttachements = () => this.setState({ isAttachementModalshown: false });

  async receivedData() {

    const data = this.props.pmListDetails
    const slice = data.slice(this.state.offset, this.state.offset + this.state.perPage)
    await this.formDropdownoptions()
    await this.setState(() => ({ pmListDetails: slice, pageCount: Math.ceil(data.length / this.state.perPage) }))


  }
  handlePageClick = (e) => {
    const demoClasses = document.querySelectorAll('.selection-box')

    const selectedPage = e.selected
    const offset = selectedPage * this.state.perPage

    this.setState({
      currentPage: selectedPage,
      offset: offset
    }, async () => {
      await this.receivedData()
      await this.validateSelectedItems()
    })

  };
  renderLoading = () => {
    return (
      <Loader
        color="#cd040b"
        size="50px"
        margin="4px"
        className="text-center loader-centered" />
    )
  }
  async handleCheckBoxChange(id, e) {
    let selPmTypeName = ''

    let selPmListId = ''
    let selectPmListId = []
    const { loginId, vendorId, addSelectionStatusTopmList, vzReviewPMlists } = this.props
    await addSelectionStatusTopmList(vendorId, loginId, id, e.target)
    await this.receivedData()
    if (this.props.pmListDetails.filter(pl => !!pl.itemSelected).length > 0) {
      if (this.props.pmListDetails.filter(pl => !!pl.itemSelected).length === 1) {
        selPmTypeName = this.props.pmListDetails.find(pl => !!pl.itemSelected).PM_TYPE_NAME
        selPmListId = this.props.pmListDetails.find(pl => !!pl.itemSelected).PM_LIST_ID
        if (vzReviewPMlists && selPmListId && vzReviewPMlists.find(v => v == selPmListId) && vzReviewPMlists.find(v => v == selPmListId) == selPmListId) {
          this.setState({ selPmListId, disableVzReview: false, isVzReviewClicked:false})
        } else {
          this.setState({ selPmListId, disableVzReview: true, isVzReviewClicked: true})
        }
        this.setState({ selPmTypeName, disableBulkUpdate: false, isVzReviewClicked: false, buToolTipMessage: "Updates the scheduled date / due date for the selected PM" })
      }
      else{
        selectPmListId = this.props.pmListDetails.filter(pl => !!pl.itemSelected)
        selectPmListId = selectPmListId.map(i=>{return i.PM_LIST_ID})
        if(selectPmListId && vzReviewPMlists && selectPmListId.every( ai => vzReviewPMlists.includes(ai.toString()) )){
          this.setState({disableVzReview: false, selPmListId:selectPmListId})
        }
        else{
          this.setState({disableVzReview: true, selPmListId:selectPmListId})
        }
      }      
      await this.setState({ summaryDisable: false })
      
      let selectedRecords = this.props.pmListDetails.filter(pl => !!pl.itemSelected)
      selectedRecords.forEach(pl=>{
        if(pl.S4_PO_NUM !=null && pl.S4_PO_NUM.startsWith('9000'))
           this.setState({disableBulkUpdate: true, buToolTipMessage: "Select Non-converted PMs to PO Due Date Update"} )
      })
      if(selectedRecords.length > 0) {
        let boolianFlag = selectedRecords.every(item => ((item.PM_TYPE_NAME === 'GENERATOR PM' || item.PM_TYPE_NAME === 'HVAC PM') && item.PO_NUM))
        this.setState({ uploadDownloadAttachFileDisable: !boolianFlag})
      } else {
        await this.setState({ uploadDownloadAttachFileDisable: true})
      }
    } else { 
      await this.setState({ uploadDownloadAttachFileDisable: true, summaryDisable: true, selPmTypeName: '', disableBulkUpdate: true, disableVzReview: true, buToolTipMessage: "No PMs are selected to PO Due Date Update" }) 
    }
  }

  handleDisableCheck = (PM_TYPE_NAME, S4_PO_NUM) => {

     if (this.state.selPmTypeName === '') return false
    else if (PM_TYPE_NAME === this.state.selPmTypeName) return false
    else return true
  }

  async handleFilterChange(columnField, e) {
    const { vendorId, loginId, setPmFilters } = this.props
    var currentFilterValues = this.state.currentFilterValues
    currentFilterValues[columnField] = e

    await this.setState({ currentFilterValues, offset: 0, currentPage: 0 })

    var filterValuesToSet = this.state.filterValuesToSet
    if (columnField === 'PM_TYPE_NAME') { filterValuesToSet[columnField] = e.value } else { filterValuesToSet[columnField] = e.map(cfv => cfv.value) }


    await setPmFilters(vendorId, loginId, filterValuesToSet)
    await this.receivedData()
    await this.validateSelectedItems()

  }
  async handleRowClick(currentPmList) {
    this.setState({ currentPmList })
    const { toggleExpStatusToPmlist, vendorId, loginId, user, fetchPmGridDetails, fetchDraftGridDetails } = this.props
    if (!!currentPmList.PO_NUM && (currentPmList.PM_TYPE_NAME !== 'GO95' && currentPmList.PM_TYPE_NAME !== 'TOWER INSPECTION')) {

      fetchPmGridDetails(vendorId, loginId, currentPmList.PM_LIST_ID)
    } else {

      fetchDraftGridDetails(vendorId, loginId, currentPmList.PM_LIST_ID, '', currentPmList.PM_TYPE_NAME == 'GO95', currentPmList.PM_TYPE_NAME == 'TOWER INSPECTION')
    }

    await this.setState({ currentPmList })
    await toggleExpStatusToPmlist(vendorId, loginId, currentPmList.PM_LIST_ID)
    await this.receivedData()
  }
  async toggleFilterBar(currentColumn) {
    var columnState = this.state.columnState
    columnState[currentColumn] = !this.state.columnState[currentColumn]
    this.setState({ columnState })
  }
  async handleSelectAll(e) {

    await this.setState({ selectAllChecked: e.target.checked })
    const { selectAllToPmList, vendorId, loginId, vzReviewPMlists } = this.props
    const visiblePMLists = this.state.pmListDetails.map(({ PM_LIST_ID }) => PM_LIST_ID)
    await selectAllToPmList(vendorId, loginId, visiblePMLists, this.state.selectAllChecked).then(action => {
      if (action.type == 'SELECT_ALL_TO_LIST') {
        if (action.visiblePmLists && action.visiblePmLists.length > 0 && action.selectAllChecked && action.visiblePmLists.every(i => vzReviewPMlists.includes(i.toString()))) {
          this.setState({ disableVzReview: false })
        } else {
          this.setState({ disableVzReview: true })
        }
      }
    })
    await this.receivedData()
    await this.validateSelectedItems()
    if (this.props.pmListDetails.filter(pl => !!pl.itemSelected).length > 0) { 
      await this.setState({ summaryDisable: false }) 
    } else { 
      await this.setState({ summaryDisable: true })
    }
    let selectedRecords = this.props.pmListDetails.filter(pl => !!pl.itemSelected)
    if(selectedRecords.length > 0) {
      let boolianFlag = selectedRecords.every(item => ((item.PM_TYPE_NAME === 'GENERATOR PM' || item.PM_TYPE_NAME === 'HVAC PM') && item.PO_NUM))
      this.setState({ uploadDownloadAttachFileDisable: !boolianFlag})
    } else {
      this.setState({ uploadDownloadAttachFileDisable: true})
    }
  }
  async selectAllpmLists() {

    const { selectAllToPmList, vendorId, loginId, vzReviewPMlists } = this.props
    const visiblePMLists = this.props.pmListDetails.map(({ PM_LIST_ID }) => PM_LIST_ID)


    await selectAllToPmList(vendorId, loginId, visiblePMLists, this.state.selectAllChecked).then(action => {

      if (action.type == 'SELECT_ALL_TO_LIST') {
        if (action.visiblePmLists && action.visiblePmLists.length > 0 && action.selectAllChecked && action.visiblePmLists.every(i => vzReviewPMlists.includes(i.toString()))) {
          this.setState({ disableVzReview: false })
        } else {
          this.setState({ disableVzReview: true })
        }
      }
    })


    await this.receivedData()
    await this.validateSelectedItems()
    if (this.props.pmListDetails.filter(pl => !!pl.itemSelected).length > 0) { await this.setState({ summaryDisable: false }) } else { await this.setState({ summaryDisable: true }) }

  }
  async clearAllSelection() {

    const { selectAllToPmList, vendorId, loginId, vzReviewPMlists } = this.props
    const visiblePMLists = this.props.pmListDetails.map(({ PM_LIST_ID }) => PM_LIST_ID)


    await selectAllToPmList(vendorId, loginId, visiblePMLists, false).then(action => {

      if (action.type == 'SELECT_ALL_TO_LIST') {
        if (action.visiblePmLists && action.visiblePmLists.length > 0 && action.selectAllChecked && action.visiblePmLists.every(i => vzReviewPMlists.includes(i.toString()))) {
          this.setState({ disableVzReview: false })
        } else {
          this.setState({ disableVzReview: true })
        }
      }
    })


    await this.receivedData()
    await this.validateSelectedItems()
    if (this.props.pmListDetails.filter(pl => !!pl.itemSelected).length > 0) { await this.setState({ summaryDisable: false }) } else { await this.setState({ summaryDisable: true }) }

  }
  handleBulkUploadClick = () => {
    this.setState({ isModalshown: true })
  }
  handleBulkAttachementClick = () => {
    this.setState({ isAttachementModalshown: true })
  }
  handleGenerateTemplateClick = () => {
    this.setState({ isGenerateTempClicked: true })


  }
  handleChecklistClick = (pmListId, pmListItemId = 0) => {


    const { user, loginId, vendorId, fetchFileData } = this.props
    fetchFileData(loginId, vendorId, pmListId, 0, 'IOP').then(action => {
      if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
        action.fileDetails.getFileDataForPmlist.result.forEach(fd => {

          if (!!fd && !!fd.PM_FILE_TYPE && !!fd.PM_FILE_NAME && !!fd.PM_FILE_DATA) {
            let blob = dataURItoBlob(fd.PM_FILE_DATA)
            startDownload(blob, `${fd.PM_FILE_NAME}.${fd.PM_FILE_TYPE}`)
          }
        })
      }



    })

  }
  async getsearchDetails() {
    const { user, loginId, vendorId, filterSearchedSites } = this.props
    filterSearchedSites(vendorId, loginId, this.state.searchString)
    return
  }
  async refreshPmList() {


    const { user, loginId, vendorId, fetchpPmListDetails, setPmFilters } = this.props
    const year = this.state.currentDropdownValue.value
    await fetchpPmListDetails(vendorId, loginId, year)
    document.getElementById('search-bar').value = ''

    const filterValuesToSet = {
      PM_TYPE_NAME: '',
      PM_LIST_NAME: [],
      PO_NUM: [],
      S4_PO_NUM: [],
      PO_STATUS: [],
      PM_LIST_STATUS: [],
      PERCENTAGE: [],
      BUYER: [],
      MANAGER: []
    }


    const currentFilterValues = {
      PM_TYPE_NAME: null,
      PM_LIST_NAME: [],
      PO_NUM: [],
      S4_PO_NUM : [],
      PO_STATUS: [],
      PM_LIST_STATUS: [],
      PERCENTAGE: [],
      BUYER: [],
      MANAGER: []
    }
    const columnState = {
      PM_LIST_NAME: false,
      PM_TYPE_NAME: false,
      PO_NUM: false,
      S4_PO_NUM : false,
      PO_STATUS: false,
      PM_LIST_STATUS: false,
      PERCENTAGE: false,
      BUYER: false,
      MANAGER: false
    }
    var summaryDisable
    if (this.props.pmListDetails.filter(pl => !!pl.itemSelected).length > 0) { summaryDisable = false } else { summaryDisable = true }

    this.setState({ filterValuesToSet, columnState, currentFilterValues, closeSearchTable: true, searchString: '', offset: 0, currentPage: 0, selectAllChecked: false, selPmTypeName: '', selPmListId: '', disableBulkUpdate: true, disableVzReview: true, summaryDisable }, async () => {
      await this.initialiseDashboard()
      await this.props.fetchSearchedSites(vendorId, loginId, '', this.state.currentDropdownValue.value)
      await this.getsearchDetails()
    })

  }
  closeSearchTable = (closeSearchTable) => {

    this.setState({ closeSearchTable })
  }
  handleChange = (e) => {

    if (e.target.value.length > 2) {
      this.setState({ closeSearchTable: false, searchString: e.target.value }, async () => {

        this.getsearchDetails()
      })
    } else {
      
      this.setState({ closeSearchTable: true, searchString: '' }, () => {
        this.getsearchDetails()
      })
    }


  }

  handleHideSummary = () => {
    this.setState({ showModel: false })
  }
  handleHideRequestBulkUpdateModel = () => {
    this.setState({ isBulkUpdateClicked: false })
  }
  handleHideRequestBulkPOModel = () => {
    this.setState({ isRequestBulkPOClicked: false })
  }
  handleHideBulkUpdateModel = () => {
    this.setState({ isBulkUpdateClicked: false })
  }

  onCreateBulkPOClick = () => {
    this.setState({
      isRequestBulkPOClicked: true,
      uploadFileClicked: true
    })
  }
  async handleDropdownChange(e) {

    await this.setState({ currentDropdownValue: e })
    const { vendorId, loginId, fetchpPmListDetails } = this.props
    await this.setState({ pageLoading: true })
    await this.refreshPmList()
    await this.setState({ pageLoading: false })

  }
  overrideParentClick = (event) => {
    event.stopPropagation()
  }
  renderTable = () => {
    let {esaFlag}=this.props

 return (
      <table className="table table-hover table-pmlist mt-3" style={{ border: "1px solid lightgray"}}>
        <thead className="thead-light">
          <tr>
            <th scope="col" className="text-center"> <div>
              <input
                type="checkbox"
                id="topping"
                name="select all"
                disabled={false}
                checked={this.state.selectAllChecked}
                onChange={this.handleSelectAll.bind(this)}
                style={{ width: "15px", height: "15px" }}
              />
            </div>
              {this.state.selectAllChecked && !this.props.pmListDetails.every(v => v.itemSelected) && <div><span style={{ cursor: "pointer", color: "blue", textAlign: "left" }} onClick={this.selectAllpmLists.bind(this)}>Select All</span></div>}
              {this.props.pmListDetails.length > 0 && this.props.pmListDetails.every(v => v.itemSelected) &&
                <div>
                  <div style={{display: "inline-flex"}}><span>{this.props.pmListDetails ? this.props.pmListDetails.length : 0}</span> <span> List(s)</span><span> Selected</span></div>
                  <div style={{ cursor: "pointer", color: "blue", textAlign: "left" }} onClick={this.clearAllSelection.bind(this)}>Clear-Selection</div>
                </div>}
            </th>
            <th scope="col" className="text-center" ></th>
            <th scope="col" className="text-center"></th>
            <th scope="col" className="text-left">
              <div className="row">
                <div className="col-8">PO Reference Name</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'PM_LIST_NAME')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>
              </div>
              {this.state.columnState['PM_LIST_NAME'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["PM_LIST_NAME"]}
                  options={uniqBy(this.state.filterOptions["PM_LIST_NAME"], "value")}
                  onChange={this.handleFilterChange.bind(this, "PM_LIST_NAME")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={true}
                  includeSelectAll={true}
                  includeFilter={true}
                  dropdownHeight={200}
                  clearFilterOnClose={true}
                />
              </div>}
            </th>
            <th scope="col" className="text-left">
              <div className="row">

                <div className="col-8">PO Type</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'PM_TYPE_NAME')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>

              </div>
              {this.state.columnState['PM_TYPE_NAME'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["PM_TYPE_NAME"]}
                  options={uniqBy(this.state.filterOptions["PM_TYPE_NAME"], "value")}
                  onChange={this.handleFilterChange.bind(this, "PM_TYPE_NAME")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={false}
                  includeSelectAll={false}
                  includeFilter={true}
                  dropdownHeight={200}
                />
              </div>}
            </th>
            {/* <th scope="col" className="text-left">
              <div className="row">

                <div className="col-8">PO Number</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'PO_NUM')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>

              </div>
              {this.state.columnState['PO_NUM'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["PO_NUM"]}
                  options={uniqBy(this.state.filterOptions["PO_NUM"], "value")}
                  onChange={this.handleFilterChange.bind(this, "PO_NUM")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={true}
                  includeSelectAll={true}
                  includeFilter={true}
                  dropdownHeight={200}
                />
              </div>}
            </th>  */}
            { this.state.erpFlag =='Y' && 
            <th scope="col" className="text-left">
              <div className="row">

                <div className="col-8">PO Number</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'S4_PO_NUM')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>

              </div>
              {this.state.columnState['S4_PO_NUM'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["S4_PO_NUM"]}
                  options={uniqBy(this.state.filterOptions["S4_PO_NUM"], "value")}
                  onChange={this.handleFilterChange.bind(this, "S4_PO_NUM")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={true}
                  includeSelectAll={true}
                  includeFilter={true}
                  dropdownHeight={200}
                />
              </div>}
            </th>
            } 
            <th scope="col" className="text-left">
              <div className="row">

                <div className="col-8">PO Status</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'PO_STATUS')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>

              </div>
              {this.state.columnState['PO_STATUS'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["PO_STATUS"]}
                  options={uniqBy(this.state.filterOptions["PO_STATUS"], "value")}
                  onChange={this.handleFilterChange.bind(this, "PO_STATUS")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={true}
                  includeSelectAll={true}
                  includeFilter={true}
                  dropdownHeight={200}
                />
              </div>}
            </th>
            <th scope="col" className="text-left">
              <div className="row">
                <div className="col-8">PM List Status</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'PM_LIST_STATUS')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>
              </div>
              {this.state.columnState['PM_LIST_STATUS'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["PM_LIST_STATUS"]}
                  options={uniqBy(this.state.filterOptions["PM_LIST_STATUS"], "value")}
                  onChange={this.handleFilterChange.bind(this, "PM_LIST_STATUS")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={true}
                  includeSelectAll={true}
                  includeFilter={true}
                  dropdownHeight={200}
                />
              </div>}
            </th>
            <th scope="col" className="text-left">
              <div className="row">

               <div className="col-8">{ esaFlag=='Y'? 'Requisitioner':'Buyer Name'}</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'BUYER')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>

              </div>
              {this.state.columnState['BUYER'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["BUYER"]}
                  options={uniqBy(this.state.filterOptions["BUYER"], "value")}
                  onChange={this.handleFilterChange.bind(this, "BUYER")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={true}
                  includeSelectAll={true}
                  includeFilter={true}
                  dropdownHeight={200}
                />
              </div>}
            </th>
            <th scope="col" className="text-left">
              <div className="row">

                <div className="col-8">{esaFlag=='Y' ? 'Manager':'Manager Name'}</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'MANAGER')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>

              </div>
              {this.state.columnState['MANAGER'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["MANAGER"]}
                  options={uniqBy(this.state.filterOptions["MANAGER"], "value")}
                  onChange={this.handleFilterChange.bind(this, "MANAGER")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={true}
                  includeSelectAll={true}
                  includeFilter={true}
                  dropdownHeight={200}
                />
              </div>}
            </th>
            <th scope="col" className="text-left">
              <div className="row">

                <div className="col-8">Pending</div><div className="col-2" onClick={this.toggleFilterBar.bind(this, 'PERCENTAGE')}><i className="fa fa-filter fa-lg" aria-hidden="true" style={{ "cursor": "pointer" }} ></i></div>

              </div>
              {this.state.columnState['PERCENTAGE'] && <div className="mt-2">
                <Picky
                  value={this.state.currentFilterValues["PERCENTAGE"]}
                  options={uniqBy(this.state.filterOptions["PERCENTAGE"], "value")}
                  onChange={this.handleFilterChange.bind(this, "PERCENTAGE")}
                  open={false}
                  valueKey="value"
                  labelKey="label"
                  multiple={true}
                  includeSelectAll={true}
                  includeFilter={true}
                  dropdownHeight={200}
                />
              </div>}
            </th>

           
          </tr>
        </thead>

        {this.state.pmListDetails.length > 0 ? this.state.pmListDetails.map((val, index) => {
          const { PM_TYPE_NAME, PM_LIST_NAME, PO_NUM, S4_PO_NUM, PERCENTAGE, PO_STATUS, PM_LIST_ID, itemExpanded, itemSelected, BUYER, MANAGER, PM_LIST_STATUS } = val
          return (<tbody className="tbody-light">
            <tr className="trow-pmlist" onClick={this.handleRowClick.bind(this, val)}>
              <td scope="col" className="text-center" onClick={this.overrideParentClick.bind(this)}>
                <input
                  type="checkbox"
                  id="topping"
                  name={PM_LIST_ID}
                  value={PM_LIST_ID}
                  disabled={this.handleDisableCheck(PM_TYPE_NAME, S4_PO_NUM)}
                  checked={itemSelected}
                  onChange={this.handleCheckBoxChange.bind(this, PM_LIST_ID)}
                  style={{ width: "15px", height: "15px" }}
                />
              </td>
              <th colSpan="2" className="text-center"><i className={itemExpanded ? "fa fa-caret-down fa-lg" : "fa fa-caret-right fa-lg"} aria-hidden="true" style={{ "cursor": "pointer" }}></i></th>
              <td scope="col" className="text-left">{PM_LIST_NAME}</td>
              <td scope="col" className="text-left">{PM_TYPE_NAME}</td>
              {/* <td scope="col" className="text-left">{PO_NUM}</td> */}
               {this.state.erpFlag =='Y' &&  <td scope="col" className="text-left">{S4_PO_NUM}</td>} 
              <td scope="col" className="text-left">{PO_STATUS}</td>
              <td scope="col" className="text-left">{PM_LIST_STATUS}</td>
              <td scope="col" className="text-left">{BUYER}</td>
              <td scope="col" className="text-left">{MANAGER}</td>
              <td scope="col" className="text-left">{(100 - PERCENTAGE).toFixed(2)}%</td>
              {/* <td className="text-center" style={{ display: "flex", width: "8vw", justifyContent: "space-evenly" }}>
                {PM_TYPE_NAME !== 'GO95' && ((PM_TYPE_NAME === 'GENERATOR PM' || PM_TYPE_NAME === 'HVAC PM') && !!PO_NUM) && <i className="fa fa-download float-left" style={{ height: "12pt", width: "15px", cursor: "pointer" }} aria-hidden="true" data-toggle="tooltip" title="Generate template for bulk PM result upload"
                  onClick={this.handleGenerateTemplateClick.bind(this)}></i>}
                <i className="far fa-list-alt float-right pr-1 " style={{ cursor: 'pointer' }}
                  data-toggle="tooltip" title="checklist" onClick={this.handleChecklistClick.bind(this, PM_LIST_ID)}></i>

                {PM_TYPE_NAME !== 'GO95' && ((PM_TYPE_NAME === 'GENERATOR PM' || PM_TYPE_NAME === 'HVAC PM') && !!PO_NUM) && <i className="fa fa-upload" style={{ height: "12pt", width: "15px", cursor: "pointer" }} aria-hidden="true" data-toggle="tooltip" title="bulk upload PM result"
                  onClick={this.handleBulkUploadClick.bind(this)}></i>}
                {((PM_TYPE_NAME === 'GENERATOR PM' || PM_TYPE_NAME === 'HVAC PM') && !!PO_NUM) && <i className="fa fa-paperclip" style={{ height: "12pt", width: "15px", cursor: "pointer", fontSize: '16px', fontStyle: "oblique" }} aria-hidden="true" data-toggle="tooltip" title="Bulk Upload Attachments"
                  onClick={this.handleBulkAttachementClick.bind(this)}></i>}
              </td> */}

            </tr>
            {itemExpanded && <tr>
              <td scope="col"></td>
              <td scope="col"></td>
              <td scope="col"></td>
              {!!PO_NUM && PM_TYPE_NAME !== 'GO95' && PM_TYPE_NAME !== 'TOWER INSPECTION' ?
                <td scope="col" colSpan="8">
                  {this.props.pmGridLoading ? this.renderLoading() : (
                    <div className="">
                      {this.props.fetchPMGridError ? <MessageBox messages={List(["No record(s) found."])} /> :
                        <PMListItemDetails currentPmList={this.state.currentPmList} notiref={this.refs.notificationSystem} title={this.state.currentPmList.PM_LIST_NAME} onCloseClicked={this.state.onCloseClicked} initPMDashboard={this.initPMDashboard} />}
                    </div>
                  )}
                </td> :
                <td scope="col" colSpan="8">
                  {this.props.pmGridDetailsDraftLoading ? this.renderLoading() : (
                    <div className="">
                      {this.props.fetchPMGridDraftError ? <MessageBox messages={List(["No record(s) found."])} /> :
                        <PMCreatedSites
                          currentPmList={this.state.currentPmList}
                          notiref={this.refs.notificationSystem}
                          title={this.state.currentPmList.PM_LIST_NAME}
                          onCloseClicked={this.state.onCloseClicked}
                          pmGridDetailsDraft={this.props.pmGridDetailsDraft}
                          handleHideModalGO95={this.handleHideModalGO95}
                          esaFlag={this.props.esaFlag}
                        />}
                    </div>
                  )}
                </td>
              }
              <td scope="col"></td>
              <td scope="col"></td>
              <td scope="col"></td>
            </tr>}
          </tbody>)

        }) :  <tbody className="tbody-light">
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>No Rows Found</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            </tr>
          </tbody>}

      </table>
    )
  }

//downloading pm list details by vendor ID
  async handleExportToExcelPmListDetailsByVendorId(){
    const { vendorMgdid, fetchPmListDetailsByVendorId } = this.props
    const year = this.state.currentDropdownValue.value
    this.setState({ exportExcelLoading: true})
    if (vendorMgdid && year){
      await fetchPmListDetailsByVendorId(vendorMgdid, year).then(resp => {
        //console.log('resp pm list', resp.pmListDetailsByVendorId)
        if (resp && resp.pmListDetailsByVendorId && resp.pmListDetailsByVendorId.pmListItemsByMdgId && resp.pmListDetailsByVendorId.pmListItemsByMdgId.length > 0) {
          let pmListData = resp.pmListDetailsByVendorId.pmListItemsByMdgId
          this.setState({ pmListData })
          this.createPmListFile()
        }
        else {
          this.refs.notificationSystem.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: 'Error exporting to excel'
          })
        }
        this.setState({ exportExcelLoading: false })
      })
    }
  }

  async createPmListFile() {
    let tableName = 'Pm list of all submarkets'
    let input = this.state.pmListData

    const pages = Array.isArray(input) ? input : [input]
    const data = []
    for (let page = Object.keys(pages), j = 0, end = page.length; j < end; j++) {
      let key = page[j], value = pages[key]
      let formattedDate = null;
      if(value.COMPLETED_DATE){
      let onlyDate = value.COMPLETED_DATE?.split(" ")[0];
      let parsedDate = parse(onlyDate, "dd-MMM-yy", new Date());
      formattedDate = format(parsedDate,"MM/dd/yyyy")
      }
      let exceldata = {
        "Area": value.SUBMARKET,
        "PO#": value.PO_NUM,
        "PM list name": value.PM_LIST_NAME,
        "Manager": value.MANAGER,
        "Requisitioner": value.BUYER,
        "PM Type": value.PM_TYPE,
        "Vendor Mdgid": value.VENDOR_MDGID,
        "Vendor Id": value.VENDOR_ID,
        "PM Status": value.PM_LIST_STATUS,
        "PO Status": value.PO_STATUS,
        "Site Id": value.SITEID,
        "Site Name": value.SITE_NAME,
        "MDGLC": value.MDGLC,
        "Peoplesoft location ID": value.PEOPLESOFT_LOCATION_ID,
        "Cost": value.COST,
        "Line": value.LINE,
        "Line Status": value.LINE_STATUS,
        "Due Date": (value.DUE_DATE ? moment(value.DUE_DATE).format('MM/DD/YYYY') : ''),
        "Completed Date": (value.COMPLETED_DATE ? formattedDate : ''),
        "Completed By": value.COMPLETED_BY,
        "Invoice out of seq": value.INVOICINGOOS
      }
      data.push(exceldata)
    }

    //sort the excel data based on the specific columns
    let sortedExcelData = sortBy(data, ['Area', 'Manager', 'Requisitioner', 'PO#', 'Line']);
    let ws = XLSX.utils.json_to_sheet(sortedExcelData)
    let wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' })
    let buf = new ArrayBuffer(wbout.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `${tableName}.xlsx`)

    this.refs.notificationSystem.addNotification({
      title: 'Success',
      position: "br",
      level: 'success',
      message: 'Successfully exported to Excel'
    })
  }


  async handleExportToExcelClick() {

    const { vendorId, loginId, fetchPmGridDetails, drpdwnpmListDetails, fetchDraftGridDetails, submarket } = this.props
    const selectedLists = drpdwnpmListDetails.filter(dld => dld.itemSelected && !!dld.PO_NUM)
    const selectedListCreated = drpdwnpmListDetails.filter(dld => dld.itemSelected && (!dld.PO_NUM || dld.PM_TYPE_NAME == 'GO95'))
    const pmListIds = selectedLists.map(sl => sl.PM_LIST_ID).join(',')
    const pmListIdsCreated = selectedListCreated.map(sl => sl.PM_LIST_ID).join(',')
    const data = []
    if (pmListIds) {
      await fetchPmGridDetails(vendorId, loginId,  pmListIds,  'MULTIPLE_LISTS')
    }
    if (pmListIdsCreated) { await fetchDraftGridDetails(vendorId, loginId, pmListIdsCreated, 'MULTIPLE_LISTS', false, true) }


    if (selectedLists.length > 0) {
      let input1 = this.props.pmGridDetailsMultiple
      const pages1 = Array.isArray(input1) ? input1 : [input1]
      for (let page = Object.keys(pages1), j = 0, end = page.length; j < end; j++) {
        let key = page[j], value = pages1[key]
        let exceldata = {
          "Area": submarket || '',
          "PO#": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PO_NUM,
          "PM list name": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_LIST_NAME,
          "Manager": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).MANAGER|| '',
          "Requisitioner": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).BUYER,
          "PM Type": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_TYPE_NAME,
          "Vendor MDGID": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).MDGID,
          "Vendor Id": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).VENDOR_ID,
          "PM Status": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_LIST_STATUS,
          "PO Status": selectedLists.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PO_STATUS,
          "Site Id": value.PM_SITE_ID,
          "Site Name": value.PM_LOCATION_NAME,
          "MDGLC": value.MDG_ID,
          "Peoplesoft location ID": value.PS_LOCATION_ID,
          "Cost": value.PM_COST,
          "Line #": Number(value.LINE),
          "Line Status": value.PM_ITEM_STATUS,
          "Due Date": (value.PM_ITEM_DUE_DATE ? moment(value.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : ''),
          "Completed By": value.COMPLETED_BY,
          "Completed Date": (value.PM_ITEM_COMPLETED_DATE ? moment(value.PM_ITEM_COMPLETED_DATE).format('MM/DD/YYYY') : ''),
          "Invoice out of seq": (value.INVOICINGOOS || '')
        }
        data.push(exceldata)
      }

    }
    if (selectedListCreated.length > 0) {
      let input2 = this.props.pmgriddetailsDraftMultiple
      const pages2 = Array.isArray(input2) ? input2 : [input2]
      for (let page = Object.keys(pages2), j = 0, end = page.length; j < end; j++) {
        let key = page[j], value = pages2[key]
        let exceldata2GO95 = {
          "Area": submarket || '',
          "PO#": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PO_NUM,
          "PM list name": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_LIST_NAME,
          "Manager": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).MANAGER|| '',
          "Requisitioner": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).BUYER,
          "PM Type": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_TYPE_NAME,
          "Vendor MDGID": value.MDGID,
          "Vendor Id": value.VENDOR_ID,
          "PM Status": value.PM_ITEM_STATUS,
          "PO Status": value.PO_STATUS,
          "Site Id": value.PM_SITE_ID,
          "Site Name": value.PM_LOCATION_NAME,
          "MDGLC": value.MDG_ID,
          "Peoplesoft location ID": value.PS_LOCATION_ID,
          "Cost": value.PM_COST,
          "Line #": value.LINE,
          "Line Status": value.LINE_STATUS,
          "Due Date": (value.PM_ITEM_DUE_DATE ? moment(value.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : ''),
          "Completed By": value.COMPLETED_BY,
          "Completed Date": (value.PM_ITEM_COMPLETED_DATE ? moment(value.PM_ITEM_COMPLETED_DATE).format('MM/DD/YYYY') : '')
        }
        let exceldata2 = {
          "Area": submarket || '',
          "PO#": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PO_NUM,
          "PM list name": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_LIST_NAME,
          "Manager": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).MANAGER|| '',
          "Requisitioner": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).BUYER,
          "PM Type": selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_TYPE_NAME,
          "Vendor MDGID": value.MDGID,
          "Vendor Id": value.VENDOR_ID,
          "PM Status": value.PM_ITEM_STATUS,
          "PO Status": value.PO_STATUS,
          "Site Id": value.PM_SITE_ID,
          "Site Name": value.PM_LOCATION_NAME,
          "MDGLC": value.MDG_ID,
          "Peoplesoft location ID": value.PS_LOCATION_ID,
          "Cost": value.PM_COST,
          "Line #": value.LINE,
          "Line Status": value.LINE_STATUS,
          "Due Date": (value.PM_ITEM_DUE_DATE ? moment(value.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : ''),
          "Completed By": value.COMPLETED_BY,
          "Completed Date": (value.PM_ITEM_COMPLETED_DATE ? moment(value.PM_ITEM_COMPLETED_DATE).format('MM/DD/YYYY') : '')
        }
        !!selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PO_NUM && !!selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_TYPE_NAME && selectedListCreated.find(sl => sl.PM_LIST_ID === value.PM_LIST_ID).PM_TYPE_NAME == 'GO95' ?
          data.push(exceldata2GO95) : data.push(exceldata2)
      }
    }
    let sortedExcelData = sortBy(data, ['Area', 'Manager', 'Requisitioner', 'PO#', 'Line #'])
    let ws = XLSX.utils.json_to_sheet(sortedExcelData)
    let wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "PMList")
    let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' })
    let buf = new ArrayBuffer(wbout.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `data.xlsx`)
  }

  handleSummaryClick = () => {
    const { vendorId, loginId, fetchPmGridDetails, drpdwnpmListDetails } = this.props
    const pmListIds = drpdwnpmListDetails.filter(dld => dld.itemSelected).map(val => val.PM_LIST_ID).join(',')
    if (pmListIds) {
      fetchPmGridDetails(vendorId, loginId, pmListIds, 'MULTIPLE_LISTS').then(action => {
        this.setState({ showModel: true })
      })
    }
  }
  async refreshPmListLoader() {
    this.setState({ pageLoading: true })
    await this.refreshPmList()
    this.setState({ pageLoading: false })
  }
  renderBulkPOActions = () => {
    const customStyles = {
      control: base => ({
        ...base,
        height: 37,
        minHeight: 37
      })
    }
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
    return <div className="row" style={{ marginTop: "10px" }}>
      <div className="col-md-4" style={{display: "flex", justifyContent: "left",marginBottom:"40px",marginLeft:"-14px", alignItems: "end"}}>
        <div className="col-md-6">
          <input
            placeholder="Search Sites"
            className="form-control title-div-style"
            style={{ height: "32px",borderRadius:"0rem" }}
            autoComplete="off"
            onChange={this.handleChange}
            id="search-bar"
          />
          </div>
          <div className="col-md-6">
          <Select
            className="basic-single text-left title-div-style"
            id="select_drop_down_menu"
            classNamePrefix="select"
            value={this.state.currentDropdownValue}
            isDisabled={false}
            isLoading={false}
            clearable={false}
            isRtl={false}
            isSearchable={false}
            styles={customStyles}
            options={this.state.drpdwnOptions}
            onChange={this.handleDropdownChange.bind(this)}
          />
          </div>
      </div>
      <div className="col-md-8" style={{display: "flex", justifyContent: "right"}}>
        {/* <div className={this.state.summaryDisable || this.props.drpdwnpmListDetails.filter(val => !!val.PO_NUM && val.itemSelected).length === 0 || this.props.drpdwnpmListDetails.filter(val => val.PM_TYPE_NAME == 'GO95' && val.itemSelected).length > 0 ? "bulk-po-user-actions-disable": "bulk-po-user-actions"} 
            onClick={this.handleSummaryClick.bind(this)}>
          <small style={{ display: "flex", justifyContent: "center" }}>
            <img src={PMSummaryIcon} />
          </small>
          <span className="text-center">PM Summary</span>
        </div> */}
        <div className={this.state.disableVzReview || issoCondition || this.state.isVzReviewClicked? "bulk-po-user-actions-disable" : "bulk-po-user-actions"} 
            onClick={this.onVzReviewClick.bind(this)}>
          <small style={{ display: "flex", justifyContent: "center" }}>
            <img src={VZReviewIcon} />
          </small>
          <span className="text-center">Submit to VZ for approval</span>
        </div>
        <div class="tooltip-wrapper"  data-tip data-for="Bulk Update">
        <div className={this.state.disableBulkUpdate || issoCondition ? "bulk-po-user-actions-disable" : "bulk-po-user-actions" }
        data-tip data-for="Bulk Update"
            onClick={this.onBulkUpdateClick.bind(this)} >
          <small style={{ display: "flex", justifyContent: "center" }}>
            <img src={BulkUpdateIcon} />
          </small>
          <span className="text-center">PO Due Date Update</span>
        </div>
        </div>
        <ReactTooltip id="Bulk Update" place="top" effect="float">
              <span>{this.state.buToolTipMessage}</span>
            </ReactTooltip>
        <div className={issoCondition ? "bulk-po-user-actions-disable" : "bulk-po-user-actions"} 
            onClick={this.onCreateBulkPOClick.bind(this)}>
          <small style={{ display: "flex", justifyContent: "center" }}>
            <img src={CreateBulkPORequestIcon} />
          </small>
          <span className="text-center">Create Bulk PO Request</span>
        </div>
        <div className={this.state.uploadDownloadAttachFileDisable ? "bulk-po-user-actions-disable" : "bulk-po-user-actions"}
            onClick={this.handleBulkUploadClick.bind(this)}
            data-tip data-for="Upload">
          <small style={{ display: "flex", justifyContent: "center" }}>
            <img src={UploadIcon} />
          </small>
          <span className="text-center">Upload</span>
        </div>
        <ReactTooltip id="Upload" place="top" effect="float">
              <span>Bulk upload PM result</span>
            </ReactTooltip>
        <div className={this.state.uploadDownloadAttachFileDisable ? "bulk-po-user-actions-disable" : "bulk-po-user-actions"}
            onClick={this.handleGenerateTemplateClick.bind(this)}
            data-tip data-for="Download">
          <small style={{ display: "flex", justifyContent: "center" }}>
            <img src={DownloadIcon} />
          </small>
          <span className="text-center">Download</span>
        </div>
        <ReactTooltip id="Download" place="top" effect="float">
              <span>Generate template for bulk PM result upload</span>
            </ReactTooltip>
        <div className={this.props.pmListDetails.filter(pl => pl.itemSelected == true).length == 1 ? "bulk-po-user-actions" : "bulk-po-user-actions-disable"}
            onClick={this.handleBulkAttachementClick.bind(this)}>
          <small style={{ display: "flex", justifyContent: "center" }}>
            <img src={AttachIcon} />
          </small>
          <span className="text-center">Attach File</span>
        </div>
        <div className={this.props.pmListDetails.filter(pl => !!pl.itemSelected).length > 0 ? "bulk-po-user-actions" : "bulk-po-user-actions-disable"}
            onClick={this.clearAllSelection.bind(this)}>
          <small style={{ display: "flex", justifyContent: "center" }}>
            <img src={CancelIcon} />
          </small>
          <span className="text-center">Clear Selection</span>
        </div>
      </div>
      <div className="col-md-12">
        {!this.state.closeSearchTable &&
          <PMSearchSites
            initPMDashboard={this.initPMDashboard}
            closeSearchTable={this.closeSearchTable}
            searchString={this.state.searchString}
            currentPmList={this.state.currentPmList}
            notiref={this.refs.notificationSystem}
          />}
      </div>
    </div>
  }



  
  renderTitle = () => {
    return <div className="bulk-po-dashboard-header">
      <h4>Bulk PO Dashboard</h4>
      <div>
       
        <a onClick={this.handleExportToExcelPmListDetailsByVendorId.bind(this)} className="navbar-brand pointer" data-tip data-for="DownloadAllPmList">
          {
            this.state.exportExcelLoading ? this.renderLoading() :
              <LibraryAddCheckIcon fontSize="large" style={{ fill: 'black' }}></LibraryAddCheckIcon>
          }
        </a>
        <ReactTooltip id="DownloadAllPmList" place="left" effect="float">
          <span>Download PM's for All Markets</span>
        </ReactTooltip>

        <a className="navbar-brand pointer" data-tip data-for="DownloadPmList" >
          <small>
            <img src={excel} style={{ height: '27px' }}
              onClick={this.handleExportToExcelClick.bind(this)} />
          </small>
        </a>
        <ReactTooltip id="DownloadPmList" place="bottom" effect="float">
          <span>Export data for the selected POs</span>
        </ReactTooltip>
        <a className="navbar-brand pointer" data-tip data-for="Refresh" >
          <small>
            <img src={RefreshPage} style={{ height: '27px' }}
              onClick={this.refreshPmListLoader.bind(this)} />
          </small>
        </a>

        
      </div>
    </div>
  }
  passRefname = (refName) => {
    this.setState({ refName })
  }
  async handleUploadFileClick() {
    this.setState({ uploadFileClicked: true })
  }
  async handleCreateListClick() {
    await this.setState({ uploadFileClicked: false })
  }
  handleHideGO95Modal = () => {
    this.setState({ showGO95Modal: false })
  }
  showGO95 = () => {
    this.setState({ showGO95Modal: true })
  }

  handleHideModalGO95 = () => {
    let { currentPmList } = this.state
    let { vendorId, loginId, fetchDraftGridDetails } = this.props
    fetchDraftGridDetails(vendorId, loginId, currentPmList.PM_LIST_ID, '', currentPmList.PM_TYPE_NAME == 'GO95', currentPmList.PM_TYPE_NAME == 'TOWER INSPECTION')
  }

  render() {
    //console.log('drpdwnpmListDetails', this.props.drpdwnpmListDetails)
    //console.log(' vendors mgdid', this.props.vendorMgdid)
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
    let bannerEnabled = false
    if (!!this.props.notificationDetals && this.props.notificationDetals.notifications && this.props.notificationDetals.notifications.filter(val => val.NOTIFY_DISPLAY == 'Y').length > 0) {
      bannerEnabled = true
    }
    //bannerEnabled ? {"paddingTop": "15rem"} : 
    return (<div className="container-fluid" style={{ paddingTop: "3rem" }}>
      <DetectAppVersion />
      {this.renderTitle()}
      {this.renderBulkPOActions()}
      {this.state.selectAllChecked && this.state.disableBulkUpdate && (<div className=" text-center text-danger" style={{ marginTop: "5px" }}><h3>Please select lists of same PO Type / Non-converted POs to PO Due Date Update</h3></div>)}
      {this.state.showGO95Modal && (<Modal title="Pole Inspection" handleHideModal={this.handleHideGO95Modal} style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}>
        <GO95InspectionResult />
      </Modal>)}
      {this.state.showModel && (
        <Modal large={false} handleHideModal={this.handleHideSummary} title="PM Summary">

          <div className="container">
            <PMSummary />
          </div>


        </Modal>
      )}
      {this.state.isModalshown && (
        <Modal large={true} handleHideModal={this.handleHideModal} style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}>
          <BulkUploadPm currentPmList={this.state.currentPmList} handleHideModal={this.handleHideModal} searchString={this.state.searchString} notiref={this.refs.notificationSystem}
            pmListDetails={this.props.drpdwnpmListDetails}
            selPOList={this.state.pmListDetails}
            pmRefDetails={this.props.pmRefDetails}
            initPMDashboard={this.initPMDashboard} />
        </Modal>
      )}
      {
        this.state.isAttachementModalshown && (
          <Modal large={true} handleHideModal={this.handleHideBulkAttachements} style={{ width: "90%", maxWidth: "90%", display: "block", marginTop: "30px" }}>
            <BulkAttachmentPm currentPmList={this.state.currentPmList} notiref={this.refs.notificationSystem} handleHideModal={this.handleHideBulkAttachements} 
            pmListDetails={this.props.drpdwnpmListDetails}
            selPOList={this.state.pmListDetails}
            pmRefDetails={this.props.pmRefDetails}
            initPMDashboard={this.initPMDashboard}/>
          </Modal>
        )
      }
      {this.state.isRequestBulkPOClicked && (
        <Modal title="Request Bulk PO" large={true} handleHideModal={this.handleHideRequestBulkPOModel} style={{ width: "94%", maxWidth: "94%", display: "block", marginTop: "30px" }}>
          <ul className="container-fluid">
            <li className={this.state.uploadFileClicked ? "d-inline p-2 navigation-class-active" : "d-inline p-2 navigation-class"} onClick={this.handleUploadFileClick.bind(this)}><b>Upload File</b></li>
            <li className={!this.state.uploadFileClicked ? "d-inline p-2 navigation-class-active" : "d-inline p-2 navigation-class"} onClick={this.handleCreateListClick.bind(this)}><b>Create a List</b></li>

          </ul>
          {this.state.uploadFileClicked ? <RequestBulkPO currentPmList={this.state.currentPmList} erpFlag={this.props.erpFlag} notiref={this.refs.notificationSystem} refName={this.state.refName} passRefname={this.passRefname}
            handleHideRequestBulkPOModel={this.handleHideRequestBulkPOModel} initPMDashboard={this.initPMDashboard} />
            : <CreateAList currentPmList={this.state.currentPmList} erpFlag={this.props.erpFlag} notiref={this.refs.notificationSystem} refName={this.state.refName} passRefname={this.passRefname}
              handleHideRequestBulkPOModel={this.handleHideRequestBulkPOModel}
              initPMDashboard={this.initPMDashboard} year={this.state.currentDropdownValue.value} />}
        </Modal>
      )}
      {this.state.isBulkUpdateClicked && (
        <Modal title="PO Due Date Update" large={true} handleHideModal={this.handleHideRequestBulkUpdateModel} style={{ width: "94%", maxWidth: "94%", display: "block", marginTop: "30px" }}>
          <BulkUpdate currentPmList={this.state.currentPmList} notiref={this.refs.notificationSystem}
            handleHideRequestBulkUpdateModel={this.handleHideRequestBulkUpdateModel}
            pmListDetails={this.props.drpdwnpmListDetails}
            selPOList={this.state.pmListDetails}
            pmRefDetails={this.props.pmRefDetails}
            initPMDashboard={this.initPMDashboard} 
            onVzReviewClick = {this.onVzReviewClick.bind(this)}
            />
        </Modal>
      )}

      {this.state.isGenerateTempClicked && (
        <Modal large={true} handleHideModal={this.handleHideTemplateModel} style={{ width: "80%", maxWidth: "80%", display: "block", marginTop: "30px" }} >
           <GenerateTemplate handleHideTemplateModel={this.handleHideTemplateModel} currentPmList={this.state.currentPmList} 
            pmListDetails={this.props.drpdwnpmListDetails}
            selPOList={this.state.pmListDetails}
            pmRefDetails={this.props.pmRefDetails}
            initPMDashboard={this.initPMDashboard}
            notiref={this.refs.notificationSystem} />
        </Modal>
      )}
      {!!this.props.pmListLoading || this.state.pageLoading ? this.renderLoading() : this.renderTable()}

      <div className="mt-3 float-right">

        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={this.state.pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={this.handlePageClick}
          containerClassName={"pagination"}
          subContainerClassName={"pages pagination"}
          forcePage={this.state.currentPage}
          activeClassName={"active"} />
      </div>
      <NotificationSystem ref="notificationSystem" />
    </div>)
  }
}
function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user.toJS().vendor_id
  let vendorName = user.toJS().vendor_name
  let vendorMgdid = user.toJS().vendor_mdg_id
  let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let buyerListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "buyerListDetails", 'getBuyerList', 'fieldsList'], List()).toJS()
  let drpdwnpmListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()
  let pmGridDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List()).toJS()
  let pmGridDetailsMultiple = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetailsMultiple", 'getPmGridDetails', 'pmlistitems'], List()).toJS()
  let fileData = state.getIn(['PmDashboard', loginId, vendorId, "pm", "fileDetails", "getFileDataForPmlist", "result"], List()).toJS()
  let fileDetailsLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "fileDetailsLoading"])
  let fetchPMListError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmListDetails", 'errors'])
  let fetchPMGridError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmGridDetails", 'errors'])
  let pmListLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmListDetailsLoading"])
  let pmGridLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmGridDetailsLoading"])
  let pmGridDetailsDraftLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmGridDetailsDraftLoading"])
  let pmGridDetailsDraft = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetailsDraft", 'getDraftGridDetails', 'listItems'], List()).toJS()
  let pmgriddetailsDraftMultiple = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetailsDraftMultiple", 'getDraftGridDetails', 'listItems'], List()).toJS()

  let fetchPMGridDraftError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "errorsPmGridDraft", 'errors'])
  let pmRefDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmRefList'], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmRefList'], List()).toJS() : []
  let vzReviewPMlists = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'vzReviewPMlists'], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'vzReviewPMlists'], List()).toJS() : []
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  const realVendorId = realUser.get('vendor_id')
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''
  const notificationDetals = state.getIn(['PmDashboard', realLoginId, realVendorId, "pm", 'BannerDetails']) ? state.getIn(['PmDashboard', realLoginId, realVendorId, "pm", 'BannerDetails'], List()).toJS() : null
  let erpFlag = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails'], Map()).toJS().erpFlag
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;
     
  return {
    user,
    loginId,
    vendorId,
    vendorMgdid,
    market,
    submarket,
    pmGridDetailsDraftLoading,
    pmGridDetailsDraft,
    fetchPMGridDraftError,
    buyerListDetails,
    vzReviewPMlists,
    pmListDetails: columnFilterSelector(state),
    drpdwnpmListDetails,
    pmgriddetailsDraftMultiple,
    pmGridDetails,
    fileData,
    fileDetailsLoading,
    pmGridDetailsMultiple,
    fetchPMListError,
    fetchPMGridError,
    pmListLoading,
    pmGridLoading,
    pmRefDetails,
    vendorName,
    realLoginId,
    realUser,
    ssoUrl,
    isssouser,
    notificationDetals,
    erpFlag,
    esaFlag
  }
}
export default connect(stateToProps, { ...pmActions, ivrEmailNotify })(PMDashboard)