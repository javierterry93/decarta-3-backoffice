import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { migrateLegacyImagesIfNeeded } from '../services/imageStorage/imageResolver.ts';

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
	useEffect(() => {
		void migrateLegacyImagesIfNeeded();
	}, []);

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
