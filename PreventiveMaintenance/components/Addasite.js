import React, { Component } from 'react'
import { Map, fromJS, List } from 'immutable'
import Loader from '../../Layout/components/Loader'
import { connect } from "react-redux"
import * as pmActions from "../actions"
import { DataGrid } from '@mui/x-data-grid'

class CreateAList extends React.Component {
    constructor(props){
        super(props)
        this.state ={
            addSitesList: [],
            selectedLists:[],inArr:[],
            submitpostRequest1: {},
            selectedLoc: null
        }
        this.filterListsHvac = this.filterListsHvac.bind(this)
        this.filterListsGen = this.filterListsGen.bind(this)
        this.filterListsFuel = this.filterListsFuel.bind(this)
        
        this.formPostRequest1 = this.formPostRequest1.bind(this)
      
    }
    retainSelection =() => {
        if(this.state.selectedLoc.length > 0){
            var conditionSel = this.state.selectedLoc
            this.gridApi.forEachNode(function(node) {
      node.setSelected(conditionSel.includes(node.data.PS_LOCATION_ID));
    });
        }
        
    }
    onGridReady = params => {
        this.gridOptions = params
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
        this.gridApi.setFilterModel(null)
        if (params.api && params.api.sizeColumnsToFit) { params.api.sizeColumnsToFit() }
        params.api.sizeColumnsToFit();
        this.gridApi.sizeColumnsToFit();
    };
    async onSelectionChanged(e){
    //    const selectedLoc = e.api.getSelectedRows().map(val => val.PS_LOCATION_ID)
    const selectedLoc = e
    const selectedLists = this.state.addSitesList.filter(val =>selectedLoc.includes(val.PS_LOCATION_ID))
    await this.setState({selectedLists, selectedLoc})
    
  }
 
