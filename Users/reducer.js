import * as actions from './actions'
import { Map, List, fromJS } from 'immutable'
import browserStorage from '../browserStorage'

function coalesceViews(user) {
  if (user.cellview === 'yes') user.cellview = true
  if (user.cellview === 'no') user.cellview = false
  if (user.switchview === 'yes') user.switchview = true
  if (user.switchview === 'no') user.switchview = false
  return user
}
export function Users(state = Map(), action) {
  switch (action.type) {
    case actions.LOGIN_REQUEST:
      return state.setIn(['currentUser', 'loading'], true)
    case actions.LOGIN_SUCCESS: {
      const loginId = action.user.user.login_id
      const vendor_data = action.user.user.group_vendors;
      let updatedUser;
      let favoriteUser = {};
      if (action.user.user.favoriteSubMarket) {
        let favSubMarket = action.user.user.favoriteSubMarket.split('-');
        let favoriteVendorId = favSubMarket[favSubMarket.length - 1];
        // let favoriteVendorId = action.user.user.favoriteSubMarket.indexOf("-") > 0 ? action.user.user.favoriteSubMarket.split('-')[1] : action.user.user.favoriteSubMarket.split('_')[1]
        favoriteUser = vendor_data.find(vendor => vendor.vendor_id == favoriteVendorId && vendor.is_vendor_disabled == 'N')
      } else if (action.user.user.lastAccessedSubMarket) {
        let lastAccSubMkt = action.user.user.lastAccessedSubMarket.split('-');
        let lastAccessedVendorId = lastAccSubMkt[lastAccSubMkt.length - 1]
        // let lastAccessedVendorId = action.user.user.lastAccessedSubMarket.indexOf("-") > 0 ? action.user.user.lastAccessedSubMarket.split('-')[1] : action.user.user.lastAccessedSubMarket.split('_')[1]
        favoriteUser = vendor_data.find(vendor => vendor.vendor_id == lastAccessedVendorId && vendor.is_vendor_disabled == 'N')
      } else {
        favoriteUser = vendor_data.find(vendor => vendor.vendor_id == action.user.user.vendor_id && vendor.is_vendor_disabled == 'N')
      }
      const user = coalesceViews(action.user.user)
      if(favoriteUser){
      let default_vendor_id = user.vendor_id;
      let default_vendor_area = user.vendor_area;
      let default_vendor_region = user.vendor_region;
      updatedUser = {
        ...user,
        default_vendor_id,
        default_vendor_area,
        default_vendor_region,
        vendor_name: favoriteUser.vendor_name,
        vendor_area: favoriteUser.vendor_area,
        vendor_region: favoriteUser.vendor_region,
        vendor_id: favoriteUser.vendor_id,
        vendor_category: favoriteUser.vendor_category,
        vendor_unid: favoriteUser.vendor_unid,
        is_vpauto_enabled:favoriteUser && favoriteUser.is_vpauto_enabled,
        vendor_pricing_macro_ant_tow : favoriteUser.vendor_pricing_macro_ant_tow,
        vendor_pricing_small_cell : favoriteUser.vendor_pricing_small_cell,
        incentive_eligible : favoriteUser.incentive_eligible,
        is_pricing_matrix : favoriteUser.is_pricing_matrix
      }
    }
    else{
      let default_vendor_id = user.vendor_id;
      let default_vendor_area = user.vendor_area;
      let default_vendor_region = user.vendor_region;
      updatedUser={...user, default_vendor_id,
        default_vendor_area,
        default_vendor_region,};
    }
      return state
        .set('currentUser', fromJS({
          loading: false,
          loginId,
          password: action.password
        }))
        .set('realUser', fromJS({
          loading: false,
          loginId,
          password: action.password
        }))
        .mergeIn(['entities', 'users', loginId], fromJS(updatedUser))
        .mergeIn(['entities', 'features', loginId], fromJS(action.user.features))
        .mergeIn(['entities', 'users', 'initial'], fromJS(user))
    }
    case actions.CONFIG_DATA_SUCCESS: {
      return state.setIn(['configData', 'configData'], fromJS(action.configData))
    }
    case actions.OSW_CLOSURE_SUCCESS: {
      return state.setIn(['configData', 'oswClosureCodes'], fromJS(action.oswClosureCodes))
    }
    case actions.FETCH_USER_SUCCESS: {
      const user = coalesceViews(action.user.user)
      if (action.initialLoad) {
        return state.mergeIn(['entities', 'users', user.login_id], fromJS(user))
          .mergeIn(['entities', 'features', user.login_id], fromJS(action.user.features))
          .mergeIn(['entities', 'users', 'initial'], fromJS(user))
      }
      else {
        return state.mergeIn(['entities', 'users', user.login_id], fromJS(user))
          .mergeIn(['entities', 'features', user.login_id], fromJS(action.user.features))
      }

    }

    case actions.SAVE_FILTERS:
      return state.setIn(['entities', 'users', action.loginId, 'preferences', 'FILTERS'], fromJS(action.obj))
    case actions.LOGIN_FAIL:
      return state.set('currentUser', fromJS({
        loading: false,
        errors: fromJS(action.errors)
      }))

    case actions.UPDATE_RELEASE_NOTES_POPUP_SUCCESS: {
      return state.setIn(['entities', 'users', action.loginId, 'releaseNotesInfo', 'showReleaseNotes'], 'false')
    }

    case actions.GET_IVR_VENDOR_TECH_LIST_FAILURE: {
      return state.setIn(['ivrTechError'], fromJS(
        action.response.errors
      ))
    }

    // SWITCH USER
    case actions.SWITCH_USER: {
      const loginId = action.user.login_id

      return state
        .set('currentUser', fromJS({
          loading: false,
          loginId: loginId,
          message: 'User Changed Successfully'
        }))
    }

    // RESTORE USER
    case actions.RESTORE_USER: {
      return state
        .set('currentUser', fromJS({
          loading: false,
          loginId: action.loginId,
          message: 'User Changed Successfully'
        }))
    }

    case actions.ATTEMPT_CLEAR_MESSAGE:
      return state
        .deleteIn(['currentUser', 'message'])
        .deleteIn(['currentUser', 'errorMessage'])
    case actions.GET_VENDOR_LIST_REQUEST:
      return state
        .setIn(['getVendorList', 'isLoading'], true)
    case actions.GET_VENDOR_LIST_SUCCESS:
      if (action.response && action.response.data && action.response.data.getVendorList) {
        let groupByTech = {}
        let grpByuserId = {}
        for (var i = action.response.data.getVendorList.length - 1; i >= 0; i--) {
          const d = action.response.data.getVendorList[i]
          groupByTech[d.techID] = d
          grpByuserId[d.userid] = d
        }
        return state
          .setIn(['getVendorList', 'isLoading'], false)
          .setIn(['getVendorList', 'Users'], List(action.response.data.getVendorList))
          .setIn(['getVendorList', 'ByTechId'], fromJS(groupByTech))
          .setIn(['getVendorList', 'ByUserId'], fromJS(grpByuserId))

      } else {
        return state
          .setIn(['getVendorList', 'isLoading'], false)
          .setIn(['getVendorList', 'errormessage'], { message: "Something went wrong!" })
          .setIn(['getVendorList', 'Users'], List())
      }
    case actions.GET_VENDOR_USER_AUTH_SUCCESS:
      return state
        .setIn(['getVendorUserAuth', 'data'], action.response)
    case actions.GET_VENDOR_USER_AUTH_VENDOR_ID_REQUEST:
      return state
        .setIn(['getVendorUserAuthForVendorId', 'isLoading'], true)
    case actions.GET_VENDOR_USER_AUTH_VENDOR_ID_SUCCESS:
      return state
        .setIn(['getVendorUserAuthForVendorId', 'isLoading'], false)
        .setIn(['getVendorUserAuthForVendorId', 'data'], action.response)
    case actions.USER_INFO_LINKED_SUCCESS:
      return state
        .setIn(['getUserInfoLinked', 'data'], action.response)
    case actions.USER_INFO_LINKED_FAILURE:
      return state
        .setIn(['getUserInfoLinked', 'data'], action.error)

    case actions.ACTIVE_DOMAIN_REQUEST:
          return state.setIn(['getActiveDomains','isLoading'], true)
    case actions.ACTIVE_DOMAIN_SUCCESS:
      return state.setIn(['getActiveDomains','isLoading'], false)
      .setIn(['getActiveDomains', 'data'], action.response)
    case actions.ACTIVE_DOMAIN_FAILURE:
        return state.setIn(['getActiveDomains','isLoading'], false)
       .setIn(['getActiveDomains', 'data'], action.errors)
    case actions.GET_VENDOR_LIST_FAILURE:
      return state
        .setIn(['getVendorList', 'isLoading'], false)
        .setIn(['getVendorList', 'errormessage'], { message: "Something went wrong!" })
        .setIn(['getVendorList', 'Users'], List())
    case actions.LINK_USER_SUCCESS:
      return state
        .setIn(['linkUserData', action.loginId], action.response)
    case actions.LINK_USER_FAILURE:
      return state
        .setIn(['linkUserData', action.loginId], action.error)
    case actions.CREAT_USER_REQUEST:
      return state
        .setIn(['usercreate', 'isLoading'], true)
        .setIn(['usercreate', 'errorsMessage'], null)
    case actions.CREAT_USER_SUCCESS: {
      if (action.response && action.response.data && action.response.data.createContact) {
        return state
          .setIn(['usercreate', 'isLoading'], false)
          .setIn(['usercreate', 'message'], action.response.data.createContact)
          .setIn(['usercreate', 'errorsMessage'], null)

      } else if (action.response && action.response.errors && action.response.errors.length > 0) {

        let message = action.response.errors[0].data ? action.response.errors[0].data.message ? action.response.errors[0].data.message : action.response.errors[0].data.detail ? action.response.errors[0].data.detail : action.response.errors[0].message : action.response.errors[0].message
        return state
          .setIn(['usercreate', 'isLoading'], false)
          .setIn(['usercreate', 'errorsMessage'], message)
      } else {
        return state
          .setIn(['usercreate', 'isLoading'], false)
          .setIn(['usercreate', 'errorsMessage'], { message: "Something went wrong!" })
      }
    }
    case actions.CREAT_USER_FAILURE:
      return state
        .setIn(['usercreate', 'isLoading'], false)
        .setIn(['usercreate', 'errorsMessage'], { message: "Something went wrong!" })

    case actions.ACTIVATE_USER_REQUEST:
      return state
        .setIn(['useractivation', 'isLoading'], true)
        .setIn(['useractivation', 'errorsMessage'], null)
    case actions.ACTIVATE_USER_SUCCESS: {
      if (action.response && action.response.data && action.response.data.activateUser) {
        return state
          .setIn(['useractivation', 'isLoading'], false)
          .setIn(['useractivation', 'message'], action.response.data.activateUser)
          .setIn(['useractivation', 'errorsMessage'], null)

      } else if (action.response && action.response.errors && action.response.errors.length > 0) {

        let message = action.response.errors[0].data ? action.response.errors[0].data.message ? action.response.errors[0].data.message : action.response.errors[0].data.detail ? action.response.errors[0].data.detail : action.response.errors[0].message : action.response.errors[0].message
        return state
          .setIn(['useractivation', 'isLoading'], false)
          .setIn(['useractivation', 'errorsMessage'], message)
      } else {
        return state
          .setIn(['useractivation', 'isLoading'], false)
          .setIn(['useractivation', 'errorsMessage'], { message: "Something went wrong!" })
      }
    }
    case actions.ACTIVATE_USER_FAILURE:
      return state
        .setIn(['useractivation', 'isLoading'], false)
        .setIn(['useractivation', 'errorsMessage'], { message: "Something went wrong!" })

    case actions.UPDATE_USER_REQUEST:
      return state
        .setIn(['usercreate', 'isLoading'], true)
        .setIn(['usercreate', 'errorsMessage'], null)
    case actions.UPDATE_USER_SUCCESS:
      if (action.response && action.response.data && action.response.data.updateContact) {
        return state
          .setIn(['usercreate', 'isLoading'], false)
          .setIn(['usercreate', 'message'], action.response.data.updateContact)
      } else if (action.response && action.response.errors && action.response.errors.length > 0) {
        let message = action.response.errors[0].data ? action.response.errors[0].data.message ? action.response.errors[0].data.message : action.response.errors[0].data.detail ? action.response.errors[0].data.detail : action.response.errors[0].message : action.response.errors[0].message
        return state
          .setIn(['usercreate', 'isLoading'], false)
          .setIn(['usercreate', 'errorsMessage'], message)
      } else {
        return state
          .setIn(['usercreate', 'isLoading'], false)
          .setIn(['usercreate', 'errorsMessage'], { message: "Something went wrong!" })
      }
    case actions.UPDATE_USER_FAILURE:
      return state
        .setIn(['usercreate', 'isLoading'], false)
        .setIn(['usercreate', 'errorsMessage'], { message: "Something went wrong!" })

    case actions.CREATE_UPD_IVR_USER_FAILURE:
      return state
        .setIn(['ivrCreateupd', 'errorMessage'], { message: "Oops! Something Went Wrong,Ivr Request failed" })
    case actions.CREATE_UPD_IVR_USER_REQUEST:
      return state
        .setIn(['ivrCreateupd', 'errorMessage'], null)

        case actions.RELATED_VENDORS_REQUEST:
          return state
              .setIn(["relatedVendors", 'loading'], true)
      
        case actions.RELATED_VENDORS_SUCCESS:
          return state
              .setIn(["relatedVendors", 'loading'], false)
              .setIn(["relatedVendors", "searchVendors", action.searchText], fromJS(action.relatedVendors))
      
        case actions.RELATED_VENDORS_FAILURE:
          return state
              .setIn(["relatedVendors", 'loading'], false)
              .setIn(["relatedVendors", "searchVendors", action.searchText], fromJS(action.errors))

              case actions.RELATED_USERS_REQUEST:
                return state
                    .setIn(["relatedUsers", "relatedusersLoading"], true)
            
              case actions.RELATED_USERS_SUCCESS:
                return state
                    .setIn(["relatedUsers", "relatedusersLoading"], false)
                    .setIn(["relatedUsers", "data"], fromJS(action.relatedVendors))
            
              case actions.RELATED_USERS_FAILURE:
                return state
                    .setIn(["relatedUsers", "relatedusersLoading"], false)
                    .setIn(["relatedUsers", "errors"], fromJS(action.errors))

                    case actions.VENDOR_PROFILE_REQUEST:
                      return state
                          .setIn(["singleProfile", "singleProfileLoading"], true)
                  
                    case actions.VENDOR_PROFILE_SUCCESS:
                      return state
                          .setIn(["singleProfile", "singleProfileLoading"], false)
                          .setIn(["singleProfile", "data"], fromJS(action.singleVendors))
                  
                    case actions.VENDOR_PROFILE_FAILURE:
                      return state
                          .setIn(["singleProfile", "singleProfileLoading"], false)
                          .setIn(["singleProfile", "errors"], fromJS(action.errors))
      


    case actions.CREATE_UPD_IVR_USER_SUCCESS:
      if (action.techId && action.techId.data && action.techId.data.createUpdIvrUser && action.techId.data.createUpdIvrUser.techId != null) {
        return state
          .setIn(['ivrCreateupd', 'message'], action.techId.data.createUpdIvrUser.techId)
      } else if (action.techId && action.techId.data && action.techId.data.createUpdIvrUser && action.techId.data.createUpdIvrUser.techId == null) {
        if (action.techId.data.createUpdIvrUser.message == "Invalid phone number.") {
          return state
            .setIn(['ivrCreateupd', 'errorMessage'], "Please enter a valid mobile number")
        } else if (action.techId.data.createUpdIvrUser.message == "Invalid sponsor USWIN.") {
          return state
            .setIn(['ivrCreateupd', 'errorMessage'], "Invalid Verizon sponsor")
        } else {
          return state
            .setIn(['ivrCreateupd', 'errorMessage'], "Oops! Something Went Wrong,Ivr Request failed")
        }
      } else {
        return state
          .setIn(['ivrCreateupd', 'errorMessage'], "Something went wrong!" )
      }
    case actions.DELETE_IVR_USER_REQUEST:
      return state.setIn(['deleteIvrUser','isLoading'],true)
    case actions.DELETE_IVR_USER_SUCCESS:
      if (action.response && action.response.data && action.response.data.delIvrTechUser && action.response.data.delIvrTechUser.code == 200) {
        return state
          .setIn(['deleteIvrUser', 'message'], action.response.data.delIvrTechUser.message)
        .setIn(['deleteIvrUser','isLoading'],false)
      } else if (action.response && action.response.data && action.response.data.delIvrTechUser && action.response.data.delIvrTechUser.code == 500) {
        return state
          .setIn(['deleteIvrUser', 'errormessage'], action.response.data.delIvrTechUser.message)
          .setIn(['deleteIvrUser','isLoading'],false)
      } else {
        return state
      }
    case actions.GET_DEVICE_COL_LIST_REQUEST:
      return state.setIn([action.loginId, "getTestDevice", "loading"], true)

    case actions.GET_DEVICE_COL_LIST_SUCCESS:
      return state
        .setIn([action.loginId, "getTestDevice", "loading"], false)
        .setIn([action.loginId, "getTestDevice", "deviceList"], fromJS(action.response.deviceList))
        .setIn([action.loginId, "getTestDevice", "deviceColumnDef"], fromJS(action.response.deviceColumnDef))

    case actions.GET_DEVICE_COL_LIST_FAILURE:
      return state.setIn([action.loginId, "getTestDevice", "loading"], false)
        .setIn([action.loginId, "getTestDevice", "errors"], fromJS(action.errors))



    case actions.UPDATE_DEVICE_DETAIL_REQUEST:
      return state.setIn([action.loginId, "getTestDevice", "loading"], true)

    case actions.UPDATE_DEVICE_DETAIL_SUCCESS:
      return state
        .setIn([action.loginId, "getTestDevice", "loading"], false)
        .updateIn([action.loginId, "getTestDevice", "deviceList"], (deviceList = Map()) => {
          let devices = deviceList.toJS();

          if (action.response.status == 'D') {
            delete devices[action.response.id]
            return Map(devices)
          }

          let obj = {
            id: action.response.id,
            status: action.response.status,
            createdBy: action.response.createdBy
          }

          let details = JSON.parse(action.response.deviceDetails)

          for (let x in details) {
            obj[x] = details[x]
          }

          let isNewDevice = true;

          for (let key in devices) {
            if (key === action.response.id) {
              isNewDevice = false
              devices[key] = obj
            }
          }

          if (isNewDevice) {
            devices[action.response.id] = obj
          }

          return Map(devices)
        })


    case actions.UPDATE_DEVICE_DETAIL_FAILURE:
      return state.setIn([action.loginId, "getTestDevice", "loading"], false)
        .setIn([action.loginId, "deleteTestDevice", "errors"], fromJS(action.errors))

    case actions.DELETE_IVR_USER_FAILURE:
      return state
        .setIn(['deleteIvrUser', 'errorMessage'], { message: "Oops! Something Went Wrong,Ivr Deletion failed" })

    case actions.DELETE_USER_REQUEST:
      return state
        .setIn(['deleteuser', 'isLoading'], true)
    case actions.DELETE_USER_SUCCESS:
      if (action.response && action.response.data && action.response.data.updateContact) {
        return state
          .setIn(['deleteuser', 'isLoading'], false)
          .setIn(['deleteuser', 'message'], action.response.data.updateContact)
      } else {
        return state
          .setIn(['deleteuser', 'isLoading'], false)
          .setIn(['deleteuser', 'errormessage'], { message: "Something went wrong!" })
      }
    case actions.DELETE_USER_FAILURE:
      return state
        .setIn(['deleteuser', 'isLoading'], false)
        .setIn(['deleteuser', 'errormessage'], { message: "Something went wrong!" })
    case actions.DELETE_SAVED_MSG:
      return state
        .setIn(['usercreate', 'message'], null)
        .setIn(['usercreate', 'errorsMessage'], null)
        .setIn(['ivrCreateupd', 'message'], null)
        .setIn(['ivrCreateupd', 'errorMessage'], null)
    case actions.GET_OPEN_OSW_REQUEST:
      return state.setIn(['openOsw', 'loading'], true)

    case actions.GET_OPEN_OSW_SUCCESS:
      return state
        .setIn(['openOsw', 'loading'], false)
        .setIn(['openOsw', 'data'], fromJS(action.data.openOsw || []))

    case actions.GET_OPEN_OSW_FAILURE:
      return state
        .setIn(['openOsw', 'loading'], false)
        .setIn(['openOsw', 'error'], fromJS(action.error))
    case actions.CLEAR_OPEN_OSW_DATA:
      return state.setIn(['openOsw', 'data'], fromJS([]))
    case "FETCH_TECHS_BY_SUBMARKET_SUCCESS":
      return state.setIn(['techsbysubmarket'], fromJS(action.techs))
    case actions.SAVE_PREFERENCE_REQUEST:
      return state.setIn([action.loginid, 'preference'], fromJS({ isLoading: true }))
    case actions.SAVE_PREFERENCE_SUCCESS:
      return state.setIn([action.loginid, 'preference', 'isLoading'], false)
        .setIn([action.loginid, 'preference', action.type, 'success'], fromJS(action.response))
        .setIn(['entities', 'users', action.loginid, 'preferences', action.prefType], fromJS(action.data))
    case actions.SAVE_PREFERENCE_FAILURE:
      return state.setIn([action.loginid, 'preference', 'isLoading'], false)
        .setIn([action.loginid, 'preference', action.type, 'errors'], fromJS(action.errors))
        case actions.GET_USER_IVRDETAILS_REQUEST:
          return state.setIn(['isLoading'],true)
          case actions.GET_USER_IVRDETAILS_SUCCESS:
            return state.setIn(['ivr_Details'],fromJS(action.ivr_Details))
            case actions.GET_USER_IVRDETAILS_FAILURE:
              return state.setIn(['errors'],fromJS(action.errors))
              case actions.UPDATE_IVRPIN_REQUEST:
          return state.setIn(['resetPinisLoading'],true)
          case actions.UPDATE_IVRPIN__SUCCESS:
            return state.setIn(['resetPinisLoading'],false)
            .setIn(['ivr_Details'],fromJS(action.status))
            case actions.UPDATE_IVRPIN__FAILURE:
              return state.setIn(['resetPinisLoading'],false)
              .setIn(['errors'],fromJS(action.errors))
    case actions.MAKEME_USER_REQUEST: {
      console.log('action', action)
      let loginId = action.selecteduser.userid

      browserStorage.set({
        realUser: browserStorage.get('realUser'),
        currentUser: {
          loginId: loginId
        }
      })

      return state
        .set('currentUser', fromJS({
          loading: false,
          loginId: action.selecteduser.userid,
          makeMeUserForOffshoreUser: true
        }))

        .setIn(['entities', 'users', loginId], fromJS(action.selecteduser))


    }
    case actions.UPDATE_USER_OBJ: {
      const loginId = action.updatedUser.login_id
      return state.setIn(['entities', 'users', loginId], fromJS(action.updatedUser))
    }  
      
    case actions.NAVBAR_LOAD_REQUEST: {
      return state.setIn(['NavbarLoaded'],fromJS(action.loaded))
    }

    case actions.VENDOR_BANNER_TOGGLE: {
      return state.setIn(["isVendorBannerDisabled"], fromJS(action.data));
    }
    default:
      return state
  }
}

export default Users
