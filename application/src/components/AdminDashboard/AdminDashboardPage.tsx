'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, CardContent, CardHeader, CircularProgress, Card, Divider, Stack } from '@mui/material';
import PageContainer from '../Common/PageContainer/PageContainer';
import { UsersClient } from '../../lib/api/users';
import { SubscriptionPlanEnum, SubscriptionStatusEnum, UserWithSubscriptions } from '../../types';
import Toast from 'components/Common/Toast/Toast';
import { SUPER_ADMIN_EMAIL, USER_ROLES } from '../../lib/auth/roles';
import { useSession } from 'next-auth/react';
import UserTable from './UserTable/UserTable';
import EditUserDialog from './EditUserDialog/EditUserDialog';
import UserFilterControls from './UserFilterControls/UserFilterControls';
import Pagination from '../Common/Pagination/Pagination';
import RolePlaybooks from './RolePlaybooks/RolePlaybooks';

/**
 * Admin dashboard component for managing users, roles, and subscriptions.
 */
export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchName, setSearchName] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal state
  const [openEdit, setOpenEdit] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithSubscriptions | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserWithSubscriptions>>({});

  // Toast state
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const session = useSession();

  // Open modal and set form state
  const handleEditClick = (user: UserWithSubscriptions) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    });
    setOpenEdit(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditSubscriptionChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    setEditForm(
      (prev) =>
        ({
          ...prev,
          subscription: {
            ...(prev.subscription ?? {}),
            [e.target.name]: e.target.value as string,
          },
        }) as Partial<UserWithSubscriptions>
    );
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setSelectedUser(null);
    setEditForm({});
  };

  const handleEditButton = async () => {
    if (!selectedUser) return;
    await updateUser(selectedUser.id, {
      name: editForm.name,
      subscription: editForm.subscription,
    });
  };

  const updateUser = async (userId: string, fields: Partial<UserWithSubscriptions>) => {
    if (!userId) return;
    try {
      setIsLoadingEdit(true);
      const api = new UsersClient();
      await api.updateUser(userId, fields);
      // Refresh users
      const data = await api.getUsers();
      setUsers(data.users || []);
      if (session.data?.user?.id === userId) {
        session.update({ user: { name: fields.name } });
      }
      handleEditClose();
      setToast({ open: true, message: 'User updated successfully!', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Failed to update user', severity: 'error' });
    } finally {
      setIsLoadingEdit(false);
    }
  };

  // Add this function inside your AdminDashboard component
  const handleAdminSwitchChange = async (user: UserWithSubscriptions, checked: boolean) => {
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      setToast({ open: true, message: 'Super admin access is locked for security.', severity: 'info' });
      return;
    }
    setSelectedUser(user);
    await updateUser(user.id, { role: checked ? USER_ROLES.ADMIN : USER_ROLES.USER });
  };

  const summaryStats = useMemo(() => {
    const totalUsersCount = users.length;
    const adminCount = users.filter((u) => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN).length;
    const proPlans = users.filter((u) => u.subscription?.plan === SubscriptionPlanEnum.PRO).length;
    const activeSubs = users.filter((u) => u.subscription?.status === SubscriptionStatusEnum.ACTIVE).length;

    return {
      totalUsersCount,
      adminCount,
      proPlans,
      activeSubs,
    };
  }, [users]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = new UsersClient();
        const data = await api.getUsers({
          page,
          pageSize,
          searchName,
          filterPlan,
          filterStatus,
        });
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
      } catch {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, pageSize, searchName, filterPlan, filterStatus]);
  return (
    <PageContainer title="Admin Dashboard">
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Typography variant="h6" fontWeight="bold">
              Superadmin control | إدارة المشرف العام
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Signed-in super admin: {SUPER_ADMIN_EMAIL}
            </Typography>
          </Stack>
        }
        subheader="Monitor tenants, admins, subscriptions, and access from one dashboard."
      />
      <CardContent>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          gap={2}
          mb={2}
        >
          {[
            { label: 'Total users', value: summaryStats.totalUsersCount },
            { label: 'Admins & super admins', value: summaryStats.adminCount },
            { label: 'Active subscriptions', value: summaryStats.activeSubs },
            { label: 'Pro plan tenants', value: summaryStats.proPlans },
          ].map((stat) => (
            <Card key={stat.label} variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        <Divider sx={{ mb: 3 }} />
      </CardContent>
      <RolePlaybooks />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          User Management
        </Typography>
        <UserFilterControls
          searchName={searchName}
          setSearchName={setSearchName}
          filterPlan={filterPlan}
          setFilterPlan={setFilterPlan}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setPage={setPage}
        />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <UserTable
              users={users}
              selectedUser={selectedUser}
              isLoadingEdit={isLoadingEdit}
              handleAdminSwitchChange={handleAdminSwitchChange}
              handleEditClick={handleEditClick}
            />
            <Pagination
              totalItems={totalUsers}
              pageSize={pageSize}
              setPageSize={setPageSize}
              page={page}
              setPage={setPage}
            />
          </>
        )}
      </CardContent>
      <EditUserDialog
        open={openEdit}
        editForm={editForm}
        isLoadingEdit={isLoadingEdit}
        handleEditChange={handleEditChange}
        handleEditSubscriptionChange={handleEditSubscriptionChange}
        handleEditButton={handleEditButton}
        handleEditClose={handleEditClose}
      />
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </PageContainer>
  );
}