  async filterListsHvac() {
       const uniqueLocationIds = this.props.filteredListsForAddASite.map(val => val.PS_LOCATION_ID).reduce((unique, item) => {
            return unique.includes(item) ? unique : [...unique, item]
        }, [])
        
     const addSitesList =  uniqueLocationIds.map(locId => {
          const modelNumber = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '4') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '4').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '4').PM_TMPLT_ATTR_NEW_VALUE : ''
          const materialCost = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '38') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '38').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '38').PM_TMPLT_ATTR_NEW_VALUE : ''
          const laborHours = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '39') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '39').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '39').PM_TMPLT_ATTR_NEW_VALUE : ''
          return {
              ...this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId),
              modelNumber,
              MATERIAL_COST:materialCost,
             LABOUR_HOURS: laborHours
          }
      }).filter(inVal => {
        
          return !inVal.MATERIAL_COST || isNaN(parseFloat(inVal.MATERIAL_COST)) || parseFloat(inVal.MATERIAL_COST) <= 0})
     await this.setState({addSitesList})

  }
 async filterListsFuel () {
     const uniqueLocationIds = this.props.filteredListsForAddASite.map(val => val.PS_LOCATION_ID).reduce((unique, item) => {
            return unique.includes(item) ? unique : [...unique, item]
        }, [])
        
     const addSitesList =  uniqueLocationIds.map(locId => {
          const fuelGallons = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '21') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '21').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '21').PM_TMPLT_ATTR_NEW_VALUE : ''
          const generatorRunTime = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '8') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '8').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '8').PM_TMPLT_ATTR_NEW_VALUE : ''
          const fillPercentage = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '22') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '22').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '22').PM_TMPLT_ATTR_NEW_VALUE : ''
          const materialCost = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '27') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '27').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '27').PM_TMPLT_ATTR_NEW_VALUE : ''
          const laborHours = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '28') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '28').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '28').PM_TMPLT_ATTR_NEW_VALUE : ''
          return {
              ...this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId),
              FUEL_AMOUNT:fuelGallons,
              FILL_PERCENTAGE:fillPercentage,
             GEN_RUNTIME: generatorRunTime,
              MATERIAL_COST:materialCost,
             LABOUR_HOURS: laborHours
          }
      }).filter(inVal => {
        
          return !inVal.FUEL_AMOUNT || isNaN(parseFloat(inVal.FUEL_AMOUNT)) || parseFloat(inVal.FUEL_AMOUNT) <= 0})
     await this.setState({addSitesList})
  }
  async filterListsGen() {
     const uniqueLocationIds = this.props.filteredListsForAddASite.map(val => val.PS_LOCATION_ID).reduce((unique, item) => {
            return unique.includes(item) ? unique : [...unique, item]
        }, [])
        
     const addSitesList =  uniqueLocationIds.map(locId => {
          const fuelGallons = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '21') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '21').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '21').PM_TMPLT_ATTR_NEW_VALUE : ''
          const generatorRunTime = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '8') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '8').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '8').PM_TMPLT_ATTR_NEW_VALUE : ''
          const fillPercentage = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '22') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '22').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '22').PM_TMPLT_ATTR_NEW_VALUE : ''
          const materialCost = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '27') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '27').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '27').PM_TMPLT_ATTR_NEW_VALUE : ''
          const laborHours = !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '28') && !!this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '28').PM_TMPLT_ATTR_NEW_VALUE ? this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId && val.PM_TMPLT_ATTR_ID === '28').PM_TMPLT_ATTR_NEW_VALUE : ''
          return {
              ...this.props.filteredListsForAddASite.find(val => val.PS_LOCATION_ID === locId),
              FUEL_AMOUNT: fuelGallons,
             FILL_PERCENTAGE: fillPercentage,
              GEN_RUNTIME:generatorRunTime,
              MATERIAL_COST:materialCost,
             LABOUR_HOURS: laborHours
          }
      }).filter(inVal => {
        
          return !inVal.MATERIAL_COST || isNaN(parseFloat(inVal.MATERIAL_COST)) || parseFloat(inVal.MATERIAL_COST) <= 0})
     await this.setState({addSitesList})
  }
  
  componentDidMount(){
      this.initializeAddSite()
      
  }
  initializeAddSite =()=> {
    if(this.props.currentDropdownValueType === 'PM HVAC REPAIR')
        this.filterListsHvac()
      else if(this.props.currentDropdownValueType === 'PM GENERATOR REPAIR')
        this.filterListsGen()
      else if (this.props.currentDropdownValueType === 'PM GEN FUEL')
      this.filterListsFuel()
  }
  componentDidUpdate(prevProps, prevState){
    if(prevProps.filteredListsForAddASite !== this.props.filteredListsForAddASite){
       this.initializeAddSite()
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
    oncellValueChanged = (e)=> {
        var addSitesList
        if (this.props.currentDropdownValueType === 'PM GENERATOR REPAIR' || this.props.currentDropdownValueType === 'PM HVAC REPAIR') {
            addSitesList = this.state.addSitesList.map(val => {
                if (val.PS_LOCATION_ID === e.PS_LOCATION_ID) {
                    return {
                        ...val,
                        LABOUR_HOURS: parseFloat(e.LABOUR_HOURS),
                        MATERIAL_COST: parseFloat(e.MATERIAL_COST)

                    }
                }
                else {
                    return val
                }
            })
        }
        else if(this.props.currentDropdownValueType === 'PM GEN FUEL'){
            
            addSitesList = this.state.addSitesList.map(val => {
                if (val.PS_LOCATION_ID === e.PS_LOCATION_ID) {
                  
                    return {
                        ...val,
                        LABOUR_HOURS: parseFloat(e.LABOUR_HOURS),
                        FUEL_AMOUNT: parseFloat(e.FUEL_AMOUNT),
                        FILL_PERCENTAGE: parseFloat(e.FILL_PERCENTAGE),
                        GEN_RUNTIME: parseFloat(e.GEN_RUNTIME)

                    }
                }
                else {
                    return val
                }
            })
        }
        this.setState({addSitesList})
    //    this.setState({addSitesList}, () => {
    //        this.retainSelection()
    //    })
        
    }
    modifyGridDetails = () => {
        
        if(this.props.currentDropdownValueType === 'PM HVAC REPAIR' || this.props.currentDropdownValueType === 'PM GENERATOR REPAIR')
        return this.state.addSitesList.map((fdata,i) => ({
            PO_NUM: !!fdata &&!!fdata.PO_NUM ? fdata.PO_NUM: '',
            id : i+1,
            SITE_ID: !!this.props.siteListDetails && this.props.siteListDetails.length > 0 ?
                        this.props.siteListDetails.find(sld => sld.ps_loc === fdata.PS_LOCATION_ID.trim()).site_id : '',
            PS_LOCATION_ID: !!fdata && !!fdata.PS_LOCATION_ID ? fdata.PS_LOCATION_ID : '',
            PM_LOCATION_NAME: !!fdata && !!fdata.PM_LOCATION_NAME ? fdata.PM_LOCATION_NAME.split('^')[1]: '',
           
        
            MATERIAL_COST: !!fdata && !!fdata.MATERIAL_COST ? fdata.MATERIAL_COST : '',
            LABOUR_HOURS: !!fdata && !!fdata.LABOUR_HOURS ? fdata.LABOUR_HOURS : ''
           
     
        }))
        else if( this.props.currentDropdownValueType === 'PM GEN FUEL'){
            return this.state.addSitesList.map((fdata,i) => ({
            PO_NUM: !!fdata &&!!fdata.PO_NUM ? fdata.PO_NUM: '',
            id:i+1,
            SITE_ID: !!this.props.siteListDetails && this.props.siteListDetails.length > 0 ?
                        this.props.siteListDetails.find(sld => sld.ps_loc === fdata.PS_LOCATION_ID.trim()).site_id : '',
            PS_LOCATION_ID: !!fdata && !!fdata.PS_LOCATION_ID ? fdata.PS_LOCATION_ID : '',
            PM_LOCATION_NAME: !!fdata && !!fdata.PM_LOCATION_NAME ? fdata.PM_LOCATION_NAME.split('^')[1]: '',
            FUEL_AMOUNT: !!fdata && !!fdata.FUEL_AMOUNT ? fdata.FUEL_AMOUNT : '',
            FILL_PERCENTAGE: !!fdata && !!fdata.FILL_PERCENTAGE ? fdata.FILL_PERCENTAGE : '',
            GEN_RUNTIME: !!fdata && !!fdata.GEN_RUNTIME ? fdata.GEN_RUNTIME : '',
            MATERIAL_COST: !!fdata && !!fdata.MATERIAL_COST ? fdata.MATERIAL_COST : '',
            LABOUR_HOURS: !!fdata && !!fdata.LABOUR_HOURS ? fdata.LABOUR_HOURS : ''
           
     
        }))
        }

    }
   async formPostRequest1(attrAction, currentValue){
    const { PM_LIST_ID, PM_LIST_ITEM_ID_PS, PM_LOCATION_UNID, PO_ITEM_ID } = currentValue
    const { userFname, fetchPmModelAttributeDetails,vendorId, loginId } = this.props
    
    
   
      
        if(this.props.modelAttributes.length > 0){
            var data = this.props.currentDropdownValueType === 'PM GEN FUEL' ? {
                  "8": currentValue.GEN_RUNTIME,
                  "21": currentValue.FUEL_AMOUNT,
                  "22": currentValue.FILL_PERCENTAGE,
                  "28": currentValue.LABOUR_HOURS
              }:this.props.currentDropdownValueType === 'PM GENERATOR REPAIR' ? {
                 
                  "27": currentValue.MATERIAL_COST,
                  "28": currentValue.LABOUR_HOURS
              }: this.props.currentDropdownValueType === 'PM HVAC REPAIR' ? {
                  "38": currentValue.MATERIAL_COST,
                  "39": currentValue.LABOUR_HOURS
              } : {}
             
             await  Object.keys(data).forEach((udk) => {
                
                  const { PM_TEMPLATE_ID,
                      PM_TMPLT_ATTR_ID,
                      PM_TMPLT_ATTR_NAME } = this.props.modelAttributes.filter((mda) => udk == mda.PM_TMPLT_ATTR_ID)[0]
                  const PM_TMPLT_ATTR_OLD_VALUE = ''
                  const PM_TMPLT_ATTR_NEW_VALUE = data[udk]
                  const PM_TMPLT_ATTR_NEW_VALUE_SENT = ''
                this.setState({inArr : this.state.inArr.concat({
                      PM_LIST_ID,
                      PM_LIST_ITEM_ID: PM_LIST_ITEM_ID_PS,
                      PM_TEMPLATE_ID,
                      PM_TMPLT_ATTR_ID,
                      PM_TMPLT_ATTR_NAME,
                      "PM_TMPLT_ATTR_UNID": PM_LOCATION_UNID,
                      PM_TMPLT_ATTR_OLD_VALUE,
                      PM_TMPLT_ATTR_NEW_VALUE,
                      PM_TMPLT_ATTR_NEW_VALUE_SENT,
                      "PM_TMPLT_ATTR_ACTION": attrAction,
                      "LAST_UPDATED_BY": userFname
                  }) }, () => {
                  var { vendorId, loginId} = this.props
                  const  submitpostRequest1 = {
                        updatedData: this.state.inArr
                    } 
           
            
                 if(this.state.inArr.length === this.state.selectedLists.length * Object.keys(data).length){
                      
                     this.props.submitPMQuote(vendorId, loginId, 'ADD_SITE_BULK', submitpostRequest1).then(async(action) => {
                         
                         if (action.type === 'SUBMIT_PM_QUOTE_SUCCESS') {
                            await this.props.handleHideAddSite()
                           await  this.props.initializeComponent()
                          
                            await this.props.managerChanged(this.props.managerForAddASite)
                             await this.initializeAddSite()
                             await this.props.clearFuelLaborCost()
                             this.props.notiref.addNotification({
                                 title: 'success',
                                 position: "br",
                                 level: 'success',
                                 message: "site added successfully"
                             })

                         }



                     })
                         .catch(e => {
                             this.props.notiref.addNotification({
                                 title: 'error',
                                 position: "br",
                                 level: 'error',
                                 message: "site addition failed"
                             })
                         })
                 }
              })
               

              })
                 
               
              
              
        
              return;
        }
         
        
          
      

    

  }
  
    async onSubmit() {
       
            var { vendorId, loginId, fetchPmModelAttributeDetails} = this.props
            
          await  this.state.selectedLists.map(async val => {
                        let pmType = this.state.currentDropdownValueType === 'PM GEN FUEL' || this.state.currentDropdownValueType === 'PM GENERATOR REPAIR' ? 'GENERATOR PM' : 'HVAC PM'
                        let pm_type = val.PO_ITEM_ID && val.PO_ITEM_ID != '' ? null : pmType
                       await fetchPmModelAttributeDetails(vendorId, loginId, pm_type, val.PO_ITEM_ID).then(async action => {
                        
                           await this.formPostRequest1('ADD_SITE', val)
                        })
                     return  
                    })


    }


    render(){
       const modfdGridDetails = this.modifyGridDetails()

        let columnsHvac = [
            {
                headerName: "PM PO Number", field: "PO_NUM", minWidth:150, flex: 1.4
            },
            {
                headerName: "Site ID", field: "SITE_ID", minWidth:150, flex: 1
            },

            
            {
                headerName: "PS Location ID", field: "PS_LOCATION_ID",minWidth:100, flex: 1
            },
            {
                headerName: "Site Name", field: "PM_LOCATION_NAME", minWidth: 180, flex: 2
            },
          
            
            {
                headerName: "Material Cost ", field: "MATERIAL_COST", minWidth:150, editable:true,flex: 1,
                cellClassName: function (params) {
                    return !!params.row.MATERIAL_COST && (isNaN(parseFloat(params.row.MATERIAL_COST))|| parseFloat(params.row.MATERIAL_COST) < 0 ) ? 'red-text inset-border' : 'inset-border'
                },
                valueGetter: function (value) {
                    return value;
                },
                valueSetter: function (value, params) {
                    if (params.MATERIAL_COST !== value && !!parseFloat(value) && parseFloat(value) > 0) {
                        params.MATERIAL_COST = parseFloat(value);
                        return params;
                    }else {
                        return params
                    }
                }
            },
            {
                headerName: "Labor hour", headerTooltip: "Labor hour", field: "LABOUR_HOURS", tooltipField: "LABOUR_HOURS", filter: "agSetColumnFilter", width:150,editable:true,flex: 1,
                cellClassName: function (params) {
                    return !!params.row.LABOUR_HOURS && (isNaN(parseFloat(params.row.LABOUR_HOURS))|| parseFloat(params.row.LABOUR_HOURS) < 0 ) ? 'red-text inset-border' : 'inset-border'
                },
                valueGetter: function (value) {
                    return value;
                },
                valueSetter: function (value,params) {
                    if (params.LABOUR_HOURS !== value && !!parseFloat(value) && parseFloat(value) > 0) {
                        params.LABOUR_HOURS = parseFloat(value);
                        return params;
                    }else {
                        return params
                    }
                }
            }
            
         
        
        ]
        let columnsGen = [
            {
                headerName: "PM PO Number", field: "PO_NUM", flex: 1.4
            },
            {
                headerName: "Site ID", field: "SITE_ID", flex: 1
            }, 
            {
                headerName: "PS Location ID", field: "PS_LOCATION_ID", flex: 1
            },
            {
                headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 2
            },
            {
                headerName: "Amount of fuel added", field: "FUEL_AMOUNT", editable:true, flex:1,
                cellClassName: function (params) {
                   return !!params.row.FUEL_AMOUNT && (isNaN(parseFloat(params.row.FUEL_AMOUNT))|| parseFloat(params.row.FUEL_AMOUNT) < 0 ) ? 'red-text inset-border' : 'inset-border'
                },
                valueGetter: function (value) {
                    return value;
                },
                valueSetter: function (value, params) {
                    if (params.FUEL_AMOUNT !== value && !!parseFloat(value) && parseFloat(value) > 0) {
                        params.FUEL_AMOUNT = parseFloat(value);
                        return params;
                    }else {
                        return params
                    }
                }
            },
            {
                headerName: "Fill Percentage (after fueling)", field: "FILL_PERCENTAGE", editable:true, flex: 1,
                cellClassName: function (params) {
                   return !!params.row.FILL_PERCENTAGE && (isNaN(parseFloat(params.row.FILL_PERCENTAGE))|| parseFloat(params.row.FILL_PERCENTAGE) < 0 ) ? 'red-text inset-border' : 'inset-border'
                },
                valueGetter: function (value) {
                    return value;
                },
                valueSetter: function (value, params) {
                    if (params.FILL_PERCENTAGE !== value && !!parseFloat(value) && parseFloat(value) > 0) {
                        params.FILL_PERCENTAGE = parseFloat(value);
                        return params;
                    }else {
                        return params
                    }
                }
            },
            {
                headerName: "Generator Runtime (hours)", field: "GEN_RUNTIME", editable:true, flex: 1,
                cellClassName: function (params) {
                   return !!params.row.GEN_RUNTIME && (isNaN(parseFloat(params.row.GEN_RUNTIME))|| parseFloat(params.row.GEN_RUNTIME) < 0 ) ? 'red-text inset-border' : 'inset-border'
                },
                valueGetter: function (value) {
                    return value;
                },
                valueSetter: function (value, params) {
                    if (params.GEN_RUNTIME !== value && !!parseFloat(value) && parseFloat(value) > 0) {
                        params.GEN_RUNTIME = parseFloat(value);
                        return params;
                    }else {
                        return params
                    }
                }
            },
            {
                headerName: "Labor hour", field: "LABOUR_HOURS",editable:true, flex: 1,
                cellClassName: function (params) {
                   return !!params.row.LABOUR_HOURS && (isNaN(parseFloat(params.row.LABOUR_HOUR))|| parseFloat(params.row.LABOUR_HOUR) < 0 ) ? 'red-text inset-border' : 'inset-border'
                },
                valueGetter: function (value) {
                    return value;
                },
                valueSetter: function (value, params) {
                    if (params.LABOUR_HOURS !== value && !!parseFloat(value) && parseFloat(value) > 0) {
                        params.LABOUR_HOURS = parseFloat(value);
                        return params;
                    }else {
                        return params
                    }
                }
            }
            
         
        
        ]
        let autoGroupColumnDef = {
            headerName: 'Select',
            field: 'Select',
            minWidth: 250,
            cellRenderer: 'agGroupCellRenderer',

        }
        let customStyle = { fontSize: '12px', marginTop: '5px' }
        return (
        <div className="App container-fluid">
            <div style={{ "paddingTop": "15px" }}>
                <DataGrid 
                    columns={this.props.currentDropdownValueType === 'PM GEN FUEL' || this.props.currentDropdownValueType === '' ? columnsGen :  columnsHvac}
                    rows={!modfdGridDetails ? [] : modfdGridDetails}
                    columnHeaderHeight={35}
                    rowHeight={30}
                    initialState={{
                        pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
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
                        },
                        '& .red-text': {
                            color: 'red'
                        },
                        '& .inset-border': {
                            boxShadow: "0px 0px 0px 2px white inset, 0px 0px 0px 4px black inset"
                        }
                    }}
                    checkboxSelection={modfdGridDetails?.length > 0 ? true : false}
                    disableRowSelectionOnClick={true}
                    onCellEditStop={
                        (params, event) => {
                            this.oncellValueChanged(params.row)
                        }
                    }
                    onRowSelectionModelChange={ (params) => this.onSelectionChanged(params) }
                    
                />            
            </div>
            <div className="row">
            <div className="col-md-10" />
            <div className="col-md-2" style={{marginBlock: '10px'}}>
                <button className="btn btn-danger btn button-class mr-3" onClick={this.onSubmit.bind(this)}disabled={this.state.selectedLists.length === 0}>Add</button>
            
            </div>
            </div>
      </div>)
    }
}

