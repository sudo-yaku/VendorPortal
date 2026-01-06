import React from 'react'
import Enzyme, {shallow} from 'enzyme'
import {Map} from 'immutable'
import Adapter from 'enzyme-adapter-react-15'
Enzyme.configure({adapter: new Adapter()})
import {UserForm} from '../components/UserForm'
import * as vendorList from '../../Utils/VendorList.json'
import {fromJS} from 'immutable'

describe('User Management', () => {
  let props

  beforeEach(() => {
    props = {
        loginId: 'VZ221144',
        UsersList: fromJS(vendorList.getVendorList),
        user: fromJS({
            "vendor_id": 2571,
            "vendor_name": "Asurion - Los Angeles",
            "vendor_sponsor_id": "adamsem",
            "vendor_category": "5G Home Installer",
            "vendor_area": "Pacific",
            "vendor_region": "Southern California",
            "vendor_service_email": "",
            "vendor_phone": "",
            "vendor_address": "",
            "vendor_city": "",
            "vendor_state": "  ",
            "vendor_zip": "          ",
            "vendor_peoplesoft_id": "",
            "userid": "vp0chnaras01",
            "fname": "Chowdhry",
            "lname": "Narasinha",
            "name": "Narasinha, Chowdhry",
            "phone": "7324230000",
            "email": "chowdhry@asurion.com",
            "title": "IT",
            "vendor_role": "PORTALADMIN",
            "contact_unid": "C56C6D1D11B3FC57FB494CC0D32C25B9",
            "techID": "CN1234",
            "address1": null,
            "address2": null,
            "address3": null,
            "city": "Tampa",
            "state": "FL",
            "country": "US",
            "zipcode": "30781",
            "AltPhone": null,
            "supervisor": null,
            "updatedBy": "JN3322211",
            "status": "A",
            "badge": null
        }),
        userdata : {phone : '1231231231'},
        currentValues: Map(),
        store: {getState: Map(), subscribe: () => { }, dispatch: () => { }, replaceReducer: () => { }, getIn: () => { }},
        deleteMsg: jest.fn(),
        setInitialValues: jest.fn(),
        setValue: jest.fn(),
        createUser: jest.fn().mockImplementation(() => Promise.resolve())
    }
  })

  it('renders container', () => {
    const wrapper = shallow(<UserForm {...props}/>)
    expect(wrapper)
  })

  it('invokes componentDidMount when mounted', () => {
    jest.spyOn(UserForm.prototype, 'componentDidMount')
    shallow(<UserForm {...props} />)
    expect(UserForm.prototype.componentDidMount).toHaveBeenCalled()
    UserForm.prototype.componentDidMount.mockRestore()
  })

  it('invokes render', () => {
    jest.spyOn(UserForm.prototype, 'render')
    shallow(<UserForm {...props} />)
    expect(UserForm.prototype.render).toHaveBeenCalled()
    UserForm.prototype.render.mockRestore()
  })

  it('invokes onSubmit when submitted', () => {
    const wrapper = shallow(<UserForm {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onSubmit')
    instance.onSubmit({preventDefault : jest.fn()})
    expect(instance.onSubmit).toHaveBeenCalled()
  })

  it('invokes renderLoading when loads', () => {
    const wrapper = shallow(<UserForm {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'renderLoading')
    instance.renderLoading()
    expect(instance.renderLoading).toHaveBeenCalled()
  })

  it('invokes onDataChange when form values change', () => {
    const wrapper = shallow(<UserForm {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onDataChange')
    instance.onDataChange()
    expect(instance.onDataChange).toHaveBeenCalled()
  })

  it('invokes handleKeyPress', () => {
    const wrapper = shallow(<UserForm {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'handleKeyPress')
    instance.handleKeyPress({target : {value: {length : 10}}, preventDefault: jest.fn(), stopPropagation: jest.fn()})
    expect(instance.handleKeyPress).toHaveBeenCalled()
  })

  it('invokes renderOptions', () => {
    const wrapper = shallow(<UserForm {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'renderOptions')
    instance.renderOptions()
    expect(instance.renderOptions).toHaveBeenCalled()
  })

  it('invokes onFileDrop', () => {
    const wrapper = shallow(<UserForm {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onFileDrop')
    instance.onFileDrop([{}, {}])
    expect(instance.onFileDrop).toHaveBeenCalled()
  })

  it('invokes onAttachRemove when attachment is removed', () => {
    const wrapper = shallow(<UserForm {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onAttachRemove')
    instance.onAttachRemove()
    expect(instance.onAttachRemove).toHaveBeenCalled()
  })

  it('invokes onDropRejected on invalid file upload', () => {
    const wrapper = shallow(<UserForm {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onDropRejected')
    instance.onDropRejected([{}, {}])
    expect(instance.onDropRejected).toHaveBeenCalled()
  })
})