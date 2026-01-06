import React from 'react'
import { Map, List } from 'immutable'
import Loader from '../../Layout/components/Loader'
import Select from 'react-select'
import { connect } from "react-redux"
import moment from 'moment'
import * as pmActions from "../actions"
import Addasite from './Addasite'
import { typeAbbrMap } from '../utils'
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core'
import {getHolidayEvents} from "../../sites/actions"
import { DataGrid, useGridApiRef } from "@mui/x-data-grid"

class CreateAList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      managerForAddASite: { value: '', label: '' },
      currentDropdownValueType: { value: '', label: '' },
      drpdwnOptionsType: [],
      currentDropdownValueManager: { value: '', label: '' },
      drpdwnOptionsManager: [],
      filteredLists: [],
      fuelCostErr: false,
      laborCostErr: false,
      managerObj: {},
      selectedLists: [],
      pageLoading: false,
      inputFuelCost: '',
      inputLaborCost: '',
      showAddSiteModel: false,
      selectedLoc: [],
      filteredListsForAddASite: [],
      gridApi: null,
      radioSelection: 'Hourly Rate',
      inspectionDetailsList: [],
      fastHolidays: null

    }
    this.initializeComponent = this.initializeComponent.bind(this)
    this.getFileredValues = this.getFileredValues.bind(this)
    this.formPostRequest = this.formPostRequest.bind(this)
    this.formPostRequestTower = this.formPostRequestTower.bind(this)
    this.managerChanged = this.managerChanged.bind(this)
    this.clearFuelLaborCost = this.clearFuelLaborCost.bind(this)
    this.getFileredTowerValues = this.getFileredTowerValues.bind(this)
    this.getFileredHvacValues = this.getFileredHvacValues.bind(this)

  }
  componentDidMount() {
    this.initializeComponent()

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

  handleAddSite() {
    const filteredLists = this.state.filteredLists.map(val => ({
      ...val,
      LABOUR_COST: 0,
      TOTAL_COST: 0,
      GEN_FUEL_COST: 0
    }))
    this.setState({ showAddSiteModel: !this.state.showAddSiteModel, filteredLists })
  }
  handleHideAddSite = () => {
    this.setState({ showAddSiteModel: false })
  }
  renderAddSiteModal = () => {
    return (
      <div className="container mb-3">
        <Addasite currentDropdownValueType={this.state.currentDropdownValueType.value} filteredListsForAddASite={this.state.filteredListsForAddASite}
          notiref={this.props.notiref} initializeComponent={this.initializeComponent}
          handleHideAddSite={this.handleHideAddSite} managerChanged={this.managerChanged}
          managerForAddASite={this.state.managerForAddASite}
          clearFuelLaborCost={this.clearFuelLaborCost} />
      </div>
    )
  }
  async getBuyerDetails() {
    const { loginId, vendorId, fetchBuyerListDetails, fetchSiteListDetails, market, submarket } = this.props
    await fetchBuyerListDetails(vendorId, loginId, market, submarket)
  }
  async initializeComponent() {
    const { vendorId, loginId, fetchCreateListSites, year } = this.props
    this.setState({ pageLoading: true })
    await fetchCreateListSites(vendorId, loginId, year).then(async action => {
      if (action.type === 'FETCH_CREATELIST_SUCCESS') {
        this.getBuyerDetails()
        await this.formDropdownOptions()
      }
    })
    this.props.getHolidayEvents().then(res => {
      if (res.type === 'FETCH_HOLIDAYEVENTS_SUCCESS') {
          const fastHolidays = res.holidayEvents && res.holidayEvents.length > 0 ? res.holidayEvents.map((hol) => hol.HOLIDAY_DATE && hol.HOLIDAY_DATE.length > 10 && hol.HOLIDAY_DATE.substring(0, 10)) : []
          this.setState({fastHolidays: fastHolidays})
      }
  })

    this.setState({ pageLoading: false })
  }
  async formDropdownOptions() {
    var managersList = this.props.createSitesList.map(val => val.MANAGER_ID.toLowerCase()).reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item]
    }, [])

    const drpdwnOptionsManager = managersList.map(val => ({ label: this.props.createSitesList.find(csl => csl.MANAGER_ID.toLowerCase() === val.toLowerCase()).MANAGER, value: val }))

    const drpdwnOptionsType = [{ label: 'PM GEN FUEL', value: 'PM GEN FUEL' }, { label: 'PM GENERATOR REPAIR', value: 'PM GENERATOR REPAIR' }, { label: 'PM HVAC REPAIR', value: 'PM HVAC REPAIR' }, { label: 'TOWER MINOR MAINTENANCE', value: 'TOWER MINOR MAINTENANCE' }]
    await this.setState({ drpdwnOptionsManager, drpdwnOptionsType })
  }
  filterList = (currItem) => {

    const GenPMItemsIds = ['21', '27', '28', '8', '22', '29']
    const genFuelItemIds = ['21', '28', '8', '22', '29']
    // const hvacRepairItems = ['4', '38', '39']
    if (this.state.currentDropdownValueType.value === 'PM GEN FUEL') {
      return genFuelItemIds.includes(currItem.PM_TMPLT_ATTR_ID)
    } else if (this.state.currentDropdownValueType.value === 'PM GENERATOR REPAIR') {
      return GenPMItemsIds.includes(currItem.PM_TMPLT_ATTR_ID)
    }
    //  else if (this.state.currentDropdownValueType.value === 'PM HVAC REPAIR') {
    //   return hvacRepairItems.includes(currItem.PM_TMPLT_ATTR_ID)
    // }
    else {
      return true
    }
  }

  async getFileredHvacValues() {
    // PM_LOCATION_UNID: "5A3F00352D5299011B69009584B34B52"
    // PM_SITE_ID: "186360"
    // PO_NUM: "NARO180529"
    var inspectionDetailsList = []
    this.props.createSitesTowerList.forEach((e, index) => {
      const inspectionDetailsElement = inspectionDetailsList.find(idl => idl.PM_SITE_ID === e.PM_SITE_ID && idl.PO_NUM === e.PO_NUM && idl.PM_LOCATION_UNID === e.PM_LOCATION_UNID)
      if (inspectionDetailsElement) {
        if (e.ATTRIBUTE_CATEGORY === '4-2') {
          inspectionDetailsElement.MATERIAL_COST = parseFloat(e.ATTRIBUTE_VALUE)
        }
        if (e.ATTRIBUTE_CATEGORY === '4-3') {
          inspectionDetailsElement.LABOUR_HOURS = parseFloat(e.ATTRIBUTE_VALUE)
        }
        inspectionDetailsElement.TOTAL_COST = inspectionDetailsElement.MATERIAL_COST
      } else {
        inspectionDetailsList.push({
          ...e,
          id: index,
          TOTAL_COST: e.ATTRIBUTE_CATEGORY === '4-2' ? parseFloat(e.ATTRIBUTE_VALUE) : '',
          MATERIAL_COST: e.ATTRIBUTE_CATEGORY === '4-2' && parseFloat(e.ATTRIBUTE_VALUE),
          LABOUR_HOURS: e.ATTRIBUTE_CATEGORY === '4-3' && parseFloat(e.ATTRIBUTE_VALUE),
          LABOUR_COST: '',
          PM_TYPE_NAME: 'HVAC REPAIR'
        })
      }
    })
    // var inspectionDetailsList = this.props.createSitesTowerList.map(v => {
    //   return {
    //     ...v,
    //     TOTAL_COST: v.ATTRIBUTE_CATEGORY === '4-2' || v.ATTRIBUTE_CATEGORY === '4-3' ?  parseFloat(v.ATTRIBUTE_VALUE) : '',
    //     MATERIAL_COST: v.ATTRIBUTE_CATEGORY === '4-2' && parseFloat(v.ATTRIBUTE_VALUE),
    //     LABOUR_HOURS: v.ATTRIBUTE_CATEGORY === '4-3' && parseFloat(v.ATTRIBUTE_VALUE),
    //     LABOUR_COST: '',
    //     PM_TYPE_NAME: 'HVAC PM'
    //   }
    // })


    var managersList = this.props.createSitesTowerList.map(val => val.MANAGER_ID.toLowerCase()).reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item]
    }, [])


    const drpdwnOptionsManager = managersList.map(val => ({ label: this.props.createSitesTowerList.find(csl => csl.MANAGER_ID.toLowerCase() === val.toLowerCase()).MANAGER, value: val }))


    inspectionDetailsList = inspectionDetailsList.filter(val => {
      let typeMatch = true
      let managerMatch = !this.state.currentDropdownValueManager.value || this.state.currentDropdownValueManager.value.toLowerCase() === val.MANAGER_ID.toLowerCase()
      return typeMatch && managerMatch
    })

    await this.setState({ inspectionDetailsList: inspectionDetailsList, drpdwnOptionsManager, filteredListsForAddASite: inspectionDetailsList })

  }

  async getFileredTowerValues() {

    var inspectionDetailsList = this.props.createSitesTowerList.map((v, index) => {
      return {
        ...v,
        id: index,
        TotalCost: parseFloat(v.ATTRIBUTE_VALUE) * parseFloat(v.ATTRIBUTE_FIELDS),
        PM_TYPE_NAME: this.state.currentDropdownValueType.value
      }
    })


    var managersList = this.props.createSitesTowerList.map(val => val.MANAGER_ID.toLowerCase()).reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item]
    }, [])


    const drpdwnOptionsManager = managersList.map(val => ({ label: this.props.createSitesTowerList.find(csl => csl.MANAGER_ID.toLowerCase() === val.toLowerCase()).MANAGER, value: val }))


    inspectionDetailsList = inspectionDetailsList.filter(val => {
      let typeMatch = true
      let managerMatch = !this.state.currentDropdownValueManager.value || this.state.currentDropdownValueManager.value.toLowerCase() === val.MANAGER_ID.toLowerCase()
      return typeMatch && managerMatch
    })



    await this.setState({ inspectionDetailsList: inspectionDetailsList, drpdwnOptionsManager, filteredListsForAddASite: inspectionDetailsList })

  }
  async getFileredValues() {
    const filteredLists = this.props.createSitesList.filter(val => {
      let typeMatch = !this.state.currentDropdownValueType.value || this.filterList(val)
      let managerMatch = !this.state.currentDropdownValueManager.value || this.state.currentDropdownValueManager.value.toLowerCase() === val.MANAGER_ID.toLowerCase()
      return typeMatch && managerMatch
    })

    const uniqueLocationIds = filteredLists.map(val => val.PS_LOCATION_ID).reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item]
    }, [])

    const searchSitesWithoutFilter = uniqueLocationIds.map((val, index) => {
      let laborHoursVal = this.state.currentDropdownValueType.value === 'PM GEN FUEL' ? '29' : '28'
      let fuelGallons = !!filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && inVal.PM_TMPLT_ATTR_ID === '21') && filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && inVal.PM_TMPLT_ATTR_ID === '21').PM_TMPLT_ATTR_NEW_VALUE ? filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && inVal.PM_TMPLT_ATTR_ID === '21').PM_TMPLT_ATTR_NEW_VALUE : ''
      let materialCost = !!filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && (inVal.PM_TMPLT_ATTR_ID === '27' || inVal.PM_TMPLT_ATTR_ID === '38')) && filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && (inVal.PM_TMPLT_ATTR_ID === '27' || inVal.PM_TMPLT_ATTR_ID === '38')).PM_TMPLT_ATTR_NEW_VALUE ? filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && (inVal.PM_TMPLT_ATTR_ID === '27' || inVal.PM_TMPLT_ATTR_ID === '38')).PM_TMPLT_ATTR_NEW_VALUE : ''
      let laborHours = !!filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && (inVal.PM_TMPLT_ATTR_ID === laborHoursVal || inVal.PM_TMPLT_ATTR_ID === '39')) && filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && (inVal.PM_TMPLT_ATTR_ID === laborHoursVal || inVal.PM_TMPLT_ATTR_ID === '39')).PM_TMPLT_ATTR_NEW_VALUE ? filteredLists.find(inVal => inVal.PS_LOCATION_ID === val && (inVal.PM_TMPLT_ATTR_ID === laborHoursVal || inVal.PM_TMPLT_ATTR_ID === '39')).PM_TMPLT_ATTR_NEW_VALUE : ''
      return {
        ...filteredLists.find(inVal => inVal.PS_LOCATION_ID === val),
        id: index,
        FUEL_AMOUNT: fuelGallons,
        MATERIAL_COST: materialCost,
        LABOUR_HOURS: laborHours,
        GEN_FUEL_COST: '',
        LABOUR_COST: '',
        TOTAL_COST: materialCost,
        PM_TYPE_NAME: this.state.currentDropdownValueType.value === 'PM GEN FUEL' ? 'GENERATOR FUEL' : this.state.currentDropdownValueType.value === 'PM GENERATOR REPAIR' ? 'GENERATOR REPAIR' : this.state.currentDropdownValueType.value === 'PM HVAC REPAIR' ? 'HVAC REPAIR' : ''
      }
    })

    const newSearchSitesResults = searchSitesWithoutFilter.filter(inval => {

      return ((inval.PM_TYPE_NAME === 'HVAC REPAIR' || inval.PM_TYPE_NAME === 'GENERATOR REPAIR') && !isNaN(parseFloat(inval.MATERIAL_COST)) && parseFloat(inval.MATERIAL_COST) > 0) || ((inval.PM_TYPE_NAME === 'GENERATOR FUEL') && !isNaN(parseFloat(inval.FUEL_AMOUNT)) && parseFloat(inval.FUEL_AMOUNT) > 0)
    })
    await this.setState({ filteredLists: newSearchSitesResults, filteredListsForAddASite: filteredLists.map(val => ({ ...val, PM_TYPE_NAME: this.state.currentDropdownValueType.value === 'PM GEN FUEL' ? 'GENERATOR FUEL' : this.state.currentDropdownValueType.value === 'PM GENERATOR REPAIR' ? 'GENERATOR REPAIR' : this.state.currentDropdownValueType.value === 'PM HVAC REPAIR' ? 'HVAC REPAIR' : '' })) })
  }
  handleLabourCostChange = (e) => {
    if (isNaN(e.target.value) || parseFloat(e.target.value) <= 0) {
      this.setState({ laborCostErr: true })
    } else {
      this.setState({ laborCostErr: false })
      if (this.state.currentDropdownValueType.value === 'PM HVAC REPAIR') {
        const inspectionDetailsList = this.state.inspectionDetailsList.map(val => {
          if (val.LABOUR_HOURS) {
            return {
              ...val, LABOUR_COST: parseFloat(e.target.value) ? parseFloat(e.target.value) * (this.state.radioSelection === 'Hourly Rate' ? parseFloat(val.LABOUR_HOURS) : this.state.radioSelection === 'Flat Rate' ? 1 : 0) : 0,
              TOTAL_COST: (parseFloat(val.MATERIAL_COST) ? parseFloat(val.MATERIAL_COST) : 0) + (parseFloat(e.target.value) ? parseFloat(e.target.value) * (this.state.radioSelection === 'Hourly Rate' ? parseFloat(val.LABOUR_HOURS) : this.state.radioSelection === 'Flat Rate' ? 1 : 0) : 0)
            }
          } else {
            return val
          }
        })
        this.setState({ inspectionDetailsList, inputLaborCost: e.target.value })
      } else {
        const filteredLists = this.state.filteredLists.map(val => {
          if (val.LABOUR_HOURS) {
            return {
              ...val, LABOUR_COST: parseFloat(e.target.value) ? parseFloat(e.target.value) * (this.state.radioSelection === 'Hourly Rate' ? parseFloat(val.LABOUR_HOURS) : this.state.radioSelection === 'Flat Rate' ? 1 : 0) : 0,
              TOTAL_COST: (parseFloat(val.MATERIAL_COST) ? parseFloat(val.MATERIAL_COST) : 0) + (parseFloat(val.GEN_FUEL_COST) ? parseFloat(val.GEN_FUEL_COST) : 0) + (parseFloat(e.target.value) ? parseFloat(e.target.value) * (this.state.radioSelection === 'Hourly Rate' ? parseFloat(val.LABOUR_HOURS) : this.state.radioSelection === 'Flat Rate' ? 1 : 0) : 0)
            }
          } else {
            return val
          }
        })
        this.setState({ filteredLists, inputLaborCost: e.target.value })
      }
    }
  }
  handleFuelCostChange = (e) => {
    if (isNaN(e.target.value) || parseFloat(e.target.value) <= 0) {
      this.setState({ fuelCostErr: true })
    } else {
      this.setState({ fuelCostErr: false })
      const filteredLists = this.state.filteredLists.map(val => {
        if (val.FUEL_AMOUNT) {
          return {
            ...val, GEN_FUEL_COST: parseFloat(e.target.value) ? parseFloat(e.target.value) * parseFloat(val.FUEL_AMOUNT) : 0,
            TOTAL_COST: (parseFloat(val.MATERIAL_COST) ? parseFloat(val.MATERIAL_COST) : 0) + (parseFloat(val.LABOUR_COST) ? parseFloat(val.LABOUR_COST) : 0) + (parseFloat(e.target.value) ? parseFloat(e.target.value) * parseFloat(val.FUEL_AMOUNT) : 0)
          }
        } else {
          return val
        }
      })
      this.setState({ filteredLists, inputFuelCost: e.target.value })
    }
  }
  clearLaborCost = () => {
    this.setState({ inputLaborCost: '' })
    if (document.getElementById('laborCost')) { document.getElementById('laborCost').value = '' }
  }
  async clearFuelLaborCost() {
    await this.setState({ inputFuelCost: '', inputLaborCost: '' })
    if (document.getElementById('fuelCost')) { document.getElementById('fuelCost').value = '' }
    if (document.getElementById('laborCost')) { document.getElementById('laborCost').value = '' }
  }
  handleDropdownChangeType = (e) => {
    this.clearFuelLaborCost()
    this.setState({ currentDropdownValueType: e, inputFuelCost: '', inputLaborCost: '' }, async () => {
      if (this.state.currentDropdownValueType.value === 'TOWER MINOR MAINTENANCE' || this.state.currentDropdownValueType.value === 'PM HVAC REPAIR') {
        if (this.state.currentDropdownValueType.value === 'TOWER MINOR MAINTENANCE') {
          this.getFileredTowerValues()
        }
        if (this.state.currentDropdownValueType.value === 'PM HVAC REPAIR') {
          this.getFileredHvacValues()
        }
        if (this.state.currentDropdownValueManager.value.length > 0) {
          this.managerChanged(this.state.currentDropdownValueManager)
        }
      } else {
        if (this.state.currentDropdownValueManager.value.length > 0) {
          this.managerChanged(this.state.currentDropdownValueManager)
        } else {
          this.getFileredValues()
        }
      }

    })

  }
  async handleDropdownChangeManager(e) {
    await this.clearFuelLaborCost()
    await this.managerChanged(e)

  }
  getPOTypeIds(managerObj) {

    const refDetailArr = this.props.pmRefDetails.filter(prd => prd.PM_TYPE_NAME === managerObj.PM_TYPE_NAME)

    return refDetailArr.map(val => val.CHILD_PM_TYPE_ID).join(',')
  }
  async managerChanged(e) {
    await this.setState({ currentDropdownValueManager: e, pageLoading: true, managerForAddASite: e }, () => {
      if (this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE') {
        this.getFileredTowerValues()
      } else if (this.state.currentDropdownValueType.value === 'PM HVAC REPAIR') {
        this.getFileredHvacValues()
      } else { this.getFileredValues() }

    })

    const { vendorId, loginId, submarket, market, fetchExpenseProjIdData, fetchSiteListDetails, fetchActiveSites } = this.props
    var managerObj
    var manager_id
    if (this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE' || this.state.currentDropdownValueType.value == 'PM HVAC REPAIR') {

      managerObj = this.state.filteredListsForAddASite.find(val => val.MANAGER_ID.toLowerCase() === e.value.toLowerCase()) ? this.state.filteredListsForAddASite.find(val => val.MANAGER_ID.toLowerCase() === e.value.toLowerCase()) : {}
      manager_id = this.state.filteredListsForAddASite.find(val => val.MANAGER_ID.toLowerCase() === e.value.toLowerCase()) ? this.state.filteredListsForAddASite.find(val => val.MANAGER_ID.toLowerCase() === e.value.toLowerCase()).MANAGER_ID : ''
    } else {
      managerObj = this.state.filteredListsForAddASite.find(val => val.MANAGER_ID.toLowerCase() === e.value.toLowerCase()) ? this.state.filteredListsForAddASite.find(val => val.MANAGER_ID.toLowerCase() === e.value.toLowerCase()) : {}
      manager_id = this.state.filteredListsForAddASite.find(val => val.MANAGER_ID.toLowerCase() === e.value.toLowerCase()) ? this.state.filteredListsForAddASite.find(val => val.MANAGER_ID.toLowerCase() === e.value.toLowerCase()).MANAGER_ID : ''
    }
    let poTypeIds = this.getPOTypeIds(managerObj)

    await fetchActiveSites(vendorId, loginId, submarket, manager_id, poTypeIds)

    await fetchExpenseProjIdData(vendorId, loginId, submarket, manager_id)

    if (Object.keys(managerObj).length > 0) {
      await fetchSiteListDetails(
        vendorId, loginId, market, submarket, manager_id, this.props.pmRefDetails.find(prd => managerObj.PM_TYPE_NAME.indexOf(prd.PM_TYPE_NAME) > -1).EQUIPMENT_TYPE).then(async (action) => {

          this.setState({ managerObj })
          const refName = (this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE' || this.state.currentDropdownValueType.value == 'PM HVAC REPAIR') ? await this.getRefNameTower().toUpperCase() : await this.getRefName().toUpperCase()

          this.props.passRefname(refName)

        })
        .catch(error => {
          console.log('some error occured,,,', error)
        })
      if (this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE' || this.state.currentDropdownValueType.value == 'PM HVAC REPAIR') {
        const siteListLoc = this.props.erpFlag == 'N' ? this.props.siteListDetails.map(sld => sld.ps_loc) : this.props.siteListDetails.map(sld => sld.mdg_id)
        const inspectionDetailsList = this.props.erpFlag == 'N' ? this.state.inspectionDetailsList.filter(fd => siteListLoc.includes(fd.PS_LOCATION_ID)) :  this.state.inspectionDetailsList.filter(fd => siteListLoc.includes(fd.MDG_ID))
        await this.setState({ inspectionDetailsList })
      } else {
        const siteListLoc = this.props.erpFlag == 'N' ? this.props.siteListDetails.map(sld => sld.ps_loc) : this.props.siteListDetails.map(sld => sld.mdg_id)
        const newFilteredLists = this.props.erpFlag == 'N' ? this.state.filteredLists.filter(fd => siteListLoc.includes(fd.PS_LOCATION_ID)) : this.state.filteredLists.filter(fd => siteListLoc.includes(fd.MDG_ID))
        await this.setState({ filteredLists: newFilteredLists })
      }

    }

    this.setState({ pageLoading: false })
  }

  modifyGridDetails = () => {
    if (this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE') {
      return this.state.inspectionDetailsList.map((fdata) => ({
        PO_NUM: !!fdata && !!fdata.PO_NUM ? fdata.PO_NUM : '',
        PM_LOCATION_NAME: !!fdata && !!fdata.PM_LOCATION_NAME ? fdata.PM_LOCATION_NAME : '',
        PS_LOCATION_ID: !!fdata && !!fdata.PS_LOCATION_ID ? fdata.PS_LOCATION_ID : '',
        FUEL_AMOUNT: !!fdata && !!fdata.FUEL_AMOUNT ? fdata.FUEL_AMOUNT : '',
        GEN_FUEL_COST: !!fdata && !!fdata.GEN_FUEL_COST ? fdata.GEN_FUEL_COST : '',
        MATERIAL_COST: !!fdata && !!fdata.MATERIAL_COST ? fdata.MATERIAL_COST : '',
        LABOUR_HOURS: !!fdata && !!fdata.LABOUR_HOURS ? fdata.LABOUR_HOURS : '',
        LABOUR_COST: !!fdata && !!fdata.LABOUR_COST ? fdata.LABOUR_COST : '',
        TOTAL_COST: !!fdata && !!fdata.TotalCost ? fdata.TotalCost : '',
        PM_TMPLT_ATTR_ID: !!fdata && !!fdata.ATTRIBUTE_ID ? fdata.ATTRIBUTE_ID : '',
        PO_REFNAME: !!fdata && !!fdata.PM_LIST_NAME ? fdata.PM_LIST_NAME : '',
        ATTRIBUTE_NAME: !!fdata && !!fdata.ATTRIBUTE_NAME ? fdata.ATTRIBUTE_NAME : '',
        BUYER: !!fdata && !!fdata.BUYER ? fdata.BUYER : '',
        MDGLC: !!fdata && !!fdata.MDG_ID ? fdata.MDG_ID : '',
        PM_LIST_ITEM_ID: !!fdata && !!fdata.PM_LIST_ITEM_ID ? fdata.PM_LIST_ITEM_ID : '',
        id: !!fdata && !!fdata.id ? fdata.id : ''
      }))
    } else if (this.state.currentDropdownValueType.value == 'PM HVAC REPAIR') {
      return this.state.inspectionDetailsList.map((fdata) => ({
        PO_NUM: !!fdata && !!fdata.PO_NUM ? fdata.PO_NUM : '',
        PM_LOCATION_NAME: !!fdata && !!fdata.PM_LOCATION_NAME ? fdata.PM_LOCATION_NAME : '',
        PS_LOCATION_ID: !!fdata && !!fdata.PS_LOCATION_ID ? fdata.PS_LOCATION_ID : '',
        FUEL_AMOUNT: !!fdata && !!fdata.FUEL_AMOUNT ? fdata.FUEL_AMOUNT : '',
        GEN_FUEL_COST: !!fdata && !!fdata.GEN_FUEL_COST ? fdata.GEN_FUEL_COST : '',
        MATERIAL_COST: !!fdata && !!fdata.MATERIAL_COST ? fdata.MATERIAL_COST : '',
        LABOUR_HOURS: !!fdata && !!fdata.LABOUR_HOURS ? fdata.LABOUR_HOURS : '',
        LABOUR_COST: !!fdata && !!fdata.LABOUR_COST ? fdata.LABOUR_COST : '',
        TOTAL_COST: !!fdata && !!fdata.TOTAL_COST ? fdata.TOTAL_COST : '',
        PM_TMPLT_ATTR_ID: !!fdata && !!fdata.ATTRIBUTE_ID ? fdata.ATTRIBUTE_ID : '',
        PO_REFNAME: !!fdata && !!fdata.PM_LIST_NAME ? fdata.PM_LIST_NAME : '',
        ATTRIBUTE_NAME: !!fdata && !!fdata.ATTRIBUTE_NAME ? fdata.ATTRIBUTE_NAME : '',
        BUYER: !!fdata && !!fdata.BUYER ? fdata.BUYER : '',
        MDGLC: !!fdata && !!fdata.MDG_ID ? fdata.MDG_ID : '',
        PM_LIST_ITEM_ID: !!fdata && !!fdata.PM_LIST_ITEM_ID ? fdata.PM_LIST_ITEM_ID : '',
        id: !!fdata && !!fdata.id ? fdata.id : ''
      }))
    } else {
      return this.state.filteredLists.map((fdata) => ({
        PO_NUM: !!fdata && !!fdata.PO_NUM ? fdata.PO_NUM : '',
        PM_LOCATION_NAME: !!fdata && !!fdata.PM_LOCATION_NAME ? fdata.PM_LOCATION_NAME.split('^')[1] : '',
        PS_LOCATION_ID: !!fdata && !!fdata.PS_LOCATION_ID ? fdata.PS_LOCATION_ID : '',
        FUEL_AMOUNT: !!fdata && !!fdata.FUEL_AMOUNT ? fdata.FUEL_AMOUNT : '',
        GEN_FUEL_COST: !!fdata && !!fdata.GEN_FUEL_COST ? fdata.GEN_FUEL_COST : '',
        MATERIAL_COST: !!fdata && !!fdata.MATERIAL_COST ? fdata.MATERIAL_COST : '',
        LABOUR_HOURS: !!fdata && !!fdata.LABOUR_HOURS ? fdata.LABOUR_HOURS : '',
        LABOUR_COST: !!fdata && !!fdata.LABOUR_COST ? fdata.LABOUR_COST : '',
        TOTAL_COST: !!fdata && !!fdata.TOTAL_COST ? fdata.TOTAL_COST : '',
        PM_TMPLT_ATTR_ID: !!fdata && !!fdata.PM_TMPLT_ATTR_ID ? fdata.PM_TMPLT_ATTR_ID : '',
        PO_REFNAME: !!fdata && !!fdata.PM_LIST_NAME ? fdata.PM_LIST_NAME : '',
        MDGLC: !!fdata && !!fdata.MDG_ID ? fdata.MDG_ID : '',
        PM_LIST_ITEM_ID: !!fdata && !!fdata.PM_LIST_ITEM_ID ? fdata.PM_LIST_ITEM_ID : '',
        id: !!fdata && !!fdata.id ? fdata.id : ''
      }))
    }


  }
  getPmType = () => {
    if (this.state.currentDropdownValueType.value === "PM HVAC REPAIR") {
      return 'HVAC REPAIR'
    } else if (this.state.currentDropdownValueType.value === "PM GEN FUEL") {
      return 'GENERATOR FUEL'
    } else if (this.state.currentDropdownValueType.value === "PM GENERATOR REPAIR") {
      return 'GENERATOR REPAIR'
    } else {
      return ''
    }

  }
  getItemIDParent = () => {
    if (this.state.currentDropdownValueType.value === "PM HVAC REPAIR") {
      return 'EXP-RPR-HVAC-CELL'
    } else if (this.state.currentDropdownValueType.value === "PM GEN FUEL") {
      return 'EXP-FUEL-GENERATOR'
    } else if (this.state.currentDropdownValueType.value === "PM GENERATOR REPAIR") {
      return 'EXP-RPR-GEN-CELL'
    } else {
      return ''
    }
  }
  async formPostRequestTower() {
    var firstElement = this.state.selectedLists[0]
    const { market, submarket, pmRefDetails, vendorId, user, expenseProjId, wbscodes, buyerListDetails } = this.props
    const pmRefDet = pmRefDetails.filter(prd => prd.PO_ITEM_ID === firstElement.PS_ITEM_ID)[0]
    const buyerListData = !!buyerListDetails && !!buyerListDetails.feandmgrs && !!buyerListDetails.feandmgrs.find(val => val.userid.toLowerCase() === this.state.managerObj.MANAGER_ID.toLowerCase()) ? buyerListDetails.feandmgrs.find(val => val.userid.toLowerCase() === this.state.managerObj.MANAGER_ID.toLowerCase()) : ''
    //add mmid,enterprise id,wbs
    let mmid = pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].MMID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].MMID : '';
    let vendor_mdgid= !!user && user.group_vendors.filter(i =>i.vendor_id == vendorId).length > 0 ? user.group_vendors.filter(i =>i.vendor_id == vendorId)[0].vendor_mdg_id : ''
    return {
      "createList": {
        "pmList": {
          "pm_list_year": moment().format('YYYY'),
          "pm_type": firstElement.PM_TYPE_NAME ? firstElement.PM_TYPE_NAME : '',
          "frequency": "Adhoc",
          "market": market ? market : '',
          "sub_market": submarket ? submarket : '',
          "pm_group": 'REPAIR',
          "manager": this.state.managerObj.MANAGER ? this.state.managerObj.MANAGER : '',
          "manager_id": !!this.state.managerObj && !!this.state.managerObj.MANAGER_ID ? this.state.managerObj.MANAGER_ID : '',
          "location_type": "SITE",
          "mmid": !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].MMID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].MMID : '',
          "ps_item_id": !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].PARTENT_ITEM_ID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].PARTENT_ITEM_ID : '',
          "buyer": this.state.managerObj.MANAGER ? this.state.managerObj.MANAGER : '',
          "buyer_id": !!this.state.managerObj && !!this.state.managerObj.MANAGER_ID ? this.state.managerObj.MANAGER_ID : '',
          "emp_id": !!buyerListData && !!buyerListData.empid ? buyerListData.empid.trim() : '',
          "enterprise_id": !!buyerListData && !!buyerListData.enterprise_id ? buyerListData.enterprise_id : '',
          "createdBy_EID": !!buyerListData && !!buyerListData.enterprise_id && buyerListData.enterprise_id,
          "modifiedBy_EID":!!buyerListData && !!buyerListData.enterprise_id && buyerListData.enterprise_id,
          "creator": !!user && !!user.vendor_name ? user.vendor_name : '',
          "approver": '',
          "vendor_id": vendorId,
          "vendor_name": !!user && !!user.vendor_name ? user.vendor_name : '',
          "vendor_psid": (this.props.userList?.length>0 && this.props.userList[0]?.vendor_peoplesoft_id) || '',
          "vendor_mdgid" : !!vendor_mdgid ? vendor_mdgid : '',
          "po_bu":  '',
          "cost_center": "8600",
          "product_cd": "200",
          "expense_proj_id": !!expenseProjId && expenseProjId.length > 0 ? expenseProjId[0] : '',
          "wbs_element": !!wbscodes && wbscodes.length > 0 ? wbscodes[0] : '',
          "po_email_distro": !!buyerListDetails && !!buyerListDetails.po_info && buyerListDetails.po_info.poEmailDetails.length > 0 ? buyerListDetails.po_info.poEmailDetails[0].po_emails : '',
          "po_num": '',
          "pm_list_status": "REQUESTED",
          "ps_poll_ind": "N",
          "po_entered_date": '',
          "apply_pm_vendor": "N",
          "is_list_completed": 'Y',
          "is_vendor_requested": 'Y',
          "buyer_email": !!this.state.managerObj && !!this.state.managerObj.MANAGER_EMAIL ? this.state.managerObj.MANAGER_EMAIL : '',
          "vendor_email": !!this.props.userList && this.props.userList?.length>0 && !!this.props.userList[0].vendor_service_email && this.props.userList[0].vendor_service_email, // service email
          "manager_email": this.state.managerObj.MANAGER_EMAIL, // didn't get manager email
          "associated_type_id": []
        },
        "siteOrSwitchList": this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE' ? await this.formSiteSwitchArrTower(mmid) : await this.formSiteSwitchArrHvac(mmid)
      }
    }
  }

  async formPostRequest() {
    var firstElement = this.state.selectedLists[0]
    const { market, submarket, pmRefDetails, vendorId, user, expenseProjId, wbscodes, buyerListDetails } = this.props
    const pmRefDet = pmRefDetails.filter(prd => prd.PO_ITEM_ID === firstElement.PS_ITEM_ID)[0]
    const buyerListData = !!buyerListDetails && !!buyerListDetails.feandmgrs && !!buyerListDetails.feandmgrs.find(val => val.userid.toLowerCase() === this.state.managerObj.MANAGER_ID.toLowerCase()) ? buyerListDetails.feandmgrs.find(val => val.userid.toLowerCase() === this.state.managerObj.MANAGER_ID.toLowerCase()) : ''
    let mmid = !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].MMID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].MMID : '';
    let vendor_mdgid= !!user && user.group_vendors.filter(i =>i.vendor_id == vendorId).length > 0 ? user.group_vendors.filter(i =>i.vendor_id == vendorId)[0].vendor_mdg_id : ''

    return {
      "createList": {
        "pmList": {
          "pm_list_year": moment().format('YYYY'),
          "pm_type": firstElement.PM_TYPE_NAME ? firstElement.PM_TYPE_NAME : '',
          "frequency": "Adhoc",
          "market": market ? market : '',
          "sub_market": submarket ? submarket : '',
          "pm_group": 'REPAIR',
          "manager": this.state.managerObj.MANAGER ? this.state.managerObj.MANAGER : '',
          "manager_id": !!this.state.managerObj && !!this.state.managerObj.MANAGER_ID ? this.state.managerObj.MANAGER_ID : '',
          "location_type": "SITE",
          "mmid": !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].MMID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].MMID : '',
          "ps_item_id": !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].PARTENT_ITEM_ID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PM_TYPE_NAME)[0].PARTENT_ITEM_ID : '',
          "buyer": this.state.managerObj.MANAGER ? this.state.managerObj.MANAGER : '',
          "buyer_id": !!this.state.managerObj && !!this.state.managerObj.MANAGER_ID ? this.state.managerObj.MANAGER_ID : '',
          "emp_id": !!buyerListData && !!buyerListData.empid ? buyerListData.empid : '',
          "enterprise_id": !!buyerListData && !!buyerListData.enterprise_id ? buyerListData.enterprise_id : '',
          "createdBy_EID": !!buyerListData && !!buyerListData.enterprise_id && buyerListData.enterprise_id,
          "modifiedBy_EID":!!buyerListData && !!buyerListData.enterprise_id && buyerListData.enterprise_id,
          "creator": !!user && !!user.vendor_name ? user.vendor_name : '',
          "approver": '',
          "vendor_id": vendorId,
          "vendor_name": !!user && !!user.vendor_name ? user.vendor_name : '',
          "vendor_psid": (this.props.userList?.length>0 && this.props.userList[0]?.vendor_peoplesoft_id) || '',
          "vendor_mdgid" : !!vendor_mdgid ? vendor_mdgid : '',
          "po_bu": '',
          "cost_center": "8600",
          "product_cd": "200",
          "expense_proj_id": !!expenseProjId && expenseProjId.length > 0 ? expenseProjId[0] : '',
          "wbs_element": !!wbscodes && wbscodes.length > 0 ? wbscodes[0] : '',
          "po_email_distro": !!buyerListDetails && !!buyerListDetails.po_info && buyerListDetails.po_info.poEmailDetails.length > 0 ? buyerListDetails.po_info.poEmailDetails[0].po_emails : '',
          "po_num": '',
          "pm_list_status": "REQUESTED",
          "ps_poll_ind": "N",
          "po_entered_date": '',
          "apply_pm_vendor": "N",
          "is_list_completed": 'Y',
          "is_vendor_requested": 'Y',
          "buyer_email": !!this.state.managerObj && !!this.state.managerObj.MANAGER_EMAIL ? this.state.managerObj.MANAGER_EMAIL : '',
          "vendor_email": !!this.props.userList && this.props.userList?.length>0 && !!this.props.userList[0].vendor_service_email && this.props.userList[0].vendor_service_email, // service email
          "manager_email": this.state.managerObj.MANAGER_EMAIL, // didn't get manager email
          "associated_type_id": []
        },
        "siteOrSwitchList": await this.formSiteSwitchArr(mmid)
      }
    }
  }

  splitRow = (currentVal) => {

    var costArr = []
    if (!!parseFloat(currentVal["MATERIAL_COST"]) && parseFloat(currentVal["MATERIAL_COST"]) > 0) {
      costArr.push("MATERIAL_COST")
    }
    if (!!parseFloat(currentVal["GEN_FUEL_COST"]) && parseFloat(currentVal["GEN_FUEL_COST"]) > 0) {
      costArr.push("GEN_FUEL_COST")
    }
    if (!!parseFloat(currentVal["LABOUR_COST"]) && parseFloat(currentVal["LABOUR_COST"]) > 0) {
      costArr.push("LABOUR_COST")
    }
    return costArr
  }
  getEmpId = (tech_id) => {
    return this.props.buyerListDetails.feandmgrs.find(data => data.userid === tech_id) ? this.props.buyerListDetails.feandmgrs.find(data => data.userid === tech_id).empid : ''
  }
  getItemId = (currentRow, cost) => {

    return this.props.pmRefDetails.find(prd => prd.PM_TYPE_NAME === currentRow.PM_TYPE_NAME && prd.PO_DESCRIPTION === cost).CHILD_ITEM_ID





  }
  getItemIdTower = (currentRow, cost) => {

    return this.props.pmRefDetails.find(prd => prd.PM_TYPE_NAME === currentRow.PM_TYPE_NAME && prd.PO_DESCRIPTION === cost).CHILD_ITEM_ID






  }

  formSiteSwitchArrHvac = (mmid) => {
    const referenceElement = this.state.selectedLists[0]


    let formedList = []
    this.state.selectedLists.forEach(val => {
      this.splitRow(val).forEach(cost => {
        const currentSite = !!this.props.siteListDetails && this.props.siteListDetails.length > 0 ?
          this.props.erpFlag == 'N' ? this.props.siteListDetails.find(sld => sld.ps_loc === val.PS_LOCATION_ID.trim()) : this.props.siteListDetails.find(sld => sld.mdg_id === val.MDG_ID.trim()) : {}
        const { site_id, site_name, site_status, meta_universalid, ps_loc, company_code, tech_id, tech_name, soa, site_priority, site_callout_zone, manager_name, manager_id } = currentSite
        formedList.push({
          "name": !!site_id && !!site_name ? `${site_id}^${site_name}` : '',
          "status": site_status ? site_status : '',
          "unid": meta_universalid ? meta_universalid : '',
          "ps_loc_id": ps_loc ? ps_loc : '',
          "switch_name":!!currentSite && !!currentSite.switch ? currentSite.switch : '',
          "locus_id" : currentSite.locus_id ? currentSite.locus_id : '',
          "location_manager": !!this.state.managerObj && !!this.state.managerObj.MANAGER ? this.state.managerObj.MANAGER :'',
          "location_manager_id": !!this.state.managerObj && !!this.state.managerObj.MANAGER_ID ? this.state.managerObj.MANAGER_ID : '',
          "fe": tech_name ? tech_name : '',
          "fe_id": tech_id ? tech_id : '',
          "emp_id": this.getEmpId(tech_id),
          "mmid": mmid,
          "company_code": company_code ? company_code : '',
          "manufacturer": !!currentSite.equipmentinfo && currentSite.equipmentinfo.length > 0 ? currentSite.equipmentinfo[0].manufacturer : '',
          "mdg_id" : currentSite.mdg_id ? currentSite.mdg_id : '',
          "soa": !!soa && !!moment(soa).format('DD/MM/YYYY') ? moment(soa).format('DD/MM/YYYY') :'',
                // "pm_cost": val.TotalCost,
          "pm_cost": val[cost] ? val[cost] :'',
          "pm_item_start_date": moment().format('DD/MM/YYYY'),
          "pm_item_due_date": this.addDate(moment().add(30, 'd')),
          "pm_item_status": '',
          "default_pm_vendor_id": "",
          "default_pm_vendor_name": "",
          "site_priority": site_priority ? site_priority : '',
          "equipment_status": "",
          "site_callout_zone": site_callout_zone ? site_callout_zone : '',
          "included_in_pmlist": "Y",
          // "po_item_id": 'EXP-TWRINSP-CELL', // this.getItemIdTower(val),
          "po_item_id": this.getItemId(val, cost),
          "description": 'TOWER MINOR MAINTENANCE',
          "total_cost": val.TOTAL_COST ? val.TOTAL_COST : '',
          "scheduled_date": this.addDate(moment().add(30, 'd')),
          // "po_item_description": 'TOWER MINOR MAINTENANCE'
          "po_item_description": cost === 'LABOUR_COST' ? 'LABOUR' : cost === 'MATERIAL_COST' ? 'MATERIAL' : ''
        })
      })
    })
    return formedList
  }

  formSiteSwitchArrTower = (mmid) => {
    const referenceElement = this.state.selectedLists[0]


    let formedList =
            this.state.selectedLists.map(val => {
              const currentSite = !!this.props.siteListDetails && this.props.siteListDetails.length > 0 ?
                        this.props.erpFlag == 'N' ? this.props.siteListDetails.find(sld => sld.ps_loc === val.PS_LOCATION_ID.trim()) : this.props.siteListDetails.find(sld => sld.mdg_id === val.MDG_ID.trim()) : {}

              const {site_id, site_name, site_status, meta_universalid, ps_loc,company_code, tech_id, tech_name, soa, site_priority, site_callout_zone, manager_name, manager_id} = currentSite
              return {
                "name":!!site_id && !!site_name ? `${site_id}^${site_name}` : '',
                "status": site_status ? site_status : '',
                "unid": meta_universalid ? meta_universalid :'',
                "ps_loc_id": ps_loc ? ps_loc : '',
                "locus_id" : currentSite.locus_id ? currentSite.locus_id : '',
                "switch_name":!!currentSite && !!currentSite.switch ? currentSite.switch : '',
                "location_manager": !!this.state.managerObj && !!this.state.managerObj.MANAGER ? this.state.managerObj.MANAGER :'',
                "location_manager_id": !!this.state.managerObj && !!this.state.managerObj.MANAGER_ID ? this.state.managerObj.MANAGER_ID : '',
                "fe": tech_name ? tech_name :'',
                "fe_id": tech_id ? tech_id :'',
                "emp_id": this.getEmpId(tech_id),
                "manufacturer": !!currentSite.equipmentinfo && currentSite.equipmentinfo.length > 0 ? currentSite.equipmentinfo[0].manufacturer : '',
                "mdg_id" : currentSite.mdg_id ? currentSite.mdg_id : '',
                "company_code" : company_code ? company_code : '',
                "mmid": mmid,
                "soa": !!soa && !!moment(soa).format('DD/MM/YYYY') ? moment(soa).format('DD/MM/YYYY') :'',
                "pm_cost": val.TotalCost,
                // "pm_cost": val[cost] ? val[cost] :'',
                "pm_item_start_date": moment().format('DD/MM/YYYY'),
                "pm_item_due_date": this.addDate(moment().add(30, 'd')),
                "pm_item_status": '',
                "default_pm_vendor_id": "",
                "default_pm_vendor_name": "",
                "site_priority": site_priority ?site_priority: '',
                "equipment_status": "",
                "site_callout_zone":site_callout_zone ? site_callout_zone :'',
                "included_in_pmlist": "Y",
                "po_item_id": 'EXP-TWRINSP-CELL', // this.getItemIdTower(val),
                // "po_item_id": this.getItemIdTower(val, cost),
                "description": 'TOWER MINOR MAINTENANCE',
                "total_cost":val.TotalCost ? val.TotalCost : '',
                "scheduled_date": !!val.SCHEDULED_DATE && !!moment(val.SCHEDULED_DATE) ? moment(val.SCHEDULED_DATE).format('DD/MM/YYYY') :null,
                "po_item_description": val.ATTRIBUTE_NAME
              //  "po_item_description": cost === 'LABOUR_COST'? 'LABOUR' : cost === 'MATERIAL_COST' ? 'MATERIAL' : ''
              }
            })

    return formedList





  }
  formSiteSwitchArr = (mmid) => {
    const referenceElement = this.state.selectedLists[0]


    let formedList = []
    this.state.selectedLists.forEach(val => {
      this.splitRow(val).forEach(cost => {
        const currentSite = !!this.props.siteListDetails && this.props.siteListDetails.length > 0 ?
          this.props.erpFlag == 'N' ? this.props.siteListDetails.find(sld => sld.ps_loc === val.PS_LOCATION_ID.trim()) : this.props.siteListDetails.find(sld => sld.mdg_id === val.MDG_ID.trim()) : {}

          const { site_id, site_name, site_status, meta_universalid, ps_loc, company_code, tech_id, tech_name, soa, site_priority, site_callout_zone, manager_name, manager_id } = currentSite
        formedList.push({
          "name": !!site_id && !!site_name ? `${site_id}^${site_name}` : '',
          "status": site_status ? site_status : '',
          "unid": meta_universalid ? meta_universalid : '',
          "ps_loc_id": ps_loc ? ps_loc : '',
          "locus_id" : currentSite.locus_id ? currentSite.locus_id: '',
          "switch_name":!!currentSite && !!currentSite.switch ? currentSite.switch : '',
          "location_manager": !!this.state.managerObj && !!this.state.managerObj.MANAGER ? this.state.managerObj.MANAGER :'',
          "location_manager_id": !!this.state.managerObj && !!this.state.managerObj.MANAGER_ID ? this.state.managerObj.MANAGER_ID : '',
          "fe": tech_name ? tech_name : '',
          "fe_id": tech_id ? tech_id : '',
          "emp_id": this.getEmpId(tech_id),
          "manufacturer": !!currentSite.equipmentinfo && currentSite.equipmentinfo.length > 0 ? currentSite.equipmentinfo[0].manufacturer : '',
          "mdg_id" : currentSite.mdg_id ? currentSite.mdg_id: '',
          "company_code" : company_code ? company_code : '',
          "mmid": mmid,
          "soa": !!soa && !!moment(soa).format('DD/MM/YYYY') ? moment(soa).format('DD/MM/YYYY') :'',
          "pm_cost": val[cost] ? val[cost] :'',
          "pm_item_start_date": moment().format('DD/MM/YYYY'),
          "pm_item_due_date": this.addDate(moment().add(30, 'd')),
          "pm_item_status": '',
          "default_pm_vendor_id": "",
          "default_pm_vendor_name": "",
          "site_priority": site_priority ? site_priority : '',
          "equipment_status": "",
          "site_callout_zone": site_callout_zone ? site_callout_zone : '',
          "included_in_pmlist": "Y",
          "po_item_id": this.getItemId(val, cost),
          "description": val.DESCRIPTION ? val.DESCRIPTION : '',
          "total_cost": val.TOTAL_COST ? val.TOTAL_COST : '',
          "scheduled_date": this.addDate(moment().add(30, 'd')),
          "po_item_description": cost === 'LABOUR_COST' ? 'LABOUR' : cost === 'MATERIAL_COST' ? 'MATERIAL' : cost === 'GEN_FUEL_COST' ? 'FUEL' : ''
        })



      })



    })

    return formedList





  }
  addDate = (date) => {

    //if saturday, become monday
    if (moment(date).day() == 6) {
        date = moment(date).add(2, 'd');
    }

    //if sunday, become monday
    if (moment(date).day() == 0 || moment(date).day() == 7) {
        date = moment(date).add(1, 'd');
    }

    //if still a fast holiday loop continously and increment until date is not a holiday.
    while (true) {
        if (this.state.fastHolidays && this.state.fastHolidays.length > 0 && this.state.fastHolidays.includes(moment(date).format("YYYY-MM-DD")) || [0,6].includes(moment(date).day())) {
            date = moment(date).add(1, 'd');
        }
        if (this.state.fastHolidays && this.state.fastHolidays.length > 0 && !this.state.fastHolidays.includes(moment(date).format("YYYY-MM-DD")) && !([0,6].includes(moment(date).day()))) {            
            break;
        } 
    }
    
    return moment(date).format('DD/MM/YYYY')
}
  getRefNameTower = () => {
    let vendorNameProcessed = '', vendorName = this.props.user['vendor_name'].split('##')[0]
    vendorName = vendorName.includes('-') ? vendorName.substring(0, vendorName.indexOf('-')) : vendorName
    vendorName = (vendorName.includes('(') && vendorName.includes(')')) ?
      vendorName.substring(0, vendorName.indexOf('(')) + vendorName.substring(vendorName.indexOf(')') + 1, vendorName.length) : vendorName
    vendorName = (vendorName.includes('[') && vendorName.includes(']')) ?
      vendorName.substring(0, vendorName.indexOf('[')) + vendorName.substring(vendorName.indexOf(']') + 1, vendorName.length) : vendorName
    vendorName = vendorName.trimLeft()
    let vendorNameFirst = vendorName.split(' ')[0], vendorNameSecond = vendorName.split(' ')[1]
    vendorNameProcessed += (vendorNameFirst && vendorNameFirst.length > 4 ? vendorNameFirst.substring(0, 4) : vendorNameFirst)
    vendorNameProcessed += vendorNameSecond ? '-' : ''
    vendorNameProcessed += vendorNameSecond && vendorNameSecond.length > 8 - vendorNameProcessed.length ? vendorNameSecond.substring(0, 8 - vendorNameProcessed.length) : vendorNameSecond ? vendorNameSecond : ''
    let buyerName = this.state.managerObj.MANAGER.split(',').map(i => i.trim()), buyerNameProcessed = ''
    buyerNameProcessed = buyerName.length && buyerName[0].length > 5 ? buyerName[0].substring(0, 5) : buyerName[0] ? buyerName[0] : ''
    buyerNameProcessed += buyerName[1] && buyerName[1].length > 2 ? buyerName[1].substring(0, 2) : buyerName[1] ? buyerName[1] : ''
    let mgrInitials = `${buyerName[1] ? buyerName[1].substring(0, 1) : ''}${buyerName[0] ? buyerName[0].substring(0, 1) : ''}`

    return `${typeAbbrMap[this.state.filteredListsForAddASite[0].PM_TYPE_NAME]}_${vendorNameProcessed}-${buyerNameProcessed}${mgrInitials}${moment().year()}`
  }
  getRefName = () => {
    let vendorNameProcessed = '', vendorName = this.props.user['vendor_name'].split('##')[0]
    vendorName = vendorName.includes('-') ? vendorName.substring(0, vendorName.indexOf('-')) : vendorName
    vendorName = (vendorName.includes('(') && vendorName.includes(')')) ?
      vendorName.substring(0, vendorName.indexOf('(')) + vendorName.substring(vendorName.indexOf(')') + 1, vendorName.length) : vendorName
    vendorName = (vendorName.includes('[') && vendorName.includes(']')) ?
      vendorName.substring(0, vendorName.indexOf('[')) + vendorName.substring(vendorName.indexOf(']') + 1, vendorName.length) : vendorName
    vendorName = vendorName.trimLeft()
    let vendorNameFirst = vendorName.split(' ')[0], vendorNameSecond = vendorName.split(' ')[1]
    vendorNameProcessed += (vendorNameFirst && vendorNameFirst.length > 4 ? vendorNameFirst.substring(0, 4) : vendorNameFirst)
    vendorNameProcessed += vendorNameSecond ? '-' : ''
    vendorNameProcessed += vendorNameSecond && vendorNameSecond.length > 8 - vendorNameProcessed.length ? vendorNameSecond.substring(0, 8 - vendorNameProcessed.length) : vendorNameSecond ? vendorNameSecond : ''
    let buyerName = this.state.managerObj.MANAGER.split(',').map(i => i.trim()), buyerNameProcessed = ''
    buyerNameProcessed = buyerName.length && buyerName[0].length > 5 ? buyerName[0].substring(0, 5) : buyerName[0] ? buyerName[0] : ''
    buyerNameProcessed += buyerName[1] && buyerName[1].length > 2 ? buyerName[1].substring(0, 2) : buyerName[1] ? buyerName[1] : ''
    let mgrInitials = `${buyerName[1] ? buyerName[1].substring(0, 1) : ''}${buyerName[0] ? buyerName[0].substring(0, 1) : ''}`

    return `${typeAbbrMap[this.state.filteredListsForAddASite[0].PM_TYPE_NAME]}_${vendorNameProcessed}-${buyerNameProcessed}${mgrInitials}${moment().year()}`
  }
  async onSubmit() {

    const { createPMList, vendorId, loginId } = this.props
    const postRequest = this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE' || this.state.currentDropdownValueType.value == 'PM HVAC REPAIR' ? await this.formPostRequestTower() : await this.formPostRequest()
    // const refName = 'HVC1_ADVA-ENG-COLLJICJ2020'

    await createPMList(vendorId, loginId, this.props.refName, false, postRequest).then(action => {
      if (action.type === 'CREATE_PM_LIST_SUCCESS') {

        this.props.notiref.addNotification({
          title: 'success',
          position: "br",
          level: 'success',
          message: "List creation successful"
        })
        this.props.handleHideRequestBulkPOModel()
        this.props.initPMDashboard()

      }else if (action.type === 'CREATE_PM_LIST_ERROR') {

        this.props.notiref.addNotification({
          title: 'Error',
          position: "br",
          level: 'error',
          message: action.createPMListSubmissionerrorMessage.message ? action.createPMListSubmissionerrorMessage.message : 'List creation failed'
        })

      }else {
        this.props.notiref.addNotification({
          title: 'Error',
          position: "br",
          level: 'error',
          message: "List creation failed"
        })
      }
    })
  }
  async onSelectionChanged(e) {
    // var selectedLoc
    // var selectedSiteRep
    var selectedLists
    if (this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE' || this.state.currentDropdownValueType.value == 'PM HVAC REPAIR') {
      selectedLists = this.state.inspectionDetailsList.filter(val => e.includes(val.id))
      await this.setState({ selectedLists: selectedLists })
    } else {
      selectedLists = this.state.filteredLists.filter(val => e.includes(val.id))
      await this.setState({ selectedLists: selectedLists })
    }

  }

  renderLoading = () => {
    return (
      <Loader color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center" />
    )
  }
  oncellValueChanged = (e) => {
    const filteredLists = this.state.filteredLists.map(val => {
      if (val.id === e.id) {
        return {
          ...val,
          LABOUR_COST: e.LABOUR_COST,
          MATERIAL_COST: e.MATERIAL_COST,
          TOTAL_COST: (parseFloat(e.LABOUR_COST) ? parseFloat(e.LABOUR_COST) : 0) + (parseFloat(e.MATERIAL_COST) ? parseFloat(e.MATERIAL_COST) : 0) + (parseFloat(e.GEN_FUEL_COST) ? parseFloat(e.GEN_FUEL_COST) : 0),
          GEN_FUEL_COST: e.GEN_FUEL_COST
        }
      } else {
        return val
      }
    })
    this.setState({filteredLists: filteredLists})

  }
  handleInputChangeRadio = (e) => {
    this.clearLaborCost()
    const filteredLists = this.state.filteredLists.map(val => ({ ...val, LABOUR_COST: 0, TOTAL_COST: (parseFloat(val.MATERIAL_COST) ? parseFloat(val.MATERIAL_COST) : 0) + (parseFloat(val.GEN_FUEL_COST) ? parseFloat(val.GEN_FUEL_COST) : 0) }))
    this.setState({ filteredLists, radioSelection: e.target.value })
  }
  checkDisable = () => {
    if (this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE') {
      return this.state.selectedLists.length == 0
    } else {
      if(this.state.selectedLists.length > 0) {
        let totalCostValid = this.state.selectedLists?.every(val => val.TOTAL_COST > 0)
        return !totalCostValid
      }
    }
  }
  render() {

    const modfdGridDetails = this.modifyGridDetails().sort((a, b) => {
      if (a.PO_REFNAME > b.PO_REFNAME) {
        return 1
      } else if (a.PO_REFNAME < b.PO_REFNAME) {
        return -1
      } else {
        return 0
      }
    })
    let columnsTower = [
      {
        headerName: "PM PO Number", field: "PO_NUM", flex: 1
      },
      {
        headerName: "PO Reference Name", field: "PO_REFNAME", flex: 2
      },
      {
        headerName: "MDGLC", field: "MDGLC", flex: 1
      },


      {
        headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 2
      },
      {
        headerName: "PS Location ID", field: "PS_LOCATION_ID", flex: 1
      },
      {
        headerName: "Minor Maintenance Item", field: "ATTRIBUTE_NAME", flex: 1
      },
      {
        headerName: `${this.props.esaFlag === "Y" ?'Requisitioner' : "Buyer"}`, field: "BUYER", flex: 1
      },


      {
        headerName: "Total Cost", field: "TOTAL_COST", editable: false, flex: 1
      },

    ]
    let columnsHvac = [
      {
        headerName: "PM PO Number", field: "PO_NUM", flex: 1
      },
      {
        headerName: "PO Reference Name", field: "PO_REFNAME", flex: 2
      },
      {
        headerName: "MDGLC", field: "MDGLC", flex: 1
      },

      {
        headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 2
      },
      {
        headerName: "PS Location ID", field: "PS_LOCATION_ID", flex: 1
      },

      {
        headerName: "Labor hour", field: "LABOUR_HOURS", flex: 1
      },

      {
        headerName: "Labor Cost", field: "LABOUR_COST", editable: true, flex: 1,
        valueGetter: function (value) {
          return value
        },
        valueSetter: function (value, row) {
          if (row.LABOUR_COST !== value && !!parseFloat(value) && parseFloat(value) > 0) {
            row.LABOUR_COST = parseFloat(value)
            return row
          }
        }
      },
      {
        headerName: "Material Cost ", field: "MATERIAL_COST", editable: true,flex: 1,
        valueGetter: function (value) {
          return value
        },
        valueSetter: function (value, row) {
          if (row.MATERIAL_COST !== value && !!parseFloat(value) && parseFloat(value) > 0) {
            row.MATERIAL_COST = parseFloat(value)
            return row
          }
        }
      },

      {
        headerName: "Total Cost", field: "TOTAL_COST", editable: true,flex: 1,
        valueGetter: function (value) {
          return value
        }
      },

    ]
    let columnsGen = [
      {
        headerName: "PM PO Number", field: "PO_NUM", flex: 1
      },
      {
        headerName: "PO Reference Name", field: "PO_REFNAME", flex: 2
      },
      {
        headerName: "MDGLC", field: "MDGLC", flex: 1
      },

      {
        headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 2
      },
      {
        headerName: "PS Location ID", field: "PS_LOCATION_ID", flex: 1
      },
      {
        headerName: "Fuel Amount gal", field: "FUEL_AMOUNT", flex: 1
      },
      {
        headerName: "Fuel Cost", field: "GEN_FUEL_COST", editable: true, flex: 1,
        valueGetter: function (value) {
          return value
        },
        valueSetter: (value, row) => {
          if (row.GEN_FUEL_COST !== value && !isNaN(parseFloat(value))) {
            row.GEN_FUEL_COST = parseFloat(value)
            return row
          }
        },
      },
      {
        headerName: "Labor hour", field: "LABOUR_HOURS", flex: 1
      },

      {
        headerName: "Labor Cost", field: "LABOUR_COST", editable: true, flex: 1,
        valueGetter: function (value) {
          return value
        },
        valueSetter: function (value, row) {
          if (row.LABOUR_COST !== value && !isNaN(parseFloat(value))) {
            row.LABOUR_COST = parseFloat(value)
            return row
          }
        }
      },


      {
        headerName: "Total Cost", field: "TOTAL_COST", flex: 1,
        valueGetter: function (value) {
          return value
        }
      },

    ]
    if(this.props.esaFlag == "Y") {
      columnsTower = columnsTower.filter(obj => obj.headerName!== 'PS Location ID')
      columnsHvac= columnsHvac.filter(obj => obj.headerName!== 'PS Location ID')
      columnsGen = columnsGen.filter(obj => obj.headerName!== 'PS Location ID')
  }
    let autoGroupColumnDef = {
      headerName: 'Select',
      field: 'Select',
      minWidth: 250,
      cellRenderer: 'agGroupCellRenderer',

    }
    let customStyle = { fontSize: '12px', marginTop: '5px' }
    return (<div className="App container-fluid">
      <div className="row">
        <div className="work-type row">
          {!this.state.showAddSiteModel && <div className="col-md-7 text-left">
            <span style={{ paddingRight: "5px" }}>
              <b>Type </b>
            </span>
            <Select
              className="basic-single text-center title-div-style"
              classNamePrefix="select"

              value={this.state.currentDropdownValueType}
              disabled={this.state.showAddSiteModel}
              isLoading={false}
              clearable={false}
              isRtl={false}
              isSearchable={false}
              styles={customStyle}
              options={this.state.drpdwnOptionsType}
              onChange={this.handleDropdownChangeType.bind(this)}
            />
          </div>}
          {!this.state.showAddSiteModel && <div className="col-md-5 text-left">
            <span style={{ paddingRight: "5px" }}>
              <b>Manager </b>
            </span>
            <Select
              className="basic-single text-center title-div-style"
              classNamePrefix="select"
              disabled={this.state.showAddSiteModel}
              value={this.state.currentDropdownValueManager}

              isLoading={false}
              clearable={false}
              isRtl={false}
              isSearchable={false}
              styles={customStyle}
              options={this.state.drpdwnOptionsManager}
              onChange={this.handleDropdownChangeManager.bind(this)}
            />
          </div>}
        </div>
        <div className="col-md-4 row">
          {this.state.currentDropdownValueType.value === 'PM GEN FUEL' && this.state.filteredLists.length > 0 && this.state.currentDropdownValueManager.value.length > 0 && this.state.currentDropdownValueType.value.length > 0 && !this.state.showAddSiteModel && <div className="col-md-6">
            <span>
              <b>Fuel Cost(per gal)$</b>
            </span>
            <input
              placeholder=""
              className="form-control title-div-style"
              style={{ height: "5.9vh" }}
              onChange={this.handleFuelCostChange}
              id="fuelCost"
              type="number"
              disabled={this.state.showAddSiteModel}

            />
            {this.state.fuelCostErr && <div className="text-danger mt-1"><b>Please enter valid cost</b></div>}
          </div>}
          {(this.state.filteredLists.length > 0 || this.state.currentDropdownValueType.value === 'PM HVAC REPAIR') && this.state.currentDropdownValueManager.value.length > 0 && this.state.currentDropdownValueType.value.length > 0 && !this.state.showAddSiteModel && this.state.radioSelection !== 'No Labor Cost' && <div className="col-md-6">
            <span style={{ paddingRight: "5px", fontSize: '0.9em' }}>
              <b>{this.state.radioSelection === 'Hourly Rate' ? 'Labor Cost (per hour) $' : 'Labor Cost'}</b>
            </span>
            <input
              placeholder=""
              className="form-control title-div-style"
              style={{ height: "5.9vh" }}
              onChange={this.handleLabourCostChange}
              type="number"
              id="laborCost"
              disabled={this.state.showAddSiteModel}
            />
            {this.state.laborCostErr && <div className="text-danger mt-1"><b>Please enter valid cost</b></div>}
          </div>}
        </div>
        <div className="col-md-2">
          {!this.state.showAddSiteModel && this.state.currentDropdownValueType.value != 'TOWER MINOR MAINTENANCE' && <div className="custom-control custom-radio ">
            <RadioGroup
              value={this.state.radioSelection}
              labelPosition="right"
              onChange={this.handleInputChangeRadio.bind(this)}
              style={{ display: 'flex', maxWidth: '100%', flexDirection: "column" }}>
              <FormControlLabel value="Hourly Rate" control={<Radio />} label="Hourly Rate" />
              <FormControlLabel value="Flat Rate" control={<Radio />} label="Flat Rate" />
              <FormControlLabel value="No Labor Cost" control={<Radio />} label="No Labor Cost" />
            </RadioGroup>

          </div>}

        </div>
        <div className={this.state.currentDropdownValueManager.value.length > 0 && this.state.currentDropdownValueType.value.length > 0 ? "add-site summary-link-active float-right" : "add site summary-link-disable float-right"} onClick={this.handleAddSite.bind(this)}><b>{this.state.currentDropdownValueType.value != 'TOWER MINOR MAINTENANCE' ? this.state.showAddSiteModel ? 'Back' : 'Add a Site' : ''}</b></div>
      </div>
      {this.state.showAddSiteModel && this.renderAddSiteModal()}
      {this.state.pageLoading ? this.renderLoading() : !this.state.showAddSiteModel && <div style={{ "paddingTop": "15px" }}>
        <DataGrid
          columns={this.state.currentDropdownValueType.value === 'PM GEN FUEL' || this.state.currentDropdownValueType.value === '' ? columnsGen : this.state.currentDropdownValueType.value == 'TOWER MINOR MAINTENANCE' ? columnsTower : columnsHvac}
          rows={(!modfdGridDetails || !this.state.currentDropdownValueManager.value) ? [] : modfdGridDetails}
          rowHeight={30}
          columnHeaderHeight={35}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          sx={{ 
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
            minHeight: 200 ,
            '& .css-1w53k9d-MuiDataGrid-overlay': {fontSize: '13px'}
          }}
          onRowSelectionModelChange={this.onSelectionChanged.bind(this)}
          onCellEditStop={(params, event) => {
            this.oncellValueChanged(params.row)
          }}
          disableRowSelectionOnClick={true}
          checkboxSelection
        />


        <div className="row">
          <div className="col-md-10" />
          <div className="col-md-2">
            <button className="btn btn-danger btn button-class mr-3" style={{marginBlock: 10}} onClick={this.onSubmit.bind(this)} disabled={this.state.selectedLists.length === 0 || this.checkDisable()}>Request</button>

          </div>
        </div>
      </div>}
    </div>)
  }
}

