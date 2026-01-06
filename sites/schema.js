export const getSiteDetail = `query ($siteunid: String!){
                                getSiteDetails(siteunid:$siteunid){
                                    sitedetails{                                 
                                        siteid
                                        osw_freeze
                                        site_unid
                                        name
                                        sitename
                                        node_types
                                        area
                                        region
                                        market
                                        switch
                                        sitetype
                                        opstracker_url
                                        type
                                        security_lock
                                        security_lock_noc_int
                                        tower_type
                                        tower_managed_by
                                        tower_manager_phone
                                        tower_noc_monitored
                                        tower_vzw_owned
                                        sitefunction
                                        address
                                        city
                                        state
                                        zip
                                        county
                                        latitude
                                        longitude
                                        techname
                                        techid
										root_drive
                                        root_drive_ca
                                        is_donor
                                        safety_rooftop_emp_access
                                        safety_night_lighting
                                        safety_fall_prot_req
                                        safety_ladder_sclimb_type
                                        safety_des_area_eqp_type
                                        safety_travel_restr_type
                                        safety_rooftop_notes
                                        safety_fall_prot_equip
                                        safety_equip_required
                                        safety_equip_tooltip
                                        safety_ladder_sclimb_type_oth
                                        managername
                                        managerid
                                        direction
                                        restriction
                                        gatecombo1
                                        gatecombo2
                                        accessrestriction
                                        equipmenttype
                                        evm
                                        brand
                                        signagebarriers
                                        lec
                                        clli
                                        alltel_atc_site
                                        vertical_site
                                        sequoia_site
                                        callout_zone_name
                                        ps_loc_id
                                        status
                                        vzreg_frn
                                        asr_num
                                        atc_site_id
                                        emis_id
                                        mdgid
                                        locus_id
                                        hvac_contact_phone
                                        hvac_maint_vendor
                                        telco_contact_phone
                                        telco_provider
                                        gas_account
                                        gas_company
                                        gas_contact_phone
                                        gas_meter
                                        power_account
                                        power_company
                                        power_meter
                                        power_phone
                                        bird_nest_activity {
                                            bird_type
                                            biologist_name
                                            restricted
                                            bird_restriction
                                            tower_access
                                            ground_access
                                            comments
                                            log
                                            updated
                                            emis_verification
                                        }
                                        local_fire_dept
                                        local_fire_dept_phone
                                        local_police_dept_phone
                                        contacts {
                                            role
                                            name
                                            title
                                            email
                                            phone
                                        }
                                        cell_num_list
                                        door_codes
                                        nss_switch
                                        lucent_switch
                                        remedy_site_id
                                        xing_id
                                        nss_site_id
                                        nss_site_id_2
                                        nss_site_id_3
                                        nss_site_id_4
                                        nss_site_id_5
                                        nss_site_id_6
                                        nss_site_id_7
                                        nss_site_id_8
                                        nss_site_id_9
                                        site_network_id
                                        siterra_id
                                        twr_led_main_strobe
                                        twr_led_side_lights
                                        twr_light_cont_mfr
                                        twr_light_cont_model
                                        twr_light_cont_serial
                                        twr_light_notes
                                        twr_light_type_fcc
                                        twr_light_type_vol
                                        twr_light_chap_fcc
                                        fcc_uls_twr_type
                                        das_ibr_ip
                                        tower_mast_amp
                                        call_sign
                                        pm_no_towerlight
                                        twr_light_mon_by
                                        lighting_test_period
                                        twr_light_vol_req
                                        twr_light_last_tested
                                        twr_light_next_test
                                        is_kgi
                                        is_twilight
                                        noc_ticket_severity
                                        noc_ticket_severity_display
                                        env_nocc_monitored
                                        state_switch_cds
                                        man_lift_requirements
                                        rrh_antenna_access
                                        company_code
                                        is_hazardous_site
                                        hazard_type
                                        hazard_justification
                                        xng_info {
                                            comments
                                            directions
                                            restrictions
                                            emer_contacts {
                                                name
                                                value
                                            }
                                        }
                                        circuit_vendor{
                                            vendor
                                            fullname
                                            trouble_contacts
                                            comments
                                        }
                                        circuits{
                                            circuitid
                                            status
                                            type
                                            bandwidth
                                            vendor
                                            pathview_url
                                        }
                                        enodebs{
                                            enodeb_num
                                            enodeb_ip
                                            enodeb_vendor
                                        }
                                        
                                        callout_zones {
                                            cz_unid
                                            name
                                            num
                                            period
                                            start_time
                                            end_time
                                            manager
                                            phone_no
                                            phone_no_2
                                            phone_no_mgr
                                            sms
                                            notes
                                            instructions
                                            mgr_name
                                        }
                                        node_details {
                                            node
                                            vendor
                                            type
                                            enodeb_name
                                            commandList
                                            targeted_commands
                                        }
                                    }
                                }
                            }`
