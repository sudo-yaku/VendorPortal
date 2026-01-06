/**
  Copyright: Verizon Data Services 

  File Name: Pane.js
  ******************************************************************************************
  Release Date    Change Date      Name          Description
  MM/DD/2021      10/05/2021       shade86       Initial creation
 
 *******************************************************************************************/

  import React from 'react';
  import PropTypes from 'prop-types';
  import { Fragment } from 'react';
  
  const headerStyle = {
    border: '1px solid #ddd',
    backgroundColor: '#f5f5f5',
    padding: 5,
    textAlign: 'center',
    fontWeight: '600',
  };
  
  const detailsStyle = {
    border: '1px solid #ddd',
    padding: 10,
    height: 550,
    overflow: 'auto',
  };
  
  const noResultsStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  };
  
  const Pane = ({ header, details, specData }) => {
    return (
      <div>
        <div style={headerStyle}>{header}</div>
        {details.length === 0 && specData.length === 0 ? (
          <div style={noResultsStyle}>
            <span>No Results</span>
          </div>
        ) : (
          <div style={detailsStyle}>
            {details.length > 0 ? (
              <pre style={{ borderRadius: 0 }}>
                {details.map((d) => (
                  <div key={d.enodeb_id}>
                    <span style={{ fontWeight: 'bold' }}>eNodeB# {d.enodeb_id} </span>
                    <br />
                    {d.output &&
                      d.output.length &&
                      d.output.map((o, i) => (
                        <div key={`${o}-${i}`}>
                          <span dangerouslySetInnerHTML={{ __html: o }} />
                          {`\n`}
                        </div>
                      ))}
                    <br />
                    <br />
                  </div>
                ))}
              </pre>
            ) : (
              <pre style={{ borderRadius: 0 }}>
                {specData?.map((d, i) => (
                  <Fragment key={i}>
                    {d}
                    {`\n`}
                  </Fragment>
                ))}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  };
  
  Pane.propTypes = {
    header: PropTypes.string,
    details: PropTypes.array,
    specData: PropTypes.array,
  };
  
  export default Pane;