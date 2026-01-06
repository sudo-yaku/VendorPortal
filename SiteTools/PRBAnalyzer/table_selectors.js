import React from 'react'
export const searchTerm = (state, props) => state.getIn(['Tables', props.tableName || props.id, 'searchTerm'], '')
