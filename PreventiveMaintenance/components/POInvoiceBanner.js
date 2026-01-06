import React from 'react'
import PropTypes from 'prop-types'
import { DataGrid } from '@mui/x-data-grid'

export default function POInvoiceBanner ({sites}) {
    let columns = [
        {
            headerName: "PM LIST NAME",            
            field: "PM_LIST_NAME",
            flex: 2.5
        },
        {
            headerName: "PO #",
            field: "PO_NUM",
            flex: 1,
        },
        {
           headerName:"PS LOCATION ID",           
           field:"PS_LOCATION_ID",
           flex: 1
        },
        {
           headerName:"SITE ID",
           field:"SITE_ID",
           flex: 1
        },
        {
           headerName:"SITE NAME",
           field:"PM_LOCATION_NAME",
           flex:1.6
        },
        {
           headerName:"LINE",
           field:"LINE",
            flex: 0.5
        },
        {
           headerName:"COST",
           field:"PM_COST",
           flex: 0.5,
        },
        {
           headerName:"SITE STATUS",
           field:"ITEM_STATUS",
           flex: 0.8
        },
        {
           headerName:"START DATE",
           field:"START_DATE",
           flex: 0.6
        },
        {
           headerName:"DUE DATE",
           field:"DUE_DATE",
           flex: 0.6
        },
        {
           headerName:"COMPLETED DATE",
           field:"COMPLETED_DATE",
           flex: 1
        },
        {
           headerName:"COMPLETED BY",
           field:"COMPLETED_BY",
           flex: 1.5
        }
    ]

    const getRowId = (row) => {
      return row.PM_LIST_ITEM_ID
    }
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
  

  return (
  <div className="col-lg-12 col-12">

      <DataGrid 
         columns={columns}
         rows={sites}
         apiRef={apiRef}
         rowHeight={35}
         columnHeaderHeight={45}
         initialState={{
            pagination: {
               paginationModel: { page: 0, pageSize: 10 },
            },
         }}
         pageSizeOptions={[10, 15, 20]}
         getRowId={getRowId}
         sx={{
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold',  },
            fontSize: '1rem',
            minHeight: 200,
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
  </div>
  )
}

POInvoiceBanner.propTypes = {sites: PropTypes.array.isRequired}
