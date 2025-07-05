import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';

export interface User {
  id: string;
  email?: string;
  wallet?: {
    address: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  loginWithWallet: (options?: {
    walletChainType?: 'ethereum-only' | 'solana-only' | 'ethereum-and-solana';
    disableSignup?: boolean;
  }) => void;
  logout: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const { user, authenticated, ready } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  const transformedUser: User | null = user ? {
    id: user.id,
    email: user.email?.address,
    wallet: user.wallet ? {
      address: user.wallet.address
    } : undefined
  } : null;

  const loginWithWallet = (options?: {
    walletChainType?: 'ethereum-only' | 'solana-only' | 'ethereum-and-solana';
    disableSignup?: boolean;
  }) => {
    login({
      loginMethods: ['wallet'],
      walletChainType: options?.walletChainType || 'ethereum-and-solana',
      disableSignup: options?.disableSignup || false
    });
  };

  return {
    user: transformedUser,
    isAuthenticated: authenticated,
    isLoading: !ready,
    login,
    loginWithWallet,
    logout
  };
};
