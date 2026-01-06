import React, { Component } from "react"
import { connect } from "react-redux"
import Select from 'react-select'
import { List, Map } from "immutable"
import * as formActions from "../../Forms/actions"
import Dropzone from 'react-dropzone'
import * as utils from "../utils"
import * as VendorActions from "../actions"
import * as elogActions from "../../Elog/actions"
import moment from 'moment'
import Tooltip from '@mui/material/Tooltip';
import FileAttachedTable from './FileAttachedTable'
import { dataURItoBlob, startDownload, PORTALUSER } from '../utils.js'
import Loader from '../../Layout/components/Loader'
import { DataGrid } from "@mui/x-data-grid"

export class WorkOrderQuoteSubmitFixedPricing extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      itemExpanded: false,
      fixedServicesData: [],
      selectedServices: [],
      addedSelectedLists: [],
      qtyerr: false,
      costerr: false,
      formattedLnItems: [],
      comments: '',
      filesData: [],
      invoiceNum: '',
      fileSizeError: false,
      quoteUnid: '',
      unfilteredfixedServices: [],
      fixedFlag: false,
      comments: '', 
      qtyChange:false,
      isworkCompleted: false,
      pageLoading: false,
      currentDropdownValueWorkType: { label: props.workORderInfo.get("work_type"), value: props.workORderInfo.get("work_type"), isFixed: true },
      drpdwnOptions: [{ value: 'S', label: 'Standard', isFixed: true }, { value: 'E', label: 'Emergency', isFixed: true }],
      currentDropdownValue: { value: 'S', label: 'Standard', isFixed: true },
      modfdGridDetails: []
    }
    this.initWOForm = this.initWOForm.bind(this)
    this.mobCharge=false,
    this.fetchCatalogData = this.fetchCatalogData.bind(this)
    this.modifyGridDetails = this.modifyGridDetails.bind(this)
    this.aList = List()
  }

  componentDidMount() {
    this.initWOForm()
  }
  componentDidUpdate(prevProps) {
    let {config} = this.props;
    let vwrsBannerDate = config && config.toJS() && config.toJS()?.configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "VWRS_BANNER_DATE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "VWRS_BANNER_DATE").ATTRIBUTE_VALUE
    if (prevProps.workORderInfo.get("work_type") !== this.props.workORderInfo.get("work_type")
      || prevProps.workORderInfo.get("priority") !== this.props.workORderInfo.get("priority")
      || prevProps.disaster != this.props.disaster || prevProps.selectedEvent != this.props.selectedEvent) {
      if (prevProps.disaster != this.props.disaster) {
        this.setState({ formattedLnItems: [] })
      }
      this.setState({ selectedServices: [] })
      this.initWOForm(true)
    }
    // if(this.props.workORderInfo.toJS()?.priority == "DIRECT AWARD" && !moment().isBefore(moment(vwrsBannerDate)) && this.state.formattedLnItems.length > 0) {
    //   this.setState({ formattedLnItems: [] })
    // }
  }
  handleInvoiceChange = (e) => {
    this.setState({ invoiceNum: e.target.value })
  }
  handleChangeSearch = (e) => {
    let fixedServicesData
    if (e.target.value.length > 2) {

      fixedServicesData = this.state.fixedServicesData.filter(val => {
        let listnameMatch = val.listname && val.listname.toLowerCase().includes(e.target.value.toLowerCase())
        let servicetypeMatch = val.service_type && val.service_type.toLowerCase().includes(e.target.value.toLowerCase())
        let unitMatch = val.unit && val.unit.toLowerCase().includes(e.target.value.toLowerCase())
        let rateMatch = val.price_per_unit && val.price_per_unit.toLowerCase().includes(e.target.value.toLowerCase())
        let ccMatch = val.cost_category && val.cost_category.toLowerCase().includes(e.target.value.toLowerCase())

        return listnameMatch || servicetypeMatch || unitMatch || rateMatch || ccMatch
      })

    } else {
      fixedServicesData = this.state.unfilteredfixedServices
    }
    this.setState({ fixedServicesData }, () => {
      this.modifyGridDetails()
    })
  }
  getindexofVendor = (cfdQuotes) => {
    let currentVendor = cfdQuotes.find(v => v.name && v.name.includes('cfd_quote_vendorid') && v.value == this.props.vendorId)
    if (currentVendor) {
      return currentVendor.name.split('_')[currentVendor.name.split('_').length - 1]
    } else {
      return 0
    }
  }

  getfilteredLineItems = (cfdQuotes, indexofVendor) => {

    let filteredReformattedQuotes = []
    cfdQuotes.forEach(curVal => {
      let currentVal = {}
      let filterCondition = false
      if (curVal.name && (curVal.name.includes('fueltotal') || curVal.name.includes('attachments') || curVal.name.includes('labortotal') || curVal.name.includes('quote_log') || curVal.name.includes('quote_materialstota') || curVal.name.includes('quote_numlineitems') || curVal.name.includes('quote_rentaltotal') || curVal.name.includes('quote_replydate') || curVal.name.includes('quote_status') || curVal.name.includes('quote_statusby') || curVal.name.includes('quote_statusdate') || curVal.name.includes('quote_total') || curVal.name.includes('quote_vendorcomments') || curVal.name.includes('quote_vendoremail') || curVal.name.includes('quote_vendorid') || curVal.name.includes('quote_vendorname') || curVal.name.includes('quote_vendorphone') || curVal.name.includes('quote_vendorpsid') || curVal.name.includes('quote_vzwcomments'))) {
        filterCondition = curVal.name.split('_')[curVal.name.split('_').length - 1] == indexofVendor
        currentVal['name'] = curVal.name.replace('_quote_', '_')
        currentVal['value'] = curVal.value
      } else if (curVal.name && (curVal.name.includes('quote_lineitem_bid_unit') || curVal.name.includes('quote_lineitem_is_matrix') || curVal.name.includes('quote_lineitem_cost_cat') || curVal.name.includes('quote_lineitem_cost_type') || curVal.name.includes('quote_lineitem_deleteme') || curVal.name.includes('quote_lineitem_fixed') || curVal.name.includes('quote_lineitem_long_desc') || curVal.name.includes('quote_lineitem_notes') || curVal.name.includes('quote_lineitem_ppu') || curVal.name.includes('quote_lineitem_ps_item_id') || curVal.name.includes('quote_lineitem_mmid') || curVal.name.includes('quote_lineitem_qty') || curVal.name.includes('quote_lineitem_service_type') || curVal.name.includes('quote_lineitem_total') || curVal.name.includes('quote_lineitem_unid') || curVal.name.includes('quote_lineitem_unit') || curVal.name.includes('quote_lineitem_work_type'))) {
        filterCondition = curVal.name.split('_')[curVal.name.split('_').length - 2] == indexofVendor
        currentVal['name'] = curVal.name.split('_', curVal.name.split('_').length - 2).concat(curVal.name.split('_')[curVal.name.split('_').length - 1]).join('_').replace('_quote_', '_')
        currentVal['value'] = curVal.value
      }
      if (filterCondition) {
        filteredReformattedQuotes.push(currentVal)
      }


    })

    return filteredReformattedQuotes

  }

  getFixedFlag() {
    const { user, workORderInfo } = this.props;
    const antennaTowerPricingMatrixFlag = user && user.get('vendor_pricing_macro_ant_tow');
    const smallCellPricingMatrixFlag = user && user.get('vendor_pricing_small_cell');
    if((antennaTowerPricingMatrixFlag == '1' && this.state.currentDropdownValueWorkType.value == 'Antenna / Tower' && workORderInfo.toJS()?.work_type == "Antenna / Tower") || (smallCellPricingMatrixFlag == '1' && this.state.currentDropdownValueWorkType.value == 'Small Cell' && workORderInfo.toJS()?.work_type == "Small Cell")||( this.state.currentDropdownValueWorkType.value.toLowerCase() == 'ap radio' && workORderInfo.toJS()?.work_type.toLowerCase() == "ap radio") || (this.state.currentDropdownValueWorkType.value.toLowerCase() == 'mdu' && workORderInfo.toJS()?.work_type.toLowerCase() == "mdu")) {
      return true;
    }
    return false;
  }

  async initWOForm(noRefresh) {
    let { market, submarket, workORderInfo, user, userList, vendorId, loginId, fetchFixedPricingServ, workorderId, wo_meta_universalid, fetchFixedPricingExistServ, site, groupVendors, isCompleted, isAcceptedWork, isQuoteReceived, switchData } = this.props

    let groupVendorsJs = groupVendors ? groupVendors.toJS() : []
    let workTypeInfo = workORderInfo.toJS()?.work_type;
    let workCheck = ["antenna / tower", "small cell","ap radio","mdu"].includes(workTypeInfo.toLowerCase())
    
    await this.setState({ currentDropdownValueWorkType: { label: this.props.workORderInfo.get("work_type"), value: this.props.workORderInfo.get("work_type"), isFixed: true } })
    let fixedFlag = this.getFixedFlag();
    await this.setState({ fixedFlag })
    let requestParams = {
      market: market,
      submarket: submarket,
      national: '1',
      listname: '',
      worktype: workORderInfo.get("work_type") && workORderInfo.get("work_type") == 'ENGIE-FUEL' ? 'Generator' : workORderInfo.get("work_type"),
      costtype: this.state.currentDropdownValue.value,
      sitetype: this.props.type == 'Switch' ? 'MSC' : 'CELL',
      fixed: this.state.fixedFlag && workCheck ? '1' : '0',
      nonfixed: '1',
      zipcode: this.props.type == 'Switch' ? switchData.get('zip') ? switchData.get('zip') : '' : site.get('zip') ? site.get('zip') : '',
      matrix: (fixedFlag && workCheck ) || this.state.currentDropdownValueWorkType.value == '*' ? '1' : '0',
      nonmatrix: '1',
      matrixeligible: fixedFlag && workCheck ? (this.props.disaster && this.props.disaster == "Yes" ? '0' : '1') : '0'
    }
    if (!noRefresh) {
      this.setState({ pageLoading: true })
    }
    if (workORderInfo.get("work_type")) {
      await this.setState({ pageLoadinggrid: true })
      await fetchFixedPricingServ(vendorId, loginId, workorderId, requestParams).then(async action => {
        let fixedFlag = this.state.fixedFlag

        if (action.type == 'FETCH_FIXEDPRICINGSERVICES_SUCCESS' && action.FixedPricingServ && action.FixedPricingServ.fixedPriceMatrixData && action.FixedPricingServ.fixedPriceMatrixData.length > 0) {
          if (action.FixedPricingServ.fixedPriceMatrixData.filter(v => v.is_matrix == '1').length == 0) {
            fixedFlag = false
          }
          else {
            fixedFlag = true
          }
          if (this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value == '*') {
            await this.setState({ fixedServicesData: action.FixedPricingServ.fixedPriceMatrixData, unfilteredfixedServices: action.FixedPricingServ.fixedPriceMatrixData, fixedFlag }, () => {
              this.modifyGridDetails()
            })
          }
          else {
            await this.setState({ fixedServicesData: action.FixedPricingServ.fixedPriceMatrixData.filter(v => fixedFlag ? v.is_matrix == '1' : v.is_matrix == '0'), unfilteredfixedServices: action.FixedPricingServ.fixedPriceMatrixData.filter(v => fixedFlag ? v.is_matrix == '1' : v.is_matrix == '0'), fixedFlag }, () => {
              this.modifyGridDetails()
            })
          }
        } else {
          this.setState({ fixedServicesData: [] })
        }
      })
      await this.setState({ pageLoadinggrid: false })
    }


    if (!noRefresh) {
      this.setState({ pageLoading: false })
    }
  }
  async modifyGridDetails() {
    let newFixedServData = []

    if (this.state.fixedFlag && this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value == 'Antenna / Tower') {
      newFixedServData = this.state.fixedServicesData.map(v => ({ ...v, service_cat_type: v.service_cat + '^' + v.service_type }))
    }
    else {
      newFixedServData = this.state.fixedServicesData.map(v => ({ ...v, service_cat_type: v.service_type }))
    }
    if (this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value == '*') {
      let temp1 = this.state.fixedServicesData.filter(i => i.work_type && i.work_type == 'Antenna / Tower').map(v => ({ ...v, service_cat_type: v.service_cat + '^' + v.service_type }))
      let temp2 = this.state.fixedServicesData.filter(i => i.work_type && i.work_type != 'Antenna / Tower').map(v => ({ ...v, service_cat_type: v.service_type }))
      newFixedServData = [...temp1, ...temp2]
    }
    let uniqueServTypeRec = newFixedServData.map(v => v.service_cat_type).reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item]
    }, []).map(i => {
      return newFixedServData.find(val => val.service_cat_type == i)
    })
    let mergedServTypeRec = []
    uniqueServTypeRec.forEach(val => {
      let currentServType = newFixedServData.filter(i => i.service_cat_type == val.service_cat_type)
      if (currentServType.length > 1) {
        mergedServTypeRec.push({
          ...currentServType.find(value => value.cost_category == val.cost_category),
          cost_category: currentServType.map(v => v.cost_category).join('/'),
          ps_item_id: currentServType.map(v => v.ps_item_id).join('/'),
          mmid: currentServType.map(v => v.mmid).join('/'),
        })
      } else if (currentServType.length == 1) {
        mergedServTypeRec.push(
          currentServType[0]
        )
      }

    })
    let incentive_eligible = this.props.user && this.props.user.get('incentive_eligible');

    if(incentive_eligible == "0"){
      mergedServTypeRec = mergedServTypeRec.filter(e=> !(e.service_type?.toLowerCase().includes("incentive")))
    }

    let modfdGridDetails = mergedServTypeRec.sort((a, b) => {
      if (this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value != "*")
        return a["service_cat_sort"] - b["service_cat_sort"] || a["line_item_sort"] - b["line_item_sort"]
      else {
        if (a["work_type"] < b["work_type"]) {
          return -1
        }
        else if (a["work_type"] > b["work_type"]) {
          return 1
        }
        else {
          if (a["service_type"] > b["service_type"]) {
            return 1
          }
          else if (a["service_type"] < b["service_type"]) {
            return -1
          }
          else {
            return 0
          }
        }
        //  return a["work_type"] - b["work_type"] || a["service_type"] - b["service_type"] 
      }

    }).map((service) => ({

      ...service,
      listname: !service.service_cat || service.service_cat == '*' ? service.work_type : service.service_cat,
      cfdlineitemlongdesc: '',
      displayLongDesc: service.long_description ? service.long_description : '',
      cfdlineitemqty: 1,
      cfdlineitemservicetype: service.service_type ? service.service_type : '',
      cfdlineitemunit: service.unit ? service.unit : '',
      cfdlineitemcostcat: service.cost_category ? service.cost_category : '',
      cfdlineitemppu: service.price_per_unit && parseFloat(service.price_per_unit) > 0 ? service.price_per_unit : '',
      cfdlineitemppucopy: service.price_per_unit && parseFloat(service.price_per_unit) > 0 ? service.price_per_unit : '',
      cfdlineitemtotal: '',
      cfdlineitemnotes: '',
      action: '',
      lineItemUnid: '',
      cfdlineitemcosttype: service.cost_type ? service.cost_type : '',
      cfdlineitempsitemid: service.ps_item_id ? service.ps_item_id : '',
      cfdlineitemmmid: service.mmid ? service.mmid : '',
      cfdlineitembidunit: service.bid_unit ? service.bid_unit : '',
      cfdlineitemismatrix: service.is_matrix ? service.is_matrix : ''
    }))

    await this.setState({ modfdGridDetails })

  }
  onGridReady = params => {
    this.gridOptions = params
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    this.gridApi.setFilterModel(null)

  }
  async onSelectionChanged(e) {

    const selectedServices = this.state.modfdGridDetails.filter(f=> e.includes(f.meta_universalid))

    const splittedRows = []
    selectedServices.forEach(v => {
      if (v.cfdlineitemcostcat && v.cfdlineitemcostcat.includes('/')) {
        v.cfdlineitemcostcat.split('/').forEach((i, index) => {
          splittedRows.push({
            ...v,
            cfdlineitemcostcat: i,
            cost_category: i,
            cfdlineitempsitemid: v.ps_item_id.split('/')[index],
            cfdlineitemmmid: v.mmid.split('/')[index]
          })
        })
      } else {
        splittedRows.push(v)
      }
    })


    await this.setState({ selectedServices: splittedRows })

  }
  handleQtyChange = (curObj, e) => {
    this.setState({qtyChange:true})
    let twoDecimals= String(e.target.value).split(".");
    let qtyVal = String(e.target.value);
    if(twoDecimals.length == 2){
      if(twoDecimals[1].length > 2){
        qtyVal = twoDecimals[0] +"."+ twoDecimals[1].substring(0,2);
      }
    }
    var formattedLnItems = []
    if (curObj.action == 'Add') {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
          return {
            ...v,
            cfdlineitemqty: qtyVal,
            cfdlineitemtotal: (parseFloat(e.target.value) * parseFloat(v.cfdlineitemppu)).toFixed(2),
            action: v.action != 'Add' ? 'Mod' : v.action,
            qtyerr: false
          }
        } else {
          return v
        }

      })
    } else {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            cfdlineitemqty: qtyVal,
            cfdlineitemtotal: (parseFloat(e.target.value) * parseFloat(v.cfdlineitemppu)).toFixed(2),
            action: v.action != 'Add' ? 'Mod' : v.action,
            qtyerr: false
          }
        } else {
          return v
        }

      })
    }

    this.setState({ formattedLnItems, qtyerr: false })


  }
  handleCostChange = (curObj, e) => {
    var formattedLnItems = []
    formattedLnItems = this.state.formattedLnItems.map(v => {
      if (curObj.action == 'Add') {
        if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
          return {
            ...v,

            cfdlineitemtotal: parseFloat(e.target.value),
            action: v.action != 'Add' ? 'Mod' : v.action,
            costerr: false

          }
        } else {
          return v
        }
      } else {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            cfdlineitemppu: '',
            cfdlineitemtotal: parseFloat(e.target.value),
            action: v.action != 'Add' ? 'Mod' : v.action,
            costerr: false

          }
        } else {
          return v
        }
      }

    })
    this.setState({ formattedLnItems, costerr: false })
  }



  handleAddServices = () => {
    var addedSelectedLists = []
    this.mobCharge=false;


    addedSelectedLists = this.state.selectedServices.map(v => ({
      ...v,
      cfdlineitemlongdesc: 'Vendor',
      cfdlineitemqty: 1,
      cfdlineitemtotal: parseFloat(v.cfdlineitemppu) > 0 ? !!(parseFloat(v.cfdlineitemqty) * parseFloat(v.price_per_unit)) && (parseFloat(v.cfdlineitemqty) * parseFloat(v.price_per_unit)) > 0 ? (parseFloat(v.cfdlineitemqty) * parseFloat(v.price_per_unit)).toFixed(2) : 0 : 0,
      lineItemUnid: v.meta_universalid,
      cfdlineitemunid: v.meta_universalid,
      uniqueIdentifier: this.getRandomInt(1, 10000),
      action: 'Add',
      raterr: parseFloat(v.cfdlineitemppu) && parseFloat(v.cfdlineitemppu) > 0 ? false : true

    }))
    addedSelectedLists.forEach(val=>{
      if(this.state.fixedFlag && val.action === "Add" && val.unit==="Per Crew Per Mile" && (parseInt(this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance)<50 || parseInt(this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance)===0 || parseInt(this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance)===9999)){
        val.cfdlineitemqty='0';
        val.cfdlineitemtotal='0';
      }
    })

    const formattedLnItems = this.state.formattedLnItems.filter(v => v.service_type).concat(addedSelectedLists)


    this.setState({ addedSelectedLists, formattedLnItems, selectedServices: [] }, () => {
      this.apiRef.current.setRowSelectionModel([])
      this.apiRef.current.setFilterModel({items : []})
    })
  }
  handleNotesChange = (curObj, e) => {
    const formattedLnItems = this.state.formattedLnItems.map(v => {
      if (curObj.cfdlineitemlongdesc == 'Vendor') {
        if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
          return {
            ...v,
            cfdlineitemnotes: e.target.value,
            action: v.cfdlineitemlongdesc == 'VZ' ? 'Mod' : v.action

          }
        } else {
          return v
        }
      } else {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            cfdlineitemnotes: e.target.value,
            action: v.cfdlineitemlongdesc == 'VZ' ? 'Mod' : v.action

          }
        } else {
          return v
        }
      }

    })

    this.setState({ formattedLnItems })
  }

  async handleDelete(curObj) {
    var formattedLnItems
    if (curObj.cfdlineitemlongdesc == 'Vendor') {
      formattedLnItems = this.state.formattedLnItems.filter(v => !(curObj.uniqueIdentifier == v.uniqueIdentifier))


    } else {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            action: 'Del',
            cfdlineitemnotes: ''
          }
        } else {
          return v
        }
      })


    }
    await this.setState({ formattedLnItems: [] })
    await this.setState({ formattedLnItems })
  }
  handleCommentsChange = (e) => {
    this.setState({ comments: e.target.value })
  }
  onFileDrop(files) {
    let { formName } = this.props
    files.forEach(file => {

      if (file['size'] > 0) {

        var reader = new window.FileReader()
        reader.onload = function () {

          var dataURL = reader.result
          var droppedFile = {
            filename: file['name'],
            filetype: file['type'],
            file_size: file['size'] + '',
            content: dataURL,
            category: (formName == "SubmitQuote") ? "quote" : "invoice",
            preview: file['preview'],
            last_modified: file['lastModifiedDate'],

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

  }
  getQuotesTotal = () => {
    let totalCost = this.state.formattedLnItems.filter(i => i.action != 'Del').map(v => v.cfdlineitemtotal ? parseFloat(v.cfdlineitemtotal) : 0).reduce((total, currentItem) => { return total + currentItem }, 0)
    return parseFloat(totalCost) > 0 ? parseFloat(totalCost).toFixed(2) : 0
  }
  getQuotesSubTotal = (costCat) => {
    let totalCost = this.state.formattedLnItems.filter(i => i.cfdlineitemcostcat && i.cfdlineitemcostcat.includes(costCat) && i.action != 'Del').map(v => v.cfdlineitemtotal ? parseFloat(v.cfdlineitemtotal) : 0).reduce((total, currentItem) => { return total + currentItem }, 0)
    return parseFloat(totalCost) > 0 ? parseFloat(totalCost).toFixed(2) : 0
  }

  formPostRequest = () => {
    if (this.props.workORderInfo.get("priority") == 'BID / AVAILABILITY') {
      return {
        "updateReqBody": {
          "data": {
            "quotetotal": this.getQuotesTotal(),
            "materialssubtotal": this.getQuotesSubTotal('Material'),
            "laborsubtotal": this.getQuotesSubTotal('Labor'),
            "genfuelsubtotal": this.getQuotesSubTotal('Fuel'),
            "rentalsubtotal": this.getQuotesSubTotal('Rental'),
            "quotecomments": this.state.comments,
            "disaster_recovery": this.props.disaster == "Yes" ? 1 : 0,
            "lineitems": this.state.formattedLnItems.map(val => {
              return {
                "cost_type": val.cfdlineitemcosttype,
                "ps_item_id": val.cfdlineitempsitemid,
                "mmid": val.cfdlineitemmmid,
                "is_matrix": val.is_matrix,
                "bid_unit": val.cfdlineitembidunit,
                "work_type": this.props.workORderInfo.get("work_type"),
                "cost_cat": val.cfdlineitemcostcat,
                "service_type": val.cfdlineitemservicetype,
                "unit": val.cfdlineitemunit,
                "ppu": parseFloat(val.cfdlineitemppu) ? val.cfdlineitemppu + '' : 0,
                "long_desc": val.cfdlineitemlongdesc,
                "fixed": val.cfdlineitemfixed ? val.cfdlineitemfixed : val.is_matrix,
                "qty": parseFloat(val.cfdlineitemqty) ? val.cfdlineitemqty + '' : 0,
                "total": parseFloat(val.cfdlineitemtotal) ? val.cfdlineitemtotal + '' : 0,
                "notes": val.cfdlineitemnotes
              }
            })
          }
        }
      }
    }
    else {
      return {
        "updateReqBody": {
          "data": {
            "invoicetotal": this.getQuotesTotal(),
            "invoicematerials": this.getQuotesSubTotal('Material'),
            "invoicelabor": this.getQuotesSubTotal('Labor'),
            "invoicegenfuel": this.getQuotesSubTotal('Fuel'),
            "invoicerental": this.getQuotesSubTotal('Rental'),
            "invoicecomments": this.state.comments,
            "vendor_invoice_num": this.state.invoiceNum,
            "disaster_recovery": this.props.disaster == "Yes" ? 1 : 0,
            "lineitems": this.state.formattedLnItems.map(val => {
              return {
                "cost_type": val.cfdlineitemcosttype,
                "ps_item_id": val.cfdlineitempsitemid,
                "mmid": val.cfdlineitemmmid,
                "is_matrix": val.is_matrix,
                "bid_unit": val.cfdlineitembidunit,
                "work_type": this.props.workORderInfo.get("work_type"),
                "cost_cat": val.cfdlineitemcostcat,
                "service_type": val.cfdlineitemservicetype,
                "unit": val.cfdlineitemunit,
                "ppu": parseFloat(val.cfdlineitemppu) ? val.cfdlineitemppu + '' : 0,
                "long_desc": val.cfdlineitemlongdesc,
                "fixed": "1",
                "qty": parseFloat(val.cfdlineitemqty) ? val.cfdlineitemqty + '' : 0,
                "total": parseFloat(val.cfdlineitemtotal) ? val.cfdlineitemtotal + '' : 0,
                "notes": val.cfdlineitemnotes
              }
            })
          }
        }
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
  formUploadFilesPostRequest = (fileData) => {
    return fileData.map(fd => {
      let file_name = fd.filename.split('.')[0]
      return {
        "content": fd.content,
        "preview": fd.preview,
        "file_size": fd.file_size,
        "filename": fd.filename,
        "filetype":fd.filetype,
        "last_modified":fd.last_modified,
        "category": "invoice"
      }
    })
  }
  downloadFile = (file) => {
    let { loginId, downloadFile } = this.props
    downloadFile(loginId, this.state.quoteUnid, file["file_name"], file["meta_universalid"], file["category"]).then(action => {
      if (action.filedata && action.filedata.file_data) {
        let blob = dataURItoBlob(action.filedata.file_data)
        startDownload(blob, file["file_name"])
      }
    })
  }

  getAttachmentList() {
    let { loginId, fetchFileList, wo_meta_universalid } = this.props
    if (this.state.quoteUnid) {
      let category = (this.props.formName === "SubmitQuote") ? "quote" : "invoice"

      fetchFileList(loginId, wo_meta_universalid, this.state.quoteUnid, category)
    }
  }
  onSubmit = () => {
    let {config} = this.props;
    let routeToIop = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ROUTE_OPS_TO_IOP").ATTRIBUTE_VALUE;
    const postReq = this.formPostRequest()
    const files = {
      filesPostRequest: {
        files: routeToIop == "Y" ? this.formUploadFilesPostRequest(this.state.filesData) :  this.formFilesPostRequest(this.state.filesData),
      },
      category: this.state.filesData[0] && this.state.filesData[0].category
    }
    this.props.onQuoteSubmit(postReq, files)
  }
  renderLoading = () => {
    return (
      <Loader color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center" />
    )
  }
  getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async handleDropdownChange(e) {
    document.getElementById('search-bar').value = ''
    await this.setState({ currentDropdownValue: e }, async () => {
      await this.fetchCatalogData()
    })
  }
  handleRateChange = (curObj, e) => {
    var formattedLnItems = []
    if (curObj.action == 'Add') {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
          return {
            ...v,
            cfdlineitemppu: e.target.value,
            cfdlineitemtotal: parseFloat(e.target.value) * parseFloat(v.cfdlineitemqty),
            action: v.action != 'Add' ? 'Mod' : v.action,
            raterr: false
          }
        } else {
          return v
        }

      })
    } else {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            cfdlineitemppu: e.target.value,
            cfdlineitemtotal: (parseFloat(e.target.value) * parseFloat(v.cfdlineitemqty)).toFixed(2),
            action: v.action != 'Add' ? 'Mod' : v.action,
            raterr: false
          }
        } else {
          return v
        }

      })
    }

    this.setState({ formattedLnItems, raterr: false })

  }
  async fetchCatalogData() {
    let { market, submarket, workORderInfo, user, userList, vendorId, loginId, fetchFixedPricingServ, workorderId, wo_meta_universalid, fetchFixedPricingExistServ, site, groupVendors, isCompleted, isAcceptedWork, isQuoteReceived, switchData } = this.props
    let workTypeInfo = workORderInfo.toJS()?.work_type;
    let workCheck = ["antenna / tower", "small cell","ap radio","mdu"].includes(workTypeInfo.toLowerCase())
    let groupVendorsJs = groupVendors ? groupVendors.toJS() : []
    let fixedFlag = this.getFixedFlag();
    await this.setState({ fixedFlag })
    let requestParams = {
      market: market,
      submarket: submarket,
      national: '1',
      listname: '',
      worktype: this.state.currentDropdownValueWorkType.value && this.state.currentDropdownValueWorkType.value == 'ENGIE-FUEL' ? 'Generator' : this.state.currentDropdownValueWorkType.value,
      costtype: this.state.fixedFlag ? this.state.currentDropdownValue.value : 'S',
      sitetype: this.props.type == 'Switch' ? 'MSC' : 'CELL',
      fixed: this.state.fixedFlag && workCheck ? '1' : '0',
      nonfixed: '1',
      zipcode: this.props.type == 'Switch' ? switchData.get('zip') ? switchData.get('zip') : '' : site.get('zip') ? site.get('zip') : '',
      matrix: (fixedFlag && workCheck ) || this.state.currentDropdownValueWorkType.value == '*' ? '1' : '0',
      nonmatrix: '1',
      matrixeligible: fixedFlag && workCheck ? (this.props.disaster && this.props.disaster == "Yes" ? '0' : '1') : '0'
    }
    await this.setState({ pageLoadinggrid: true })
    await fetchFixedPricingServ(vendorId, loginId, workorderId, requestParams).then(async action => {
      let fixedFlag = this.state.fixedFlag


      if (action.type == 'FETCH_FIXEDPRICINGSERVICES_SUCCESS' && action.FixedPricingServ && action.FixedPricingServ.fixedPriceMatrixData && action.FixedPricingServ.fixedPriceMatrixData.length > 0) {
        if (action.FixedPricingServ.fixedPriceMatrixData.filter(v => v.is_matrix == '1').length == 0) {
          fixedFlag = false
        }
        else {
          fixedFlag = true
        }
        if (this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value == '*') {
          await this.setState({ fixedServicesData: action.FixedPricingServ.fixedPriceMatrixData, unfilteredfixedServices: action.FixedPricingServ.fixedPriceMatrixData, fixedFlag }, () => {
            this.modifyGridDetails()
          })
        }
        else {
          await this.setState({ fixedServicesData: action.FixedPricingServ.fixedPriceMatrixData.filter(v => fixedFlag ? v.is_matrix == '1' : v.is_matrix == '0'), unfilteredfixedServices: action.FixedPricingServ.fixedPriceMatrixData.filter(v => fixedFlag ? v.is_matrix == '1' : v.is_matrix == '0'), fixedFlag }, () => {
            this.modifyGridDetails()
          })
        }


      } else {
        this.setState({ fixedServicesData: [] })
      }
    })
    await this.setState({ pageLoadinggrid: false })
  }
  async handleDropdownChangeWorkType(e) {
    document.getElementById('search-bar').value = ''
    await this.setState({ currentDropdownValueWorkType: e, selectedServices: [] }, async () => {
      await this.fetchCatalogData()
    })


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
    return row.meta_universalid;
  }

  render() {
    let quotetotal =  this.getQuotesTotal();
    let {config} = this.props;
    let erpConfigFlag = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "ENABLE_ERP") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "ENABLE_ERP").ATTRIBUTE_VALUE
    let MMIDLISTS = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "MOBILIZATION_MMIDS") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "MOBILIZATION_MMIDS").ATTRIBUTE_VALUE.split(",")
    let qtyEnableUnits = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "1ERP_QTY_ENABLE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "1ERP_QTY_ENABLE").ATTRIBUTE_VALUE && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "1ERP_QTY_ENABLE").ATTRIBUTE_VALUE.split(",").map(e=>e.toLowerCase());
    let vwrsBannerDate = config && config.toJS() && config.toJS()?.configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "VWRS_BANNER_DATE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "VWRS_BANNER_DATE").ATTRIBUTE_VALUE
    let vwrsBannerMessage = config && config.toJS() && config.toJS()?.configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "VWRS_BANNER_DATE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "VWRS_BANNER_DATE").ATTRIBUTE_DESCRIPTION
    if(!qtyEnableUnits){
      qtyEnableUnits = ["half day", "hourly", "per foot", "per jumper", "per crew per mile" ];
    }
    if(!MMIDLISTS){
      MMIDLISTS=["000000001300040056","000000001300039948","000000001300040130","000000001300039968","000000001300040020","000000001300040031"];
    }
    if(this.state.selectedServices?.length>0 && MMIDLISTS.length>0)
    {
      this.state.selectedServices.forEach(val=>{
        if(this.state.fixedFlag && val.cfdlineitemunit=='Per Crew Per Mile'&& MMIDLISTS.includes(val.cfdlineitemmmid)){
          this.mobCharge=true;
        }
      })
    }
    let quote_files = []
    this.props.attachedList.forEach(fileObj => {
      let file = fileObj.toJS()
      if (file["category"] == "quote") {
        quote_files.push(

          <span key={file['file_name']} className="file_tag_designe" style={{ cursor: 'pointer' }}>
            <span style={{ color: '#FFF' }} onClick={() => this.downloadFile(file)}>{file['file_name']}</span>
          </span>)
      }

    })
    let invoice_files = []
    this.props.attachedList.forEach(fileObj => {
      let file = fileObj.toJS()
      if (file["category"] == "invoice") {
        invoice_files.push(

          <span key={file['file_name']} className="file_tag_designe" style={{ cursor: 'pointer' }}>
            <span style={{ color: '#FFF' }} onClick={() => this.downloadFile(file)}>{file['file_name']}</span>
          </span>)
      }
    })
    const customStyles = {
      control: base => ({
        ...base,
        height: 30,
        minHeight: 30
      })
    }
    let workTypes = []
    workTypes = workTypes.concat({
      label: 'All',
      value: '*',
      isFixed: true
    })

    workTypes = workTypes.concat(this.props.workTypes)


    let columns = [
      // {
      //   headerName: "", headerTooltip: "Select", tooltipField: "select", width: 80, checkboxSelection: true, headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true,
      // },
      {
        headerName: "", headerTooltip: "", field: "", width: 40,
        renderCell: function (row) {
          let params = row.row
          if (params && params.displayLongDesc)
            return <span><i class="fas fa-info-circle fa-2x" title={params.displayLongDesc ? params.displayLongDesc : ""} style={{cursor: "pointer"}}></i></span>
          else return null
        }
      },
      {
        headerName: "Service Category/Work Type", field: "listname", width: 300,
      },
      {
        headerName: "Service Type", field: "cfdlineitemservicetype",  width: 300,
      },
      {
        headerName: "Bid Unit", hide : !this.state.fixedFlag,  field: "cfdlineitembidunit", width: 150,
      },
      {
        headerName: "Rate",  field: "cfdlineitemppu", width: 150,
      },
      {
        headerName: "Unit", field: "cfdlineitemunit", width: 150,
      },
      {
        headerName: "Cost Category", field: "cfdlineitemcostcat", width: 150,
      }
    ]

    let autoGroupColumnDef = {
      headerName: 'Select',
      field: 'Select',
      minWidth: 250,
      cellRenderer: 'agGroupCellRenderer',

    }
    if (this.state.isworkCompleted) {

      return (<div>
        {this.state.pageLoading ? this.renderLoading() : <div className="container-fluid">
          <div className="row">
            <h4 className="col-md-3 float-left"></h4>
            <div className="col-md-7 row">
              <div className="col-md">
                <h4>Labor : {this.getQuotesSubTotal('Labor')}</h4>
              </div>
              <div className="col-md">
                <h4>Material : {this.getQuotesSubTotal('Material')}</h4>
              </div>
              <div className="col-md">
                <h4>Fuel : {this.getQuotesSubTotal('Fuel')}</h4>
              </div>
              <div className="col-md">
                <h4>Rental : {this.getQuotesSubTotal('Rental')}</h4>
              </div>
            </div>
            <div className="col-md-2"></div>

          </div>
          <p style={{marginLeft:"19%",fontFamily: "BrandFont-Text, Helvetica, Arial, sans-serif",
fontSize:"1rem",color:"#000"}}>The Work Order Location is {this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance} Miles From The Closest Vendor Dispatch Location </p>
          <table cellPadding="0" cellSpacing="0" style={{ "borderCollapse": "collapse", "textAlign": "center" }}>
            <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
              <tr>
                <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Requestor</th>
                <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Service Type</th>
                <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Unit</th>
                <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Cost Type</th>
                <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Rate</th>
                <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Qty</th>
                <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Cost</th>
                <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Notes</th>

              </tr>
            </thead>
            <tbody className="text-center">
              {this.state.formattedLnItems.length > 0 && this.state.formattedLnItems.filter(i => i.cfdlineitemservicetype).length > 0 && this.state.formattedLnItems.map(val =>

              (<tr>
                <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemlongdesc ? val.cfdlineitemlongdesc : ''}</td>
                <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemservicetype ? val.cfdlineitemservicetype : ''}</td>
                <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemunit ? val.cfdlineitemunit : ''}</td>
                <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemcostcat ? val.cfdlineitemcostcat : ''}</td>
                <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemppu ? val.cfdlineitemppu : ''}</td>
                <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemqty ? val.cfdlineitemqty : ''}</td>
                <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemtotal ? val.cfdlineitemtotal : 0}</td>
                <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemnotes ? val.cfdlineitemnotes : ''}</td>



              </tr>)
              )}

            </tbody>
          </table>
          {this.state.formattedLnItems.find(v => !!v.cfdvendorcomments) && <div>
            <h4>Vendor Comments</h4>
            <div>
              {this.state.formattedLnItems.find(v => v.cfdvendorcomments).cfdvendorcomments}
            </div>
          </div>}
          <div className="row mb-3">
            {quote_files.length > 0 && (<div className="col-md-6 float-left" style={{ marginTop: '20px' }}>
              <div className="col-sm-12 no-padding float-left" style={{ "fontSize": "1em", "fontWeight": "600", "textAlign": "left" }}>
                <lable> Quote Attached Files :</lable>
              </div>
              <div className="col-sm-6 no-padding float-left" style={{ "textAlign": "left" }}>
                {quote_files}
              </div>
            </div>)}
            {invoice_files.length > 0 && (<div className="col-md-6 float-right" style={{ marginTop: '20px' }}>
              <div className="col-sm-12 no-padding float-right" style={{ "fontSize": "1em", "fontWeight": "600", "textAlign": "left" }}>
                <lable> Invoice Attached Files :</lable>
              </div>
              <div className="col-sm-12 no-padding float-right" style={{ "textAlign": "left" }}>
                {invoice_files}
              </div>
            </div>)}
          </div>
        </div>}
      </div>
      )
    } else {
      return (
        <div>
          {this.state.pageLoading ? this.renderLoading() : <div className="container-fluid">
            <div className="row">
              <h4 className="col-md-3 float-left"></h4>
              <div className="col-md-7 row price-section">
                <div className="col-md">
                  Labor : {this.getQuotesSubTotal('Labor')}
                </div>
                <div className="col-md">
                  Material : {this.getQuotesSubTotal('Material')}
                </div>
                <div className="col-md">
                  Fuel : {this.getQuotesSubTotal('Fuel')}
                </div>
                <div className="col-md">
                  Rental : {this.getQuotesSubTotal('Rental')}
                </div>
              </div>
              <div className="col-md-2"></div>

            </div>
            <div className="row mt-3 mb-3" style={{ "padding": "10px 10px 60px 10px", "min-height": "200px" }}>
              <h4 >Requested Service</h4>
             <p style={{marginLeft:"19%",fontFamily: "BrandFont-Text, Helvetica, Arial, sans-serif",
fontSize:"1rem",color:"#000"}}>The Work Order Location is {this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance} Miles From The Closest Vendor Dispatch Location </p>
              <table cellPadding="0" cellSpacing="0" style={{ "borderCollapse": "collapse", "textAlign": "center" }}>
                <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                  <tr>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}></th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Requestor</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Service Type</th>
                    {this.state.fixedFlag && <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Bid Unit</th>}
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Unit</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Cost Type</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Rate Type</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Rate</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Qty</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Cost</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Notes</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Action</th>
                    <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}></th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {this.state.formattedLnItems.length > 0 && this.state.formattedLnItems.filter(i => i.cfdlineitemservicetype).length > 0 && this.state.formattedLnItems.map((val,index) =>{
                    let showToolTip=false;
                    let dispatchDistance=(parseInt(this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance))
                    if(this.state.formattedLnItems.indexOf(val)===index && this.state.fixedFlag &&  val.action == 'Add' && val.unit==="Per Crew Per Mile" && this.state.qtyChange && parseInt(val.cfdlineitemqty) > 0  && val.cfdlineitemnotes==0 && (dispatchDistance < 50 || dispatchDistance === 0 || dispatchDistance === 9999)) {
                      showToolTip=true;
                    }

                  return (<tr>
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)", "textAlign": "center" }}>{val.displayLongDesc && <i className="fas fa-info-circle fa-2x" style={{ cursor: 'pointer' }} title={val.displayLongDesc ? val.displayLongDesc : ''}></i>}</td>
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemlongdesc ? val.cfdlineitemlongdesc : ''}</td>
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemservicetype ? val.cfdlineitemservicetype : ''}</td>
                    {this.state.fixedFlag && <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitembidunit ? val.cfdlineitembidunit : ''}</td>}
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemunit ? val.cfdlineitemunit : ''}</td>
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemcostcat ? val.cfdlineitemcostcat : ''}</td>
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemcosttype && val.cfdlineitemcosttype != '*' ? val.cfdlineitemcosttype : ''}</td>

                    {(val.is_matrix ? val.is_matrix == '1' : val.cfdlineitemfixed == '1') && !!parseFloat(val.cfdlineitemppucopy) && parseFloat(val.cfdlineitemppucopy) > 0 ?
                      <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemppu ? val.cfdlineitemppu : ''}</td> :
                      <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}><div>
                        <input type="number" min={"0"} defaultValue={parseFloat(val.cfdlineitemppu) > 0 ? val.cfdlineitemppu : ''} onChange={this.handleRateChange.bind(this, val)} id={'rate-' + val.uniqueIdentifier} style={{ height: '100%', width: '70%' }}></input>
                      </div></td>}
                      {erpConfigFlag == "Y" && qtyEnableUnits && qtyEnableUnits.length>0 && !qtyEnableUnits.includes((val.cfdlineitemunit).toLowerCase())  ?
                                      <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}><div>
                                      <input type="number" min={"0"} max={"1"} value={typeof val.cfdlineitemqty== "number" ? val.cfdlineitemqty : val.cfdlineitemqty ? val.cfdlineitemqty : ''}
                                       disabled={(( qtyEnableUnits && qtyEnableUnits.length>0 && !qtyEnableUnits.includes((val.cfdlineitemunit).toLowerCase())) && val.cfdlineitemlongdesc != "VZ")} 
                                        onChange={this.handleQtyChange.bind(this, val)} id={'qty-' + val.uniqueIdentifier} style={{height: '100%', width: '70%'}}></input>
  
                                  </div></td> : 
                                  
                                    <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}><div>
                                    <input type="number" min={"0"} value={val.cfdlineitemqty ? val.cfdlineitemqty : ''} onChange={this.handleQtyChange.bind(this, val)} id={'qty-' + val.uniqueIdentifier} style={{height: '100%', width: '70%'}}></input>

                                </div></td>}
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemtotal ? val.cfdlineitemtotal : ''}</td>
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}><textarea type="number" defaultValue={val.cfdlineitemnotes} id={'notes-' + val.uniqueIdentifier} 
                    onChange={this.handleNotesChange.bind(this, val)} 
                    style={this.state.fixedFlag && val.action == 'Add' && val.unit==="Per Crew Per Mile" && this.state.qtyChange && parseInt(val.cfdlineitemqty) > 0 && val.cfdlineitemnotes==0 && (this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance<50 || this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance==0 || this.props.workOrderDispatchesDistance?.createWODistanceDetails?.cfd_created_by_vendor_nearest_dispatch_distance==9999) ?{height: '100%', width: '80%',border:'1px solid red'}:{height: '100%', width: '80%'}}>
                      </textarea>
                      <Tooltip  title='* Please add Reason in notes section' open={showToolTip===true?true:false } className="tooltip-css" placement='top' arrow >
                                          <span></span>
                                        </Tooltip>
                      </td>
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.action ? val.action : ''}</td>
                    <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}><a onClick={this.handleDelete.bind(this, val)}><i className="fas fa-trash-alt fa-lg" style={{ cursor: 'pointer' }}></i></a></td>

                  </tr>)
    })}

                </tbody>
              </table>
              <div id="Login" type="submit" className="float-left button-class-addservice" style={{ width: '9vw' }} onClick={() => {
                this.setState({ itemExpanded: !this.state.itemExpanded })
              }}>{this.state.itemExpanded ? '-Hide Add a service' : '+Add a service'}</div>

            </div>
            {this.props.workORderInfo.toJS()?.priority === "DIRECT AWARD" ? 
              (this.props.workORderInfo.toJS()?.priority == "DIRECT AWARD" && moment().isBefore(moment(vwrsBannerDate))) ?
                <div style={{color: "darkorange", fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 40}}>Beginning on {moment(vwrsBannerDate).format('MMMM DD, YYYY')}, {vwrsBannerMessage}</div> : 
                <div style={{color: "darkorange", fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 40}}>{vwrsBannerMessage}</div> 
            : null }
            <div className="row mb-3" style={{ alignItems:'end' }}>
              <div className="col-md-5">
                <div><h5>Comments <span style={{ 'color': 'red' }}>*</span></h5></div>
                <div>
                  <textarea type="text" defaultValue={this.state.comments} onChange={this.handleCommentsChange.bind(this)} style={{ width: '100%', minHeight: '5vh', lineHeight: '5vh' }}></textarea>
                </div>
              </div>
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
                <div >
                  <FileAttachedTable fileList={this.state.filesData} onRemoveClick={this.onAttachRemove.bind(this)} />
                </div>
              </div>
              <div className="col-md-2" style={{ alignSelf: 'center' }}>
                {this.props.workORderInfo.get("priority") == 'BID / AVAILABILITY' ? <button id="Login" type="submit" className=" Button--secondary" onClick={this.onSubmit.bind(this)}
                  disabled={
                    this.state.formattedLnItems.length == 0 ||
                    this.state.comments.length == 0 || !this.props.workORderInfo.get('priority') ||
                    !this.props.workORderInfo.get('work_scope') ||
                    !this.props.workORderInfo.get('work_type') ||
                    !this.props.workORderInfo.get('wbs_id') ||
                    (this.props.disaster == "Yes" && !this.props.selectedEvent) ||
                    !this.props.manager || !this.props.manager.email ||
                    !this.props.selectedTech || !this.props.selectedTech.userid
                  }>Request</button> : <button id="Login" type="submit" className=" Button--secondary" onClick={this.onSubmit.bind(this)}
                    disabled={
                      this.state.comments.length == 0 ||
                      !this.props.disableDirectSub ||
                      !this.props.workORderInfo.get('priority') ||
                      !this.props.workORderInfo.get('work_scope') ||
                      !this.props.workORderInfo.get('work_type') ||
                      !this.props.workORderInfo.get('wbs_id') ||
                      (moment().isAfter(moment(vwrsBannerDate)) && quotetotal) ||
                      (this.props.disaster == "Yes" && !this.props.selectedEvent) ||
                      !this.props.manager || !this.props.manager.email ||
                      !this.props.selectedTech || !this.props.selectedTech.userid
                    }>Request</button>}
              </div>
            </div>
            {this.props.workORderInfo.get("priority") != 'BID / AVAILABILITY' && <div className="row mb-3">
              <div className="col-md-5">
                <div><h4>Invoice Number</h4></div>
                <div>
                  <input type='text' defaultValue={this.state.invoiceNum} onChange={this.handleInvoiceChange.bind(this)} style={{ width: '70%' }}></input>
                </div>
              </div>
              <div className="col-md-5">

              </div>
              <div className="col-md-2">

              </div>
            </div>}
            <div className="row mb-3">
              {quote_files.length > 0 && (<div className="col-md-6 float-left" style={{ marginTop: '20px' }}>
                <div className="col-sm-12 no-padding float-left" style={{ "fontSize": "1em", "fontWeight": "600", "textAlign": "left" }}>
                  <lable> Quote Attached Files :</lable>
                </div>
                <div className="col-sm-6 no-padding float-left" style={{ "textAlign": "left" }}>
                  {quote_files}
                </div>
              </div>)}
              {invoice_files.length > 0 && (<div className="col-md-6 float-right" style={{ marginTop: '20px' }}>
                <div className="col-sm-12 no-padding float-right" style={{ "fontSize": "1em", "fontWeight": "600", "textAlign": "left" }}>
                  <lable> Invoice Attached Files :</lable>
                </div>
                <div className="col-sm-12 no-padding float-right" style={{ "textAlign": "left" }}>
                  {invoice_files}
                </div>
              </div>)}
            </div>
            <div class="row">
            <div className="col-md-3">
                <h5 style={{ "cursor": "pointer" }} onClick={() => {
                  this.setState({ itemExpanded: !this.state.itemExpanded })
                }}>Service Catalog                       <i className={this.state.itemExpanded ? "fa fa-caret-down fa-lg" : "fa fa-caret-right fa-lg"} aria-hidden="true" style={{ "cursor": "pointer" }} ></i></h5>
              </div>
              </div>
            <div className="row  mb-5" style={{marginLeft:"-2px"}}>    
              <div className="col-md-3">
                {
                  this.state.itemExpanded && <span><b>Work Type</b></span>
                }
                {this.state.itemExpanded &&
                  <Select
                    className="basic-single text-center title-div-style"
                    classNamePrefix="select"
                    value={this.state.currentDropdownValueWorkType}
                    name="work_type"
                    id="work_Type"
                    isDisabled={false}
                    isLoading={false}
                    clearable={false}
                    isRtl={false}              
                    isSearchable={false}
                    styles={customStyles}
                    options={workTypes}
                    onChange={this.handleDropdownChangeWorkType.bind(this)}
                  />}
              </div>
              <div className="col-md-3">
                {
                  this.state.itemExpanded && this.state.fixedFlag && this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value != '*' && this.state.currentDropdownValueWorkType.value != 'Small Cell' && <span><b>Rate Type</b></span>
                }
                {this.state.itemExpanded && this.state.fixedFlag && this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value != '*' && this.state.currentDropdownValueWorkType.value != 'Small Cell' &&
                  <Select
                    className="basic-single text-center title-div-style"
                    id="rate_Type"
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
                  />}
              </div>


              <div className="col-md-3">
              {
                                this.state.itemExpanded && <div style={{"paddingLeft": "4.6vw"}}><b>Search</b></div>
                            }
                {this.state.itemExpanded && <div className="search-bar float-right" >
                  <input
                    placeholder="Search line Items"
                    className="form-control title-div-style"
                    style={{ 
                      height:"32px",
                      borderRadius: "0rem"}}
                    autoComplete="off"
                    onChange={this.handleChangeSearch.bind(this)}
                    id="search-bar"

                  />
                </div>}
              </div>
            </div>
            {this.state.itemExpanded && <div className="container">
              {this.state.pageLoadinggrid ? this.renderLoading() : <div>
                {this.mobCharge && <p style={{border:"1px solid red",textAlign:'center',padding:"0.8rem",fontFamily: "BrandFont-Text, Helvetica, Arial, sans-serif",
fontSize:"1rem",color:"#000"}}>This Mobilization Unit can only be utilized once per VWRS. See unit long description under the information icon for details</p>}
                 <DataGrid
                    checkboxSelection ={true}
                    apiRef={this.apiRef}
                    rows={!this.state.modfdGridDetails ? [] : this.state.modfdGridDetails}
                    columns={columns}
                    onRowSelectionModelChange={ (params) => this.onSelectionChanged(params) }
                    rowHeight={30}
                    disableMultipleRowSelection={false}
                    columnHeaderHeight={35}
                    getRowId={this.getRowId}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10}
                      },
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

                <button id="Login" type="submit" className="Button--secondary  btn btn-md u-floatRight" style={{marginTop: "1em"}} onClick={this.handleAddServices.bind(this)} disabled={this.state.selectedServices.length == 0 }>Add</button>
              </div>}
            </div>}
          </div>}
        </div>
      )
    }

  }
}

