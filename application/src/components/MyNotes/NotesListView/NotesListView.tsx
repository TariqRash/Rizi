import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material';
import { Edit, Visibility, Delete } from '@mui/icons-material';
import { Note } from 'lib/api/notes';
import { getTitleUpdateFlashAnimation } from '../../Common/animations/titleUpdateFlash';

interface NotesListViewProps {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  onViewNote: (noteId: string) => void;
  onEditNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  recentlyUpdatedTitles?: Set<string>;
}

/**
 * List view component for displaying notes in a table format.
 * Provides view, edit, and delete actions for each note in a tabular layout.
 */
const NotesListView: React.FC<NotesListViewProps> = ({
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
      <Box display="flex" justifyContent="center" p={4} data-testid="notes-list-loading">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="notes-list-error">
        <Typography color="error" data-testid="notes-list-error-message">
          {error}
        </Typography>
      </Box>
    );
  }
  if (notes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="notes-list-empty">
        <Typography>No notes found. Create your first note!</Typography>
      </Box>
    );
  }
  return (
    <TableContainer component={Paper} data-testid="notes-list-container">
      <Table data-testid="notes-table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note.id} hover data-testid={`note-row-${note.id}`}>
              <TableCell 
                data-testid={`note-title-cell-${note.id}`}
                sx={getTitleUpdateFlashAnimation(recentlyUpdatedTitles.has(note.id))}
              >
                <Typography variant="body1" data-testid={`note-title-${note.id}`}>
                  {note.title}
                </Typography>
              </TableCell>
              <TableCell data-testid={`note-content-cell-${note.id}`}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: '300px', // Set a maximum width for the content
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block', // Ensures the typography behaves as a block element
                  }}
                  title={note.content} // Show full content on hover
                  data-testid={`note-content-${note.id}`}
                >
                  {note.content}
                </Typography>
              </TableCell>
              <TableCell data-testid={`note-date-cell-${note.id}`}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  data-testid={`note-date-${note.id}`}
                >
                  {new Date(note.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell data-testid={`note-actions-cell-${note.id}`}>
                <Stack direction="row" spacing={1}>
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
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NotesListView;
