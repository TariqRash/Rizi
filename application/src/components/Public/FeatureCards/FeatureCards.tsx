import React from 'react';
import { Typography, Box, Container, Stack, Card, CardContent } from '@mui/material';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TranslateIcon from '@mui/icons-material/Translate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SensorDoorIcon from '@mui/icons-material/SensorDoor';
import InsightsIcon from '@mui/icons-material/Insights';
import HubIcon from '@mui/icons-material/Hub';
import { FEATURES, DIMENSIONS } from 'constants/landing';

const featureIcons = {
  'Multi-compound command center': <DomainAddIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[0].color }} />,
  'Resident & services workflows': <HandshakeIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[1].color }} />,
  'Arabic-first experience': <TranslateIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[2].color }} />,
  'Smart ticketing & SLAs': <AssignmentTurnedInIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[3].color }} />,
  'Billing & collections': <ReceiptLongIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[4].color }} />,
  'Vendor scheduling & dispatch': <EventAvailableIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[5].color }} />,
  'Access & amenities control': <SensorDoorIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[6].color }} />,
  'Analytics & compliance': <InsightsIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[7].color }} />,
  'Open API & webhooks': <HubIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[8].color }} />,
};

/**
 * FeatureCards component
 */
const FeatureCards = () => {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="background.default" aria-labelledby="features-title">
      <Container maxWidth="lg">
        <Stack spacing={DIMENSIONS.spacing.card}>
          <Box component="header">
            <Typography variant="h4" component="h3" id="features-title" fontWeight="bold" textAlign="center">
              Rizi benefits | مزايا ريزي
            </Typography>
          </Box>
          <Box
            role="grid"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: DIMENSIONS.spacing.stack,
            }}
          >
            {FEATURES.map((feature, idx) => (
              <Card component="article" key={idx} role="gridcell" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={DIMENSIONS.spacing.stack} alignItems="center" textAlign="center">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: DIMENSIONS.iconContainer.width,
                      height: DIMENSIONS.iconContainer.height,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      {featureIcons[feature.title as keyof typeof featureIcons]}
                    </Box>
                    <Box component="header">
                      <Typography variant="h6" component="h4" fontWeight="bold">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default FeatureCards;