function stateToProps(state, props) {
  let workoderinfo = props.workORderInfo ? props.workORderInfo.toJS() : {}
  let workorderId = (props.workORderInfo && props.workORderInfo.get("workorder_id")) ? props.workORderInfo.get("workorder_id") + "" : null
  let attachedList = new List()
  let category = (props.formName === "SubmitQuote") ? "quote" : "invoice"

  let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
  let user = state.getIn(["Users", "entities", "users", loginId], Map())
  let userList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let groupVendors = state.getIn(['Users', 'entities', 'users', loginId, 'group_vendors'], List())
  let site = state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List())
  let workOrderDispatchDistance = state.getIn(["VendorDashboard","getWorkOrderDistanceDetails"], Map())
  attachedList = state.getIn(["VendorDashboard", loginId, "workOrderMap", props.wo_meta_universalid, 'files', category, 'attachments'], List())
  let vendorId = user.toJS().vendor_id
  let vendorName = user.toJS().vendor_name
  let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let currentValues = state.getIn(["Forms", "SubmitQuote", "currentValues"], List())

  let switchData = state.getIn(["Switch", loginId, "switch", "switchDetails"], Map())
  let config= state.getIn(['Users', 'configData', 'configData'], List())

  return {

    loginId,
    vendorId,
    vendorName,
    market,
    attachedList,
    submarket,
    workorderId,
    site,
    user,
    userList,
    currentValues,
    groupVendors,
    workoderinfo,
    switchData,
    config,
    workOrderDispatchesDistance: workOrderDispatchDistance && workOrderDispatchDistance.toJS()
  }
}
export default connect(stateToProps, { ...formActions, ...VendorActions, ...elogActions })(WorkOrderQuoteSubmitFixedPricing)
