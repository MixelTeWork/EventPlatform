export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	return (
		<>
			<style>{`body { background: var(--background, #000000); }`}</style>
			{children}
		</>
	);
}
