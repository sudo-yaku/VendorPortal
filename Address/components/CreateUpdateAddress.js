/**
  Copyright: Verizon Data Services 

  File Name: CreateUpdateAddress.js
  ******************************************************************************************
  Release Date    Change Date      Name          Description
                  04/10/2023       Likitha       Changed the map quest url to google api
 
 *******************************************************************************************/

import React, { useState, useEffect } from 'react';
import Modal from '../../Layout/components/Modal';
import TextField from '@material-ui/core/TextField';
import Select from 'react-select'
import * as stateCities from 'state-cities'
import * as usStateCodes from 'us-state-codes'
import Loader from '../../Layout/components/Loader';
import _ from 'lodash';

function CreateUpdateAddress(props) {
    const [address, setaddress] = useState('')
    const [statesdata, setstatesdata] = useState([])
    const [cityData, setcityData] = useState('')
    const [zipData, setzipData] = useState('')
    const [selectedState, setselectedState] = useState({})
    const [enableSaveButton, setenableSaveButton] = useState(true)
    const [enableMapQuestApi, setenableMapQuestApi] = useState(false)
    const [lat, setlat] = useState('')
    const [long, setlong] = useState('')
    const [data, setdata] = useState({})
    const [isAddressLoading, setisAddressLoading] = useState(false)
    const [addressErr, setaddressErr] = useState(false)
    const [buttonText, setButtonText] = useState(false)
    const [loaderEnable, setloaderEnable] = useState(false)
    const [prevCity, setprevCity] = useState('')
    const [prevState, setprevState] = useState({})
    const [prevZip, setprevZip] = useState('')
    const [updateValidateErr, setupdateValidateErr] = useState(false)
    const [removeBackground, setremoveBackground] = useState(false)
    const [mapQuestCity, setmapQuestCity] = useState('')
    const [mapQuestState, setmapQuestState] = useState('')
    const [mapQuestZip, setmapQuestZip] = useState('')


    useEffect(() => {
        let states = stateCities.getStates().map(state => { return ({ label: `${usStateCodes.getStateCodeByStateName(state)}(${state})`, value: usStateCodes.getStateCodeByStateName(state) }) });
        setstatesdata(states)
        let { title, data } = props
        if (title == 'Edit Dispatch Address') {
            setisAddressLoading(true)
            props.validateAddress(data.address)
                .then(res => {
                    if (res.results && res.results.length > 0 && res.results[0].address_components.length > 0) {
                        let locations = res.results[0].address_components
                        let state = states.find(s => s.value === locations.find(l => l.types.includes("administrative_area_level_1")).short_name)
                        let address = res.results[0].formatted_address ? data.address.split(',')[0] : res.results[0].formatted_address
                        setaddress(address)
                        setcityData(locations.find(l => l.types.includes("locality"))?.short_name || '')
                        setselectedState(state)
                        setzipData(locations.find(l => l.types.includes("postal_code"))?.short_name || '')
                        setlat(res.results[0].geometry.location.lat)
                        setlong(res.results[0].geometry.location.lng)
                        setprevCity(locations.find(l => l.types.includes("locality"))?.short_name || '')
                        setprevState(state)
                        setprevZip(locations.find(l => l.types.includes("postal_code"))?.short_name || '',)
                        setdata(data)
                        setisAddressLoading(false)
                    }
                    res.results[0].geometry.location.lat != '' && res.results[0].geometry.location.lng != '' ?
                        setmapQuestData()
                        : null
                }) 

                .catch(err => {
                    console.log("error---", err)
                    setaddressErr(true)
                })

        }
    }, [])
    const setmapQuestData = () => {
        setenableMapQuestApi(true)
        setremoveBackground(true)
    }

    //saving the address
    const saveDispatchAddress = () => {
        setButtonText(true)
        setenableSaveButton(true)
        let formValues = {
            address: address,
            state: selectedState ? selectedState.value : '',
            city: cityData,
            zip: zipData,
            latitude: lat,
            longitude: long
        }
        if (props.title == 'Edit Dispatch Address') {
            formValues['mdg_id'] = data.mdg_id,
                formValues['vendor_name'] = data.vendor_name
            props.updateAddress(formValues, data.meta_universalid)
        }
        else {
            props.addAddress(formValues);
        }
    }

    //validate Address for user entry
    const verifyAddress = (newAddress) => {
        let [addressLine, city, state, zip] = newAddress.split(',');
        setenableSaveButton(true)
        setenableMapQuestApi(false)
        setremoveBackground(false)
        if (address != '' && cityData != '' && state != 'undefined' && state != 'null' && zipData.length >= 4) {
            setloaderEnable(true)
            props.validateAddress(newAddress)
                .then(res => {
                    setloaderEnable(false)
                    setlat(res.results[0].geometry.location.lat)
                    setlong(res.results[0].geometry.location.lng)
                    updateVerifyValidate(addressLine, city, state, zip, res);

                    //validation check for create address
                    let states = stateCities.getStates().map(state => { return ({ label: `${usStateCodes.getStateCodeByStateName(state)}(${state})`, value: usStateCodes.getStateCodeByStateName(state) }) });
                    setstatesdata(states)
                    let locations = res.results[0].address_components
                    let mapQuestState = statesdata.find(s => s.value === locations.find(l => l.types.includes("administrative_area_level_1"))?.short_name)
                    let mapQuestCity = locations.find(l => l.types.includes("locality"))?.short_name
                    let mapQuestZip = locations.find(l => l.types.includes("postal_code"))?.short_name
                    setmapQuestCity(mapQuestCity)
                    setmapQuestState(mapQuestState.value)
                    setmapQuestZip(mapQuestZip)

                    res.results[0].geometry.location.lat != '' &&
                        res.results[0].geometry.location.lng != '' &&
                        addressLine != '' && city.toUpperCase() === mapQuestCity.toUpperCase() && state != 'null' && state.toUpperCase() === mapQuestState.value.toUpperCase() && zip != 'null' && zip === mapQuestZip
                        ?
                        setMapQuestValue()
                        :
                        setMapQuestValues()

                })
                .catch(err =>
                    setaddressErr(true))

        }
    }
    const setMapQuestValue = () => {
        setenableSaveButton(false)
        setenableMapQuestApi(true)
        setremoveBackground(true)
        setaddressErr(false)
    }
    const setMapQuestValues = () => {
        setenableMapQuestApi(false)
        setenableSaveButton(true)
        setremoveBackground(false)
        setaddressErr(true)
    }
    //validating city, zip, state during update
    const updateVerifyValidate = (addressLine, city, state, zip, res) => {
        if (res.results && res.results.length > 0 && res.results[0].address_components.length > 0 && props.title == 'Edit Dispatch Address') {
            let locations = res.results[0].address_components
            let mapQuestState = statesdata.find(s => s.value === locations.find(l => l.types.includes("administrative_area_level_1"))?.short_name)
            let mapQuestCity = locations.find(l => l.types.includes("locality"))?.short_name
            let mapQuestZip = locations.find(l => l.types.includes("postal_code"))?.short_name
            setmapQuestCity(mapQuestCity)
            setmapQuestState(mapQuestState.value)
            setmapQuestZip(mapQuestZip)

            //validation check for update address
            if (mapQuestState.value.toUpperCase() === state.toUpperCase() && mapQuestCity.toUpperCase() === city.toUpperCase() &&
                mapQuestZip === zip && city != '' && state != 'undefined' && zip != '' && addressLine != '') {
                setaddressErr(false)
                setupdateValidateErr(false)
                setenableSaveButton(false)
            }
            else {
                setaddressErr(true)
                setupdateValidateErr(true)
            }
        }

    }

    const handleAddress = (value) => {
        setaddress(value || '')
        let newAddress = value + ',' + cityData + ',' + selectedState.value + ',' + zipData
        verifyAddress(newAddress);
    }

    const handleCity = (value) => {
        setcityData(value || '')
        let newAddress = address + ',' + value + ',' + selectedState.value + ',' + zipData
        verifyAddress(newAddress);
    }

    const handleState = (state) => {
        let newState = state && state.value
        setselectedState(state || null)
        let newAddress = address + ',' + cityData + ',' + newState + ',' + zipData
        verifyAddress(newAddress);
    }


    const handleZip = (value) => {
        setzipData(value || '')
        let newAddress = address + ',' + cityData + ',' + selectedState.value + ',' + value
        verifyAddress(newAddress);
    }

    return (
        <Modal ref={modal => modal = modal} title={props.title} handleHideModal={props.handleHideModal}
            style={{ width: "80%", maxWidth: "80%", display: "block", marginTop: 90 }}>
            {isAddressLoading ?
                <Loader color="#cd040b" size="75px" margin="4px" className="text-center" style={{ "paddingTop": "50px" }} />
                :
                <div><div className='row' style={{ margin: "10px" }}>
                    <div className="col-lg-12">
                        <TextField
                            label="Address"
                            name="address"
                            value={address || ''} onChange={(e) => handleAddress(e.target.value)}
                            inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                            className="required"
                            disabled={false}
                            fullWidth={true}
                        />
                    </div>

                </div>
                    <div className='row' style={{ margin: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div className="col-lg-6">
                            <TextField
                                label="City"
                                name="city"
                                value={cityData || ''} onChange={(e) => handleCity(e.target.value)}
                                inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                                className="required"
                                disabled={false}
                                fullWidth={true}
                            />
                        </div>
                        <div className="col-lg-6">
                            <label style={{ "fontSize": "10px", "marginTop": "10px", "color": "#a8a8a8" }}>State <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                name="State"
                                value={{ value: selectedState && selectedState.value, label: selectedState && selectedState.label }}

                                // value={selectedState && selectedState.value}
                                className="col-12 col-md-12 no-padding float-left"
                                onChange={(e) => handleState(e)}
                                options={statesdata}
                                required
                            />
                        </div>

                    </div>

                    <div className='row' style={{ margin: "10px" }}>
                        <div className="col-lg-6">
                            <TextField
                                label="ZIP"
                                name="zip"
                                value={zipData || ''} onChange={(e) => handleZip(e.target.value)}
                                inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                                className="required"
                                disabled={false}
                                fullWidth={true}
                            />
                        </div>

                        <div className="col-lg-6" style={{ marginTop: 30, paddingBottom: 50 }}>
                            <span style={{ background: removeBackground ? '' : '#d7d2d2', display: "flex", alignItems: "center" }}>
                                <i className="fa fa-map" style={{ paddingRight: 5, fontSize: 14, fontWeight: 'unset', margin: '8px' }}></i>
                                <a href={`http://www.google.com/maps/place/${lat},${long}`} target='_blank'
                                    style={{
                                        textDecoration: 'underline', pointerEvents: enableMapQuestApi ? '' : 'none',
                                        color: enableMapQuestApi ? 'red' : 'black'
                                    }}>Click here to view the map</a>

                                {loaderEnable ?
                                    <div style={{ paddingLeft: 25, margin: '-20px' }}>
                                        <Loader color="#cd040b" size="15px" margin="4px" className="text-center" />
                                    </div>
                                    : null}

                            </span>
                        </div>
                        {addressErr ?
                            <div style={{ color: 'red', paddingLeft: 15 }}>
                                <h6>*Please enter City: {mapQuestCity}, State: {mapQuestState}, Zip: {mapQuestZip}</h6>
                            </div> : null}

                        {/* {updateValidateErr?
                                  <div style={{color:'red', paddingLeft:15}}>
                                      <h6>*Please enter City: {mapQuestCity}, State: {mapQuestState}, Zip: {mapQuestZip}</h6>
                                  </div>:null} */}

                    </div>
                    <div className="float-right">
                        <button onClick={() => saveDispatchAddress()} disabled={updateValidateErr ? true : enableSaveButton}>{props.title == 'Edit Dispatch Address' ? buttonText ? 'Updating...' : 'Update' : buttonText ? 'Saving...' : 'Save'}</button>
                    </div>
                </div>}
        </Modal>
    )
}

export default CreateUpdateAddress;
