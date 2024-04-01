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

export type Role = 'default' | 'mentor' | 'moderator';
export type User = {
	name: string;
	surname: string;
	email: string;
	role: Role;
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

export type UserDetails = {
	id: number;
	description: string;
	organization: Organization
}

export type UserWithDetails = User & UserDetails;

export type Group = {
	id: number;
	size: number;
	createdAt: Date;
	updatedAt: Date;
	participants: UserWithDetails[];
}

export type TeachingMaterial = {
	title: string;
	link: string;
}

export type ThemeStatus = 'recruiting' | 'staffed' | 'in progress' | 'completed';
export type ThemeType = 'course' | 'graduation' | 'contest' | 'pet' | 'hackathon';

export type DateInterval = {
	from: string;
	to: string;
}

export type Theme = {
	id: number;
	type: ThemeType;
	title: string;
	status: ThemeStatus;
	shortDescription: string;
	description: string;
	approver?: UserWithDetails;
	creator: UserWithDetails;
	private: boolean;
	executorsGroup: Group;
	teachingMaterials: TeachingMaterial[] | null;
	joinDate: string;
	realizationDates: DateInterval,
	joinRequests: {user: UserWithDetails, requestDateTime: string}[];
	createdAt: Date;
	updatedAt: Date;
}

export type NotificationType = 'INVITE_MENTOR' | 'MENTOR_RESPONSE' | 'THEME_STATUS';