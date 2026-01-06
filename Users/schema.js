

export const activeDomainsDef = `query($userId :  String!){
    getVendorDomains(userId: $userId){
        userId
        subMarket
    }
}`

export const getManagersForSubmarket = `query($submarket:String!){
                                            getManagersForSubmarket(submarket:$submarket){
                                                code
                                                message
                                                users{
                                                    userid
                                                    name
                                                    email
                                                    phone
                                                    role
                                                }
                                            }
                                        }`

export const delIvrTechUser= `query($login: String!,$userId: String!){
                                    delIvrTechUser(login:$login,userId:$userId){
                                        code
                                        message
                                    }
                                }`


export const getVendorTechForVendorId = `query($login: String!,$vendorId: String!){
                                                getVendorTechForVendorId(login:$login,vendorId:$vendorId){
                                                            code
                                                            message
                                                            data{
                                                                USERID
                                                                TECHID
                                                                ACCTLOCKEDIND
                                                                VENDOR_ID
                                                                SUBMARKET_COUNT
                                                                PIN_EXPIRED
                                                            }
                                                }
                                            }`

export const getCurrentPinBYUserId =`query($login:String!,$userId: String!){
                                                                        getCurrentPinByUserId(login:$login,userId:$userId){
                                                                              code
                                                                              message  
                                                                        }                                
                                                            }`
export const getVendorListDef = `query ($vendor_id: Int!){
     getVendorList(vendor_id:$vendor_id) {
        is_vendor_trained
        is_isso_reg
        vendor_id
        vendor_name
        vendor_sponsor_id
        vendor_sponsor_email
        vendor_category
        vendor_area
        vendor_mdg_id
        vendor_region
        vendor_service_email
        vendor_phone
        vendor_address
        vendor_city
        vendor_state
        vendor_zip
        vendor_peoplesoft_id
        vendor_pricing_macro_ant_tow
        vendor_pricing_small_cell
        userid
        fname
        lname
        name
        phone
        email
        title
        vendor_role
        contact_unid
        techID
        address1
        address2
        address3
        city
        state
        country
        zipcode
        AltPhone
        supervisor
        updatedBy
        status
        badge
        isSuperAdmin
        user_status
        last_login_datetime
    }
}`
export const getUserInfoLinkedDef = `query ($vendorEmail: String!){
     getUserInfoLinked(vendorEmail:$vendorEmail) {
       userinfo{
            VDR_UNQ_ID
            USER_UUID
            CONTACT_UNID
            OPSTRACKER_USERID
            VENDOR_ID
            FIRST_NAME
            LAST_NAME
            EMAIL_ADDRESS
            PHONE_NUMBER
            VENDOR_ROLE
            IS_ISSO_REG
            ISSO_USERID
            LAST_UPDATED_BY
            LAST_UPDATED_DATE
            VENDOR_AREA
            VENDOR_REGION
            VENDOR_NAME
}
    }
}`
export const getVendorUserAuth = `query ($vendorEmail: String!){
     getVendorUserAuth(vendorEmail:$vendorEmail) {
       output{
           users {
        LINKED_USER_ID
        CONTACT_UNID
        VENDOR_ID
        LINKED_VENDOR_ID
        EMAIL_ADDRESS
        OPSTRACKER_USERID
        LINK_STATUS
        LINKED_BY
        LINKED_ON
        LAST_UPDATED_BY
        LAST_UPDATED_DATE
        IVR_ACTIVE
       FIRST_NAME
       LAST_NAME
       PHONE_NUMBER
    }
    companies{
        VDR_CMPNY_UNQ_ID
        CMPNY_UUID
        VENDOR_ID
        VENDOR_NAME
        VENDOR_CATEGORY
        VENDOR_AREA
        VENDOR_REGION
        VENDOR_PEOPLESOFTID
        VENDOR_SERVICE_EMAIL
        VENDOR_CONTACT_INFO
        VENDOR_ADDRESS
        VENDOR_CITY
        VENDOR_STATE
        VENDOR_ZIPCODE
        VENDOR_UUID
        VENDOR_SPONSORID
        IS_VENDOR_DISABLED
        IS_VPAUTO_ENABLED
        IS_PRICING_MATRIX
        IS_GROUP_VISIBILITY
      }
       }
    }
}`