export const fetchSiteData = `query ($siteunid: String!){
                                fetchSiteData(siteunid:$siteunid){
                                    sitedetails{                                 
                                        siteid
                                        site_unid
                                        name
                                        sitename
                                        node_types
                                        area
                                        region
                                        market
                                        switch
                                        site_type
                                        opstracker_url
                                        type
                                        security_lock
                                        security_lock_noc_int
                                        tower_type
                                        tower_managed_by
                                        tower_manager_phone
                                        tower_noc_monitored
                                        tower_vzw_owned
                                        site_function
                                        address
                                        city
                                        state
                                        zip
                                        county
                                        latitude
                                        longitude
                                        techname
                                        techid
										root_drive
                                        is_donor
                                        safety_rooftop_emp_access
                                        safety_night_lighting
                                        safety_fall_prot_req
                                        safety_ladder_sclimb_type
                                        safety_des_area_eqp_type
                                        safety_travel_restr_type
                                        safety_rooftop_notes
                                        safety_fall_prot_equip
                                        safety_equip_required
                                        safety_equip_tooltip
                                        safety_ladder_sclimb_type_oth
                                        managername
                                        managerid
                                        direction
                                        restriction
                                        gatecombo1
                                        gatecombo2
                                        accessrestriction
                                        type
                                        evm
                                        brand
                                        signagebarriers
                                        lec
                                        clli
                                        alltel_atc_site
                                        vertical_site
                                        sequoia_site
                                        callout_zone_name
                                        ps_loc_id
                                        site_status
                                        vzreg_frn
                                        asr_num
                                        atc_site_id
                                        emis_id
                                        mdg_id
                                        locus_id
                                        hvac_contact_phone
                                        hvac_maint_vendor
                                        telco_contact_phone
                                        telco_provider
                                        gas_account
                                        gas_company
                                        gas_contact_phone
                                        gas_meter
                                        power_account
                                        power_company
                                        power_meter
                                        power_phone
                                        rstr_birdtype
                                        biologist_name
                                        rstr_isrestricted
                                        bird_restriction
                                        rstr_toweraccess
                                        rstr_groundaccess
                                        rstr_comments
                                        rstr_log
                                        rstr_lastupdatedate
                                        emis_verification
                                        local_fire_dept
                                        local_fire_dept_phone
                                        local_police_dept_phone
                                        contact {
                                            role
                                            name
                                            title
                                            email
                                            phone
                                        }
                                        cell_num_list
                                        door_codes
                                        nss_switch
                                        lucent_switch
                                        remedy_site_id
                                        xing_id
                                        nss_site_id
                                        nss_site_id_2
                                        nss_site_id_3
                                        nss_site_id_4
                                        nss_site_id_5
                                        nss_site_id_6
                                        nss_site_id_7
                                        nss_site_id_8
                                        nss_site_id_9
                                        site_network_id
                                        siterra_id
                                        twr_led_main_strobe
                                        twr_led_side_lights
                                        twr_light_cont_mfr
                                        twr_light_cont_model
                                        twr_light_cont_serial
                                        twr_light_notes
                                        twr_light_type_fcc
                                        twr_light_type_vol
                                        twr_light_chap_fcc
                                        fcc_uls_twr_type
                                        das_ibr_ip
                                        tower_mast_amp
                                        call_sign
                                        pm_no_towerlight
                                        twr_light_mon_by
                                        lighting_test_period
                                        twr_light_vol_req
                                        twr_light_last_tested
                                        twr_light_next_test
                                        is_kgi
                                        is_twilight
                                        noc_ticket_severity
                                        noc_ticket_severity_display
                                        env_nocc_monitored
                                        state_switch_cds
                                        man_lift_requirements
                                        antenna_access
                                        company_code
                                        xng_info {
                                            comments
                                            directions
                                            restrictions
                                            emer_contacts {
                                                name
                                                value
                                            }
                                        }
                                        circuit_vendor{
                                            vendor
                                            fullname
                                            trouble_contacts
                                            comments
                                        }
                                        circuits{
                                            circuitid
                                            status
                                            type
                                            bandwidth
                                            vendor
                                            pathview_url
                                        }
                                        enodebs{
                                            enodeb_num
                                            enodeb_ip
                                            enodeb_vendor
                                        }
                                        
                                        callOutZones {
                                            cz_unid
                                            name
                                            num
                                            period
                                            start_time
                                            stop_time
                                            manager
                                            mgr_phone
                                            phone_no_2
                                            sms
                                            notes
                                            instructions
                                        }
                                    }
                                }
                            }`
