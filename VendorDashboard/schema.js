export const getWorkorder = `query ($loginId: String!, $startdate: String!,$enddate: String!, $mdgId: String){
    getVendorWorkOrder(loginId:$loginId, startdate:$startdate,enddate :$enddate, mdgId :$mdgId){                                    
        errors
        vendor_wo_details{
            events
            workorder_id
            work_type
            work_scope
            requested_by
            requested_by_name
            requested_date
            area
            region
            market
            work_order_appr_status
            work_order_appr_by
            work_order_appr_date
            approved_by_name
            vendor_name
            workorder_status
            next_step
            po_number
            po_status
            po_rcpt_status
            approved_total
            bypass_approval
            bypass_quotes
            work_due_date
            work_award_date
            priority
            vendor_portal_status
            meta_universalid
            site_type
            work_accepted_date
            work_completed_date
            quote_statuses
            site_id
            site_name
            switch
            site_unid
            tech_id
            techmanager_id
            techdirector_id
            techmanager_name
            sitemanager_name
            root_drive
            vendor_status
            vendor_status_by
            vendor_status_date
            is_donor
            quoteitems{
                workorder_quote_id
                vendor_id
                workorder_id
                vendor_email
                status
                status_date
                status_by
                quote_request_email_date
                quote_reply_recv_date
                quote_total
                quote_labor_total
                quote_materials_total
                quote_vendor_comments
                quote_vzw_comments
                quote_log
                meta_universalid
                meta_createddate
                meta_createdby
                meta_lastupdatedate
                meta_lastupdateby
                actual_fuel_total
                actual_labor_total
                actual_materials_total
                actual_total
                quote_fuel_total
                quote_marked_completed
                decline_history_json
            }
            work_declined_count
            quote_decline_count
             trouble_ticket_details{
                wo_id
                ticket_trouble_type
                ticket_created_on
            }
            work_urgency
        }
        user_dashboard{
            requested{
                    name
                    data
                    color
                    woType
            }
            quote{
                name
                data
                color
                woType
            }
            work{
                name
                data
                color
                woType
            }
            mdurequested{
                name
                    data
                    color
                    woType
            }
            mduquote{
                name
                data
                color
                woType
            }
            mduwork{
                name
                data
                color
                woType
            }
            rma{
                name
                data
                color
                woType
            }
            history{
                name
                data
                woType
            }                                      
        }
        WorkType{
            label
            value
        }
        dashboard{
            quote_pending {
            completedOnTime
            overDueCompleted
            totalAmount
            sites{
                name
                workorder
            }
            dueToday
            overDue
            dueThisWeek
            month{
                month
                cost
            }
            workorder
            }
            quote_received{
            completedOnTime
            overDueCompleted
            totalAmount
            sites{
                name
                workorder
            }
            dueToday
            overDue
            dueThisWeek
            month{
                month
                cost
            }
            workorder                                           
            }
            quote_approved{
            completedOnTime
            overDueCompleted
            totalAmount
            sites{
                name
                workorder
            }
            dueToday
            overDue
            dueThisWeek
            month{
                month
                cost
            }
            workorder                                           
            }
            po_requested{
                completedOnTime
                overDueCompleted
                totalAmount
                sites{
                    name
                    workorder
                }
                dueToday
                overDue
                dueThisWeek
                month{
                    month
                    cost
                }
                workorder                                           
            }
            awaiting_po{
                completedOnTime
                overDueCompleted
                totalAmount
                sites{
                    name
                    workorder
                }
                dueToday
                overDue
                dueThisWeek
                month{
                    month
                    cost
                }
                workorder                                           
            }
            work_pending{
            completedOnTime
            overDueCompleted
            totalAmount
            sites{
                name
                workorder
            }
            dueToday
            overDue
            dueThisWeek
            month{
                month
                cost
            }
            workorder                                           
            }
            work_completed{
            completedOnTime
            overDueCompleted
            totalAmount
            sites{
                name
                workorder
            }
            dueToday
            overDue
            dueThisWeek
            month{
                month
                cost
            }
            workorder                                           
            }
            work_accepted{
            completedOnTime
            overDueCompleted
            totalAmount
            sites{
                name
                workorder
            }
            dueToday
            overDue
            dueThisWeek
            month{
                month
                cost
            }
            workorder                                           
            }
            completed{
            completedOnTime
            overDueCompleted
            totalAmount
            sites{
                name
                workorder
            }
            dueToday
            overDue
            dueThisWeek
            month{
                month
                cost
            }
            workorder                                           
            }
        }
        rma_data{
            RMA_DETAILS_ID
            SITE_UNID
            STATUS
            ENODEB_SEC_CAR
            OEM_VENDOR
            TAC_INTERNAL_REF
            TAC_INTERNAL_REF_NO
            CATS_RMA
            PART_CODE
            ASSET_CODE
            TRACKING_NO
            VENDOR_RA_NO
            ALT_SHIPPING_ADDR
            LDC_ADDR
            BU_LOCATION
            RMA_RETURN_REASON_ID
            RMA_TROUBLE_DESCRIPTION_ID
            OEM_FAILURE_CODE
            SOFTWARE_RELEASE
            FAILURE_DATE
            REPLACEMENT_DATE
            FAILURE_MODE_ANALYSIS_REQ
            WO_ID
            VWRS_ID
            ACTIVATION_DATE
            RMA_SLA_OPTIONS
            REQUIRED_DELIVERY_DATE
            WARRANTY
            RMA_SWAP_DATE
            REPLACEMENT_SERIAL_NO
            RETURN_SHIP_DATE
            TIMEZONE
            CREATED_BY
            CREATED_ON
            MODIFIED_ON
            COMMENTS
            UPDATED_BY
            CANCELLED_BY
            PS_LOCATION_CODE
            SHIP_LOCATION_ADDR
            REQUESTED_DELIVERY_DATE
            REQUESTED_SHIP_DATE
            TECH_PHONE
            ALT_STREET_ADDR
            ALT_CITY
            ALT_ZIP_CODE
            FUZE_PROJECT_ID
            ALT_STATE
            HC_REQUEST_ID
            MDG_ID
            LOCUS_ID
            UUID
            IS_DRAFT
            SWITCH_UNID
            IS_DEFAULT_ADDRESS
            RMA_PART_CODE
            PART_CODE_DESCRIPTION
            FUZE_RETURN_REQUEST_NUMBER
            FUZE_CREATED
            PS_LOCATION_NAME
            REPLENISHMENT_REQUIRED
            FUZE_STATUS_CODE
            FUZE_STATUS
            ALTERNATE_EMAIL
            FUZE_ERRORS
            RMA_SOURCE
            VP_USER_ID
            VP_USER_NAME
            VP_USER_EMAIL
            VP_FAILURE_TYPE
            S4_ERRORS
            ERRORS_LOG
            SUCCESS_LOG
            S4_OEM_APPROVAL_STATUS
            S4_FORWARD_RMA_STATUS
            S4_OVERALL_RMA_STATUS
            S4_FORWARD_TRACKING_ID
            S4_REVERSE_TRACKING_ID
            S4_FORWARD_DISPOSITION
            S4_SAP_RETURN_REQUEST
            S4_ESA_SENT_TIME
            S4_CREATED
            ALT_STREET_ADDR2
            NOWOID_REASON
            DELIVERY_SCANNED_ON_TIME
            LAST_BUSINESS_DAY_TO_RECEIVE
            DELIVERY_TEXT_MSG_SENT
            IS_5GHR_RMA
            LASTBUSINESSDAY
        }
    }
}`


