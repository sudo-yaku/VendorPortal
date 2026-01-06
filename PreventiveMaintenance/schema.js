export const fetchPmListDetails = `query ($vendorId: Int!, $pmType: String!, $year:String!){
    getPmListDetails(vendorId:$vendorId, pmType:$pmType, year:$year){
        erpFlag
        pmLists{
                PM_LIST_ID
                PM_LIST_NAME
                PO_STATUS
                BUYER
                BUYER_ID
                PM_TYPE_ID
                PM_TYPE_NAME
                FREQUENCY
                PM_LIST_STATUS
                PERCENTAGE
                PO_NUM
                IS_VENDOR_REQUESTED
                IS_COMPLETED
                MANAGER
                MANAGER_EMAIL
                VENDOR_EMAIL
                BUYER_EMAIL
                MANAGER_ID
                S4_PO_NUM
                VENDOR_ID
                VENDOR_MDGID
        }
        pmListItemsStatusCount{
                STATUS_COUNT
                PM_ITEM_STATUS
                PM_LIST_ID
        }
        vzReviewPMlists
        pmRefList{
            PM_TYPE_ID
            PO_GROUP
            PM_TYPE_NAME
            MMID
            PO_ITEM_ID
            PARTENT_ITEM_ID
            CHILD_PM_TYPE_ID
            PO_DESCRIPTION
            PO_TYPE_SUB_CATEGORY
            CHILD_ITEM_ID
            SOURCE_SYSTEM
            COST_CENTER
            PROJECT_CODE
            EQUIPMENT_TYPE
        }
        pmListYears
    }
}`


export const fetchBuyerListDetails = `query ($loginId: String!, $market: String!, $submarket: String!, $source:String!){
    getBuyerList( loginId:$loginId, market:$market, submarket:$submarket, source:$source){
       fieldsList{
           feandmgrs{
                 userid
                  fname
                  lname
                  title
                  contact
                  empid
                  email
                  alt_phone
                  area
                  region
                  market
                 managerid
                 enterprise_id
               }
            po_info{
                 poEmailDetails{
                     po_emails
                     po_business_units
                    }
                 poBusinessDetails{
                     po_emails
                     po_business_units
                    }
                }
       }
}
}`

export const fetchSyncedSitesInfo = `query ( $submarket: String!, $managerId:String!,  $pmType:String!){
    getSyncedSitesInfo(submarket:$submarket, managerId:$managerId, pmType:$pmType){
        siteinfo
              {
                SITE_UNID  
                SITE_ID  
                SITE_NAME  
                PS_LOCATION_ID  
                SITE_PRIORITY  
                SITE_STATUS  
                SITE_TYPE   
                SITE_ONAIR_DATE  
                SITE_LATITUDE  
                SITE_LONGITITUDE   
                SITE_ADDRESS  
                SITE_CITY  
                SITE_STATE  
                SITE_COUNTY  
                SITE_ZIPCODE  
                SWITCH  
                SITE_MANAGER_ID  
                SITE_MANAGER_NAME  
                SWITCH_MANAGER_ID  
                SWITCH_MANAGER_NAME  
                SITE_TECHID  
                SITE_TECH_NAME 
                LAST_ACTIVITY_TRACKER  
                LAST_UPDATED_BY  
                LAST_UPDATED_DATE      
                MARKET   
                SUB_MARKET  
                COMPANY_CODE
                EQUIPMENT_TYPE
                EQUIPMENT_INFO 
                   {
      refrigerant
      serial_number
      economizer_type
      unit_type
      unit_size    
      hvac_controller_type
      hvac_controller_model  
                   pole_unid
                   psloc
                   structure_type
                   structure_owner
                   structure_material
                   last_pole_patrol_insp
                   next_pole_patrol_insp
                   last_pole_detailed_insp
                   next_pole_detailed_insp
                   emis_id
      manufacturer
      model
      gen_status
      ac_voltage
      ac_current
      oil_level
      fuel_tank1
      fuel_level1
      fuel_type1
      fuel_total1
      fuel_tank2
      fuel_level2
      fuel_type2
      fuel_total2
      fuel_tank3
      fuel_level3
      fuel_type3
      fuel_total3
      fuel_tank4
      fuel_level4
      fuel_type4
      fuel_total4
      fuel_tank5
      fuel_level5
      fuel_type5
      fuel_total5
      fuel_tank6
      fuel_level6
      fuel_type6
      fuel_total6
      fuel_tank7
      fuel_level7
      fuel_type7
      fuel_total7
      fuel_tank8
      fuel_level8
      fuel_type8
      fuel_total8
      install_date
      install_date_type
      serialnum
      meta_universalid
                   }
  
              }
    }
}`

export const fetchExpenseProjIdData = `query ($loginId: String!, $submarket: String!, $managerId:String!){
    getExpenseProjIdData(loginId:$loginId, submarket:$submarket, managerId:$managerId){
            expenseProjIdData
            wbscodes
}
}`

