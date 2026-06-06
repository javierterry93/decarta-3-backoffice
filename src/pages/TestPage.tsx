import { Container } from '../components/Container.tsx';

const tags = ['Navegación', 'Layout', 'Estilos'] as const;

export default function TestPage() {
	return (
		<Container backgroundClassName="bg-surface" sectionClassName="py-12">
			<article className="overflow-hidden rounded-3xl border border-separator bg-surface-elevated shadow-lg shadow-shadow/5">
				<header className="border-b border-separator bg-fill px-8 py-6">
					<p className="mb-1 text-xs font-medium uppercase tracking-widest text-foreground-subtle">
						Ruta de prueba
					</p>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Página de pruebas
					</h1>
				</header>
				<div className="space-y-4 px-8 py-8">
					<p className="leading-relaxed text-foreground-muted">
						Si ves este panel con el borde suave, el{' '}
						<code className="rounded bg-fill px-1.5 py-0.5 font-mono text-sm text-primary">
							react-router-dom
						</code>{' '}
						está sirviendo esta ruta correctamente.
					</p>
					<ul className="flex flex-wrap gap-2">
						{tags.map((tag) => (
							<li
								key={tag}
								className="rounded-full border border-separator bg-fill px-3 py-1 text-xs font-medium text-foreground-muted"
							>
								{tag}
							</li>
						))}
					</ul>
				</div>
				<footer className="border-t border-separator bg-fill px-8 py-4">
					<p className="text-center text-xs text-foreground-subtle">
						Plantilla mínima — cambia este contenido cuando quieras.
					</p>
				</footer>
			</article>
		</Container>
	);
}
