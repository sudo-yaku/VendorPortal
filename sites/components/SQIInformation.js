import React, { useEffect, useState } from "react";
import {useSelector,useDispatch} from 'react-redux'
import WorkRequest from "../../sites/images/Request.svg";

import * as actions from '../actions';
import Select from 'react-select'
import Loader from '../../Layout/components/Loader'
import { Map ,List} from 'immutable'
import { TextField } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles(theme => ({
  textField:{
      '& .MuiOutlinedInput-root':{
          height:'3rem'
      }
  }
  }))
function SQIInformation(props) {
  
  const [indexValue, setIndexValue] = useState(-1);
  const [resolutionType,setResolutionType]=useState("Select resolution type");
  const [selectedSQI,setSelectedSQI]=useState({});
  const [resolutionComments,setResolutionComments]=useState("");
  const [resolutionTypeOther,setResolutionTypeOther]=useState("");
  const updateResLoading = useSelector(state=> {return state.getIn(["Sites",props.loginId,"submitResolutionissue", "submitResolutionissueLoading"])})
  const issueLoading=useSelector(state=> {return state.getIn(["Sites", props.loginId,"issue","issueLoading"])});
  const issueData=useSelector(state=>{return state.getIn(["Sites", props.loginId, "issue","issueData"])});
  const resolutionDataLoading = useSelector(state=>{return state.getIn(["Sites", props.loginId, "Resolutionissue", "ResolutionissueLoading"])});
  const issueResolutionData=useSelector(state=>{return state.getIn(["Sites", props.loginId, "Resolutionissue","ResolutionissueData"])});
  const userData = useSelector(state => state.getIn(['Users', 'entities', 'users', props.loginId]))
  const dispatch=useDispatch();
  const classes = useStyles();
  const siteDetails = useSelector(state => state.getIn(["VendorDashboard", props.loginId, "site", "siteDetails"], List()))

  useEffect(()=>{
    dispatch(actions.getIssueDetails(props.loginId,props.unid));
  },[])


  const createSelectItems=()=>{
    let items = [];         
    issueResolutionData.toJS().forEach(element => {
      items.push({ value:element.value,label:element.display_value})
    })            
    return items;
}

  const changeCommentsHandler=(e)=>{
  setResolutionComments(e.target.value)}

  const updateComments=()=>{
    let payload = {
      "RESOLUTION_TYPE": resolutionType,
      "RESOLUTION_TYPE_OTHER":resolutionTypeOther,
      "RESOLUTION_COMMENTS": resolutionComments,
      "MODIFIED_BY":siteDetails?.get('managerid'),
    }

   dispatch(actions.submitResolutionTypes(props.loginId,payload,selectedSQI?.qissue_unid))
    .then(res=>{
      if(res?.update_comments?.message){
        props.notifref.addNotification({
          title: 'Success',
          position: "br",
          level: "success",
          autoDismiss: 10,
          message: res?.update_comments?.message
        })
      }else if(res?.update_comments?.errors[0]?.detail){
        props.notifref.addNotification({
          title: 'Failure',
          position: "br",
          level: "error",
          autoDismiss: 10,
          message: res?.update_comments?.errors[0]?.detail
        })}
        setResolutionComments("");
        setResolutionType("Select resolution type");
        setResolutionTypeOther("");
        setIndexValue(-1)
        
      });

  }
  

  

  if(issueLoading && issueLoading!==undefined) 
  return (<
    Loader color="#cd040b"
    size="50px"
    margin="4px"
    className="text-center" />
  )
  return (
    <>
      {issueData && issueData.toJS().length>0?(
        <table className="table sortable table-bordered text-center site-table">
          <tbody className="vzwtable text-left">
            <tr className="rowColor">
              <th>Issue ID</th>
              <th>Problem Type</th>
              <th>Priority</th>
              <th>Problem Desc</th>
              <th>Issue Status</th>
              <th>Actions</th>
            </tr>
            {issueData.toJS().map((data, index) => {
              return (
                <>
                  <tr key={data.issue_id}>
                    <td>{data.issue_id}</td>
                    <td>{data.problem_type}</td>
                    <td>{data.priority}</td>
                    <td>{data.problem_desc}</td>
                    <td>{data.status}</td>
                    <td>
                      <img
                        onClick={() => {
                          setSelectedSQI(data)
                          setResolutionType("Select resolution type");
                          if (indexValue === index) {
                            setIndexValue(-1);
                          } else{setIndexValue(index);
                            dispatch(actions.getResolutionTypes(props.loginId,data.problem_type))}
                        }}
                        src={WorkRequest}
                        style={{ height: "24px", "cursor": "pointer" }}
                      />
                    </td>
                  </tr>
              
                        {indexValue===index &&  <tr>
                          <td colSpan={6}>
                        <div className="row" >
                        <div className="col-md-3" >
                      <label className="Form-label" >Resolution Type<span style={{ color: 'red' }}>*</span></label>
                          <Select
                            className="basic-single text-center title-div-style selectDropDown"
                            classNamePrefix="select"
                            value={{value:resolutionType,label:resolutionType}}
                            placeholder={"Select Resolution Type"}
                            isSearchable={true}
                            onChange={event=>setResolutionType(event.value)}
                            options={issueResolutionData && issueResolutionData.toJS().length>0 ? createSelectItems() : null}
                            required
                            />
                        </div>
                        
                       {resolutionType === "Other" && (
                        <div className="col-md-3" >
                       <div style={{ display:'flex',flexDirection:'column',marginLeft:'12%',width:'100%' }}>
                        <label className="Form-label" >Resolution Type (Other)<span style={{ color: 'red' }}>*</span></label>
                        <TextField className={classes.textField}  id="outlined-basic" variant="outlined" onChange={(e)=>setResolutionTypeOther(e.target.value)}/>
                       </div>
                        </div>
                       )}

                        <div className="col-md-3">
                        <div className="Form-group width90" style={{ width: '100%',marginLeft:'12%' }}>
                        <label className="Form-label" >Resolution Comments<span style={{ color: 'red' }}>*</span></label>
                        <textarea value={resolutionComments} onChange={(e)=>changeCommentsHandler(e)} rows={2} 
                        className="form-control" required  />
                        </div>
                        </div>

                        

                        <div className="col-md-2" style={{ marginTop: '25px',marginLeft:"4.7rem"}}>
                        <button className="Button--secondary btn btn-sm" onClick={()=>updateComments()} disabled={!(resolutionType.length>0) || !(resolutionComments.length>0) || (resolutionType === 'Other' && !(resolutionTypeOther.length>0)) || resolutionType == 'Select resolution type'} style={{backgroundColor:"black"}}>
                        <b style={{color:"white"}} >Update</b>
                        </button>
                        </div>


              </div>
              {updateResLoading&&updateResLoading!==undefined ?<Loader color="#cd040b" size="55px" margin="4px" className="text-center"/>:null}
            </td>
        </tr>}
                    
                </>
              );
            })}
          </tbody>
        </table>
      ):null}
    </>
  );
}

export default SQIInformation;