export const fetchSiteListDetails = `query ($market: String!, $submarket: String!, $managerId:String!, $pmType:String!, $location:String!){
    getSiteListDetails(market:$market, submarket:$submarket, managerId:$managerId, pmType:$pmType, location:$location){
       listcount
       filteredList{
        company_code
            equipmentinfo{
          install_date        
          install_date_type        
         serialnum        
         meta_universalid        
         emis_id        
         manufacturer        
         model        
         gen_status        
         ac_voltage        
         ac_current         
         oil_level        
         fuel_tank1        
         fuel_level1         
         fuel_type1        
         fuel_total1        
         fuel_tank2        
         fuel_level2        
         fuel_type2        
         fuel_total2        
         fuel_tank3        
         fuel_level3        
         fuel_type3        
         fuel_total3       
         fuel_tank4        
         fuel_level4        
         fuel_type4        
         fuel_total4        
         fuel_tank5        
         fuel_level5        
         fuel_type5        
         fuel_total5        
         fuel_tank6       
         fuel_level6       
         fuel_type6      
         fuel_total6      
         fuel_tank7        
         fuel_level7      
         fuel_type7        
         fuel_total7       
         fuel_tank8       
         fuel_level8       
         fuel_type8        
         fuel_total8 
            }         
            manager_id        
            manager_name  
           mdg_id
           locus_id      
            meta_universalid        
            ps_loc        
            shelter_vendor         
            site_callout_zone         
            site_id        
            site_name        
            site_priority        
            site_status       
            site_type        
            soa         
            switch         
            switch_manager_id_1        
            switch_manager_id_2        
            switch_manager_name_1        
            switch_manager_name_2         
            tech_id        
            tech_name         
            vendorassignments       
            lastPMCompletedDate                 
       }
    }
}`

export const fetchCurrentSystemRecords = `query ($unids: String!, $pmType:String!){
    getCurrentSystemRecords( unids:$unids, pmType:$pmType){
        listcount
        filteredList {
            equipmentinfo {
                manufacturer
                install_date
                serial_number
                economizer_type
                unit_type
                unit_size
            }
            ps_loc
        }
        
    }
    }`
export const fetchCurrentSystemRecordsGen = `query ($unids: String!, $pmType:String!){
    getCurrentSystemRecordsGen( unids:$unids, pmType:$pmType){
        listcount
        filteredList {
            equipmentinfo {
                manufacturer
                meta_universalid
                emis_id
                ac_voltage
                ac_current
                model
                serialnum
                oil_level
                fuel_type1
                fuel_tank1
                fuel_level1
                fuel_total1

            }
            ps_loc
            site_id
        }
        
    }
    }`

export const fetchActiveSites = `query ($vendorId: Int!, $submarket: String!,$managerId : String!,$poItemIds : String!){
    getActiveSites(vendorId:$vendorId,submarket:$submarket, managerId:$managerId, poItemIds:$poItemIds){
       listItems {
                   PM_LOCATION_NAME
                    PM_SITE_ID
                    PM_LIST_ID
                    PM_LIST_NAME
                    PM_LOCATION_UNID
                    PS_LOCATION_ID  
                    PO_ITEM_DESCRIPTION                                          
        }
    }
}`
export const getBannerDetails = `query {
    getNotifications{
       notifications{
        NOTIFY_ID
        NOTIFY_TYPE
        NOTIFY_MESSAGE
        NOTIFY_DISPLAY
}
    }
}`

