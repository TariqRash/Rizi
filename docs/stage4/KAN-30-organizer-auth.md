# KAN-30: Organizer Auth

Supabase Auth integration for organizer registration and login.

## What was done
- Supabase Auth email/password sign-up enabled
- Profile row auto-created on first login via trigger
- Session persists across page reload
- Redirect to dashboard after login confirmed on staging

## Staging validation
- https://staging.rizi.app/auth/signup — organizer can register
- https://staging.rizi.app/auth/login — organizer can log in
- Dashboard protected: unauthenticated users redirected to login
