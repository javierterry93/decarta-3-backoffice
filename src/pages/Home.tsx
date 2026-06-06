import { Link } from 'react-router-dom';
import { Container } from '../components/Container.tsx';

const features = [
	{
		title: 'Rápido',
		desc: 'Carga optimizada y experiencia fluida en cualquier dispositivo.',
		accent: 'bg-primary/10 text-primary',
	},
	{
		title: 'Claro',
		desc: 'Jerarquía visual y tipografía pensada para leer sin esfuerzo.',
		accent: 'bg-success/10 text-success',
	},
	{
		title: 'Flexible',
		desc: 'Secciones modulares que puedes reordenar o ampliar cuando quieras.',
		accent: 'bg-info/10 text-info',
	},
];

const stats = [
	{ value: '6', label: 'Secciones', color: 'text-primary' },
	{ value: '768', label: 'px máx. ancho', color: 'text-accent-purple' },
	{ value: '100%', label: 'Full width', color: 'text-accent-orange' },
];

export default function Home() {
	return (
		<>
			<Container
				backgroundClassName="bg-surface-muted"
				sectionClassName="flex min-h-hero items-center py-20"
			>
				<div className="flex flex-col gap-8">
					<p className="text-xs font-semibold uppercase tracking-label text-primary">
						Bienvenido a Zenda
					</p>
					<h1 className="text-4xl font-semibold leading-display tracking-tight text-foreground sm:text-5xl">
						Una web moderna, sección a sección
					</h1>
					<p className="max-w-lg text-lg leading-relaxed text-foreground-muted">
						Cada bloque ocupa todo el ancho de la pantalla, con el contenido
						centrado y limitado por el token de contenedor.
					</p>
					<div className="flex flex-wrap gap-3">
						<a
							href="#servicios"
							className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-on-primary transition hover:bg-primary-hover active:scale-press"
						>
							Explorar
						</a>
						<Link
							to="/pruebas"
							className="rounded-full border border-border bg-surface-elevated px-5 py-3 text-sm font-medium text-foreground transition hover:bg-fill"
						>
							Ver paleta
						</Link>
					</div>
				</div>
			</Container>

			<Container
				id="servicios"
				backgroundClassName="bg-surface-elevated"
				sectionClassName="py-24 sm:py-32"
			>
				<div className="flex flex-col gap-12">
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
							Servicios
						</p>
						<h2 className="text-3xl font-semibold tracking-tight text-foreground">
							Todo lo que necesitas en un solo flujo
						</h2>
						<p className="mt-4 max-w-md leading-relaxed text-foreground-muted">
							Tres pilares que puedes sustituir por tu copy real cuando definas
							el producto.
						</p>
					</div>
					<ul className="grid gap-4 sm:grid-cols-3">
						{features.map((item) => (
							<li
								key={item.title}
								className="rounded-2xl border border-separator bg-surface p-6 transition hover:border-border"
							>
								<span
									className={[
										'mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold',
										item.accent,
									].join(' ')}
									aria-hidden
								>
									◆
								</span>
								<h3 className="mb-2 font-semibold text-foreground">
									{item.title}
								</h3>
								<p className="text-sm leading-relaxed text-foreground-muted">
									{item.desc}
								</p>
							</li>
						))}
					</ul>
				</div>
			</Container>

			<Container
				backgroundClassName="bg-surface"
				sectionClassName="py-24 sm:py-32"
			>
				<div className="flex flex-col gap-10">
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
							Números
						</p>
						<h2 className="text-3xl font-semibold tracking-tight text-foreground">
							Diseño que escala con tu mensaje
						</h2>
					</div>
					<dl className="grid grid-cols-3 gap-4">
						{stats.map((stat) => (
							<div
								key={stat.label}
								className="rounded-2xl border border-separator bg-surface-elevated px-4 py-8 text-center"
							>
								<dt
									className={[
										'text-3xl font-semibold tabular-nums sm:text-4xl',
										stat.color,
									].join(' ')}
								>
									{stat.value}
								</dt>
								<dd className="mt-2 text-xs font-medium uppercase tracking-wider text-foreground-subtle">
									{stat.label}
								</dd>
							</div>
						))}
					</dl>
					<p className="leading-relaxed text-foreground-muted">
						Las bandas de color van a ancho completo; el texto y las tarjetas
						permanecen alineados dentro del contenedor.
					</p>
				</div>
			</Container>

			<Container
				backgroundClassName="bg-surface-inverse"
				sectionClassName="py-24 sm:py-32 text-foreground-on-inverse"
			>
				<div className="flex flex-col gap-8">
					<p className="text-xs font-semibold uppercase tracking-widest text-foreground-on-inverse-muted">
						Destacado
					</p>
					<h2 className="text-3xl font-semibold tracking-tight">
						Un bloque para tu producto estrella
					</h2>
					<div className="overflow-hidden rounded-3xl border border-border-inverse bg-surface-inverse-deep">
						<div className="aspect-video bg-gradient-to-br from-primary/20 via-transparent to-accent-purple/20" />
						<div className="border-t border-border-inverse p-6 sm:p-8">
							<p className="text-sm leading-relaxed text-foreground-on-inverse-muted">
								Sección de contraste — ideal para vídeo o imagen de producto.
							</p>
						</div>
					</div>
				</div>
			</Container>

			<Container
				backgroundClassName="bg-surface-elevated border-y border-separator"
				sectionClassName="py-24 sm:py-32"
			>
				<figure className="flex flex-col gap-6">
					<blockquote className="text-2xl font-medium leading-snug text-foreground sm:text-3xl">
						“El contenedor hace que cada sección respire. Full width por fuera,
						foco por dentro.”
					</blockquote>
					<figcaption className="flex items-center gap-4">
						<div
							className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent-purple"
							aria-hidden
						/>
						<div>
							<cite className="not-italic font-semibold text-foreground">
								Equipo Zenda
							</cite>
							<p className="text-sm text-foreground-subtle">
								Opinión de ejemplo
							</p>
						</div>
					</figcaption>
				</figure>
			</Container>

			<Container
				backgroundClassName="bg-surface"
				sectionClassName="py-24 sm:py-32"
			>
				<div className="flex flex-col gap-6 rounded-3xl border border-separator bg-surface-elevated p-8 sm:p-10">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						¿Listo para el siguiente paso?
					</h2>
					<p className="leading-relaxed text-foreground-muted">
						CTA con el color primario del tema. Personaliza el texto y enlaza a
						tu formulario o demo.
					</p>
					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary transition hover:bg-primary-hover"
						>
							Empezar ahora
						</button>
						<a
							href="#"
							className="rounded-full px-6 py-3 text-sm font-medium text-link underline-offset-4 hover:underline"
						>
							Ver documentación
						</a>
					</div>
				</div>
			</Container>
		</>
	);
}