export const fetchCreateListSites = `query ($vendorId: Int!,$year:String!){
    getCreateListSites(vendorId:$vendorId,year:$year){
       listItems {
                    PO_STATUS
                    PM_LIST_NAME
                    BUYER
                    BUYER_ID
                    PS_ITEM_ID
                    MMID
                    MDG_ID
                    SUB_MARKET
                    PO_NUM
                    MANAGER_ID
                    MANAGER
                    BUYER_EMAIL
                    MANAGER_EMAIL
                    PM_ITEM_RESULT_ID
                    PM_LIST_ITEM_ID_PS
                    PM_LIST_ITEM_ID
                    PM_LIST_ID
                    PM_LOCATION_NAME
                    PM_LOCATION_STATUS
                    PM_LOCATION_UNID
                    PS_LOCATION_ID
                    PM_LOCATIONGRP
                    PM_EQUIPMENT_MAKER
                    PM_LOCATION_CALLOUTZONE
                    PM_LOCATION_ONAIR_DATE
                    SWITCH_NAME
                    LOCATION_MANAGER
                    LOCATION_MANAGER_ID
                    FIELDENGINEER
                    FIELDENGINEER_ID
                    PM_COST
                    PM_ITEM_START_DATE
                    PM_ITEM_DUE_DATE
                    PM_ITEM_STATUS
                    PM_ITEM_COMPLETED_DATE
                    COMPLETED_BY
                    DEFAULT_PM_VENDOR_ID
                    DEFAULT_PM_VENDOR_NAME
                    INCLUDED_IN_PMLIST
                    PM_ITEM_ACTION
                    LAST_UPDATED_BY
                    LAST_UPDATED_DATE
                    LOCATION_PRIORITY
                    EQUIPMENT_STATUS
                    ACTIVTY_TRACKER
                    PO_ITEM_ID
                    DESCRIPTION
                    TOTAL_COST
                    SCHEDULED_DATE
                    PM_LIST_ITEM_UUID
                    PM_TEMPLATE_ID
                    PM_TMPLT_ATTR_NEW_VALUE_SENT
                    PM_TMPLT_ATTR_ID
                    PM_TMPLT_ATTR_NAME
                    PM_TMPLT_ATTR_OLD_VALUE
                    PM_TMPLT_ATTR_NEW_VALUE
                    PM_TMPLT_ATTR_FLD_LBLMAP
                    IS_MANDATORY
                    PM_TMPLT_ATTR_FLD_TYPE
        }
        inspectionDetailsItems{

            PO_STATUS
            PM_LIST_NAME
            BUYER
            BUYER_ID
            PS_ITEM_ID
            MMID
            MDG_ID
            SUB_MARKET
            PO_NUM
            MANAGER_ID
            MANAGER
            BUYER_EMAIL
            MANAGER_EMAIL
            PM_LIST_ITEM_ID
            PO_ITEM_ID 
            PM_LIST_ID
            LINE
            SCHEDULE
            PM_LOCATION_NAME
            PM_SITE_ID
            PM_LOCATION_UNID
            PS_LOCATION_ID
            LOCATION_MANAGER
            LOCATION_MANAGER_ID
            FIELDENGINEER
            FIELDENGINEER_ID
            PM_COST
            PM_ITEM_START_DATE
            PM_ITEM_DUE_DATE
            PM_ITEM_STATUS
            PM_ITEM_COMPLETED_DATE
            COMPLETED_BY
            EQUIPMENT_UNID
            SCHEDULED_DATE
            EQUIPMENT_TYPE
            OPSTRACKER_UNID
            INSP_COMMENTS
            INSP_STATUS
            INSP_COMPLETED_BY
            INSPECTION_UNID
            ATTRIBUTE_ID
            ATTRIBUTE_NAME
            ATTRIBUTE_VALUE
            ATTRIBUTE_CATEGORY
            ATTRIBUTE_SUBCATEGORY
            ATTRIBUTE_FIELDS
            ATTRIBUTE_COMMENTS
            LAST_UPDATED_BY
            LAST_UPDATED_TIME
            
        }
    }
}`

export const getGO95PoleInfo = `query ($subMarket: String!, $poleUnid: String!, $pmListItemId: String!, $pmListId: String!){
    getGO95PoleInfo(subMarket:$subMarket,poleUnid:$poleUnid, pmListItemId:$pmListItemId, pmListId: $pmListId ){
       attachmentList{
           recordtype
            source_universalid
            meta_universalid
            file_name
            file_size
            file_modifieddate
            category
            description
       }
       poleAttributeData {
          INSP_UNQ_ID
    PM_LIST_ID
    PM_LIST_ITEM_ID
    POLE_UNID
    INSPECTION_UNID
    INSP_TYPE
    INSP_STATUS
    INSP_COMPLETION_DATE
    INSP_TECH
    INSP_VENDOR_ID
    INSP_COMMENTS
    DEVIATION_FOUND
    LAST_UPDATED_BY
    LAST_UPDATED_DATE
    OPSTRCK_INSP_UNID
    DEVIATION_ID
    DEVIATION_NAME
    DEVIATION_OWNBYVZ
    DEVIATION_STATUS
    OTHER_DEVIATION_OWNERS
    DEVIATION_COMMENTS
    REMEDIATION
    REMEDIATION_LEVEL
    REMEDIATION_STATUS
    REMEDIATION_COMMENTS
    REMEDIATION_ACCPT
    REMEDIATION_ACCPT_BY
    REMEDIATION_ACCPT_DATE
    OPSTRCK_DEVIATION_UNID
    OPSTRCK_REMEDIATION_UNID
    ATTRIBUTE_ID
    ATTRIBUTE_NAME
    ATTRIBUTE_VALUE
       }
        go95DeviationsRefData {
            DEVIATION_ID
            DEVIATION_DESC
            DEVIATION_LABEL
            INSP_GROUP
            REMEDIATION_LEVEL
            REMEDIATION
            LAST_UPDATED_BY
            LAST_UPDATED_DATE
        }
        poleData{
                SITE_UNID
                SITE_ID
                SITE_NAME
                PS_LOCATION_ID
                SITE_PRIORITY
                SITE_STATUS
                SITE_TYPE
                SITE_ONAIR_DATE
                SITE_LATITUDE
                SITE_LONGITITUDE
                SITE_ADDRESS
                SITE_CITY
                SITE_STATE
                SITE_COUNTY
                SITE_ZIPCODE
                SWITCH
                SITE_MANAGER_ID
                SITE_MANAGER_NAME
                SWITCH_MANAGER_ID
                SWITCH_MANAGER_NAME
                SITE_TECHID
                SITE_TECH_NAME
                LAST_ACTIVITY_TRACKER
                LAST_UPDATED_BY
                LAST_UPDATED_DATE
                MARKET
                SUB_MARKET
                EQUIPMENT_TYPE
                EQUIPMENT_INFO {
                    pole_unid
                    structure_type
                    structure_owner
                    pole_type
                    structure_height
                    pole_row_private
                    last_pole_patrol_insp
                    next_pole_patrol_insp
                    last_pole_detailed_insp
                    next_pole_detailed_insp
        }
}
        
    }
}`

