export const getElogforWorkOrder=`query ($workorder_id: String!,$vendor: String!){
                                        getElogForWorkorder(workorder_id:$workorder_id,vendor :$vendor) {
                                            code
                                            message
                                            listItems{
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
                                            }
                                        }
                                 }`;
export const getElogCommentForInfoId = `query ($userId: String!,$eloginfoid: String!,$fromsystem: String!){
                                           getElogCommentForInfoId(userId:$userId,eloginfoid :$eloginfoid,fromsystem:$fromsystem){
                                               code
                                               message
                                               listItems{
                                                   eLogCommentsId
                                                   eLogInfoId
                                                   contenttext
                                                   meta_createdby
                                                   meta_createdname
                                                   meta_lastupdatedate
                                                   files{
                                                        file_name
                                                        file_type
                                                        last_modified
                                                        file_size
                                                        file_Id
                                                    }
                                                    hasAttachment
                                               }
                                           }
                                        }`;

export const submitElog=`mutation($ELogInput:ELogInput!){
                                submitElog(input:$ELogInput) {
                                    code
                                    message
                                    eLogInfoId
                                }  
                            }`
export const submitElogComment = `mutation($ELogComment:ELogComment!){
                                submitElogComment(input:$ELogComment) {
                                    code
                                    message
                                }
                            }` 

export const downloadElogFile = `query ($file_Id: String!){
                                downloadElogFile(file_Id:$file_Id){
                                        file_data
                                        file_name}}`							