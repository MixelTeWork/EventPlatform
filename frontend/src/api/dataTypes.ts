export class ApiError extends Error { }

export type Modify<T, R> = Omit<T, keyof R> & R;
export interface ResponseMsg
{
	msg: string,
}

export interface ImgData
{
	data: string,
	name: string,
}
