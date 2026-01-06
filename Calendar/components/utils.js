import React from 'react'
import moment from 'moment'
import Dialog from '@material-ui/core/Dialog'
import FlatButton from '@material-ui/core/Button'
import Event from '@material-ui/icons/EventNote';
import OpsComments from './OpsComments'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { EventNote } from '@material-ui/icons';

export function renderEventViewUpdateDialog(event, showEventOutOfLocation, closeEventOutOfLocation, updateFlag, updateEvent, loginId, downloadVSFile) {

    function fileDownload(file_name, file_Id) {
        downloadVSFile(loginId, file_Id).then(action => {
            if (action.filedata && action.filedata.file_data) {
                let blob = dataURItoBlob(action.filedata.file_data)
                startDownload(blob, file_name)
            }
        })
    }
    const rows_files = []
    if (event.files && event.files.length > 0) {
        event.files.map(function (file) {
            var row1 = file['preview'] ? <a target="_blank" href={file['preview']} style={{ color: '#2196f3', cursor: 'pointer' }}>{file['file_name']}</a> : <span style={{ color: '#FFF', cursor: 'pointer' }} onClick={() => fileDownload(file['file_name'], file['file_Id'])}>{file['file_name']}</span>

            rows_files.push(
                <span key={file['file_name']} className="file_tag_designe">
                    {row1}
                </span>)
        })
    }

    const DATE_TIME_FORMAT = 'MM-DD-YYYY hh:mm A'
    let start = '', end = ''
    if (event.start != null && event.end != null) {
        start = moment(event.start).format(DATE_TIME_FORMAT)
        end = moment(event.end).format(DATE_TIME_FORMAT)
    } else {
        start = 'NA'
        end = 'NA'
    }
    let actions
    if (updateFlag) {
        actions = [
            <FlatButton
                // label="Ok"
                primary
                onClick={closeEventOutOfLocation}
                // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
            >OK</FlatButton>,
            <FlatButton
                // label="Edit"
                primary
                onClick={updateEvent}
                // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
            >Edit</FlatButton>
        ]
    } else {
        actions = [
            <FlatButton
                // label="Ok"
                primary
                onClick={closeEventOutOfLocation}
                // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
            >OK</FlatButton>
        ]
    }

    return (
        <Dialog
            actions={actions}
            modal
            onClose={closeEventOutOfLocation}
            open={showEventOutOfLocation}
        >
            <DialogTitle style={{ textTransform: 'capitalize', fontSize: 18, fontFamily: 'Arial, Helvetica, sans-serif', background: '#ddd', paddingBottom: 10, paddingTop: 20 }} >
            <EventNote style={{ display: 'inline', position: 'relative' }} color={'#cd040b'}></EventNote> 
            Work ID#: {event.title}</DialogTitle>
            <DialogContent>
            <div style={{ overflowX: 'hidden' }}>
                <tbody>
                    <div className="row">
                        <div className="col-md-12 col-sm-12">
                            <tr><p className="iopStandard" style={{ paddingTop: 15 }}><strong>Status:</strong> {event.status}</p> </tr>
                            <tr><p className="iopStandard"><strong>Category:</strong> {event.category}</p> </tr>
                            <tr><p className="iopStandard"><strong>Start Date:</strong> {start} </p></tr>
                            <tr><p className="iopStandard"><strong>End Date:</strong> {end} </p></tr>
                            <tr><p className="iopStandard"><strong>Work ID:</strong> {event.workId} </p></tr>
                            <tr><p className="iopStandard"><strong>Work Type:</strong> {event.workType} </p></tr>
                        </div>
                    </div>
                    <div className="row" >
                        <div className="col-md-12 col-sm-12">
                            <tr><p className="iopStandard"><strong>Description:</strong> {event.description} </p></tr>
                            <tr><p className="iopStandard"><strong>Attachments:</strong></p>
                                {event.files && event.files.length > 0
                                    ? rows_files : <p className="iopStandard"> No Attachments </p>}</tr>
                        </div>
                    </div>
                    <div className="row" >
                        <div className="col-md-12 col-sm-12">
                            <tr>
                                <p className="iopStandard"><strong>Comments:</strong></p>
                                <OpsComments comments={event.comments} />
                            </tr>
                        </div>
                    </div>
                </tbody>
                
                <DialogActions>
                    <FlatButton
                        // label="Ok"
                        primary
                        onClick={closeEventOutOfLocation}
                    // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                    >OK</FlatButton>
                </DialogActions>
            </div>
            </DialogContent>
        </Dialog>
    )
}