export const linkUserToCmpDef = `mutation($linkExistingVendorToNewCompanyInp:linkExistingVendorToNewCompanyInp!){
            linkExistingVendorToNewCompany(input:$linkExistingVendorToNewCompanyInp) {
                output{
                    linkStatus
                }
                
            }  
        }`
export const createContactDef = `mutation($VendorInput:VendorInput!){
            createContact(input:$VendorInput) {
                code
                message
                data{
                    vendor_id
                    vendor_name
                    vendor_sponsor_id
                    vendor_category
                    vendor_area
                    vendor_region
                    vendor_service_email
                    vendor_phone
                    vendor_address
                    vendor_city
                    vendor_state
                    vendor_zip
                    vendor_peoplesoft_id
                    userid
                    fname
                    lname
                    name
                    phone
                    email
                    title
                    vendor_role
                    contact_unid
                }
            }  
        }`

export const updateContactDef = `mutation($VendorInput:VendorInput!){
            updateContact(input:$VendorInput) {
                code
                message
                data{
                    vendor_id
                    vendor_name
                    vendor_sponsor_id
                    vendor_category
                    vendor_area
                    vendor_region
                    vendor_service_email
                    vendor_phone
                    vendor_address
                    vendor_city
                    vendor_state
                    vendor_zip
                    vendor_peoplesoft_id
                    userid
                    fname
                    lname
                    name
                    phone
                    email
                    title
                    vendor_role
                    contact_unid
                }
            }  
        }`
export const deleteDeviceDetail = `mutation($testDeviceInput:testDeviceInput!){
    saveTestDevice(input:$testDeviceInput)
              {
                Header
                 {
                    code
                    message
                 }
                Body{
                  device
                   {
                        id
                        deviceDetails
                        status
                        updatedBy
                        createdBy
                        createdAt
                        updatedAt
                    }
                }
             }
  
}`
export const getDeviceDetail = `query($vendorId: String!){
    getTestDevice(vendorId:$vendorId)
               {
                Header{
                   code
                   message
                }
               Body{
                deviceList {
                        
                            id
                            deviceDetails
                            status
                            updatedBy
                            createdBy
                            createdAt
                            updatedAt
                        
                    }
                    deviceColumnDef {
                        
                            id
                            displayName
                            key
                            type
                            defaultValue
                            placeholder
                            isMandatory
                            listData
                            status
                            updatedBy
                            createdBy
                            createdAt
                            updatedAt
                        
                }
            }
        }    
                }`
export const createUpdIvrUser = `mutation($ivr_request_input:ivr_request_input!){
                                    createUpdIvrUser(input:$ivr_request_input){
                                        code
                                        message
                                        techId
                                    }
 }`
export const createUpdVendorCompany = `mutation($vendor_comp_input:vendor_comp_input!){
                                    createUpdVendorCompany(input:$vendor_comp_input){
                                        code
                                        message
                                    }
                                }`
export const ivrEmailNotification = `mutation($ivr_email_request:ivr_email_request!){
                                    ivrEmailNotification(input:$ivr_email_request){
                                        code
                                        message
                                    }
                                }`
export const submitIssueReport = `mutation($submitIssueReportInput:submitIssueReportInput!){
    submitIssueReport(input:$submitIssueReportInput){
        status
    }
}`

export const updateMultipleMarketIvr = `mutation($ivr_request_mulMarket:ivr_request_mulMarket!){
                                    updateMultipleMarketIvr(input:$ivr_request_mulMarket){
                                        code
                                        message
                                    }
                                }`



export const deleteContactDef = `mutation($contact_unid:String){
                            deleteContact(contact_unid:$contact_unid) {
                                code
                                message
                            }   
                        }`