export const submitFPQuoteInvoice = `mutation($loginId:String!, $submitFPQuoteInvoiceInp:submitFPQuoteInvoiceInp!, $quoteUnid:String!,$quoteAction:String!){
submitFPQuoteInvoice(loginId:$loginId,input:$submitFPQuoteInvoiceInp,quoteUnid:$quoteUnid, quoteAction:$quoteAction ) {
        woInfo{
            workorder_quote_id
        }
    }  
}`
export const submitFPInvoice = `mutation($loginId:String!, $submitFPInvoiceInp:submitFPInvoiceInp!, $quoteUnid:String!,$quoteAction:String!){
    submitFPInvoice(loginId:$loginId,input:$submitFPInvoiceInp,quoteUnid:$quoteUnid, quoteAction:$quoteAction ) {
                                    woInfo{
                                        workorder_quote_id
                                    }
                                }  
                            }`





export const updateWOStatus = `mutation($loginId:String!, $wo_status_change_input:wo_status_change_input!){
    updateWOStatus(loginId:$loginId,input:$wo_status_change_input) {
        code
        message
    }  
}`




export const submitFilesvwrs = `mutation($loginId:String!, $file_inputvwrs:file_inputvwrs!){
    submitFilesvwrs(loginId:$loginId, input:$file_inputvwrs) {
        message
        uploaded{
            accessed
            file_name
            file_size
            file_url
            modified 
        }
        failed{
            code
            message
            file_name
        }
    }  
}`
export const fileList = `query ($loginId:String!, $unid: String, $attachment_type: String){
getAttachmentsList(loginId:$loginId, unid:$unid, attachment_type:$attachment_type){
    attachments{
        source_universalid
        meta_universalid
        file_name
        file_path
        file_path_full
        file_size
        file_modifieddate
        category
        description}}}`
