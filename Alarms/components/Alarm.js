import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fromJS } from 'immutable'
import * as alarmAction from '../actions'
import * as tableActions from '../../Layout/table_actions'
import SearchBar from '../../Forms/components/SearchBar'
import * as tableUtils from '../../Layout/table_utils'
import moment from 'moment'
import { DISPLAY_FORMAT } from '../../date_utils'

const tableName = 'AlarmTable'
const AlarmTable = (props) => {
  const dispatch = useDispatch();
  let loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
  let site_unid = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails", "site_unid"]))
  let sortColumn = useSelector(state => state.getIn(['Tables', tableName, 'sortedColumn', 'columnID'], 'amo_name'))
  let sortOrder = useSelector(state => state.getIn(['Tables', tableName, 'sortedColumn', 'sortOrder'], 'asc'))
  let alarms = useSelector(state => state.getIn(['Alarms', 'values', site_unid, 'alarms']));
  alarms = orderData(alarms);
  let searchTerm = useSelector(state => state.getIn(['Tables', tableName, 'searchTerm']));
  let rows = []
  alarms = tableUtils.filterRows(alarms, searchTerm, ['amo_name', 'description'])
  alarms.forEach(data => {
    rows.push(<AlarmData key={data.get("amo_name")} obj={data} onRowClick={onRowClick} id={alarms.indexOf(data) + "AlarmTable"} />)
  })
  useEffect(() => {
    console.log("props", props);
    dispatch(alarmAction.fetchVSMAlarmsForSite(site_unid));
  })

  const onHeaderClick = columnId => {
    dispatch(tableActions.sortByColumn(tableName, columnId));
  }

  const onSearchSubmit = searchTerm => {
    tableActions.filterTable(tableName, searchTerm)
  }

  const onRowClick = currentObj => {
    props.onRowClickCallBack(currentObj)
  }
  const renderFilters = () => {
    return (<div className="table-top Col-12">
      <div className="search-bar Col-2">
        <SearchBar tableName={tableName} />
      </div>
    </div>)
  }
  return (
    <div className="table-responsive" id="user-table">
      {renderFilters()}
      <table id="AlarmTable" key="AlarmTable" cellSpacing="0" width="100%" className="Table Table--hover" data-toggle="table" data-locale="en-us">
        <TableHeaderRow onCellClick={onHeaderClick} sortColumn={sortColumn} sortOrder={sortOrder} />
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan="10" scope="row" className="text-center">
                No User Data ...
              </td>
            </tr>
          )}
          {rows}
        </tbody>
      </table>
    </div>
  )

}
const AlarmData = (props) => {
  let { obj, onRowClick, id } = props;
  return (
    <tr onClick={() => onRowClick(obj)} key={id + "tr"}>
      <td scope="row" data-lable="AMO Name" >{obj.get('amo_name')}</td>
      <td scope="row" data-lable="Description" >{obj.get('description')}</td>
      <td scope="row" data-lable="Severity" className={obj.get('severity')}>{obj.get('severity')}</td>
      <td scope="row" data-lable="Created" >{moment(obj.get('created')).format(DISPLAY_FORMAT)}</td>
      <td scope="row" data-lable="Updated" >{moment(obj.get('updated')).format(DISPLAY_FORMAT)}</td>
      <td scope="row" data-lable="NOC Ticket" >{obj.get('remedyticket')}</td>
      <td scope="row" data-lable="Correlates Count" >{obj.get('correlates_count')}</td>
      <td scope="row" data-lable="Count" >{obj.get('count')}</td>
      <td scope="row" data-lable="Alert Name" >{obj.get('name')}</td>
      <td scope="row" data-lable="Manager Name" >{obj.get('manager_name')}</td>
    </tr>
  )
}

const TableHeaderRow = (props) => {
  const { onCellClick, sortColumn, sortOrder } = props
  const downArrow = <i className="glyphicon glyphicon-triangle-bottom" />
  const upArrow = <i className="glyphicon glyphicon-triangle-top" />
  const getArrow = column => {
    return column === sortColumn ? (sortOrder === 'desc' ? upArrow : downArrow) : null
  }
  return (
    <thead className="">
      <tr>
        <th scope="col" onClick={() => onCellClick('amo_name')}>AMO Name{getArrow('amo_name')}</th>
        <th scope="col" onClick={() => onCellClick('description')}>Description{getArrow('description')}</th>
        <th scope="col" onClick={() => onCellClick('severity')}>Severity {getArrow('severity')}</th>
        <th scope="col" onClick={() => onCellClick('created')}>Created {getArrow('created')}</th>
        <th scope="col" onClick={() => onCellClick('updated')}>Updated {getArrow('updated')}</th>
        <th scope="col" onClick={() => onCellClick('remedyticket')}>NOC Ticket {getArrow('remedyticket')}</th>
        <th scope="col" onClick={() => onCellClick('correlates_count')}>Correlates Count {getArrow('correlates_count')}</th>
        <th scope="col" onClick={() => onCellClick('count')}>Count {getArrow('count')}</th>
        <th scope="col" onClick={() => onCellClick('name')}>Alert Name {getArrow('name')}</th>
        <th scope="col" onClick={() => onCellClick('manager_name')}>Manager Name {getArrow('manager_name')}</th>

      </tr>
    </thead>
  )
}
function orderData(obj) {
  const defaultSortColumn = fromJS({ columnId: 'amo_name', sortOrder: 'asc' })
  const sortColumn = useSelector(state => state.getIn(['Tables', tableName, 'sortedColumn'], defaultSortColumn))
  const column = sortColumn.get('columnID')
  const order = sortColumn.get('sortOrder')
  obj = obj.sort((a, b) => {
    a = a.get(column, 0)
    b = b.get(column, 0)

    if (a != null && b != null) {
      a = a.toString().toLowerCase()
      b = b.toString().toLowerCase()
    }

    if (order === 'asc') {
      if (a > b) return 1
      if (a < b) return -1
    } else {
      if (a < b) return 1
      if (a > b) return -1
    }
    return 0
  })

  return obj
}
export default AlarmTable;
