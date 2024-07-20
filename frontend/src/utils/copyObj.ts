export default function copyObj<T>(obj: T): T
{
	return JSON.parse(JSON.stringify(obj));
}