export function renderEventViewUpdateWithoutDialog(event, showEventOutOfLocation, closeEventOutOfLocation, updateFlag, updateEvent, loginId, downloadVSFile) {

    function fileDownload(file_name, file_Id) {
        downloadVSFile(loginId, file_Id).then(action => {
            if (action.filedata && action.filedata.file_data) {
                let blob = dataURItoBlob(action.filedata.file_data)
                startDownload(blob, file_name)
            }
        })
    }
    const rows_files = []
    if (event.files && event.files.length > 0) {
        event.files.map(function (file) {
            var row1 = file['preview'] ? <a target="_blank" href={file['preview']} style={{ color: '#2196f3', cursor: 'pointer' }}>{file['file_name']}</a> : <span style={{ color: '#FFF', cursor: 'pointer' }} onClick={() => fileDownload(file['file_name'], file['file_Id'])}>{file['file_name']}</span>

            rows_files.push(
                <span key={file['file_name']} className="file_tag_designe">
                    {row1}
                </span>)
        })
    }

    const DATE_TIME_FORMAT = 'MM-DD-YYYY hh:mm A'
    let start = '', end = ''
    if (event.start != null && event.end != null) {
        start = moment(event.start).format(DATE_TIME_FORMAT)
        end = moment(event.end).format(DATE_TIME_FORMAT)
    } else {
        start = 'NA'
        end = 'NA'
    }
    let actions
    if (updateFlag) {
        actions = [
            <FlatButton
                // label="Ok"
                primary
                onClick={closeEventOutOfLocation}
                // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
            >OK</FlatButton>,
            <FlatButton
                // label="Edit"
                primary
                onClick={updateEvent}
                // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
            >Edit</FlatButton>
        ]
    } else {
        actions = [
            <FlatButton
                // label="Ok"
                primary
                onClick={closeEventOutOfLocation}
                // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
            >OK</FlatButton>
        ]
    }

    return (
        <div style={{ overflowX: 'scroll', marginLeft: '10px', width : '100%' }}>
            <tbody>
                <div className="row">
                    <div className="col-md-12 col-sm-12">
                        <tr><p className="iopStandard" style={{ paddingTop: 15 }}><strong>Status:</strong> {event.status}</p> </tr>
                        <tr><p className="iopStandard"><strong>Category:</strong> {event.category}</p> </tr>
                        <tr><p className="iopStandard"><strong>Start Date:</strong> {start} </p></tr>
                        <tr><p className="iopStandard"><strong>End Date:</strong> {end} </p></tr>
                        <tr><p className="iopStandard"><strong>Work ID:</strong> {event.workId} </p></tr>
                        <tr><p className="iopStandard"><strong>Work Type:</strong> {event.workType} </p></tr>
                    </div>
                </div>
                <div className="row" >
                    <div className="col-md-12 col-sm-12">
                        <tr><p className="iopStandard"><strong>Description:</strong> {event.description} </p></tr>
                        <tr><p className="iopStandard"><strong>Attachments:</strong></p>
                            {event.files && event.files.length > 0
                                ? rows_files : <p className="iopStandard"> No Attachments </p>}</tr>
                    </div>
                </div>
                <div className="row" >
                    <div className="col-md-12 col-sm-12">
                        <tr>
                            <OpsComments comments={event.comments} />
                        </tr>
                    </div>
                </div>
            </tbody>
        </div>
    )
}