export const viewMMUDownload = `query($request_id :  String!){
    viewMMUDownload(request_id : $request_id){
        req_details{
            request_id
            enodeb_num
            enodeb_name
            enodeb_ip
            enodeb_model
            req_header {
             enodeb_id
            site_unid
            action
            description
            status
            user_id
            wf_inst_id
            task_inst_id
            project_number
            validation_type
            }
            oam_ip
            action
            job_id
            config_txt
            job_status
        }
    }
}`
export const generateValidationMMU = `mutation($validateData : validateData!){
    generateValidationMMU(input:$validateData){
        output{
            user_id
            request_id
            message
        }
    }
}`
export const getMMURequests = `query($project_id :  String!){
    getMMURequests(project_id : $project_id){
        errors
        cfg_requests{
            SCT_REQ_HEADER_ID
            ENODEB_ID 
            SITE_UNID
            ACTION
            DESCRIPTION
            STATUS
            CREATED_BY
            CREATED_ON
            MODIFIED_ON
            UUID
            PROJECT_NUMBER
            TASK_INST_ID
            WF_INST_ID
            IS_DELETED
            DELETED_BY
        }
    }
}`
export const getHealthChecks = `query ($siteunid: String!){
                                 getHealthCheckDetails(siteunid : $siteunid){
                                    enodeb_healthcheck{ 
                                        request_id
                                        osw_request_id
                                        hc_result
                                        enodeb_ids
                                        created_by
                                        created_by_name
                                        created_on
                                        req_type
                                        email_ids 
                                        timezone 
                                        command_list 
                                        notes
                                        file_count 
                                        ondemand_exec_time 
                                        precheck_start_time 
                                        postcheck_start_time 
                                        precheck_exec_time 
                                        postcheck_exec_time 
                                        status 
                                        status_color 
                                        errors
                                        actions{
                                            clone
                                            view
                                            download
                                        }
                                    }
                                 }
}`

export const loadCqData = `mutation($cqData: cqData!){
    loadCqData(input:$cqData){
    errors
    cfg_request{
    hostname 
    vdu_id
    ilo_ip
    f1c_gw_ip
    edn_mgmt_ip 
    edn_mgmt_gw 
    oam_gw_ip
    oam_ip
    vdu_type 
    vdu_list {
    vdu_type 
    vdu_id 
    ilo_ip 
    oam_gw_ip
    hostname
    f1c_gw_ip
    edn_mgmt_ip
    edn_mgmt_gw
    clusterName
    namespaceName
    oam_ip
    }
    }
    }
    }`
export const requestHealthCheck = `mutation($healthReqBody:healthReqBody!, $siteunid:String!){
    requestHealthCheck(input:$healthReqBody, siteunid:$siteunid) {
     errors
     replace_antenna_work
     enodeb_healthcheck {
         request_id
         enodeb_ids
         created_by
         created_by_name
         created_on
         req_type
         email_ids 
         timezone 
         command_list 
          notes
          file_count 
          ondemand_exec_time 
          precheck_start_time 
          postcheck_start_time 
          precheck_exec_time 
          postcheck_exec_time 
          status 
          status_color 
          errors
          actions{
              clone
              view
              download
          }
     }
     HLTH_REQUEST_ID
     }
 }`
export const getHealthDetails = `query ($requestid: String!){
    getHealthRequestDetails(requestid : $requestid){ 
        errors
        enodeb_healthcheck_result{
            request_id
            req_type
            ondemand_info
            {
                result{
                    enodeb_id
                    output
                    }
           }
    precheck_info
    postcheck_info
    vendor
    summary
     }
    }
  }`
