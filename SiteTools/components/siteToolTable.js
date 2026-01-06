import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';

const SiteToolTable = ({ columns = [], data = [] }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getColumnLabel = col => typeof col === 'string' ? col : col.label;
    const getColumnKey = col => typeof col === 'string' ? col : col.key;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Paginated data
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper elevation={0} style={{ border: 'none' }}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((col, idx) => (
                                <TableCell key={idx} style={{ fontWeight: 'bold',borderLeft: 'none',
                                    borderRight: 'none', fontSize:'14px', borderTop: '2px solid black',
                        borderBottom: '2px solid black' }}>
                                    {getColumnLabel(col)}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center"  style={{ 
                                    borderLeft: 'none',
                                    borderRight: 'none'
                                }}>
                                    No data available
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    {columns.map((col, colIdx) => (
                                        <TableCell key={colIdx} style={{ 
                                            borderLeft: 'none',
                                            borderRight: 'none'
                                        }}>
                                            {row[getColumnKey(col)]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={data.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
        </Paper>
    );
};

export default SiteToolTable;
