import { AppProviders } from './app/providers.tsx';
import { AppRoutes } from './routes/index.tsx';

function App() {
	return (
		<AppProviders>
			<AppRoutes />
		</AppProviders>
	);
}

export default App;
