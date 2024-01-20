export class ApiError extends Error { }

export type Modify<T, R> = Omit<T, keyof R> & R;
export interface ResponseMsg
{
	msg: string,
}

export interface User
{
	auth: boolean,
	id: number,
	balance: number,
	name: string,
	login: string,
	roles: string[],
	operations: string[],
}

export interface UserFull
{
	id: number,
	name: string,
	login: string,
	roles: string[],
	bossId: number | null,
	deleted: boolean,
	access: string[],
	operations: string[],
}

export interface UserWithPwd extends User
{
	password: string,
}

export interface Quest
{
	id: number,
	name: string,
	reward: number,
}

export interface StoreItem
{
	id: number,
	name: string,
	price: number,
}
