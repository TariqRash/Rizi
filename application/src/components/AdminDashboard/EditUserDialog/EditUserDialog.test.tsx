import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditUserDialog from './EditUserDialog';
import {
  SubscriptionPlanEnum,
  SubscriptionStatusEnum,
  UserWithSubscription,
} from '../../../types';

describe('EditUserDialog', () => {
  const editForm: Partial<UserWithSubscription> = {
    name: 'Alice',
    email: 'alice@example.com',
    subscription: {
      plan: SubscriptionPlanEnum.FREE,
      status: SubscriptionStatusEnum.ACTIVE,
      id: 'sub1',
      compoundId: 'compound1',
      userId: '1',
      customerId: null,
      createdAt: new Date(),
    },
  };
  const handleEditChange = jest.fn();
  const handleEditSubscriptionChange = jest.fn();
  const handleEditButton = jest.fn();
  const handleEditClose = jest.fn();

  it('renders dialog with user info', () => {
    render(
      <EditUserDialog
        open={true}
        editForm={editForm}
        isLoadingEdit={false}
        handleEditChange={handleEditChange}
        handleEditSubscriptionChange={handleEditSubscriptionChange}
        handleEditButton={handleEditButton}
        handleEditClose={handleEditClose}
      />
    );
    expect(screen.getByText(/Edit User/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it('calls handleEditChange when name is changed', () => {
    render(
      <EditUserDialog
        open={true}
        editForm={editForm}
        isLoadingEdit={false}
        handleEditChange={handleEditChange}
        handleEditSubscriptionChange={handleEditSubscriptionChange}
        handleEditButton={handleEditButton}
        handleEditClose={handleEditClose}
      />
    );
    const nameInput = screen.getByDisplayValue('Alice');
    fireEvent.change(nameInput, { target: { value: 'Bob' } });
    expect(handleEditChange).toHaveBeenCalled();
  });

  it('calls handleEditSubscriptionChange when plan is changed', () => {
    render(
      <EditUserDialog
        open={true}
        editForm={editForm}
        isLoadingEdit={false}
        handleEditChange={handleEditChange}
        handleEditSubscriptionChange={handleEditSubscriptionChange}
        handleEditButton={handleEditButton}
        handleEditClose={handleEditClose}
      />
    );
    const planSelect = screen.getByTestId('plan-select');
    fireEvent.change(planSelect, { target: { value: SubscriptionPlanEnum.PRO } });
    expect(handleEditSubscriptionChange).toHaveBeenCalled();
  });

  it('calls handleEditButton when Save Changes is clicked', () => {
    render(
      <EditUserDialog
        open={true}
        editForm={editForm}
        isLoadingEdit={false}
        handleEditChange={handleEditChange}
        handleEditSubscriptionChange={handleEditSubscriptionChange}
        handleEditButton={handleEditButton}
        handleEditClose={handleEditClose}
      />
    );
    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);
    expect(handleEditButton).toHaveBeenCalled();
  });

  it('calls handleEditClose when close icon is clicked', () => {
    render(
      <EditUserDialog
        open={true}
        editForm={editForm}
        isLoadingEdit={false}
        handleEditChange={handleEditChange}
        handleEditSubscriptionChange={handleEditSubscriptionChange}
        handleEditButton={handleEditButton}
        handleEditClose={handleEditClose}
      />
    );
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);
    expect(handleEditClose).toHaveBeenCalled();
  });

  it('shows loading spinner when isLoadingEdit is true', () => {
    render(
      <EditUserDialog
        open={true}
        editForm={editForm}
        isLoadingEdit={true}
        handleEditChange={handleEditChange}
        handleEditSubscriptionChange={handleEditSubscriptionChange}
        handleEditButton={handleEditButton}
        handleEditClose={handleEditClose}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
