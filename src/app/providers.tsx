import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

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
			{children}
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
