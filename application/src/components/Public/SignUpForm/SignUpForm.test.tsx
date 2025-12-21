import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';
import React from 'react';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('hooks/navigation', () => ({
  usePrefetchRouter: () => ({ navigate: jest.fn() }),
  useNavigating: () => ({ setNavigating: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('../../../lib/api/stripe', () => ({
  StripeClient: jest.fn().mockImplementation(() => ({
    createSubscription: jest.fn(),
  })),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all inputs', () => {
    render(<SignUpForm />);
    expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-confirm-password-input')).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<SignUpForm />);
    await userEvent.type(screen.getByTestId('signup-email-input'), 'test@example.com');
    await userEvent.type(screen.getByTestId('signup-password-input'), '123456');
    await userEvent.type(screen.getByTestId('signup-confirm-password-input'), '654321');

    fireEvent.submit(screen.getByTestId('signup-form'));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits and calls the signup API with correct data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as jest.Mock;

    render(<SignUpForm />);
    await userEvent.type(screen.getByTestId('signup-email-input'), 'user@example.com');
    await userEvent.type(screen.getByTestId('signup-password-input'), 'securepass');
    await userEvent.type(screen.getByTestId('signup-confirm-password-input'), 'securepass');

    fireEvent.submit(screen.getByTestId('signup-form'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@example.com', password: 'securepass', name: 'user' }),
        })
      );
    });
  });

  it('shows error message if signup fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'User already exists' }),
    }) as unknown as jest.Mock;

    render(<SignUpForm />);
    await userEvent.type(screen.getByTestId('signup-email-input'), 'exists@example.com');
    await userEvent.type(screen.getByTestId('signup-password-input'), 'abc12345');
    await userEvent.type(screen.getByTestId('signup-confirm-password-input'), 'abc12345');

    fireEvent.submit(screen.getByTestId('signup-form'));

    expect(await screen.findByText(/user already exists/i)).toBeInTheDocument();
  });

  it('shows dynamic success message from API response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, message: 'Verification email sent.' }),
    }) as unknown as jest.Mock;

    render(<SignUpForm />);
    await userEvent.type(screen.getByTestId('signup-email-input'), 'user@example.com');
    await userEvent.type(screen.getByTestId('signup-password-input'), 'securepass');
    await userEvent.type(screen.getByTestId('signup-confirm-password-input'), 'securepass');

    fireEvent.submit(screen.getByTestId('signup-form'));

    expect(await screen.findByText('Verification email sent.')).toBeInTheDocument();
  });

  it('shows fallback success message when API response has no message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as unknown as jest.Mock;

    render(<SignUpForm />);
    await userEvent.type(screen.getByTestId('signup-email-input'), 'user@example.com');
    await userEvent.type(screen.getByTestId('signup-password-input'), 'securepass');
    await userEvent.type(screen.getByTestId('signup-confirm-password-input'), 'securepass');

    fireEvent.submit(screen.getByTestId('signup-form'));

    expect(await screen.findByText('Account created.')).toBeInTheDocument();
  });
});
