import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import ListOfFiles from './ListOfFiles'
import { AccordionDetails, Radio, RadioGroup, Accordion, AccordionSummary, FormControlLabel } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Select from 'react-select'
import * as pmActions from "../actions"
import { connect } from "react-redux"
import { Map, List, fromJS } from 'immutable'
import moment from 'moment'
import Loader from '../../Layout/components/Loader'
import MessageBox from '../../Forms/components/MessageBox'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils.js'
import { Picky } from 'react-picky';
import 'react-picky/dist/picky.css';
import { submitGenReadingsRequest } from '../../VendorDashboard/actions.js'
import { saveElogByWorkOrderID } from '../../Elog/actions.js'
import SiteInformation from '../../sites/components/SiteInformation'

class PMModelDetails extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filesData: [],
      fileSizeError: false,
      repairDrpdwn: [],
      updatedData: {
        "PM_DATE": [this.getDate(), this.getDate()],
      },

      invalidEntry: false,
      invalidEntryMsg: 'Enter readings in range [1-100]',
      disableSubmit: true,
      renderText: false,
      compAttDetails: {},
      pm_unid: this.randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      hvacAtts2: [],
      selectedOthers: [],
      pageLoading: false,
      showText: false,
      showBill: false,
      compAttError: false,
      hvacAtts3: [],
      hvacAtts1: [],
      hvacAtts4: [],
      genAtts2: [],
      genAtts3: [],
      genAtts4: [],
      genAtts1: [],
      drpdwnOptions1: [{ value: 2.5, label: '2.5', isFixed: true }, { value: '2.6', label: '2.6', isFixed: true }, { value: '2.7', label: '2.7', isFixed: true }, { value: '2.8', label: '2.8', isFixed: true }, { value: '2.9', label: '2.9', isFixed: true }, { value: '3', label: '3', isFixed: true }, { value: '3.1', label: '3.1', isFixed: true }, { value: '3.2', label: '3.2', isFixed: true }, { value: '3.3', label: '3.3', isFixed: true }, { value: '3.4', label: '3.4', isFixed: true }, { value: '3.5', label: '3.5', isFixed: true }, { value: '3.6', label: '3.6', isFixed: true }, { value: '3.7', label: '3.7', isFixed: true }, { value: '3.8', label: '3.8', isFixed: true }, { value: '3.9', label: '3.9', isFixed: true }, { value: '4', label: '4', isFixed: true }, { value: '4.1', label: '4.1', isFixed: true }, { value: '4.2', label: '4.2', isFixed: true }, { value: '4.3', label: '4.3', isFixed: true }, { value: '4.4', label: '4.4', isFixed: true }, { value: '4.5', label: '4.5', isFixed: true }, { value: '4.6', label: '4.6', isFixed: true }, { value: '4.7', label: '4.7', isFixed: true }, { value: '4.8', label: '4.8', isFixed: true }, { value: '4.9', label: '4.9', isFixed: true }, { value: '5', label: '5', isFixed: true }, { value: '5.1', label: '5.1', isFixed: true }, { value: '5.2', label: '5.2', isFixed: true }, { value: '5.3', label: '5.3', isFixed: true }, { value: '5.4', label: '5.4', isFixed: true }, { value: '5.5', label: '5.5', isFixed: true }, { value: '5.6', label: '5.6', isFixed: true }, { value: '5.7', label: '5.7', isFixed: true }, { value: '5.8', label: '5.8', isFixed: true }, { value: '5.9', label: '5.9', isFixed: true }, { value: '6', label: '6', isFixed: true }, { value: '6.1', label: '6.1', isFixed: true }, { value: '6.2', label: '6.2', isFixed: true }, { value: '6.3', label: '6.3', isFixed: true }, { value: '6.4', label: '6.4', isFixed: true }, { value: '6.5', label: '6.5', isFixed: true }, { value: '6.6', label: '6.6', isFixed: true }, { value: '6.7', label: '6.7', isFixed: true }, { value: '6.8', label: '6.8', isFixed: true }, { value: '6.9', label: '6.9', isFixed: true }, { value: '7', label: '7', isFixed: true }, { value: '7.1', label: '7.1', isFixed: true }, { value: '7.2', label: '7.2', isFixed: true }, { value: '7.3', label: '7.3', isFixed: true }, { value: '7.4', label: '7.4', isFixed: true }, { value: '7.5', label: '7.5', isFixed: true }, { value: '7.6', label: '7.6', isFixed: true }, { value: '7.7', label: '7.7', isFixed: true }, { value: '7.8', label: '7.8', isFixed: true }, { value: '7.9', label: '7.9', isFixed: true }, { value: '8', label: '8', isFixed: true }, { value: '8.1', label: '8.1', isFixed: true }, { value: '8.2', label: '8.2', isFixed: true }, { value: '8.3', label: '8.3', isFixed: true }, { value: '8.4', label: '8.4', isFixed: true }, { value: '8.5', label: '8.5', isFixed: true }, { value: '8.6', label: '8.6', isFixed: true }, { value: '8.7', label: '8.7', isFixed: true }, { value: '8.8', label: '8.8', isFixed: true }, { value: '8.9', label: '8.9', isFixed: true }, { value: '9', label: '9', isFixed: true }, { value: '9.1', label: '9.1', isFixed: true }, { value: '9.2', label: '9.2', isFixed: true }, { value: '9.3', label: '9.3', isFixed: true }, { value: '9.4', label: '9.4', isFixed: true }, { value: '9.5', label: '9.5', isFixed: true }, { value: '9.6', label: '9.6', isFixed: true }, { value: '9.7', label: '9.7', isFixed: true }, { value: '9.8', label: '9.8', isFixed: true }, { value: '9.9', label: '9.9', isFixed: true }, { value: '10', label: '10', isFixed: true }],

      drpdwnOptions2: [{ value: 50, label: '50', isFixed: true }, { value: 51, label: '51', isFixed: true }, { value: 52, label: '52', isFixed: true }, { value: 53, label: '53', isFixed: true }, { value: 54, label: '54', isFixed: true }, { value: 55, label: '55', isFixed: true }, { value: 56, label: '56', isFixed: true }, { value: 57, label: '57', isFixed: true }, { value: 58, label: '58', isFixed: true }, { value: 59, label: '59', isFixed: true }, { value: 60, label: '60', isFixed: true }, { value: 61, label: '61', isFixed: true }, { value: 62, label: '62', isFixed: true }, { value: 63, label: '63', isFixed: true }, { value: 64, label: '64', isFixed: true }, { value: 65, label: '65', isFixed: true }, { value: 66, label: '66', isFixed: true }, { value: 67, label: '67', isFixed: true }, { value: 68, label: '68', isFixed: true }, { value: 69, label: '69', isFixed: true }, { value: 70, label: '70', isFixed: true }, { value: 71, label: '71', isFixed: true }, { value: 72, label: '72', isFixed: true }, { value: 73, label: '73', isFixed: true }, { value: 74, label: '74', isFixed: true }, { value: 75, label: '75', isFixed: true }, { value: 76, label: '76', isFixed: true }, { value: 77, label: '77', isFixed: true }, { value: 78, label: '78', isFixed: true }, { value: 79, label: '79', isFixed: true }, { value: 80, label: '80', isFixed: true }]


    }
    this.aList = List()
    this.formUpdatedData = this.formUpdatedData.bind(this)
    this.changeDiffSetPtValue = this.changeDiffSetPtValue.bind(this)
    this.getCompDetails = this.getCompDetails.bind(this)
    this.generateInsppdfInit = this.generateInsppdfInit.bind(this)
  }
  async getCompDetails() {
    const { user, loginId, vendorId, fetchGenTankDetails, fetchHvacDetails, PMDetails,
      pmType, fetchPmModelAttributeDetails, fetchCompletedAttDetails, isPmSelected, poItemId } = this.props
    let pm_type = poItemId ? null : pm_type
    await fetchCompletedAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID).then(async action => {

      if (action.type === 'FETCH_CMPLTDATTDET_FAILURE') {
        this.props.notiref.addNotification({
          title: 'error',
          position: "br",
          level: 'error',
          message: "Something went wrong please try again after sometime!"
        })


      }
      else if (action.type === 'FETCH_CMPLTDATTDET_SUCCESS') {
        if (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT' &&
          action.pmCompAttDetails.attachmentsData.length > 0 &&
          action.pmCompAttDetails.attributeData.filter(ad =>
            !ad.PM_TMPLT_ATTR_NEW_VALUE && ad.PM_TMPLT_ATTR_NAME !== 'Comments' && !['26', '27', '28', '29'].includes(ad.PM_TMPLT_ATTR_ID.toString())).length === 0) {

          this.setState({
            disableSubmit: false
          })
        }

        await this.setState({

          compAttDetails: action.pmCompAttDetails

        })
      }
    })
  }
  componentDidMount() {


    const { user, loginId, vendorId, fetchGenTankDetails, fetchHvacDetails, PMDetails,
      pmType, fetchPmModelAttributeDetails, fetchCompletedAttDetails, isPmSelected, poItemId } = this.props
    let pm_type = poItemId && poItemId != '' ? null : pmType
    this.setState({ pageLoading: true })
    fetchPmModelAttributeDetails(vendorId, loginId, pm_type, poItemId)
      .then(async action => {

        if (action.type === 'FETCH_PMMODELATT_DETAILS_SUCCESS') {
          await this.getCompDetails()
          if (!!pmType && pmType === 'GENERATOR PM') {
            fetchGenTankDetails(vendorId, loginId, PMDetails.PM_ITEM_UNID, PMDetails.PM_LIST_ITEM_ID).then(action => {

              if (!!this.props.hvacInfoErrors || !!this.props.genTankInfoError) {
                this.props.notiref.addNotification({
                  title: 'error',
                  position: "br",
                  level: 'error',
                  message: "Something went wrong please try again after sometime!"
                })

              }
              else if (action.type === 'FETCH_GENTANKDETAILS_SUCCESS') {
                this.formUpdatedData()

                var genAtts2 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_NAME !== 'GENREADINGUNID' && ma.PM_TMPLT_ATTR_FLD_GROUP.includes("2-")).map(gmd => ({
                  ...gmd,
                  renderText: false,
                  optionSelected: false
                }))
                var genAtts3 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_NAME !== 'GENREADINGUNID' && ma.PM_TMPLT_ATTR_FLD_GROUP.includes("3-"))
                var genAtts4 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_NAME !== 'GENREADINGUNID' && ma.PM_TMPLT_ATTR_FLD_GROUP.includes("4-")).map(gmd => {

                  if (gmd.PM_TMPLT_ATTR_FLD_TYPE === "MULTI DROPDOWN" && gmd.PM_TMPLT_ATTR_FLD_GROUP !== '4-2' && gmd.PM_TMPLT_ATTR_FLD_GROUP !== '4-3') {
                    var currentDropDownValue = []
                    if (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT') {

                      currentDropDownValue = this.formDefaultRepairDropdownValue(gmd)
                      if (!(currentDropDownValue.selOptions[0].value === '')) {
                        this.setState({ repairDrpdwn: currentDropDownValue.selOptions })
                      }
                    }
                    else if (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING' || this.props.PMDetails.COMPLETED_BY === "") {
                      currentDropDownValue = { value: '', label: '', isFixed: true }
                    }
                    return {
                      ...gmd,
                      currentDropDownValue,

                      otherSelected: false
                    }
                  }

                  else {
                    return {
                      ...gmd,

                      otherSelected: false
                    }
                  }
                })

                var genAtts1 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_NAME !== 'GENREADINGUNID' && ma.PM_TMPLT_ATTR_FLD_GROUP.includes("1-"))
                this.setState({

                  genAtts1,
                  genAtts2,
                  genAtts3,
                  genAtts4
                })
              }
            })
          }

          else if (!!pmType && pmType === 'HVAC PM') {
            let type = 'SITE'

            fetchHvacDetails(vendorId, loginId, PMDetails.PM_ITEM_UNID, PMDetails.PM_LIST_ITEM_ID, type).then(action => {

              if (!!this.props.hvacInfoErrors || this.props.genTankInfoError) {
                this.props.notiref.addNotification({
                  title: 'error',
                  position: "br",
                  level: 'error',
                  message: "Something went wrong please try again after sometime!"
                })

              }
              else if (action.type === 'FETCH_HVACDETAILS_SUCCESS') {
                this.formUpdatedData()

                var hvacAtts2 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_FLD_GROUP === "2").map(hmd => ({
                  ...hmd,
                  renderText: false,
                  optionSelected: false
                }))
                var hvacAtts3 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_FLD_GROUP.includes("3-")).map(hmd => {

                  if (hmd.PM_TMPLT_ATTR_FLD_TYPE === "DROPDOWN" && hmd.PM_TMPLT_ATTR_ID !== 34 && hmd.PM_TMPLT_ATTR_ID !== 36) {
                    var currentDropDownValue
                    if (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT') {
                      currentDropDownValue = this.formDefaultDropdownValue(hmd)

                    }
                    else if (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING' || this.props.PMDetails.COMPLETED_BY === "") {
                      currentDropDownValue = { value: '', label: '', isFixed: true }
                    }
                    return {
                      ...hmd,
                      currentDropDownValue,

                      otherSelected: false
                    }
                  }

                  else {
                    return {
                      ...hmd,

                      otherSelected: false
                    }
                  }
                })
                var hvacAtts4 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_FLD_GROUP.includes("4-")).map(hmd => {

                  if (hmd.PM_TMPLT_ATTR_FLD_TYPE === "MULTI DROPDOWN" && hmd.PM_TMPLT_ATTR_FLD_GROUP !== '4-2' && hmd.PM_TMPLT_ATTR_FLD_GROUP !== '4-3') {
                    var currentDropDownValue = []
                    if (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT') {
                      currentDropDownValue = this.formDefaultRepairDropdownValue(hmd)
                      if (!(currentDropDownValue.selOptions[0].value === '')) {
                        this.setState({ repairDrpdwn: currentDropDownValue.selOptions })
                      }
                    }
                    else if (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING'|| this.props.PMDetails.COMPLETED_BY === "") {
                      currentDropDownValue = { value: '', label: '', isFixed: true }
                    }
                    return {
                      ...hmd,
                      currentDropDownValue,

                      otherSelected: false
                    }
                  }

                  else {
                    return {
                      ...hmd,

                      otherSelected: false
                    }
                  }
                })

                var hvacAtts1 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_FLD_GROUP === "1")

                this.setState({

                  hvacAtts2,
                  hvacAtts3,
                  hvacAtts1,
                  hvacAtts4
                }, () => this.changeDiffSetPtValue())
              }
            })
          }
          else if (!isPmSelected && poItemId) {
            this.formUpdatedData()
            var hvacAtts1 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_FLD_GROUP.includes("1-"))
            var hvacAtts3 = this.props.modelAttributes.filter(ma => ma.PM_TMPLT_ATTR_FLD_GROUP.includes("3-"))
            this.setState({
              hvacAtts1,
              hvacAtts3
            })
          }

        }
        else if (action.type === 'FETCH_PMMODELATT_DETAILS_FAILURE') {

          this.props.notiref.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: "Something went wrong please try again after sometime!"
          })


        }
      })

    this.setState({ pageLoading: false })



  }
  formDefaultSetptValue = (currObj) => {

    return { value: this.state.updatedData[currObj.PM_TMPLT_ATTR_NAME][1], label: this.state.updatedData[currObj.PM_TMPLT_ATTR_NAME][1], isFixed: true }
  }
  formDefaultDropdownValue = (currObj) => {
    return { value: this.state.updatedData[currObj.PM_TMPLT_ATTR_NAME][1], label: this.state.updatedData[currObj.PM_TMPLT_ATTR_NAME][1], isFixed: true }
  }
  formDefaultRepairDropdownValue = (currObj) => {

    let selOptions = this.state.updatedData[currObj.PM_TMPLT_ATTR_NAME][1].split(',').map(option => ({ value: option, label: option, isFixed: true }))
    return { selOptions }
  }

  async changeDiffSetPtValue(manId = '', attMap, radioInputs) {

    const crntMan1Value = (!!this.state.hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === 3) && this.state.hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === 3).currentDropDownValue) ? this.state.hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === 3).currentDropDownValue.value : ''
    const crntMan2Value = (!!this.state.hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === 15) && this.state.hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === 15).currentDropDownValue) ? this.state.hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === 15).currentDropDownValue.value : ''

    if (!manId || manId === 3) {
      await this.hideSetptValue(crntMan1Value, 34)
      await this.setDiffSetPt(crntMan1Value, 34, this.props.PMDetails.PM_ITEM_STATUS, manId, attMap, radioInputs)
    }

    if (!manId || manId === 15) {
      await this.hideSetptValue(crntMan2Value, 36)
      await this.setDiffSetPt(crntMan2Value, 36, this.props.PMDetails.PM_ITEM_STATUS, manId, attMap, radioInputs)
    }

    return
  }
  hideSetptValue = (crntManValue, attId) => {
    var hvacAtts3

    if (crntManValue === 'AirSys') {
      hvacAtts3 = this.state.hvacAtts3.map(hat => {
        if (hat.PM_TMPLT_ATTR_ID === attId) {
          return {
            ...hat,
            hideSetptValue: false
          }
        }
        else {
          return hat
        }
      })

    }
    else if (crntManValue === 'Marvair' || crntManValue === 'Bard') {
      hvacAtts3 = this.state.hvacAtts3.map(hat => {
        if (hat.PM_TMPLT_ATTR_ID === attId) {
          return {
            ...hat,
            hideSetptValue: false
          }
        }
        else {
          return hat
        }
      })

    }
    else {
      hvacAtts3 = this.state.hvacAtts3.map(hat => {
        if (hat.PM_TMPLT_ATTR_ID === attId) {
          return {
            ...hat,
            hideSetptValue: true
          }
        }
        else {
          return hat
        }
      })
    }



    this.setState({ hvacAtts3 })
    return;
  }
  setDiffSetPt = (crntManValue, attId, itemStatus, manId, attMap, radioInputs) => {

    var hvacAtts3
    var updatedData
    var diffSetPtAtt
    if (crntManValue === 'AirSys') {
      hvacAtts3 = this.state.hvacAtts3.map(hat => {
        if (hat.PM_TMPLT_ATTR_ID === attId) {
          return {
            ...hat,
            crntSetPtValue: itemStatus === 'PENDING' ? '' : itemStatus === 'PENDING_DRAFT' ? !manId ? this.formDefaultSetptValue(hat) : '' : '',
            setPtOptions: this.state.drpdwnOptions1
          }
        }
        else {
          return hat
        }
      })

      diffSetPtAtt = !!hvacAtts3 && !!hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === attId) ? hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === attId) : {}
      if (itemStatus === 'PENDING_DRAFT' && !manId) {
        updatedData = {
          ...this.state.updatedData
        }
      }
      else {
        updatedData = {
          ...this.state.updatedData,

          [diffSetPtAtt.PM_TMPLT_ATTR_NAME]: ['', '', '']
        }
      }


    }
    else if (crntManValue === 'Marvair' || crntManValue === 'Bard') {
      hvacAtts3 = this.state.hvacAtts3.map(hat => {
        if (hat.PM_TMPLT_ATTR_ID === attId) {
          return {
            ...hat,
            crntSetPtValue: itemStatus === 'PENDING' || this.state.updatedData[hat.PM_TMPLT_ATTR_NAME][1] === 'NOT APPLICABLE' ? '' : itemStatus === 'PENDING_DRAFT' ? !manId ? this.formDefaultSetptValue(hat) : '' : '',
            setPtOptions: this.state.drpdwnOptions2
          }
        }
        else {
          return hat
        }
      })
      diffSetPtAtt = !!hvacAtts3 && !!hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === attId) ? hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === attId) : {}

      if (itemStatus === 'PENDING_DRAFT' && !manId) {
        updatedData = {
          ...this.state.updatedData
        }
      }
      else {
        updatedData = {
          ...this.state.updatedData,

          [diffSetPtAtt.PM_TMPLT_ATTR_NAME]: ['', '', '']
        }
      }
    }
    else {
      hvacAtts3 = this.state.hvacAtts3

      diffSetPtAtt = !!hvacAtts3 && !!hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === attId) ? hvacAtts3.find(hat => hat.PM_TMPLT_ATTR_ID === attId) : {}
      updatedData = {
        ...this.state.updatedData,

        [diffSetPtAtt.PM_TMPLT_ATTR_NAME]: ['', 'NOT APPLICABLE', '']
      }
    }

    this.setState({ hvacAtts3, updatedData }, () => {

      if (!!attMap && !!radioInputs)
        this.checkDisable(attMap, radioInputs)
    })
    return;
  }





  async formUpdatedData() {

    const { genData, pmType, isPmSelected, poItemId } = this.props
    const { hvacData } = this.props
    var updatedData = {}, showBill = false, fuelAdded = ''



    if (pmType === 'GENERATOR PM') {

      this.props.modelAttributes.forEach(mat => {
        if (mat.PM_TMPLT_ATTR_NAME === "PM_DATE") {
          updatedData[mat.PM_TMPLT_ATTR_NAME] = [this.getDate(), this.getDate()]
        }
        else {
          var currentSystemRecord = (!!genData && genData.length > 0 &&
            mat.PM_TMPLT_ATTR_FLD_GROUP.includes("2-") && !!mat.PM_TMPLT_ATTR_FLD_LBLMAP) ? genData[0][mat.PM_TMPLT_ATTR_FLD_LBLMAP] : ''
          var defaultValue = (!!this.state.compAttDetails.attributeData && !!this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME) && this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE) ? this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE : ''
          if (!!this.state.compAttDetails.attributeData && !!this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME) && this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_ID === 21) {
            fuelAdded = this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE
          }
          var defaultReasonForselctn = (!!this.state.compAttDetails.attributeData && !!this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME) && this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE_SENT) ? this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE_SENT : ''
          updatedData[mat.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, defaultValue, defaultReasonForselctn]
        }
      })
      if (!!fuelAdded && parseFloat(fuelAdded) > 0) {
        showBill = true
      } else { showBill = false }
    }
    else if (pmType === 'HVAC PM' || (!isPmSelected && poItemId)) {

      this.props.modelAttributes.forEach(mat => {
        var defaultValue = (!!this.state.compAttDetails.attributeData && !!this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME) && this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE) ? this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE : ''
        var currentSystemRecord = (!!hvacData && hvacData.length > 0 && mat.PM_TMPLT_ATTR_FLD_GROUP === "2"
          && !!mat.PM_TMPLT_ATTR_FLD_LBLMAP && !!hvacData[hvacIndex] &&
          !!hvacData[hvacIndex][recordMapping]) ? hvacData[hvacIndex][recordMapping] : ''
        var defaultReasonForselctn = (!!this.state.compAttDetails.attributeData &&
          !!this.state.compAttDetails.attributeData.find(ad => ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME) &&
          this.state.compAttDetails.attributeData.find(ad =>
            ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE_SENT) ?
          this.state.compAttDetails.attributeData.find(ad =>
            ad.PM_TMPLT_ATTR_NAME === mat.PM_TMPLT_ATTR_NAME).PM_TMPLT_ATTR_NEW_VALUE_SENT : ''
        updatedData[mat.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, defaultValue, defaultReasonForselctn]

        if (mat.PM_TMPLT_ATTR_NAME === "PM_DATE" || mat.PM_TMPLT_ATTR_NAME.includes("DATE")) {
          updatedData[mat.PM_TMPLT_ATTR_NAME] = [this.getDate(), this.getDate()]
        }
        else if (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING' && mat.PM_TMPLT_ATTR_FLD_TYPE === "DROPDOWN" && (mat.PM_TMPLT_ATTR_ID !== 34 || mat.PM_TMPLT_ATTR_ID !== 36)) {
          updatedData[mat.PM_TMPLT_ATTR_NAME] = ['', '', '']
        }
        else {
          var recordMapping = mat.PM_TMPLT_ATTR_FLD_GROUP === "2" && !!mat.PM_TMPLT_ATTR_FLD_LBLMAP ? mat.PM_TMPLT_ATTR_FLD_LBLMAP.split('-')[0] : ''
          var hvacIndex = Number(mat.PM_TMPLT_ATTR_FLD_GROUP === "2" && !!mat.PM_TMPLT_ATTR_FLD_LBLMAP ? mat.PM_TMPLT_ATTR_FLD_LBLMAP.split('-')[1] : null)
          var currentSystemRecord = (!!hvacData && hvacData.length > 0 && mat.PM_TMPLT_ATTR_FLD_GROUP === "2" && !!mat.PM_TMPLT_ATTR_FLD_LBLMAP && !!hvacData[hvacIndex] && !!hvacData[hvacIndex][recordMapping]) ? hvacData[hvacIndex][recordMapping] : ''
          updatedData[mat.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, defaultValue, defaultReasonForselctn]
        }
      })
    }
    await this.setState({ updatedData, showBill })

    return;

  }


  onAttachRemove(attMap, radioInputs, index) {
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
    let { isPmSelected, poItemId } = this.props
    var rad = radioInputs.filter((ri) => !ri.includes('Recommended for replacement'))
    var rad1 = radioInputs.filter((ri) => ri.includes('Recommended for replacement'))
    this.setState({
      filesData: this.state.filesData.filter((_, i) => i !== index)
    }, () => {
      var { Comments, GENREADINGUNID, ...updatedDatawithoutComments } = this.state.updatedData;

      let mandAttKeys = this.props.modelAttributes.map((att) => {
        if (att.IS_MANDATORY === "Y") return att.PM_TMPLT_ATTR_NAME
        else return null
      })
      let mandateFields = (Object.entries(this.state.updatedData)).filter(pair => {
        if (mandAttKeys.includes(pair[0]) && pair[0] !== 'GENREADINGUNID') {
          return pair
        }
      })
      if (this.props.pmType === 'GENERATOR PM') {

        if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0) && Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 && this.checkRadioInput(radioInputs).length === 0) {

          this.setState({
            disableSubmit: false
          })
        }
        else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 || this.checkRadioInput(radioInputs).length > 0) {

          this.setState({
            disableSubmit: true
          })
        }
      } else if (this.props.pmType === 'HVAC PM') {


        if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0) && Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 && this.checkRadioInput(rad).length === 0 && this.checkRadioInput1(rad1).length === 0) {



          this.setState({
            disableSubmit: false
          })


        }

        else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 || (this.checkRadioInput(rad).length > 0 || this.checkRadioInput1(rad1).length > 0)) {
          this.setState({
            disableSubmit: true
          })
        }
      }
      else if (!isPmSelected && poItemId) {
        if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0)
          && Object.values(updatedDatawithoutComments).filter(val => !val[1]).length === 0) {
          this.setState({
            disableSubmit: false
          })
        }
        else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0)
          || Object.values(updatedDatawithoutComments).filter(val => !val[1]).length > 0) {
          this.setState({
            disableSubmit: true
          })
        }
      }

    })
    this.forceUpdate()
  }


  onFileDrop(attMap, radioInputs, files) {
    let { isPmSelected, poItemId } = this.props
    const { vendorId, loginId, uploadFiles, currentPmListID, PMDetails } = this.props
    var rad = radioInputs.filter((ri) => !ri.includes('Recommended for replacement'))
    var rad1 = radioInputs.filter((ri) => ri.includes('Recommended for replacement'))

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
          }, () => {

            var { Comments, GENREADINGUNID, ...updatedDatawithoutComments } = this.state.updatedData;

            let mandAttKeys = this.props.modelAttributes.map((att) => {
              if (att.IS_MANDATORY === "Y") return att.PM_TMPLT_ATTR_NAME
              else return null
            })
            let mandateFields = (Object.entries(this.state.updatedData)).filter(pair => {
              if (mandAttKeys.includes(pair[0]) && pair[0] !== 'GENREADINGUNID') {
                return pair
              }
            })
            if (this.props.pmType === 'GENERATOR PM') {

              if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0)
                &&
                Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 &&
                this.checkRadioInput(radioInputs).length === 0) {

                this.setState({
                  disableSubmit: false
                })
              }
              else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) ||
                this.state.compAttDetails.attachmentsData.length === 0 ||
                Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 ||
                this.checkRadioInput(radioInputs).length > 0) {

                this.setState({
                  disableSubmit: true
                })
              }

            } else if (this.props.pmType === 'HVAC PM') {

              if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0)
                &&
                Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 &&
                this.checkRadioInput(rad).length === 0 && this.checkRadioInput1(rad1).length === 0) {



                this.setState({
                  disableSubmit: false
                })


              }

              else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0)
                || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0
                || (this.checkRadioInput(rad).length > 0 || this.checkRadioInput1(rad1).length > 0)) {
                this.setState({
                  disableSubmit: true
                })
              }
            }
            else if (!isPmSelected && poItemId) {
              if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0)
                && Object.values(updatedDatawithoutComments).filter(val => !val[1]).length === 0) {
                this.setState({
                  disableSubmit: false
                })
              }
              else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0)
                || Object.values(updatedDatawithoutComments).filter(val => !val[1]).length > 0) {
                this.setState({
                  disableSubmit: true
                })
              }
            }

          })

          this.forceUpdate()
        }.bind(this)
        reader.readAsDataURL(file)
      }
    })
  }
  checkRadioInput = (radioInputs) => {
    return radioInputs.filter(ri => {
      if (!this.state.updatedData[ri][1]) {
        return true
      }
      else if (this.state.updatedData[ri][1] === 'No' && !this.state.updatedData[ri][2]) {
        return true
      }
      else if (this.state.updatedData[ri][1] === 'Yes') {
        return false
      }
    })
  }
  checkRadioInput1 = (radioInputs) => {
    return radioInputs.filter(ri => {
      if (!this.state.updatedData[ri][1]) {
        return true
      }
      else if (this.state.updatedData[ri][1] === 'No') {
        return false
      }
      else if (this.state.updatedData[ri][1] === 'Yes' && !this.state.updatedData[ri][2]) {
        return true
      }
    })


  }
  toObject = (pairs) => {
    return Array.from(pairs).reduce(
      (acc, [key, value]) => Object.assign(acc, { [key]: value }),
      {},
    );
  }
  handleTextAreaChange = (mdfdObj, attMap, radioInputs, e) => {
    let { isPmSelected, poItemId } = this.props
    var locUpdatedData = this.state.updatedData[e.target.name]
    locUpdatedData[2] = e.target.value
    var textInput = locUpdatedData
    var rad = radioInputs.filter((ri) => !ri.includes('Recommended for replacement'))
    var rad1 = radioInputs.filter((ri) => ri.includes('Recommended for replacement'))
    this.setState({
      updatedData: {
        ...this.state.updatedData,

        [e.target.name]: textInput
      }
    }, () => {
      var { Comments, GENREADINGUNID, ...updatedDatawithoutComments } = this.state.updatedData;

      let mandAttKeys = this.props.modelAttributes.map((att) => {
        if (att.IS_MANDATORY === "Y") return att.PM_TMPLT_ATTR_NAME
        else return null
      })
      let mandateFields = (Object.entries(this.state.updatedData)).filter(pair => {
        if (mandAttKeys.includes(pair[0]) && pair[0] !== 'GENREADINGUNID') {
          return pair
        }
      })

      if (this.props.pmType === 'GENERATOR PM') {



        if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0) && Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 && this.checkRadioInput(radioInputs).length === 0) {

          this.setState({
            disableSubmit: false
          })
        }
        else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 || this.checkRadioInput(radioInputs).length > 0) {

          this.setState({
            disableSubmit: true
          })
        }

      } else if (this.props.pmType === 'HVAC PM') {

        if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0) && Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 && this.checkRadioInput(rad).length === 0 && this.checkRadioInput1(rad1).length === 0) {

          this.setState({
            disableSubmit: false
          })


        }
        else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 || (this.checkRadioInput(rad).length > 0 || this.checkRadioInput1(rad1).length > 0)) {
          this.setState({
            disableSubmit: true
          })
        }
      }
      else if (!isPmSelected && poItemId) {
        if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0)
          && Object.values(updatedDatawithoutComments).filter(val => !val[1]).length === 0) {
          this.setState({
            disableSubmit: false
          })
        }
        else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0)
          || Object.values(updatedDatawithoutComments).filter(val => !val[1]).length > 0) {
          this.setState({
            disableSubmit: true
          })
        }
      }

    })
  }
  handleDropdownChange = (mdfdObj, attMap, radioInputs, e) => {

    const hvacAtts3 = this.state.hvacAtts3.map(hat => {
      if (hat.PM_TMPLT_ATTR_NAME === mdfdObj.PM_TMPLT_ATTR_NAME && e.value === 'Other') {

        return {
          ...hat,
          currentDropDownValue: { value: e.value, label: e.value, isFixed: true },
          otherSelected: true
        }
      }
      else if (hat.PM_TMPLT_ATTR_NAME === mdfdObj.PM_TMPLT_ATTR_NAME && e.value !== 'Other') {

        return {
          ...hat,
          currentDropDownValue: { value: e.value, label: e.value, isFixed: true },
          otherSelected: false
        }
      }
      else {
        return hat
      }
    })
    const updatedData = {
      ...this.state.updatedData,
      [mdfdObj.PM_TMPLT_ATTR_NAME]: ['', e.value, '']
    }
    this.setState({ hvacAtts3, updatedData }, () => {
      if (mdfdObj.PM_TMPLT_ATTR_ID === 3 || mdfdObj.PM_TMPLT_ATTR_ID === 15) {
        this.changeDiffSetPtValue(mdfdObj.PM_TMPLT_ATTR_ID, attMap, radioInputs)
      }
      this.checkDisable(attMap, radioInputs)

    })
  }
  handleAddToSel = (mdfdObj) => {
    const repairDrpdwn = document.getElementById('otherOption').value.split(',').map(val => ({
      value: val,
      label: val
    })).concat(this.state.repairDrpdwn.filter(val => val.value !== 'Other'))
    const selectedOthers = document.getElementById('otherOption').value.split(',').map(val => ({
      value: val,
      label: val,
      isFixed: true
    })).concat(this.state.selectedOthers)
    document.getElementById('otherOption').value = ''
    this.setState({ repairDrpdwn, selectedOthers, showText: false }, () => {
      this.updateRepairs(mdfdObj)
    })

  }
  updateRepairs = (mdfdObj) => {
    let repairValuesArr = this.state.repairDrpdwn.filter(val => val.value !== 'Other').map(arr => arr.value)
    let repairValuesStr = repairValuesArr.toString()

    const updatedData = {
      ...this.state.updatedData,
      [mdfdObj.PM_TMPLT_ATTR_NAME]: ['', repairValuesStr, '']
    }
    if (this.props.pmType === 'HVAC PM') {
      const hvacAtts4 = this.state.hvacAtts4.map(hat => {
        if (hat.PM_TMPLT_ATTR_NAME === mdfdObj.PM_TMPLT_ATTR_NAME) {

          return {
            ...hat,
            currentDropDownValue: repairValuesStr,

          }
        }
        else {
          return hat
        }
      })
      this.setState({ updatedData, hvacAtts4 })
    }
    else if (this.props.pmType === 'GENERATOR PM') {
      const genAtts4 = this.state.genAtts4.map(gat => {
        if (gat.PM_TMPLT_ATTR_NAME === mdfdObj.PM_TMPLT_ATTR_NAME) {

          return {
            ...gat,
            currentDropDownValue: repairValuesStr,
          }
        }
        else {
          return gat
        }
      })
      this.setState({ updatedData, genAtts4 })
    }
  }

  async handleMultiDropdownChange(mdfdObj, e) {
    if (e.filter(arr => arr.value === 'Other').length > 0) {
      await this.setState({ repairDrpdwn: e, showText: true })
    }
    else {
      await this.setState({ repairDrpdwn: e, showText: false })
    }

    this.updateRepairs(mdfdObj)

  }

  setptDropdownChange = (mdfdObj, attMap, radioInputs, e) => {

    const hvacAtts3 = this.state.hvacAtts3.map(hat => {

      if (mdfdObj.PM_TMPLT_ATTR_NAME === hat.PM_TMPLT_ATTR_NAME) {
        return {
          ...hat,
          crntSetPtValue: { value: e.value, label: e.value, isFixed: true }

        }
      }
      else {
        return hat
      }

    })
    const updatedData = {
      ...this.state.updatedData,
      [mdfdObj.PM_TMPLT_ATTR_NAME]: ['', e.value, '']
    }
    this.setState({ hvacAtts3, updatedData }, () => { this.checkDisable(attMap, radioInputs) })
  }
  IsInRange = (number) => {
    return number > 0 && number <= 100
  }
  async handleInputChange(mdfdObj, attMap, radioInputs, e) {
    var targetName = e.target.name
    var targetValue = e.target.value
    var targetType = e.target.type
    if (targetName === 'Amount of fuel added') {
      if (parseFloat(targetValue) > 0) {
        this.setState({ showBill: true })
      }
      else {
        this.setState({ showBill: false })
      }
    }

    if (e.target.type === "radio") {
      var inputValue;
      if (this.props.pmType === 'GENERATOR PM') {

        var genAtts3 = this.state.genAtts3.map(ha => {
          if (ha.PM_TMPLT_ATTR_ID === mdfdObj.PM_TMPLT_ATTR_ID) {

            return {
              ...ha,
              [targetName]: [attMap[mdfdObj.PM_TMPLT_ATTR_NAME], targetValue],
              optionSelected: true
            }
          }
          else {
            return ha
          }
        })
        await this.setState({
          genAtts3
        })
      }
      else if (this.props.pmType === 'HVAC PM') {

        var hvacAtts3 = this.state.hvacAtts3.map(ha => {

          if (ha.PM_TMPLT_ATTR_ID === mdfdObj.PM_TMPLT_ATTR_ID) {
            return {
              ...ha,
              [targetName]: [attMap[mdfdObj.PM_TMPLT_ATTR_NAME], targetValue],
              optionSelected: true
            }
          }
          else {
            return ha
          }
        })
        await this.setState({
          hvacAtts3
        })
      }
      var atts = this.props.pmType === 'HVAC PM' ? this.state.hvacAtts3 : this.state.genAtts3
      if (!!atts.find(hat => hat.PM_TMPLT_ATTR_ID === mdfdObj.PM_TMPLT_ATTR_ID).optionSelected) {
        inputValue = [this.state.updatedData[targetName][0], targetValue, this.state.updatedData[targetName][2]]

      }
      else if (!atts.find(hat => hat.PM_TMPLT_ATTR_ID === mdfdObj.PM_TMPLT_ATTR_ID).optionSelected) {

        inputValue = [attMap[mdfdObj.PM_TMPLT_ATTR_NAME], targetValue]
      }

    }
    var invalidEntry = false
    if (this.props.pmType === 'GENERATOR PM' && mdfdObj.PM_TMPLT_ATTR_ID === 22 && !this.IsInRange(targetValue)) {
      invalidEntry = true
    }

    this.setState({
      updatedData: {
        ...this.state.updatedData,

        [targetName]: targetType === "radio" ? inputValue : [attMap[mdfdObj.PM_TMPLT_ATTR_NAME], targetValue]
      },
      invalidEntry

    }, () => {

      this.checkDisable(attMap, radioInputs)
    })


  }

  checkDisable = (attMap, radioInputs) => {
    var { Comments, GENREADINGUNID, ...updatedDatawithoutComments } = this.state.updatedData;

    let mandAttKeys = this.props.modelAttributes.map((att) => {
      if (att.IS_MANDATORY === "Y") return att.PM_TMPLT_ATTR_NAME
      else return null
    })
    let mandateFields = (Object.entries(this.state.updatedData)).filter(pair => {
      if (mandAttKeys.includes(pair[0]) && pair[0] !== 'GENREADINGUNID') {
        return pair
      }
    })
    var rad = radioInputs.filter((ri) => !ri.includes('Recommended for replacement'))
    var rad1 = radioInputs.filter((ri) => ri.includes('Recommended for replacement'))

    if (this.props.pmType === 'GENERATOR PM') {

      if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0) && Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 && this.checkRadioInput(radioInputs).length === 0) {

        this.setState({
          disableSubmit: false
        })
      }
      else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 || this.checkRadioInput(radioInputs).length > 0) {
        this.setState({
          disableSubmit: true
        })
      }


    } else if (this.props.pmType === 'HVAC PM') {

      if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0) && Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 && this.checkRadioInput(rad).length === 0 && this.checkRadioInput1(rad1).length === 0) {
        this.setState({
          disableSubmit: false
        })
      }
      else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 || (this.checkRadioInput(rad).length > 0 || this.checkRadioInput1(rad1).length > 0)) {
        this.setState({
          disableSubmit: true
        })
      }
    }
    else if (!this.props.isPmSelected && this.props.poItemId) {
      if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0)
        && Object.values(updatedDatawithoutComments).filter(val => !val[1]).length === 0) {
        this.setState({
          disableSubmit: false
        })
      }
      else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0)
        || Object.values(updatedDatawithoutComments).filter(val => !val[1]).length > 0) {
        this.setState({
          disableSubmit: true
        })
      }
    }

    return;
  }

  formPostRequest1 = (attrAction) => {
    const { PM_LIST_ID, PM_LIST_ITEM_ID, PM_ITEM_UNID } = this.props.PMDetails
    const { modelAttributes, userFname, pmType, isPmSelected, poItemId } = this.props

    var vendortechname = (!!this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME === "VENDORTECHNAME") && !!this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME === "VENDORTECHNAME")).PM_TMPLT_ATTR_NEW_VALUE ? this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME === "VENDORTECHNAME").PM_TMPLT_ATTR_NEW_VALUE : !!this.state.updatedData["VENDORTECHNAME"][1] ? this.state.updatedData["VENDORTECHNAME"][1] : ''

    const data = (pmType === 'HVAC PM' || (!isPmSelected && poItemId)) ? this.state.updatedData : (pmType === 'GENERATOR PM') ? { ...this.state.updatedData, GENREADINGUNID: ['', this.state.pm_unid] } : {}
    return Object.keys(data).map((udk) => {
      const { PM_TEMPLATE_ID,
        PM_TMPLT_ATTR_ID,
        PM_TMPLT_ATTR_NAME } = modelAttributes.filter((mda) => udk === mda.PM_TMPLT_ATTR_NAME)[0]
      const PM_TMPLT_ATTR_OLD_VALUE = !!data[udk][0] ? data[udk][0] : ''
      const PM_TMPLT_ATTR_NEW_VALUE = data[udk][1]
      const PM_TMPLT_ATTR_NEW_VALUE_SENT = !!data[udk][2] ? data[udk][2] : ''

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
        "PM_TMPLT_ATTR_ACTION": attrAction,
        "LAST_UPDATED_BY": vendortechname
      }

    })

  }
  formPostRequest2 = () => {
    const { genData } = this.props
    let readings = []

    let readingsObj = {
      reading_unid: '',
      gen_meta_universalid: (!!genData && genData.length > 0 && !!genData[0].gen_meta_universalid) ? genData[0].gen_meta_universalid : '',
      gen_emis_id: (!!genData && genData.length > 0 && !!genData[0].gen_emis_id) ? genData[0].gen_emis_id : '',
      ac_voltage: parseFloat(this.state.updatedData["AC Load (Volts):"][1], 10),
      ac_current: parseFloat(this.state.updatedData["AC Current (Amps)"][1], 10),
      oil_level: parseFloat(this.state.updatedData["Oil Level"][1], 10),
      fuel_level1: (parseFloat(this.state.updatedData["Fill Percentage (after fueling)"][1], 10) / 100).toFixed(2),
      fuel_gallonsadded1: parseFloat(this.state.updatedData["Amount of fuel added"][1], 10),
      totalruntime: parseInt(this.state.updatedData["Generator Runtime (hours)"][1], 10)
    }
    readings.push(readingsObj)
    let genTankReadingInput = {}
    genTankReadingInput["source_sys"] = "iopvendorportal"
    genTankReadingInput["source_unid"] = this.state.pm_unid
    genTankReadingInput["readings"] = readings
    return genTankReadingInput
  }
  formFilesPostRequest = () => {
    const { currentPmListID, PMDetails, loginId } = this.props

    return this.state.filesData.map(fd => {
      let file_name = !!fd.file_name ? fd.file_name : !!fd.PM_FILE_NAME ? fd.PM_FILE_NAME : ''
      let file_type = file_name.split('.')[file_name.split('.').length - 1]
      let mod_file_name = file_name.split('.')[0] + '.' + file_type
      return {
        "PM_LIST_ID": currentPmListID,
        "ASSOCIATED_PM_LISTS": `${currentPmListID},`,
        "PM_LIST_ITEM_ID": PMDetails.PM_LIST_ITEM_ID,
        "PM_LOCATION_UNID": PMDetails.PM_ITEM_UNID,
        "PM_FILE_CATEGORY": "VP",
        "PM_FILE_NAME": mod_file_name,
        "PM_FILE_TYPE": file_type,
        "PM_FILE_SIZE": fd.file_size,
        "PM_FILE_DATA": fd.file_data,
        "LAST_UPDATED_BY": loginId
      }

    })

  }
  attchmntConfirmtn = () => {
    this.setState({
      showConfirmDiv: true
    })
  }
  handleNoClick = () => {
    this.setState({
      showConfirmDiv: false
    })
  }
  randomString(length, chars) {
    var result = ''
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
    return result
  }
  formElogPostRequest = (PMDetails, loginId, vendorId, vendorName, pmType, title) => ({
    "oprtnType": "I",
    "shift": "Day",
    "sendemail": false,
    "privacyflag": "Public",
    "oncall": "No",
    "red_flag": "No",
    "contenttext": `${pmType.toUpperCase()} PM completed`,
    "files": [],
    "elogtype": "CELL_SITE",
    "login_id": loginId,
    "universalid": PMDetails.PM_ITEM_UNID,
    "unvalue": PMDetails.PM_LOCATION_NAME,
    "meta_createdname": this.state.updatedData["VENDORTECHNAME"][1],
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
  })
  saveAsDraft = () => {
    const { vendorId, vendorName, loginId, title, submitPMQuote, PMDetails, uploadFiles, currentPmListID, fetchPmGridDetails, pmType, submitGenReadingsRequest, saveElogByWorkOrderID } = this.props


    const submitpostRequest1 = {
      updatedData: this.formPostRequest1('PENDING_DRAFT')
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
  formpostReqGenpdf() {
    let { pmListNamepdf, vendorId, vendorName, poNum } = this.props
    let { PM_LIST_ID, PM_ITEM_STATUS, PM_LIST_ITEM_ID, PM_LIST_ITEM_ID_PS, PS_LOCATION_ID, PM_ITEM_UNID, PM_ITEM_COMPLETED_DATE, PM_LOCATION_NAME, PM_ITEM_COMPLETED_DATE_STAMP, SCHEDULE, LINE } = this.props.PMDetails

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
        "CREATED_DATE": moment(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME == "PM_DATE").PM_TMPLT_ATTR_NEW_VALUE) ? moment(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME == "PM_DATE").PM_TMPLT_ATTR_NEW_VALUE) : moment(),
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
        "PM_ITEM_COMPLETED_DATE": moment(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME == "PM_DATE").PM_TMPLT_ATTR_NEW_VALUE) ? moment(this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME == "PM_DATE").PM_TMPLT_ATTR_NEW_VALUE) : moment(),//
        "COMPLETED_BY": this.state.compAttDetails.attributeData.find(ca => ca.PM_TMPLT_ATTR_NAME === "VENDORTECHNAME").PM_TMPLT_ATTR_NEW_VALUE,
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
      "attributeData": this.state.compAttDetails.attributeData,
      "sitesInfo": this.state.compAttDetails.sitesInfo
    }
  }
  async generateInsppdfInit() {
    const { vendorId, vendorName, loginId, title, submitPMQuote, PMDetails, uploadFiles, currentPmListID,
      fetchPmGridDetails, pmType, submitGenReadingsRequest, saveElogByWorkOrderID, isPmSelected, poItemId, fetchCompletedAttDetails } = this.props
    let pdfInputGen = await this.formpostReqGenpdf()
    this.props.generateInspPDF(vendorId, loginId, this.props.PMDetails.PM_LIST_ITEM_ID, pdfInputGen, 'GENERATOR').then(actionGen => {
      this.props.handleHideModal()
      this.props.fetchPmGridDetails(vendorId, loginId, currentPmListID)
      if (actionGen.type == 'GENERATE_PDF_SUCCESS') {
        this.setState({ pageLoading: false })
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
  submitDetails = () => {
    const { vendorId, vendorName, loginId, title, submitPMQuote, PMDetails, uploadFiles, currentPmListID,
      fetchPmGridDetails, pmType, submitGenReadingsRequest, saveElogByWorkOrderID, isPmSelected, poItemId, fetchCompletedAttDetails } = this.props


    const submitpostRequest1 = {
      updatedData: this.formPostRequest1('COMPLETE')
    }

    var filesPostRequest = {
      "fileList": this.formFilesPostRequest()
    }
    let elogInput = this.formElogPostRequest(PMDetails, loginId, vendorId, vendorName, pmType, title)


    if (pmType === 'GENERATOR PM') {
      const submitpostRequest2 = this.formPostRequest2()
      this.setState({ pageLoading: true })
      submitGenReadingsRequest(this.state.pm_unid, submitpostRequest2).then((action) => {


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
      submitPMQuote(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, submitpostRequest1).then(async (action) => {

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

          if (this.state.filesData.length > 0) {
            uploadFiles(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, filesPostRequest).then(async (action) => {

              if (action.type === 'UPLOAD_FILES_SUCCESS') {

                this.props.notiref.addNotification({
                  title: 'success',
                  position: "br",
                  level: 'success',
                  message: "Files upload successful"
                })


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
                      compAttDetails: action.pmCompAttDetails
                    })

                    await this.generateInsppdfInit()


                  }
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
          else {
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
                  compAttDetails: action.pmCompAttDetails
                })

                let pdfInputGen = await this.formpostReqGenpdf()
                this.props.generateInspPDF(vendorId, loginId, this.props.PMDetails.PM_LIST_ITEM_ID, pdfInputGen, 'GENERATOR').then(actionGen => {
                  this.props.handleHideModal()
                  this.props.fetchPmGridDetails(vendorId, loginId, currentPmListID)
                  if (actionGen.type == 'GENERATE_PDF_SUCCESS') {
                    this.setState({ pageLoading: false })
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
            })
          }

        }
        if(this.props.initPMDashboard){
          setTimeout(() => { this.props.initPMDashboard() }, 2200);
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
    else if (pmType === 'HVAC PM' || (!isPmSelected && poItemId)) {


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
          if(this.props.initPMDashboard){
             setTimeout(() => { this.props.initPMDashboard() }, 2200);
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

  onSubmit = () => {

    this.submitDetails()

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
  getDate = () => {
    return moment().format('MM/DD/YYYY')
  }
  handleButtonChange = (mdfdObj, attMap, radioInputs, e) => {
    var rad = radioInputs.filter((ri) => !ri.includes('Recommended for replacement'))
    var rad1 = radioInputs.filter((ri) => ri.includes('Recommended for replacement'))

    if (e.target.value === "No") {
      var hvacAtts2 = this.state.hvacAtts2.map(ha => {
        if (ha.PM_TMPLT_ATTR_ID === mdfdObj.PM_TMPLT_ATTR_ID) {
          return {
            ...ha,
            renderText: true,
            optionSelected: true
          }
        }
        else {
          return ha
        }
      })
      var genAtts2 = this.state.genAtts2.map(ga => {

        if (ga.PM_TMPLT_ATTR_ID === mdfdObj.PM_TMPLT_ATTR_ID) {
          return {
            ...ga,
            renderText: true,
            optionSelected: true
          }
        }
        else {
          return ga
        }
      })


      

      this.setState({
        hvacAtts2,
        genAtts2
      })
    }
    else if (e.target.value === "Yes") {
      var hvacAtts2 = this.state.hvacAtts2.map(ha => {

        if (ha.PM_TMPLT_ATTR_ID === mdfdObj.PM_TMPLT_ATTR_ID) {

          return {
            ...ha,
            renderText: false,
            optionSelected: true

          }
        }
        else {
          return ha
        }
      })
      var genAtts2 = this.state.genAtts2.map(ga => {
        if (ga.PM_TMPLT_ATTR_ID === mdfdObj.PM_TMPLT_ATTR_ID) {

          return {
            ...ga,
            renderText: false,
            optionSelected: true

          }
        }
        else {
          return ga
        }
      })
      
      this.setState({
        hvacAtts2,
        genAtts2,
        updatedData: {
          ...this.state.updatedData,

          [mdfdObj.PM_TMPLT_ATTR_NAME]: [attMap[mdfdObj.PM_TMPLT_ATTR_NAME], attMap[mdfdObj.PM_TMPLT_ATTR_NAME]]
        }

      }, () => {
        var { Comments, GENREADINGUNID, ...updatedDatawithoutComments } = this.state.updatedData;

        let mandAttKeys = this.props.modelAttributes.map((att) => {
          if (att.IS_MANDATORY === "Y") return att.PM_TMPLT_ATTR_NAME
          else return null
        })
        let mandateFields = (Object.entries(this.state.updatedData)).filter(pair => {
          if (mandAttKeys.includes(pair[0]) && pair[0] !== 'GENREADINGUNID') {
            return pair
          }
        })
        if (this.props.pmType === 'GENERATOR PM') {

          if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0) && Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 && this.checkRadioInput(radioInputs).length === 0) {

            this.setState({
              disableSubmit: false
            })
          }
          else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 || this.checkRadioInput(radioInputs).length > 0) {
            this.setState({
              disableSubmit: true
            })
          }

        } else if (this.props.pmType === 'HVAC PM') {


          if (!this.state.fileSizeError && (this.state.filesData.length > 0 || this.state.compAttDetails.attachmentsData.length > 0) && Object.values(this.toObject(mandateFields)).filter((udv) => !udv[1]).length === 0 && this.checkRadioInput(rad).length === 0 && this.checkRadioInput1(rad1).length === 0) {
            this.setState({
              disableSubmit: false
            })
          }
          else if (this.state.fileSizeError || (this.state.filesData.length === 0 && this.state.compAttDetails.attachmentsData.length === 0) || Object.values(this.toObject(mandateFields)).filter((udv) => udv[1] === '').length > 0 || (this.checkRadioInput(rad).length > 0 || this.checkRadioInput1(rad1).length > 0)) {
            this.setState({
              disableSubmit: true
            })
          }
        }

      })



    }

  }
  downloadAttachments = (pmAttachmentId, pmListItemId, pmListId) => {
    const { user, loginId, vendorId, fetchFileData } = this.props
    fetchFileData(loginId, vendorId, pmListId, pmListItemId, 'VP').then(action => {
      if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
        let fileData = action.fileDetails.getFileDataForPmlist.result.filter(fd => fd.PM_ATTACHMENTS_ID === pmAttachmentId)[0]


        if (!!fileData && !!fileData.PM_FILE_TYPE && !!fileData.PM_FILE_NAME && !!fileData.PM_FILE_DATA) {
          let blob = dataURItoBlob(fileData.PM_FILE_DATA)
          startDownload(blob, `${fileData.PM_FILE_NAME}`)
        }

      }



    })
  }
  formDefaultInput = (currentObj) => {
    if (currentObj.PM_TMPLT_ATTR_NAME.includes("DATE")) {
      return this.getDate()
    } else {
      return this.state.updatedData[currentObj.PM_TMPLT_ATTR_NAME][1]
    }

  }

  formDefaultInputText = (currentObj) => {
    return this.state.updatedData[currentObj.PM_TMPLT_ATTR_NAME][2]
  }
  formDropdownOptionsMulti = (currentObj) => {
    const consolArr = [...currentObj.PM_TMPLT_ATTR_FLD_VALUE.split(','), ...this.state.updatedData[currentObj.PM_TMPLT_ATTR_NAME][1].split(',')].filter(val => !!val).reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item]
    }, [])

    return consolArr.map(option => ({ value: option, label: option, isFixed: true })).concat({ value: 'Other', label: 'Other', isFixed: true })

  }
  formDropdownOptions = (currentObj) => {
    return currentObj.PM_TMPLT_ATTR_FLD_VALUE.split(',').map(option => ({ value: option, label: option, isFixed: true }))
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

    let { isPmSelected, poItemId } = this.props
    let customStyle = { fontSize: '12px', marginTop: '5px', width: '130px', backgroundColor: 'black' }
    const { genData } = this.props
    const { hvacData } = this.props
    var radioInputsGen = this.props.modelAttributes.map(mat => {
      if (mat.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON') {
        return mat.PM_TMPLT_ATTR_NAME
      }
    }).filter(ma => !!ma)


    var radioInputsHvac = this.props.modelAttributes.map(mat => {
      if (mat.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON') {
        return mat.PM_TMPLT_ATTR_NAME
      }
    }).filter(ma => !!ma)


    var genAttMap = {}
    this.props.modelAttributes.forEach(ma => {
      if (ma.PM_TMPLT_ATTR_NAME === "PM_DATE") {
        genAttMap[ma.PM_TMPLT_ATTR_NAME] = this.getDate()
      }
      else {
        var currentSystemRecord = (!!genData && genData.length > 0 && ma.PM_TMPLT_ATTR_FLD_GROUP.includes("2-") && !!ma.PM_TMPLT_ATTR_FLD_LBLMAP && !!genData[0][ma.PM_TMPLT_ATTR_FLD_LBLMAP]) ? genData[0][ma.PM_TMPLT_ATTR_FLD_LBLMAP] : ''
        genAttMap[ma.PM_TMPLT_ATTR_NAME] = currentSystemRecord
      }
    })

    var hvacAttMap = {}
    this.props.modelAttributes.forEach(mat => {
      if (mat.PM_TMPLT_ATTR_ID === 1) {
        hvacAttMap[mat.PM_TMPLT_ATTR_NAME] = this.getDate()
      }

      else {
        var recordMapping = mat.PM_TMPLT_ATTR_FLD_GROUP === "2" && !!mat.PM_TMPLT_ATTR_FLD_LBLMAP ? mat.PM_TMPLT_ATTR_FLD_LBLMAP.split('-')[0] : ''
        var hvacIndex = Number(mat.PM_TMPLT_ATTR_FLD_GROUP === "2" && !!mat.PM_TMPLT_ATTR_FLD_LBLMAP ? mat.PM_TMPLT_ATTR_FLD_LBLMAP.split('-')[1] : null)
        var currentSystemRecord = (!!hvacData && hvacData.length > 0 && mat.PM_TMPLT_ATTR_FLD_GROUP === "2" && !!mat.PM_TMPLT_ATTR_FLD_LBLMAP && !!hvacData[hvacIndex] && !!hvacData[hvacIndex][recordMapping]) ? hvacData[hvacIndex][recordMapping] : ''
        hvacAttMap[mat.PM_TMPLT_ATTR_NAME] = currentSystemRecord
      }
    })

    return (
      <div className="table-responsive vp_stepper_content">
        {
          (this.props.hvacLoading || this.props.genDataLoading || this.state.pageLoading) ? this.renderLoading() :
            (this.props.hvacInfoErrors || this.props.genTankInfoError || this.props.fetchModelAttError) || this.props.compAttError ? this.renderErrorScreen() :

              (<div className="mb-3">
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

                <h4 className='h4 mb-3'>{!isPmSelected ? "Bulk PO Info" : "PM Info"}</h4>
                <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                  <thead className="vzwtable text-left">
                    <tr colSpan={"4"}>
                      {((this.props.pmType === 'HVAC PM') || (!isPmSelected && poItemId)) && this.state.hvacAtts1.map(md => (

                        <td className="Form-group no-border" colSpan="4"><b>{md.PM_TMPLT_ATTR_NAME}<span className='text-danger' style={{ "font-size": "2vh" }}>{md.PM_TMPLT_ATTR_NAME === 'Comments' ? '' : '*'}</span></b></td>


                      ))}
                      {this.props.pmType === 'GENERATOR PM' && this.state.genAtts1.map(md => (

                        <td className="Form-group no-border" colSpan="4">
                          <b>{md.PM_TMPLT_ATTR_NAME}<span className='text-danger' style={{ "font-size": "2vh" }}>
                            {md.PM_TMPLT_ATTR_NAME === 'Comments' ? '' : '*'}</span></b></td>


                      ))}
                    </tr>


                  </thead>

                  <tbody className="vzwtable text-left">

                    <tr colSpan={"4"}>

                      {((this.props.pmType === 'HVAC PM') || (!isPmSelected && poItemId)) && this.state.hvacAtts1.map(md => (
                        <td className="Form-group no-border" colSpan="4">

                          {(md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT')

                            ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)

                            : (md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTILINETEXT') ? (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                              : md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER' ? (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME}
                                defaultValue={this.formDefaultInput(md)}
                                onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                                : (md.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON') ? (<RadioGroup
                                  defaultSelected={this.formDefaultInput(md)}
                                  name={md.PM_TMPLT_ATTR_NAME} 
                                  onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} 
                                  style={{ flexDirection: "inherit" }}>
                                  <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                                  <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                                </RadioGroup>

                                )
                                  : md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE') ?

                                    (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                                      defaultValue={this.formDefaultInput(md)}
                                      onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                                    : null}
                        </td>
                      ))}

                      {this.props.pmType === 'GENERATOR PM' && this.state.genAtts1.map(md => (
                        <td className="Form-group no-border" colSpan="4">

                          {(md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT')

                            ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)

                            : (md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTILINETEXT') ? (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)
                              : md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER' ? (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME}
                                defaultValue={this.formDefaultInput(md)}
                                onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)
                                : (md.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON') ? (
                                <RadioGroup name={md.PM_TMPLT_ATTR_NAME}
                                  value={this.formDefaultInput(md)}
                                  onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} 
                                  style={{ flexDirection: "inherit" }}>
                              <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                              <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                                </RadioGroup>)
                                  : md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE') ?
                                    (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME} defaultValue={this.formDefaultInput(md)} onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)
                                    : null}
                        </td>
                      ))}



                    </tr>
                  </tbody>
                </table>
                {isPmSelected ? (<h4 className='h4 mb-3'>PM details to verify</h4>) : null}
                {isPmSelected ? (<table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "288px", "background": "#FFF", "border": "none" }}>
                  <thead className="vzwtable text-left">

                    <tr colSpan={"4"}>
                      <td className="Form-group " colSpan="4"><b>{this.props.pmType} ATTRIBUTES</b></td>
                      <td className="Form-group " colSpan="4"><b>CURRENT SYSTEM RECORD</b></td>
                      <td className="Form-group " colSpan="4"><b>PM INPUT</b></td>
                    </tr>
                  </thead>

                  <tbody className="vzwtable text-left">
                    {this.props.pmType === 'HVAC PM' && this.props.PMDetails.PM_ITEM_STATUS === 'PENDING' && this.state.hvacAtts2.sort((a, b) => {
                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      }
                      else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      }
                      else {
                        return 0
                      }
                    }).map((md) => (
                      <tr colSpan={"4"}>
                        <td className="Form-group" colSpan="4" ><b>{md.PM_TMPLT_ATTR_NAME}<span className='text-danger' style={{ "font-size": "2vh" }}>*</span></b></td>
                        <td className="Form-group" colSpan="4"><b>{hvacAttMap[md.PM_TMPLT_ATTR_NAME]}</b></td>
                        <td className="Form-group" colSpan="4">
                          {!md.optionSelected && (<div>
                            <h6>Is the record correct?</h6>
                            <RadioGroup
                              name={md.PM_TMPLT_ATTR_NAME}
                              onChange={this.handleButtonChange.bind(this, md, hvacAttMap, radioInputsHvac)}
                              style={{ flexDirection: "inherit" }}>
                              <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                              <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                            </RadioGroup>
                          </div>
                          )}


                          {md.optionSelected && md.renderText && (md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE'))



                            ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)

                            : (md.optionSelected && md.renderText && md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTILINETEXT') ? (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                              : md.optionSelected && md.renderText && md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER' ? (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                                : (md.optionSelected && !md.renderText && (md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE'))) ? <input type={"text"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} defaultValue={hvacAttMap[md.PM_TMPLT_ATTR_NAME]} />
                                  : (md.optionSelected && !md.renderText && (md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER')) ?
                                    (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} defaultValue={hvacAttMap[md.PM_TMPLT_ATTR_NAME]} />)
                                    : null
                          }
                        </td>
                      </tr>
                    ))}

                    {this.props.pmType === 'GENERATOR PM' && (this.props.PMDetails.PM_ITEM_STATUS === 'PENDING'|| this.props.PMDetails.COMPLETED_BY === "") && this.state.genAtts2.sort((a, b) => {
                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      }
                      else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      }
                      else {
                        return 0
                      }
                    }).map((md) => (
                      <tr colSpan={"4"}>
                        <td className="Form-group" colSpan="4" ><b>{md.PM_TMPLT_ATTR_NAME}<span className='text-danger' style={{ "font-size": "2vh" }}>*</span></b></td>
                        <td className="Form-group" colSpan="4"><b>{genAttMap[md.PM_TMPLT_ATTR_NAME]}</b></td>
                        <td className="Form-group" colSpan="4">
                          {!md.optionSelected && (<div>
                            <h6>Is the record correct?</h6>
                            <RadioGroup
                              name={md.PM_TMPLT_ATTR_NAME}
                              onChange={this.handleButtonChange.bind(this, md, genAttMap, radioInputsHvac)}
                              style={{ flexDirection: "inherit" }}>
                              <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                              <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                            </RadioGroup>
                          </div>
                          )}


                          {md.optionSelected && md.renderText && (md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE'))



                            ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)

                            : (md.optionSelected && md.renderText && md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTILINETEXT') ? (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)
                              : md.optionSelected && md.renderText && md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER' ? (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)
                                : (md.optionSelected && !md.renderText && (md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE'))) ? <input type={"text"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} defaultValue={genAttMap[md.PM_TMPLT_ATTR_NAME]} />
                                  : (md.optionSelected && !md.renderText && (md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER')) ?
                                    (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} defaultValue={genAttMap[md.PM_TMPLT_ATTR_NAME]} />)
                                    : null
                          }
                        </td>
                      </tr>
                    ))}

                    {this.props.pmType === 'HVAC PM' && this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT' && this.state.hvacAtts2.sort((a, b) => {
                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      }
                      else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      }
                      else {
                        return 0
                      }
                    }).map((md) => (
                      <tr colSpan={"4"}>
                        <td className="Form-group" colSpan="4" ><b>{md.PM_TMPLT_ATTR_NAME}<span className='text-danger' style={{ "font-size": "2vh" }}>*</span></b></td>
                        <td className="Form-group" colSpan="4"><b>{this.state.updatedData[md.PM_TMPLT_ATTR_NAME][0]}</b></td>
                        <td className="Form-group" colSpan="4">



                          {(md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE'))



                            ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)

                            : (md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTILINETEXT') ? (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                              : md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER' ? (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME}
                                defaultValue={this.formDefaultInput(md)}
                                onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)

                                : null
                          }
                        </td>
                      </tr>
                    ))}

                    {this.props.pmType === 'GENERATOR PM' && this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT' && this.state.genAtts2.sort((a, b) => {
                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      }
                      else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      }
                      else {
                        return 0
                      }
                    }).map((md) => (
                      <tr colSpan={"4"}>
                        <td className="Form-group" colSpan="4" ><b>{md.PM_TMPLT_ATTR_NAME}<span className='text-danger' style={{ "font-size": "2vh" }}>*</span></b></td>
                        <td className="Form-group" colSpan="4"><b>{this.state.updatedData[md.PM_TMPLT_ATTR_NAME][0]}</b></td>
                        <td className="Form-group" colSpan="4">



                          {(md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE'))



                            ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)

                            : (md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTILINETEXT') ? (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)
                              : md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER' ? (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME}
                                defaultValue={this.formDefaultInput(md)}
                                onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)
                                : null
                          }
                        </td>
                      </tr>
                    ))}



                  </tbody>
                </table>) : null}
                {isPmSelected ? (<h4 className='h4 mb-3'>PM details to input</h4>) : null}
                {isPmSelected ? (<table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "288px", "background": "#FFF", "border": "none" }}>
                  <thead className="vzwtable text-left">

                    <tr colSpan={"4"}>
                      <td className="Form-group " colSpan="4"><b>{this.props.pmType} ATTRIBUTES</b></td>
                      <td className="Form-group " colSpan="4"><b>PM INPUT</b></td>

                    </tr>
                  </thead>

                  <tbody className="vzwtable text-left">
                    {this.props.pmType === 'HVAC PM' && this.state.hvacAtts3.length > 0 && this.state.hvacAtts3.sort((a, b) => {

                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      }
                      else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      }
                      else {
                        return 0
                      }
                    }).map(md => (
                      <tr colSpan={"4"} hidden={!!md.hideSetptValue}>
                        <td className="Form-group no-border" colSpan="4" ><b>{md.PM_TMPLT_ATTR_NAME}<span className='text-danger' style={{ "font-size": "2vh" }}>*</span></b></td>

                        <td className="Form-group no-border" colSpan="4">
                          {(md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE'))



                            ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)

                            : (md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTILINETEXT') ? (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                              : md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER' ? (<input type={"number"} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }}
                                defaultValue={this.formDefaultInput(md)} />)
                                : (md.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON') ? (<div>
      
                                  <RadioGroup name={md.PM_TMPLT_ATTR_NAME} 
                                  value={md.optionSelected}
                                  onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} 
                                  style={{ flexDirection: "inherit" }}>
                                  <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                                  <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                                </RadioGroup>
                                  {(md.optionSelected || this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT') && (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                                    defaultValue={this.formDefaultInputText(md)}
                                    onChange={this.handleTextAreaChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} placeholder="Reason for selection..." />)}
                                </div>)
                                  : (md.PM_TMPLT_ATTR_FLD_TYPE === 'DROPDOWN' && md.PM_TMPLT_ATTR_ID !== 34 && md.PM_TMPLT_ATTR_ID !== 36) ?
                                    (<div><Select
                                      className="basic-single"
                                      classNamePrefix="select"

                                      value={!!md.currentDropDownValue ? md.currentDropDownValue : ''}
                                      isDisabled={false}
                                      isLoading={false}
                                      clearable={false}
                                      isRtl={false}
                                      isSearchable={false}
                                      name={md.PM_TMPLT_ATTR_NAME}
                                      options={this.formDropdownOptions(md)}
                                      onChange={this.handleDropdownChange.bind(this, md, hvacAttMap, radioInputsHvac)}
                                    />
                                      {md.otherSelected && <input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                                        className='mt-3'
                                        defaultValue=''
                                        placeholder='Input value'
                                        onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />}
                                    </div>) :
                                    (md.PM_TMPLT_ATTR_FLD_TYPE === 'DROPDOWN' && (md.PM_TMPLT_ATTR_ID === 34 || md.PM_TMPLT_ATTR_ID === 36)) ?
                                      (<Select
                                        className="basic-single"
                                        classNamePrefix="select"
                                        value={!!md.crntSetPtValue ? md.crntSetPtValue : {}}
                                        isDisabled={false}
                                        isLoading={false}
                                        clearable={false}
                                        isRtl={false}
                                        isSearchable={false}
                                        name={md.PM_TMPLT_ATTR_NAME}
                                        options={!!md.setPtOptions ? md.setPtOptions : []}
                                        onChange={this.setptDropdownChange.bind(this, md, hvacAttMap, radioInputsHvac)}
                                      />)
                                      : null
                          }


                        </td>

                      </tr>

                    ))}

                    {this.props.pmType === 'GENERATOR PM' && this.state.genAtts3.sort((a, b) => {
                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      }
                      else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      }
                      else {
                        return 0
                      }
                    }).map(md => (
                      (md.PM_TMPLT_ATTR_ID !== 29) ? <tr colSpan={"4"}>
                        <td className="Form-group no-border" colSpan="4"><b>
                          {md.PM_TMPLT_ATTR_NAME}<span className='text-danger' style={{ "font-size": "2vh" }}>{md.PM_TMPLT_ATTR_NAME === 'Billable Labor Hour Spent for Generator Fueling' ? '' : '*'}</span>
                        </b></td>

                        <td className="Form-group no-border" colSpan="4">
                          {(md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE.includes('DATE'))



                            ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)

                            : (md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTILINETEXT') ? (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                              defaultValue={this.formDefaultInput(md)}
                              onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />)
                              : (md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER' && md.PM_TMPLT_ATTR_ID !== 29) ? (<div><input type={"number"} name={md.PM_TMPLT_ATTR_NAME}
                                defaultValue={this.formDefaultInput(md)}
                                onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />
                                {md.PM_TMPLT_ATTR_ID === 22 && !!this.state.invalidEntry && <h4 className="text-danger mt-3" style={{ fontSize: '13px' }} ><b>{this.state.invalidEntryMsg}</b></h4>}
                              </div>)
                                : (md.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON') ? (<div>
                                  <RadioGroup name={md.PM_TMPLT_ATTR_NAME}
                                  value={md.optionSelected}
                                  onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} 
                                  style={{ flexDirection: "inherit" }}>
                                  <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                                  <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                                </RadioGroup>
                                  {(md.optionSelected || this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT') && (<textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                                    defaultValue={this.formDefaultInputText(md)}
                                    onChange={this.handleTextAreaChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} placeholder="Reason for selection..." />)}
                                </div>)
                                  : null
                          }
                        </td>

                      </tr> : (md.PM_TMPLT_ATTR_ID === 29 && this.state.showBill) &&
                      <tr colSpan={"4"}>
                        <td className="Form-group no-border" colSpan="4"><b>
                          {md.PM_TMPLT_ATTR_NAME}
                        </b></td>
                        <td className="Form-group no-border" colSpan="4">
                          {
                            (md.PM_TMPLT_ATTR_FLD_TYPE === 'NUMBER') ? (<div>
                              <input type={"number"} name={md.PM_TMPLT_ATTR_NAME}
                                defaultValue={this.formDefaultInput(md)}
                                onChange={this.handleInputChange.bind(this, md, genAttMap, radioInputsGen)} style={{ height: '100%', width: '100%' }} />
                            </div>) : null
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>) : null}
                {isPmSelected ? (<h4 className='h4 mb-3'>Repair work (Optional)</h4>) : null}
                <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "288px", "background": "#FFF", "border": "none" }}>
                  <tbody className="vzwtable text-left">
                    {this.props.pmType === 'HVAC PM' && this.state.hvacAtts4.length > 0 && this.state.hvacAtts4.sort((a, b) => {

                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      }
                      else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      }
                      else {
                        return 0
                      }
                    }).map(md => (
                      (md.PM_TMPLT_ATTR_FLD_GROUP === '4-1' || this.state.repairDrpdwn.length > 0) && <tr colSpan={"4"} >

                        <td className="Form-group no-border" colSpan="4" ><b>{md.PM_TMPLT_ATTR_NAME}</b></td>

                        <td className="Form-group no-border" colSpan="4">
                          {
                            (md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTI DROPDOWN' && md.PM_TMPLT_ATTR_FLD_GROUP !== '4-2' && md.PM_TMPLT_ATTR_FLD_GROUP !== '4-3') ?
                              (<div style={{ backgroundColor: 'white' }} >
                                <Picky
                                  styles={customStyle}
                                  value={this.state.repairDrpdwn}
                                  options={this.formDropdownOptionsMulti(md)}
                                  onChange={this.handleMultiDropdownChange.bind(this, md)}
                                  open={false}
                                  valueKey="value"
                                  labelKey="label"
                                  multiple={true}
                                  includeSelectAll={false}
                                  includeFilter={true}
                                  clearFilterOnClose={true}
                                />
                                {this.state.showText && <div className='row mt-2'><div className='col-md-7 '><input type="text" id='otherOption' style={{ height: '100%', width: '100%' }} placeholder="Enter parts..."></input></div>
                                  <div className='col-md-5'><button className="Button--secondary btn btn-md" onClick={this.handleAddToSel.bind(this, md)} disabled={issoCondition}>Add Parts</button></div>
                                </div>}
                              </div>)


                              : (md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' && this.state.repairDrpdwn.length > 0)



                                ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                                  defaultValue={this.formDefaultInput(md)}
                                  onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                                : null
                          }

                        </td>

                      </tr>

                    ))}

                    {this.props.pmType === 'GENERATOR PM' && this.state.genAtts4.length > 0 && this.state.genAtts4.sort((a, b) => {

                      if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) > parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return 1
                      }
                      else if (parseInt(a.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1]) < parseInt(b.PM_TMPLT_ATTR_FLD_GROUP.split('-')[1])) {
                        return -1
                      }
                      else {
                        return 0
                      }
                    }).map(md => (
                      (md.PM_TMPLT_ATTR_FLD_GROUP === '4-1' || this.state.repairDrpdwn.length > 0) && <tr colSpan={"4"} >

                        <td className="Form-group no-border" colSpan="4" ><b>{md.PM_TMPLT_ATTR_NAME}</b></td>

                        <td className="Form-group no-border" colSpan="4">
                          {
                            (md.PM_TMPLT_ATTR_FLD_TYPE === 'MULTI DROPDOWN' && md.PM_TMPLT_ATTR_FLD_GROUP !== '4-2' && md.PM_TMPLT_ATTR_FLD_GROUP !== '4-3') ?
                              (<div style={{ backgroundColor: 'white' }}>
                                <Picky
                                  styles={customStyle}
                                  value={this.state.repairDrpdwn}
                                  options={this.formDropdownOptionsMulti(md)}
                                  onChange={this.handleMultiDropdownChange.bind(this, md)}
                                  open={false}
                                  valueKey="value"
                                  labelKey="label"
                                  multiple={true}
                                  includeSelectAll={false}
                                  includeFilter={true}
                                  clearFilterOnClose={true}
                                />
                                {this.state.showText && <div className='row mt-2'><div className='col-md-7 '><input type="text" id='otherOption' style={{ height: '100%', width: '100%' }} placeholder="Enter parts..."></input></div>
                                  <div className='col-md-5'><button className="Button--secondary btn btn-md" onClick={this.handleAddToSel.bind(this, md)} disabled={issoCondition}>Add Parts</button></div>
                                </div>}
                              </div>)


                              : (md.PM_TMPLT_ATTR_FLD_TYPE === 'TEXT' && this.state.repairDrpdwn.length > 0)



                                ? (<input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                                  defaultValue={this.formDefaultInput(md)}
                                  onChange={this.handleInputChange.bind(this, md, hvacAttMap, radioInputsHvac)} style={{ height: '100%', width: '100%' }} />)
                                : null
                          }

                        </td>

                      </tr>

                    ))}



                    {!!this.state.compAttDetails && !!this.state.compAttDetails.attachmentsData && this.props.PMDetails.PM_ITEM_STATUS === 'PENDING_DRAFT' && (
                      <tr colSpan={"4"}>
                        <td className="Form-group" colSpan="4" ><b>Attachments</b></td>
                        <td className="Form-group" colSpan="4" > <ul>

                          {this.state.compAttDetails.attachmentsData.map(ad => (<li
                            onClick={this.downloadAttachments.bind(this, ad.PM_ATTACHMENTS_ID, ad.PM_LIST_ITEM_ID, ad.PM_LIST_ID)} style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.PM_FILE_NAME}`}</b></li>))}
                        </ul>

                        </td>



                      </tr>

                    )}
                    {this.state.fileSizeError && (<tr><td colSpan="6" ><MessageBox messages={List(["The size of attachments should be less than 25 MB!"])} /></td></tr>)}
                    <tr colSpan="6">
                      <td colSpan="12">
                        <div className='row '>
                          {this.props.pmType === 'GENERATOR PM' && (
                            <div className={"col-md-3 float-left"}>
                              <Dropzone onDrop={this.onFileDrop.bind(this, genAttMap, radioInputsGen)}>
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
                          )}
                          {(this.props.pmType === 'HVAC PM' || (!isPmSelected && poItemId)) && (
                            <div className={"col-md-3 float-left"}>
                              <Dropzone onDrop={this.onFileDrop.bind(this, hvacAttMap, radioInputsHvac)}>
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
                          )}
                          {this.state.showConfirmDiv ?
                            (<div className='col-md-9 row mt-4'>
                              <div className="col-md-6 font-weight-bold">Do you want to continue without uploading checklist?</div>
                              <div className="col-md-6 row">
                                <div className="col-md-6">
                                  <button
                                    className="Button--secondary"
                                    onClick={this.submitDetails}
                                  >Yes</button></div>
                                <div className="col-md-6">
                                  <button
                                    className="Button--secondary"
                                    onClick={this.handleNoClick}>No</button>
                                </div>
                              </div>

                            </div>) : (<div className='col-md-9 mt-1'>
                              {this.props.pmType === 'GENERATOR PM' && <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this, genAttMap, radioInputsGen)} fileList={this.state.filesData} />}
                              {(this.props.pmType === 'HVAC PM' || (!isPmSelected && poItemId)) && <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this, hvacAttMap, radioInputsHvac)} fileList={this.state.filesData} />}
                              <button type="submit"
                                className="Button--secondary float-left mt-2"
                                disabled={this.state.fileSizeError || issoCondition}
                                onClick={this.saveAsDraft}
                                style={{ marginRight: "5px" }}
                              >
                                Save as Draft
                              </button>
                              <button type="submit"
                                className="Button--secondary float-right mt-2"
                                disabled={this.state.disableSubmit || issoCondition}
                                style={{ marginRight: "5px" }}
                                onClick={this.onSubmit}>
                                Mark as Complete
                              </button>
                            </div>)}



                        </div>
                      </td>
                    </tr>


                  </tbody>
                </table>
              </div>)
        }

      </div>
    )
  }


}
//}

function stateToProps(state, ownProps) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let userFname = state.getIn(['Users', 'entities', 'users', loginId, "fname"])


  let vendorId = user.toJS().vendor_id
  let vendorName = user.toJS().vendor_name
  let hvacLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "hvacLoading", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let genDataLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "genTankloading", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let modelAttributes = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'pmModelAttDetails', 'getPmModelAttDetails'], List()).toJS()

  let genData = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'genTank', ownProps.PMDetails.PM_LIST_ITEM_ID], List()).toJS()
  let hvacData = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'hvac', ownProps.PMDetails.PM_LIST_ITEM_ID], List()).toJS()
  let hvacInfoErrors = state.getIn(['PmDashboard', loginId, vendorId, "pm", "hvacerrors", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let genTankInfoError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "genTankerrors", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let uploadSuccess = state.getIn(['PmDashboard', loginId, vendorId, "pm", "SubmitUploadDetailsResp", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let uploadFailure = state.getIn(['PmDashboard', loginId, vendorId, "pm", "SubmitUploadDetailsResp", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let submissionStatus = state.getIn(['PmDashboard', loginId, vendorId, "pm", "SubmitPMDetailsResp", ownProps.PMDetails.PM_LIST_ITEM_ID])
  let fetchModelAttError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmModelAttDetails", 'errors'])
  let compAttError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmCompAttError", ownProps.PMDetails.PM_LIST_ITEM_ID])
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''


  return {
    user,
    loginId,
    vendorName,
    vendorId,
    userFname,
    genData,
    hvacData,
    hvacLoading,
    hvacInfoErrors,
    genTankInfoError,
    uploadSuccess,
    uploadFailure,
    submissionStatus,
    modelAttributes,
    isGenLoading: state.getIn(["VendorDashboard", "genReadingsRequest", "isloading"], false),
    savedGenMessage: state.getIn(["VendorDashboard", "genReadingsRequest", "success"], null),
    errorGenMessage: state.getIn(["VendorDashboard", "genReadingsRequest", "errors"], null),
    genDataLoading,
    fetchModelAttError,
    compAttError,
    realLoginId,
    realUser,
    ssoUrl,
    isssouser,

  }

}
export default connect(stateToProps, { ...pmActions, submitGenReadingsRequest, saveElogByWorkOrderID })(PMModelDetails)