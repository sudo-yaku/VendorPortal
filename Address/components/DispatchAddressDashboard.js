/**
  Copyright: Verizon Data Services 

  File Name: DispatchAddressDashboard.js
  ******************************************************************************************
  Release Date    Change Date      Name          Description
                  02/25/2022       shade86       Initial creation
 
 *******************************************************************************************/

import { List, Map } from 'immutable';
import React, { useState, useEffect,useRef } from 'react';
import { connect } from 'react-redux';
import ReactTable from "react-table";
import "react-table/react-table.css";
import Loader from '../../Layout/components/Loader';
import * as addressActions from '../actions';
import CreateUpdateAddress from './CreateUpdateAddress';
import DeleteAddress from './DeleteAddress';
import { toast } from 'react-toastify';
import moment from 'moment';


function DispatchAddress(props) {

  const [isAddressModel, setisAddressModel] = useState(false)
  const [vendorLocations, setvendorLocations] = useState([])
  const [filteredLocations, setfilteredLocations] = useState([])
  const [rowData, setrowData] = useState({})
  const [isAddressLoading, setisAddressLoading] = useState(false)
  const [createAddress, setcreateAddress] = useState(false)
  const [editAddress, seteditAddress] = useState(false)
  const [deleteAddress, setdeleteAddress] = useState(false)
  const [deleteAddressDetails, setdeleteAddressDetails] = useState({})
  const [searchVal,setsearchVal] = useState('')
  const [searchMatched, setsearchMatched]=useState(false)
  const search = useRef("search")
  useEffect(()=>{
    fetchAddress()
  },[])

  const fetchAddress=async()=> {
    setisAddressLoading(true)
    props.getDispatchAddress(props.vendor_unid || props.vendorUnid, props.mdg_id)
      .then(res => {
        if (res && res.vendorlocations) {
          setvendorLocations(res.vendorlocations)
        }
        setisAddressLoading(false)
      })
      .catch(err => {
        setvendorLocations([])
        setisAddressLoading(false)
      })
  }

  const addAddress=async(formValues = {})=> {
    let payload = {
      address: `${formValues.address},${formValues.city},${formValues.state},${formValues.zip}`,
      latitude: formValues.latitude,
      longitude: formValues.longitude,
      mdg_id: props.mdg_id,
      vendor_name: props.vendor.vendor_name,
      metaUniversalId: '',
      createdBy: props.user.get('name'),
      psLoc: '',
      modifiedBy: props.user.get('name'),
      modifiedOn: moment(),
      createdOn: moment()
    }
    props.createDispatchAddress(payload)
      .then(res => {
        toast.success(res);
        closeModal();
        fetchAddress();
      })
      .catch(err => {
        closeModal();
        toast.error('Error in adding dispatch address');
      })
  }
  const updateAddress=async(formValues = {}, unid)=> {
    let created_by = vendorLocations?.find(loc => loc.meta_universalid == unid).meta_createdby
    let createdDate = vendorLocations?.find(loc => loc.meta_universalid == unid).meta_createddate
    let updatePayload = {
      address: `${formValues.address},${formValues.city},${formValues.state},${formValues.zip}`,
      latitude: formValues.latitude,
      longitude: formValues.longitude,
      mdg_id: formValues.mdg_id,
      vendor_name: formValues.vendor_name,
      metaUniversalId: unid,
      createdBy: created_by,
      psLoc: '',
      modifiedBy: props.user.get('name'),
      modifiedOn: moment(),
      createdOn: moment(createdDate)
    }
    props.updateDispatchAddress(props.loginId, updatePayload, unid)
      .then(res => {
        if (res.errors) {
          toast.error(res.errors)
        }
        else {
          toast.success(res.resultmessage)
          setTimeout(() => {
            closeModal();
            fetchAddress();
          }, 2000);
        }
      })
      .catch(err => {
        toast.error('Something went wrong while updating address')
      })
  }

  const deleteAddresses=async()=> {
    props.deleteDispatchAddress(deleteAddressDetails.meta_universalid)
      .then(res => {
        if (res.errors) {
          toast.error(res.errors[0].message)
          closeModal();

        }
        else {
          toast.success(res.resultmessage)
          closeModal();
          fetchAddress();

        }
      })
      .catch(err => {
        closeModal();
        toast.error('Something went wrong while deleting address')
      })
  }

  const renderLoading=()=> {
    return <Loader color="#cd040b" size="50px" margin="4px" className="text-center" style={{ "paddingTop": "50px" }} />
  }

  const handleCreateAddress = () => {
    setcreateAddress(true)
  }
  const handleEditAddress = (row) => {
    seteditAddress(true)
    setrowData(row)
  }
 const handleDeleteAddress = (row) => {
  setdeleteAddress(true)
  setdeleteAddressDetails(row)
  }

  const renderIcon=(row, issoCondition)=> {
    let rowData = row.original;
    return (
      <span>
        <a href={`https://www.google.com/maps/place/${rowData.latitude},${rowData.longitude}`} target='_blank' style={{ marginRight: 30 }}>
          <i title='View Map' className="fa fa-map" style={{ color: '#337ab7', fontSize: 18, fontWeight: 'unset', cursor: "pointer" }}></i>
        </a>
        {issoCondition ? null : <a onClick={(e) => handleEditAddress(rowData)}> <i title='Edit Address' className="fa fa-pencil-alt" style={{ color: '#337ab7', fontSize: 18, cursor: "pointer", marginRight: 30 }}></i></a>}
        {issoCondition ? null : <a onClick={(e) => handleDeleteAddress(rowData)} ><i title='Remove Address' className="fa fa-trash" style={{ color: "#F44336", fontSize: 18, cursor: "pointer" }}></i></a>}
      </span>
    )
  }
  useEffect(()=>{
    tableSearch();
  },[searchVal])

  const onSearchValueChange = (event) => {
    setsearchVal(event.target.value )
  }

  const tableSearch = () => {
    let filteredData = []
    filteredData = vendorLocations && vendorLocations.length ? vendorLocations.filter(value => {
      return (
        (value.vendor_name && value.vendor_name.toLowerCase().includes(searchVal.toLowerCase())) ||
        (value.address && value.address.toLowerCase().includes(searchVal.toLowerCase())) ||
        (value.latitude && value.latitude.toLowerCase().includes(searchVal.toLowerCase())) ||
        (value.longitude && value.longitude.toLowerCase().includes(searchVal.toLowerCase())) ||
        (value.meta_createdby && value.meta_createdby.toString().toLowerCase().includes(searchVal.toLowerCase())) ||
        (value.meta_lastupdateby && value.meta_lastupdateby.toLowerCase().includes(searchVal.toLowerCase())) ||
        (value.meta_lastupdatedate && value.meta_lastupdatedate.toLowerCase().includes(searchVal.toLowerCase()))
      )
    }) : [];
    if (filteredData.length > 0) {
      setfilteredLocations(filteredData)
      setsearchMatched(true)
    }
  }

  const renderVendorAddress = (data = {}) => {
    return (
      <div>
        <h4>{data.vendor_id} - {data.vendor_name}</h4>
        <h4>{data.vendor_address}, {data.vendor_city}, {data.vendor_state} - {data.vendor_zip}</h4>
        <h5>
         <span style={{display: 'flex', alignItems:'center'}}><i className="fa fa-phone" style={{ "color": "#546E7A", "padding": "0px 5px", "fontSize": "20px" }}></i>{data.vendor_phone} </span>
         <span style={{display: 'inline-flex', wordBreak: 'break-all', alignItems: 'center'}}><i className="fa fa-envelope" style={{ "color": "#546E7A", "padding": "0px 5px", "fontSize": "25px" }}></i>{data.vendor_service_email}</span>
        </h5>
      </div>
    )
  }

  const closeModal = () => {
    setcreateAddress(false)
    seteditAddress(false)
    setdeleteAddress(false)
  }

    if (isAddressLoading) {
      return <div style={{ marginTop: 150 }}> {renderLoading()}</div>
    }

    let issoCondition = false
    let { realLoginId, loginId, isssouser, ssoUrl } = props
    if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.toLowerCase().includes('ssologin')) {
      issoCondition = true
    }


    const { vendorId, vendor_unid, vendor } = props

    let columns = [
      {
        Header: "Vendor Name",
        accessor: "vendor_name",
        headerStyle: { textAlign: 'left' }
      },
      {
        Header: "Address",
        accessor: "address",
        headerStyle: { textAlign: 'left' }
      },
      {
        Header: "Latitude",
        accessor: "latitude",
        headerStyle: { textAlign: 'left' },
        width: 200
      },
      {
        Header: "Longitude",
        accessor: "longitude",
        headerStyle: { textAlign: 'left' },
        width: 200
      },

    ]
    if ((props.user && props.user.get('vendor_role') && props.user.get('vendor_role') == "PORTALADMIN")) {
      columns.push({
        Header: 'Actions',
        id: 'click-me-button',
        headerStyle: { textAlign: 'left' },
        width: 150,
        Cell: row => renderIcon(row, issoCondition)
      })
    }

    return (
      <div>
        {/* Create Modal component to be displayed for Create scenario */}
        {createAddress ? <CreateUpdateAddress
          title='Add Dispatch Address'
          addAddress={(payload) => addAddress(payload)}
          validateAddress={props.validateAddress}
          handleHideModal={() =>closeModal()} />
          : null}

        {/* Edit Modal component to be displayed for Edit scenario */}
        {editAddress ? <CreateUpdateAddress
          title='Edit Dispatch Address'
          updateAddress={(payload, unid) => updateAddress(payload, unid)}
          validateAddress={props.validateAddress}
          data={rowData}
          handleHideModal={() => closeModal()}
        />
          : null}

        {/* Delete Modal component to be displayed for Delete scenario */}
        {deleteAddress ? <DeleteAddress
          title="Remove Dispatch Address"
          handleHideModal={() =>closeModal()}
          deleteAddress={() => deleteAddresses()}
          deleteAddressDetails={deleteAddressDetails}
        />
          : null}

        <div>
          <div className="Grid test" style={{ "display": "flex", "background": "#FFF", "WebkitBoxShadow": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)", "boxShadow": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)", "padding": "18px 7px" }} >
            {vendor
              ? <div className="Col Col-6" >{renderVendorAddress(vendor)}</div>
              : <div className="Col Col-6" ></div>}
            <div className="Col Col-6">
              {issoCondition || (props.user && props.user.get('vendor_role') && props.user.get('vendor_role') == "PORTALUSER") ? null : <button type="button" className="Button--small u-floatRight"
                onClick={(e) => handleCreateAddress(e, '', '')}
                style={{ marginRight: "5px", color: "#FFFFFF", fontSize: "0.9rem" }}>Add Address</button>}
            </div>
          </div>
          <div className="col-sm-3 no-padding" style={{ paddingTop: '10px' }}>
            <input
              placeholder="Search Address"
              style={{ borderRadius: "0rem", height: "32px" }}
              className="form-control title-div-style"
              id="search-bar"
              ref={search}
              value={searchVal}
              onChange={(e)=>onSearchValueChange(e)}
            />
          </div>
          <div style={{ paddingTop: '10px' }}>
            <ReactTable
              data={searchVal ? filteredLocations : vendorLocations}
              columns={columns}
              defaultPageSize={vendorLocations.length > 10 ? 10 : vendorLocations.length + 1}
              className="-striped -highlight"
            />
          </div>
        </div>

      </div>
    )
}