export const downloadHealthCheck = `query($requestid: String!){
    getDownloadHealthcheck(requestid : $requestid){
        data
     }

  }`
export const fetchSectorLockData = `query ($unid:String!){
        getSectorLockData( unid:$unid){
           siteData{
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
                VENDOR_MDG_ID
           }
           refData {
      SEC_UNQ_ID
      VENDOR_ID
      VENDOR_COMPANY
      MARKET
      SUB_MARKET
      WORK_TYPE
      LAST_UPDATED_BY
      LAST_UPADTED_DATE
    }
    
    }
}`

export const getFastHistory = `query ($siteunid: String!){
    getFastHistory(siteunid:$siteunid){
        slrhistory{
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
        }
    }
}`
export const getEnodebData = `query ($unid:String!){
    getEnodebData( unid:$unid){
      
 enodeBData{
    radio_cell_list{
        enodeb_id
vendor
radio_units
cell_list
    }
}
}
}`
export const getLockData = `query ($lockReqId: String!){
                                    getLockData(lockReqId:$lockReqId){
  lockRequest {
    request_detail {
      lock_unlock_request_id
      comment
      site_id
      site_unid
      site_name
      switch
      switch_unid
      site_priority
      ps_loc
      tech_id
      tech_name
      mgr_id
      mgr_name
      is_edit_detail
      pmd_tasks_id
      type_id
      type
      category_id
      category_name
      description
      gc_info {
        gc_tech_id
        gc_user_id
        name
        company
        phone
        email
      }
      source
      request_type
      include_work_info
      work_info {
        work_type
        work_id
        work_info
      }
      status
      display_status
      available_status
      available_display_status
      created_by
      created_by_name
      created_on
      closed_on
      updated_on
      notify_email_address
      assigned_to
      assigned_to_name
      assigned_on
      auto_reply_sent
      stay_as_auto
      allow_ivr_logout
    }
    notes 
      {
        lock_unlock_note_id
        lock_unlock_request_id
        vp_req_id
        source
        text
        created_by
        created_by_name
        created_on
      }
    
    attachments 
      {
        lock_unlock_attachment_id
        lock_unlock_request_id
        vendor_portal_attachment_id
        file_name
        file_size
        uploaded_by
        uploaded_by_name
        uploaded_on
        file_url
        source
      }
    nsa
    postCheckCount
    isWorkComplete
    isReminderAcknowledged
    sectorlockdata{
        LOCK_UNLOCK_ACTION_SEQ_ID
        SECTOR_LOCK_UNLOCK_REQ_ID
        LOCK_UNLOCK_ACTION_REQ_ID
        ISACTIVE
        ENODEB_ID
        RADIO_UNIT
        LINKED_VENDOR_ID
        EMAIL_ADDRESS
        VENDOR
        SECTOR
        ACTION
        ACTION_STATUS
        TIMEZONE
        REASON  
        SOURCE
        CELL_LIST
        RADIO_UNIT_LOCK_STATUS
        CREATED_BY
        LAST_UPDATED_BY
        LAST_UPDATED_DATE
        }
    replace_antenna_work
  }
}
    }`
export const updateStayAutoFlag = `mutation($osw_request_id: String!){updateStayAutoFlag(osw_request_id:$osw_request_id){ message  lock_unlock_request_id  } }`                            
export const fetchSitesBySubmarket = `query ($site_region: String!){
                                    getSitesBySubmarket(site_region:$site_region){
                                        sites{
                                            site_id
                                            site_unid
                                            site_name
                                            switch
                                            tech_name
                                            mgr_name
                                        }
                                        techs{
                                            userid
                                            name
                                            phone
                                            role
                                            email
                                        }
                                    }
                                }`
