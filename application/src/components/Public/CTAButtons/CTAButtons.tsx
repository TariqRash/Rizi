import React from 'react';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { COLORS, URLS, DIMENSIONS } from 'constants/landing';

/**
 * CTAButtons component
 */
const CTAButtons = () => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={DIMENSIONS.spacing.small} justifyContent="center">
      <Button
        component={Link}
        href={URLS.demo}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        size="large"
        startIcon={<CalendarTodayIcon />}
        sx={{
          backgroundColor: COLORS.primary,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: COLORS.primaryHover,
          },
        }}
      >
        Book a Rizi demo
      </Button>
      <Button
        component={Link}
        href={URLS.arabicDeck}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        size="large"
        startIcon={<PictureAsPdfIcon />}
        sx={{
          backgroundColor: COLORS.secondary,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: COLORS.secondaryHover,
          },
        }}
      >
        View Arabic product deck
      </Button>
      <Button
        component={Link}
        href="/login"
        variant="outlined"
        size="large"
        startIcon={<LockOpenIcon />}
        sx={{
          borderColor: COLORS.primary,
          color: COLORS.primary,
          '&:hover': {
            borderColor: COLORS.primaryHover,
            backgroundColor: 'rgba(15, 43, 91, 0.08)',
          },
        }}
      >
        Log in to Rizi
      </Button>
    </Stack>
  );
};

export default CTAButtons;
