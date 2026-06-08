import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SupabaseAuthGate } from '../auth/SupabaseAuthGate.tsx';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			retry: false,
		},
	},
});

type AppProvidersProps = {
	children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<SupabaseAuthGate>{children}</SupabaseAuthGate>
			<Toaster
				position="bottom-center"
				toastOptions={{
					classNames: {
						toast: 'bg-surface-elevated text-foreground border border-separator',
					},
				}}
			/>
		</QueryClientProvider>
	);
}
