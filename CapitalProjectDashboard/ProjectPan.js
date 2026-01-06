import React, {useState} from 'react'
import "./Capital.css"
import CapitalProjectGrid from "./CapitalProjectGrid"
import ReactTooltip from 'react-tooltip'
import * as XLSX from "xlsx"
// import * as utils from "../utils"
import { saveAs } from "file-saver"
const ProjectPan =(props) =>{
    const[showGrid,setShowGrid]=useState(false);
    const[bucket,setBucket]=useState("")
    const[projectLength,setProjectLength]=useState(0)
    const {schedule_projects=[],unschedule_projects=[]} = props.projects || {}
    const AllProjectsList = [...schedule_projects,...unschedule_projects]

    const handleExportToExcelClick = async () => {
        let projectsList 
        let data = []
          if(bucket == "Work Pending Unscheduled"){
            projectsList= props.projects?.unschedule_projects
          }else if (bucket == "Work Pending Scheduled") {
            projectsList = props.projects?.schedule_projects
          }else if(bucket == "Work"){
            projectsList = AllProjectsList 
          }
        if (projectsList) {
          data = projectsList.map(item => {
            let exceldata = {
              "Project ID": item.proj_number ? item.proj_number : "",
              "Project Name": item.project_name ? item.project_name : "",
              "Site ID": item.siteid ? item.siteid : "",
              "Site Name": item.sitename ? item.sitename : "",
              "Manager": item.manager ? item.manager : "",
              "Field Engineer": item.field_engineer ? item.field_engineer : "",
              "Project Initiative": item.project_initiative ? item.project_initiative : ""
            }
            return exceldata
          })
          let ws = XLSX.utils.json_to_sheet(data)
          ws['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 25 }]
          let wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, "Projects")
          let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' })
          let buf = new ArrayBuffer(wbout.length)
          let view = new Uint8Array(buf)
          for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF
          saveAs(new Blob([buf], { type: "application/octet-stream" }), `projects.xlsx`)
        }
      }
    return (
        <div>
        <div className="work-container">
            <div className="work-header"> Work</div>
                <div className="work-count" 
                 onClick={()=>{setShowGrid(true);setBucket("Work"),setProjectLength(props.projects?.totalprojects)}}>
                {props.projects?.totalprojects || "0" }</div>
                <div className="work-status" style ={{display:"flex",height:"130px"}}>
                    <div className="work-box projunscheduled" 
                        onClick={()=>{setShowGrid(true);setBucket("Work Pending Unscheduled"),setProjectLength(props.projects?.unschedule_projects?.length)}}>
                        <p className="work-title"> Work Pending Unscheduled</p>
                        <p className="work-value" style={{paddingTop:"10px"}}>{props.projects?.unschedule_projects?.length}</p>
                    </div>
                    <div className="work-box projscheduled"
                        onClick={()=>{setShowGrid(true);setBucket("Work Pending Scheduled"),setProjectLength(props.projects?.schedule_projects?.length)}}>
                        <p className="work-title"> Work Pending Scheduled</p>
                        <p className="work-value" style={{paddingTop:"10px"}}>{props.projects?.schedule_projects?.length}</p>
                    </div>
                </div>
        </div>
            {showGrid  && (
                <div style ={{padding:"15px"}}>
                <div className="work-header" style={{textAlign:"center"}}>
                    <span >{bucket}<span>{' ('}{projectLength}{')'}</span></span>
                        {<a onClick={() =>{setShowGrid(false)}} style={{ margin: '5px' }}><i className="fa fa-times float-right vz-pointer" style={{ margin: '5px' }} ></i></a>}
                        {<><img className="float-right vz-pointer" data-tip data-for="ProjectInfo" style={{ height: "25px", width: "25px", marginRight: '15px',cursor:"pointer" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMGSURBVGhD7ZldSFNhGIDXTZddd9/dYsv9iVFSREFhYgUG3fUHQWDUTX9ujqhQI4YUBJUjAuvCCC8y0otIzH4gAi2ItEFhwZxKuCWpy+3t+87eT75tL+tdR7cW54GHHc53vnOeb54dZLNZWFhY/JesWt/sXudo8TQ6/K5WR8D9xOl3RXHs38IetK92BN1uEXhYhF4Tr4MiOu4MuCFXnFI+qoPVa0RkrbPZ1SRewyL2rdPvXqBiKfE0pcEe9K0VoTudAc9ZEdrtDLgiIiKdG1WMeOrSQAWYdXfPnr+yrqdhCLP4UAFmpeK4YhYfKsCsVBhXzOJDBZiVCuOKWXyoALNSYVwxiw8VYFYdFVYIawG6bY+v4GkznOk+nzW+tW07zM7P4ijA1b5Q1rhUp+QLcAV9EIlF8NQAoxNjsKHFszTe9fI+jgB8EsfJ4/X5Uj2oWDGLT+7FpcfuHsfEDE1dJ439u0L1sPBrwdiXTqfhUPho3lwpFcYVs/hQAdKnH54ZoZKR8XfGvkfDvbgHjO3cOUodFVaIFVmAfLfn8d2WnO4+B6l0ythOzCVgW/sOcp5Up2wLkN4a6MRLAMR/xnELoLW3nTxeqVPWBdRc3AyxeAwvk+FjdBSqgl7yeKUeVKyYxYcKUG66vAUmE5OYnuHr92/gu1BDHq+kwrhiFh8qQPngzUPMBpj6MY1bADcHbpPHK3VUWCFWZAEHO48Yj0rJXHIOTtw7ZWxL5KO0vmMvOU+qU5YFeMUt8nnqC54eIDx4x9g/NPYC9wC8irzOm6fUKcsC5C2imBFPH/lZkPv33ziw9FeRyEdr7lypHlSsmMUn9+L7rjdCcjGJiQCh/o6s8b73/TgCxgd846XarHEpFcYVs/joF65q8cLw+AjmAURnJvKeOPLeX0wt4hFg/G+kj0t1VFghlm0By6WOtYA/QQWYVQ8qVsziQwWYlQrjill8qACzUmFcMYsPFWBWKowrZvGhAsxKhXGs62l4jll8Kv7LXYqK+nqdS0X9wFEElfMTk4WFhYUJbLbfbN1C3qvvP5YAAAAASUVORK5CYII="
                        onClick={()=>{handleExportToExcelClick()}} />
                        <ReactTooltip id="ProjectInfo" place="top" effect="float">
                            <span>Project Info</span>
                        </ReactTooltip>
                        </>}
                        </div>
                <div>
                          <CapitalProjectGrid
                            projects={bucket == "Work Pending Unscheduled" ? props.projects?.unschedule_projects : bucket == "Work Pending Scheduled" ? props.projects?.schedule_projects : AllProjectsList}
                            onGridReady={props.onGridReady}
                            onRowClicked={props.onRowClicked}
                            calendarevents={props.calendarevents}
                            vendorCalenderIconClicked={props.vendorCalenderIconClicked}
                            minHeight={300}
                            hideFooter={false}
                            />
                </div>

              </div>  
            )}
        </div>
        
    )
}




export default ProjectPan
