import React, {Component} from 'react'
import PropTypes from 'prop-types'
import XlsxPopulate from 'xlsx-populate'
import ExcelSVG from './images/Excel.svg'
import download from './download'
import getTableFields from '../Layout/table_fields'

export default class ExcelDownload extends React.Component {
  static defaultProps = {
    className: 'pointer pull-right'
  }
  static propTypes = {
    tableName: PropTypes.string.isRequired,
    input: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    sheets: PropTypes.array,
    size: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string
  }

  handleClick () {
    const {tableName, input, sheets} = this.props
    const tableFields = getTableFields(tableName)

    const pages = Array.isArray(input) ? input : [input]
    const data = []
    pages.forEach((page, i) => {
      const rows = [tableFields['labels' + (i > 0 ? `_${i+1}` : '')]]
      page.forEach(item => {
        const row = []
        tableFields['fields' + (i > 0 ? `_${i+1}` : '')].forEach(field => {
          row.push(item.get(field, ''))
        })
        rows.push(row)
      })
      data.push(rows)
    })

    download(`${tableName}.xlsx`, data, sheets)
  }

  render () {
    return (
      <img
        src={ExcelSVG}
        width={this.props.size || 22}
        height={this.props.size*1.3636 || 30}
        className={this.props.className}
        onClick={() => this.handleClick()}
        style={this.props.style}
      />
    )
  }
}

export class ExcelSheet {
  constructor (name, columns = []) {
    columns.forEach(column => {
      if (!(column instanceof ExcelColumn)) {
        throw new Error("ExcelSheet expects all columns to be ExcelColumns.")
      }
    })

    this.name = name
    this.columns = columns
  }
}

export class ExcelColumn {
  constructor (label, value) {
    if (typeof(label) !== 'string') {
      throw new Error('ExcelColumn label must be a string.')
    }

    if (!['function', 'string'].includes(typeof(value))) {
      throw new Error('ExcelColumn value must be a string or function.')
    }

    this.label = label
    this.value = value
  }
}

export class Excel extends React.Component {
  static propTypes = {
    fileName: PropTypes.string,
    data: PropTypes.object,
    style: PropTypes.object,
    sheets: PropTypes.arrayOf((items, key) => {
      if (!(items[key] instanceof ExcelSheet)) {
        throw new Error("Excel expects sheets to be ExcelSheets.")
      }
    })
  }

  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }

  onClick () {
    const {fileName, data, sheets} = this.props
    downloadWorkbook(fileName, data, sheets)
  }

  render () {
    return <img src={ExcelSVG} width="22px" className="pointer pull-right" onClick={this.onClick} style={this.props.style} />
  }
}

export class ExcelIcon extends React.Component {
  render () {
    return <img src={ExcelSVG} width="22px" className="pointer pull-right" {...this.props}/>
  }
}

export function downloadWorkbook (fileName, data, sheets = []) {
  const output = []
  sheets.forEach(sheet => {
    const rows = [sheet.columns.map(column => column.label)]
    data.forEach(page => {
      const row = []
      sheet.columns.forEach(column => {
        const getValue = typeof(column.value) === 'function' ?
          column.value :
          row => (row.get ? row.get(column.value) : row[column.value]) || ''
        row.push(getValue(page))
      })
      rows.push(row)
    })
    output.push(rows)
  })

  download(`${fileName}.xlsx`, output, sheets ? sheets.map(sheet => sheet.name) : null)
}

export function downloadWorkbook_xlxsPopulate (fileName, data, sheets = []) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('')
  fileName = fileName.includes('.xlsx') ? fileName : `${fileName}.xlsx`

  XlsxPopulate.fromBlankAsync()
    .then(workbook => {
      sheets.forEach(sheet => {
        const eSheet = workbook.addSheet(sheet.name || 'Sheet 1')
        sheet.columns.forEach((column, i) => {
          const getValue = typeof(column.value) === 'function' ?
            column.value :
            row => (row.get ? row.get(column.value) : row[column.value]) || ''
          const getStyle = typeof(column.style) === 'function' ?
            column.style :
            () => {}
          const eColumn = alphabet[i]
          eSheet.cell(eColumn + '1').value(column.label)
          data.forEach((row, rowIndex) => {
            eSheet.cell(eColumn + String(rowIndex + 2)).value(getValue(row)).style(getStyle(row) || {})
          })
        })
      })
      workbook.deleteSheet(0) // delete the sheet the library starts you with
      workbook.outputAsync()
        .then(function (blob) {
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName)
          } else {
            var url = window.URL.createObjectURL(blob)
            var a = document.createElement("a")
            document.body.appendChild(a)
            a.href = url
            a.download = fileName
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }
        })
    })
}