export const fetchNestQs = `query ($vendorId: Int!){
getNestEvaluationQs(vendorId:$vendorId){
   data {
    site_unid
    area
    region
    market
    switch
    site_name
    id
    reported_on
    reported_by
    bna_metauniversal_id
    status
    site_number
    state
    city
    }
}
}`
export const validatePONum = `query ($poId: String!, $submarket: String!, $psLocId: String!){
validatePONum(poId:$poId, submarket:$submarket,psLocId:$psLocId ){
   po_info 
}
}`
export const fetchNestDetails = `query ($unid: String!){
getNestModelDetails(unid:$unid){
   data {
work_activities 
alt_email_address 
vendor_details_id
alt_mobile_number 
alt_name 
alt_office_number 
biologist_birdtype 
biologist_follow_up 
is_biologist_determined 
rstr_biologist_name 
rstr_birdtype 
rstr_comments 
rstr_groundaccess
rstr_isrestricted
rstr_toweraccess
meta_universalid
cfd_ps_loc 
address
cfd_sitearea 
city
county
region
site_name
user_id
nest_removal_permit_req
expiration_date
evaluation_date
rstr_locked
updated_on
rstr_follow_up
site_number
state
site_unid
zip
switch
field_email_address
field_mobile_number 
field_contact_name
field_office_number
antenna_site_support 
current_bird_activity
nest_distance 
disturbance_constant_noises
disturbance_ground_vibration
disturbance_noise
disturbance_human_activity 
reported_by
reported_on
type_of_ground_work
current_land_use 
lat
long
userid
created_on
is_owned 
owner_comment 
rstr_log 
structure_type 
other_structure_type
status 
status_ack_by 
status_ack_date 
status_closed_by 
status_closed_date 
status_in_progress_by 
status_in_progress_date 
status_po_req_by 
status_po_req_date 
is_vapp_permission
structure_height 
duration_of_time
vendor_email 
vendor_id 
vendor_name 
work_desc
work_delayed
work_type 
files
    }
}
}`

export const updateQuestionnaire = `mutation ($loginId: String!,$questionnaireInput: questionnaireInput!,$siteUnid: String!){
updateQuestionnaire(loginId:$loginId,input:$questionnaireInput,siteUnid:$siteUnid){
    message
}
}`

export const updateQuestionnaireAttachments = `mutation ($loginId: String!,$nestModelDetailsObjInput: nestModelDetailsObjInput!,$siteUnid: String!){
    updateQuestionnaireAttachments(loginId:$loginId,input:$nestModelDetailsObjInput,siteUnid:$siteUnid){
        message
    }
    }`

export const fetchAttachmentContent = `query ($unid: String!){
        getAttachmentContent(unid:$unid){
        data{
            BIRD_NEST_DETAILS_ID 
            ATTACHMENT_NAME
            ATTACHMENT_SIZE
            ATTACHMENT_TYPE
            CREATED_ON
            MODIFIED_ON
            FILE_CONTENT
            BNA_ATTACHMENTS_ID
            BNA_METAUNIVERSAL_ID
        }
        }
        }`
   
export const fetchSearchedSites = `query ($vendorId: Int!, $search:String!, $year:String!){
    getSearchedSites(vendorId:$vendorId, search:$search, year:$year){
       searchResults {
                    PM_LIST_ITEM_ID
                    PM_LIST_ID
                    PM_LOCATION_NAME
                    SITE_ID
                    PS_LOCATION_ID
                    PM_ITEM_UNID
                    PM_COST
                    PRICE
                    LINE
                    SCHEDULE
                    ITEM_LINE_STATUS
                    LINE_SCH_MATCH_STATUS
                    LINE_RECV_STATUS
                    PM_ITEM_START_DATE
                    PM_ITEM_DUE_DATE
                    PM_ITEM_STATUS
                    PM_ITEM_COMPLETED_DATE
                    COMPLETED_BY
                    UPDATE_ACTION
                    LAST_UPDATED_BY
                    LAST_UPDATED_DATE
                    PO_NUM
                    PM_TYPE_NAME
                    PM_LIST_NAME
                    COMMENTS
                    PO_ITEM_ID
                    DESCRIPTION
                    IS_VENDOR_REQUESTED
                    IS_COMPLETED
                    EQUIPMENT_UNID
                    INSPECTION_TYPE
FIRE_ZONE_SECTOR
        }
    }
}`

