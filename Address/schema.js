/**
  Copyright: Verizon Data Services 

  File Name: schema.js
  ******************************************************************************************
  Release Date    Change Date      Name          Description
                  02/25/2022       shade86       Initial creation
 
 *******************************************************************************************/

export const getDispatchAddress = `query ($unid: String!, $mdgId: String!){
    getDispatchLocations(unid: $unid, mdgId: $mdgId){
        vendorlocations{
            meta_universalid 
            meta_createddate
            meta_createdby
            meta_lastupdatedate
            meta_lastupdateby
            vendor_name
            address
            latitude
            mdg_id
            longitude
        }   
    }
}`

export const creteDispatchAddress = `mutation($payload: addressPayload!){
    createDispatchAddress(input : $payload){
        resultmessage
    }
}`

export const deleteDispatchLocation = `mutation($locationUnid: String!){
    deleteDispatchAddress(locationUnid: $locationUnid){
        resultmessage
    }
}`

export const validateAddress = `query($location: String!){
    validateAddress(location : $location){
        results
    }
}`
export const updateDispatchAddress = `mutation($payload: addressPayload!,$locationUnid:String!){
    updateDispatchAddress(input: $payload,locationUnid:$locationUnid){
        resultmessage
    }

}`