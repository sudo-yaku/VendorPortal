import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import ContactSupportOutlinedIcon from '@material-ui/icons/ContactSupportOutlined';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
    fontWeight: "bold",
    fontSize: "16px",
    // borderRadius: "0rem !important",
    textTransform: "capitalize",
    backgroundColor: "black !important"
  },
}));

export default function VPButton(props) {
  const classes = useStyles();
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        size="small"
        className={classes.button}
        startIcon={<ContactSupportOutlinedIcon style={{ fontSize: 30 }}/>}
        onClick={() => props.messageFAST()}
      >
        {props.buttonName}
      </Button>
    </div>
  );
}
