import React, { Component } from 'react'
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Select from 'react-select'
import { List, Map } from "immutable"

import { submitWorkorderRequest, resetProps, submitFixedQuoteInvoice } from "../actions"
import { fetchSiteDetails, getSectorInfo } from "../../sites/actions"
import { fetchSwitchDetails } from "../../Switch/actions"
import { fetchExpenseProjIdData } from "../../PreventiveMaintenance/actions"
import * as formActions from "../../Forms/actions"
import TextField from '@material-ui/core/TextField'

import MessageBox from '../../Forms/components/MessageBox'
import WorkOrderQuoteSubmitFixedPricing from './WorkOrderQuoteSubmitFixedPricing'
import moment from 'moment'
import { Picky } from 'react-picky';
import 'react-picky/dist/picky.css';
import { WOREQUESTPRIORITY, DISASTERRECOVERY } from '../utils'
const formName = "CreateVWORequestForm"
import Loader from '../../Layout/components/Loader'
import Dropzone from 'react-dropzone'
import FileAttachedTable from './FileAttachedTable'
import { fetchGeneratorDetails, fetchHvacDetails, fetchEventsBySiteUnid, fetchGenTankDetails, submitGenReadingsRequest, uploadFilesWO, deleteSavedGenReadMsg, deleteMsg, fetchWOTypes, logActioninDB, submitFilesInvoice } from "../actions"

import isEqual from 'lodash/isEqual'

