export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	return (
		<>
			<style>{`body { background: var(--background, linear-gradient(0deg, #00164c, #000613)); }`}</style>
			{children}
		</>
	);
}