export const updatePreference = `mutation($userPreferenceInput:userPreferenceInput!){
    savePreference(input:$userPreferenceInput){
        code
        message
    }
}`
export const getConfigData = `query($vendorId:Int!){
    getConfigData(vendorId:$vendorId){
        configData{
            ATTRIBUTE_NAME
            ATTRIBUTE_VALUE
            ATTRIBUTE_CATEGORY
            ATTRIBUTE_DESCRIPTION        
        }
        submarketData
        isGeneratorVendor
        oswClosureCodes
        invoiceOosNA
        invoiceOosVendor 
    }     
}`
export const userAuth =`query ($input: getUserAuthInput!) {
    getUserAuth (input:$input){
        user{
            favoriteSubMarket
	        lastAccessedSubMarket
	        lastAccessedDate
            contact_unid
            email
            fname
            is_vendor_disabled
            lname
            login_id
            meta_universalid
            name
            phone
            title
            vendor_category
            vendor_id
            vendor_name
            lastname
            userid
            vendor_role
            vendor_unid
            state
            city
            techID
            address1
            address2
            address3
            country
            zipcode
            supervisor
            updatedBy
            status
            badge
             vendor_area
            vendor_region
            isSuperAdmin
            isssouser
            vendor_pricing_macro_ant_tow
            vendor_mdg_id
            vendor_uuid
            vendor_sponsorid
            is_vpauto_enabled
            isUserOffShore
            is_pricing_matrix
            is_group_visibility
            vendor_pricing_small_cell
            incentive_eligible
            wno_user
            smallcell_incentive_eligible
            group_vendors{
			        	vendor_id
                        vendor_name
                        vendor_unid
                        vendor_mdg_id
                        vendor_category
                        vendor_area
                        vendor_region
                        vendor_uuid
                        vendor_sponsorid
                        is_vendor_disabled
                        is_vpauto_enabled
                        is_pricing_matrix
                        is_group_visibility
                        vendor_pricing_macro_ant_tow
                        vendor_pricing_small_cell
                        incentive_eligible
                        }
            releaseNotesInfo{
                        showReleaseNotes 
                        title
                        description
                        link
            }       
            ssoLogoutURL
            sessionTimeout
            preferences
            permissions,
            is_vendor_trained,
            service_email,
            need_to_delete_date,
            user_status,
        }  
        features {
            NETWORK_APP_VERSION
        }      
    }
}`

export const countVPAutomation=`query ($vendor_id: String!){
    getCountforVPAutomation(vendor_id:$vendor_id){
        VPAutomationCount
    }
}`



export const getElog = `query ($workorder_id: String!){
getElogForWorkorder(workorder_id:$workorder_id){
    eLogInfoId
    subject
    subjectId
    element
    elementId
    elogtype
    contenttext
    universalid
    meta_createdby
    meta_createdname
    meta_createddate
    meta_lastupdatedate
    red_flag
    unvalue
    privacyflag
    hours
    oncall
    shift
    subtype
    subtypeid
    subtypename
    worktype
    fromsystem
    changeControl
    vendor
    enodeB
    cellId
    carrier
    isAddToReport
    followUp
    files{
        file_name
        file_type
        last_modified
        file_size
        file_Id
    }
    comments{
        eLogCommentsId
        eLogInfoId
        comments
        meta_createdby
        meta_lastupdatedate
        meta_createdname
    }
}
}`
export const logoutQuery =`query {
    logout{
        code
        message
    }
}`

export const sessionQuery =`query {
session{
        code
        message
    }
}`
export const deleteContactDef5g=`mutation($contact_unid:String){
deleteContact(contact_unid:$contact_unid) {
    code
    message
}   
}`
export const updateContactDef5g=`mutation($VendorInput:VendorInput!){
    updateContact(input:$VendorInput) {
        code
        message
        data{
            vendor_id
            vendor_name
            vendor_sponsor_id
            vendor_category
            vendor_area
            vendor_region
            vendor_service_email
            vendor_phone
            vendor_address
            vendor_city
            vendor_state
            vendor_zip
            vendor_peoplesoft_id
            userid
            fname
            lname
            name
            phone
            email
            title
            vendor_role
            contact_unid
            state
            city
            techID
            address1
            address2
            address3
            country
            zipcode
            supervisor
            updatedBy
            status
            badge
            isSuperAdmin
        }
    }  
}`

export const resendActivationDef5g=`mutation($activationInput:activationInput!){
    resendActivation(input:$activationInput) {
        code
        message
    }  
}`

export const resendUserActivationInviteDef = `query($userId: String!){
    resendUserActivationInvite(userId: $userId) {
        message
    }
}`

export const unlinkUserFromVendorId = `query($id: String!, $name:String!){
    unLinkVendor(id:$id, name:$name) {
        output{
            unlink_status  {
                status
                rowsAffected
            }
        }
    }
}
`

