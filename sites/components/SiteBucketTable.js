import React from 'react'
import PropTypes from 'prop-types'


export default function SiteBucketTable ({BucketDetails}) {
  return   (
    <div className="col-lg-12 col-12">
    <div className="table-responsive">
      <table className="vzwtable Table Table--striped Table--hover"  style={{border:'1px solid #d8dada'}}>
        <thead>
          <tr>
            <th id="bucket/crane" style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Bucket truck required</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Crane required</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Tower climbable</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Height of bucket truck/lift required in feet</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Additional comments</label></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{BucketDetails?.bucket_required? BucketDetails.bucket_required:"-"}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{BucketDetails?.crane_required? BucketDetails.crane_required:"-"}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{BucketDetails?.is_tower_climable? BucketDetails.is_tower_climable:"-"}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{BucketDetails?.bucket_required_height? BucketDetails.bucket_required_height:"-"}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{BucketDetails?.vendor_comments? BucketDetails.vendor_comments:"-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  )
}







SiteBucketTable.propTypes = {BucketDetails: PropTypes.object.isRequired}
