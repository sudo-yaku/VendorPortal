import React from 'react';
import Loader from '../../Layout/components/Loader';
import RefreshPage from '../images/Reload.png'
import { utcToLocal } from '../../date_utils';
import { DataGrid } from "@mui/x-data-grid"

const NotesAndAttachments = (props) => {
    let notesColumns = [
        {
            headerName: "Notes",
            field: "text",
            flex: 1
        }, {
            headerName: "System",
            field: "source",
            flex: 1,
            renderCell: (row) =>{
                return row.row.source == "VP" ? "Vendor Portal" : row.row.source   
            }
        }, {
            headerName: "Created By",
            field: "created_by_name",
            flex: 1
        }, {
            headerName: `Created On`,
            field: "created_on",
            flex: 1,
            renderCell: (row) =>{
                return utcToLocal(row.row.created_on)
            }
        }
    ]
    let attachmentsColumns = [
        {
            headerName: "Attachments",
            field: "file_name",
            flex: 1,
            renderCell: (row) =>{
                return <span style={{ color: 'blue', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => props.fileDownload(row.row.file_name, row.row.lock_unlock_attachment_id)}>{row.row.file_name}</span>
            },
        }, {
            headerName: "System",
            field: "source",
            flex:1,
            renderCell: (row) =>{
                return row.row.source == "VP" ? "Vendor Portal" : row.row.source
            },
        }, {
            headerName: "Uploaded By",
            field: "uploaded_by",
            flex: 1
        }, {
            headerName: `Uploaded On(${props.timeZone})`,
            field: "uploaded_on",
            flex: 1
        }
    ]
    return (
        <>
            {props.lockDataLoading && <Loader color="#cd040b" size='20px' margin="3px" className="text-center" />}
            <div style={{ "padding": "10px" }}>
                <div style={{ display: "flex", alignContent: "center", alignItems: "center", marginLeft: "16px" }}>Refresh
                    <a onClick={props.getLockUnlockData} className="navbar-brand pointer float-left" data-tip data-for="Refresh" >
                        <small>
                            <img src={RefreshPage} style={{ height: '27px' }} />
                        </small>
                    </a>
                </div>
                <div className="col-md-12" style={{ overflow: "hidden", minHeight : '200px', height: '300px' }} >
                    <DataGrid 
                        columns={notesColumns}
                        rows={props.notesData}
                        getRowId={(row) => row.lock_unlock_note_id}
                        rowHeight={35}
                        columnHeaderHeight={35}
                        initialState={{
                            pagination: {
                              paginationModel: { page: 0, pageSize: 10}
                            },
                          }}
                        pageSizeOptions={[10, 15, 20]}
                        sx={{ 
                            '& .MuiTablePagination-toolbar > *': {fontSize: '1rem'},
                            '& .MuiTablePagination-toolbar': {alignItems: 'flex-end'},
                            '& .MuiTablePagination-input': {marginBottom: '7px'},
                            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                            fontSize:'13px',
                            minheight:'100px'  
                            }}
                        disableRowSelectionOnClick
                    />
                </div>
            </div>
            <div style={{ "padding": "10px" }} >
                <div style={{ marginLeft: "15px" }}><b>Attachments</b></div>
                <div className="col-md-12" style={{ overflow: "hidden", minHeight : '200px', height: '300px' }} >
                    <DataGrid 
                        columns={attachmentsColumns}
                        rows={props.attachementsData}
                        getRowId={(row) => row.lock_unlock_attachment_id}
                        rowHeight={27}
                        columnHeaderHeight={35}
                        initialState={{
                            pagination: {
                              paginationModel: { page: 0, pageSize: 10}
                            },
                          }}
                        pageSizeOptions={[10, 15, 20]}
                        sx={{ 
                            '& .MuiTablePagination-toolbar > *': {fontSize: '1rem'},
                            '& .MuiTablePagination-toolbar': {alignItems: 'flex-end'},
                            '& .MuiTablePagination-input': {marginBottom: '7px'},
                            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                            fontSize:'13px',
                            minheight:'100px'  
                            }}
                        disableRowSelectionOnClick
                    />
                </div>
            </div>
        </>
    )
}
export default NotesAndAttachments;