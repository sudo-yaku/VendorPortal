import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import ReactTable from "react-table";
import checkboxHOC from "react-table/lib/hoc/selectTable";

const ReactTableWithCheckbox = checkboxHOC(ReactTable);

const SiteGrid = (props) => {
  // Use selector instead of connect/mapStateToProps
  const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));

  const {
    filtered,
    toggleSelection,
    toggleAll,
    isSelected,
    selectAllSites,
    sites,
    setRef,
    renderCreateScheduleActions,
  } = props;

  const columns = [
    {
      Header: "Action",
      Cell: (row) => {
        if (isSelected(row.original.site_unid)) {
          return renderCreateScheduleActions();
        } else {
          return <div></div>;
        }
      },
    },
    {
      Header: "Site #",
      accessor: "site_id",
    },
    {
      Header: "Site Name",
      accessor: "site_name",
      filterAll: true,
      id: "all",
      filterMethod: (filter, rows) => {
        if (rows) {
          const x = rows.filter((row) => {
            let result = false;
            const keys = ["site_name", "site_id"];
            for (let i = 0; i < keys.length; i++) {
              if (
                String(row._original[keys[i]])
                  .toLowerCase()
                  .includes(filter.value.toLowerCase())
              ) {
                result = true;
                break;
              }
            }
            return result;
          });
          return x;
        }
      },
    },
    {
      Header: "Switch Name",
      accessor: "switch",
    },
    {
      Header: "Site Engineer",
      accessor: "tech_name",
    },
    {
      Header: "Site Manager",
      accessor: "mgr_name",
    },
  ];

  return (
    <div className="Col Col-12 no-padding">
      <style>
        {`
          .rt-resizable-header-content {
              font-weight: 600;
              color: #060606;
              padding: 8px;
          }
          .ReactTable .rt-thead .rt-th.-sort-asc, .ReactTable .rt-thead .rt-td.-sort-asc {
              box-shadow: inset 0 3px 0 0 rgb(2, 2, 2);
          }
          .rt-td {
            text-align: center;
          }
        `}
      </style>
      <ReactTableWithCheckbox
        selectAll={selectAllSites}
        isSelected={isSelected}
        toggleSelection={toggleSelection}
        toggleAll={toggleAll}
        selectType={"checkbox"}
        data={sites}
        columns={columns}
        defaultPageSize={5}
        filtered={filtered}
        sortable={true}
        multiSort={true}
        resizable={true}
        className="-striped -highlight"
        ref={(r) => setRef(r)}
        getTrProps={(state, rowInfo) => {
          if (rowInfo && rowInfo.row) {
            const selected = isSelected(rowInfo.original.site_unid);
            return {
              style: {
                backgroundColor: selected ? "#BDBDBD" : "inherit",
              },
            };
          } else {
            return {};
          }
        }}
      />
    </div>
  );
};

SiteGrid.propTypes = {
  workorders: PropTypes.object,
  onRowClickCallBack: PropTypes.func,
  filtered: PropTypes.array,
  toggleSelection: PropTypes.func,
  toggleAll: PropTypes.func,
  isSelected: PropTypes.func,
  selectAllSites: PropTypes.bool,
  selectedSites: PropTypes.array,
  sites: PropTypes.array,
  setRef: PropTypes.func,
  onCreateVWR: PropTypes.func,
  viewCalendar: PropTypes.func,
  renderCreateScheduleActions: PropTypes.func,
};

export default SiteGrid;