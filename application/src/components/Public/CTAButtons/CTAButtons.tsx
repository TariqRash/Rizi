import React from 'react';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
    </Stack>
  );
};

export default CTAButtons;