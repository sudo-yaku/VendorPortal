// import React from "react";
// import ReactApexCharts from "react-apexcharts";
// import { connect } from "react-redux"
// import * as pmActions from "../actions"
// import { Map, fromJS, List } from 'immutable'

// class PMSummary extends React.Component {
//     constructor(props) {
//         super(props);
       
//         this.state = {

        

//             series: [],
//             options: {
//                 chart: {
//                     width: '100%',
//                     type: "donut"
//                 },

//                 legend: {
//                     show: true,
//                     position: 'bottom',
//                     horizontalAlign: 'center',
//                     verticalAlign: 'center',
//                     offsetY: 0,
//                     offsetX: 0,
//                     formatter: function (val, opts) {
                        
//                         return val.split(' ')[0] + " - " +  Number(opts.w.globals.seriesPercent[opts.seriesIndex]).toFixed(2)  + '%'
//                     }

//                 },
                
//                 colors: ['#2E93fA', '#0B6E07', '#D24343', '#040A59',  "#999999", "#7B1FA2", "#FF5630"],
//                 labels: ['Pending sites count', 'Vendor-Completed sites count', 'NA-Accepted sites count', 'NA-Declined sites count',  'PO-Closed sites count', 'PO-Cancelled sites count', 'PO-Received sites count'],
               
//                 plotOptions: {
//                     pie: {
//                         customScale: 0.55,
//                         offsetX: -10,
//                         offsetY: -20,
//                         donut: {
//                             size: "50%"

//                         }
//                     }
//                 },

//                 dataLabels: {
//                     enabled: true,
//                     style: {
//                         fontSize: '16px',
//                         fontFamily: 'Helvetica, Arial, sans-serif',
//                         fontWeight: 'normal'

//                     },
//                 },



//                 responsive: [{
//                     breakpoint: 480,
//                     options: {
//                         chart: {
//                             width: 300
//                         },
//                         legend: {
//                             position: 'bottom'
//                         }
//                     }
//                 }]
//             }
//         };
//     }
   
//     componentWillMount() {
//         const { user, loginId, vendorId, fetchSearchedSites } = this.props

//         fetchSearchedSites(vendorId, loginId)
//     }
//     componentDidMount(){
        
       
  
      
//     }

//     changeName = () => {
//         this.setState(prevState => ({
//             ...prevState,
//             options: {
//                 ...prevState.options,
//                 title: {
//                     ...prevState.options.title,
//                     text: 'PM Summary'
//                 }
//             }
//         }))
//         return;
        
//     }
//     render() {
//        const selectedResults = this.props.pmGridMultiple
//      const   completedSites = selectedResults.filter(sr => sr.PM_ITEM_STATUS.includes('COMPLETED') || sr.PM_ITEM_STATUS.includes('RESUBMITTED')).length
//        const  pendingSites = selectedResults.filter(sr => sr.PM_ITEM_STATUS.includes('PENDING')).length
//        const  acceptedSites = selectedResults.filter(sr => sr.PM_ITEM_STATUS.includes('ACCEPTED')).length
//        const  declinedSites = selectedResults.filter(sr => sr.PM_ITEM_STATUS.includes('DECLINED')).length
        
//         const closedSites = selectedResults.filter(sr => sr.PM_ITEM_STATUS.includes('CLOSED')).length
//         const cancelledSites = selectedResults.filter(sr => sr.PM_ITEM_STATUS.includes('CANCELLED')).length
//         const receivedSites = selectedResults.filter(sr => sr.PM_ITEM_STATUS.includes('RECEIVED')).length

//          const series = [pendingSites,
//             completedSites,
//             acceptedSites,
//             declinedSites,
           
//             closedSites,
//             cancelledSites,
//             receivedSites]
          
        

//         return (
//             <div id="chart">
//                 <ReactApexCharts
//                     options={this.state.options}
//                     series={series}
//                     type="donut"
//                     width={380}
//                 />
//             </div>
//         );
//     }
// }

// function stateToProps(state) {

//     let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
//     let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
//     let vendorId = user.toJS().vendor_id
//     let searchResultsLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSearchresultsLoading"])
//     let searchResults = !!state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSearchresults"]) ? state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSearchresults"]).toJS() : []
//     let errorSearchResults = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSearchresultsfailed"])
    
//      let pmGridMultiple = !!state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmGridDetailsMultiple", 'getPmGridDetails','pmlistitems']) ? state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmGridDetailsMultiple", 'getPmGridDetails','pmlistitems']).toJS() :[]
  


//     return {
//         user,
//         loginId,
//         vendorId,
//         searchResultsLoading,
//         searchResults,
//          pmGridMultiple,
//         errorSearchResults
        
        

//     }

// }
// export default connect(stateToProps, { ...pmActions })(PMSummary)
