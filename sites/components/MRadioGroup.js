import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { StyledEngineProvider, ThemeProvider, createTheme } from "@mui/material/styles";

export default function MaterialRadioButtonsGroup({ radioButtonList, optionValue, handleButtonChange }) {
    const [value, setValue] = React.useState(optionValue);

    const handleChange = (event) => {
        setValue((event.target.value));
        handleButtonChange(event.target.value)
    };
    return (
        <div>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={createTheme({
                })}>
                    <FormControl>
                        {/* <FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel> */}
                        <RadioGroup
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            value={value}
                            onChange={handleChange}
                            style={{ flexDirection: "initial" }}
                        >
                            {radioButtonList && radioButtonList.length > 0 && radioButtonList.map((radio) => {
                                return (
                                    <FormControlLabel value={radio.radioValue} control={<Radio
                                        sx={{
                                            '&, &.Mui-checked': {
                                                color: 'black',
                                            },
                                        }} />} label={radio.radioLabel} />
                                )
                            })}
                        </RadioGroup>
                    </FormControl>
                </ThemeProvider >
            </StyledEngineProvider >
        </div >
    );
}
