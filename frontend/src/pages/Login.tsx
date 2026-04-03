import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      setFormError(null);
      await login(values.email, values.password);
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch {
      setFormError('Invalid credentials. Please check email and password.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(44,130,201,0.16),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(248,133,34,0.16),transparent_35%)]" />
      <Card className="relative w-full max-w-md space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold">FinanceOps Login</h1>
          <p className="text-sm text-muted-foreground">Access your secure finance workspace.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input type="email" placeholder="you@company.com" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-xs font-semibold text-primary">
                Forgot password?
              </Link>
            </div>
          </div>

          {formError && <p className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">{formError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
