import { render, screen, waitFor } from '@testing-library/react';
import MagicLinkVerifier from './MagicLinkVerifier';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));
jest.mock('next/navigation');

const mockReplace = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
});

describe('MagicLinkVerifier', () => {
  it('shows error if token or email is missing', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => null });
    render(<MagicLinkVerifier />);
    expect(await screen.findByText(/Missing token or email/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'token' ? 'abc' : 'test@example.com'),
    });
    render(<MagicLinkVerifier />);
    expect(screen.getByText(/Verifying magic link/i)).toBeInTheDocument();
  });

  it('calls signIn and redirects on success', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'token' ? 'abc' : 'test@example.com'),
    });
    (signIn as jest.Mock).mockResolvedValue({});
    render(<MagicLinkVerifier />);

    // Wait for the async effect to complete and UI to update.
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        magicLinkToken: 'abc',
        redirect: false,
      });
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
    expect(await screen.findByText(/Login successful/i)).toBeInTheDocument();
  });

  it('shows error if signIn fails', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'token' ? 'abc' : 'test@example.com'),
    });
    (signIn as jest.Mock).mockRejectedValue(new Error('Invalid token'));
    render(<MagicLinkVerifier />);

    // Wait for the async effect to complete and error state to render.
    await waitFor(() => {
      expect(screen.getByText(/Failed to verify magic link/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid token/i)).toBeInTheDocument();
    });
  });
});