const mapStateToProps = (state) => {
  const loginId = state.getIn(["Users", "currentUser", "loginId"], "");
  const user = state.getIn(['Users', 'entities', 'users', loginId], Map());
  const UsersList = state.getIn(['Users', 'getVendorList', 'Users'], List());

  const vendorId = user && user.toJS().vendor_id;
  const filteredVendors = vendorId && user.toJS().group_vendors && user.toJS().group_vendors.filter(vp => vp.vendor_id == vendorId);
  const vendor_unid = filteredVendors && filteredVendors.length ? filteredVendors[0].vendor_unid : '';
  const vendor = UsersList && UsersList.toJS() && UsersList.toJS().length ? UsersList.toJS()[0] : {};
  let esso_vendors = state.getIn(["UserDashboard", "VendorsListEsso", "Vendors"], List());
  let filtered_vendors = esso_vendors && esso_vendors.toJS().vendors && esso_vendors.toJS().vendors.filter(vp => vp.vendor_id == vendorId);
  const vendorUnid = filtered_vendors && filtered_vendors.length ? filtered_vendors[0].meta_universalid : '';
  let ps_loc_id = vendor && vendor.vendor_peoplesoft_id ? vendor.vendor_peoplesoft_id : '';
  let mdg_id = vendor && vendor.vendor_mdg_id ? vendor.vendor_mdg_id : '';
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''



  return {
    vendorUnid,
    loginId,
    vendorId,
    vendor_unid,
    ps_loc_id,
    mdg_id,
    vendor,
    user,
    ssoUrl,
    isssouser,
    realLoginId,
    realUser,
    UsersList
  }
}

export default connect(mapStateToProps, { ...addressActions })(DispatchAddress)