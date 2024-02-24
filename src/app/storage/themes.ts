import {getUserInfo} from '../integration/user';
import {dbClient} from '../lib/db-client';
import {Theme, ThemeStatus, ThemeType} from '../types';
import {getGroup} from './group';
import {getJoinRequests} from './joinRequests';

export type createThemePayload = {
	title: string;
	type: ThemeType;
	shortDescription?: string;
	description: string;
	creator: number;
	approver?: number;
	private: boolean;
	executorsGroup: number;
}

export type ThemeDbEntry = {
	id: number;
	title: string;
	status: ThemeStatus;
	type: ThemeType;
	short_description: string;
	description: string;
	approver: number;
	creator: number;
	private: boolean;
	executors_group: number;
	created_at: Date;
	updated_at: Date;
}

export async function createTheme(payload: createThemePayload) {
	try {
		const {rows} = await dbClient.query<{id: number}>(`--sql
			INSERT INTO themes
			(title, type, short_description, description, creator, approver, private, executors_group)
			VALUES
			($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING id;
		`, [
			payload.title,
			payload.type ?? 'pet',
			payload.shortDescription ?? '',
			payload.description,
			payload.creator,
			payload.approver ?? null,
			payload.private,
			payload.executorsGroup
		]);
		if (rows.length !== 1) {
			return null;
		}

		return rows[0].id;
	} catch (error) {
		return null;
	}
}

export async function getTheme(themeId: number): Promise<Theme | null> {
	const {rows: themeRows} = await dbClient.query<ThemeDbEntry>(`--sql
		SELECT * FROM themes
		WHERE id =  $1;
	`,
		[themeId]
	)

	if (themeRows.length !== 1) {
		return null;
	}

	const creator = await getUserInfo(themeRows[0].creator);
	const approver = themeRows[0].approver ? await getUserInfo(themeRows[0].approver) : undefined;
	const executorsGroup = await getGroup(themeRows[0].executors_group);
	const joinRequests = await getJoinRequests(themeId);

	if (!executorsGroup) {
		return null;
	}

    return {
		id: themeRows[0].id,
		status: themeRows[0].status,
		type: themeRows[0].type,
		title: themeRows[0].title,
		shortDescription: themeRows[0].short_description,
		description: themeRows[0].description,
		private: themeRows[0].private,
		createdAt: themeRows[0].created_at,
		updatedAt: themeRows[0].updated_at,
		creator,
		approver,
		executorsGroup,
		joinRequests
	};
}

export async function getAllRecruitingThemes(): Promise<number[]> {
	const {rows} = await dbClient.query<{id: number}>(`--sql
		SELECT id FROM themes WHERE status = 'recruiting' AND approver IS NOT NULL;
	`);

	return rows.map((row) => row.id);
}