'use client';

import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';

export function WalletAuthButton() {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  const handleLogin = async () => {
    try {
      await login({
        loginMethods: ['wallet'],
        walletChainType: 'ethereum-only',
      });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logged out');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!ready) return <p>Loading Privy...</p>;

  if (authenticated) {
    return (
      <div className="flex items-center gap-4">
        <p>
          👋 {user?.wallet?.address?.slice(0, 6)}...
          {user?.wallet?.address?.slice(-4)}
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Login with Wallet
    </button>
  );
}
