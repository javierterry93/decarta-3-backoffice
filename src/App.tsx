import { Link, Route, Routes } from 'react-router-dom';
import { SiteHeader } from './components/navigation/SiteHeader.tsx';
import Home from './pages/Home.tsx';
import TestPage from './pages/TestPage.tsx';

function App() {
	return (
		<div className="min-h-screen bg-surface text-foreground">
			<SiteHeader />

			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/pruebas" element={<TestPage />} />
				</Routes>
			</main>

			<footer className="border-t border-separator py-6 text-center text-xs text-foreground-subtle">
				<div className="container">
					<Link
						to="/pruebas"
						className="text-link underline-offset-2 hover:underline"
					>
						Ir a pruebas
					</Link>
					{' · '}
					<span>Vite + React Router</span>
				</div>
			</footer>
		</div>
	);
}

export default App;
