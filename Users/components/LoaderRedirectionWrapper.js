import React from "react"
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import browserStorage from "../../browserStorage";
import store from "../../store";
import * as userActions from '../../Users/actions'

export  const LoaderRedirectionWrapper=(props)=>{
const [showChildren,setShowChildren]=useState(false)

const navigate=useNavigate();

  useEffect(()=>{

  
  let realUser = browserStorage.get('realUser')
  let currentUser = browserStorage.get('currentUser')
  if (!realUser) {
    realUser = {}
  }

  if (!currentUser) {
    currentUser = {}
  }
  // eslint-disable-next-line no-undef
  const urlParams = new URLSearchParams(window.location.search)
  const pathdata = { path: window.location.pathname, jobId: urlParams.get('jobId') }
  browserStorage.set(pathdata)
  if(pathdata.path.indexOf("verifyUser") !== -1){
    setShowChildren(true)
  }
  else{
    store.dispatch(userActions.fetchUser(currentUser.loginId,navigate))
    .then(() => 
    {
      store.dispatch({ type: 'SYNC_USER_PREFERENCES' })
      setShowChildren(true)
    })
    .catch(setShowChildren(true))
  }
},[])

return (
    <>
    {showChildren && props.children}
    </>
)
}