class CreateWORequest extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      Tech: null, Manager: null, selectedTech: null, selectedDisaster: 'No', selectedManager: null, selectedEvent: null, isGeneratorInfo: false, isHvacInfo: false, inValidFuel: false,
      inValidLaborTotal: false, inValidMaterialTotal: false, inValidQuoteTotal: false, isErrorMessageShown: false, validationMessage: '', isFileSizeError: false, isInvoiceFileSizeError: false,
      isInvoiceRequired: false, isOldWO: false, switchContacts: {}, generatorIndex: null, showSubmitQuote: false, isSubmitQuoteRequired: false, inValiSubmitQuotedFuel: false,
      inValidSubmitQuoteLaborTotal: false, inValidSubmitQuoteMaterialTotal: false, inValidSubmitQuoteTotal: false, disasterEventsDrpdwn: null, expenseProjIdDrpw: null, wbsIdDrpw: null,
      workTypes: [], node_details: [], eNodeBOptions: [], antennaTower: false, eNodeBOptionsSelected: [],sectorSelected:[], sectorInfo: false, sectorOptions: []
    }
    this.aList = List()
    this.invoiceList = List()
    this.submitQuoteFileList = List()
  }

  onAttachRemove(index) {
    this.aList = this.aList.remove(index)
    if (this.aList.size < 1) {
      this.setState({ isFileSizeError: false })
    }
    if (this.aList.size > 0) {
      let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
      if (totalFileSize > 12000000) {
        this.setState({ isFileSizeError: true })
      }
      if (totalFileSize < 12000000) {
        this.setState({ isFileSizeError: false })
      }
    }
    this.forceUpdate()
  }
  onInvoiceRemove(index) {
    this.invoiceList = this.invoiceList.remove(index)
    if (this.invoiceList.size < 1) {
      this.setState({ isInvoiceFileSizeError: false })
    }
    if (this.invoiceList.size > 0) {
      let totalFileSize = this.invoiceList.toJS().reduce((a, b) => +a + +b.file_size, 0)
      if (totalFileSize > 12000000) {
        this.setState({ isInvoiceFileSizeError: true })
      }
      if (totalFileSize < 12000000) {
        this.setState({ isInvoiceFileSizeError: false })
      }
    }
    this.forceUpdate()
  }

  onSubmitQuoteFileRemove(index) {
    this.submitQuoteFileList = this.submitQuoteFileList.remove(index)
    this.forceUpdate()
  }

  onFileDrop = (files) => {
    let { savedMessage, errorsMessage, currentValues } = this.props
    if (savedMessage.size || errorsMessage.size) {
      this.resetInfo()
    }
    this.state.isFileSizeError == false && files.forEach(file => {
      if (file['size'] > 0) {
        var reader = new window.FileReader()
        reader.onload = (function () {
          var dataURL = reader.result
          var droppedFile = {
            filename: file['name'],
            filetype: file['type'],
            file_size: file['size'] + '',
            content: dataURL,
            category: (currentValues.get('priority') && currentValues.get('priority') == 'BID / AVAILABILITY') ? "quote" : "workorder",
            preview: file['preview'],
            last_modified: file['lastModifiedDate'],
          }
          this.aList = this.aList.set(this.aList.size, droppedFile)
          if (this.aList.size > 0) {
            let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
            if (totalFileSize > 12000000) {
              this.setState({ isFileSizeError: true })
            }
            if (totalFileSize < 12000000) {
              this.setState({ isFileSizeError: false })
            }
          }
          this.forceUpdate()
        }).bind(this)
        reader.readAsDataURL(file)
      }
    })
  }

  componentDidMount() {
    let { Unid, type, switchData, loginId, fetchSiteDetails, fetchSwitchDetails, fetchEventsBySiteUnid, fetchGeneratorDetails, fetchHvacDetails, fetchGenTankDetails, deleteSavedGenReadMsg, user, fetchExpenseProjIdData, vendorId, sub_market } = this.props
    this.aList = this.aList.clear()
    fetchEventsBySiteUnid(loginId, Unid).then(action => {
      let disasterEvents = []
      if (action && action.events && action.events.getEventsBySiteUnid && action.events.getEventsBySiteUnid.data.length > 0) {
        disasterEvents = action.events.getEventsBySiteUnid.data
        disasterEvents = disasterEvents.map(data => {
          return { name: "disaster_events", label: data.eventName, value: data.eventName, selectedEvent: data }
        })
      }
      this.setState({ disasterEventsDrpdwn: disasterEvents })
    })
    deleteSavedGenReadMsg()
    this.invoiceList = this.invoiceList.clear()
    this.submitQuoteFileList = this.submitQuoteFileList.clear()
    let managerId = null
    if (type == 'Site') {
      fetchSiteDetails(loginId, Unid).then((action) => {
        let contacts = action.site.contacts, Tech, Manager
        managerId = action.site.managerid
        this.setState({ node_details: action.site && action.site.node_details })
        fetchExpenseProjIdData(vendorId, loginId, sub_market, managerId).then((action) => {
          let expProjIds = []
          let wbsIds = []
          if (action && action.expenseProjId && action.expenseProjId.getExpenseProjIdData
            && action.expenseProjId.getExpenseProjIdData.expenseProjIdData &&
            action.expenseProjId.getExpenseProjIdData.expenseProjIdData.length > 0) {
            expProjIds = action.expenseProjId.getExpenseProjIdData.expenseProjIdData
            expProjIds = expProjIds.map(data => {
              return { name: "exp_market_proj_id", label: data, value: data, mgrId: managerId }
            })

          }
          if (action && action.expenseProjId && action.expenseProjId.getExpenseProjIdData
            && action.expenseProjId.getExpenseProjIdData.wbscodes &&
            action.expenseProjId.getExpenseProjIdData.wbscodes.length > 0) {
            wbsIds = action.expenseProjId.getExpenseProjIdData.wbscodes
            if( wbsIds.length == 1 ){
              this.setValue("wbs_id", wbsIds[0])
           }
           wbsIds =  wbsIds.map(data => {
             return {name: "wbs_id", label: data, value: data, mgrId: managerId}
           })

          }

          this.setState({wbsIdDrpw: wbsIds, expenseProjIdDrpw: expProjIds})

        })
        for (let iterator = 0; iterator < contacts.length; iterator++) {
          switch (contacts[iterator].role) {
            case 'Site Technician':
              Tech = contacts[iterator]
              Tech.techid = action.site.techid
              break
            case 'Site Manager':
              Manager = contacts[iterator]
              break
          }
        }
        this.setState({ Manager, Tech })
        this.resetInfo()
        this.initForm()
      })
    }
    if (type == 'Switch') {
      fetchSwitchDetails(loginId, Unid).then((action) => {
        if (action.type == 'FETCH_SWITCHDETAILS_SUCCESS') {
          let switchContactsData = action.switch.contacts
          let mgrs = []
          let techs = []
          if (switchContactsData.length > 0) {
            mgrs = switchContactsData.filter(contact => contact.role == 'Switch Manager')

            techs = switchContactsData.filter(contact => (contact.role == 'Switch Technician' ||  contact.role == 'Switch Manager'))
            let techsManagerIds = techs.map(i => i.mgr_id)
            let managermgrIds = mgrs.map(i => i.mgr_id)

            mgrs = mgrs.filter(v => techsManagerIds.includes(v.mgr_id))
            techs = techs.filter(v => managermgrIds.includes(v.mgr_id))
            techs = techs.map(data => {
              return { label: data.name, value: data.name, ...data }
            })

            mgrs = mgrs.map(data => {
              return { label: data.name, value: data.name, ...data }
            })


          }
          var Manager = switchContactsData.find(contact => contact.role == 'Switch Manager')
          managerId = Manager.mgr_id
          fetchExpenseProjIdData(vendorId, loginId, sub_market, managerId).then((action) => {
            let expProjIds = []
            let wbsIds = []
            if (action && action.expenseProjId && action.expenseProjId.getExpenseProjIdData
              && action.expenseProjId.getExpenseProjIdData.expenseProjIdData &&
              action.expenseProjId.getExpenseProjIdData.expenseProjIdData.length > 0) {
              expProjIds = action.expenseProjId.getExpenseProjIdData.expenseProjIdData
              expProjIds = expProjIds.map(data => {
                return { name: "exp_market_proj_id", label: data, value: data, mgrId: managerId }
              })

            }
            if (action && action.expenseProjId && action.expenseProjId.getExpenseProjIdData
              && action.expenseProjId.getExpenseProjIdData.wbscodes &&
              action.expenseProjId.getExpenseProjIdData.wbscodes.length > 0) {
              wbsIds = action.expenseProjId.getExpenseProjIdData.wbscodes
              if( wbsIds.length == 1 ){
                this.setValue("wbs_id", wbsIds[0])
             }
             wbsIds =  wbsIds.map(data => {
               return {name: "wbs_id", label: data, value: data, mgrId: managerId}
             })

            }

            this.setState({wbsIdDrpw: wbsIds, expenseProjIdDrpw: expProjIds})
          })
          let Tech = !!switchContactsData && switchContactsData.filter(sc => sc.mgr_id === Manager.mgr_id).length > 0 && !!switchContactsData.filter(sc => sc.mgr_id === Manager.mgr_id).find(contact => contact.role == 'Switch Technician') ? switchContactsData.filter(sc => sc.mgr_id === Manager.mgr_id).find(contact => contact.role == 'Switch Technician') : ''
          let switchContacts = { mgrs, techs }
          this.setState({ Manager, Tech, switchContacts })
          this.resetInfo()
          this.initForm()
        }
      })
    }
    fetchGeneratorDetails(Unid, type.toUpperCase()).then((action) => {
      if (action.type === 'FETCH_GENERATORDETAILS_SUCCESS') {
        this.setState({ isGeneratorInfo: true })
      }
    })
    fetchGenTankDetails(Unid).then((action) => {
      if (action.type === 'FETCH_GENTANKDETAILS_SUCCESS') {
        this.setState({ isGeneratorInfo: true })
      }
    })
    fetchHvacDetails(Unid, type.toUpperCase()).then((action) => {
      if (action.type === 'FETCH_HVACDETAILS_SUCCESS') {
        this.setState({ isHvacInfo: true })
      }
    })

    fetchWOTypes(this.props.loginId).then(res => {
      const workTypes = []
      res.data.getWorkTypes.types.forEach(type => {
        if (type.value !== 'Walking/Working Surfaces' && type.value !== 'ECOVA-FUEL') {
          workTypes.push({
            ...type,
            name: 'work_type'
          })
        }
      })
      this.setState({
        workTypes
      })
    })

  }


  componentDidUpdate(prevProps){
    if (!(isEqual(this.props.currentValues, prevProps.currentValues)) && !(isEqual(this.state.lastCreatedWOObj, prevProps.currentValues.toJS()))) {
      this.setState({ isOldWO: false })
    }

  }

  initForm = () => {
    let { Manager, Tech } = this.state
    let { setInitialValues, Unid, user, techsbysubmarket, type, expenseProjId } = this.props
    this.aList = this.aList.clear()
    this.invoiceList = this.invoiceList.clear()
    this.submitQuoteFileList = this.submitQuoteFileList.clear()
    setInitialValues(formName, {
      "requested_by": Tech.name,
      "requested_date": moment.utc().format("YYYY-MM-DD HH:mm:ss"),
      "requestor_title": '',
      "requestor_email": Tech.email,
      "requestor_phone": Tech.phone,

      "acct_contact": "",
      "acct_email": "",

      "exp_market_proj_id": '',
      "wbs_id":'',
      "mgr_email": Manager.email,
      "site_type": type.toUpperCase(),
      "site_key": Unid,
      "priority": '',
      "work_type": '',
      "work_scope": "",
      "eng_review_required": "0",
      "bypass_approval": "0",
      "cfd_workorder_lines": 1,
      "cfd_quote_vendorid_1": user.get('vendor_id'),
      "cfd_quote_vendorname_1": user.get('vendor_name'),
      "cfd_quote_vendoremail_1": user.get('email'),
      "cfd_quote_status_1": "PENDING_WOAPPROVAL",
      "work_award_date": "",
      "work_due_date": "",
      "finance_type": "EXPENSE",
      "peoplesoft_proj_id": "",
      "po_number": "",
      "created_by_vendor_userid": user.get('userid'),
      "created_by_vendor_id": user.get('vendor_id'),
      "actual_total": "0.00",
      "actual_materials_total": "0.00",
      "actual_fuel_total": "0.00",
      "actual_labor_total": "0.00",
      "current_fuel_level_0": 0.00,

      "switch_Generator": '',
      "switch_Hvac": '',
      "manager_selected": Manager.name,
      "source_system": "vendorportal",
      "submitQuote_actual_total": "0.00",
      "submitQuote_actual_materials_total": "0.00",
      "submitQuote_actual_fuel_total": "0.00",
      "submitQuote_actual_labor_total": "0.00",
    })
    let TechUserId = ''
    if (techsbysubmarket && type == 'Site') {
      let TechData = techsbysubmarket.toJS()
      for (let i = 0; i < TechData.length; i++) {
        if ((Tech.techid && Tech.techid.toLowerCase()) == (TechData[i].userid && TechData[i].userid.toLowerCase())) { TechUserId = TechData[i].userid }
      }
    }
    TechUserId = type == 'Site' ? TechUserId : Tech.tech_id
    this.setState({
      selectedTech: { name: Tech.name, phone: Tech.phone, email: Tech.email, userid: TechUserId },
      selectedManager: { name: Manager.name, phone: Manager.phone, email: Manager.email }
    })
  }


  setValue(field, value) {
    this.props.setValue(formName, field, value)
  }



  onDataChange = (e) => {
    let { savedMessage, errorsMessage, currentValues } = this.props
    if (savedMessage.size || errorsMessage.size) {
      this.resetInfo('change')
    }
    if (e && e.target) {
      this.setValue(e.target.name, e.target.value)
    } else {
      if (e && e.name === "requested_by") {
        this.setState({ selectedTech: { name: e.value, phone: e.phone, email: e.email, userid: e.userid } })
      }
      if (e && e.name === "disaster") {
        this.setState({ selectedDisaster: e.value })
      }
      if (e && e.name === "disaster_events") {
        this.setState({ selectedEvent: { eventName: e.value, productCode: e.selectedEvent.productCode } })
      }
      if (e && e.name === "manager_selected") {
        this.setState({ selectedManager: { name: e.value, phone: e.phone, email: e.email } })
      }
      // if(e && e.name === "wbs_id"){
      //   let wbs_codes = this.state.wbsIdDrpw
      //   let val = e.value && e.value.substring(13)
      //   let wbsVal = wbs_codes.find(d => d.value && d.value.substring(14).includes(val))
      //   this.setState({wbscodeVal : wbsVal})

      // }
      // if (e && e.name == "work_type") {
      //   if (e.value && e.value.toLowerCase().includes("antenna") && e.value.toLowerCase().includes("tower")) {
      //     this.setState({ antennaTower: true })
      //     let eNodeBOptions = this.state.node_details.map(item => {
      //       let nodeObj = {
      //         ...item,
      //         label: `${item.node} - ${item.vendor}`,
      //         value: item.node
      //       }
      //       return nodeObj;
      //     })
      //     this.setState({ eNodeBOptions: eNodeBOptions })
      //   }
      //   else {
      //     this.setState({ antennaTower: false })
      //   }
      // }
      if (e && (e.name == 'priority')) {
        const showSubmitQuote = (e.name == 'priority') ? e.value : false
        this.setState({ showSubmitQuote, isSubmitQuoteRequired: showSubmitQuote })
        if ((e.name == 'priority' && e.value == 'EMERGENCY')) {
          this.setState({ isInvoiceRequired: true })
        }
      }
      this.resetGeneratorFormValues(e)
      this.setValue(e.name, e.value)
    }
  }

  resetGeneratorFormValues = (e, clearAll = false) => {

    let { type, currentValues, generatorInfo, genTankInfo } = this.props
    generatorInfo = generatorInfo.toJS()
    let fuelTanks = 0
    if (clearAll) {
      this.setValue('switch_Generator', '')
      this.setValue('switch_Hvac', '')
      let presentValuesIndex = this.state.generatorIndex
      if (generatorInfo && generatorInfo.length > 0) {
        for (let i = 0; i < generatorInfo.length; i++) {
          fuelTanks = 0
          if (i == presentValuesIndex) {
            let currentValuesList = currentValues.toJS()
            Object.keys(currentValuesList).forEach(key => {
              if ((key).indexOf('totalruntime_' + i) > -1) {
                this.setValue(key, '')
              }
              if ((key).indexOf('current_fuel_level_' + i) > -1) {
                this.setValue(key, '')
              }
              if ((key).indexOf('fuel_level_' + i) > -1) {
                this.setValue(key, '')
              }
              if ((key).indexOf('fuel_gallonsadded_' + i) > -1) {
                this.setValue(key, '')
              }
            })
          }
        }
      }
    }
    if (e && e.name == 'switch_Generator' && !clearAll) {
      let previousValue = currentValues.get('switch_Generator') ? currentValues.get('switch_Generator').split('_')[1] : null
      let presentValue = e.value.split('_')[1]
      let genTkInfo = genTankInfo.toJS()
      let fuelTanks = 0

      if (generatorInfo && generatorInfo.length > 0) {
        for (let i = 0; i < generatorInfo.length; i++) {
          fuelTanks = 0

          if (generatorInfo[i].gen_serial_no == previousValue) {
            let currentValuesList = currentValues.toJS()
            Object.keys(currentValuesList).forEach(key => {
              if ((key).indexOf('totalruntime_' + i) > -1) {
                this.setValue(key, '')
              }
              if ((key).indexOf('current_fuel_level_' + i) > -1) {
                this.setValue(key, '')
              }
              if ((key).indexOf('fuel_level_' + i) > -1) {
                this.setValue(key, '')
              }
              if ((key).indexOf('fuel_gallonsadded_' + i) > -1) {
                this.setValue(key, '')
              }
            })
          }

          if (generatorInfo[i].gen_serial_no == presentValue) {
            if (!currentValues.get("totalruntime_" + i)) {
              this.setValue("totalruntime_" + i, '')
              this.setValue("current_fuel_level_" + i, '')
            }
            if (!currentValues.get("current_fuel_level_" + i)) {
              this.setValue("current_fuel_level_" + i, '')
            }

            if (genTkInfo && genTkInfo.length > 0) {
              for (let j = 0; j < genTkInfo.length; j++) {
                if (generatorInfo[i].generator_id == genTkInfo[j].gen_emis_id) {
                  if (genTkInfo[j].tank1_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
                  if (genTkInfo[j].tank2_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
                  if (genTkInfo[j].tank3_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
                  if (genTkInfo[j].tank4_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
                }
              }
            }
            if (fuelTanks > 0) {
              for (let k = 0; k < fuelTanks; k++) {
                if (!currentValues.get("fuel_level_" + i + "_" + k)) {
                  this.setValue("fuel_level_" + i + "_" + k, '')
                }
                if (!currentValues.get("fuel_gallonsadded_" + i + "_" + k)) {
                  this.setValue("fuel_gallonsadded_" + i + "_" + k, '')
                }
              }
            }
          }

        }
      }
    }
  }

  onChangeRequestor = (e) => {
    if (e && e.name && this.props.type == 'Site') {
      this.setState({ selectedTech: { name: e.value, phone: e.phone, email: e.email, userid: e.userid } })
      this.setValue("requested_by", e.value)

    }
    if (e && e.name && this.props.type == 'Switch') {
      this.setState({ selectedTech: { name: e.value, phone: e.phone, email: e.email, userid: e.tech_id ? e.tech_id : e.mgr_id} })
      this.setValue("requested_by", e.value)
      let mgrId = (!!this.state.switchContacts && !!this.state.switchContacts.techs) ? this.state.switchContacts.techs.filter(sc => sc.label === e.value)[0].mgr_id : ''
      let mgrName = (!!this.state.switchContacts && !!this.state.switchContacts.techs && this.state.switchContacts.mgrs.filter(sc => sc.mgr_id === mgrId).length > 0) ? this.state.switchContacts.mgrs.filter(sc => sc.mgr_id === mgrId)[0].label : ''

      let mgrEmail = (!!this.state.switchContacts && !!this.state.switchContacts.techs && this.state.switchContacts.mgrs.filter(sc => sc.mgr_id === mgrId).length > 0) ? this.state.switchContacts.mgrs.filter(sc => sc.mgr_id === mgrId)[0].email : ''

      let mgrPhone = (!!this.state.switchContacts && !!this.state.switchContacts.techs && this.state.switchContacts.mgrs.filter(sc => sc.mgr_id === mgrId).length > 0) ? this.state.switchContacts.mgrs.filter(sc => sc.mgr_id === mgrId)[0].phone : ''

      if (this.state.wbsIdDrpw && this.state.wbsIdDrpw.length > 0 && mgrId && this.state.wbsIdDrpw[0].mgrId != mgrId) {
        this.props.fetchExpenseProjIdData(this.props.vendorId, this.props.loginId, this.props.sub_market, mgrId).then((action) => {
          let expProjIds = []
          let wbsIds = []
          if (action && action.expenseProjId && action.expenseProjId.getExpenseProjIdData
            && action.expenseProjId.getExpenseProjIdData.expenseProjIdData &&
            action.expenseProjId.getExpenseProjIdData.expenseProjIdData.length > 0) {
            expProjIds = action.expenseProjId.getExpenseProjIdData.expenseProjIdData
            expProjIds = expProjIds.map(data => {
              return { name: "exp_market_proj_id", label: data, value: data, mgrId: mgrId }
            })

          }
          if (action && action.expenseProjId && action.expenseProjId.getExpenseProjIdData
            && action.expenseProjId.getExpenseProjIdData.wbscodes &&
            action.expenseProjId.getExpenseProjIdData.wbscodes.length > 0) {
            wbsIds = action.expenseProjId.getExpenseProjIdData.wbscodes
            if( wbsIds.length == 1 ){
               this.setValue("wbs_id", wbsIds[0])
            }
            wbsIds =  wbsIds.map(data => {
              return {name: "wbs_id", label: data, value: data, mgrId: mgrId}
            })
           


          }

          this.setState({wbsIdDrpw: wbsIds, expenseProjIdDrpw: expProjIds})


        })
      }
      this.setValue("exp_market_proj_id", '')
      if(this.state.wbsIdDrpw && this.state.wbsIdDrpw.length != 1){
      this.setValue("wbs_id", '')
      }
      this.setState({wbscodeVal : ''})
      this.setValue("manager_selected", mgrName)

      this.setState({ selectedManager: { name: mgrName, phone: mgrPhone, email: mgrEmail }, Manager: { name: mgrName, phone: mgrPhone, email: mgrEmail } })


    }
  }

  onChangeManager = (e) => {
    if (e && e.name && this.props.type == 'Switch') {
      this.setState({ selectedManager: { name: e.value, phone: e.phone, email: e.email }, Manager: { name: e.value, phone: e.phone, email: e.email } })
      let mgrId = (!!this.state.switchContacts && !!this.state.switchContacts.mgrs) ? this.state.switchContacts.mgrs.filter(sc => sc.label === e.value)[0].mgr_id : ''
      let techName = (!!this.state.switchContacts && !!this.state.switchContacts.techs && this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId).length > 0) ? this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId)[0].label : ''

      let techEmail = (!!this.state.switchContacts && !!this.state.switchContacts.techs && this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId).length > 0) ? this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId)[0].email : ''

      let techPhone = (!!this.state.switchContacts && !!this.state.switchContacts.techs && this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId).length > 0) ? this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId)[0].phone : ''

      let techId = (!!this.state.switchContacts && !!this.state.switchContacts.techs && this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId).length > 0) ? this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId)[0].tech_id : ''

      let mgr_id = (!!this.state.switchContacts && !!this.state.switchContacts.techs && this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId).length > 0) ? this.state.switchContacts.techs.filter(sc => sc.mgr_id === mgrId)[0].mgr_id : ''
     
      if (this.state.wbsIdDrpw && this.state.wbsIdDrpw.length > 0 && e && e.mgr_id && this.state.wbsIdDrpw[0].mgrId != e.mgr_id) {
        this.props.fetchExpenseProjIdData(this.props.vendorId, this.props.loginId, this.props.sub_market, e.mgr_id).then((action) => {
          let expProjIds = []
          let wbsIds = []
          if (action && action.expenseProjId && action.expenseProjId.getExpenseProjIdData
            && action.expenseProjId.getExpenseProjIdData.expenseProjIdData &&
            action.expenseProjId.getExpenseProjIdData.expenseProjIdData.length > 0) {
            expProjIds = action.expenseProjId.getExpenseProjIdData.expenseProjIdData
            expProjIds = expProjIds.map(data => {
              return { name: "exp_market_proj_id", label: data, value: data, mgrId: e.mgr_id }
            })

          }
          if (action && action.expenseProjId && action.expenseProjId.getExpenseProjIdData
            && action.expenseProjId.getExpenseProjIdData.wbscodes &&
            action.expenseProjId.getExpenseProjIdData.wbscodes.length > 0) {
            wbsIds = action.expenseProjId.getExpenseProjIdData.wbscodes
            if( wbsIds.length == 1 ){
              this.setValue("wbs_id", wbsIds[0])
           }
           wbsIds =  wbsIds.map(data => {
             return {name: "wbs_id", label: data, value: data, mgrId: e.mgr_id }
           })

          }
          this.setState({wbsIdDrpw: wbsIds, expenseProjIdDrpw: expProjIds})
        })
      }
      this.setValue("exp_market_proj_id", '')
      if(this.state.wbsIdDrpw && this.state.wbsIdDrpw.length != 1){
        this.setValue("wbs_id", '')
        }
      this.setValue("manager_selected", e.value)
      this.setValue("requested_by", techName)
      this.setState({ selectedTech: { name: techName, phone: techPhone, email: techEmail, userid: techId || mgr_id} })

    }
  }

  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )
  }

  resetInfo = (condition) => {
    let { resetProps, loginId, deleteSavedGenReadMsg, deleteMsg } = this.props
    resetProps([loginId, "workOrdersrequest"], { isloading: false, inValidSubmitQuoteFuel: false, inValidSubmitQuoteLaborTotal: false, inValidSubmitQuoteMaterialTotal: false, inValidSubmitQuoteTotal: false, inValidFuel: false, inValidLaborTotal: false, inValidMaterialTotal: false, inValidQuoteTotal: false, validationMessage: '', isSubmitQuoteRequired: false, isInvoiceRequired: false })
    this.setState({ isErrorMessageShown: false })
    if (condition !== 'change') {
      this.initForm()
    }
    deleteSavedGenReadMsg()
    deleteMsg(loginId)
  }

  validateFuelLevel(name, fuelgal) {
    function IsInRange(number) {
      return number > 0 && number <= 100
    }
    if (fuelgal && fuelgal.length > 0 && !(isNaN(fuelgal)) && IsInRange(fuelgal)) {
      this.setState({ isErrorMessageShown: false })
      this.setValue(name, fuelgal)
    } else if (fuelgal && fuelgal.length == 0) {
      this.setState({ isErrorMessageShown: false })
      this.setValue(name, fuelgal)
    } else {
      this.setState({ validationMessage: 'Please enter a Fuel Level Percentage between 0 and 100!', isErrorMessageShown: true })
      this.setValue(name, '')
    }
  }

  validatefuelGallonsAndRuntime(name, fuelgal, fieldname) {
    if (fuelgal && fuelgal.length > 0 && !(isNaN(fuelgal))) {
      this.setState({ isErrorMessageShown: false })
      this.setValue(name, fuelgal)
    } else if (fuelgal && fuelgal.length == 0) {
      this.setState({ isErrorMessageShown: false })
      this.setValue(name, fuelgal)
    } else {
      if (fieldname == "totalruntime") {
        this.setState({ validationMessage: 'Please enter a valid Run time!', isErrorMessageShown: true })
        this.setValue(name, '')
      }
      if (fieldname == "fuel_gallonsadded") {
        this.setState({ validationMessage: 'Please enter a valid Fuel value in gallons!', isErrorMessageShown: true })
        this.setValue(name, '')
      }
    }
  }
  formFilesPostRequest = (fileData) => {
    return fileData.map(fd => {
      let file_name = fd.filename.split('.')[0]
      return {
        "data": fd.content,
        "description": `${file_name} uploaded from VP UI for Work Orders`,
        "size": fd.file_size,
        "name": fd.filename
      }
    })
  }

  getFixedFlag() {
    const { user } = this.props;
    const antennaTowerPricingMatrixFlag = user && user.get('vendor_pricing_macro_ant_tow');
    const smallCellPricingMatrixFlag = user && user.get('vendor_pricing_small_cell');
    if(antennaTowerPricingMatrixFlag == '1' || smallCellPricingMatrixFlag == '1') {
      return true;
    }
    return false;
  }


  onSubmit = (submitReq, files) => {
    let { vendorId, config, loginId, submitWorkorderRequest, submitGenReadingsRequest, uploadFilesWO, type, submitFixedQuoteInvoice, groupVendors, user, site } = this.props
    let self = this
    let routeToIop = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ROUTE_OPS_TO_IOP").ATTRIBUTE_VALUE;
    let { selectedTech, selectedManager, selectedEvent, selectedDisaster, showSubmitQuote } = this.state
    let invoiceInput = {}
    let isInvoice = false
    let isGenReq = false
    let readings = []
    let readingsObj = {}
    let genTankReadingInput = {}
    let values = this.props.currentValues.toJS()
    let lastCreatedWOObj = values
    this.setState({ lastCreatedWOObj: lastCreatedWOObj })
    values.files = this.aList.toJS()
    let invoiceFiles = this.invoiceList.toJS()
    values.invoiceFiles = invoiceFiles
    let submitQuoteFiles = this.submitQuoteFileList.toJS()
    let groupVendorsJs = groupVendors ? groupVendors.toJS() : []
    let fixedFlag = this.getFixedFlag()


    values.submitQuoteFiles = submitQuoteFiles
    values.work_scope = `THIS WORK REQUEST HAS BEEN REQUESTED BY THE VENDOR : ${values.work_scope}`
    values.requestor_title = 'Vendor Work Request'
    values.requestor_email = selectedTech ? selectedTech.email : values.requestor_email
    values.requestor_phone = selectedTech ? selectedTech.phone : values.requestor_phone
    values.requested_by = selectedTech ? selectedTech.userid : values.requested_by
    let submitworeq = {}
    submitworeq["requested_by"] = values.requested_by
    submitworeq["requested_date"] = values.requested_date
    submitworeq["requestor_title"] = values.requestor_title
    submitworeq["requestor_email"] = values.requestor_email
    submitworeq["requestor_email"] = values.requestor_email
    submitworeq["requestor_phone"] = values.requestor_phone
    submitworeq["acct_contact"] = values.acct_contact
    submitworeq["acct_email"] = values.acct_email
    submitworeq["exp_market_proj_id"] = ''
    submitworeq["wbs_id"] = values.wbs_id
    submitworeq["mgr_email"] = selectedManager ? selectedManager.email : values.mgr_email
    submitworeq["site_type"] = values.site_type
    submitworeq["site_key"] = values.site_key
    submitworeq["priority"] = values.priority
    submitworeq["work_type"] = values.work_type
    submitworeq["work_scope"] = values.work_scope
    submitworeq["eng_review_required"] = values.eng_review_required
    submitworeq["bypass_approval"] = values.bypass_approval
    submitworeq["cfd_workorder_lines"] = values.cfd_workorder_lines
    submitworeq["cfd_quote_vendorid_1"] = values.cfd_quote_vendorid_1
    submitworeq["cfd_quote_vendorname_1"] = values.cfd_quote_vendorname_1
    submitworeq["cfd_quote_vendoremail_1"] = values.cfd_quote_vendoremail_1
    submitworeq["cfd_quote_status_1"] = values.cfd_quote_status_1
    submitworeq["work_award_date"] = values.work_award_date
    submitworeq["work_due_date"] = values.work_due_date
    submitworeq["finance_type"] = values.finance_type
    submitworeq["peoplesoft_proj_id"] = values.peoplesoft_proj_id
    submitworeq["po_number"] = values.po_number
    submitworeq["created_by_vendor_userid"] = values.created_by_vendor_userid
    submitworeq["created_by_vendor_id"] = values.created_by_vendor_id
    submitworeq["source_system"] = values.source_system
    submitworeq["pricing_matrix_eligible"] = fixedFlag ? (values?.work_type?.toLowerCase()?.includes("antenna") || values?.work_type?.toLowerCase()?.includes("small cell")) ?  true : false : false
    submitworeq["disaster_recovery"] = selectedDisaster && selectedDisaster == "Yes" ? 1 : 0
    submitworeq["company_code"] = site && site.toJS().company_code ? site.toJS().company_code : ''

    if (selectedDisaster && selectedDisaster == "Yes") {
      submitworeq["event_name"] = selectedEvent ? selectedEvent.eventName : ''
      submitworeq["product_code"] = selectedEvent ? selectedEvent.productCode : ''
    }
  if(values?.work_type?.toLowerCase() == 'vandalism'){
    submitworeq["police_report_filed"] = '0'
    submitworeq["leak_present"] = '0'
    submitworeq["evn_hotline_called"] = '0'
  }
    if (submitReq.updateReqBody && submitReq.updateReqBody.data && submitReq.updateReqBody.data.lineitems && submitReq.updateReqBody.data.lineitems.find(v => v.cost_type)) { submitworeq["pricing_matrix_cost_type"] = submitReq.updateReqBody.data.lineitems.find(v => v.cost_type).cost_type }
    submitworeq["files"] = values.files
    let genInfo = this.props.generatorInfo.toJS()
    let fuelInfo = this.props.genTankInfo.toJS()
    let genValues = this.props.currentValues
    let fuel_type = ''
    let pm_unid = this.randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
    if (values.work_type && values.priority && (values.work_type == 'Generator' || values.work_type == 'ENGIE-FUEL')) {
      if (genInfo && genInfo.length > 0) {
        for (let i = 0; i < genInfo.length; i++) {
          let odoreading = "totalruntime_" + i
          let current_fuel_level = "current_fuel_level_" + i
          let fuelLevel1 = "fuel_level_" + i + "_" + 0
          let fuelLevel2 = "fuel_level_" + i + "_" + 1
          let fuelLevel3 = "fuel_level_" + i + "_" + 2
          let fuelLevel4 = "fuel_level_" + i + "_" + 3
          let fuelgallonsadded1 = "fuel_gallonsadded_" + i + "_" + 0
          let fuelgallonsadded2 = "fuel_gallonsadded_" + i + "_" + 1
          let fuelgallonsadded3 = "fuel_gallonsadded_" + i + "_" + 2
          let fuelgallonsadded4 = "fuel_gallonsadded_" + i + "_" + 3
          if (genInfo[i].gen_spec && genInfo[i].gen_spec.fuel_type) {
            switch (genInfo[i].gen_spec.fuel_type) {
              case "Diesel":
                fuel_type = "1"
                break
              case "Dual":
                fuel_type = "2"
                break
              case "NG":
                fuel_type = "3"
                break
              case "Propane":
                fuel_type = "4"
                break
              case "Unlead":
                fuel_type = "5"
                break
              default:
                fuel_type = "6"
                break
            }
          }
          submitworeq["fuel_type"] = fuel_type
          if (genValues.get(current_fuel_level) != undefined && genValues.get(current_fuel_level) > 0) {
            submitworeq["current_fuel_level"] = (genValues.get(current_fuel_level) / 100).toFixed(2)
          }
          else {
            submitworeq["current_fuel_level"] = (0.1).toFixed(2)
          }

          if (genValues.get(odoreading) > 0 || genValues.get(fuelLevel1) > 0 || genValues.get(fuelLevel2) > 0 || genValues.get(fuelLevel3) > 0
            || genValues.get(fuelLevel4) > 0 || genValues.get(fuelgallonsadded1) > 0 || genValues.get(fuelgallonsadded2) > 0
            || genValues.get(fuelgallonsadded3) > 0 || genValues.get(fuelgallonsadded4) > 0) {
            submitworeq["bypass_approval"] = "1"
            submitworeq["cfd_quote_status_1"] = "COMPLETED"
            isGenReq = true
            if (genValues.get(odoreading) != undefined) { readingsObj.totalruntime = genValues.get(odoreading) } else { readingsObj.totalruntime = "" }
            if (genValues.get(fuelLevel1) != undefined) { readingsObj.fuel_level1 = (genValues.get(fuelLevel1) / 100).toFixed(2) } else { readingsObj.fuel_level1 = "" }
            if (genValues.get(fuelgallonsadded1) != undefined) { readingsObj.fuel_gallonsadded1 = genValues.get(fuelgallonsadded1) } else { readingsObj.fuel_gallonsadded1 = "" }
            if (genValues.get(fuelLevel2) != undefined) { readingsObj.fuel_level2 = (genValues.get(fuelLevel2) / 100).toFixed(2) } else { readingsObj.fuel_level2 = "" }
            if (genValues.get(fuelgallonsadded2) != undefined) { readingsObj.fuel_gallonsadded2 = genValues.get(fuelgallonsadded2) } else { readingsObj.fuel_gallonsadded2 = "" }
            if (genValues.get(fuelLevel3) != undefined) { readingsObj.fuel_level3 = (genValues.get(fuelLevel3) / 100).toFixed(2) } else { readingsObj.fuel_level3 = "" }
            if (genValues.get(fuelgallonsadded3) != undefined) { readingsObj.fuel_gallonsadded3 = genValues.get(fuelgallonsadded3) } else { readingsObj.fuel_gallonsadded3 = "" }
            if (genValues.get(fuelLevel4) != undefined) { readingsObj.fuel_level4 = (genValues.get(fuelLevel4) / 100).toFixed(2) } else { readingsObj.fuel_level4 = "" }
            if (genValues.get(fuelgallonsadded4) != undefined) { readingsObj.fuel_gallonsadded4 = genValues.get(fuelgallonsadded4) } else { readingsObj.fuel_gallonsadded4 = "" }
          }
          if (genValues.get(fuelLevel1) > 0 || genValues.get(fuelLevel2) > 0 || genValues.get(fuelLevel3) > 0
            || genValues.get(fuelLevel4) > 0 || genValues.get(fuelgallonsadded1) > 0 ||
            genValues.get(fuelgallonsadded2) > 0 || genValues.get(fuelgallonsadded3) > 0 || genValues.get(fuelgallonsadded4) > 0) {
            isInvoice = true
            submitworeq["work_order_status"] = "WORKCOMPLETE"
          }
          // if (values.work_type == 'Generator Repair' || values.work_type == 'Generator') {
          //   submitworeq["bypass_approval"] = "0"
          //   submitworeq["cfd_quote_status_1"] = "PENDING_WOAPPROVAL"
          //   isInvoice = false
          // }
          if (fuelInfo && fuelInfo.length) {
            for (let j = 0; j < fuelInfo.length; j++) {
              let selectedSerial = genValues.get('switch_Generator') ? genValues.get('switch_Generator').split('_')[1] : null
              if (selectedSerial && fuelInfo[j].serialnum == selectedSerial) {
                readingsObj.gen_meta_universalid = fuelInfo[j].gen_meta_universalid
                readingsObj.gen_emis_id = fuelInfo[j].gen_emis_id
              }

            }
            let selectedSerial = genValues.get('switch_Generator') ? genValues.get('switch_Generator').split('_')[1] : null
            if (selectedSerial && genInfo[i].gen_serial_no == selectedSerial) {
              readings.push(readingsObj)
            }
          }


        }
        genTankReadingInput["source_sys"] = "iopvendorportal"
        genTankReadingInput["source_unid"] = pm_unid
        genTankReadingInput["readings"] = readings
      }
      if(genInfo && genInfo.length == 0){
        submitworeq["fuel_type"] = "1";
        submitworeq["current_fuel_level"] = "0.00"
      }



    }
    if (values.priority == 'DIRECT AWARD') {
      isInvoice = true
      submitworeq["bypass_approval"] = "1"
      submitworeq["cfd_quote_status_1"] = "COMPLETED"
      submitworeq["work_order_status"] = "WORKCOMPLETE"
    }

    if (isInvoice) {


      invoiceInput = {
        vendor_id: values.created_by_vendor_id,
        invoicetotal: values.actual_total,
        invoicematerials: values.actual_materials_total,
        invoicelabor: values.actual_labor_total,
        invoicegenfuel: values.actual_fuel_total,
        invoicecomments: values.invoice_vendor_comments,
        vendor_invoice_num: values.vendor_invoice_num,
        disaster_recovery: this.state.selectedDisaster && this.state.selectedDisaster == "Yes" ? 1 : 0
      }
    }
    if (submitworeq && submitworeq.cfd_quote_status_1 && submitworeq.cfd_quote_status_1 != "COMPLETED") {
      submitworeq["work_order_status"] = "PENDINGAPPROVAL"
    }
    if (showSubmitQuote && values.priority == 'BID / AVAILABILITY') {
      let submitQuote = {
        "cfd_quote_status_1": "QUOTERECEIVED",
        "cfd_quote_replydate_1": ""
      }
      submitworeq = { ...submitworeq, ...submitQuote }
    }
    submitWorkorderRequest(loginId, submitworeq).then((action) => {
      invoiceInput["meta_universalid"] = action.savedMessage.quote_unid
      if (action.type === 'SUBMIT_WORKORDER_REQUEST_SUCCESS') {
        let workorder_id = action && action.savedMessage && action.savedMessage.workorder_id

        if (values.priority && action.savedMessage.quote_unid) {
          submitFixedQuoteInvoice(vendorId, loginId, action.savedMessage.quote_unid, values.priority == 'BID / AVAILABILITY' ? 'rfqreply' : 'COMPLETE', submitReq).then(action => {
            if (action.type == 'SUBMIT_FPQUOTE_SUCCESS') {
              logActioninDB(loginId, this.props.user && this.props.user.get('email'), vendorId, workorder_id, this.props.user && this.props.user.get('vendor_area'), this.props.user && this.props.user.get('vendor_region'), "Created WO",'','','');
              this.props.handleHideModal("Details updated successfully")
            }
          }).catch(err => {
            console.log('error', err)
          })
          if (files.filesPostRequest.files && files.filesPostRequest.files.length > 0) {
            if(routeToIop == "Y"){
              this.props.submitFilesInvoice(loginId, action.savedMessage.quote_unid, files.filesPostRequest, files.category).then((action)=> {
                if (action.type === 'SUBMIT_QUOTE_FILE_SUCCESS') {
                  this.props.handleHideModal("files uploaded successfully")
                } else {
            
                }
                
              }).catch(err => {
                console.log('err', err)
              })
            }
            else{
            uploadFilesWO(loginId, action.savedMessage.quote_unid, files.category, files.filesPostRequest).then((action2) => {
              if (action2.type === 'UPLOAD_FILES_SUCCESS_WO') {
              }
            }).catch(err => {
              console.log('err', err)
            })
          }
          }
        }
        self.setState({ isOldWO: true })
        if (isGenReq) {
          submitGenReadingsRequest(pm_unid, genTankReadingInput).then((action) => {
            if (action.type === 'SUBMIT_GENTANKDETAILS_SUCCESS') {
              let workorder_id = action && action.savedMessage && action.savedMessage.workorder_id;
              this.resetGeneratorFormValues(null, true)
              if (isInvoice) {
                if (values.priority && action.savedMessage.quote_unid) {
                  submitFixedQuoteInvoice(vendorId, loginId, action.savedMessage.quote_unid, values.priority == 'BID / AVAILABILITY' ? 'rfqreply' : 'COMPLETE', submitReq).then(action => {
                    if (action.type == 'SUBMIT_FPQUOTE_SUCCESS') {
                      logActioninDB(loginId, this.props.user && this.props.user.get('email'),vendorId, workorder_id, this.props.user && this.props.user.get('vendor_area'), this.props.user && this.props.user.get('vendor_region'), "Created WO",'','','');
                      this.props.handleHideModal("Details updated successfully")
                    }
                  }).catch(err => {
                    console.log('error', err)
                  })
                  if (files.filesPostRequest.files && files.filesPostRequest.files.length > 0) {
                    if(routeToIop == "Y"){
                      this.props.submitFilesInvoice(loginId, action.savedMessage.quote_unid, files.filesPostRequest, files.category).then((action)=> {
                        console.log("action",action)
                        if (action.type === 'SUBMIT_QUOTE_FILE_SUCCESS') {
                          this.props.handleHideModal("files uploaded successfully")
                        } else {
                    
                        }
                        
                      }).catch(err => {
                        console.log('err', err)
                      })
                    }
                    else{
                    uploadFilesWO(loginId, action.savedMessage.quote_unid, files.category, files.filesPostRequest).then((action2) => {
                      if (action2.type === 'UPLOAD_FILES_SUCCESS_WO') {
                      }
                    }).catch(err => {
                      console.log('err', err)
                    })
                  }
                  }
                }

              }
            }
          })
        }
      }
    })
  }
  isvalidateInput(val, name) {
    try {
      let paresedVal = parseFloat(val) * 1
      let { currentValues } = this.props
      let currentVal = currentValues.toJS()
      let actual_materials_total = parseFloat(currentVal["actual_materials_total"]) * 1
      let actual_labor_total = parseFloat(currentVal["actual_labor_total"]) * 1
      let actual_fuel_total = parseFloat(currentVal["actual_fuel_total"]) * 1
      let actual_total = parseFloat(currentVal["actual_total"]) * 1
      if (name == 'actual_total') {
        if (paresedVal < 0 || isNaN(paresedVal)) {
          this.setState({ inValidQuoteTotalText: 'Invalid value' })
          return false
        }
        if (paresedVal.toFixed(2) * 1 < (actual_materials_total + actual_labor_total + actual_fuel_total).toFixed(2) * 1) {
          this.setState({ inValidQuoteTotalText: 'Value should be higher' })
          return false
        } else {
          if (actual_materials_total < 0 || isNaN(actual_materials_total)) {
            this.setState({ inValidMaterialTotal: true })
          } else {
            this.setState({ inValidMaterialTotal: false })
          }
          if (actual_labor_total < 0 || isNaN(actual_labor_total)) {
            this.setState({ inValidLaborTotal: true })
          } else {
            this.setState({ inValidLaborTotal: false })
          }
          if (actual_fuel_total < 0 || isNaN(actual_fuel_total)) {
            this.setState({ inValidFuel: true })
          } else {
            this.setState({ inValidFuel: false })
          }
          return true
        }
      }
      if (name == 'actual_materials_total') {
        if (paresedVal < 0 || isNaN(paresedVal)) {
          this.setState({ inValidMaterialTotalText: 'Invalid value' })
          return false
        }
        if (actual_total.toFixed(2) * 1 < (paresedVal + actual_labor_total + actual_fuel_total).toFixed(2) * 1) {
          this.setState({ inValidQuoteTotal: true, inValidQuoteTotalText: 'Value should be higher', inValidMaterialTotalText: undefined })
          return false
        } else {
          this.setState({ inValidQuoteTotal: false })
          return true
        }
      }
      if (name == 'actual_labor_total') {
        if (paresedVal < 0 || isNaN(paresedVal)) {
          this.setState({ inValidLaborTotalText: 'Invalid value' })
          return false
        }
        if (actual_total.toFixed(2) * 1 < (actual_materials_total + paresedVal + actual_fuel_total).toFixed(2) * 1) {
          this.setState({ inValidQuoteTotal: true, inValidQuoteTotalText: 'Value should be higher', inValidLaborTotalText: undefined })
          return false
        } else {
          this.setState({ inValidQuoteTotal: false })
          return true
        }
      }
      if (name == 'actual_fuel_total') {
        if (paresedVal < 0 || isNaN(paresedVal)) {
          this.setState({ inValidFuelText: 'Invalid value' })
          return false
        }
        if (actual_total.toFixed(2) * 1 < (actual_materials_total + actual_labor_total + paresedVal).toFixed(2) * 1) {
          this.setState({ inValidQuoteTotal: true, inValidQuoteTotalText: 'Value should be higher', inValidFuelText: undefined })
          return false
        } else {
          this.setState({ inValidQuoteTotal: false })
          return true
        }
      }
    } catch (err) {
      return false
    }
  }

  isvalidateSubmitQuoteInput(val, name) {
    try {
      let paresedVal = parseFloat(val) * 1
      let { currentValues } = this.props
      let currentVal = currentValues.toJS()
      let submitQuote_actual_materials_total = parseFloat(currentVal["submitQuote_actual_materials_total"]) * 1
      let submitQuote_actual_labor_total = parseFloat(currentVal["submitQuote_actual_labor_total"]) * 1
      let submitQuote_actual_fuel_total = parseFloat(currentVal["submitQuote_actual_fuel_total"]) * 1
      let submitQuote_actual_total = parseFloat(currentVal["submitQuote_actual_total"]) * 1
      if (name == 'submitQuote_actual_total') {
        if (paresedVal < 0 || isNaN(paresedVal)) {
          this.setState({ inValidSubmitQuoteTotalText: 'Invalid value' })
          return false
        }
        if (paresedVal.toFixed(2) * 1 < (submitQuote_actual_materials_total + submitQuote_actual_labor_total + submitQuote_actual_fuel_total).toFixed(2) * 1) {
          this.setState({ inValidSubmitQuoteTotalText: 'Value should be higher' })
          return false
        } else {
          if (submitQuote_actual_materials_total < 0 || isNaN(submitQuote_actual_materials_total)) {
            this.setState({ inValidSubmitQuoteMaterialTotal: true })
          } else {
            this.setState({ inValidSubmitQuoteMaterialTotal: false })
          }
          if (submitQuote_actual_labor_total < 0 || isNaN(submitQuote_actual_labor_total)) {
            this.setState({ inValidSubmitQuoteLaborTotal: true })
          } else {
            this.setState({ inValidSubmitQuoteLaborTotal: false })
          }
          if (submitQuote_actual_fuel_total < 0 || isNaN(submitQuote_actual_fuel_total)) {
            this.setState({ inValidSubmitQuoteFuel: true })
          } else {
            this.setState({ inValidSubmitQuoteFuel: false })
          }
          return true
        }
      }
      if (name == 'submitQuote_actual_materials_total') {
        if (paresedVal < 0 || isNaN(paresedVal)) {
          this.setState({ inValidSubmitQuoteMaterialTotalText: 'Invalid value' })
          return false
        }
        if (submitQuote_actual_total.toFixed(2) * 1 < (paresedVal + submitQuote_actual_labor_total + submitQuote_actual_fuel_total).toFixed(2) * 1) {
          this.setState({ inValidSubmitQuoteTotal: true, inValidSubmitQuoteTotalText: 'Value should be higher', inValidSubmitQuoteMaterialTotalText: undefined })
          return false
        } else {
          this.setState({ inValidSubmitQuoteTotal: false })
          return true
        }
      }
      if (name == 'submitQuote_actual_labor_total') {
        if (paresedVal < 0 || isNaN(paresedVal)) {
          this.setState({ inValidSubmitQuoteLaborTotalText: 'Invalid value' })
          return false
        }
        if (submitQuote_actual_total.toFixed(2) * 1 < (submitQuote_actual_materials_total + paresedVal + submitQuote_actual_fuel_total).toFixed(2) * 1) {
          this.setState({ inValidSubmitQuoteTotal: true, inValidSubmitQuoteTotalText: 'Value should be higher', inValidSubmitQuoteLaborTotalText: undefined })
          return false
        } else {
          this.setState({ inValidSubmitQuoteTotal: false })
          return true
        }
      }
      if (name == 'submitQuote_actual_fuel_total') {
        if (paresedVal < 0 || isNaN(paresedVal)) {
          this.setState({ inValidSubmitQuoteFuelText: 'Invalid value' })
          return false
        }
        if (submitQuote_actual_total.toFixed(2) * 1 < (submitQuote_actual_materials_total + submitQuote_actual_labor_total + paresedVal).toFixed(2) * 1) {
          this.setState({ inValidSubmitQuoteTotal: true, inValidSubmitQuoteTotalText: 'Value should be higher', inValidSubmitQuoteFuelText: undefined })
          return false
        } else {
          this.setState({ inValidSubmitQuoteTotal: false })
          return true
        }
      }
    } catch (err) {
      return false
    }
  }

  onChangeInput = (e, gennum, fuelnum) => {
    let { savedMessage, errorsMessage } = this.props
    if (savedMessage.size || errorsMessage.size) {
      this.resetInfo('change')
    }
    if (e && e.target && e.target.name) {
      if (e.target.name) {
        if (e.target.name == "totalruntime") {
          let name = "totalruntime_" + gennum
          this.validatefuelGallonsAndRuntime(name, e.target.value, "totalruntime")
        }
        if (e.target.name == "current_fuel_level") {
          let name = "current_fuel_level_" + gennum
          this.validateFuelLevel(name, e.target.value)
          this.setState({ generatorIndex: gennum })
        }
        if (e.target.name == "fuel_level") {
          let name = "fuel_level_" + gennum + "_" + fuelnum
          this.validateFuelLevel(name, e.target.value)
        }
        if (e.target.name == "fuel_gallonsadded") {
          let name = "fuel_gallonsadded_" + gennum + "_" + fuelnum
          this.validatefuelGallonsAndRuntime(name, e.target.value, "fuel_gallonsadded")
        }
      }
    }
  }

  randomString(length, chars) {
    var result = ''
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
    return result
  }

  isGenReadingAvbl() {
    let genInfo = {}
    let fuelInfo = []
    if (this.props.generatorInfo) {
      genInfo = this.props.generatorInfo.toJS()
    }
    if (this.props.genTankInfo) {
      fuelInfo = this.props.genTankInfo.toJS()
    }
    let genvalues = this.props.currentValues
    let fuelTanks = 0
    let fuelLevel = 0
    let fuelGallons = 0
    let genRunTime = 0
    let currentFuelLevel = 0
    let selectedSerial = genvalues.get('switch_Generator') ? genvalues.get('switch_Generator').split('_')[1] : null
    let isGenReadings = false
    if (fuelInfo && fuelInfo.length > 0) {
      for (let m = 0; m < genInfo.length; m++) {
        for (let j = 0; j < fuelInfo.length; j++) {
          if (genInfo[m].generator_id == fuelInfo[j].gen_emis_id) {
            if (this.props.type == 'Site') {
              if (fuelInfo[j].tank1_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
              if (fuelInfo[j].tank2_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
              if (fuelInfo[j].tank3_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
              if (fuelInfo[j].tank4_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
            }
            if (this.props.type == 'Switch' && selectedSerial) {
              if (fuelInfo[j].tank1_size != "Not Installed") {
                (selectedSerial && genInfo[m].gen_serial_no == selectedSerial) ? fuelTanks = fuelTanks + 1 : null
              }
              if (fuelInfo[j].tank2_size != "Not Installed") {
                (selectedSerial && genInfo[m].gen_serial_no == selectedSerial) ? fuelTanks = fuelTanks + 1 : null
              }
              if (fuelInfo[j].tank3_size != "Not Installed") {
                (selectedSerial && genInfo[m].gen_serial_no == selectedSerial) ? fuelTanks = fuelTanks + 1 : null
              }
              if (fuelInfo[j].tank4_size != "Not Installed") {
                (selectedSerial && genInfo[m].gen_serial_no == selectedSerial) ? fuelTanks = fuelTanks + 1 : null
              }
            }
          }
        }
      }
    }

    if (genInfo && genInfo.length > 0) {
      for (let i = 0; i < genInfo.length; i++) {
        for (let k = 0; k < fuelTanks; k++) {
          let fuel_level = "fuel_level_" + i + "_" + k
          let fuel_gallonsadded = "fuel_gallonsadded_" + i + "_" + k
          if (genvalues.get(fuel_level) && genvalues.get(fuel_level) > 0) {
            this.props.type == 'Site' ? fuelLevel = fuelLevel + 1 : ((this.props.type == 'Switch' && (selectedSerial && genInfo[i].gen_serial_no == selectedSerial)) ? fuelLevel = fuelLevel + 1 : null)
          }
          if (genvalues.get(fuel_gallonsadded) && genvalues.get(fuel_gallonsadded) > 0) {
            this.props.type == 'Site' ? fuelGallons = fuelGallons + 1 : ((this.props.type == 'Switch' && (selectedSerial && genInfo[i].gen_serial_no == selectedSerial)) ? fuelGallons = fuelGallons + 1 : null)
          }
        }
        let dynamicRuntime = 'totalruntime_' + i
        let dynamiccurrentFuelLevel = 'current_fuel_level_' + i
        if (genvalues.get(dynamicRuntime) && genvalues.get(dynamicRuntime) > 0) {
          this.props.type == 'Site' ? genRunTime = genRunTime + 1 : ((this.props.type == 'Switch' && (selectedSerial && genInfo[i].gen_serial_no == selectedSerial)) ? genRunTime = genRunTime + 1 : null)
        }
        if (genvalues.get(dynamiccurrentFuelLevel) && genvalues.get(dynamiccurrentFuelLevel) > 0) {
          this.props.type == 'Site' ? currentFuelLevel = currentFuelLevel + 1 : ((this.props.type == 'Switch' && (selectedSerial && genInfo[i].gen_serial_no == selectedSerial)) ? currentFuelLevel = currentFuelLevel + 1 : null)
        }
      }
    }

    if (genInfo && genInfo.length) {
      if (fuelLevel == fuelTanks && fuelGallons == fuelTanks) {
        if (this.props.type == 'Site' && genRunTime == genInfo.length && currentFuelLevel == genInfo.length) { isGenReadings = true } else {
          (this.props.type == 'Switch' && genRunTime == 1 && currentFuelLevel == 1) ? isGenReadings = true : isGenReadings = false
        }
      } else {
        isGenReadings = false
      }
    }
    return isGenReadings
  }



  renderGeneratorinfo = () => {
    let { currentValues, type } = this.props
    let genInfo = {}
    let genTkInfo = []
    if (this.props.generatorInfo) {
      genInfo = this.props.generatorInfo.toJS()
    }
    if (this.props.genTankInfo) {
      genTkInfo = this.props.genTankInfo.toJS()
    }

    let selectedGenerator = currentValues.get('switch_Generator') ? currentValues.get('switch_Generator').split('_')[1] : null

    let genColumns = []
    let fuelTanks = 0
    if (genInfo && genInfo.length > 0) {
      for (let i = 0; i < genInfo.length; i++) {
        fuelTanks = 0
        if ((genInfo[i].gen_serial_no == selectedGenerator)) {
          genColumns.push(
            <tr colSpan="6">
              <td><label className="Form-label">Mfr</label></td>
              <td><label className="Form-label">Model</label></td>
              <td><label className="Form-label">Serial</label></td>
              <td><label className="Form-label">Installed</label></td>
            </tr>
          )
        }
        if (genInfo[i].gen_serial_no == selectedGenerator) {
          genColumns.push(
            <tr colSpan="6">
              <td>{genInfo[i].gen_spec.manufacturer}</td>
              <td>{genInfo[i].gen_spec.model}</td>
              <td>{genInfo[i].gen_serial_no}</td>
              <td>{genInfo[i].gen_install_date}</td>
            </tr>
          )
          if (currentValues.get('priority') !== 'BID / AVAILABILITY') {
            genColumns.push(
              <tr>
                <td className="Form-group">
                  <label className="Form-label"><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Generator RunTime(hrs)</h5></label>
                  <input
                    placeholder={"hrs"}
                    className="form-control"
                    name={"totalruntime"}
                    type="number"
                    min="0"
                    value={currentValues.get("totalruntime_" + i)}
                    onChange={e => this.onChangeInput(e, i, 0)}
                    style={{ "text-align": "right" }}
                  />
                </td>

                {genInfo[i].fuel_tanks && genInfo[i].fuel_tanks.length > 0 ? <td className="Form-group">
                  {
                    currentValues.get('work_type') && (currentValues.get('work_type') == 'Generator' || currentValues.get('work_type') == 'ENGIE-FUEL')
                      ? <label className="Form-label"><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Current Fuel Level(1-100)%</h5></label>
                      : <label className="Form-label">Current Fuel Level(1-100)%</label>
                  }
                  <input
                    placeholder={"%"}
                    className="form-control"
                    name={"current_fuel_level"}
                    type="number"
                    min="0"
                    max="100"
                    value={currentValues.get("current_fuel_level_" + i)}
                    onChange={e => this.onChangeInput(e, i, 0)}
                    style={{ "text-align": "right" }}
                    required
                  />
                </td> : null}

                <td className="Form-group">
                  <label className="Form-label">Generator Type</label>
                  <input
                    value={genInfo[i].gen_type}
                    className="form-control"
                    name="gen_type"
                    disabled="disabled"
                  />
                </td>
                <td className="Form-group">
                  <label className="Form-label">Fuel Type</label>
                  <input
                    className="form-control"
                    name="fuel_type"
                    value={genInfo[i].gen_spec.fuel_type}
                    style={{ "direction": "rtl", "text-align": "left" }}
                    disabled="disabled"
                  />
                </td>
                {genInfo[i].fuel_tanks && genInfo[i].fuel_tanks.length > 0 ? <td className="Form-group" colSpan="2">
                  <label className="Form-label">Tank Type</label>
                  <input
                    className="form-control"
                    name="tank_type"
                    value={genInfo[i].fuel_tanks[0].tank_type}
                    style={{ "direction": "rtl", "text-align": "left" }}
                    disabled="disabled"
                  />
                </td> : null}
              </tr>
            )
          }
          if (genTkInfo && genTkInfo.length > 0) {
            for (let j = 0; j < genTkInfo.length; j++) {
              if (genInfo[i].generator_id == genTkInfo[j].gen_emis_id) {
                if (genTkInfo[j].tank1_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
                if (genTkInfo[j].tank2_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
                if (genTkInfo[j].tank3_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
                if (genTkInfo[j].tank4_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
              }
            }
          }
          if (fuelTanks > 0) {
            for (let k = 0; k < fuelTanks; k++) {
              if (currentValues.get('priority') !== 'BID / AVAILABILITY') {
                genColumns.push(
                  <tr>
                    <td className="Form-group">
                      {
                        currentValues.get('work_type') && (currentValues.get('work_type') == 'Generator' || currentValues.get('work_type') == 'ENGIE-FUEL')
                          ? <label className="Form-label"><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>New Fuel Level(1-100)%</h5></label>
                          : <label className="Form-label">New Fuel Level(1-100)%</label>
                      }
                      <input
                        placeholder={"%"}
                        className="form-control"
                        name={"fuel_level"}
                        type="number"
                        min="0"
                        max="100"
                        value={currentValues.get("fuel_level_" + i + "_" + k)}
                        onChange={e => this.onChangeInput(e, i, k)}
                        style={{ "text-align": "right" }}
                      />
                    </td>
                    <td className="Form-group">
                      {
                        currentValues.get('work_type') && (currentValues.get('work_type') == 'Generator' || currentValues.get('work_type') == 'ENGIE-FUEL')
                          ? <label className="Form-label"><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Fuel Gallons Added(gallons)</h5></label>
                          : <label className="Form-label">Fuel Gallons Added(gallons)</label>
                      }
                      <input
                        placeholder={"gal"}
                        className="form-control"
                        name={"fuel_gallonsadded"}
                        type="number"
                        min="0"
                        value={currentValues.get("fuel_gallonsadded_" + i + "_" + k)}
                        onChange={e => this.onChangeInput(e, i, k)}
                        style={{ "text-align": "right" }}
                      />
                    </td>
                    <td className="Form-group">
                      <label className="Form-label">Tank Capacity(gallons)</label>
                      <input
                        placeholder={"gal"}
                        className="form-control"
                        name="tank_capacity"
                        value={genInfo[i].fuel_tanks[0].capacity}
                        style={{ "direction": "rtl", "text-align": "left" }}
                        disabled="disabled"
                      />
                    </td>
                    <td className="Form-group">
                      <label className="Form-label">Generator Fuel Updated By</label>
                      {genInfo[i].gen_updated_by}
                    </td>
                    <td className="Form-group" colSpan="2">
                      <label className="Form-label">Generator Fuel Updated Date</label>
                      {genInfo[i].gen_update_date}
                    </td>

                  </tr>
                )
              }
            }
          }
        }

      }
    }

    return genColumns
  }

  renderHvacinfo = () => {
    let hvacIfo = this.props.hvacInfo.toJS()
    let hvacColumns = []
    if (hvacIfo && hvacIfo.length > 0) {
      if (this.props.currentValues.get('switch_Hvac')) {
        hvacColumns.push(
          <tr colSpan="3">
            <td><label className="Form-label">Model</label></td>
            <td> <label className="Form-label">SN</label></td>
            <td><label className="Form-label">UnitID</label></td>
            <td><label className="Form-label">UnitSize(tons)</label></td>
            <td><label className="Form-label">Refrigerent</label></td>
            <td><label className="Form-label">MFR Date</label></td>
          </tr>
        )
      }
      for (let i = 0; i < hvacIfo.length; i++) {
        let hvacSelected = this.props.currentValues.get('switch_Hvac')
        if (hvacIfo[i].hvac_unit_id == hvacSelected) {
          hvacColumns.push(
            <tr colSpan="3">
              <td style={{ "width": "1px", "white-space": "nowrap" }}>{hvacIfo[i].model}</td>
              <td style={{ "width": "1px", "white-space": "nowrap" }}>{hvacIfo[i].serial_no}</td>
              <td>{hvacIfo[i].hvac_unit_id}</td>
              <td>{hvacIfo[i].unit_size}</td>
              <td>{hvacIfo[i].refrigerant}</td>
              <td>{hvacIfo[i].manufacture_date}</td>
            </tr>
          )
        }
      }
    }
    return hvacColumns
  }
  onInvoiceFileDrop = (files) => {
    let { formName } = this.props
    this.state.isInvoiceFileSizeError == false && files.forEach(file => {
      if (file['size'] > 0) {
        var reader = new window.FileReader()
        reader.onload = (function () {
          var dataURL = reader.result
          var droppedFile = {
            filename: file['name'],
            filetype: file['type'],
            file_size: file['size'] + '',
            content: dataURL,
            category: "invoice",
            preview: file['preview'],
            last_modified: file['lastModifiedDate'],

          }
          this.invoiceList = this.invoiceList.set(this.invoiceList.size, droppedFile)
          if (this.invoiceList.size > 0) {
            let totalFileSize = this.invoiceList.toJS().reduce((a, b) => +a + +b.file_size, 0)
            if (totalFileSize > 12000000) {
              this.setState({ isInvoiceFileSizeError: true })
            }
            if (totalFileSize < 12000000) {
              this.setState({ isInvoiceFileSizeError: false })
            }
          }
          this.forceUpdate()
        }).bind(this)
        reader.readAsDataURL(file)
      } else {
      }

    })
  }

  onSubmitQuoteFileDrop = (files) => {
    let { formName } = this.props
    files.forEach(file => {
      if (file['size'] > 0) {
        var reader = new window.FileReader()
        reader.onload = (function () {
          var dataURL = reader.result
          var droppedFile = {
            filename: file['name'],
            filetype: file['type'],
            file_size: file['size'] + '',
            content: dataURL,
            category: "invoice",
            preview: file['preview'],
            last_modified: file['lastModifiedDate'],

          }
          this.submitQuoteFileList = this.submitQuoteFileList.set(this.submitQuoteFileList.size, droppedFile)

          this.forceUpdate()
        }).bind(this)
        reader.readAsDataURL(file)
      } else {
      }

    })
  }

  onChangeNumberField = (e) => {
    if (this.state.showSubmitQuote) {
      let isValidateInput = this.isvalidateSubmitQuoteInput(e.target.value, e.target.name)
      if (isValidateInput) {
        this.setValue(e.target.name, e.target.value)
        let isInValid = false
        if (!(e.target.value * 1 > 0) && e.target.name == "submitQuote_actual_total") {
          isInValid = true
        }
        switch (e.target.name) {
          case "submitQuote_actual_materials_total":
            return this.setState({ inValidSubmitQuoteMaterialTotal: isInValid })
          case "submitQuote_actual_labor_total":
            return this.setState({ inValidSubmitQuoteLaborTotal: isInValid })
          case "submitQuote_actual_fuel_total":
            return this.setState({ inValidSubmitQuoteFuel: isInValid })
          case "submitQuote_actual_total":
            return this.setState({ inValidSubmitQuoteTotal: isInValid })
        }
      } else {
        this.setValue(e.target.name, e.target.value)
        switch (e.target.name) {
          case "submitQuote_actual_materials_total":
            return this.setState({ inValidSubmitQuoteMaterialTotal: true })
          case "submitQuote_actual_labor_total":
            return this.setState({ inValidSubmitQuoteLaborTotal: true })
          case "submitQuote_actual_fuel_total":
            return this.setState({ inValidSubmitQuoteFuel: true })
          case "submitQuote_actual_total":
            return this.setState({ inValidSubmitQuoteTotal: true })
        }
      }
    } else {
      if (this.isvalidateInput(e.target.value, e.target.name)) {
        this.setState({ isInvoiceRequired: true })
        this.setValue(e.target.name, e.target.value)
        switch (e.target.name) {
          case "actual_materials_total":
            return this.setState({ inValidMaterialTotal: false })
          case "actual_labor_total":
            return this.setState({ inValidLaborTotal: false })
          case "actual_fuel_total":
            return this.setState({ inValidFuel: false })
          case "actual_total":
            return this.setState({ inValidQuoteTotal: false })
        }
      } else {
        this.setValue(e.target.name, e.target.value)
        this.setState({ isInvoiceRequired: true })
        switch (e.target.name) {
          case "actual_materials_total":
            return this.setState({ inValidMaterialTotal: true })
          case "actual_labor_total":
            return this.setState({ inValidLaborTotal: true })
          case "actual_fuel_total":
            return this.setState({ inValidFuel: true })
          case "actual_total":
            return this.setState({ inValidQuoteTotal: true })
        }
      }
    }
  }

  renderSiteInformation = () => {
    let { site } = this.props
    let { Manager, Tech } = this.state
    let siteInfo = []
    siteInfo.push(<div className="col-sm-12 no-padding float-left">

      <div className="col-sm-12 no-padding float-left">
        <div className="col-sm-3 no-padding Form-group float-left"><label className="Form-label">Site Name: </label>{site.get('sitename')} </div>
        <div className="col-sm-3 no-padding Form-group float-left"><label className="Form-label">Switch Name:</label>{site.get('switch')}</div>
        <div className="col-sm-3 no-padding Form-group float-left"><label className="Form-label">City:</label>{site.get('city')}</div>
        <div className="col-sm-3 no-padding Form-group float-left"><label className="Form-label">State:</label>{site.get('state')}</div>
      </div>

      <div className="col-sm-12 no-padding">
        <div className="col-sm-3 no-padding Form-group float-left"><label className="Form-label">Site Manager:</label>{Manager ? Manager.name : ''}</div>
        <div className="col-sm-3 no-padding Form-group float-left"><label className="Form-label">Site Engineer:</label>{Tech ? Tech.name : ''}</div>
        <div className="col-sm-3 no-padding Form-group float-left"><label className="Form-label">Site #:</label>{site.get('siteid')}</div>
      </div>
    </div>)

    return siteInfo
  }

  renderSwitchInformation = () => {
    let { switchData } = this.props
    let switchInfo = []
    switchInfo.push(<div className="col-sm-12 no-padding float-left">

      <div className="col-sm-12 no-padding float-left">
        <div className="col-sm-4 no-padding Form-group float-left"><label className="Form-label">Switch Name:</label>{switchData.get('switch_name')}</div>
        <div className="col-sm-4 no-padding Form-group float-left"><label className="Form-label">City:</label>{switchData.get('city')}</div>
        <div className="col-sm-4 no-padding Form-group float-left"><label className="Form-label">State:</label>{switchData.get('state')}</div>
      </div>

      <div className="col-sm-12 no-padding">
        <div className="col-sm-4 no-padding Form-group float-left"><label className="Form-label">Area:</label>{switchData.get('area')}</div>
        <div className="col-sm-4 no-padding Form-group float-left"><label className="Form-label">Market</label>{switchData.get('region')}</div>
      </div>
    </div>)

    return switchInfo
  }

  renderSwitchGeneratorHVACOptions() {
    let { currentValues } = this.props
    let workType = currentValues.get('work_type')
    let genInfo = {}
    let genTkInfo = []
    let hvacInfo = []
    let hvacColumns = []
    const labelStyle = { "marginTop": "10px", "color": "black", "fontSize": "1em" }
    if (workType != 'HVAC') {
      if (this.props.generatorInfo) {
        genInfo = this.props.generatorInfo.toJS()
      }
      if (this.props.genTankInfo) {
        genTkInfo = this.props.genTankInfo.toJS()
      }
      let genTkInfoList = genTkInfo.map(gen => {
        let tanksSizeKeys = (Object.entries(gen)).filter(pair => {
          if (pair[0].includes('_size') && (pair[0].indexOf('tank') == 0)) {
            if (pair[1] && pair[1] !== 'Not Installed') {
              return true
            }
          }
        })
        if (tanksSizeKeys.length > 0) {
          let notInServiceGen = genInfo.filter(genDetails => {
            return genDetails.gen_serial_no == gen.serialnum
          })
          if (notInServiceGen.length > 0 && notInServiceGen[0].gen_in_service == 'No') {
            return { label: gen.model + '_' + gen.serialnum + '(Not in Service)', name: 'switch_Generator', value: gen.model + '_' + gen.serialnum, ...gen, disabled: true }
          }
          return { label: gen.model + '_' + gen.serialnum, name: 'switch_Generator', value: gen.model + '_' + gen.serialnum, ...gen }
        } else {
          return { label: gen.model + '_' + gen.serialnum + '(No Tank Size)', name: 'switch_Generator', value: gen.model + '_' + gen.serialnum, ...gen, disabled: true }
        }
      })
      let noTankGen = genInfo.filter(gen => {
        let filteredTank = genTkInfo.filter(tank => tank.serialnum == gen.gen_serial_no)
        return (filteredTank.length == 0)
      })
      noTankGen = noTankGen.map(gen => {
        return { label: gen.gen_spec.model + '_' + gen.gen_serial_no + '(No Tanks)', name: 'switch_Generator', value: gen.gen_spec.model + '_' + gen.gen_serial_no, ...gen, disabled: true }
      })
      genTkInfoList = [...genTkInfoList, ...noTankGen]
      let generatorDropDown = []
      if (this.state.isGeneratorInfo && genTkInfoList.length > 0 && genInfo.length > 0) {
        generatorDropDown.push(
          <tr >
            <td colSpan="2">
              <label style={labelStyle}><h5 style={{ float: 'left' }}>Generator</h5></label>
              <Select
                name="switch_Generator"
                value={{value : currentValues.get('switch_Generator' || ''), label : currentValues.get('switch_Generator' || '')}}
                className="col-12 col-md-12 no-padding float-left"
                onChange={this.onDataChange}
                isClearable={false}
                isDisabled={currentValues.get('switch_Generator')}
                options={genTkInfoList} required />
            </td>
          </tr>
        )
      } else {
        if (genInfo.length == 0) {
          generatorDropDown.push(
            <tr >
              <td colSpan="2">
                <label style={labelStyle}><h5 style={{ float: 'left', color: 'red' }}>No Generators available</h5></label>
              </td>
            </tr>
          )
        }
      }
      return generatorDropDown
    }
    if (workType == 'HVAC') {
      hvacInfo = this.props.hvacInfo.toJS()
      hvacColumns = []
      let hvacInfoList = hvacInfo.map(hvac => {
        return { label: hvac.model + '_' + hvac.hvac_unit_id, name: 'switch_Hvac', value: hvac.hvac_unit_id, ...hvac }
      })
      let hvacDropDown = []
      if (this.state.isHvacInfo) {
        hvacDropDown.push(
          <tr >
            <td colSpan="2">
              <label style={labelStyle}><h5 style={{ float: 'left' }}>HVAC</h5></label>
              <Select
                name="switch_Hvac"
                value={{value : currentValues.get('switch_Hvac' || ''), label : currentValues.get('switch_Hvac' || '')}}
                className="col-12 col-md-12 no-padding float-left"
                onChange={this.onDataChange}
                isClearable={false}
                options={hvacInfoList} required />
            </td>
          </tr>
        )
      }
      return hvacDropDown
    }
  }

  onQuoteSubmit = (reqDetails, files) => {
    this.onSubmit(reqDetails, files)
  }
  // onChangeEnodeBValue = (event) => {
  //   this.setState({ eNodeBOptionsSelected: event, sectorInfo: true })
  //   this.props.getSectorInfo(this.props.loginId, "133088").then(res => {
  //     let sectorOptions = this.props.sectorinfo && this.props.sectorinfo.size > 0 && this.props.sectorinfo.toJS() && this.props.sectorinfo.toJS().sectors &&
  //       this.props.sectorinfo.toJS().sectors.length > 0 && this.props.sectorinfo.toJS().sectors.map(item => {
  //         let sectorObj = {
  //           ...item,
  //           label: item.sector,
  //           value: item.sector
  //         }
  //         return sectorObj;
  //       })
  //     this.setState({ sectorOptions, sectorSelected : [] })
  //   })

  // }
  // onChangeSectorValue = (e) => {
  //   this.setState({ sectorSelected: e })
  // }

  render() {
    let { currentValues, isLoading, isExpenseLoading, isGenLoading, savedGenMessage,
      savedMessage, isInvcLoading, savedInvcMessage, sectorInfoLoading,
      errorInvcMessage, errorsMessage, siteDetaisLoading, switchDetaisLoading,
      site, user, type, techsbysubmarket, renderGeneratorinfo, renderHvacinfo, genTankInfo, generatorInfo, Unid } = this.props
    let { Tech, Manager, selectedTech, selectedManager, isGeneratorInfo,
      isHvacInfo, isErrorMessageShown, validationMessage, switchContacts, generatorIndex, disasterEventsDrpdwn, expenseProjIdDrpw,wbsIdDrpw, workTypes } = this.state
    let isGenReadings = false
    let isCurrentFuel = false
    if (siteDetaisLoading || switchDetaisLoading || isLoading || isGenLoading || isExpenseLoading) {
      return this.renderLoading()
    }
    if (currentValues.get('work_type') && (currentValues.get('work_type') == 'Generator' || currentValues.get('work_type') == 'ENGIE-FUEL')) {
      isGenReadings = this.isGenReadingAvbl()
      if (currentValues && currentValues.get('current_fuel_level_' + generatorIndex) > 0) {
        isCurrentFuel = false
      } else {
        isCurrentFuel = true
      }
    } else {
      isGenReadings = false
      isCurrentFuel = false
    }
    const labelStyle = { "marginTop": "10px", "color": "black", "fontSize": "1em" }
    return (
      <div className="col-sm-12">
        {savedMessage && savedMessage.size ? (<MessageBox messages={List([savedMessage.get("message")])} className="Alert--success" iconClassName="fa-thumbs-up" onClear={this.resetInfo} />) : null}
        {savedGenMessage && savedGenMessage.size ? (<MessageBox messages={List([savedGenMessage.get("message")])} className="Alert--success" iconClassName="fa-thumbs-up" onClear={this.resetInfo} />) : null}
        {savedInvcMessage && savedInvcMessage.size ? (<MessageBox messages={List([savedInvcMessage.get("message")])} className="Alert--success" iconClassName="fa-thumbs-up" onClear={this.resetInfo} />) : null}
        {errorsMessage && errorsMessage.size ? (<MessageBox messages={List([errorsMessage.get("message")])} onClear={this.resetInfo} />) : null}
        {errorInvcMessage && errorInvcMessage.size ? (<MessageBox messages={List([errorInvcMessage.get("message")])} onClear={this.resetInfo} />) : null}
        <style>
          {`.Form-label {
            font-size: 1em;
        }`}
        </style>

        {(type == 'Site') ? this.renderSiteInformation() : ((type == 'Switch') ? this.renderSwitchInformation() : null)}

        <div className="col-sm-12 float-left no-padding" style={{ marginTop: '20px' }}>
          <h4>
            Vendor Work Request
          </h4>
        </div>
        <div className="table-responsive vp_stepper_content">
          <table className="table  sortable table-bordered text-center site-table" style={{ minHeight: "288px", "background": "#FFF" }}>
            <tbody className="vzwtable text-left">
              {this.state.isFileSizeError && (<tr><td colSpan="6"><MessageBox messages={List(["The size of attachments should be less than 12 MB!"])} /></td></tr>)}
              <tr >
                <td colSpan="6">
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Work Scope</h5></label>
                  <div>
                    <TextField
                      multiLine={true} rows={2} fullWidth={true}
                      value={currentValues.get('work_scope') || ""}
                      name="work_scope"
                      onChange={this.onDataChange}
                      required
                      inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                    />
                  </div>
                </td>
              </tr>
              <tr >
                <td>
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Priority</h5></label>
                  <Select
                    name="priority"
                    value={{value : currentValues.get("priority") || '', label : currentValues.get("priority") || ''}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.onDataChange}
                    options={WOREQUESTPRIORITY} required />
                </td>
                <td>
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Requested By</h5></label>
                  <Select
                    name="requested_by"
                    value={{value : currentValues.get('requested_by') || '',label : currentValues.get('requested_by') || ''}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.onChangeRequestor}
                    isClearable={false}
                    defaultValue={{ label: Tech ? Tech.name : '', value: Tech ? Tech.name : '' }}
                    options={type == 'Site' ? techsbysubmarket.toJS() : switchContacts.techs} required />

                </td>
                {type == 'Switch' ? <td>
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Manager Name</h5></label>
                  <Select
                    name="manager_selected"

                    value={{value : currentValues.get('manager_selected') || '', label : currentValues.get('manager_selected') || ''}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.onChangeManager}
                    isClearable={false}
                    defaultValue={{ label: Manager ? Manager.name : '', value: Manager ? Manager.name : '' }}
                    options={switchContacts.mgrs} required />
                </td> : null}
                <td>
                  <label style={labelStyle}>Requestor Email</label>
                  <div>{selectedTech ? selectedTech.email : ''}</div>
                </td>
                <td>
                  <label style={labelStyle}>Manager Email</label>
                  <div>{Manager ? Manager.email : ''}</div>
                </td>
                {type !== 'Switch' && <td>
                  <label style={labelStyle}>Vendor Name</label>
                  <div>{user ? user.get('vendor_name') : ''}</div>
                </td>}
                {type !== 'Switch' && <td>
                  <label style={labelStyle}>Manager Approval Required?</label>
                  <div>{isGenReadings ? "NO" : "YES"}</div>
                </td>}
              </tr>
              <tr >
                <td>
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Work Type</h5></label>
                  <Select
                    name="work_type"
                    value={{value : currentValues.get('work_type' || ''), label : currentValues.get('work_type' || '')}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.onDataChange}
                    options={workTypes} required />
                </td>
                {/* <td>
                  <label style={labelStyle}><h5 style={{color: 'red', float: 'left'}}>*</h5><h5 style={{float: 'left'}}>Expense Proj Id</h5></label>
                  <Select
                    name="exp_market_proj_id"
                    value={{value : currentValues.get('exp_market_proj_id') || '', label : currentValues.get('exp_market_proj_id') || ''}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.onDataChange}
                    options={expenseProjIdDrpw}
                    required />

                </td> */}

                <td>
                  <label style={labelStyle}><h5 style={{color: 'red', float: 'left'}}>*</h5><h5 style={{float: 'left'}}>WBS</h5></label>
                  {/* <div>{this.state.wbscodeVal && this.state.wbscodeVal.value ? this.state.wbscodeVal.value : ''}</div>
                   */}
                   {wbsIdDrpw && wbsIdDrpw.length == 1 ?currentValues.get('wbs_id'):<Select
                    name="wbs_id"
                    value={{value : currentValues.get('wbs_id') || '', label : currentValues.get('wbs_id') || ''}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.onDataChange}
                    options={wbsIdDrpw}
                    required /> }
                </td>

                {type == 'Switch' ? <td>
                  <label style={labelStyle}>Manager Phone</label>
                  <div>{Manager ? Manager.phone : ''}</div>
                </td> : null}


                <td>
                  <label style={labelStyle}>Requestor Phone</label>
                  <div>{selectedTech ? selectedTech.phone : ''}</div>
                </td>
                {type === 'Switch' && <td>
                  <label style={labelStyle}>Manager Approval Required?</label>
                  <div>{isGenReadings ? "NO" : "YES"}</div>
                </td>}
                {type !== 'Switch' && 
                <><td>
                <label style={labelStyle}>Vendor Email</label>
                <div>{user ? user.get('email') : ''}</div>

              </td>
              <td>
                <label style={labelStyle}>Engineering Review Required?</label>
                <div>NO</div>
              </td></>}
              </tr>
              {type === 'Switch' && <tr>
                <td>
                  <label style={labelStyle}>Vendor Name</label>
                  <div>{user ? user.get('vendor_name') : ''}</div>
                </td>
                <td>
                  <label style={labelStyle}>Vendor Email</label>
                  <div>{user ? user.get('email') : ''}</div>

                </td>
                <td>
                  <label style={labelStyle}>Engineering Review Required?</label>
                  <div>NO</div>
                </td>
              </tr>}
              {/* {this.state.antennaTower && this.state.node_details.length > 0 ?
                <tr>
                  <td colSpan="2">
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Select eNodeB</h5></label>
                    <Picky
                            className="healthCheckeNodeB"
                            placeholder="Select eNodeB"
                            numberDisplayed={this.state.eNodeBOptions.length}
                            options={this.state.eNodeBOptions}
                            labelKey="label"
                            valueKey="value"
                            multiple={true}
                            includeFilter
                            includeSelectAll
                            value={this.state.eNodeBOptionsSelected}
                            onChange={this.onChangeEnodeBValue}
                        />

                  </td>
                  {this.state.sectorInfo && this.state.sectorOptions ?
                    <td colSpan="2">
                      {this.props.sectorInfoLoading ?
                        <Loader color="#cd040b" size="25px"
                          margin="4px"
                          className="text-center" />
                        : <div>
                           <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Select Sector</h5></label>
                          <Picky
                            className="sectors"
                            placeholder="Select Sector"
                            numberDisplayed={this.state.eNodeBOptions.length}
                            options={this.state.sectorOptions}
                            labelKey="label"
                            valueKey="value"
                            multiple={true}
                            includeFilter
                            includeSelectAll
                            value={this.state.sectorSelected}
                            onChange={this.onChangeSectorValue}
                            dropdownHeight={800}
                          />
                        
                        </div>
                        }
                    </td> : null}
                </tr>
                : null} */}


              {currentValues.get('work_type') && (currentValues.get('work_type') == 'Generator' || currentValues.get('work_type') == 'ENGIE-FUEL' || currentValues.get('work_type') == 'HVAC') ?
                this.renderSwitchGeneratorHVACOptions() : null
              }

              {isGeneratorInfo && currentValues.get('work_type') && (currentValues.get('work_type') == 'Generator' || currentValues.get('work_type') == 'ENGIE-FUEL') ?
                this.renderGeneratorinfo() : null}
              {isErrorMessageShown && (<tr><MessageBox messages={List([validationMessage])} onClear={this.resetInfo.bind(this, 'change')} /></tr>)}
              {isHvacInfo && currentValues.get('work_type') && currentValues.get('work_type') == 'HVAC' ? <tr>
                <div className="col-md-12 float-left">
                  {this.renderHvacinfo()}
                </div>
              </tr> : null}
              {/* <tr >
                <td colSpan="6">
                  <Dropzone onDrop={this.onFileDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                  <FileAttachedTable fileList={this.aList} onRemoveClick={this.onAttachRemove.bind(this)} />
                </td>

              </tr> */}
              <tr>
                {this.state.disasterEventsDrpdwn && this.state.disasterEventsDrpdwn.length > 0 ? <td>
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Is Disaster Recovery?</h5></label>
                  <Select
                    name="disaster"
                    value={{value : this.state.selectedDisaster || "No", label : this.state.selectedDisaster || "No"}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.onDataChange}
                    options={DISASTERRECOVERY} required />
                </td> : null}

                {this.state.selectedDisaster == "Yes" ? <td colSpan="2">
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Event List</h5></label>
                  <Select
                    name="disaster_events"
                    value={{value: currentValues.get('disaster_events') || '', label: currentValues.get('disaster_events') || ''}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.onDataChange}
                    options={disasterEventsDrpdwn} required />
                </td> : null}

              </tr>
              {this.state.showSubmitQuote ?
                <tr>
                  <td colSpan="6">
                    <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>{currentValues.get('priority') == 'BID / AVAILABILITY' ? 'Submit Quote' : 'Submit Invoice'}</h5></label>
                    <WorkOrderQuoteSubmitFixedPricing
                      workORderInfo={currentValues}
                      onQuoteSubmit={this.onQuoteSubmit}
                      workTypes={this.state.workTypes}
                      manager={this.state.Manager}
                      selectedTech={this.state.selectedTech}
                      disaster={this.state.selectedDisaster}
                      selectedEvent={this.state.selectedEvent}
                      isErrorMessageShown={this.state.isErrorMessageShown}
                      onWorkTypeChange={this.onDataChange}
                      type={this.props.type}
                      disableDirectSub={((currentValues.get('work_type') == 'ENGIE-FUEL') ? isGenReadings &&
                        isGeneratorInfo && !isCurrentFuel : true)

                      }

                    />
                  </td>
                </tr> : null}
              {/* <tr >

                <td colSpan="4">
                  <div>
                    {isHvacInfo && currentValues.get('work_type') && currentValues.get('work_type') == 'HVAC' ? <div className="col-md-6 float-left">
                      {this.renderHvacinfo()}
                    </div> : null}

                    <div className={(isHvacInfo) && currentValues.get('work_type') &&
                      (currentValues.get('work_type') == 'HVAC') ? "col-md-3 float-right" : "col-md-3 float-left"}>
                      <Dropzone style={{ width: '67%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', 'borderRadius': '5px' }} onDrop={this.onFileDrop}>
                        <div style={{ 'textAlign': 'center', 'paddingTop': '10%' }}>Drop files here, or click to select files to upload</div>
                      </Dropzone>
                    </div>
                    <div className="col-md-3 float-left">
                      <FileAttachedTable fileList={this.aList} onRemoveClick={this.onAttachRemove.bind(this)} />
                    </div>
                  </div>
                </td>
                {(isGenReadings && isGeneratorInfo && currentValues.get('work_type') && currentValues.get('work_type') == 'Generator Fueling') || currentValues.get("priority") == 'EMERGENCY' || this.state.showSubmitQuote ? null :
                  <td colSpan="2">
                    <button type="submit"
                      className="Button--secondary float-right"
                      disabled={this.state.isFileSizeError || this.state.isInvoiceFileSizeError || currentValues.get('priority') === '' || currentValues.get('work_scope') === ''
                        || currentValues.get('work_type') === '' || currentValues.get('exp_market_proj_id') === '' || !Manager || !Manager.email
                        || !selectedTech || !selectedTech.userid || isErrorMessageShown
                        || (currentValues.get('work_type') == 'Generator Fueling' ? !isGenReadings : isCurrentFuel) || this.state.isOldWO ||
                        (this.state.isSubmitQuoteRequired ? !(this.props.currentValues.get("submitQuote_actual_total") * 1 > 0
                          && !(this.state.inValidSubmitQuoteFuel || this.state.inValidSubmitQuoteLaborTotal
                            || this.state.inValidSubmitQuoteMaterialTotal || this.state.inValidSubmitQuoteTotal)) : false)}
                      style={{ marginRight: "5px" }}
                      onClick={this.onSubmit}>
                      Request
                      </button>
                  </td>}

              </tr>*/}
            </tbody>
          </table>
        </div>

        {(isGenReadings && isGeneratorInfo && currentValues.get('work_type') && currentValues.get('work_type') == 'Generator Fueling') || currentValues.get("priority") == 'EMERGENCY' ?
          <div className="col-sm-12 float-left no-padding">
            <h4>
              Submit Invoice
            </h4>
            <p> (Please follow the BAU process to submit the invoice to Accounts Payable also)</p>
          </div> : null}
        {(isGenReadings && isGeneratorInfo && currentValues.get('work_type') && currentValues.get('work_type') == 'Generator Fueling') || currentValues.get("priority") == 'EMERGENCY' ?
          <div className="table-responsive vp_stepper_content">
            <div className="card">
              <div className="card-body">
                {this.state.isInvoiceFileSizeError && (<MessageBox messages={List(["The size of attachments should be less than 12 MB!"])} />)}
                <form onSubmit={this.onSubmit.bind(this)} className="float-label">
                  <style>
                    {`.Select-control{
                      border-color: #e6e6e6;
                      border-top: 0px;
                      border-right: 0px;
                      border-left: 0px;
                    }
                    .rt-resizable-header-content {
                        font-weight: 600;
                        color: #607D8B;
                    }
                    input[type=number]::-webkit-inner-spin-button, 
                    input[type=number]::-webkit-outer-spin-button { 
                      -webkit-appearance: none; 
                      margin: 0; 
                    }`}
                  </style>
                  <div className="row ">
                    <div className="col-md-12 float-left">
                      <div className="col-md-2 float-left">
                        <TextField
                          floatingLabelText="Invoice Subtotal" type="number"
                          floatingLabelFixed={true}
                          step="any"
                          name="actual_total"
                          value={currentValues.get("actual_total")} onChange={this.onChangeNumberField}
                          required={this.state.isInvoiceRequired}
                          inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                          helperText={!this.state.inValidQuoteTotal ? null : this.state.inValidQuoteTotalText}
                          error={this.state.inValidQuoteTotal}
                          fullWidth={true} />
                      </div>
                      <div className={"col-md-2 float-left"}>
                        <TextField
                          floatingLabelText="Materials Subtotal"
                          floatingLabelFixed={true}
                          type="number"
                          step="any"
                          name="actual_materials_total"
                          value={currentValues.get("actual_materials_total")} onChange={this.onChangeNumberField}
                          required={this.state.isInvoiceRequired}
                          inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                          helperText={!this.state.inValidMaterialTotal ? null : this.state.inValidMaterialTotalText}
                          error={this.state.inValidMaterialTotal}
                          fullWidth={true} />
                      </div>
                      <div className={"col-md-2 float-left"}>
                        <TextField
                          floatingLabelText="Labor Subtotal" type="number"
                          floatingLabelFixed={true}
                          name="actual_labor_total"
                          step="any"
                          value={currentValues.get("actual_labor_total")} onChange={this.onChangeNumberField}
                          required={this.state.isInvoiceRequired}
                          inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                          helperText={!this.state.inValidLaborTotal ? null : this.state.inValidLaborTotalText}
                          error={this.state.inValidLaborTotal}
                          fullWidth={true} />
                      </div>
                      <div className="col-md-3 float-left">
                        <TextField
                          floatingLabelText="Generator Fuel Subtotal" type="number"
                          floatingLabelFixed={true}
                          name="actual_fuel_total"
                          step="any"
                          value={currentValues.get("actual_fuel_total")} onChange={this.onChangeNumberField}
                          required={this.state.isInvoiceRequired}
                          inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                          helperText={!this.state.inValidFuel ? null : this.state.inValidFuelText}
                          error= {this.state.inValidFuel}
                          fullWidth={true} />
                      </div>
                      <div className="col-md-2 float-left">
                        <TextField
                          floatingLabelText="Invoice Number" type="text"
                          floatingLabelFixed={true}
                          name="vendor_invoice_num"
                          step="any"
                          value={currentValues.get("vendor_invoice_num")} onChange={e => this.setValue("vendor_invoice_num", e.target.value)}
                          inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                          fullWidth={true} />
                      </div>
                      <div className="col-md-12 row_top_space float-left" >
                        <div className="col-md-6 float-left">
                          <TextField
                            floatingLabelText="Comments" multiLine={true} rows={2} rowsMax={4} fullWidth={true}
                            floatingLabelFixed={true}
                            required={this.state.isInvoiceRequired}
                            onChange={e => this.setValue("invoice_vendor_comments", e.target.value)}
                            inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                            error ={(this.state.isInvoiceRequired && !(currentValues.get('invoice_vendor_comments') && currentValues.get('invoice_vendor_comments').length > 0))}
                            helperText={!(this.state.isInvoiceRequired && !(currentValues.get('invoice_vendor_comments') && currentValues.get('invoice_vendor_comments').length > 0)) ? null : 'Comments Required'}
                          />
                        </div>
                        <div> <div className="col-md-3 float-left">
                          <Dropzone onDrop={this.onInvoiceFileDrop}>
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
                          <div className="col-md-3 float-left">
                            <FileAttachedTable fileList={this.invoiceList} onRemoveClick={this.onInvoiceRemove.bind(this)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div> : null}
        {(isGenReadings && isGeneratorInfo && currentValues.get('work_type') && currentValues.get('work_type') == 'Generator Fueling') || currentValues.get("priority") == 'EMERGENCY' ?
          <div className="col-md-12 row_top_space float-left">
            <button type="submit"
              className="Button--secondary float-right"
              disabled={currentValues.get('priority') === '' || currentValues.get('work_scope') === ''
                || currentValues.get('work_type') === '' || currentValues.get('wbs_id') === '' ||  (currentValues.get('disaster') == "Yes" && !this.state.selectedEvent)
                || isCurrentFuel || this.state.isOldWO || !Manager || !Manager.email ||
                !selectedTech || !selectedTech.userid || isErrorMessageShown || this.state.isFileSizeError
                || this.state.isInvoiceFileSizeError ||
                (this.state.isInvoiceRequired && (this.state.inValidFuel ||
                  this.state.inValidLaborTotal || this.state.inValidMaterialTotal ||
                  this.state.inValidQuoteTotal || !(currentValues.get('invoice_vendor_comments') &&
                    currentValues.get('invoice_vendor_comments').length > 0)))}
              style={{ marginRight: "5px" }}
              onClick={this.onSubmit}>
              Request
            </button>
          </div> : null}
      </div>
    )
  }
}

function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(["Users", "entities", "users", loginId], Map())
  let vendorId = user && user.get('vendor_id') ? user.get('vendor_id') : null
  let expenseProjId = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "expenseProjId", 'getExpenseProjIdData', 'expenseProjIdData'], List()).toJS()
  let sub_market = user && user.get('vendor_region') ? user.get('vendor_region') : null
  let groupVendors = state.getIn(['Users', 'entities', 'users', loginId, 'group_vendors'], List())
  let sectorInfoLoading = state.getIn(['Sites', loginId, "sectorInfo", "sectorInfoLoading"], false)
  let sectorinfo = state.getIn(['Sites', loginId, "sectorInfo", "sectorInfoData"], List())
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  return {
    currentValues: state.getIn(["Forms", formName, "currentValues"], List()),
    isLoading: state.getIn(["VendorDashboard", loginId, 'workOrdersrequest', 'isloading'], false),
    isExpenseLoading: state.getIn(["PmDashboard", loginId, vendorId, 'expenseProjIdDataLoading'], false),
    techsbysubmarket: state.getIn(["Users", "techsbysubmarket"], List()),
    errorsMessage: state.getIn(["VendorDashboard", loginId, 'workOrdersrequest', 'errors'], Map()),
    savedMessage: state.getIn(["VendorDashboard", loginId, 'workOrdersrequest', "success"], Map()),
    generatorInfo: state.getIn(["VendorDashboard", "generator"], List()),
    hvacInfo: state.getIn(["VendorDashboard", "hvac"], List()),
    genTankInfo: state.getIn(["VendorDashboard", "genTank"], List()),
    isGenLoading: state.getIn(["VendorDashboard", "genReadingsRequest", "isloading"], false),
    savedGenMessage: state.getIn(["VendorDashboard", "genReadingsRequest", "success"], null),
    errorGenMessage: state.getIn(["VendorDashboard", "genReadingsRequest", "errors"], null),
    isInvcLoading: state.getIn(["VendorDashboard", loginId, "WorkOrderForm", "loading"], false),
    savedInvcMessage: state.getIn(["VendorDashboard", loginId, "WorkOrderForm", "savedMessage"], null),
    errorInvcMessage: state.getIn(["VendorDashboard", loginId, "WorkOrderForm", "errorMessage"], null),
    loginId,
    groupVendors,
    siteDetaisLoading: state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false),
    site: state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()),
    switchData: state.getIn(["Switch", loginId, "switch", "switchDetails"], Map()),
    switchDetaisLoading: state.getIn(["Switch", loginId, "switch", "switchDetailsLoading"], false),
    user,
    sectorInfoLoading,
    sectorinfo,
    expenseProjId,
    vendorId,
    config,
    sub_market
  }
}

export default connect(stateToProps, {
  ...formActions, submitWorkorderRequest, fetchSiteDetails, fetchSwitchDetails, fetchGeneratorDetails, fetchHvacDetails,
  fetchGenTankDetails, submitGenReadingsRequest, 
  uploadFilesWO, resetProps, deleteSavedGenReadMsg, fetchEventsBySiteUnid, deleteMsg, fetchExpenseProjIdData,
  submitFixedQuoteInvoice, getSectorInfo, submitFilesInvoice
})(CreateWORequest)
