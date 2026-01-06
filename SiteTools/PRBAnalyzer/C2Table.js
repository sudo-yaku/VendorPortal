import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {Table as C2Table, Column as C2Column, ColumnGroup as C2ColumnGroup} from 'c2-table'
import ReactPaginate from 'react-paginate'
import {connect} from 'react-redux'
import {searchTerm} from './table_selectors.js'
import {ExcelColumn, ExcelSheet, downloadWorkbook_xlxsPopulate} from '../../Excel/ExcelDownload'
import Styled from 'styled-components'
import chunk from 'lodash/chunk'
import C2FilterPopup from './C2AdvFilters.js'
import $ from 'jquery'

const StickyHeaderWrapper = Styled.div`
  overflow: ${props => props.doubleScrollbarEnable ? 'unset' : 'scroll'};
  max-height: ${props => props.doubleScrollbarEnable ? 'unset' : '60vh'};
  scrollbar-width: ${(props) => (props.hideScrollBar ? 'none' : '')};
  ::-webkit-scrollbar {
    display: ${(props) => (props.hideScrollBar ? 'none' : '')};
  }
  & table {
    border-collapse: separate;
  }
  & th {
    position: -webkit-sticky;
    position: sticky;
    top: 0px;
    z-index: 2;
    --border-color: #ddd;
    --background: #f2f2f2;
    border-bottom-width: 2px;
  }
  & th[scope=row] {
    position: -webkit-sticky;
    position: sticky;
    left: 0;
    z-index: 1;
  }
`

function flattenColumns(columns) {
  let childs = []

  React.Children.forEach(columns, (child) => {
    if (child.type && child.type._colType === C2ColumnGroup._colType) {
      childs = childs.concat(flattenColumns(child.props.children))
    } else {
      childs.push(child)
    }
  })

  return childs
}

function searchData(data, searchTerm, columns) {
  columns = columns.map((column) => {
    const searchValueType = typeof column.props.searchValue
    return {
      getSearchValue:
        searchValueType === 'function'
          ? column.props.searchValue
          : (row) => row[column.props.searchValue || column.props.id]
    }
  })

  const searchMap = {}
  data.forEach((row, i) => {
    const searchValues = []
    columns.forEach((column) => {
      searchValues.push(column.getSearchValue(row))
    })
    searchMap[i] = searchValues.join(' ')
  })
  return data.filter((row, i) => (searchMap[i] || '').toLowerCase().includes(searchTerm.toLowerCase()))
}

const onEmpty = <div className='text-center'>No results found</div>

function getFocusedPage(rowId, rowIdGetter, data, rowsPerPage) {
  const getter = typeof rowIdGetter === 'function' ? rowIdGetter : (row) => row[rowIdGetter]
  const pages = chunk(data, rowsPerPage)
  for (const [pageNo, rows] of pages.entries()) {
    for (const row of rows) {
      if (getter(row) === rowId) {
        return pageNo
      }
    }
  }
  return false
}

export class table extends Component {
  static propTypes = {
    children: PropTypes.any,
    id: PropTypes.string,
    data: PropTypes.array,
    searchTerm: PropTypes.string,
    getTable: PropTypes.func,
    searchEnabled: PropTypes.bool,
    className: PropTypes.any,
    enablePagination: PropTypes.bool,
    alwaysShowPagination: PropTypes.bool,
    enableTopScrolling: PropTypes.bool,
    onSort: PropTypes.func,
    onPageChange: PropTypes.func,
    rowsPerPage: PropTypes.number,
    page: PropTypes.number,
    stickyHeader: PropTypes.bool,
    hideScrollBar: PropTypes.bool,
    hidePagination: PropTypes.bool,
    focusedRowId: PropTypes.string,
    rowId: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    totalPages: PropTypes.number,
    doubleScrollbarEnable: PropTypes.bool
  }

  tableRef = React.createRef()