export const fetchBucketCraneSiteDetails = `query ($siteunid: String!){
    fetchBucketCraneSiteDetails(siteunid: $siteunid){
        result{
        bucket_required
        vendor_comments
        crane_required
        bucket_required_height
        is_tower_climable
        }
    }
}`
export const updateSLRStatusRequest = `mutation($updateBodyLock: updateBodyLock!, $lockReqId: String!){
    updateLockStatus(input:$updateBodyLock, lockReqId:$lockReqId){
        vpUpdate{
            rowsAffected
        }
        iopUpdate{
            message
            lock_unlock_request_id
            kirke_start_stop_res{
                success
                message
            }
        }
    }
}`
export const createLockRequest = `mutation($lockUnlockInput: lockUnlockInput!, $siteUnid: String!){
    createLockUnlock(input:$lockUnlockInput, siteUnid:$siteUnid){
    iopResponse{
        message
        lock_request_id
        enodeb_radio_lock{
            created_by
			enodeb_id
			radio_unit
			email_list
			timezone
			reason
			source
			vendor
			sector_list
            slrId
        }
    }
        vpActiveUpdate{
            rowsAffected
        }
        vpInsert{
            message
            
        }
    }
}`
export const createUnlockRequest = `mutation($unlockInput: unlockInput!, $siteUnid: String!){
    unlockSector(input:$unlockInput, siteUnid:$siteUnid){
    iopResponse{
        message
    }
        vpActiveUpdate{
            rowsAffected
        }
        vpInsert{
            message
            
        }
    }
}`
export const submitLockRequest = `mutation($createReqBodyInput:createReqBodyInput!){
                                submitLockRequest(input:$createReqBodyInput) {
                                    LockRequest
                                        createRequestData{

                                                message
                                                lock_unlock_request_id
                                                kirke_start_stop_res{
                                                    success
                                                    message
                                                }
                                        }
                                        insertLockDataToVP{
                                                rowsAffected
                                        }
                                            errors{
                                        status
      title
      detail
      lock_unlock_request_id
    }
                                        
                                    }
                                }`
export const submitNotes = `mutation($submitNotesInput:submitNotesInput!, $lockReqId:String!){
                                submitNotes(input:$submitNotesInput, lockReqId:$lockReqId) {
                                        message
                                        
                                    }
                                }`
export const manualOSWReason = `mutation($ManualOswRsnInput: ManualOswRsnInput!, $lockReqId: String!){
                                    updateManualOswReason(input:$ManualOswRsnInput, lockReqId:$lockReqId){
                                        message
                                        lock_unlock_request_id
                                    }
                                }`
export const submitAttachment = `mutation($submitAttachmentInput:submitAttachmentInput!, $lockReqId:String!){
                                submitAttachment(input:$submitAttachmentInput, lockReqId:$lockReqId) {
                                        message
                                        
                                    }
                                }`


export const downloadLockUnlockAttachment = `query ($file_Id: String!){
    downloadLockUnlockAttachment(file_Id:$file_Id){
                                        attachmentData
                            }}`
export const deviceTestDetails = `query($project_num:String!) {
    deviceTestDetails(project_num:$project_num) {
        project_num  
        vdu_type    
        ping_test {
            vdu_active
            status
            vdu_type
            vdu_id
            oam_gw_ip
            triggered_on
            iLoIp
            user_id
            user_name
            user_type
            vendor_company
            vendor_id
            log
        }
        firmware_upgrade {
            vdu_active
            status
            vdu_type
            vdu_id
            oam_gw_ip
            triggered_on
            iLoIp
            user_id
            user_name
            user_type
            vendor_company
            vendor_id
            log
        }
        server_status {
            enodeb_model
            enodeb_num
            test_status
            user_id
            user_name
            triggered_on
            vdu_type
            vendor_company
            vendor_id
            vdu_id
            log
        }
        vdu_info {
            vdu_type
            vdu_id
            du_id
            ilo_ip
            oam_gw_ip
            hostname
            f1c_gw_ip
            edn_mgmt_ip
            edn_mgmt_gw
            oam_ip
        }
    }
}`
export const getLoadCqData =  `query ($input:LoadCqDataTypeInput!){ getLoadCqData(input:$input) { cfg_request{ test_type project_id sel_config{ vdu_id site_name fuze_site_id ilo_hostname ilo_ip oam_gw_ip f1c1_nexthop crs_hostname } } } }`
export const getSkinnyOsHistory = `query ($vdu_id: String!){ 
    getvduHistoryForProject(vdu_id:$vdu_id) { 
        req_details { 
            request_id 
            enodeb_num 
            server_id 
            enodeb_name 
            request_date 
            request_user_id 
            request_user 
            config_txt
            file_name 
            test_status
        } 
    } 
}`
export const triggerEricssonServerTest = `mutation($input:ericssionServerTestInput!){ ericssionServerTest(input:$input) {
    message
    request_id
    atlas_job_id
     } }`
