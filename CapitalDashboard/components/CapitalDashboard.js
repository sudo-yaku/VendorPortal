import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import MainContent from "../../Layout/components/MainContent"
import Loader from '../../Layout/components/Loader'
import PanVZRF from '../../Layout/components/PanVZRF'
import { Map, List } from 'immutable'
import * as CapitalActions from '../actions'
import CapitalDashboardGrid from './CapitalDashboardGrid'

function CapitalDashboard(props) {


  const [loginId, setloginId] = useState(props.loginId)

  useEffect(() => {
    let { getProjects } = props
    getProjects(loginId, "28.0604317", "-82.3719727", "25")
  }, [])


  const renderLoading = () => {
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )
  }


  let { isLoading, projectsList } = props
  return (
    <MainContent>
      {isLoading ? renderLoading : (<div className="container-fluid" style={{ "paddingTop": "120px" }}>
        {projectsList && (projectsList.toJS()).length > 0 ? <div className="col-md-12 no-padding float-left">
          <PanVZRF title="Project Details" >
            <CapitalDashboardGrid projects={projectsList.toJS()} />
          </PanVZRF>
        </div> : null}
      </div>)}

    </MainContent>
  )

}

function stateToProps(state) {
  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let isLoading = state.getIn(["CapitalDashboard", loginId, "getCapitalWork", "isloading"], false)
  let projectsList = state.getIn(["CapitalDashboard", loginId, "getCapitalWork", "projects"], Map())
  return {
    loginId,
    isLoading,
    projectsList
  }
}
export default connect(stateToProps, { ...CapitalActions })(CapitalDashboard)