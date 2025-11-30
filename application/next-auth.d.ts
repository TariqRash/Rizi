import { UserRole } from 'types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      compoundId: string;
      image: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    compoundId: string;
  }
}