export const createDeviceTestRequest = `mutation($deviceReqBody:deviceReqBody) {
    createDeviceTestRequest(input:$deviceReqBody) {
        deviceTestRequest {
            project_num
            vdu_type
            ping_test {
                vdu_active
                vdu_type
                vdu_id
                triggered_on
                status
                oam_gw_ip
                iLoIp
                user_id
                user_name
                user_type
                vendor_company
                vendor_id
                log 
            }
            firmware_upgrade {
                vdu_active
                vdu_id
                status
                vdu_type
                triggered_on
                oam_gw_ip
                iLoIp
                user_id
                user_name
                user_type
                vendor_company
                vendor_id
                log
            }
            server_status {
                enodeb_model,
                enodeb_num,
                test_status,
                user_id,
                user_name,
                triggered_on
                vdu_type,
                vendor_company,
                vendor_id,
                vdu_id
                log
            }
             vdu_info {
                vdu_type
                vdu_id
                du_id
                ilo_ip
                oam_gw_ip
                hostname
                f1c_gw_ip
                edn_mgmt_ip
                edn_mgmt_gw
                oam_ip
            }

            }
            errors{
                status
                title
                detail
              }
        }
       
}`

export const getDeviceTestHistory = `query($project_num:String!, $test_type:String!, $vdu_type:String!) {
    getDeviceTestHistory(project_num:$project_num, test_type:$test_type, vdu_type:$vdu_type) {
        test_type
        test_runs {
            sequence_num
            vdu_active
            vdu_id
            test_status
            vdu_type
            triggered_on
            oam_gw_ip
            iLoIp
            user_id
            user_name
            user_type
            vendor_company
            vendor_id
            request_id
            log
        }
    }
}`

export const deviceConfigView = `query($request_id:String!) {
    deviceConfigView(request_id:$request_id) {
        req_details {
        request_id
        enodeb_num
        enodeb_name
        enodeb_ip
        enodeb_model
        oam_ip
        action
        job_id
        config_txt
        job_status
        req_header{
            enodeb_id
            site_unid
            action
            description
            status
            user_id
            wf_inst_id
            task_inst_id
            project_number
            validation_type
        }
        }
    }
}`


export const getDangerousSite = `query ($siteUnid: String!){
    getDangerousSite(siteUnid:$siteUnid){
        dangerousSite{
                    bSiteHazard 
                    SiteHazardComments 
                    dCreated 
                    SITE_UNID 
        }   
        }
}`
export const getRoofTopInfo = `query ($metaId: String!){
     getRoofTopInfo(metaId:$metaId){
        safety_des_area_eqp_type
        safety_equip_light_required 
        safety_fall_prot_req
        safety_ladder_sclimb_type
        safety_ladder_sclimb_type_oth
        safety_night_lighting
        safety_rooftop_emp_access 
        safety_rooftop_notes 
        safety_travel_restr_type
}
  }`
export const getHolidayEvents = `query{
    getHolidayEvents{
        holidayEvents{
                OPS_HOLIDAY_EVENTS_ID
                TITLE
                DESCRIPTION
                HOLIDAY_DATE
                CREATED_BY_LOGINID
    }
}
}`

export const getOffHours = `query($id: String, $submarket: String){
    getOffHours(id:$id, submarket:$submarket){
        offhours {
            NAME
            SWITCH_UNID
            MARKET
            SUB_MARKET
            STATUS
            TIMEZONE
            START_TIME
            END_TIME
            EXCEPTION_START_TIME
            EXCEPTION_END_TIME
            IS_WORK_DAY
            EXCEPTION_CREATED_DATE
            EXCEPTION_TIMEZONE
        }
    }
}`
export const getSectorInfo = `query($enodeb_id: String!, $site_unid: String!){
    getSectorInfo(enodeb_id:$enodeb_id, site_unid:$site_unid){
        enodeb_sector_info {
            sectors {
                sector
                sector_status
                lock_status
                enodeb_id
                vendor
                enodeb_name
            }
            errors
          }
    }
}`
export const getIssues = `query($unid: String!){
    getIssues(unid:$unid){
        qissue_details
    }
}`

export const getResolutionTypeData = `query($problemType: String!){
    getProblemData(problemType:$problemType){
        resolution_type
    }
}`

export const updateResolution = `mutation($unid : String!, $input: resolutionInput!){
    updateResolution(unid:$unid, input: $input){
        meta_universalid
        message
        errors
    }
    }`

