import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

export function RoleGuard({ roles, children }: { roles: Role[]; children: ReactElement }) {
  const { hasRole } = useAuth();

  if (!hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
