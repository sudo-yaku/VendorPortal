import React, { useState, useEffect, useCallback, useRef } from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import { List, Map, fromJS } from "immutable"
import { DataGrid } from '@mui/x-data-grid'
import moment from 'moment'

let DISPLAY_FORMAT_2 = 'MM/DD/YYYY'

const RMAGrid = (props) => {
  const [rmaData, setRmaData] = useState([])
  const apiRef = useRef()

  const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""))
  const rma = useSelector(state => state.getIn(["VendorDashboard", loginId, "rma_data"], List()))

  useEffect(() => {
    let rmaList = rma.toJS() || []
    if (rmaList && rmaList.length) {
      setRmaData(rmaList)
    } else {
      setRmaData([])
    }
  }, [rma])

  const calculateLastBusinessDay = useCallback((rmaItem) => {
    const { STATUS, LAST_BUSINESS_DAY_TO_RECEIVE, LASTBUSINESSDAY, S4_FORWARD_DISPOSITION } = rmaItem
    
    if (STATUS === 'SHIPPED') {
      return ''
    }

    let baseDate
    let daysToAdd

    if (STATUS?.toUpperCase() == 'DELIVERED' && ['FSL','DC'].includes(S4_FORWARD_DISPOSITION)) {
      baseDate = LASTBUSINESSDAY
      daysToAdd = 5
    } else if (STATUS?.toUpperCase() == 'DELIVERED' && S4_FORWARD_DISPOSITION == 'OEM_AE') {
      baseDate = LASTBUSINESSDAY
      daysToAdd = 7
    } else {
      return LAST_BUSINESS_DAY_TO_RECEIVE || ''
    }

    if (!baseDate) return ''

    let currentDate = moment(baseDate)
    currentDate = currentDate.add(daysToAdd, 'days')

    return currentDate.format(DISPLAY_FORMAT_2)
  }, [])

  const shouldHighlightRow = useCallback((rmaItem) => {
    const lastBusinessDay = calculateLastBusinessDay(rmaItem)
    if (!lastBusinessDay) return false

    const today = moment()
    const lastDay = moment(lastBusinessDay, DISPLAY_FORMAT_2)
    const daysDiff = lastDay.diff(today, 'days')
    
    return daysDiff < 2
  }, [calculateLastBusinessDay])

  const getRowId = useCallback((row) => {
    return row.IOP_RMA_ID || row.RMA_NUMBER || row.id || Math.random()
  }, [])

  const handleApiRef = useCallback((params) => {
    apiRef.current = params
    window.addEventListener('resize', function() {
      setTimeout(function() {
        params?.autosizeColumns({
          includeHeaders: true,
          includeOutliers: true,
        })
      })
    })
  }, [])

  const getSiteNameFromWorkOrder = (vwrsId) => {
    if (!props.workOrders || !vwrsId) return ''
    const matchingWorkOrder = props.workOrders.find(wo =>
      wo.workorder_id === vwrsId || wo.workorder_id === parseInt(vwrsId)
    )
    return matchingWorkOrder?.site_name || ''
  }

  const getProcessedData = useCallback(() => {
    
    if (props.rmaDetails?.length > 0) {
      let data = rmaData?.filter(item => props.rmaDetails.includes(item?.RMA_DETAILS_ID))
      data = data.sort((a, b) => {
        const dateA = calculateLastBusinessDay(a)
        const dateB = calculateLastBusinessDay(b)
        
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        
        const momentA = moment(dateA, DISPLAY_FORMAT_2)
        const momentB = moment(dateB, DISPLAY_FORMAT_2)
        
        return momentA.diff(momentB)
      })
      
      return data.map((row, index) => {
        const siteNameFromWorkOrder = getSiteNameFromWorkOrder(row.VWRS_ID)
        return {
          ...row,
          id: row.RMA_DETAILS_ID,
          site_name: siteNameFromWorkOrder || ''
        }
      })
    } else {
      return []
    }   
  }, [rmaData, props.rmaDetails, calculateLastBusinessDay])

  const columns = [
    {
      field: 'VWRS_ID',
      headerName: 'WorkOrderID',
      flex: 1,
      filterable: true
    },
    {
      field: 'RMA_DETAILS_ID',
      headerName: 'IOPRMAID',
      flex: 0.7,
      filterable: true
    },
    {
      field: 'S4_SAP_RETURN_REQUEST',
      headerName: 'S4ReturnRequestID',
      flex: 1,
      filterable: true
    },
    {
      field: 'STATUS',
      headerName: 'Status',
      flex: 0.8,
      filterable: true
    },
    {
      field: 'site_name',
      headerName: 'SiteName',
      flex: 1,
      filterable: true
    },
    {
      field: 'RMA_PART_CODE',
      headerName: 'PartCode',
      flex: 0.8,
      filterable: true
    },
    {
      field: 'ASSET_CODE',
      headerName: 'SerialNumber',
      flex: 0.8,
      filterable: true
    },
    {
      field: 'LAST_BUSINESS_DAY_TO_RECEIVE',
      headerName: 'LastBusinessDayToReceive',
      flex: 1.2,
      renderCell: (params) => {
        if (params.row.STATUS === 'SHIPPED' && (params?.row?.S4_FORWARD_DISPOSITION == 'FSL' || params?.row?.S4_FORWARD_DISPOSITION == 'DC')) return <span></span>
        const date = calculateLastBusinessDay(params.row)
        return <span title={date || null}>{date || ''}</span>
      },
      filterable: false
    }
  ]
  if(!['delivered', 'shipped'].includes(props.title?.toLowerCase())) {
    columns.push({
      field: 'DELIVERY_SCANNED_ON_TIME',
      headerName: 'ScanOnTime',
      flex: 1,
      renderCell: (params) => {
        return <span>{params?.row?.DELIVERY_SCANNED_ON_TIME || '-'}</span>
      },
      filterable: false
    })
  }
  const processedData = getProcessedData()

  return (
    <div className="Col Col-12 no-padding">      
      <DataGrid
        apiRef={handleApiRef}
        checkboxSelection={false}
        rows={processedData}
        columns={columns}
        getRowId={getRowId}
        onRowClick={(params) => {
          if (props.onRowClickCallBack) {
            props.onRowClickCallBack(fromJS(params.row))
          }
        }}
        getRowClassName={(params) => {
          if (!params || !params.row) return ''
          return shouldHighlightRow(params.row) ? 'orange-row' : ''
        }}
        hideFooterSelectedRowCount
        rowHeight={30}
        disableMultipleRowSelection={true}
        disableSelectionOnClick
        columnHeaderHeight={35}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }
          },
          sorting: {
            sortModel: [{ field: 'lastBusinessDay', sort: 'asc' }]
          }
        }}
        pageSizeOptions={[10, 15, 20]}
        sx={{
          fontSize: '1rem',
          minHeight: 300,
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
          '& .MuiTablePagination-toolbar > *': {
            fontSize: '1rem'
          },
          '& .MuiTablePagination-toolbar': {
            alignItems: 'flex-end'
          },
          '& .MuiTablePagination-input': {
            marginBottom: '7px'
          },
          '& .orange-row': { 
            background: 'sandybrown',
            '&:hover': {
              background: 'sandybrown',
            },
            '&.Mui-selected': {
              background: 'sandybrown',
              '&:hover': {
                background: 'sandybrown',
              }
            }
          }
        }}
      />
    </div>
  )
}

RMAGrid.propTypes = {
  onRowClickCallBack: PropTypes.func,
  filtered: PropTypes.array,
  title: PropTypes.string,
  path: PropTypes.string,
  rmaDetails: PropTypes.array,
  workOrders: PropTypes.array
}

export default RMAGrid
