import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { Stack, Typography } from "@mui/material";

const SimpleTable = ({
  tableId = "simpleTable",
  data,
  onClickRow = null,
  config,
  sx = {},
}) => {
  const renderCellValue = (value) => {
    if (value && value.length > 25) {
      return (
        <Tooltip title={value} arrow>
          <span>{value.substring(0, 25)}...</span>
        </Tooltip>
      );
    }
    return value;
  };
  return (
    <>
      <Table id={tableId} key={tableId} sx={{ width: '100%', tableLayout: 'fixed' }}>
        <TableHead sx={{ borderBottom: "2px solid black", ...sx }}>
          <TableRow>
            {config.map((column, i, arr) => (
              <TableCell
                key={column.field}
                align={column.align || "left"}
                sx={{
                  fontWeight: "700",
                  maxWidth: 160,
                  padding: "8px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              onClick={() => !row.is_enable && onClickRow && onClickRow(row)}
              style={{
                cursor: onClickRow ? "pointer" : "default",
              }}
            >
              {config.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || "left"}
                  sx={{
                    padding: "8px",
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.render
                    ? column.render(row[column.field], row)
                    : renderCellValue(row[column.field])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length < 1 && (
        <Stack
          justifyContent={"center"}
          alignItems={"center"}
          sx={{ width: "100%", height: "100%" }}
        >
          <Typography>No data available</Typography>
        </Stack>
      )}
    </>
  );
};

export default SimpleTable;