  static defaultProps = {
    className: 'table table-condensed',
    enableTopScrolling: true,
    stickyHeader: false,
    hidePagination: false,
    doubleScrollbarEnable: false
  }

  // constructor (props) {
  //   super(props)
  //   this.state = {
  //     page: getFocusedPage(props.focusedRowId, props.rowId, props.data, props.rowsPerPage) || 0
  //   }
  // }
  state = {
    page: 0,
    localFilterData: [],
    clickedColumns: {}
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (props.searchTerm !== state.prevSearchTerm) {
  //     return {
  //       prevSearchTerm: props.searchTerm,
  //       page: 0
  //     }
  //   }
  //   const focusedPage = getFocusedPage(props.focusedRowId, props.rowId, props.data, props.rowsPerPage) || 0
  //   if (focusedPage !== false && state.prevPage !== focusedPage) {
  //     return {
  //       ...state,
  //       prevPage: state.page,
  //       page: focusedPage
  //     }
  //   }
  //   return null
  // }

  upArrow = (<i className='glyphicon glyphicon-triangle-top' />)

  downArrow = (<i className='glyphicon glyphicon-triangle-bottom' />)

  rightArrow = (<i className='glyphicon glyphicon-triangle-right' />)

  componentDidMount() {
    if (this.props.getTable) this.props.getTable(this)
    const { isAdvFilter} = this.props
    // console.log(isAdvFilter, data, searchEnabled)
    if(isAdvFilter){
      // this.setState({localFilterData: data})
      this.addFilterIconsToColumns(this.tableRef);
    }
  }

  

  componentDidUpdate() {
    if (this.props.searchTerm !== this.state.prevSearchTerm) {
      this.setState({
        prevSearchTerm: this.props.searchTerm,
        page: 0
      })
    }
    const focusedPage =
      getFocusedPage(this.props.focusedRowId, this.props.rowId, this.getData(), this.props.rowsPerPage) || 0
    if (focusedPage !== false && this.state.prevPage !== focusedPage) {
      this.setState({
        prevPage: this.state.page,
        page: focusedPage
      })
    }
   this.handleDonorExpand(this.tableRef.current.props.data)
  }

  addFilterIconsToColumns(tableRef) {
    const columns = tableRef.current.props.children;
    React.Children.forEach(columns, (column) => {
      const columnId = column.props.id;
      if (columnId && column.props.headerClassName !== "hidden ") {
        const element = document.querySelector(`[data-testid="header-${columnId}"]`);
        if (element) {
          const span = document.createElement('span');
          span.className = 'fa-filter-icon';
          const icon = document.createElement('i');
          icon.className = 'fa fa-filter';
          span.appendChild(icon);
          element.appendChild(span);

          span.onclick = (e) => {
            e.stopPropagation();

            // Get the popup position
            let filterWidth = e.clientX;
            let filterHeight = e.clientY;

            // Get the screen dimensions
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Adjust the position if the popup goes beyond the screen boundaries
            const popupWidth = 300; // Approximate width of the popup
            const popupHeight = 200; // Approximate height of the popup

            if (filterWidth + popupWidth > screenWidth) {
              filterWidth = screenWidth - popupWidth - 10; // Adjust to fit within the screen
            }
            if (filterHeight + popupHeight > screenHeight) {
              filterHeight = screenHeight - popupHeight - 10; // Adjust to fit within the screen
            }

            this.setState((prevState) => ({
              isShowAdvFilter: true,
              filterMetaData: {
                filterWidth,
                filterHeight,
                selectedCol: columnId,
              },
              clickedColumns: {
                ...prevState.clickedColumns,
                [columnId]: true,
              },
            }));
          };
        }
      }
    });
  }

  setLocalFilterData(filteredData) {
    this.setState({ localFilterData: filteredData });
    const element = document.querySelector(`[data-testid="header-${this.state.filterMetaData.selectedCol}"]`);
    if (element) {
      const span = element.getElementsByClassName('fa-filter-icon')[0]; // Grab the child span element
      if (span) {
        span.style.color = 'red'; // Style the span element red
      }
    }
  }


  handleAdvanceFilterReset = () => {
    this.setState({ localFilterData: [] });
    !_.isEmpty(this.state.clickedColumns) && Object.keys(this.state.clickedColumns).forEach((columnId) => {
      const element = document.querySelector(`[data-testid="header-${columnId}"]`);
      if (element) {
        const span = element.getElementsByClassName('fa-filter-icon')[0]; // Grab the child span element
        if (span) {
          span.style.color = 'black'; // Reset the color to black
        }
      }
    });
    this.setState({ clickedColumns: {} });
  };

  getExcelSheet() {
    const columns = this.tableRef.current
      .getColumns()
      .filter((column) => column.props.excel !== false)
      .map((column) => {
        const _label =
          column.props.excelLabel || (typeof column.props.header === 'string' ? column.props.header : column.props.id)
        const label = typeof _label === 'function' ? _label() : _label
        const eColumn = new ExcelColumn(label, column.props.excelValue || column.props.id)
        eColumn.style = column.props.excelStyle
        return eColumn
      })

    return new ExcelSheet(this.props.id, columns, this.getData())
  }

  getData() {
    return this.tableRef?.current?.getData()
  }

  getPagedData() {
    return this.tableRef.current.getPagedData()
  }

  download = (data) => {
    const sheet = this.getExcelSheet()

    // downloadWorkbook(this.props.id, (data || this.refs.table.getData()), [sheet])
    downloadWorkbook_xlxsPopulate(this.props.id, data || this.tableRef.current.getData(), [sheet])
  }

  onSort = (...args) => {
    if (this.props.enablePagination) {
      this.setState({page: 0})
    }
    if (this.props.onSort) {
      this.props.onSort(...args)
    }
  }

  onPageChange = ({selected}) => {
    if (this.props.enablePagination) {
      this.setState({page: selected})
    }
    if (this.props.onPageChange) {
      this.props.onPageChange(selected)
    }
    if (this.props.enableTopScrolling && window.$) {
      window.$('html, body').animate({scrollTop: 0}, 'slow')
    }
  }

  goToFirstPage = () => {
    this.onPageChange({selected: 0})
  }

  handleDonorExpand = (data) => {
    const pathname = window.location.href
    if (pathname.includes('projects/tasks')) {
      data.filter(x => x.mdu_exists === false).forEach((row) => {
      const rowdata = document.getElementById(`tr-MyProjectsTable-${row.proj_number}`)
        const rowIcon = rowdata?.querySelector('td.text-center.pointer.clickable')
        if (!rowIcon) return
        rowIcon.innerHTML = ''
        rowIcon.classList.remove('pointer', 'clickable')
        rowIcon.onclick = null
        rowIcon.style.pointerEvents = 'none'
      })
    }
    if (pathname.includes('management')) {
      data.filter(x => x.mdu_exists === false).forEach((row) => {
        const rowdata = document.getElementById(`tr-management-dashboard-${row.site_id}-${row.project_number}-${row.fuze_site_id}`)
        const rowIcon = rowdata?.querySelector('td.text-center.pointer.clickable')
      if (!rowIcon) return
      rowIcon.innerHTML = ''
      rowIcon.classList.remove('pointer', 'clickable')
      rowIcon.onclick = null
      rowIcon.style.pointerEvents = 'none'
      })
    }
    if (pathname.includes('site/projects') || pathname.includes('site/details')) {
      data.filter(x => x.mdu_exists === false).forEach((row) => {
        const rowdata = document.getElementById(`tr-site-projects-table-${row.proj_number}`)
        const rowIcon = rowdata?.querySelector('td.text-center.pointer.clickable')
      if (!rowIcon) return
      rowIcon.innerHTML = ''
      rowIcon.classList.remove('pointer', 'clickable')
      rowIcon.onclick = null
      rowIcon.style.pointerEvents = 'none'
      })
    }
    
  }


  render() {
    const {data, searchEnabled, searchTerm, totalPages, isAdvFilter} = this.props
    const expandedRowSearch = this.props.expandedRowSearch ?? true
    const children = React.Children.toArray(this.props.children).filter((child) => !!child)
    const filteredData = searchEnabled !== false && expandedRowSearch ? searchData(data, searchTerm, flattenColumns(children)) : data
    const pageCount = totalPages || Math.ceil(filteredData.length / this.props.rowsPerPage)
    const Wrapper = this.props.stickyHeader ? StickyHeaderWrapper : Fragment
    const wrapperProps = Wrapper === Fragment ? {} : {hideScrollBar: this.props.hideScrollBar, doubleScrollbarEnable: this.props.doubleScrollbarEnable }
    //jQuery Code for double scrollbar
    $(function () {
      $(".wrapper1").scroll(function () {
        $(".wrapper2")
          .scrollLeft($(".wrapper1").scrollLeft());
      });
      $(".wrapper2").scroll(function () {
        $(".wrapper1")
          .scrollLeft($(".wrapper2").scrollLeft());
      });
    });

    return (
      <Fragment>
        <Wrapper {...wrapperProps}>
        {isAdvFilter && this.state.isShowAdvFilter ? <C2FilterPopup tableRef={this.tableRef} filterMetaData={this.state.filterMetaData} setLocalFilterData={(data) => this.setLocalFilterData(data)} onClose={() => this.setState({isShowAdvFilter: false, filterMetaData: {}})} originalData={filteredData} clickedColumns={this.state.clickedColumns}/> : null}
          {this.props.doubleScrollbarEnable ?
          <>
          <div class="wrapper1">
            <div class="div1"></div>
          </div>
          <div class="wrapper2">
            <div class="div2">
              <C2Table
                onEmpty={onEmpty}
                {...this.props}
                ref={this.tableRef}
                expandClassName='text-center pointer'
                data={isAdvFilter && this.state.localFilterData.length > 0 ? this.state.localFilterData : filteredData}
                sortAscIcon={this.upArrow}
                sortDescIcon={this.downArrow}
                collapsedIcon={this.rightArrow}
                expandedIcon={this.downArrow}
                onSort={this.onSort}
                page={totalPages ? 0 : this.props.enablePagination ? this.state.page : this.props.page}
              >
                {children}
              </C2Table>
            </div>
          </div>
          </> :
          <C2Table
          onEmpty={onEmpty}
          {...this.props}
          ref={this.tableRef}
          expandClassName='text-center pointer'
          data={isAdvFilter && this.state.localFilterData.length > 0 ? this.state.localFilterData : filteredData}
          sortAscIcon={this.upArrow}
          sortDescIcon={this.downArrow}
          collapsedIcon={this.rightArrow}
          expandedIcon={this.downArrow}
          onSort={this.onSort}
          page={totalPages? 0 :this.props.enablePagination ? this.state.page : this.props.page}
        >
          {children}
        </C2Table>
          }
        </Wrapper>
        {this.props.enablePagination && !this.props.hidePagination && (
          <div className='text-center'>
            <ReactPaginate
              previousLabel='<'
              nextLabel='>'
              breakLabel='...'
              breakClassName='break-me'
              initialPage={this.state.page}
              forcePage={this.state.page}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={2}
              onPageChange={this.onPageChange}
              containerClassName={`pagination ${pageCount <= 1 && !this.props.alwaysShowPagination ? 'hidden' : ''}`}
              subContainerClassName='pages pagination'
              activeClassName='active'
            />
          </div>
        )}
      </Fragment>
    )
  }
}

const props = (state, props) => {
  return {searchTerm: searchTerm(state, props) || ''}
}

export const Table = connect(props, null, null, {forwardRef: true})(table)

export const Column = C2Column

export const ColumnGroup = C2ColumnGroup

