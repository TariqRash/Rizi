import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Stack,
} from '@mui/material';
import { Edit, Visibility, Delete } from '@mui/icons-material';
import { Note } from 'lib/api/notes';
import { getTitleUpdateFlashAnimation } from '../../Common/animations/titleUpdateFlash';

interface NotesGridViewProps {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  onViewNote: (noteId: string) => void;
  onEditNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  recentlyUpdatedTitles?: Set<string>;
}

/**
 * Grid view component for displaying notes in a card-based layout.
 * Provides view, edit, and delete actions for each note.
 */
const NotesGridView: React.FC<NotesGridViewProps> = ({
  notes,
  isLoading,
  error,
  onViewNote,
  onEditNote,
  onDeleteNote,
  recentlyUpdatedTitles = new Set<string>(),
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="notes-grid-loading">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="notes-grid-error">
        <Typography color="error" data-testid="notes-grid-error-message">
          {error}
        </Typography>
      </Box>
    );
  }

  if (notes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="notes-grid-empty">
        <Typography>No notes found. Create your first note!</Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
      data-testid="notes-grid-container"
    >
      {notes.map((note) => (
        <Card
          key={note.id}
          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          data-testid={`note-card-${note.id}`}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Stack spacing={2}>
              <Typography 
                variant="h6" 
                component="h3" 
                data-testid={`note-title-${note.id}`}
                sx={getTitleUpdateFlashAnimation(recentlyUpdatedTitles.has(note.id), true)}
              >
                {note.title}
              </Typography>{' '}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={note.content}
                data-testid={`note-content-${note.id}`}
              >
                {note.content}
              </Typography>{' '}
              <Typography
                variant="caption"
                color="text.secondary"
                data-testid={`note-date-${note.id}`}
              >
                {new Date(note.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            {' '}
            <IconButton
              size="small"
              color="primary"
              onClick={() => onViewNote(note.id)}
              title="View note"
              data-testid={`note-view-button-${note.id}`}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEditNote(note.id)}
              title="Edit note"
              data-testid={`note-edit-button-${note.id}`}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteNote(note.id)}
              title="Delete note"
              data-testid={`note-delete-button-${note.id}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default NotesGridView;
