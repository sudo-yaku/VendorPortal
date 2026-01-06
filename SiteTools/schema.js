export const getWorkOrderForSite = `query ($loginId: String!,$startdate: String!,$enddate: String!, $mdgId: String, $siteId: String!) {
                                            getWorkOrderForSite(loginId: $loginId, startdate:$startdate,enddate :$enddate, mdgId :$mdgId, siteId: $siteId){ 
                                                statusCode
                                                message
                                                data
                                            }
                                        }`
export const getPrbAnalyzer = `query ($node: String!){
    getHeatMap(node:$node){ 
        statusCode
        message
        data
    }
}`
export const getNodes = `query ($siteUnid: String!){
  getNodes(siteUnid:$siteUnid){
    statusCode
    message
    data
  }
}`
export const postTaskType = `mutation($input: postTaskTypeInput!){
    postTaskType(input:$input){ 
        statusCode
        message
        data
    }
}`
