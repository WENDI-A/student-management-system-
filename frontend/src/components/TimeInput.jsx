import React from 'react';
import { useInput, required } from 'react-admin';
import { TextField } from '@mui/material';

const TimeInput = (props) => {
  const {
    source,
    label,
    validate = required(),
    helperText,
    fullWidth = true,
    ...rest
  } = props;

  const {
    field,
    fieldState: { error, invalid, isTouched },
    formState: { isSubmitted }
  } = useInput({
    source,
    validate,
    ...rest
  });

  // Format time from database (HH:MM:SS) to input format (HH:MM)
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // Get only HH:MM part
  };

  // Parse time from input format (HH:MM) to database format (HH:MM:00)
  const parseTime = (time) => {
    if (!time) return null;
    return `${time}:00`;
  };

  return (
    <TextField
      {...field}
      type="time"
      label={label}
      error={(isTouched || isSubmitted) && invalid}
      helperText={
        (isTouched || isSubmitted) && invalid
          ? error?.message
          : helperText
      }
      fullWidth={fullWidth}
      InputLabelProps={{ shrink: true }}
      inputProps={{ step: 60 }} // 60 seconds (1 minute) step
      value={formatTime(field.value)}
      onChange={(e) => {
        field.onChange(parseTime(e.target.value));
      }}
    />
  );
};

export default TimeInput;