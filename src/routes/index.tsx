import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.tsx';
import CategoriesPage from '../pages/Categories/index.tsx';
import DashboardPage from '../pages/Dashboard/index.tsx';
import ImagesPage from '../pages/Images/index.tsx';
import PreviewPage from '../pages/Preview/index.tsx';
import ProductsPage from '../pages/Products/index.tsx';
import SettingsPage from '../pages/Settings/index.tsx';

export function AppRoutes() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<AppLayout
			sidebarOpen={sidebarOpen}
			onToggleSidebar={() => setSidebarOpen((o) => !o)}
			onCloseSidebar={() => setSidebarOpen(false)}
		>
			<Routes>
				<Route path="/" element={<DashboardPage />} />
				<Route path="/carta" element={<ProductsPage />} />
				<Route path="/categorias" element={<CategoriesPage />} />
				<Route path="/imagenes" element={<ImagesPage />} />
				<Route path="/vista-previa" element={<PreviewPage />} />
				<Route path="/configuracion" element={<SettingsPage />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</AppLayout>
	);
}