export const fetchPendingItemsForUpdate = `query ($pmListIds: String!,$pmType: String){
    getPendingItemsForUpdate(pmListIds: $pmListIds,pmType: $pmType){
        listItems {
            INSP_STATUS
                    PO_NUM
                    PM_LIST_ITEM_ID
                    PM_LIST_ID
                    PM_LOCATION_NAME
                    PM_SITE_ID
                    SITE_CITY
                    SITE_COUNTY
                    FIRE_ZONE_SECTOR
                    PO_ITEM_DESCRIPTION
                    PM_LOCATION_STATUS
                    PM_LOCATION_UNID
                    PS_LOCATION_ID
                    PM_LOCATIONGRP
                    SWITCH_NAME
                    LOCATION_MANAGER
                    FIELDENGINEER
                    PM_COST
                    PM_ITEM_START_DATE
                    PM_ITEM_DUE_DATE
                    PM_ITEM_STATUS
                    PM_ITEM_COMPLETED_DATE
                    COMPLETED_BY
                    DEFAULT_PM_VENDOR_ID
                    DEFAULT_PM_VENDOR_NAME
                    INCLUDED_IN_PMLIST
                    LAST_UPDATED_BY
                    LAST_UPDATED_DATE
                    LOCATION_MANAGER_ID
                    FIELDENGINEER_ID
                    PM_EQUIPMENT_MAKER
                    PM_LOCATION_ONAIR_DATE
                    LOCATION_PRIORITY
                    EQUIPMENT_STATUS
                    PM_ITEM_ACTION
                    PM_LOCATION_CALLOUTZONE
                    DESCRIPTION
                    SCHEDULED_DATE
                    TOTAL_COST
                    PO_ITEM_ID
                    EQUIPMENT_UNID,
                    MDG_ID
        }


    }
}`

export const fetchDraftGridDetails = `query ($pmListIds: String!, $isGo95:Boolean!, $isTower:Boolean!){
    getDraftGridDetails(pmListIds: $pmListIds, isGo95:$isGo95, isTower:$isTower){
        listItems {
            PM_LIST_ITEM_ID_PS
                    INSP_STATUS
                    PM_LIST_ITEM_ID
                    PM_LIST_ID
                    PM_LOCATION_NAME
                    PM_SITE_ID
                    PM_LOCATION_STATUS
                    PM_LOCATION_UNID
                    PS_LOCATION_ID
                    PM_LOCATIONGRP
                    SWITCH_NAME
                    LOCATION_MANAGER
                    FIELDENGINEER
                    PM_COST
                    PM_ITEM_START_DATE
                    PM_ITEM_DUE_DATE
                    PM_ITEM_STATUS
                    PM_ITEM_COMPLETED_DATE
                    COMPLETED_BY
                    DEFAULT_PM_VENDOR_ID
                    DEFAULT_PM_VENDOR_NAME
                    INCLUDED_IN_PMLIST
                    LAST_UPDATED_BY
                    LAST_UPDATED_DATE
                    LOCATION_MANAGER_ID
                    FIELDENGINEER_ID
                    PM_EQUIPMENT_MAKER
                    PM_LOCATION_ONAIR_DATE
                    LOCATION_PRIORITY
                    EQUIPMENT_STATUS
                    PM_ITEM_ACTION
                    PM_LOCATION_CALLOUTZONE
                    DESCRIPTION
                    SCHEDULED_DATE
                    TOTAL_COST
                    PO_ITEM_ID
                    PO_ITEM_DESCRIPTION
                    EQUIPMENT_UNID
                    FIRE_ZONE_SECTOR
                    INSPECTION_TYPE
        }


    }
}`


export const fetchPmListDetailsByVendorId = `query ($vendorId: String!, $year: String!){
    getPmListDetailsByVendorId(vendorId: $vendorId, year: $year){
        pmListItemsByMdgId {
                        SUBMARKET
                        PO_NUM
                        PM_LIST_NAME
                        MANAGER
                        BUYER
                        PM_TYPE
                        PEOPLESOFT_LOCATION_ID
                        VENDOR_MDGID
                        VENDOR_ID
                        PM_LIST_STATUS
                        PO_STATUS
                        SITE_NAME
                        SITEID
                        MDGLC
                        COST
                        LINE
                        LINE_STATUS
                        DUE_DATE
                        COMPLETED_DATE
                        COMPLETED_BY
                        INVOICINGOOS
        }


    }
}`

export const fetchPmGridDetails = `query ($pmListIds: String!){
    getPmGridDetails(pmListIds: $pmListIds){
        pmlistitems {
                    PM_LIST_ITEM_ID
                    PM_LIST_ID
                    PM_LOCATION_NAME
                    SITE_ID
                    PS_LOCATION_ID
                    PO_ITEM_ID
                    DESCRIPTION                        
                    PM_COST
                    PRICE
                    MDG_ID
                    MMID
                    LINE_ID
                    LINE_NUMBER
                    LINE
                    SCHEDULE
                    ITEM_LINE_STATUS
                    LINE_SCH_MATCH_STATUS
                    LINE_RECV_STATUS
                    PM_ITEM_START_DATE
                    PM_ITEM_DUE_DATE
                    SCHEDULED_DATE
                    PM_ITEM_STATUS
                    PM_ITEM_COMPLETED_DATE
                    COMPLETED_BY
                    LAST_UPDATED_BY
                    LAST_UPDATED_DATE
                    UPDATE_ACTION
                    PM_ITEM_UNID
                    COMMENTS
                    INVOICINGOOS
        }


    }
}`
export const getAuditDetails = `query ($pmListItemId: String!){
    getAuditDetails(pmListItemId: $pmListItemId){
        auditLogs {
           INSP_HISTORY_ID
  PM_LIST_ID
  PM_LIST_ITEM_ID
  INSP_UNID
  FIELD_NAME
  OLD_VALUE
  NEW_VALUE
  ACTION
  LAST_UPDATED_BY
  LAST_UPDATED_DATE         
        }


    }
}`
export const getFileDataForGO95 = `query ($loginId: String!, $unid: String!, $name:String!){
    getFileDataForGO95(loginId:$loginId, unid: $unid, name: $name){
        data


    }
}`


