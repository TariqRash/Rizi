'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FormatTextdirectionRToLIcon from '@mui/icons-material/FormatTextdirectionRToL';
import FormatTextdirectionLToRIcon from '@mui/icons-material/FormatTextdirectionLToR';
import { useDirection } from 'context/Direction';

const DirectionToggle = () => {
  const { direction, toggleDirection } = useDirection();

  return (
    <Tooltip title={direction === 'rtl' ? 'Switch to LTR' : 'التبديل للعربية / RTL'}>
      <IconButton color="primary" onClick={toggleDirection} aria-label="toggle text direction">
        {direction === 'rtl' ? <FormatTextdirectionLToRIcon /> : <FormatTextdirectionRToLIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default DirectionToggle;