export const downloadFile = `query ($loginId:String!,$unid: String!,$file_name: String!, $attachment_id: String!, $category: String!){
    downloadFile(loginId:$loginId,unid:$unid,file_name:$file_name,attachment_id:$attachment_id, category:$category){
            file_data
            file_name}}`
export const downloadVSFile = `query ($file_Id: String!){
                downloadVSFile(file_Id:$file_Id){
                        file_data
                        file_name}}`
export const getGeneratorInfoForUnid = `query($unid: String!,$type: String!){
           getGeneratorInfoForUnid(unid:$unid,type:$type){
               code
               message
               generators{
                    generator_id
                    siterra_id
                    generator_name
                    gen_serial_no
                    gen_comments
                    gen_manufacture_date
                    gen_fuel_type
                    gen_type
                    gen_location
                    gen_use
                    gen_in_out
                    gen_size
                    gen_install_date
                    gen_startup_date
                    gen_create_date
                    gen_update_date
                    gen_created_by
                    gen_updated_by
                    gen_status
                    engine_manufacturer
                    engine_model
                    engine_power
                    engine_manufacture_date
                    engine_serial_no
                    gen_field_permit
                    gen_hour_meter_present
                    gen_in_service
                    gen_third_party
                    gen_vzw_maintained
                    gen_vzw_fueled
                    gen_vzw_permit
                    gen_runtime
                    gen_annual_runtime
                    gen_run_freq
                    gen_nert_limit_imposed
                    gen_nert_limit_type
                    gen_nert_limit
                    gen_spec{
                        manufacturer
                        model
                        fuel_type
                        gen_size
                        fuel_rt_25
                        fuel_rt_50
                        fuel_rt_75
                        fuel_rt_100
                        status
                    }
                    generator_pic_url
                    fuel_tanks{
                        fuel_tank_id
                        fuel_type
                        tank_type
                        capacity
                        install_date
                    }}}}`
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
                }
            }
        }`

export const submitgenreadingsrequest = `mutation($gen_reading_request:gen_reading_request!){
        submitGenReadings(input:$gen_reading_request) {
            code
            message
        }
    }`

export const getVendorDataByStatusFilter = `query($loginId:String!, $vendorId:String, $startdt:String, $enddt:String, $statusList:String){
                getVendorDataByStatusFilter(loginId:$loginId,vendorId:$vendorId, startdt:$startdt, enddt:$enddt, statusList: $statusList){
                    listItems{
                        workorder_id
                        work_type
                        work_scope
                        requested_by
                        requested_by_name
                        requested_date
                        work_order_appr_status
                        work_order_appr_by
                        work_order_appr_date
                        approved_by_name
                        vendor_name
                        workorder_status
                        next_step
                        po_number
                        po_status
                        po_rcpt_status
                        approved_total
                        bypass_approval
                        bypass_quotes
                        work_due_date
                        work_award_date
                        priority
                        vendor_portal_status
                        meta_universalid
                        site_type
                        work_accepted_date
                        work_completed_date
                        quote_statuses
                        site_id
                        site_name
                        switch
                        site_unid
                        tech_id
                        techmanager_id
                        techdirector_id
                        techmanager_name
                        sitemanager_name
                        vendor_status
                        vendor_status_by
                        vendor_status_date
                        quoteitems{
                            workorder_quote_id
                            vendor_id
                            workorder_id
                            vendor_email
                            status
                            status_date
                            status_by
                            quote_request_email_date
                            quote_reply_recv_date
                            quote_total
                            quote_labor_total
                            quote_materials_total
                            quote_vendor_comments
                            quote_vzw_comments
                            quote_log
                            meta_universalid
                            meta_createddate
                            meta_createdby
                            meta_lastupdatedate
                            meta_lastupdateby
                            actual_fuel_total
                            actual_labor_total
                            actual_materials_total
                            actual_total
                            quote_fuel_total
                            quote_marked_completed
                        }
                    }
                }
            }`
export const getVendorWoByWorkOrderId = `query($loginId:String!,$workOrderId:String!, $vendorId: String){
            getVendorWoByWorkOrderId(loginId:$loginId,workOrderId:$workOrderId, vendorId:$vendorId){
                vendor_wo_details {
                    workorder_id
                    work_type
                    work_scope
                    requested_by
                    requested_by_name
                    requested_date
                    work_order_appr_status
                    work_order_appr_by
                    work_order_appr_date
                    approved_by_name
                    vendor_name
                    workorder_status
                    next_step
                    po_number
                    po_status
                    po_rcpt_status
                    approved_total
                    bypass_approval
                    bypass_quotes
                    work_due_date
                    work_award_date
                    priority
                    vendor_portal_status
                    meta_universalid
                    site_type
                    work_accepted_date
                    work_completed_date
                    quote_statuses
                    site_id
                    site_name
                    switch
                    site_unid
                    tech_id
                    techmanager_id
                    techdirector_id
                    techmanager_name
                    sitemanager_name
                    vendor_status
                    vendor_status_by
                    vendor_status_date
                    device_uts_id
                    quoteitems{
                        workorder_quote_id
                        vendor_id
                        workorder_id
                        vendor_email
                        status
                        status_date
                        status_by
                        quote_request_email_date
                        quote_reply_recv_date
                        quote_total
                        quote_labor_total
                        quote_materials_total
                        quote_vendor_comments
                        quote_vzw_comments
                        quote_log
                        meta_universalid
                        meta_createddate
                        meta_createdby
                        meta_lastupdatedate
                        meta_lastupdateby
                        actual_fuel_total
                        actual_labor_total
                        actual_materials_total
                        actual_total
                        quote_fuel_total
                        quote_marked_completed
                    }
                        trouble_ticket_details{
                wo_id
                ticket_trouble_type
                ticket_created_on
            }
            work_urgency
                }
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
export const getVendorWoByUnid = `query($unid:String!,$loginId:String!){
            getVendorWoByUnid(unid:$unid,loginId:$loginId){
                code
                message
                vendor_wo_details{
                    acct_contact
                    acct_email
                    actual_fuel_total
                    actual_labor_total
                    actual_materials_total
                    actual_total
                    approved_quoteid
                    approved_vendor_email
                    approved_vendor_id
                    cfd_approved_vendor_name
                    cfd_area
                    cfd_market
                    cfd_quote_vendorid_1
                    cfd_quote_vendorname_1
                    cfd_vwrs_nodes
                    cfd_quote_fueltotal_1
                    cfd_quote_labortotal_1
                    cfd_quote_materialstotal_1
                    cfd_quote_status_1
                    cfd_quote_decline_reason_1
                    cfd_quote_declined_by_1
                    cfd_quote_decline_datetime_1
                    cfd_quote_decline_history_json_1
                    cfd_quote_total_1
                    cfd_quote_vendorcomments_1
                    cfd_region
                    cfd_requested_by
                    cfd_site_tower_managed_by
                    cfd_site_towertypeid
                    cfd_workorder_quote_id_1
                    created_by_vendor_id
                    disaster_recovery
                    fuel_level
                    meta_createddate
                    meta_lastupdatedate
                    meta_universalid
                    mgr_email
                    po_due_date
                    po_number
                    po_status
                    po_received_status
                    pricing_matrix_eligible
                    pricing_matrix_cost_type
                    priority
                    requested_by
                    requested_date
                    requestor_email
                    requestor_phone
                    requestor_title
                    site_key
                    site_name
                    site_type
                    vendor_grade_comments
                    vendor_invoice_num
                    vendor_status
                    vendor_status_by
                    vendor_status_date
                    work_accepted
                    work_accepted_by
                    work_accepted_comments
                    work_accepted_date
                    work_award_date
                    work_completed_comments
                    work_completed_date
                    work_due_date
                    work_marked_completed
                    work_scope
                    work_type
                    workorder_id
                    workorder_status
                    workorder_status_by
                    workorder_status_date
                    s4_doc_num
                    s4_po_num
                    s4_po_status
                    s4_po_status_date
                    s4_pr_num
                    s4_releasecode
                    device_uts_id
                    wb360_id
                    invoicing_oos
                    work_completed_timestamp
                    work_pending_timestamp
                    source_system
                }
            }
        }`

export const submitworequest = `mutation($loginId:String!,$wo_request_input:wo_request_input!){
        submitWORequest(loginId:$loginId,input:$wo_request_input) {
            code
            message
            workorder_id
            quote_unid
        }
    }`

export const getEventsBySiteUnid = `query ($siteunid: String!){
getEventsBySiteUnid(siteunid:$siteunid){
data{
eventId
eventName
eventType
productCode
startDate
endDate
createdDate
createdBy
siteSurveyId
siteSurveyReferenceId
}
}}`
export const fetchEventDetails = `query ($vendorId: String!, $loginId: String!, $type:String){
getEventDetails(vendorId:$vendorId, loginId:$loginId, type:$type){
eventId
start
end
market
switchName
status
createdById
siteUnid
siteName
description
submarket
switchUnid
title
workId
workType
vendorCompanyName
vendorTechName
category
vendorId
siteNumber
files{
file_name
file_type
last_modified
file_size
file_Id
filename
}
comments{
comments
loginId
postedDate
loginName
fromSystem
}
}
}`
export const getCalenderEventsForSite = `query($startDate:String!,$endDate:String!,$siteUnid:String!){
getCalenderEventsForSite(startDate:$startDate,endDate:$endDate,siteUnid:$siteUnid){
status
message
data {
eventId
start
end
market
switchName
status
createdById
siteUnid
siteName
description
submarket
switchUnid
title
workId
workType
vendorCompanyName
vendorTechName
category
siteNumber
vendorId
autoCreatedKirkeRequest
files
comments
}
}
}`
export const getLatestOswDate = `query($work_order_id:String!){
getLatestOswDate(work_order_id:$work_order_id){
Osw_Date
}
}`
export const getConflictkirkeEventsForSite = `query($startDate:String!,$endDate:String!,$siteUnid:String!){
getConflictEventDetails(startDate:$startDate,endDate:$endDate,siteUnid:$siteUnid){
data{
name
eventId
businessEventId
start
end
market
switchName
status
createdById
siteUnid
siteName
description
submarket
switchUnid
title
workId
workType
vendorCompanyName
vendorTechName
category
siteNumber
vendorId
autoCreatedKirkeRequest
files
source
comments
conflictKirkeData{
uniqueElementsForRequestId{
ITEM_ID
NUMBER_OF_ITEMS_IN_CONFLICT
ITEM_STATUS
}
kirkeType 
categoryName
category
eventId
requestId
start
end 
status
} 
}

}
}`
export const fetchFixedPricingExistServ = `query ($loginId:String!, $unid:String!){
getFixedPricingExistServ(loginId:$loginId, unid:$unid ){
woInfo {
cfd_exp_proj_choices
cfd_gam_currentdoc_description
pricing_matrix_cost_type
cfd_lineitems{
name
value
}
device_uts_id
cfd_market
cfd_mgr_empid
cfd_mgr_userid
cfd_numlineitems
cfd_orig_meta_lastupdatedate
cfd_po_business_unit_choices
cfd_vwrs_nodes
cfd_quotes{
name
value
}
cfd_workorder_quotes{
name
value
}
cfd_region
cfd_requested_by
cfd_requested_date
cfd_requested_time
cfd_requestor_empid
cfd_site_acceptance_date
cfd_site_address
cfd_site_antenna_access
cfd_site_city
cfd_site_county
cfd_site_directions 
cfd_site_function
cfd_site_gate_combo
cfd_site_gate_combo2
cfd_site_groundskeeping_by_vzw
cfd_site_isrecentsite
cfd_site_latitude
cfd_site_longitude
cfd_site_man_lift_requirements
cfd_site_owned
cfd_site_ps_loc
cfd_site_soa
cfd_site_st
cfd_site_tower_managed_by
work_declined_history_json
cfd_site_towertypeid
cfd_site_zip
disaster_recovery
}
choices{
name
value
alias
}
}
}`
export const fetchFixedPricingServ = `query ($loginId:String!,$market:String!, $submarket:String!, $national:String!, $listname:String!, $worktype:String!, $costtype:String!, $sitetype:String!, $fixed:String!, $nonfixed:String!, $zipcode:String!, $matrix:String!, $nonmatrix:String!, $matrixeligible:String!){
getFixedPricingServ(loginId:$loginId,market:$market, submarket:$submarket, national:$national,listname:$listname, worktype:$worktype, costtype:$costtype, sitetype:$sitetype,fixed:$fixed, nonfixed:$nonfixed, zipcode:$zipcode, matrix:$matrix, nonmatrix:$nonmatrix, matrixeligible:$matrixeligible ){
fixedPriceMatrixData {
meta_universalid
market
submarket
listname
cost_type
site_type
ps_item_id
mmid
bid_unit
work_type
cost_category
service_type
unit
price_per_unit
long_description
is_matrix
pricing_fixed
service_cat
service_cat_sort
line_item_sort
zipcodes
}
}
}`





export const submitschedulerequest = `mutation($schedule_request_input:schedule_request_input!){
submitScheduleRequest(input:$schedule_request_input) {
code
message
autoCreatedKirkeRequestID
}
}`

export const updateschedulerequest = `mutation($update_schedule_request_input:update_schedule_request_input!){
updateScheduleRequest(input:$update_schedule_request_input) {
code
message
}
}`

export const getPendingWorkOrderDetails = `query($vendorId:Int!){
            getPendingWorkOrderDetails(vendorId:$vendorId){
           listItems{
                PM_LIST_ID
                PM_LOCATION_NAME
                PM_SITE_ID
                PM_LOCATION_UNID
                PM_ITEM_STATUS

        }
        }}`
export const uploadFilesWO = `mutation($uploadFilesInputWO:uploadFilesInputWO!, $unid:String!, $category:String!){
            uploadFilesWO(input:$uploadFilesInputWO, unid:$unid, category:$category) {
                fileResp{
                    title
                    status
                    response
                }
            }
    }`
export const WOTypes = `query($loginId:String!, $workType: String!){
                getWorkTypes(loginId:$loginId, workType: $workType){
                    types{
                        name
                        value
                        label: alias
                    }
                }
}`
export const logAction = `query($user_id: String!, $email: String, $vendor_id: String, $workorder_id: String, $market: String, $sub_market: String, $action: String!, $action_name: String, $action_option: String, $osw_id: String){
    logAction(user_id: $user_id, email: $email,  vendor_id: $vendor_id,workorder_id: $workorder_id,  market: $market, sub_market: $sub_market, action: $action, action_name: $action_name, action_option: $action_option, osw_id: $osw_id)
}`

export const updateVendorStatus =`mutation($loginId:String!,$input: updVendorStatus!, $quoteId:String, $status:String){
updateVendorStatus(loginId:$loginId,input: $input, quoteId :$quoteId, status:$status ){
woInfo
}
     }`
export const bulkUpdatePendingAck =`mutation($input: bulkUpdatePendingAckInput){
bulkUpdatePendingAck(input: $input){
message
}
}`
export const bulkUpdatePendingAckFromRedis = `query($userId:String, $vendorId:Int){
bulkUpdatePendingAckFromRedis(userId :$userId, vendorId:$vendorId){
redisData
}
}`

export const updateVendorStatusComments = `mutation($input: updVendorStatusComments!){
updateVendorStatusComments(input: $input){
vendor_wo
}
     }`

export const getVendorDispatchLocation =`query($siteUnid:String!,$userId: String!){
getWorkOrderDistanceDetails(siteUnid:$siteUnid, userId:$userId){
createWODistanceDetails{
acct_email 
cfd_area
cfd_created_by_vendor_mdg_id
cfd_created_by_vendor_name
cfd_created_by_vendor_nearest_dispatch_address
cfd_created_by_vendor_nearest_dispatch_distance
cfd_created_by_vendor_username
cfd_market
cfd_mgr_userid
cfd_region
cfd_requested_date
cfd_requested_time
cfd_site_city
cfd_site_county
cfd_site_mdg_id
cfd_site_ps_loc
mgr_email
site_id
site_key
site_name
site_type
work_accepted
workorder_status
        }
        }
        }`
        
 export const getRadioInfo = `query($siteUnid:String!){
    getRadioInfo(siteUnid: $siteUnid){
         
        radioInfo{
             siteUnid
    nodeId
    sector
    duid
    ruName
    technology
    vendor
    productName
    partCode
    serialNumber
    softwareVersion
        }
    }     
}`
export const getAnteenaInformation = `query($siteUnid:String!){
                getAnteenaInformation(siteUnid:$siteUnid){
                    towerdetails{
                        site_unid
                        sectors
                        antenna_info_for_site{
                        enodeb_id
                        antenna_info{
                        sector
                        band_tech
                        ant_model_no
                        ant_azimuth_deg
                        ant_mech_deg
                        ant_height}
                        }
                    }
            }     
        }`

export const getRMADetails = `query($vwrsId : String, $rma_id : String){
getRMAInformation(vwrs_id : $vwrsId, rma_id : $rma_id){
result {
RMA_NUMBER
IOP_RMA_ID
PART_CODE
PS_LOCATION_NAME
ASSET_CODE
STATUS
RMA_TYPE
TRACKING_NO
WO_ID
VWRS_ID
ACTIVATION_DATE
RETURN_SHIP_DATE
TIMEZONE
REPLACEMENT_SERIAL_NO
SHIP_LOCATION_ADDR
REQUESTED_DELIVERY_DATE
REPLACEMENT_SHIPMENT_DATE
REPLACEMENT_TRACKING_NUMBER
REPLACEMENT_RETURN_STATUS
DEFECTIVE_TRACKING_NUMBER
}
}
}`
export const getRMAStatus = `query($vendorId:String!){
getRMADetails(vendorID:$vendorId){
data {
vwrs_id
rma_list {
rma_id
rma_status
}
}
}
}`
export const uploadRMApictures =  `mutation($loginId:String!,$input: upload_RMA_pictures_input!){
uploadRMApictires(loginId:$loginId,input:$input){
message
}
}`
export const getRMApictures = `query($loginId:String!,$category:String!,$attachmentId:Int!,$includeLinkedAttachments:String!){
getRMApictures(loginId:$loginId,category:$category,attachmentId:$attachmentId,includeLinkedAttachments:$includeLinkedAttachments){
data {
attachments {
id
siteUnid
vendorId
uploadedBy
uploadedOn
categoryId
category
name
}
linkedAttachments {
id
siteUnid
vendorId
uploadedBy
uploadedOn
categoryId
category
name
}
}

}
}`
export const getRMApicturesPreview = `query($loginId:String!,$categoryID:String!,$attachmentId:Int!){             
    getRMApicturesPreview(loginId:$loginId,categoryID:$categoryID, attachmentId:$attachmentId)
    {
       attachment
    }
}`
export const getBidUnitRules = `query($userId:String!) {
    getBidUnitRules(userId:$userId) {
        statusCode
        message
        data {
            id
    ruleType
    ruleName 
    bidUnit 
    description 
    ruleCondition
    isEnabled 
    createdOn 
    createdBy 
    modifiedOn 
    modifiedBy 
        }
    }
}`
export const getLineItemsByWorkOrderId =`query($workOrderId: String!, $userId: String!) {
    getLineItemsByWorkOrderId(workOrderId:$workOrderId,userId:$userId) {
        statusCode
        message
        data
    }
}`
export const getAttachmentsByWorkOrderId =`query($workOrderId: String!, $userId: String!) {
    getAttachmentsByWorkOrderId(workOrderId:$workOrderId,userId:$userId) {
        statusCode
        message
        data
    }
}`
export const getVendorWorkOrderByWorkOrderId = `query($workOrderId: String!, $userId: String!) {
    getVendorWorkOrderByWorkOrderId(workOrderId:$workOrderId,userId:$userId) {
        statusCode
        message
        data
    }
}`
export const getAuditByWorkOrderByWorkOrderId = `query($workOrderId: String!, $userId: String!) {
    getAuditByWorkOrderByWorkOrderId(workOrderId:$workOrderId,userId:$userId) {
        statusCode
        message
        data
    }
}`
export const postInvoiceSubmit = `mutation ($input: postInvoiceSubmitInput) {
  postInvoiceSubmit(input: $input) {
    status
    findings
    metadata
    auditData
  }
}`
export const CompleteInvoiceTransaction = `
mutation CompleteInvoiceTransaction($auditId: Int!, $input: InvoiceCompletionTransactionInput!, $userId: String!) {
  completeInvoiceTransaction(auditId: $auditId, input: $input, userId: $userId) {
    statusCode
    message
    data
  }
}
`
export const getAuditInvoiceByWorkOrderId = `
  query($workOrderId: String!, $userId: String!) {
    getAuditInvoiceByWorkOrderId(workOrderId: $workOrderId, userId: $userId) {
      statusCode
      message
      data
    }
  }
`;
export const recalculateDistance = `query($workOrderId: String!, $userId: String!) {
    recalculateDistance(workOrderId: $workOrderId, loginId: $userId)
        {
        workOrderId
        distance
        updated
        closestDispatch{
            address
            latitude
            longitude
            distance
        }

    }}`
export const getOSWInfo = `query($workOrderId: String!) {
    getOSWInfo(workOrderId:$workOrderId) {
        statusCode
        message
        data
    }
}`
export const getDashboardConfig = `query {
    getDashboardConfig {
        dashboardConfig
    }
}`