export const fetchTowerInspItems = `query ($pmTypeId: String, $submarket: String, $pmListItemId: String,$unid: String,$pmListId: String){
getTowerInspItems(pmTypeId: $pmTypeId, submarket: $submarket,pmListItemId: $pmListItemId,unid: $unid,pmListId: $pmListId){
    output{
        towerAttributeData{
            PM_LIST_ITEM_ID
            PM_LIST_ID
            MDG_ID
            LINE
            SCHEDULE
            PM_LOCATION_NAME
            PM_LOCATION_UNID
            PS_LOCATION_ID
            LOCATION_MANAGER
            LOCATION_MANAGER_ID
            FIELDENGINEER
            FIELDENGINEER_ID
            PM_COST
            PM_ITEM_START_DATE
            PM_ITEM_DUE_DATE
            PM_ITEM_STATUS
            PM_ITEM_COMPLETED_DATE
            COMPLETED_BY
            EQUIPMENT_UNID
            SCHEDULED_DATE
            EQUIPMENT_TYPE
            OPSTRACKER_UNID
            INSP_COMMENTS
            INSP_STATUS
            INSP_COMPLETED_BY
            INSPECTION_UNID
            ATTRIBUTE_ID
            ATTRIBUTE_NAME
            ATTRIBUTE_VALUE
            ATTRIBUTE_CATEGORY
            ATTRIBUTE_SUBCATEGORY
            ATTRIBUTE_FIELDS
            ATTRIBUTE_COMMENTS
            LAST_UPDATED_BY
            LAST_UPDATED_TIME
            }
    towerAttributeDataFromOpstracker{
        cfd_gam_currentdoc_description 
        comments 
        crit_items_found 
        impacting_items_found 
        inspection_date 
        inspection_tech_name 
        meta_createdby 
        meta_createddate 
        meta_lastupdateby 
        meta_lastupdatedate 
        meta_universalid 
        obs_non_impacting 
        obs_pot_impacting 
        po_number 
        remediation_required 
        safety_climb_mfr 
        safety_climb_safe 
        site_universalid 
        status 
        struct_manufacturer 
        struct_model 
        tower_highest_point
        vendor_id 
        }
    attachmentList{
        recordtype
        source_universalid
        meta_universalid
        file_name
        file_size
        file_modifieddate
        category
        description
      }
    towerinspectionsRefData{

        PM_TYPE_ID
        ATTRIBUTE_TYPE
        ATTRIBUTE_CATEGORY
        ATTRIBUTE_NAME
        ATTRIBUTE_VALUE
    
    }
    towerData{

        SITE_UNID
        SITE_ID
        SITE_NAME
        PS_LOCATION_ID
        SITE_PRIORITY
        SITE_STATUS
        SITE_TYPE
        SITE_ONAIR_DATE
        SITE_LATITUDE
        SITE_LONGITITUDE
        SITE_ADDRESS
        SITE_CITY
        SITE_STATE
        SITE_COUNTY
        SITE_ZIPCODE
        SWITCH
        SITE_MANAGER_ID
        SITE_MANAGER_NAME
        SWITCH_MANAGER_ID
        SWITCH_MANAGER_NAME
        SITE_TECHID
        SITE_TECH_NAME
        LAST_ACTIVITY_TRACKER
        LAST_UPDATED_BY
        LAST_UPDATED_DATE
        MARKET
        SUB_MARKET
        EQUIPMENT_TYPE
        EQUIPMENT_INFO {

            tower_managed_by
            tower_struct_last_inspection
            tower_struct_inspect_by
            tower_struct_next_inspection
            towertype
            
        }
        }
    }
    
    
}
}`

export const fetchHVACPmModelAttDetails = `query ($pmType: String,$unid: String){
getHVACPmModelAttDetails(pmType: $pmType,unid:$unid){
    
    pmInspectionData{
        hvacs{
            hvac_unit_id
            unit_size
            refrigerant
            quantity
            quantity_units
            model
            comments
            unit_type
            serial_no
            eco_installed
            no_eco_reason
        }
        attributeResult{
            PM_TMPLT_ATTR_NAME
            PM_TYPE_ID
            IS_MANDATORY
            PM_TMPLT_ATTR_ID
            PM_TMPLT_ATTR_FLD_VALUE
            BACKEND_SYS_UPD
            PM_TMPLT_ATTR_FLD_LBLMAP
            PM_TMPLT_ATTR_FLD_TYPE
            PM_TEMPLATE_ID
            PM_TMPLT_ATTR_FLD_GROUP
        }
    }


    }
}`
export const fetchPmModelAttDetails = `query ($pmType: String,$po_item_id: String){
getPmModelAttDetails(pmType: $pmType,po_item_id:$po_item_id){
    
                PM_TMPLT_ATTR_NAME
                IS_MANDATORY
                    PM_TMPLT_ATTR_ID
                    PM_TMPLT_ATTR_FLD_VALUE
                    BACKEND_SYS_UPD
                    PM_TMPLT_ATTR_FLD_TYPE
                    PM_TEMPLATE_ID
                    PM_TMPLT_ATTR_FLD_GROUP
                    PM_TMPLT_ATTR_FLD_LBLMAP


    }
}`

