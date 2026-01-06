import React, { Component } from 'react';
import styled from 'styled-components';
import moment from 'moment-timezone';

const PopupWrapper = styled.div`
  position: fixed;
  top: ${(props) => props.height+100}px;
  left: ${(props) => props.width}px;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px; /* Add spacing between buttons */
`;

const StyledButton = styled.button`
  padding: 5px 10px; /* Make the buttons smaller */
  font-size: 14px; /* Adjust font size */
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

class C2FilterPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCol: this.props.filterMetaData.selectedCol,
      filterType: 'contain',
      inputValue: ''
    };
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.filterMetaData.selectedCol !== this.props.filterMetaData.selectedCol) {
      this.setState({ selectedCol: this.props.filterMetaData.selectedCol });
    }
  }

  getColumns = () => {
    const columns = this.props.tableRef?.current?.getColumns()
      .filter((column) => column.props.headerClassName !== 'hidden')
      .map((column) => {
        return {key: column.props.id, header: typeof column.props.header == 'string' ? column.props.header : column.props.id}});
    return columns;
  };

  applyFilter() {
    const { selectedCol, filterType, inputValue } = this.state;
    let data = this.props.tableRef?.current?.getData();
    data = data.filter((item) => {
      if (item[selectedCol]) { // Check if the property exists
        if (selectedCol.toLowerCase().includes('date')) {
          // Use moment to match the input value for date columns
          return moment(item[selectedCol]).isSame(moment(inputValue), 'day');
        } else {
          return item[selectedCol].toLowerCase().toString().includes(inputValue.toLowerCase());
        }
      }
      return false; // Or handle the case where the property is missing
    });
    this.props.setLocalFilterData(data);
    this.props.onClose();
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  render() {
    const { selectedCol, filterType, inputValue } = this.state;
    const { onClose, filterMetaData } = this.props;

    return (
      <PopupWrapper height={filterMetaData.filterHeight} width={filterMetaData.filterWidth}>
        <PopupContent>
          <FormGroup>
            <input
              style={{width: '100%'}}
              type="text"
              id="inputValue"
              value={inputValue}
              onChange={(e) => this.handleChange(e)}
            />
          </FormGroup>
          <ButtonGroup>
            <StyledButton type="button" onClick={() => this.applyFilter()}>Submit</StyledButton>
            <StyledButton type="button" onClick={onClose}>Close</StyledButton>
          </ButtonGroup>
        </PopupContent>
      </PopupWrapper>
    );
  }
}

export default C2FilterPopup;
