type OkResult<T = null> = {
	ok: true,
	value: T
};

type ErrorResult<T = string> = {
	ok: false,
	error: T
};

export type Result<T, E> = OkResult<T> | ErrorResult<E>;
export type AsyncResult<T, E> = Promise<Result<T, E>>;

export type User = {
	name: string;
	surname: string;
	email: string;
	role: string;
	uid: string;
}

export type Organization = {
	id: number;
	uid: string;
	shortName: string;
	fullName: string;
	description: string;
	attributes: unknown;
}

export type userDetails = {
	description: string;
	organization: Organization
}