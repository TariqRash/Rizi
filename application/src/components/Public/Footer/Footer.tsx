import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Stack, useTheme } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SupportIcon from '@mui/icons-material/Support';
import ForumIcon from '@mui/icons-material/Forum';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { URLS, DIMENSIONS } from 'constants/landing';

const footerSections = [
  {
    title: 'Rizi platform',
    links: [
      { label: 'Visit rizi.sa', href: URLS.marketingSite, icon: <LaunchIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Documentation', href: URLS.documentation, icon: <MenuBookIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Book a demo', href: URLS.demo, icon: <CalendarTodayIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Arabic product deck', href: URLS.arabicDeck, icon: <PictureAsPdfIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
    ],
  },
  {
    title: 'Operations workflows',
    links: [
      { label: 'Multi-compound control', href: `${URLS.marketingSite}/platform`, icon: <HomeWorkIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Resident & vendor app', href: `${URLS.marketingSite}/workflows`, icon: <HomeRepairServiceIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Tickets, SLAs & billing', href: `${URLS.marketingSite}/operations`, icon: <AssignmentTurnedInIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
    ],
  },
  {
    title: 'Support & language',
    links: [
      { label: 'Contact Rizi', href: URLS.contact, icon: <SupportIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Product updates', href: `${URLS.marketingSite}/blog`, icon: <ForumIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Status & reliability', href: `${URLS.marketingSite}/status`, icon: <MonitorHeartIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
    ],
  },
];

/**
 * Footer of the application.
 * Displays sections with links organized by categories and copyright.
 */
export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        py: DIMENSIONS.spacing.card,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: DIMENSIONS.spacing.container,
            mb: DIMENSIONS.spacing.container,
          }}
        >
          {footerSections.map((section) => (
            <Box key={section.title}>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary', mb: DIMENSIONS.spacing.small }}>
                {section.title}
              </Typography>
              <Stack spacing={DIMENSIONS.spacing.tiny}>
                {section.links.map((link) => (
                  <Box key={link.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: 'text.secondary' }}>
                      {link.icon}
                    </Box>
                    <Typography
                      component={Link}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : '_self'}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      sx={{
                        color: 'text.secondary',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {link.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Box sx={{ pt: DIMENSIONS.spacing.container, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 Rizi. Built for multi-compound living across the Gulf.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
