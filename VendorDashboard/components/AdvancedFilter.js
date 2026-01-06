import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { fetchAdvancedHistory } from "../actions"
import { List, Map } from "immutable"
import { useDispatch, useSelector } from "react-redux"
import Select from 'react-select'
import Loader from '../../Layout/components/Loader'
import moment from 'moment'
import { SingleDatePicker } from 'react-dates'
import { FILTER_STATUS } from '../utils'
import MessageBox from '../../Forms/components/MessageBox'
import Typography from '@mui/material/Typography';
function AdvancedFilter(props) {
  const dispatch = useDispatch();
  let loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
  let isLoading = useSelector(state => state.getIn(["VendorDashboard", loginId, "advancedHistory", "isLoading"], false))
  let vendorId = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "vendor_id"], ""))
  let history = useSelector(state => state.getIn(["VendorDashboard", loginId, "user_dashboard", "history"], List()))
  let user = useSelector(state => state.getIn(['Users', 'entities', 'users', loginId], Map()))
  let dashboardStartDate = useSelector(state => state.getIn(["VendorDashboard", loginId, "dateSearch", "startDate"], List()))
  let dashboardEndDate = useSelector(state => state.getIn(["VendorDashboard", loginId, "dateSearch", "endDate"], List()))

  const [startDate, setStartDate] = useState(moment(dashboardStartDate));
  const [endDate, setEndDate] = useState(moment(dashboardEndDate));
  const [startDateFocused, setStartDateFocused] = useState(null);
  const [endDateFocused, setEndDateFocused] = useState(false);
  const [statusSelected, setStatusSelected] = useState([]);
  const [woNumSearch, setWoNumSearch] = useState('');
  const [textError, setTextError] = useState(false);
  const [errorData, setErrorData] = useState("")

  const renderLoading = () => <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />

  const onChangeSearch = (e) => {
    if (isNaN(e)) {
      setTextError(true)
    } else {
      setTextError(false)
    }
    setWoNumSearch(e)
  };

  const searchHistory = () => {
    let inputDate = startDate
    let sDate = inputDate.year() + '-' + (inputDate.month() + 1) + '-' + inputDate.date()
    inputDate = endDate
    let eDate = inputDate.year() + '-' + (inputDate.month() + 1) + '-' + inputDate.date()
    let data = {
      history: history?.toJS()[0],
      filterStatus: statusSelected,
      searchVal: woNumSearch,
      startDate: sDate,
      endDate: eDate
    }
    let groupVendors = user.get('group_vendors') ? user.get('group_vendors').toJS() : null;

    if (woNumSearch) {
      vendorId = groupVendors ? groupVendors.map(g => g.vendor_id).toString() : vendorId
      dispatch(fetchAdvancedHistory(loginId, vendorId, woNumSearch)).then(action => {
        if (action.type == 'FETCH_ADVANCED_HISTORY_SUCCESS') {
          data.history = action.searchHistoryData.historyBucket[0]
          data.historyData = action.searchHistoryData.allHistoryData[0]
          props.onAdvancedSearchClick(data);
          close();
        } else if (action?.errors?.length) {
          setErrorData(action.errors)
          setTimeout(() => {
            setErrorData('')
          }, 10000);
        }
      })
    } else {
      let statusList = '';
      statusSelected?.forEach(status => statusList += status.value + ',')
      dispatch(fetchAdvancedHistory(loginId, vendorId, null, sDate, eDate, statusList)).then(action => {
        if (action.type == 'FETCH_ADVANCED_HISTORY_SUCCESS') {
          data.history = action.searchHistoryData.historyBucket[0]
          data.historyData = action.searchHistoryData.allHistoryData[0]
          props.onAdvancedSearchClick(data);
          close();
        } else if (action?.errors?.length) {
          setErrorData(action.errors)
          setTimeout(() => {
            setErrorData('')
          }, 10000);
        }
      })
    }
  }

  const resetFields = () => {
    setStartDate(moment(dashboardStartDate))
    setEndDate(moment(dashboardEndDate))
    setWoNumSearch('')
    setStatusSelected([])
    setTextError(false)
    setErrorData('')
  }
  return (
    <div>
      <div className="row margin-top-bottom-10 float-left" style={{ width: "100%" }}>
        <div className="row" style={{ width: "100%" }}>
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
            <div className="row" style={{ width: "100%" }}>
              <div className="col-6" id="start_Date" style={{ flex: "0 0 84.4%", maxWidth: "84.4%" }}>Start Date
                <SingleDatePicker
                  orientation={"vertical"}
                  verticalHeight={380}
                  numberOfMonths={1}
                  showDefaultInputIcon={false}
                  onDateChange={(startDate) => setStartDate(startDate)}
                  onFocusChange={({ focused }) => setStartDateFocused(focused)}
                  focused={startDateFocused}
                  isOutsideRange={() => false}
                  date={startDate}
                  block
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
            <div className="row" style={{ width: "100%" }}>
              <div className="col-6" id="end_Date" style={{ flex: "0 0 84.4%", maxWidth: "84.4%" }}>End Date
                <SingleDatePicker
                  orientation={"vertical"}
                  verticalHeight={380}
                  numberOfMonths={1}
                  onDateChange={(endDate) => setEndDate(endDate)}
                  onFocusChange={({ focused }) => setEndDateFocused(focused)}
                  focused={endDateFocused}
                  isOutsideRange={() => false}
                  date={endDate}
                  block
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row" style={{ width: "100%", marginTop: "0.5rem" }}>
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
            <div className="row" style={{ width: "100%" }}>
              <div className="col-6" id="Work_Order_Status" style={{ marginTop: "33px", flex: "0 0 84.4%", maxWidth: "84.4%" }}>Work Order Status
                <Select
                  name="filterWorkStatus"
                  value={statusSelected}
                  placeholder={"Select Work Status"}
                  options={FILTER_STATUS['Advanced_History']}
                  onChange={(value) => setStatusSelected(value)}
                  isClearable={true}
                  isMulti
                  disabled={woNumSearch ? true : false}
                  className="col-12 col-md-12 no-padding float-left"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <h2 style={{
          width: "100%",
          textAlign: "center",
          borderBottom: "1px solid lightgrey",
          lineHeight: "0.1em",
          margin: "20px 10px",
          color: "grey",
        }}>
          <span style={{
            background: "black",
            padding: "5px",
            color: "white",
            fontSize: "12px",
            borderRadius: "50%",
          }}
          > OR </span>
        </h2>
        <div className="row" style={{ width: "100%", marginTop: "0.5rem" }}>
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
            <div className="row" style={{ width: "100%" }}>
              <div className="col-6" style={{ flex: "0 0 84.6%", maxWidth: "84.6%" }} >Work Order Number<input
                type="text"
                style={{ padding: "1.3rem 0.3rem", borderBottom: "2px solid black", borderRadius: "0px" }}
                placeholder={"Enter Work Order Number, maximum 9 digits allowed"}
                maxLength={9}
                className="form-control"
                disabled={statusSelected?.length > 0 ? "disabled" : ""}
                value={woNumSearch}
                onChange={(e) => onChangeSearch(e.target.value)}
              />
              </div>
            </div>
            {textError ? <div><Typography style={{ color: 'red' }}>*Please enter Work Order ID as numeric only</Typography></div> : null}
          </div>
        </div>
        {isLoading ? renderLoading() :
          <div className="row justify-content-end" style={{ width: "100%", marginTop: "0.5rem" }}>
            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-4" style={{ maxWidth: "37.333%" }}>
              <div className="row" style={{ width: "100%" }}>
                <div className="col-6">
                  <button
                    type="submit"
                    style={{ width: "fit-content", 'padding': '0.5em 2.14em' }}
                    disabled={textError || statusSelected?.length == 0 && (woNumSearch.length == 0 || woNumSearch.length > 9)}
                    onClick={() => searchHistory()}>Search </button>
                </div>
                <div className="col-6">
                  <button
                    type="submit"
                    style={{ width: "fit-content", 'padding': '0.5em 2.14em' }}
                    onClick={() => resetFields()}>Reset</button>
                </div>
              </div>
            </div>
            {errorData?.length > 0 &&
              <div style={{ width: '98%', margin: '10px' }}>
                {errorData && <MessageBox messages={List([errorData])} onClick={() => setErrorData('')} />}
              </div>
            }
          </div>}
      </div>
    </div>
  );
}
AdvancedFilter.propTypes = {
  onAdvancedSearchClick: PropTypes.func.isRequired,
};
export default AdvancedFilter;