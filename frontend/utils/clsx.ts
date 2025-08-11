export default function clsx(...names: (string | undefined | null | false)[])
{
	return names.filter(v => !!v).join(" ");
}