export const getGenTanknfoForUnid = `query($unid: String!){
                                   getGenTanknfoForUnid(unid:$unid){
                                       code
                                       message
                                       genTank{ 
                                            gen_meta_universalid
                                            gen_emis_id
                                            gen_name
                                            serialnum
                                            manufacturer
                                            model
                                            description
                                            gen_size
                                            genmodel_fuel_type
                                            tank1_size
                                            tank2_size
                                            tank3_size
                                            tank4_size
                                            tank5_size
                                            tank6_size
                                            tank7_size
                                            tank8_size
                                            current_reading
                                            genrun_delta_time
                                            oil_level
                                            ac_voltage
                                            ac_current

                                        }
                                    }
                                }`

export const fetchTemplateDataGen = `mutation($postRequestGen:postRequestGen!){
                            getTemplateDataGen(input:$postRequestGen) {
                                    templateName
                                    templateType
                                    templateData
                                    
                                }
                            }`
export const fetchTemplateData = `mutation($postRequest:postRequest!){
                            getTemplateData(input:$postRequest) {
                                    templateName
                                    templateType
                                    templateData
                                    
                                }
                            }`

export const uploadFiles = `mutation($uploadFilesInput:uploadFilesInput!){
                            uploadFiles(input:$uploadFilesInput) {
                                    result
                                    
                                }
                            }`
                           
export const uploadFilesGO95 = `mutation($uploadFilesInputGO95:uploadFilesInputGO95!, $unid:String!){
                            uploadFilesGO95(input:$uploadFilesInputGO95, unid:$unid) {
                                fileResp{
                                    title
                                    status
                                    response
                                }
                        
}
                            }`

export const submitInspectionInfo = `mutation($InspectionInfoInput:InspectionInfoInput!){
                            submitInspectionInfo(input:$InspectionInfoInput) {
                                    
opstrackerResponse{
  cfd_deviations{
inspection_unid
}
meta_universalid
}
vpInsertResponse {
RESULT_MSG
}

                                    
                                }
                            }`
export const submitTowerInsp = `mutation($TowerInspectionInfoInput:TowerInspectionInfoInput!){
submitTowerInsp(input:$TowerInspectionInfoInput) {
                                        
  opstrackerResponse{
      
    meta_universalid
}
  vpInsertResponse {
    RESULT_MSG
  }

                                              
                                    }
                                }`

export const generateInspPDFHvac = `mutation($hvacInspItemsInput:hvacInspItemsInput, $type:String ){
                        generateInspPDFHvac(input:$hvacInspItemsInput, type:$type) {
                                                                          output{
                                                                            pdfFiles
                                                                             {
                                                                                result
                                                                             }
                                                                        }                           
                                                                                                            }
                                                                                                        }`
export const generateInspectionPDFGo95 = `mutation($go95InspItemsInput:go95InspItemsInput, $type:String ){
generateInspPDFGO95(input:$go95InspItemsInput, type:$type) {
                                      output{
                                        pdfFiles
                                         {
                                            result
                                         }
                                    }                           
                                                                        }
                                                                    }`
export const generateInspPDFGen = `mutation($genInspItemsInput:genInspItemsInput, $type:String ){
generateInspPDFGen(input:$genInspItemsInput, type:$type) {
                                    output{
                                    pdfFiles
                                        {
                                        result
                                        }
                                }                           
                                                                    }
                                                                }`
export const generateInspPDF = `mutation($towerInspItemsInput:towerInspItemsInput, $type:String ){
                                    generateInspPDF(input:$towerInspItemsInput, type:$type) {
                                      output{
                                        pdfFiles
                                         {
                                         title
                                         status
                                         response
                                         }
                                    }                           
                                                                        }
                                                                    }`

export const submitPMDetails = `mutation($PMDetailsInput:PMDetailsInput!){
                            submitPMDetails(input:$PMDetailsInput) {
                                    RESULT_MSG
                                    
                                }
                            }`

export const schedDateUpdate = `mutation($updateScheduleDatereq:updateScheduleDatereq!, $refName:String!){
                            updateScheduleDate(input:$updateScheduleDatereq, refName:$refName) {
                                    RESULT_MSG
                                    
                                }
                            }`
export const createPMList = `mutation($createPMListInput:createPMListInput!, $refName:String!, $feGrouped:Boolean!){
                            createPMList(input:$createPMListInput, refName:$refName, feGrouped:$feGrouped) {
                                    RESULT_MSG
                                    
                                }
                            }`

