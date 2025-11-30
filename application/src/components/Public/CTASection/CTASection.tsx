import React from 'react';
import { Typography, Box, Container, Stack } from '@mui/material';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';

/**
 * CTASection component
 */
const CTASection = () => {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="grey.50" aria-labelledby="cta-title">
      <Container maxWidth="md">
        <Stack spacing={DIMENSIONS.spacing.container} textAlign="center">
          <Box component="header">
            <Typography variant="h4" component="h3" id="cta-title" fontWeight="bold">
              Bring every compound into Rizi | جرّب ريزي لكل مجمع
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Show residents, operators, and vendors what Arabic-first property operations feels like. Centralize requests, access, billing, and reporting while keeping your teams in sync.
            </Typography>
          </Box>
          <Box component="nav" aria-label="Get started actions">
            <CTAButtons />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CTASection;