function stateToProps(state, ownProps) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map()) ? state.getIn(['Users', 'entities', 'users', loginId], Map()).toJS() : []
  let vendorId = user.vendor_id
  let createsitesListLoading = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreateListSitesLoading"])
  let createSitesList = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreateListSitesResults", "listItems"], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreateListSitesResults", "listItems"], List()).toJS() : []
  let createSitesTowerList = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreateListSitesResults", "inspectionDetailsItems"], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreateListSitesResults", "inspectionDetailsItems"], List()).toJS() : []
  let pmRefDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmRefList'], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmRefList'], List()).toJS() : []
  let buyerListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "buyerListDetails", 'getBuyerList', 'fieldsList'], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "buyerListDetails", 'getBuyerList', 'fieldsList'], List()).toJS() : []
  let siteListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "siteListDetails", 'getSiteListDetails', 'filteredList'], List()).toJS()
  let expenseProjId = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "expenseProjId", 'getExpenseProjIdData', 'expenseProjIdData'], List()).toJS()
  let wbscodes = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "expenseProjId", 'getExpenseProjIdData', 'wbscodes'], List()).toJS()

  let pmGridDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List()).toJS()

  let userList = state.getIn(['Users', 'getVendorList', 'Users'], List()).toJS()
  let pmListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()

  let activeSites = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "activeSitesResults"], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "activeSitesResults"], List()).toJS() : []
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;
  return {
    user,
    loginId,
    vendorId,
    market,
    submarket,
    createSitesList,
    createsitesListLoading,
    pmRefDetails,
    buyerListDetails,
    siteListDetails,
    expenseProjId,
    wbscodes,
    pmGridDetails,
    activeSites,
    createSitesTowerList,
    // pmSystemRecordsLoading,
    // pmSystemRecords,
    userList,
    pmListDetails,
    // createdPMList
    esaFlag
  }
}

export default connect(stateToProps, { ...pmActions, getHolidayEvents })(CreateAList)