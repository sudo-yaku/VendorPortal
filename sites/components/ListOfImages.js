import React from 'react';
import PropTypes from 'prop-types';
import broken_image from '../../Images/broken_image.png';
import Paper from '@material-ui/core/Paper';
import crossIcon from '../images/closeIcon_blk.svg';

const ListOfImages = ({ fileList, onRemoveClick }) => {
  const rows_files = fileList.map((file, index) => (
    <Paper elevation={0} key={file['file_name']} sx={{ padding: 2, marginBottom: 2 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5em',
          marginBottom: '0.5em',
          border: '1px solid lightgray',
          borderRadius: '6px',
          background: '#fafbfc',
        }}
      >
        
        <div style={{ flex: '0 0 12px' }} />
       
        <div style={{ flex: '0 0 36px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={broken_image} width={30} height={30} style={{ objectFit: 'contain' }} alt="file" />
        </div>
        
        <div style={{ flex: '1 1 60%', marginLeft: '1em', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontWeight: 500 }}>
            {file?.file_name.length > 30 ? file?.file_name.substring(0, 30) + '...' : file?.file_name}
          </div>
          <div>
            <span style={{ color: file?.validationColor }}>
              <i>{file?.status}</i>
            </span>
          </div>
        </div>
        {/* Remove Icon */}
        <div
          style={{
            flex: '0 0 32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => onRemoveClick(index)}
          title="Remove"
        >
          <img
            width="16"
            height="16"
            src={crossIcon}
            alt="Remove"
            style={{ display: 'block' }}
          />
        </div>
      </div>
    </Paper>
  ));

  return <div>{rows_files}</div>;
};

ListOfImages.propTypes = {
  fileList: PropTypes.arrayOf(
    PropTypes.shape({
      file_name: PropTypes.string.isRequired,
      status: PropTypes.string,
      validationColor: PropTypes.string,
    })
  ).isRequired,
  onRemoveClick: PropTypes.func.isRequired,
};

export default ListOfImages;