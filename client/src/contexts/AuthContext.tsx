// This file is deprecated. 
// We're now using the AuthContext from '@/hooks/use-auth.tsx'
// This file is kept temporarily to ensure compatibility with any components
// that might still be importing from here.

import { AuthContext, AuthProvider, useAuth } from '@/hooks/use-auth';

export { AuthContext, AuthProvider, useAuth };