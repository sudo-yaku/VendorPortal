import React, {Component} from 'react'
import PropTypes from 'prop-types'
import '../assets/style.css'
import moment from 'moment'

const OpsComments = (props) => {
    let notesColumns = [
        {
            headerName: "Notes",
            headerTooltip: "Notes",
            field: "comments",
            tooltipField: "text",
            filter: "agSetColumnFilter",
            width: 500
        }, {
            headerName: "System",
            headerTooltip: "System",
            field: "fromSystem",
            tooltipField: "source",
            filter: "agSetColumnFilter",
            width: 130,
            cellRendererFramework: (params) => {
                return params.fromSystem == "VP" ? "Vendor Portal" : params.data.source
            }
        }, {
            headerName: "Created By",
            headerTooltip: "Created By",
            field: "loginName",
            tooltipField: "created_by_name",
            filter: "agSetColumnFilter",
            width: 150
        }, {
            headerName: `Created On(${props.timeZone})`,
            headerTooltip: "Created On",
            field: "postedDate",
            tooltipField: "created_on",
            filter: "agSetColumnFilter",
            width: 150
        }
    ]
    return (
        <>
        {props.comments && props.comments.length > 0 ?
            <table style={{ overflow: "hidden" }} >
                <thead className="">
                    <tr>
                        <th scope="col" >Comments</th>
                        <th scope="col" >System</th>
                        <th scope="col" >Created By</th>
                        <th scope="col" >Created On</th>
                    </tr>
                </thead>
                {
                    props.comments.map((comment, id) => {
                        return (
                            <tr key={id + "tr"}>
                                <td scope="row" data-lable="AMO Name" >{comment.comments}</td>
                                <td scope="row" data-lable="Description" >{comment.fromSystem}</td>
                                <td scope="row" data-lable="Severity">{comment.loginName}</td>
                                <td scope="row" data-lable="Created" >{moment(comment.postedDate).format('M/D/YYYY h:mm a')}</td>
                            </tr>
                        )
                    })
                }
            </table>
            : null}
        </>
    )
}
export default OpsComments;