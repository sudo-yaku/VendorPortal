/**
  Copyright: Verizon Data Services 

  File Name: DeleteAddress.js
  ******************************************************************************************
  Release Date    Change Date      Name          Description
                  02/25/2022       shade86       Initial creation
 
 *******************************************************************************************/

import React, { useState } from 'react';
import Modal from '../../Layout/components/Modal';

function DeleteAddress(props) {
    const [deleteDisable, setdeleteDisable] = useState(false)
    const handleDeleteAddress = () => {
        const { deleteAddress } = props
        setdeleteDisable(true)
        deleteAddress()

    }
    const { title, handleHideModal, deleteAddress, deleteAddressDetails } = props
    return (
        <Modal ref={modal => modal = modal} large title={title} handleHideModal={handleHideModal}
            style={{ width: "60%", maxWidth: "80%", display: "block", marginTop: 90 }}>
            <div> <h5>{deleteAddressDetails.address}</h5>
            </div>
            <span> Are you sure to delete the dispatch location?</span>
            <div className="col-sm-12 button-pan-vpa float-left" style={{ marginTop: "10px" }}>
                <button type="submit" onClick={() => handleDeleteAddress()} className="Button--secondary u-floatRight" disabled={deleteDisable}>
                    <span>Delete</span>
                </button>
                <button type="submit" onClick={() => handleHideModal()} className="Button--secondary u-floatRight" style={{ marginRight: '5px' }} disabled={deleteDisable}>
                    <span>Cancel</span>
                </button></div>
        </Modal>
    )
}

export default DeleteAddress;
