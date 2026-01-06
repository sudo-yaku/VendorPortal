import React from 'react'
import PropTypes from 'prop-types'
import RequestHeader from './RequestHeader'
import Pane from './Pane'
// If you need Redux state or dispatch, import these:
// import { useDispatch, useSelector } from 'react-redux';

const ViewHealthCheck = (props) => {
    // const dispatch = useDispatch();
    // const someState = useSelector(state => state.someState); // Example

    return (
        <div>
            <RequestHeader 
                onClose={props.close} 
                requestId={props.requestId} 
                cbandTools={props.cbandtools ? true : false} 
                timeStamp={props.timeStamp} 
            />
            <div>
                <div className='word-wrap' style={{ flex: 1, position: 'relative', display: 'full' }}>
                    {props.summary && props.summary.length > 0 &&
                        <div>
                            <div style={{ border: '1px solid #ddd', backgroundColor: '#F5F5F5', padding: 5, textAlign: 'center', fontWeight: '600' }}>Summary</div>
                            {props.summary.map(s => {
                                return (
                                    <div style={{ border: '1px solid #ddd', padding: 10 }}>
                                        <div>Node : {s.enodeb_id}</div>
                                        {s.data.length > 0 &&
                                            s.data.map((h, i) => {
                                                return (
                                                    <div 
                                                        onClick={() => { document.getElementById(h.link).scrollIntoView() }} 
                                                        style={{ color: h.color }}
                                                        key={i}
                                                    >
                                                        {"* "}{h.header}
                                                    </div>
                                                )
                                            })}
                                    </div>
                                )
                            })}
                        </div>
                    }
                    <Pane 
                        header={props.requestType} 
                        details={props.hcData || []} 
                        specData={props.specData}
                    />
                </div>
            </div>
        </div>
    )
}

ViewHealthCheck.propTypes = {
    close: PropTypes.func,
    requestId: PropTypes.string,
    requestType: PropTypes.string,
    hcData: PropTypes.array,
    summary: PropTypes.array,
    summary_node: PropTypes.string,
    timeStamp: PropTypes.string,
    cbandtools: PropTypes.bool
}

export default ViewHealthCheck