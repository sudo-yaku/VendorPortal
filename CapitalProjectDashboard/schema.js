export const getSNAPProjects = `query($market: String!,$submarket: String!){
getCbandSnapProjects(market:$market,submarket:$submarket){
        output{
        siteid
        site_unid
        sitename
        proj_number
        project_name
        project_type
        project_status
        project_desc
        project_initiative
        model
        ps_loc_code
        address
        city
        zip
        state
        county
        latitude
        longitude
        manager
        field_engineer         
        }
    }     
}`;

export const getCbandProjDetails = `query($projectNum: String!){
    getCbandProjDetails(projectNum: $projectNum){
      project_details {
        project_name,
        project_num,
        siteid,
        sitename,
        devices {
          sector_id,
          enodeb_id,
          serial_num,
          scanned_by,
          scanned_on,
          comments,
          vendor_id,
          vendor_name
        }
      }
    }
  }`;

export const saveDeviceToEnodebInp = `mutation($saveDeviceToEnodebInp:saveDeviceToEnodebInp!){
  saveDeviceToEnodeb(input:$saveDeviceToEnodebInp) {
    output{
      iop_data {
        message
      }
      vp_insert_data
      vp_update_data {
        SERIAL
        STATUS
      }
    }
  }
}`;

export const getProjectDetails = `query($projectNumber:String!,$market:String!,$submarket:String!){
  getProjectDetails(projectNumber:$projectNumber,market:$market,submarket:$submarket){
    output {
      siteid
      site_unid
      sitename
      proj_number
      project_name
      project_type
      project_status
      ps_loc_code
      manager
      field_engineer
      field_engineer_id
      manager_id
      project_initiative
    }
  }
}`;

export const getProjectsList = `query($mdg_id:String!,$startDate:String!,$endDate:String!,$submarket:String!){
  getProjectsList(mdg_id:$mdg_id,startDate:$startDate,endDate:$endDate,submarket:$submarket){
     schedule_projects{
      siteid
      site_unid
      sitename
      proj_number
      project_name
      project_type
      project_status
      ps_loc_code
      latitude
      longitude
      manager
      field_engineer
      field_engineer_id
      manager_id
      project_initiative
      market
      submarket
      ops_events{
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
            createdOn
            siteNumber
            vendorId
            vp_engineerLoginId
            }
     } 
     unschedule_projects{
      siteid
      site_unid
      sitename
      proj_number
      project_name
      project_type
      project_status
      ps_loc_code
      latitude
      longitude
      manager
      field_engineer
      field_engineer_id
      manager_id
      project_initiative
      market
      submarket
      ops_events{
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
            createdOn
            siteNumber
            vendorId
            vp_engineerLoginId
            }
    }
  totalprojects
  }
}`;

export const updateSerialNumber = `mutation($atoll_info_input:atoll_info_input!) {
  serialNumberUpdate(input:$atoll_info_input) {
      updatedAtollInfo
      mesage
  }
}`;

export const get5gRepeaterProjectDetails = `query($projectNum: String!){
  get5gRepeaterProjectDetails(projectNum: $projectNum){
    atoll_info {
      SI_ATOLL_INFO_5GR_ID,
      FUZE_SITE_ID,
      PROJECT_NUMBER,
      SITENAME,
      SECTOR,
      ISREPEATER,
      DONORCELLRAT,
      DONORGNODEBID,
      DONORENODEBID,
      DONORGNBENBID,
      DONORGNBDUID,
      DONORGNBDUNUMBER,
      UNITTYPE,
      UNITSERIALNUMBER,
      UNITIPADDRESS,
      SERVINGDONORSERIALNO,
      UNITHEIGHT,
      UNITMECHAZIMUTH,
      UNITMECHTILT,
      DONORCELLARFCN,
      DONORTXID,
      DONOR_SECTOR,
      DONORENODEBVENDOR,
      DONORBANDINFO,
      DONORBANDCLASS,
      MODIFIED_ON,
      DONORSITENAME,
      DONORLINKTYPE,
      REPEATERMANUFACTURER,
      REPEATERMODEL
    },
    expected_format {
      vendor
      encoded_image
      regex_format {
        serial_number
        part_number
      }
    }
  }
}`;

export const getProjectInfoSlr = `query($projectNum: String!){
  getProjectInfoSlr(projectNumber: $projectNum){  
    siteid
    site_unid
    sitename
    proj_number
    project_name
    project_type
    project_status
    ps_loc_code
    manager
    field_engineer
    manager_id
    project_initiative  
}
}`;

export const getTestInfo = `query($siteUnid: String!,$method: String!, $site: String!) {
    getTestInfo(siteUnid: $siteUnid) {
        statusCode
        message
        test_info
    },
    getHostnameMapping(method: $method, site: $site) {
    data
  }
}`;

export const getOpenTest = `query($siteUnid: String!) {
    getOpenTest(siteUnid: $siteUnid) {
        statusCode
        message
        eat_test_status
    }
}`;

export const createEatTestRequest = `mutation ($input: EatTestRequestInput!) {
  createEatTestRequest(input: $input) {
        statusCode
        message
        eat_tests
  }
}`;
export const cancelEatTestRequest = `mutation ($input: CancelEatTestInput!) {
  cancelEatTest(input: $input) {
        statusCode
        message
        user_id
  }
}`;

export const startEatTestRequest = `mutation ($input: StartEatTestInput!) {
  startEatTest(input: $input) {
        statusCode
        message
        eat_test_status
  }
}`;

export const getTestStatus = `query($eatTestId: Int!) {
    getTestStatus(eatTestId: $eatTestId) {
        statusCode
        message
        eat_test_status
    }
}`;

export const stopEatTestRequest = `mutation ($input: StopEatTestInput!) {
  stopEatTest(input: $input) {
        statusCode
        message
        eat_test_status
  }
}`;

export const completeEatTestRequest = `mutation ($input: CompleteEatTestInput!) {
  completeEatTest(input: $input) {
        statusCode
        message
        user_id
  }
}`;


export const GetHostnameMapping=`query ($method: String!, $site: String!) {
  getHostnameMapping(method: $method, site: $site) {
    data
  }
}`

export const searchHpovServer=`query($method: String!, $proc: String!, $reqBody: JSON) {
  searchHpovServer(method: $method, proc: $proc, reqBody: $reqBody) {
    data
  }
}`

export const getSiteTypes = `query {
  getSiteTypes { 
    statusCode
    message
    site_types
  }
}`;

export const pingHost=`query($method: String!, $host: String!) {
  pingHost(method: $method, host: $host) {
    data
  }
}`
export const getTestHistory = `query($siteUnid: String!) {
    getTestHistory(siteUnid: $siteUnid) {
        statusCode
        message
        eat_tests
    }
}`
export const createRMURequest=`mutation ($input: HPOVRegistrationInput!) {
  createHPOVRegistration(input: $input) {
    statusCode
        message
        data
  }
}`

export const getTestAuditDetails = `
    query getTestAuditDetails($eatTestId: Int!) {
        getTestAuditDetails(eatTestId: $eatTestId) {
            statusCode
            message
            audit_info
        }
    }
`;
