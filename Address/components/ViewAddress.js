/**
  Copyright: Verizon Data Services 

  File Name: ViewAddress.js
  ******************************************************************************************
  Release Date    Change Date      Name          Description
                  02/25/2022       shade86       Initial creation
 
 *******************************************************************************************/

import React from 'react';
import Modal from '../../Layout/components/Modal';

function ViewAddress ({title, handleHideModal }) {

    return (
        <Modal ref={modal => modal = modal} large title={title} handleHideModal={handleHideModal} 
            style={{ width: "80%", maxWidth: "80%", display: "block", marginTop: 90 }}>
        </Modal>
    )
}

export default ViewAddress;