import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { forgotPassword, resetPassword } from '../api/auth';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const resetSchema = z.object({
  token: z.string().min(32, 'Enter a valid reset token'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include one uppercase letter')
    .regex(/[a-z]/, 'Must include one lowercase letter')
    .regex(/[0-9]/, 'Must include one number'),
});

type ForgotValues = z.infer<typeof forgotSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const forgotForm = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const submitForgot = async (values: ForgotValues) => {
    try {
      await forgotPassword(values.email);
      setServerMessage('If an account with that email exists, a reset link has been sent.');
    } catch {
      setServerMessage('Could not initiate reset at the moment. Try again.');
    }
  };

  const submitReset = async (values: ResetValues) => {
    try {
      const response = await resetPassword(values);
      setServerMessage(response.message);
      resetForm.reset();
    } catch {
      setServerMessage('Reset failed. Token may be invalid or expired.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(44,130,201,0.16),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(248,133,34,0.16),transparent_35%)]" />
      <Card className="relative w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Forgot Password</h1>
            <p className="text-sm text-muted-foreground">Request a reset token and set a new password.</p>
          </div>
          <Link to="/login" className="text-sm font-semibold text-primary">
            Back to login
          </Link>
        </div>

        {serverMessage && <p className="rounded-lg bg-muted p-3 text-sm">{serverMessage}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={forgotForm.handleSubmit(submitForgot)} className="space-y-3 rounded-xl border p-4">
            <p className="font-semibold">1) Request reset token</p>
            <Input type="email" placeholder="you@company.com" {...forgotForm.register('email')} />
            {forgotForm.formState.errors.email && (
              <p className="text-xs text-destructive">{forgotForm.formState.errors.email.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={forgotForm.formState.isSubmitting}>
              Send Reset Link
            </Button>
          </form>

          <form onSubmit={resetForm.handleSubmit(submitReset)} className="space-y-3 rounded-xl border p-4">
            <p className="font-semibold">2) Reset password</p>
            <Input placeholder="Reset token" {...resetForm.register('token')} />
            {resetForm.formState.errors.token && (
              <p className="text-xs text-destructive">{resetForm.formState.errors.token.message}</p>
            )}
            <Input type="password" placeholder="New password" {...resetForm.register('newPassword')} />
            {resetForm.formState.errors.newPassword && (
              <p className="text-xs text-destructive">{resetForm.formState.errors.newPassword.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
              Reset Password
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