export const updateRestriction = `mutation($loginId:String!,$fuzeSiteId: String!, $unid : String!, $input: accessRestrictionInput!){
    updateAccessRestrictions(loginId:$loginId,fuzeSiteId:$fuzeSiteId, unid:$unid, input: $input){
        updated_access_restriction
    }
}`

export const vduReplacementStepStatusSchema = `query($projectId: String!, $vduId: String!, $siteunid :String!, $siteName :String!, $vendorId:String!, $vendorName:String!){
    getVduStepStatus(projectId:$projectId, vduId:$vduId, siteunid :$siteunid, siteName :$siteName, vendorId:$vendorId, vendorName:$vendorName){
        stepStatus{
        step_status {
          refresh_list
          request_id
          job_desc
          vdu_id
          exec_info
        }
        updateResponse
        }
    }
}`

export const vduReplacementSchema = `mutation($input: vduReplace, $siteunid :String!, $siteName :String!, $vendorId:String!, $vendorName:String!){
    vduReplacement (input: $input, siteunid :$siteunid, siteName :$siteName, vendorId:$vendorId, vendorName:$vendorName){
        stepStatus{
        step_status {
               refresh_list
               request_id
               job_desc
               exec_info
               vdu_id
             }
             updateResponse
             }
     }
}`
export const getSiteSectorCarriers = `query($siteunid: String!){ 
    getSiteSectorCarriers(siteunid: $siteunid){
    nodes
    {
    node
    vendor
    }
    }
}`
export const getSpectrumHistory = `query($siteunid: String!){
    getSpectrumHistory(siteunid: $siteunid){
    spectrum_requests
    }
}`

export const createSpectrumRequest = `mutation($createSpectrumBody: createSpectrumBody!){
    createSpectrumAnalyzer(input: $createSpectrumBody) {
    errors
    requestId
    result
    }
}`

export const viewSpecResult = `query($request_id: String!){
    getSpectrumResult(request_id: $request_id){
    spectrum_result
    }
}`
export const downloadSpectrum = `query ($request_id: String!){
    getSpectrumDownload(request_id : $request_id){
      download
  }
}`

export const getOSWAutoReplyMessagesByUnid = `query($siteUnid: String!){
    getOSWAutoReplyMessagesByUnid(siteUnid: $siteUnid){
        data {
            BROADCAST_NOTIF_ID
            SELECTED_GROUP
            NOTIF_TYPE
            NOTIF_DATE
            NOTIF_TIME
            BROADCAST_TYPE
            MESSAGE
            IS_SCHEDULED
            CREATED_BY
            MODIFIED_BY
            CREATED_ON
            MODIFIED_ON
            IS_DELETED
            IS_ONETIME
            START_TIME
            END_TIME
            MESSAGE_TIMEZONE
            START_TIME_GUI
            END_TIME_GUI
            NOTIFY_MESSAGE_TYPE
        }
    }     
}`

export const getSamsungRadioUpdateDetails = `query($osw_request_id: String!){
    getSamsungRadioUpdateDetails(osw_request_id: $osw_request_id){
        data {
            REQUEST_ID
            SITE_UNID
            CREATED_ON
            NODE_ID
            MODIFIED_ON
            SOURCE
            OSW_ID
            STATUS
            NOTE
            CREATED_BY
        }
    }     
}`

export const trggerUpdateSamsungSN = `mutation($site_unid: String!, $input: updateSamsungSNinput!){
    updateSamsungSN(site_unid:$site_unid, input:$input){
        result
        errors
    }
}`

export const triggerRETScan = `mutation($payload:retScanReqBody!){
    requestRETScan(payload:$payload){
        message
        request_id
        errors
    }
}`
export const getRETScanDetails = `query($oswId:Int!){
    getRETScanDetails(oswId:$oswId){
        result{
            request_id
            status
            node_id
            type
            note
            created_by
            created_on
            execution_time
            status_color
            actions{
            view
            download
            run
        }
    }
}}`

export const getAPRadioDetails = `query($fuzeSiteId:String!, $managerId:String!){
    getAPRadioDeviceDetails(fuzeSiteId:$fuzeSiteId, managerId:$managerId)
}`

export const getOswIssueTypes = `query {
    getOswIssueTypes {
        issue_type
    }
}`


export const getMetroRootSchedules = `query($caId:String!){
    getMetroRootSchedules(caId:$caId)
}`