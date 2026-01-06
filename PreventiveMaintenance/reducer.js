import * as actions from './actions'

import moment from 'moment'
import merge from 'lodash/merge'
import {Map, fromJS, List} from 'immutable'

export function PmDashboard (state = Map(), action) {
    switch (action.type) {

        case actions.FETCH_TOWERINSP_REQUEST:
            return state
            .setIn([action.loginId, action.vendorId, "towerInsp",action.unid, "towerInspLoading"], true)
        case actions.FETCH_TOWERINSP_SUCCESS:
            return state
            .setIn([action.loginId, action.vendorId, "towerInsp",action.unid, "towerInspLoading"], false)
            .setIn([action.loginId, action.vendorId, "towerInsp",action.unid, "inspData"], fromJS(action.inspData))
        case actions.FETCH_TOWERINSP_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "towerInsp",action.unid, "towerInspLoading"], false)
            .setIn([action.loginId, action.vendorId, "towerInsp",action.unid, "inspDataError"], fromJS(action.inspData))
		case actions.FETCH_FILE_DETAILSGO95_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "fileDetailsLoadinggo95"], true)
        case actions.FETCH_FILE_DETAILSGO95_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "fileDetailsLoadinggo95"], false)
                .setIn([action.loginId, action.vendorId, "pm", "fileDetailsgo95", action.unid,action.fileName], fromJS(action.fileDetailsgo95))
        case actions.FETCH_FILE_DETAILSGO95_FAILURE:
            return state.setIn([action.loginId, action.vendorId, "pm", "fileDetailsgo95", action.unid,action.fileName ], fromJS({ fileDetailsLoadinggo95: false, errors: action.errorsFilesdetailsgo95 }))
		case actions.FETCH_AUDITDETAILS_REQUEST:
            return state
            .setIn([action.loginId, action.vendorId, "GO95", "GO95AuditDetLoading", action.pmlistitemid], true)
        case actions.FETCH_AUDITDETAILS_SUCCESS:
            return state
            .setIn([action.loginId, action.vendorId, "GO95", "GO95AuditDetLoading", action.pmlistitemid], false)
            .setIn([action.loginId, action.vendorId, "GO95", "GO95AuditDet", action.pmlistitemid], fromJS(action.auditDetails))
        case actions.FETCH_AUDITDETAILS_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "GO95", "GO95AuditDetLoading", action.pmlistitemid], false)
            .setIn([action.loginId, action.vendorId, "GO95", "GO95AuditDetError", action.pmlistitemid], fromJS(action.errorsauditDetails))
        case actions.FETCH_GO95POLEINFO_REQUEST:
            return state
            .setIn([action.loginId, action.vendorId, "GO95", "GO95PoleInfoLoading", action.poleUnid], true)
        case actions.FETCH_GO95POLEINFO_SUCCESS:
            return state
            .setIn([action.loginId, action.vendorId, "GO95", "GO95PoleInfoLoading", action.poleUnid], false)
            .setIn([action.loginId, action.vendorId, "GO95", "GO95PoleInfo", action.poleUnid], fromJS(action.GO95PoleInfo))
        case actions.FETCH_GO95POLEINFO_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "GO95", "GO95PoleInfoLoading", action.poleUnid], false)
            .setIn([action.loginId, action.vendorId, "GO95", "GO95PoleInfoError", action.poleUnid], fromJS(action.errorsGO95PoleInfo))
        case actions.FETCH_TMPLTDATA_REQUEST:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmTemplateDataLoading", action.pmListId], true)
        case actions.FETCH_TMPLTDATA_SUCCESS:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmTemplateDataLoading", action.pmListId], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmTemplateData", action.pmListId], fromJS(action.fileData))
        case actions.FETCH_TMPLTDATA_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmTemplateDataLoading", action.pmListId], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmTemplateDataError", action.pmListId], fromJS(action.errorfileData))
        case actions.FETCH_PNDGSITES_REQUEST:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pendingSitesForUpdateLoading", action.pmListIds], true)
        case actions.FETCH_PNDGSITES_SUCCESS:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pendingSitesForUpdateLoading", action.pmListIds], false)
            .setIn([action.loginId, action.vendorId, "pm", "pendingSitesForUpdate", action.pmListIds], fromJS(action.PendingSitesForUpdate))
        case actions.FETCH_PNDGSITES_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pendingSitesForUpdateLoading", action.pmListIds], false)
            .setIn([action.loginId, action.vendorId, "pm", "pendingSitesForUpdateError", action.pmListIds], fromJS(action.errorsPendingSitesForUpdate))
        case actions.FETCH_CRNTSYS_REQUEST:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmSystemRecordsLoading", action.pmListId], true)
        case actions.FETCH_CRNTSYS_SUCCESS:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmSystemRecordsLoading", action.pmListId], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmSystemRecords", action.pmListId], fromJS(action.readings))
        case actions.FETCH_CRNTSYS_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmSystemRecordsLoading", action.pmListId], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmSystemRecordsError", action.pmListId], fromJS(action.errorReadings))
        case actions.FILTER_SEARCHED_SITES:
            var oldList = state.getIn([action.loginId, action.vendorId, "pm", "pmSearchresults"], List()).toJS()
            var capsSearchString = !! action.searchString ?action.searchString.toUpperCase() : ''
            let newList =  oldList.filter(njl => 
						(!!njl.PS_LOCATION_ID && njl.PS_LOCATION_ID.toUpperCase().includes(capsSearchString)) ||
						(!!njl.SITE_ID && njl.SITE_ID.toUpperCase().includes(capsSearchString)) ||
                        (!!njl.PM_LOCATION_NAME &&  njl.PM_LOCATION_NAME.toUpperCase().includes(capsSearchString)) ||
                        (!!njl.PO_NUM && njl.PO_NUM.toUpperCase().includes(capsSearchString) )||
                        (!!njl.PM_ITEM_DUE_DATE &&  njl.PM_ITEM_DUE_DATE.toUpperCase().includes(capsSearchString)) ||
                        (!!njl.PM_ITEM_STATUS && njl.PM_ITEM_STATUS.toUpperCase().includes(capsSearchString) )||
                        (!!njl.COMPLETED_BY && njl.COMPLETED_BY.toUpperCase().includes(capsSearchString)) ||
                        (!!njl.PM_LIST_NAME && njl.PM_LIST_NAME.toUpperCase().includes(capsSearchString))
                        
						
						
                )
                
            return state
             .setIn([action.loginId, action.vendorId, "pm", "pmfilteredresults"], fromJS(newList))   
        case actions.FETCH_ACTIVESITES_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "activeSitesLoading"], true)
        case actions.FETCH_ACTIVESITES_SUCCESS:
        

            return state
                .setIn([action.loginId, action.vendorId, "pm", "activeSitesLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "activeSitesResults"], fromJS(action.ActiveSitesResults))
        case actions.FETCH_ACTIVESITES_FAILURE:
            return state
             .setIn([action.loginId, action.vendorId, "pm", "activeSitesLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "activeSitesResultsfailed"], fromJS({ errors: action.errorsActiveSites }))     
        case actions.FETCH_CREATELIST_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "CreateListSitesLoading"], true)
        case actions.FETCH_CREATELIST_SUCCESS:
        

            return state
                .setIn([action.loginId, action.vendorId, "pm", "CreateListSitesLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "CreateListSitesResults"], fromJS(action.CreateListSitesResults))
        case actions.FETCH_CREATELIST_FAILURE:
            return state
             .setIn([action.loginId, action.vendorId, "pm", "CreateListSitesLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "CreateListSitesResultsfailed"], fromJS({ errors: action.errorsCreateListSites }))
        case actions.FETCH_PMSEARCHSITES_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "pmSearchresultsLoading"], true)
        case actions.FETCH_PMSEARCHSITES_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "pmSearchresultsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "pmSearchresults"], fromJS(action.searchResults))
        case actions.FETCH_PMSEARCHSITES_FAILURE:
            return state
             .setIn([action.loginId, action.vendorId, "pm", "pmSearchresultsLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmSearchresultsfailed"], fromJS({ errors: action.errorsPmResults }))

        case actions.FETCH_PMLISTDETAILS_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "pmListDetailsLoading"], true)
        case actions.FETCH_PMLISTDETAILS_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "pmListDetailsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "pmListDetails"], fromJS(action.pmListDetails))
        case actions.FETCH_PMLISTDETAILS_FAILURE:
            return state
             .setIn([action.loginId, action.vendorId, "pm", "pmListDetailsLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmListDetails"], fromJS({ errors: action.errorsPmList }))
        case actions.FETCH_SYNCEDSITESINFO_REQUEST:
               return state.setIn([action.loginId, action.vendorId, "pm", "syncedSitesInfoLoading"], true)
        case actions.FETCH_SYNCEDSITESINFO_SUCCESS:
               return state
                .setIn([action.loginId, action.vendorId, "pm", "syncedSitesInfoLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "syncedSitesInfo"], fromJS(action.syncedSitesInfo))

        case actions.FETCH_SYNCEDSITESINFO_FAILURE:
                return state
             .setIn([action.loginId, action.vendorId, "pm", "syncedSitesInfoLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "syncedSitesInfo"], fromJS({ errors: action.errorsSyncedSites })) 

          case actions.FETCH_BUYERLISTDETAILS_REQUEST:
               return state.setIn([action.loginId, action.vendorId, "pm", "buyerListDetailsLoading"], true)
        case actions.FETCH_BUYERLISTDETAILS_SUCCESS:
               return state
                .setIn([action.loginId, action.vendorId, "pm", "buyerListDetailsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "buyerListDetails"], fromJS(action.buyerListDetails))

        case actions.FETCH_BUYERLISTDETAILS_FAILURE:
                return state
             .setIn([action.loginId, action.vendorId, "pm", "buyerListDetailsLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "buyerListDetails"], fromJS({ errors: action.errorsBuyerList })) 

        case actions.FETCH_EXPENSEPROJIDDATA_REQUEST:
               return state.setIn([action.loginId, action.vendorId, "pm", "expenseProjIdDataLoading"], true)
        case actions.FETCH_EXPENSEPROJIDDATA_SUCCESS:
               return state
                .setIn([action.loginId, action.vendorId, "pm", "expenseProjIdDataLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "expenseProjId"], fromJS(action.expenseProjId))

        case actions.FETCH_EXPENSEPROJIDDATA_FAILURE:
                return state
             .setIn([action.loginId, action.vendorId, "pm", "expenseProjIdDataLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "expenseProjId"], fromJS({ errors: action.errorsExpenseProjId })) 
            
         case actions.FETCH_SITELISTDETAILS_REQUEST:
               return state.setIn([action.loginId, action.vendorId, "pm", "siteListDetailsLoading"], true)
        case actions.FETCH_SITELISTDETAILS_SUCCESS:
               return state
                .setIn([action.loginId, action.vendorId, "pm", "siteListDetailsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "siteListDetails"], fromJS(action.siteListDetails))

        case actions.FETCH_SITELISTDETAILS_FAILURE:
                return state
             .setIn([action.loginId, action.vendorId, "pm", "siteListDetailsLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "siteListDetails"], fromJS({ errors: action.errorsSiteList }))     

case actions.FETCH_PMGRIDDETAILSDRAFT_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsDraftLoading"], true)
            case actions.FETCH_PMGRIDDETAILSDRAFT_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsDraftLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsDraft"], fromJS(action.pmGridDetailsDraft))
        case actions.FETCH_PMGRIDDETAILSDRAFT_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsDraftLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "errorsPmGridDraft"], fromJS({ errors: action.errorsPmGridDraft }))
        case actions.FETCH_PMGRIDDETAILS_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsLoading"], true)
        case actions.FETCH_PMGRIDDETAILS_SUCCESS_MULTIPLE:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsMultiple"], fromJS(action.pmGridDetailsMultiple))
        case actions.FETCH_PMGRIDDETAILS_FAILURE_MULTIPLE:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsMultiple"], fromJS({ errors: action.errorsPmGridMultiple }))
        case actions.FETCH_PMGRIDDETAILSDRAFT_SUCCESS_MULTIPLE:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsDraftLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsDraftMultiple"], fromJS(action.pmGridDetailsDraftMultiple))
        case actions.FETCH_PMGRIDDETAILSDRAFT_FAILURE_MULTIPLE:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsDraftLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsDraftMultiple"], fromJS({ errors: action.errorsPmGridDraftMultiple }))
        case actions.FETCH_PMGRIDDETAILS_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "pmGridDetails"], fromJS(action.pmGridDetails))
        case actions.FETCH_PMGRIDDETAILS_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmGridDetailsLoading"], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmGridDetails"], fromJS({ errors: action.errorsPmGrid }))

        case actions.FETCH_CMPLTDATTDET_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "pmCompAttDetailsLoading",action.pmlistitemid], true)

        case actions.MODIFY_COMPATT_DETAILS:
            return state
               
                .setIn([action.loginId, action.vendorId, "pm", "pmCompAttDetails",action.pmlistitemid], fromJS(action.modfdList))
            
        case actions.FETCH_CMPLTDATTDET_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "pmCompAttDetailsLoading", action.pmlistitemid], false)
                .setIn([action.loginId, action.vendorId, "pm", "pmCompAttDetails",action.pmlistitemid], fromJS(action.pmCompAttDetails))
        case actions.FETCH_CMPLTDATTDET_FAILURE:
            return state
            .setIn([action.loginId, action.vendorId, "pm", "pmCompAttDetailsLoading", action.pmlistitemid], false)
            .setIn([action.loginId, action.vendorId, "pm", "pmCompAttError", action.pmlistitemid], fromJS({ errors: action.errorsPmCompAttDetails }))
        case actions.FETCH_PMMODELATT_DETAILS_REQUEST:

                return state.setIn([action.loginId, action.vendorId, "pm", "pmModelAttDetailsLoading"], true)
                
        case actions.FETCH_PMMODELATT_DETAILS_SUCCESS:
                return state
                    .setIn([action.loginId, action.vendorId, "pm", "pmModelAttDetailsLoading"], false)
                    .setIn([action.loginId, action.vendorId, "pm", "pmModelAttDetails"], fromJS(action.pmModelAttDetails))
        case actions.FETCH_PMMODELATT_DETAILS_FAILURE:
                return state.setIn([action.loginId, action.vendorId, "pm", "pmModelAttDetails"], fromJS({ pmDetailsLoading: false, errors: action.errorsPmModelAtt }))

        case actions.GENERATE_DATA_REQUEST:
            return state.setIn([action.loginId, "pm", "DataDetailsLoading"], true)
        case actions.GENERATE_DATA_SUCCESS:
                return state.setIn([action.loginId, "pm", "DataDetailsLoading"], false)
        case actions.GENERATE_DATA_FAILURE:
                return state.setIn([action.loginId, "pm", "DataDetailsLoading"], false)

        case actions.FETCH_HVACPMMODELATT_DETAILS_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "HVACPMDetailsLoading"], true)
            
        case actions.FETCH_HVACPMMODELATT_DETAILS_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "HVACPMDetailsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "HVACPMDetails"], fromJS(action.HVACPMDetails))
        case actions.FETCH_HVACPMMODELATT_DETAILS_FAILURE:
            return state.setIn([action.loginId, action.vendorId, "pm", "HVACPMDetails"], fromJS({ pmDetailsLoading: false, errors: action.errorsHVACPM }))
            
            case actions.SET_VIDEO_SEL:
            return state.setIn([action.loginId, action.vendorId, "pm", "videoSel"], fromJS(action.uniqId))
        case actions.SET_PM_FILTERS:
            return state.setIn([action.loginId, action.vendorId, "pm", "pmFilters"], fromJS(action.pmFilters))
        case actions.STORE_TEMPLATE_DATA:
            return state.setIn([action.loginId, action.vendorId, "pm", 'PmlistItems', action.pmListId ], fromJS(action.PmlistItems))
        case actions.ADD_SELECTSTATUS_TO_ALL_LIST:
        
            const beforeSelection = state.getIn([action.loginId, action.vendorId,  'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()
            const withSelectionStatus = beforeSelection.map(lbs => {
                
               
                    return {
                        ...lbs,
                        itemSelected: action.selectionStatus,
                        itemExpanded: action.expansionStatus
                    }
               


            })
            return state.setIn([action.loginId, action.vendorId,'pm', "pmListDetails", 'getPmListDetails', 'pmLists' ], fromJS(withSelectionStatus))
        case actions.ADD_SELECTSTATUS_TO_LIST:
            const listBeforeSelection = state.getIn([action.loginId, action.vendorId,  'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()
            const listWithSelectionStatus = listBeforeSelection.map(lbs => {
                
                if (lbs.PM_LIST_ID === action.pmListId) {
                    return {
                        ...lbs,
                        itemSelected: action.selectedItem.checked
                    }
                }
                else {
                    return lbs
                }


            })
            return state.setIn([action.loginId, action.vendorId,'pm', "pmListDetails", 'getPmListDetails', 'pmLists' ], fromJS(listWithSelectionStatus))
            
        case actions.SELECT_ALL_TO_LIST:
            
            const listBeforeSelectAll= state.getIn([action.loginId, action.vendorId,  'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()
            const listWithSelectAllToggle = listBeforeSelectAll.map(lbs => {
                
                if (action.visiblePmLists.includes(lbs.PM_LIST_ID)) {
                    return {
                        ...lbs,
                        itemSelected: action.selectAllChecked
                    }
                }
                else {
                    return lbs
                }


            })
            
            return state.setIn([action.loginId, action.vendorId,'pm', "pmListDetails", 'getPmListDetails', 'pmLists' ], fromJS(listWithSelectAllToggle))
            
        case actions.TOGGLE_EXPSTATUS_TO_LIST:
            
            const listBeforeToggle= state.getIn([action.loginId, action.vendorId,  'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()
            const listWithToggle = listBeforeToggle.map(lbs => {
                
                if (lbs.PM_LIST_ID === action.pmListId) {
                    return {
                        ...lbs,
                        itemExpanded: !lbs.itemExpanded
                    }
                }
                else {
                    return {
                        
                        ...lbs,
                        itemExpanded: false
                    }
                    
                }


            })
            
            return state.setIn([action.loginId, action.vendorId,'pm', "pmListDetails", 'getPmListDetails', 'pmLists' ], fromJS(listWithToggle))
            
        case actions.ADD_SELECTSTATUS_TO_LISTITEM:
            const listeItemsBeforeSelection = state.getIn([action.loginId, action.vendorId, "pm", 'PmlistItems', action.pmListId ], List()).toJS()
            const listItemsWithSelectionStatus = listeItemsBeforeSelection.map(lbs => {
                
                if (lbs.PS_LOCATION_ID === action.selectedItemLocationId) {
                    return {
                        ...lbs,
                        itemSelected: action.selectedItem.checked
                    }
                }
                else {
                    return lbs
                }


            })
            return state.setIn([action.loginId, action.vendorId, "pm", 'PmlistItems', action.pmListId ], fromJS(listItemsWithSelectionStatus))
        
        
        case actions.REMOVE_ATTCH_FROM_LISTITEM:
   
            const listItemsWithattchmts = state.getIn([action.loginId, action.vendorId, "pm", 'PmlistItems', action.pmListId ], List()).toJS()
            const mdfdListItems = listItemsWithattchmts.map(lia => {
              
                if(lia.PS_LOCATION_ID === action.locationId){
                    return {
                        ...lia,
                        attachmentList: lia.attachmentList.filter((_, i) => i !== action.index),
                        totalAttachmentsize: lia.totalAttachmentsize - Number(lia.attachmentList.filter((_, i) => i === action.index)[0].file_size)
                    }
                }
                else {
                    return lia
                }
            })
            return state.setIn([action.loginId, action.vendorId, "pm", 'PmlistItems', action.pmListId ], fromJS(mdfdListItems))
        
        case actions.ADD_ATTCH_TO_LISTITEM:
   
            const listItems = state.getIn([action.loginId, action.vendorId, "pm", 'PmlistItems', action.pmListId ], List()).toJS()
            const listItemsWithAttachments = listItems.map(li => {
                if(li.PS_LOCATION_ID === action.locationId){
                    
                 
                    return {
                        ...li,
                        attachmentList: !!li.attachmentList ? [
                            ...li.attachmentList,
                            action.attachment
                        ] : [action.attachment],
                        totalAttachmentsize: !!li.totalAttachmentsize ? li.totalAttachmentsize + Number(action.attachment.file_size) : Number(action.attachment.file_size)
                    }
                }
                else {
                    return li
                }

            })
            return state.setIn([action.loginId, action.vendorId, "pm", 'PmlistItems', action.pmListId ], fromJS(listItemsWithAttachments))
            
        case actions.FETCH_GENTANKDETAILS_REQUEST:
            return state.setIn([action.loginId, action.vendorId, "pm",  "genTankloading",action.pmlistitemid], true)
        case actions.FETCH_GENTANKDETAILS_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm",  "genTankloading",action.pmlistitemid], false)
                .setIn([action.loginId, action.vendorId, "pm",  "genTank",action.pmlistitemid], fromJS(action.genTank))

        case actions.FETCH_GENTANKDETAILS_FAILURE:
            return state
                .setIn([action.loginId, action.vendorId, "pm",  "genTankloading" ,action.pmlistitemid], false)
                .setIn([action.loginId, action.vendorId, "pm", "genTankerrors",action.pmlistitemid], fromJS(action.errorMessage))
        case actions.SUBMIT_TOWERINSP_SUCCESS:
                    return state.setIn([action.loginId, action.vendorId, "TowerInsp", "submitTowerInspResp", action.pmlistitemid], fromJS(action.submitTowerInspStatus))
        case actions.SUBMIT_TOWERINSP_ERROR:
            return state.setIn([action.loginId, action.vendorId, "TowerInsp", "submitTowerInspResp", action.pmlistitemid], fromJS(action.submitTowerInsperrorMessage))

        case actions.GENERATE_PDF_SUCCESS:
            return state.setIn([action.loginId, action.vendorId, "PdfGen", "InspPdfResp", action.pmlistitemid], fromJS(action.generatePdfMessage))
        case actions.GENERATE_PDF_ERROR:
            return state.setIn([action.loginId, action.vendorId, "PdfGen", "InspPdfResp", action.pmlistitemid], fromJS(action.generatePdferrorMessage))  

        case actions.SUBMIT_GO95INFO_SUCCESS:
            return state.setIn([action.loginId, action.vendorId, "GO95", "submitInspectionInfoResp", action.pmlistitemid], fromJS(action.submitInspectionInfoStatus))
        case actions.SUBMIT_GO95INFO_ERROR:
            return state.setIn([action.loginId, action.vendorId, "GO95", "submitInspectionInfosResp", action.pmlistitemid], fromJS(action.submitInspectionInfoerrorMessage))
        case actions.SUBMIT_PM_QUOTE_SUCCESS:
            return state.setIn([action.loginId, action.vendorId, "pm", "SubmitPMDetailsResp", action.pmlistitemid], fromJS(action.PmdetailsSubmissionStatus))
        case actions.SUBMIT_PM_QUOTE_ERROR:
            return state.setIn([action.loginId, action.vendorId, "pm", "SubmitPMDetailsResp", action.pmlistitemid], fromJS(action.PmDetailsSubmissionerrorMessage))
        
        case actions.CREATE_PM_LIST_REQUEST:
            return state.setIn([action.loginId, action.vendorId, "pm", "createPmListLoading"], true)
        case actions.CREATE_PM_LIST_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "createPmListLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "CreatePMDetailsResp", action.pmrefname], fromJS(action.createPMListSubmissionStatus))
        case actions.CREATE_PM_LIST_ERROR:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "createPmListLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "CreatePMDetailsResp", action.pmrefname], fromJS(action.createPMListSubmissionerrorMessage))

        case actions.UPLOAD_FILES_SUCCESS:
            return state.setIn([action.loginId, action.vendorId, "pm", "SubmitUploadDetailsResp", action.pmlistitemid], fromJS(action.uploadFilesSubmissionStatus))
        case actions.UPLOAD_FILES_ERROR:
            return state.setIn([action.loginId, action.vendorId, "pm", "SubmitUploadDetailsResp", action.pmlistitemid], fromJS(action.uploadFilesSubmissionerrorMessage))
		case actions.UPLOAD_FILES_SUCCESS_GO95:
            return state.setIn([action.loginId, action.vendorId, "pm", "SubmitUploadDetailsRespgo95", action.unid], fromJS(action.uploadFilesSubmissionStatusgo95))
        case actions.UPLOAD_FILES_ERROR_GO95:
            return state.setIn([action.loginId, action.vendorId, "pm", "SubmitUploadDetailsRespgo95", action.unid], fromJS(action.uploadFilesSubmissionerrorMessagego95))
            
        case actions.UPLOAD_FILES_SUCCESS_BULKPO:
            return state.setIn([action.loginId, action.vendorId, "pm", "SubmitUploadDetailsRespBulkPo", action.pmrefname], fromJS(action.uploadFilesSubmissionStatus))
        case actions.UPLOAD_FILES_SUCCESS_BULKPO    :
            return state.setIn([action.loginId, action.vendorId, "pm", "SubmitUploadDetailsRespBulkPo", action.pmrefname], fromJS(action.uploadFilesSubmissionerrorMessage))

        case actions.FETCH_HVACDETAILS_REQUEST:
            return state.setIn([action.loginId, action.vendorId, "pm", "hvacLoading", action.pmlistitemid], true)
        case actions.FETCH_HVACDETAILS_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "hvacLoading",action.pmlistitemid], false)
                .setIn([action.loginId, action.vendorId, "pm", "hvac",action.pmlistitemid], fromJS(action.hvacs))

        case actions.FETCH_HVACDETAILS_FAILURE:
            return state
                 .setIn([action.loginId, action.vendorId, "pm", "hvacLoading", action.pmlistitemid], false)
                .setIn([action.loginId, action.vendorId, "pm", "hvacerrors",action.pmlistitemid], fromJS(action.errorMessage))

        case actions.FETCH_FILE_DETAILS_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "fileDetailsLoading"], true)
        case actions.FETCH_FILE_DETAILS_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "fileDetailsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "fileDetails"], fromJS(action.fileDetails))
        case actions.FETCH_FILE_DETAILS_FAILURE:
            return state.setIn([action.loginId, action.vendorId, "pm", "fileDetails"], fromJS({ fileDetailsLoading: false, errors: action.errorsFilesdetails }))

        case actions.FETCH_TRAININGMATERIAL_REQUEST:

            return state.setIn([action.loginId, action.vendorId, "pm", "fileDetailsLoading"], true)
        case actions.FETCH_TRAININGMATERIAL_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "pm", "fileDetailsLoading"], false)
                .setIn([action.loginId, action.vendorId, "pm", "TrainingMaterial"], fromJS(action.TrainingMaterial))
        case actions.FETCH_TRAININGMATERIAL_FAILURE:
            return state.setIn([action.loginId, action.vendorId, "pm", "TrainingMaterial"], fromJS({ fileDetailsLoading: false, errors: action.errorsTrainingMaterial }))

        case actions.HVACINFO_REQUEST:
            return state.setIn([action.loginId, 'hvaccontrollerInfo', 'hvacToOpsLoading'], true)
        case actions.HVACINFO_SUCCESS:
            return state.setIn([action.loginId, 'hvaccontrollerInfo', 'hvacToOpsLoading'], false)
            .setIn([action.loginId, action.vendorId, "hvaccontrollerInfo", "result"], fromJS(action.hvacInfoToOps))
        case actions.HVACINFO_REQUEST:
            return state.setIn([action.loginId, 'hvaccontrollerInfo', 'hvacToOpsLoading'], false)
            .setIn([action.loginId, action.vendorId, "hvaccontrollerInfo", "result"], fromJS(action.errors))


            
        case actions.FETCH_BANNERDETAILS_SUCCESS:
            return state
               
                .setIn([action.loginId, "pm", "BannerDetails"], fromJS(action.BannerDetails))
        case actions.FETCH_BANNERDETAILS_FAILURE:
            return state
            
            .setIn([action.loginId, action.vendorId, "pm", "errorsBannerDetails"], fromJS({ errors: action.errorsBannerDetails }))
//*******************************************************NestEvaluation***********************
        case actions.FETCH_NESTEVALUATIONQS_REQUEST:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], true)
        case actions.FETCH_NESTEVALUATIONQS_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "data"], fromJS(action.nestData))
        case actions.FETCH_NESTEVALUATIONQS_FAILURE:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "dataError"], fromJS(action.nestErr))

        case actions.FETCH_NESTDETAILS_REQUEST:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], true)
        case actions.FETCH_NESTDETAILS_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "data"], fromJS(action.nestDetails))
        case actions.FETCH_NESTDETAILS_FAILURE:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "dataError"], fromJS(action.nestDetailsErr))

        case actions.FETCH_UPDATEQUESTIONNAIRE_REQUEST:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], true)
        case actions.FETCH_UPDATEQUESTIONNAIRE_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "data"], fromJS(action.updateQuestionnaire))
        case actions.FETCH_UPDATEQUESTIONNAIRE_FAILURE:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "dataError"], fromJS(action.updateQuestionnaireErr))
        case actions.FETCH_UPDATEQUESTIONNAIREATTACHMENT_REQUEST:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "attach", "nestEvalLoading"], true)
        case actions.FETCH_UPDATEQUESTIONNAIREATTACHMENT_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval","attach", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "attach","data"], fromJS(action.updateQuestionnaireAttachments))
        case actions.FETCH_UPDATEQUESTIONNAIREATTACHMENT_FAILURE:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "attach", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval","attach",  "dataError"], fromJS(action.updateQuestionnaireAttachmentsErr))

        case actions.FETCH_ATTACHMENTLISTOPSTRACKER_REQUEST:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], true)
        case actions.FETCH_ATTACHMENTLISTOPSTRACKER_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "data"], fromJS(action.attachmentsList))
        case actions.FETCH_ATTACHMENTLISTOPSTRACKER_FAILURE:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "dataError"], fromJS(action.attachmentsListErr))

        
       case actions.FETCH_ATTACHMENTCONTENT_REQUEST:
           return state
               .setIn([action.loginId, action.unid, "nestEval", "attach", "nestEvalLoading"], true)
       case actions.FETCH_ATTACHMENTCONTENT_SUCCESS:
           return state
               .setIn([action.loginId, action.unid, "nestEval", "attach", "nestEvalLoading"], false)
               .setIn([action.loginId, action.unid, "nestEval","attach", "data"], fromJS(action.attachmentsList))
       case actions.FETCH_ATTACHMENTCONTENT_FAILURE:
           return state
               .setIn([action.loginId, action.unid, "nestEval", "attach", "nestEvalLoading"], false)
               .setIn([action.loginId, action.unid, "nestEval", "attach", "dataError"], fromJS(action.attachmentsListErr))

         case actions.FETCH_VALIDATEPONUM_REQUEST:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], true)
        case actions.FETCH_VALIDATEPONUM_SUCCESS:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "data"], fromJS(action.validationData))
        case actions.FETCH_VALIDATEPONUM_FAILURE:
            return state
                .setIn([action.loginId, action.vendorId, "nestEval", "nestEvalLoading"], false)
                .setIn([action.loginId, action.vendorId, "nestEval", "dataError"], fromJS(action.validationErr))
        
        case actions.GET_POINVOICE_SITES_REQUEST:
            return state
                .setIn([ action.vendorId, "poInvoiceBanner", "receivedSitesLoading"], true)
        case actions.GET_POINVOICE_SITES_SUCCESS:
            return state
                .setIn([action.vendorId, "poInvoiceBanner", "receivedSitesLoading"], false)
                .setIn([action.vendorId, "poInvoiceBanner", "receivedSites"], fromJS(action.receivedSites))
        case actions.GET_POINVOICE_SITES_FAILURE:
            return state
                .setIn([action.vendorId, "poInvoiceBanner", "receivedSitesLoading"], false)
                .setIn([action.vendorId, "poInvoiceBanner", "error"], fromJS(action.error))
        default:
            return state
    }
}
export default PmDashboard
