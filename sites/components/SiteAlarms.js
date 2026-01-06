import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactTooltip from "react-tooltip";
import ReactTable from "react-table";
import moment from "moment";
import RefreshPage from "../images/RefreshIcon.png";
import Loader from "../../Layout/components/Loader";
import { useDispatch } from "react-redux";
import { fetchVSMAlarmsForSite } from "../../Alarms/actions";

const SiteAlarms = ({ workORderInfo, selectedRow }) => {
  const [alarmsData, setAlarmsData] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const isMounted = useRef(true);

  const dispatch = useDispatch();

  const renderIcon = (row) => {
    let color = '';
    if (row.row.severity === 'Indeterminate') color = '#008330';
    else if (row.row.severity === 'Minor') color = '#FFBC3D';
    else if (row.row.severity === 'Major') color = '#ED7000';
    else if (row.row.severity === 'Critical') color = 'red';
    else if (row.row.severity === 'Warning') color = '#0077B4';
    else color = 'black';
    return (
      <span className="btn" style={{ color: '#fff', backgroundColor: color, borderRadius: '3px !important' }}>
        {row.row.severity}
      </span>
    );
  };

  const formatDateCell = (date) => (
    <span>{moment(date).utc().format('MM/DD/YYYY HH:mm a')} UTC</span>
  );

  const fetchAlarms = useCallback(() => {
    setShowLoader(true);
    let unid = workORderInfo && workORderInfo.get('site_unid')
      ? workORderInfo.get('site_unid')
      : selectedRow
      ? selectedRow.site_unid
      : '';
    dispatch(fetchVSMAlarmsForSite(unid)).then((action) => {
      if (action && action.type === "FETCH_VSM_ALARMS_FOR_SITE_FAILURE") {
        if (isMounted.current) setShowLoader(false);
      } else {
        const alarms = action.alarms || [];
        const Indeterminate = alarms.filter(a => a.severity === 'Indeterminate');
        const Minor = alarms.filter(a => a.severity === 'Minor');
        const Major = alarms.filter(a => a.severity === 'Major');
        const Critical = alarms.filter(a => a.severity === 'Critical');
        const Warning = alarms.filter(a => a.severity === 'Warning');
        if (isMounted.current) setAlarmsData([...Critical, ...Major, ...Minor, ...Warning, ...Indeterminate]);
        if (isMounted.current) setShowLoader(false);
      }
    });
  }, [workORderInfo, selectedRow, dispatch]);

  useEffect(() => {
    isMounted.current = true;
    fetchAlarms();
    return () => {
      isMounted.current = false;
    };
  }, [fetchAlarms]);

  const alarmsColumns = [
    {
      Header: 'Severity',
      accessor: "severity",
      Cell: row => renderIcon(row),
    },
    {
      Header: "AMO Name",
      accessor: "amo_name",
      style: { whiteSpace: 'unset', overflowWrap: 'break-word' },
      width: 280
    },
    {
      Header: "Description",
      accessor: "description",
      style: { whiteSpace: 'unset', overflowWrap: 'break-word' },
      width: 180
    },
    {
      Header: "Created",
      accessor: "created",
      Cell: row => formatDateCell(row.row.created),
      style: { whiteSpace: 'unset', overflowWrap: 'break-word' }
    },
    {
      Header: "Updated",
      accessor: "updated",
      Cell: row => formatDateCell(row.row.updated),
      style: { whiteSpace: 'unset', overflowWrap: 'break-word' }
    },
    {
      Header: "Correlates Count",
      accessor: "correlates_count"
    },
    {
      Header: "Count",
      accessor: "count"
    },
    {
      Header: "Alert Name",
      accessor: "name",
      style: { whiteSpace: 'unset', overflowWrap: 'break-word' }
    },
    {
      Header: "Manager Name",
      accessor: "manager_name",
      style: { whiteSpace: 'unset', overflowWrap: 'break-word' },
      width: 150
    }
  ];

  return (
    <div>
      {showLoader ? (
        <Loader color="#cd040b" size="35px" margin="4px" className="text-center" />
      ) : (
        <div>
          <a onClick={fetchAlarms} className="pointer float-right" data-tip data-for="Refresh">
            <small>
              <img src={RefreshPage} style={{ height: '20px' }} alt="Refresh" />
            </small>
          </a>
          <ReactTooltip id="Refresh" place="top" effect="float">
            <span>Refresh</span>
          </ReactTooltip>
           {alarmsData.length > 0 ? 
          <div style={{ paddingTop: "30px" }}>
            <ReactTable
              data={alarmsData}
              columns={alarmsColumns}
              defaultPageSize={10}
              resizable={true}
              className="-striped -highlight site-access-table"
            />
          </div>:
            'No Active Alarms'}
        </div>
      )}
    </div>
  );
};

export default SiteAlarms;