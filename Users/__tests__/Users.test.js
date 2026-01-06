import React from 'react'
import Enzyme, {shallow} from 'enzyme'
import {Map} from 'immutable'
import Adapter from 'enzyme-adapter-react-15'
Enzyme.configure({adapter: new Adapter()})
import {Users} from '../components/Users'
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
      getVendorList: jest.fn().mockImplementation(() => Promise.resolve()),
      updateUser: jest.fn().mockImplementation(() => Promise.resolve()),
      deleteUser: jest.fn().mockImplementation(() => Promise.resolve()),
      store: {getState: Map(), subscribe: () => { }, dispatch: () => { }, replaceReducer: () => { }, getIn: () => { }},
      reset: jest.fn()
    }
  })

  it('renders container', () => {
    const wrapper = shallow(<Users {...props}/>)
    expect(wrapper)
  })

  it('invokes componentDidMount when mounted', () => {
    jest.spyOn(Users.prototype, 'componentDidMount')
    shallow(<Users {...props} />)
    expect(Users.prototype.componentDidMount).toHaveBeenCalled()
    Users.prototype.componentDidMount.mockRestore()
  })

  it('invokes render', () => {
    jest.spyOn(Users.prototype, 'render')
    shallow(<Users {...props} />)
    expect(Users.prototype.render).toHaveBeenCalled()
    Users.prototype.render.mockRestore()
  })

  it('Verify OptionsCellRender is invoked', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'OptionsCellRender')
    instance.OptionsCellRender({data : {userid : 'vp0chnaras01'}})
    expect(instance.OptionsCellRender).toHaveBeenCalled()
  })

  it('invokes onCreateUser when created', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onCreateUser')
    instance.onCreateUser()
    expect(instance.onCreateUser).toHaveBeenCalled()
  })

  it('invokes onClickSuspend when suspended', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onClickSuspend')
    instance.onClickSuspend({},{})
    expect(instance.onClickSuspend).toHaveBeenCalled()
  })
  
  it('invokes onClickDelete when suspended', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onClickDelete')
    instance.onClickDelete({})
    expect(instance.onClickDelete).toHaveBeenCalled()
  })
   
  it('invokes onClickEdit when edited', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onClickEdit')
    instance.onClickEdit({})
    expect(instance.onClickEdit).toHaveBeenCalled()
  })

  it('invokes renderLoading when loads', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'renderLoading')
    instance.renderLoading()
    expect(instance.renderLoading).toHaveBeenCalled()
  })

  it('invokes hideCreateEditEventModal ', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'hideCreateEditEventModal')
    instance.hideCreateEditEventModal()
    expect(instance.hideCreateEditEventModal).toHaveBeenCalled()
  })

  it('invokes renderuserModel', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'renderuserModel')
    instance.renderuserModel()
    expect(instance.renderuserModel).toHaveBeenCalled()
  })

  it('invokes onGridReady', () => {
    const wrapper = shallow(<Users {...props} />)
    const instance = wrapper.instance()
    jest.spyOn(instance, 'onGridReady')
    instance.onGridReady({api: {sizeColumnsToFit : jest.fn()}})
    expect(instance.onGridReady).toHaveBeenCalled()
  })  

})