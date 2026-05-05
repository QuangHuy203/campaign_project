import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { setToken } from '@/features/auth/store/auth.slice';
import { loginService, registerService } from '@/features/auth/services/auth.service';
import { Button } from '@/shared/components/ui/Button';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { Input } from '@/shared/components/ui/Input';
import { Spinner } from '@/shared/components/ui/Spinner';
import { getRequestErrorMessage } from '@/shared/lib/requestFeedback';

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setSuccessMessage(undefined);
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const result = await loginService({ email, password });
        dispatch(setToken(result.token));
        navigate('/campaigns');
      } else {
        await registerService({ email, name, password });
        setMode('login');
        setName('');
        setPassword('');
        setShowPassword(false);
        setSuccessMessage('Registration successful. Please sign in.');
      }
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Request failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mx-auto w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      {mode === 'register' ? (
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
      ) : null}
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-20"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-600 hover:text-slate-900"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <ErrorMessage message={error} />
      {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Spinner /> : mode === 'login' ? 'Sign in' : 'Register'}
      </Button>
      {mode === 'login' ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setError(undefined);
            setSuccessMessage(undefined);
            setMode('register');
          }}
          disabled={isLoading}
        >
          Register
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setError(undefined);
            setSuccessMessage(undefined);
            setMode('login');
          }}
          disabled={isLoading}
        >
          Back to login
        </Button>
      )}
    </form>
  );
}
