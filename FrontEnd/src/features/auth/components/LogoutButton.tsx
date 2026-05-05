import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Button } from '@/shared/components/ui/Button';

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const { token } = useAuth();
  const { logout } = useLogout();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onLogout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await logout(token);
    setIsSubmitting(false);
  };

  return (
    <Button className={className} variant="outline" onClick={() => void onLogout()} disabled={isSubmitting}>
      {isSubmitting ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
