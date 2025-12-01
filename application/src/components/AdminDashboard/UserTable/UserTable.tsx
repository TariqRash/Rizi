import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Switch,
  IconButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { SubscriptionStatusEnum, UserWithSubscriptions } from '../../../types';
import { USER_ROLES } from '../../../lib/auth/roles';

interface UserTableProps {
  users: UserWithSubscriptions[];
  selectedUser: UserWithSubscriptions | null;
  isLoadingEdit: boolean;
  handleAdminSwitchChange: (user: UserWithSubscriptions, checked: boolean) => void;
  handleEditClick: (user: UserWithSubscriptions) => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case SubscriptionStatusEnum.ACTIVE:
      return 'success';
    case SubscriptionStatusEnum.PENDING:
      return 'info';
    case SubscriptionStatusEnum.CANCELED:
      return 'default';
    default:
      return 'default';
  }
};

/**
 * UserTable displays a table of users with their details, admin toggle, and edit actions.
 */
const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUser,
  isLoadingEdit,
  handleAdminSwitchChange,
  handleEditClick,
}) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Plan</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Joined</TableCell>
          <TableCell>Admin</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => {
          const plan = user.subscription ? user.subscription.plan : 'none';
          const status = user.subscription ? user.subscription.status : 'none';
          const isSuperAdmin = user.role === USER_ROLES.SUPER_ADMIN;
          const isAdmin = user.role === USER_ROLES.ADMIN;

          return (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{plan}</TableCell>
              <TableCell>
                <Chip
                  label={status}
                  color={statusColor(status!)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>{new Date(user.createdAt).toISOString().slice(0, 10)}</TableCell>
              <TableCell>
                {isLoadingEdit && user.id === selectedUser?.id ? (
                  <CircularProgress size={20} />
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Switch
                      checked={isAdmin || isSuperAdmin}
                      onChange={(_, checked) => handleAdminSwitchChange(user, checked)}
                      disabled={isSuperAdmin}
                      inputProps={{ 'aria-label': isSuperAdmin ? 'Super admin locked' : 'Admin access' }}
                    />
                    {isSuperAdmin && <Chip size="small" color="primary" label="Super admin" />}
                  </Stack>
                )}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditClick(user)}
                    title="Edit user"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

export default UserTable;