export const getHvacInfoForUnid = `query($unid:String!,$type: String!){
                                    getHvacInfoForUnid(unid:$unid,type:$type){
                                        code
                                        message
                                        hvacs{
                                            hvac_unit_id
                                            unit_size
                                            refrigerant
                                            quantity
                                            quantity_units
                                            model
                                            comments
                                            unit_type
                                            serial_no
                                            eco_installed
                                            no_eco_reason
                                            economizer{
                                                type
                                                install_date
                                                functioning
                                            }
                                            install_date
                                            manufacture_date
                                            create_date
                                            update_date
                                            created_by
                                            updated_by
                                            hvac_pic_url
                                        }
                                    }
                                }`
export const getFileDataForPmlist = `query($pmListId:Int!,$pmListItemId:Int!, $updateType: String!, $name:String!, $isCommonFile: String!){
                                    getFileDataForPmlist(pmListId:$pmListId, pmListItemId:$pmListItemId, updateType:$updateType, name:$name, isCommonFile: $isCommonFile){
                                    result{
                                        PM_ATTACHMENTS_ID
                                        PM_LIST_ID
                                        PM_LIST_ITEM_ID
                                        PM_LOCATION_UNID
                                        PM_FILE_CATEGORY
                                        PM_FILE_NAME
                                        PM_FILE_TYPE
                                        PM_FILE_SIZE
                                        PM_FILE_DATA
                                        LAST_UPDATED_BY
                                        LAST_UPDATED_DATE
                                        }
                                        
                                    }
                                }`
export const getTrainingMaterial = `query {
                                    getTrainingMaterial{
                                        trainingList{
                                          UNQ_SEQ_ID
                                          TRAINING_NAME
                                          TRAINING_CATEGORY
                                          TRAINING_TYPE
                                          TRAINING_FILENAME
                                          TRAINING_FILETYPE
                                          TRAINING_FILELOCATION
                                          TRAINING_MATERIALENABLED
                                          LAST_UPDATED_BY
                                          LAST_UPDATED_DATE
                                    }
                                }
                            }`
export const getCompletedAttDetails = `query($pmListId:Int!){
                                    getCompletedAttDetails(pmListId:$pmListId){
                                    attributeData{
                                            PM_ITEM_RESULT_ID
                                            PM_TEMPLATE_ID
                                            PM_TMPLT_ATTR_NEW_VALUE_SENT
                                            PM_TMPLT_ATTR_ID
                                            PM_TMPLT_ATTR_NAME
                                            PM_TMPLT_ATTR_OLD_VALUE
                                            PM_TMPLT_ATTR_NEW_VALUE
                                            PM_TMPLT_ATTR_FLD_TYPE
                                            PM_TMPLT_ATTR_FLD_LBLMAP
                                        }
                                    attachmentsData{
                                            PM_LIST_ID
                                            PM_LIST_ITEM_ID
                                            PM_ATTACHMENTS_ID
                                            PM_FILE_CATEGORY
                                            PM_FILE_NAME
                                            PM_FILE_TYPE
                                        }
                                    sitesInfo{
                                        address
                                        city
                                        county
                                        equipmentinfo{
                                            manufacturer
                                            install_date
                                            serial_number
                                            economizer_type
                                            unit_type
                                            unit_size
                                            model
                                            refrigerant
                                            hvac_unit_id
                                        }
                                        hvac_contact_phone
                                        hvac_controller_mfr
                                        hvac_controller_model
                                        hvac_controller_type
                                        latitude_decimal
                                        longitude_decimal
                                        manager_id
                                        manager_name
                                        meta_universalid
                                        mdg_id
                                        network_id
                                        ps_loc
                                        shelter_vendor
                                        site_callout_zone
                                        site_id
                                        site_name
                                        site_priority
                                        site_status
                                        site_type
                                        soa
                                        st
                                        switch
                                        switch_manager_id_1
                                        switch_manager_id_2
                                        switch_manager_name_1
                                        switch_manager_name_2
                                        tech_id
                                        tech_name
                                        vendorassignments{
                                            vendor_id
                                            vendor_name
                                            peoplesoft_id
                                            pm_category 
                                        }
                                        zip
                                    }
                                    submarketUnidData{
                                        PM_LIST_ID
                                        MARKET
                                        MANAGER_ID
                                        SUB_MARKET
                                        PM_ITEM_UNID
                                    }
                                        
                                    }
                                }`

export const getReceivedSitesVendor = `query ( $vendorId: Int!){
getReceivedSitesVendor( vendorId: $vendorId){
    count
    receivedSitesData{
        PM_LIST_NAME
        PO_NUM
        VENDOR_ID 
        VENDOR_NAME 
        VENDOR_PSID
        PM_LIST_STATUS
        PM_LIST_ID
        PM_LIST_ITEM_ID
        PM_LOCATION_NAME
        SITE_ID
        PS_LOCATION_ID
        LINE
        PM_COST
        ITEM_STATUS
        DUE_DATE
        START_DATE
        COMPLETED_DATE
        COMPLETED_BY 
      }
}
}`
export const generatePDFData = `query{
generatePDFData
}`
export const hvacInfoToOpstracker=`mutation($unid : String!, $input: hvac_controller_input!){
    hvacInfoToOpstracker(unid:$unid, input: $input){
        updatedData
    }
}`