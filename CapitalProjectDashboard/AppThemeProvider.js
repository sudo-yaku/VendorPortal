import * as React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create a custom theme
const customTheme = createTheme({
  typography: {
    fontFamily: `Verizon NHG eDS !important`,
    button: {
      textTransform: "none", // Ensure buttons don't transform text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#333",
          color: "#fff",
          marginTop: "8px",
          width: "138px",
          textTransform: "none",
          fontWeight: 700,
          "&:hover": {
            backgroundColor: "#555", // Optional hover effect
          },
        },
        outlined: {
          backgroundColor: "#fff",
          color: "#333",
          marginTop: "8px",
          width: "138px",
          textTransform: "none",
          fontWeight: 700,
          borderColor: "#333",
          "&:hover": {
            backgroundColor: "#f5f5f5", // Optional hover effect
          },
        },
      },
    },
  },
});

const AppThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;