import React, { Component } from "react"
import PropTypes from "prop-types"
// import { connect } from "react-redux"
import { useState, useEffect } from 'react';
import {DataGrid} from '@mui/x-data-grid';
// import { formatDate } from "../../date_utils"

// let DISPLAY_FORMAT_2 = "MM/DD/YYYY"

function CapitalDashboardGrid(props) {
  const [projects, setProjects] = useState(props.projects)


  const apiRef = params =>{
    window.addEventListener('resize', function() {
      setTimeout(function() {
        params?.autosizeColumns({
          includeHeaders: true,
          includeOutliers: true,
        })
      })
    })
}
const getRowId =(row) => {
    return row.proj_number;
}
  let columns = [
    {
      headerName: "Project Id",
      field: "proj_number",
      flex:  1
    },
    {
      headerName: "Project Type",
      field: "project_type",
      flex: 1
    },
    {
      headerName: "Project Name",
      field: "project_name",
      flex: 1
    },
    {
      headerName: "Address",
      field: "address",
      flex: 1

    },
    {
      headerName: "Project Status",
      field: "project_status",
      flex: 1
    },
    {
      headerName: "Site Id",
      field: "siteid",
      flex: 1
    },
    {
      headerName: "Site Type",
      field: "sitetype",
      flex: 1
    },
    {
      headerName: "Area",
      field: "market",
      flex: 1
    },
    {
      headerName: "Market",
      field: "sub_market",
      flex: 1
    }
  ]
  return (
    <div className="Col Col-12 no-padding">
      <DataGrid
                    apiRef={apiRef}
                    checkboxSelection={false}
                    rows={projects}
                    columns={columns}
                    hideFooterSelectedRowCount
                    rowHeight={30}
                    columnHeaderHeight={35}
                    getRowId={getRowId}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10}
                      }
                    }}
                    pageSizeOptions={[10, 15, 20]}
                    sx={{
                      fontSize: '1rem',
                      minHeight: 300,
                      '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold',  },
                      '& .MuiTablePagination-toolbar > *': {
                          fontSize: '1rem'
                      },
                      '& .MuiTablePagination-toolbar': {
                          alignItems: 'flex-end'
                      },
                      '& .MuiTablePagination-input': {
                          marginBottom: '7px'
                      }
                  }}
                  />
      {" "}
    </div>
  )
}

CapitalDashboardGrid.propTypes = {
  projects: PropTypes.object,
  onGridReady: PropTypes.func
}
export default CapitalDashboardGrid