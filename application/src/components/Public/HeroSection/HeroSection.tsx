import React from 'react';
import { Typography, Box, Container, Stack, Chip } from '@mui/material';
import TerminalMockup from 'components/Public/TerminalMockup/TerminalMockup';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';

/**
 * HeroSection component
 */
const HeroSection = () => {
  return (
    <Box component="section" bgcolor="background.default" py={DIMENSIONS.spacing.section} aria-labelledby="hero-title">
      <Container maxWidth="lg">
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'center', lg: 'flex-start' },
          gap: DIMENSIONS.spacing.container
        }}>
          {/* Code example */}
          <Box component="aside" aria-label="Code example" sx={{ order: { xs: 1, lg: 2 } }}>
            <TerminalMockup />
          </Box>
          
          {/* Main hero content */}
          <Box component="header" sx={{ 
            order: { xs: 2, lg: 1 },
            flex: 1,
            minWidth: 0,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: DIMENSIONS.spacing.container
          }}>
            <Stack spacing={2} alignItems="center" width="100%">
              <Typography
                variant="h1"
                component="h1"
                id="hero-title"
                fontWeight="bold"
                sx={{ textAlign: 'center', width: '100%' }}
              >
                Rizi | ريزي
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                fontWeight="bold"
                color="primary.main"
                sx={{ textAlign: 'center', width: '100%' }}
              >
                The command center for compounds, towers, and staff housing
              </Typography>
              <Typography
                variant="h6"
                component="p"
                color="text.secondary"
                sx={{
                  maxWidth: DIMENSIONS.layout.maxContentWidth,
                  mx: 'auto',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                Launch bilingual workflows for residents, owners, vendors, and facilities teams. Rizi unifies ticketing,
                billing, access, and analytics so Gulf operators can deliver concierge-grade living at scale.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" flexWrap="wrap">
                {[
                  'Arabic-first & English-ready',
                  'Ops dashboards for every compound',
                  'Connected billing, access, and SLAs',
                ].map((label) => (
                  <Chip key={label} label={label} color="primary" variant="outlined" />
                ))}
              </Stack>
            </Stack>

            <Box component="nav" aria-label="Primary actions">
              <CTAButtons />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
