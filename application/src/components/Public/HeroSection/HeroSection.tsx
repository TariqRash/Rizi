"use client";

import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import TerminalMockup from 'components/Public/TerminalMockup/TerminalMockup';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';
import { useI18n } from 'context/I18nContext';

/**
 * HeroSection component
 */
const HeroSection = () => {
  const { t } = useI18n();

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
            <Typography 
              variant="h1"
              component="h1"
              id="hero-title"
              fontWeight="bold"
              sx={{
                textAlign: 'center',
                width: '100%'
              }}
            >
              Rizi | ريزي
            </Typography>
            <Typography 
              variant="h3"
              component="h2"
              fontWeight="bold"
              color="primary.main"
              sx={{
                textAlign: 'center',
                width: '100%'
              }}
            >
              Multi-compound operations built for the Gulf
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
              Manage estates, resident services, vendors, and collections from one Arabic-first platform tailored to compound living.
              Keep owners, operators, and tenants connected with bilingual workflows and data you can act on.
            </Typography>
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
