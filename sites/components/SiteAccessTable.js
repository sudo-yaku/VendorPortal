import React, { useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import crossIcon from '../images/closeIcon_blk.svg'
import { useDispatch,useSelector } from 'react-redux'
import {addRestriction} from '../actions';
import Loader from '../../Layout/components/Loader'
import * as utils from '../utils'


export default function SiteAccessTable ({site, loading, filterProps,loginId,User}) {
  return loading ? <Loader color="#cd040b" size="75px" margin="4px" className="text-center" /> : (
    <AccessTable site={site} quoteStatus={filterProps.quoteStatus} loginId={loginId} User={User}/>
  )
}

function AccessTable ({site, quoteStatus,loginId,User}) {
  const [restrictions,setRestrictions]=useState("");
  const [message,setMessage]=useState("");
  const [itemExpanded,setitemExpanded]=useState(false);
  const [displayModel,setDisplayModel]=useState(false);
  const [displayMsg,displayMessage] = useState(false)
  const updateResLoading = useSelector(state=> {return state.getIn(["Sites",loginId,"addRestriction", "addRestrictionLoading"])})
  const dispatch=useDispatch();

  const inputChangeHandler=(e)=>{
  setRestrictions(e.target.value);
}

const updateRestrictions=()=>{
  let enteredText = moment().format('MM/DD/YYYY')+'New restriction added by ' + User.fname+User.lname+ ' from ' + User.vendor_name + ':' + restrictions;
  let restrictiondata=site.toJS().restriction+"\n"+enteredText;
  const payloadData={
  data:{
    RESTRICTION:restrictiondata
  }
}
dispatch(addRestriction(loginId,payloadData,site.toJS().site_unid, site.toJS().site_network_id))
.then(res=>{
  if(res.type==="ADD_RESTRICTION_SUCCESS"){
    setRestrictions("")
    setMessage(res.updated_access_restriction[0].result_message)
    displayMessage(true)
    setTimeout(() => {
    displayMessage(false)
    setDisplayModel(false)
    setitemExpanded(false)
  }, 6000)
    }
  });  }
  return (
    <div className="col-lg-12 col-12">
      {site.count() === 0 && <div className="text-center">No site info.</div>}
      <div className='row' style={{marginBottom:'20px'}}>
        <div className='col-md-4'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Security Lock Type:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>{site.get('security_lock')?site.get('security_lock'):"-"} </p>
        </div>
        <div className='col-md-4'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Lock is NOC Integrated:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>{site.get('security_lock_noc_int')?site.get('security_lock_noc_int').toUpperCase():"-"}</p>
        </div>
        <div className='col-md-4'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Access Restrictions:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>{site.get('accessrestriction')?site.get('accessrestriction'):"-"}</p>
        </div>
      </div>
      <div className='row' style={{marginBottom:'20px'}}>
        <div className='col-md-4'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Gate Combo 1:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>{site.get('gatecombo1')?site.get('gatecombo1'):"-"} </p>
        </div>
        <div className='col-md-4'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Gate Combo 2:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>{site.get('gatecombo2')?site.get('gatecombo2'):"-"}</p>
        </div>
        <div className='col-md-4'>
        {quoteStatus=== utils.COMPLETED? <div>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Signage/Barriers:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>{site.get('signagebarriers')?site.get('signagebarriers'):"-"}</p>
          </div> : null }
        </div>
      </div>
      <div className='row' style={{marginBottom:'20px'}}>
          <div className='col-md-5' >
              <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Restrictions:</p>
              <textarea rows={5} cols={60} readOnly>{site.get('restriction')?site.get('restriction'):"-"}</textarea>
          </div>
          <div className='col-md-5'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Directions:</p>
          <textarea rows={5} cols={60} readOnly>{site.get('direction')?site.get('direction'):"-"}</textarea>
          </div>
        <div className='col-md-2' >
          <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '0px' }}>Door Code:</p>
          <p style={{ fontSize: '12px', fontWeight: 'normal', border: '1px solid #d8dada', width: '90%', height: '25px', paddingTop: '3px', paddingLeft: '5px' }}>{site.get('door_codes') ? site.get('door_codes') : "None"}</p>
        </div>
        </div>
      {/* <div className="table-responsive">
        <table className="vzwtable Table Table--hover">
           <tbody>
            {site.count() === 0 && <tr><td colSpan="4" className="text-center">No site info.</td></tr>}
            <tr>
              <td scope="row" className="Form-group"><label className="Form-label">Security Lock Type:</label></td>
              <td>{site.get('security_lock')?site.get('security_lock'):"-"}</td>
              <td scope="row" colSpan="" className="Form-group"><label className="Form-label">Lock is NOC Integrated:</label></td>
              <td>{site.get('security_lock_noc_int')?site.get('security_lock_noc_int').toUpperCase():"-"}</td>
              <td scope="row" className="Form-group"><label className="Form-label">Access Restrictions:</label></td>
              <td>{site.get('accessrestriction')?site.get('accessrestriction'):"-"}</td>
              </tr>
              <tr>
              <td scope="row" className="Form-group"><label className="Form-label">Gate Combo 1:</label></td>
              <td>{site.get('gatecombo1')?site.get('gatecombo1'):"-"}</td>
              <td scope="row" className="Form-group"><label className="Form-label">Gate Combo 2:</label></td>
              <td>{site.get('gatecombo2')?site.get('gatecombo2'):"-"}</td>
              {quoteStatus=== utils.COMPLETED?<div>
              <td className="Form-group" ><label className="Form-label">Signage/Barriers:</label></td>
              <td>{site.get('signagebarriers')?site.get('signagebarriers'):"-"}</td>
              </div>:<td className="Form-group"></td>}

            </tr>
            <tr>
              <td scope="row" className="Form-group"><label className="Form-label">Restrictions:</label></td>
              <td><pre wrap="HARD">{site.get('restriction')?site.get('restriction'):"-"}</pre></td>
              <td scope="row" style={{fontSize:14}} className="Form-group"><label className="Form-label">Directions:</label></td>
              <td scope="row" colSpan="4"><pre wrap="HARD">{site.get('direction')?site.get('direction'):"-"}</pre></td>
            </tr>
          </tbody>
        </table>
        </div> */}
        <button  style={{marginBottom:"2rem",padding:"0.8em 1.5em", borderRadius:'50px', backgroundColor:'black', color:'white'}} className="Button--secondary" onClick={()=>{setDisplayModel(!displayModel);setitemExpanded(!itemExpanded)}}>{itemExpanded?"-Hide restrictions":"+Add Restrictions"}</button>
        {displayModel && <div className='row' style={{marginBottom:"30px",marginTop:"20px"}}>
        <div className='col-8'>
        Restrictions &nbsp;&nbsp;&nbsp;(<span style={{ color: 'orange',paddingTop:"5px"}}>Restrictions Will Be Updated After Two Hours</span>)
        <input type="text" value={restrictions} className="Form-input" style={{width:"30rem"}} placeholder="add restriction" required onChange={inputChangeHandler} />
        {restrictions.length>0 && <span onClick={()=>setRestrictions("")}><img style={{marginLeft:"-2rem",position:"absolute",zIndex:"99",marginTop:"0.95rem"}}  width="16px" height="16px" src={crossIcon}/></span>}
        </div>
        <div className='col-4'>
        <button disabled={!restrictions.length>0}  style={{marginTop:"1.2rem",paddingLeft:"1.6rem",paddingRight:"1.6rem"}}className="Button--secondary" onClick={()=>{updateRestrictions()}}>ADD</button>&nbsp;
        </div>
        <br></br>
        {displayMsg ? <span className="text text-success" style={{marginLeft:"1rem"}}>{message}</span> : null}
        </div>
        }
        {updateResLoading&&updateResLoading!==undefined ?<Loader color="#cd040b" size="55px" className="text-center"/>:null}
    </div>
  )
}



SiteAccessTable.propTypes={site: PropTypes.object.isRequired, loading: PropTypes.bool.isRequired, filterProps:PropTypes.object}
AccessTable.propTypes = {site: PropTypes.object.isRequired, quoteStatus:PropTypes.string,loginId:PropTypes.string}