function stateToProps(state, ownProps) {
     
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
    let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
    let user = !!state.getIn(['Users', 'entities', 'users', loginId], Map()) ? state.getIn(['Users', 'entities', 'users', loginId], Map()).toJS() : []
    let vendorId = user.vendor_id
    let createsitesListLoading = state.getIn(['PmDashboard', loginId, vendorId, 'pm',"CreateListSitesLoading"])
    let createSitesList = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreateListSitesResults"], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreateListSitesResults"], List()).toJS() : []
    let pmRefDetails = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmRefList'], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmRefList'], List()).toJS() : []
    let buyerListDetails = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', "buyerListDetails", 'getBuyerList', 'fieldsList'], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "buyerListDetails", 'getBuyerList', 'fieldsList'], List()).toJS() : []
    let siteListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "siteListDetails", 'getSiteListDetails', 'filteredList'], List()).toJS()
    let expenseProjId = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "expenseProjId", 'getExpenseProjIdData', 'expenseProjIdData'], List()).toJS()
    let pmGridDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List()).toJS()
      let modelAttributes = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'pmModelAttDetails', 'getPmModelAttDetails'], List()).toJS()
      let userFname = state.getIn(['Users', 'entities', 'users', loginId, "fname"])
    // let pmSystemRecordsLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSystemRecordsLoading", ownProps.currentPmList.PM_LIST_ID])
    // let pmSystemRecords = !!state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSystemRecords", ownProps.currentPmList.PM_LIST_ID]) ? state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSystemRecords", ownProps.currentPmList.PM_LIST_ID]).toJS() : []
    let userList = state.getIn(['Users', 'getVendorList', 'Users'], List()).toJS()
    let pmListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()
    // let createdPMList = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreatePMDetailsResp", ownProps.refName]) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreatePMDetailsResp", ownProps.refName], '') : ''
   
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
        pmGridDetails,
        modelAttributes,
        userFname,
        //pmSystemRecordsLoading,
       // pmSystemRecords,
        userList,
        pmListDetails,
       // createdPMList
    }
}

export default connect(stateToProps, { ...pmActions })(CreateAList)