import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../actions';
import Loader from '../../Layout/components/Loader'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment'
import RMAPictures from "./RMAPictures";


function RMADetails(props) {
  const dispatch = useDispatch();

  const rmaLoading = useSelector(state => { return state.getIn(["VendorDashboard", props.loginId, props.vendorWorkOrderSelectedRowObj.workorder_id, "rmaLoading"]) });
  const rmaDetails = useSelector(state => { return state.getIn(["VendorDashboard", props.loginId, props.vendorWorkOrderSelectedRowObj.workorder_id, "result"]) });
  const rmaError = useSelector(state => { return state.getIn(["VendorDashboard", props.loginId, props.vendorWorkOrderSelectedRowObj.workorder_id, "rmaDetails", "errors"]) });

  useEffect(() => {
    dispatch(actions.getRmaDetails(props.loginId, props.vendorWorkOrderSelectedRowObj.workorder_id, null));
  }, [])

  if (rmaLoading && rmaLoading !== undefined)
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )

  return (
    <>
      {rmaDetails && rmaDetails.toJS().map((rma, index) => {
        return (
          <>
            <Accordion
              style={{
                margin: 'auto', width: '99%',
                boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold"
              }}
              TransitionProps={{ unmountOnExit: true }}
              defaultExpanded={index == 0 ? true : false}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                RMA ID:{rma.IOP_RMA_ID}

              </AccordionSummary>
              <AccordionDetails>

                <div className="col-md-12 " style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>

                  <div className="col-lg-12" style={{ float: 'left' }}>

                    <table className="table sortable table-bordered text-center site-table">
                      <tbody className="vzwtable text-left">
                        <>
                          <tr>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }} ><label className="Form-label">RMA Number</label>{rma.RMA_NUMBER}</td>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">RMA Status</label>{rma.STATUS}</td>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Ship Tracking ID</label>{rma.TRACKING_NO}</td>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Delivery Date</label>{rma.REQUESTED_DELIVERY_DATE && moment(rma.REQUESTED_DELIVERY_DATE).format('MM/DD/YYYY')}</td>

                          </tr>
                          <tr>
                            <td colSpan="4" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Shipped From</label></td>
                            <td colSpan="4" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Shipped To</label>{rma.SHIP_LOCATION_ADDR}</td>
                            <td colSpan="4" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Shipping Address</label></td>

                          </tr>
                          <tr>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Scanned in Date</label></td>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Logical Installation</label>{rma.ACTIVATION_DATE && moment(rma.ACTIVATION_DATE).format('MM/DD/YYYY')}</td>
                            <td colSpan="2" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Scanned Out Date</label></td>
                            <td colSpan="2" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Scanned Defective S.No </label></td>
                            <td colSpan="2" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Return Tracking ID</label>{rma.REPLACEMENT_TRACKING_NUMBER}</td>

                          </tr>
                          <tr>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Return Shipping Label Scanned</label>{rma.REPLACEMENT_SHIPMENT_DATE && moment(rma.REPLACEMENT_SHIPMENT_DATE).format('MM/DD/YYYY')}</td>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Return Delivered</label></td>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">Goods Receipt</label></td>
                            <td colSpan="3" className="Form-group" style={{ fontWeight: "lighter" }}><label className="Form-label">RMA Complete</label></td>

                          </tr>
                        </>
                      </tbody>
                    </table>
                    <RMAPictures loginId={props.loginId} rma={rma} vendorId={props.vendorId} workorderId={props.vendorWorkOrderSelectedRowObj.workorder_id} site_unid={props.vendorWorkOrderSelectedRowObj.site_unid}></RMAPictures>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

          </>
        )
      })}
      {rmaError && <p>No Data Found</p>}
    </>
  );
}

export default RMADetails; 
