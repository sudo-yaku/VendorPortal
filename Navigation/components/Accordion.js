import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'


class panel extends React.Component {
  static get propTypes () {
    return {
      to: PropTypes.string,
      params: PropTypes.object,
      query: PropTypes.object,
      children: PropTypes.node,
      filter: PropTypes.node,
      id: PropTypes.string,
      headingId: PropTypes.string,
      expanded: PropTypes.string,
      accordionId: PropTypes.string,
      heading: PropTypes.string,
      router: PropTypes.object,
      isDefault:PropTypes.bool
    }
  }

  constructor (props) {
    super(props)
    this.state = {active: false}
  }

  onChange=() => {
    this.setState({active:!this.state.active})
  }

  componentDidMount () {
    this.setState({active:this.props.isDefault?true:false})

  }

  componentWillUnmount () {

  }

  render () {
    const collapseId = this.props.id + '-collapse'

    return (
          <div role="tablist" className="Accordion" ref="collapse">
            <div aria-expanded="false" className={this.state.active ? "Accordion-group is-expanded" : "Accordion-group"} >
              <div role="tab" id="accordionTwoHeader" className="Accordion-summary">
                <button aria-controls={collapseId} className="Accordion-button" onClick={this.onChange}>
                 {this.props.heading}
                </button>
              </div>
              <div role="tabpanel" aria-labelledby="accordionTwoHeader" id={collapseId} className="Accordion-detail" style={{'display': 'flex'}}>
                  {this.state.active ? this.props.children : null}
              </div>
            </div>
          </div>

    )
  }
}




    // <div className="panel panel-default">
    //       <div className="panel-heading">
    //         <h4 className="panel-title">
    //           <div className="row">
    //             <div className={filter ?"col-sm-6":"col-sm-12"} style={this.props.titleStyle}>
    //               <a ref="link" id={linkId} className="accordion-toggle collapsed" data-toggle="collapse" href={"#" + collapseId} aria-expanded="false" style={{"color":"black","fontSize":"14px","fontWeight":"600"}}>
    //                 <i
    //                   ref="icon"
    //                   className={"glyphicon " + UNEXANDED_ICON_CLASS}
    //                   data-icon-hide={"glyphicon " + EXPANDED_ICON_CLASS}
    //                   data-icon-show={"glyphicon " + UNEXANDED_ICON_CLASS}>
    //                 </i>
    //                 &nbsp;{this.props.heading}
    //               </a>
    //             </div>
    //             {filter && (<div className="col-sm-6">
    //                 {filter}
    //             </div>)}

    //           </div>
    //         </h4>
    //       </div>
    //       <div ref="collapse" className="panel-collapse collapse" id={collapseId} aria-expanded="false" style={{height: '0px'}}>
    //         <div className="panel-body">
    //           {children}
    //         </div>
    //       </div>
    //   </div>
export const Panel = withRouter(panel)