export const getVendorUserAuthForVendorId = `query ($vendorId:Int!){
    getUserInfoVendorLinked(vendorId:$vendorId) {
      output{
          users {
       LINKED_USER_ID
       CONTACT_UNID
       VENDOR_ID
       LINKED_VENDOR_ID
       EMAIL_ADDRESS
       OPSTRACKER_USERID
       LINK_STATUS
       LINKED_BY
       LINKED_ON
       LAST_UPDATED_BY
       LAST_UPDATED_DATE
       IVR_ACTIVE
       FIRST_NAME
       LAST_NAME
       PHONE_NUMBER
   }
   companies{
       VDR_CMPNY_UNQ_ID
       CMPNY_UUID
       VENDOR_ID
       VENDOR_NAME
       VENDOR_CATEGORY
       VENDOR_AREA
       VENDOR_REGION
       VENDOR_PEOPLESOFTID
       VENDOR_SERVICE_EMAIL
       VENDOR_CONTACT_INFO
       VENDOR_ADDRESS
       VENDOR_CITY
       VENDOR_STATE
       VENDOR_ZIPCODE
       VENDOR_UUID
       VENDOR_SPONSORID
     }
      }
   }
}`

export const issoResetAccount = `mutation($issoUserId:String!,$opstrackerUserId: String!){
    issoResetAccount(issoUserId: $issoUserId,opstrackerUserId: $opstrackerUserId) {
        emailsSent
        output
    }
}`

export const getRelatedVendors = `query ($keyword: String!){
    getRelatedVendors(keyword:$keyword){
        data {
            display
            value  
          }  
        }
}`

export const getRelatedUsers = `query ($keyword: String!){
    getRelatedUsers(keyword:$keyword){
        data {
            display
            value  
          }  
        }
}`


export const getVendorProfile = `query ($vendorId: String!){
    getVendorProfile(vendorId:$vendorId){
        data
        }
}`

export const getOpenOswForUser = `query($user_id: String!){
    getOpenOswForUser(user_id: $user_id){
    openOsw{
        SECTOR_REQ_UNQ_ID
        SECTOR_REQUEST_TYPE
        WORK_REQUEST_TYPE
        SITE_TYPE
        WORK_ORDER_ID
        WORK_TYPE
        WORK_INFO
        SITE_UNID
        SWITCH_UNID
        MARKET
        SUB_MARKET
        INCLUDE_WORK_INFO
        DESCRIPTION
        GC_TECH_ID
        GC_USER_ID
        VENDOR_NAME
        VENDOR_COMPANY
        VENDOR_PHONE
        VENDOR_EMAIL
        ENODEB_ID
        SECTOR
        CARRIER
        RADIO
        NOTIFY_ADDRESS
        LOCK_UNLOCK_REQUEST_ID
        REQUEST_STATUS
        REQUEST_COMMENTS
        REQUEST_SOURCE
        CREATED_DATE
        CREATED_BY
        LAST_UPDATED_BY
        LAST_UPDATE_DATE
        LAST_WORKED_BY
        NON_SERVICE_IMPACTING
        IS_AUTO
        IS_WORK_COMPLETE
        WORK_COMPLETE_NOTES
        SITE_NAME
        FAULT_CODE
        RESOLUTION_CODE
        VENDOR_ID
        IS_REMINDER_ACKNOWLEDGED
        REPLACE_ANTENNA_WORK_SECTOR
        REPLACE_ANTENNA_WORK
        VENDOR_MDG_ID
  }
}}`

export const resetIVRPinSchema=`mutation($input: resetIvr!){
    resetIvrPin(input: $input)
}`

export const saveFavoriteSubMarket = `mutation($input:SubMarket_Input!) {
  saveFavoriteSubMarket(input:$input) {
    saveFavoriteSubMarket
  }
}`

export const getIvrDetailsSchema=`query($userId:String!){
    getUserIVRDetails(userId:$userId){
        ivr_profile {
            ivr_tech_id
            user_id    
            first_name
            last_name 
            company 
            function_name 
            sponsor 
            account_locked 
            pin_expired 
            pin 
            new_pin 
            manager_name 
            manager_contact  
            }
        } 
}`

export const postUserRecertifySchema = `mutation($opstrackerUserId:[String],$updatedBy:String!){
    updateUserStatus(input:{
        opstrackerUserId : $opstrackerUserId,
        updatedBy : $updatedBy
    }) {
        message
    }
}`

export const deleteBulkUserSchema = `mutation($contactUnid:[String]){
    deleteUsers(input:{
        contactUnid: $contactUnid
    }) {
        message
        successfulDeletes
        failedDeletes
    }
}`