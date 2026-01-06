import React, { Component } from 'react'

export default class ListOfFiles extends React.Component {
    render() {
        const { onRemoveClick } = this.props
        let rows_files = []
        this.props.fileList.forEach(file => {
            var index = this.props.fileList.indexOf(file)
            var row1 = file['preview'] ? <a target="_blank" href={file['preview']} style={{ color: 'white', cursor: 'pointer' }}>{file['file_name']}</a> : <span style={{ color: '#FFF', cursor: 'pointer' }}>{file['file_name']}</span>
            rows_files.push(
                <span key={file['filename']} className="file_tag_designe">
                    {row1}
                    {(<span onClick={() => onRemoveClick(index)}><i className="fa fa-times-circle" style={{ "position": "relative", "top": "2px", "fontSize": "15px", "marginLeft": "10px", "color": "rgb(255, 255, 255)", "cursor": "pointer", "display": "inline-block" }}></i></span>)}
                </span>)
        })

        return (
        <div>
            {rows_files}
        </div>
        )
    }
}
