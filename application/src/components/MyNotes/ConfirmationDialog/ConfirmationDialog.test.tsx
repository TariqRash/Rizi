import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationDialog from './ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const user = userEvent.setup();

  const mockProps = {
    open: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('renders correctly when open', () => {
    render(<ConfirmationDialog {...mockProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmationDialog {...mockProps} open={false} />);

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    render(<ConfirmationDialog {...mockProps} />);

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(mockProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<ConfirmationDialog {...mockProps} />);

    await user.click(screen.getByRole('button', { name: 'No' }));
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('uses provided confirmButtonColor', () => {
    render(<ConfirmationDialog {...mockProps} confirmButtonColor="error" />);

    // This is a basic check - in a real test you might want to check the actual styling
    const confirmButton = screen.getByRole('button', { name: 'Yes' });
    expect(confirmButton).toHaveClass('MuiButton-containedError');
  });

  it('calls onCancel when dialog is closed via backdrop click', async () => {
    render(<ConfirmationDialog {...mockProps} />);

    // This simulates clicking the backdrop to close the dialog
    const backdrop = document.querySelector('.MuiBackdrop-root');
    expect(backdrop).not.toBeNull();
  await user.click(backdrop as Element);

    expect(mockProps.onCancel).toHaveBeenCalled();
  });
});
