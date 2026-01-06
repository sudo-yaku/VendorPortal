import React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useDispatch ,useSelector} from "react-redux"
import { List ,Map} from 'immutable'
import VendorDashboardGrid from './VendorDashboardGrid'
import {updateAutoVpPermission, getUserInfoForCompanies} from './schema'
import {getCompaniesInfoForAllVendors} from './actions'
import Loader from "../Layout/components/Loader"
import * as XLSX from 'xlsx-js-style';
import ajax from '../ajax';
import { checkFastUserSchema } from '../UserDashboard/schema';
import moment from 'moment'
import SummaryDashboardGrid from "./SummaryDashboardGrid"

var NotificationSystem = require('react-notification-system')
const EssoVendorDashboard = () => {
    let notificationSystemRef = useRef()
    const dispatch = useDispatch();
  const [selectedVendors, setSelectedVendors] = useState([])
  const [allCompaniesData, setAllCompaniesData] = useState()
  const [enable, setEnable] = useState(true)
    const[isFastUser,setIsFastUser]=useState(false)
  const [vendorUnqIds, setVendorUnqIds] = useState([])
    const [vendorIds, setVendorIds] = useState([])
    const [loader,setLoader]=useState(false)
  const [disable, setDisable] = useState(true)
    const loginId = useSelector(state=>state.getIn(['Users', 'currentUser', 'loginId']));
    const user = useSelector(state=> state.getIn(['Users', 'entities', 'users', loginId], Map()))
  let userId = user && user.toJS().userid
  const [data, setData] = useState([])
  const [oswdata, setOswData] = useState([])
  const [updatedFlag, setUpdatedFlag] = useState(false)
  let areas = data?.map((d) => d.VENDOR_AREA)
  let markets = data?.map((d) => d.VENDOR_REGION)
  let allAreas = [...new Set(areas)]
  let allMarkets = [...new Set(markets)]
  let areasAll = [...new Set(areas)]
  //let areaVendors = {}
  // let areaVendorsEnabled = {}
  let allSubVendors = {}
  let allSubVendorsEnabled = {}
  let totalAuto = 0;
  let newarr = {};
  for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < areasAll.length; k++) {
      for (let j = 0; j < allMarkets.length; j++) {
        if (
          areasAll[k] == data[i].VENDOR_AREA &&
          allMarkets[j] == data[i].VENDOR_REGION
        ) {
          allSubVendors[allMarkets[j]] =
            (allSubVendors[allMarkets[j]] || 0) + 1
        }
        if (
          areasAll[k] == data[i].VENDOR_AREA &&
          allMarkets[j] == data[i].VENDOR_REGION &&
          data[i].IS_VPAUTO_ENABLED == "Enabled" &&
          oswdata.find(o => o.VENDOR_ID === data[i].VENDOR_ID)
        ) {
          totalAuto = totalAuto + 1
          allSubVendorsEnabled[allMarkets[j]] =
            (allSubVendorsEnabled[allMarkets[j]] || 0) + 1
        }
        if (
          areasAll[k] == data[i].VENDOR_AREA &&
          allMarkets[j] == data[i].VENDOR_REGION &&
          oswdata.find(o => o.VENDOR_ID === data[i].VENDOR_ID)
        ) {
          newarr[allMarkets[j]] =
            (newarr[allMarkets[j]] || 0) + 1
        }
      }
    }
  }


  // let newarr = oswdata?.reduce(function (acc, res) {
  //   acc[res.SUB_MARKET] = acc[res.SUB_MARKET] || 0
  //   acc[res.SUB_MARKET] = acc[res.SUB_MARKET] + 1
  //   return acc
  // }, Object.create([]))
  let sData =
    allMarkets
      ?.map((m) => ({
        VENDOR_AREA: data.find((d) => d.VENDOR_REGION == m).VENDOR_AREA,
        VENDOR_REGION: m,
        ALL_VENDOR: allSubVendors?.[m] || 0,
        OSW_VENDOR: newarr[m] || 0,
        OSW_ENABLED_COUNT: allSubVendorsEnabled[m] || 0,

        AUTO_OSW_PERCENTAGE : (((allSubVendorsEnabled[m]|| 0)/(newarr[m] || 1) *100).toFixed(0) + '%'),
      }))
      ?.sort((a, b) => a.VENDOR_AREA.localeCompare(b.VENDOR_AREA)) || []
  let totalOsw = 0;
  Object.values(newarr).forEach((i) => (totalOsw += i))
  sData.push({
    VENDOR_AREA: "",
    VENDOR_REGION: "Total",
    ALL_VENDOR: data.length || 0,
    OSW_VENDOR: totalOsw || 0,
    OSW_ENABLED_COUNT: totalAuto || 0,
  })

  let group_vendors = user.get("group_vendors")
  let vendor_data = group_vendors ? group_vendors.toJS() : null
  let group_regions = []
  let group_areas = []
  if (vendor_data && vendor_data.length > 0) {
    for (let i = 0; i < vendor_data.length; i++) {
      group_regions.push(vendor_data[i].vendor_region)
      group_areas.push(vendor_data[i].vendor_area)
    }
  }
    useEffect(()=>{
    getAllVendorDetails()
    },[])
    useEffect(()=>{
    setData([])
    dispatch(getCompaniesInfoForAllVendors())
      .then((res) => {
        setOswData(res.OSWVendors)
        return res.companyinfoforvendorDetails.map((r) => ({
          IS_VPAUTO_ENABLED:
            r.IS_VPAUTO_ENABLED == "N" ? "Disabled" : "Enabled",
          IS_GROUP_VISIBILITY: r.IS_GROUP_VISIBILITY == 1 ? "Yes" : "No",
          VDR_CMPNY_UNQ_ID: r.VDR_CMPNY_UNQ_ID,
          CMPNY_UUID: r.CMPNY_UUID,
          VENDOR_ID: r.VENDOR_ID,
          VENDOR_NAME: r.VENDOR_NAME,
          VENDOR_AREA: r.VENDOR_AREA,
          VENDOR_REGION: r.VENDOR_REGION,
          VENDOR_SERVICE_EMAIL: r.VENDOR_SERVICE_EMAIL,
          VENDOR_CONTACT_INFO: r.VENDOR_CONTACT_INFO,
          VENDOR_ADDRESS: r.VENDOR_ADDRESS,
          VENDOR_CITY: r.VENDOR_CITY,
          VENDOR_STATE: r.VENDOR_STATE,
          VENDOR_SPONSER_EMAIL: r.VENDOR_SPONSER_EMAIL,
          VENDOR_MDGLC: r.VENDOR_MDGID,
          VENDOR_UUID: r.VENDOR_UUID,
          OSW_VENDOR: res.OSWVendors.find((i) => i.VENDOR_ID === r.VENDOR_ID)
            ? "Y"
            : "N",
        }))
      })
      .then((r) => {
        setData(r)
      })
  }, [updatedFlag])
  const getAllVendorDetails = () => {
    let data = []
      if(loginId) {
        let vzid=loginId;
        ajax.post(`/graphql4g`, { query: checkFastUserSchema, variables: {vzid},}).then((res) => {
            if(res?.data?.data?.checkFastUser?.user 
              && res.data.data.checkFastUser.user.status==='A' 
              && (res.data.data.checkFastUser.user.role.toLowerCase().includes('fast') 
              || res.data.data.checkFastUser.user.role.toLowerCase().includes('admin')) 
              && !res.data.data.checkFastUser.user.role.toLowerCase().includes('fast_sp') )
            setIsFastUser(true)
        })
    }
    dispatch(getCompaniesInfoForAllVendors())
      .then((res) => {
        setAllCompaniesData(res)
        return res
      })
      .then((res) => {
        setOswData(res.OSWVendors)
        return res.companyinfoforvendorDetails.map((r) => ({
          IS_VPAUTO_ENABLED:
            r.IS_VPAUTO_ENABLED == "N" ? "Disabled" : "Enabled",
          IS_GROUP_VISIBILITY: r.IS_GROUP_VISIBILITY == 1 ? "Yes" : "No",
          VDR_CMPNY_UNQ_ID: r.VDR_CMPNY_UNQ_ID,
          CMPNY_UUID: r.CMPNY_UUID,
          VENDOR_ID: r.VENDOR_ID,
          VENDOR_NAME: r.VENDOR_NAME,
          VENDOR_AREA: r.VENDOR_AREA,
          VENDOR_REGION: r.VENDOR_REGION,
          VENDOR_SERVICE_EMAIL: r.VENDOR_SERVICE_EMAIL,
          VENDOR_CONTACT_INFO: r.VENDOR_CONTACT_INFO,
          VENDOR_ADDRESS: r.VENDOR_ADDRESS,
          VENDOR_CITY: r.VENDOR_CITY,
          VENDOR_STATE: r.VENDOR_STATE,
          VENDOR_SPONSER_EMAIL: r.VENDOR_SPONSER_EMAIL,
          VENDOR_MDGLC: r.VENDOR_MDGID,
          VENDOR_UUID: r.VENDOR_UUID,
          OSW_VENDOR: res.OSWVendors.find((i) => i.VENDOR_ID === r.VENDOR_ID)
            ? "Y"
            : "N",
        }))
      })
      .then((r) => {
        setData(r)
      })
  }
  const formExcelData = (item) => {
    let details = []
    let data = []
    let style = { font: { bold: true } }
      const header = ["Vendor Id", "Vendor Name", "Area", "Market", "MDG ID", "Service Email", "Group Vendor", "City", "State", "OSW Auto",
      "OSW Vendor"]
    let headers = []
      headers.push(header.map(el => {
        return { v: el, t: "s", s: style }
      })
    )

    for (let j = 0, end = item.length; j < end; j++) {
      let value = item[j]
      data.push([
        { v: value.VENDOR_ID, t: "n" },
        { v: value.VENDOR_NAME !== null ? value.VENDOR_NAME : "", t: "s" },
        { v: value.VENDOR_AREA, t: "s" },
        { v: value.VENDOR_REGION, t: "s" },
        { v: value.VENDOR_MDGLC !== null ? value.VENDOR_MDGLC : "", t: "n" },
          { v: value.VENDOR_SERVICE_EMAIL !== null ? value.VENDOR_SERVICE_EMAIL : "", t: "s" },
        { v: value.IS_GROUP_VISIBILITY, t: "s" },
        { v: value.VENDOR_CITY !== null ? value.VENDOR_CITY : "", t: "s" },
        { v: value.VENDOR_STATE !== null ? value.VENDOR_STATE : "", t: "s" },
        { v: value.IS_VPAUTO_ENABLED, t: "s" },
        { v: value.OSW_VENDOR, t: "s" }
      ])
    }
    return [...headers, ...data]
  }
  const getExportToExcel = () => {
      let tableName = 'Auto OSW Status'
      let item = selectedVendors.length>0 ?  selectedVendors : data
    if (item && item.length > 0) {
      let excelData = formExcelData(item)
      let ws = XLSX.utils.aoa_to_sheet([...excelData])
      let wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "WorkOrder")
      XLSX.writeFile(wb, `${tableName}.xlsx`)
      }
    }
    const formUsersExcelData = (item) => {
      let data = []
      let style = { font: { bold: true } }
      const header = ["VENDOR_AREA", "VENDOR_MARKET","VENDOR_NAME", "VENDOR_ID","VENDOR_MDGID",
      "FIRST_NAME", "LAST_NAME", "EMAIL_ADDRESS", "PHONE_NUMBER", "VENDOR_ROLE", "ISSO_ACCOUNT_REG", "OSW-TRAINED"]
      let headers = []
      headers.push(header.map(el => {
        return { v: el, t: "s", s: style }
      }))
  
      for (let j = 0, end = item.length; j < end; j++) {
        let value = item[j]
        data.push([
          { v: value.MARKET, t: "s" },
          { v: value.SUB_MARKET, t: "s" },
          { v: value.VENDOR_NAME, t: "s" },
          { v: value.VENDOR_ID, t: "n" },
          { v: value.VENDOR_MDGLC, t: "s" },
          { v: value.FIRST_NAME, t: "s" },
          { v: value.LAST_NAME, t: "s" },
          { v: value.EMAIL_ADDRESS, t: "s" },
          { v: value.PHONE_NUMBER, t: "s" },
          { v: value.VENDOR_ROLE, t: "s" },
          { v: value.IS_ISSO_REG, t: "s" },
          { v: value.IS_VENDOR_TRAINED, t: "s" },
        ])
      }
      return [ ...headers, ...data]
    }
    const getUsersExportToExcel = () => {
      let vendorIDArr = vendorIds.map(it => it.vendorId)
      let vendorIDS={'vendorIDS': vendorIDArr}
      setLoader(true);
      ajax.post(`/graphql4g`, { query: getUserInfoForCompanies, variables: {"input":vendorIDS} })
      .then(res =>
        {
          setLoader(false);
      if(res?.data?.data?.getUserInfoForCompanies?.result && res?.data?.data?.getUserInfoForCompanies?.result?.length > 0){
        let tableName = `User Information ${moment(new Date()).format(`MM-DD-YYYY hh_mm`)}`
      let item = res?.data?.data?.getUserInfoForCompanies?.result
      let filterdData = []
      item.forEach(vendor => vendorIds.forEach(it => vendor.VENDOR_ID == it.vendorId && filterdData.push({...vendor, MARKET:it.Area ,SUB_MARKET:it.Market,VENDOR_NAME:it.vendorName, VENDOR_MDGLC: it.vendorMDGID})))
      if (item && item.length > 0) {
        let excelData = formUsersExcelData(filterdData)
        let ws = XLSX.utils.aoa_to_sheet([...excelData])
        let wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "WorkOrder")
        XLSX.writeFile(wb, `${tableName}.xlsx`)
      }
    }
  })
  }
  const enableVpAuto = (txt) => {
     let UpdateInput={
          "vendorCompanyUniqueIDS":vendorUnqIds,
          "auto_vp_Status":txt,
          "updated_by": userId
    }
    // console.log(vendorUnqIds, txt, userId)
      ajax.post(`/graphql4g`, { query: updateAutoVpPermission, variables: {UpdateInput},})
    // .then((res)=>{
      //   console.log("response from api",res);
      // });
        const Notification  = notificationSystemRef.current
    Notification.addNotification({
                  title: 'Success',
      position: "br",
                  level: 'success',
                  message: txt == "Y" ? "OSW Enabled Successfully" : "OSW Disabled Successfully"
    })
    setTimeout(() => setUpdatedFlag(!updatedFlag), 1000)
            setEnable(true )
    setDisable(true)
    setSelectedVendors([])
          
  }
  const getSelectedRowData = (data) => {
        let Enableflag = data.length>0 ? data.every(v => v.IS_VPAUTO_ENABLED == "Enabled") : true
        let Disableflag = data.length>0 ? data.every(v => v.IS_VPAUTO_ENABLED == "Disabled") : true

        setVendorUnqIds(data.map(v => v.VDR_CMPNY_UNQ_ID))
      setVendorIds(data.map(v => ({vendorId : v.VENDOR_ID, vendorName: v.VENDOR_NAME, vendorMDGID: v.VENDOR_MDGLC,Area:v.VENDOR_AREA,Market:v.VENDOR_REGION})))
    setSelectedVendors(data)
        setEnable( Enableflag ? true : Disableflag ? false : true )
    setDisable(Disableflag ? true : Enableflag ? false : true)

  }

  // updateAutoVpPermission = (inp) => {
  //   const input = {
  //     "autoVpPermissionInfo": {
  //       "vendor_ids" : selectedVendors && selectedVendors.map(v => v.VENDOR_UUID).join(","),
  //       "auto_vp_Status" : inp,
  //     }
  //   }
  //   ajax.post(`/graphql4g`, { query: updateAutoVpPermission, variables: { input } }).then(res => {
  //     if (res && res.data && res.data.data && res.data.data.updateAutoVpPermission && res.data.data.updateAutoVpPermission.updateAutoVpPermission === "Auto VP Permission updated successfully") {
  //       this._notificationSystem.addNotification({
  //         title: 'Success',
  //         position: "br",
  //         level: 'success',
  //         message: res.data.data.updateAutoVpPermission.updateAutoVpPermission
  //       })
    //       this.hideEditEventModal();
  //     }
  //     else {
  //       this._notificationSystem.addNotification({
  //         title: 'Error',
  //         position: "br",
  //         level: 'error',
  //         message: "Somthing went wrong!"
  //       })
  //     }
  //   }
  //   )
  // }
    const renderLoading = () => <Loader color="#cd040b" size="50px" margin="4px" className="text-center loader-centered" />

  return (
    <div className="Col Col-12" style={{ padding: "2rem" }}>
      {data && data.length == 0 ? (
        renderLoading()
      ) : (
        <>
          <NotificationSystem ref={notificationSystemRef} />
          <div className="container row ">
            <div className="col-md-10">
              <SummaryDashboardGrid
                vendorData={sData}
                getSelecteddata={getSelectedRowData}
                getExportToExcel={getExportToExcel}
                isFastUser={isFastUser}
              />
            </div>
          </div>

        
          <div className="container row">
            <div className="col">
              <h4>All Vendor</h4>
              {isFastUser && (
                <p style={{ marginLeft: "15px" }}>
                  Total Vendors : <strong>{data.length}</strong> Total vendors
                  Selected : <strong>{selectedVendors.length}</strong>
                  {selectedVendors.length>1000 && <p style={{color:'orange',marginLeft:'1rem',fontSize:'1.1rem'}}>The user data download only supports up to 1000 companies. Please add addition filter to reduce the number of companies selected</p>}
                </p>
              )}
            </div>
          </div>

            <div style={{marginLeft:"30px"}}>           
            <VendorDashboardGrid
                    vendorData = {data}
                    vendorIds={vendorIds}
                    getSelecteddata = {getSelectedRowData}
              getExportToExcel={getExportToExcel}
                    getUsersExportToExcel={getUsersExportToExcel}
              isFastUser={isFastUser}
            />
                {isFastUser && 
                <div className="row" style={{marginTop:"1%", marginLeft:"3px"}}>
                    <button style={{padding: "1.2em", marginRight:"10px"}} onClick={()=>enableVpAuto("Y")} disabled={enable}>Enable OSW Auto</button>
                    <button style={{padding: "1.2em"}} onClick={()=>enableVpAuto("N")} disabled={disable}>Disable OSW Auto</button>
                </div>}
          </div>
        </>
      )}
    </div>
  )
}

export default EssoVendorDashboard