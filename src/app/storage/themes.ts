import {getUserInfo} from '../integration/user';
import {dbClient} from '../lib/db-client';
import {logger} from '../lib/logger';
import {Theme, ThemeStatus, ThemeType} from '../types';
import {getGroup} from './group';
import {getJoinRequests} from './joinRequests';
import {getUserIdByUid} from './user';

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

export type OrderBy = {
	field: string,
	order: 'asc' | 'desc'
}

export type Filters = Partial<{
	type: ThemeType,
	private: boolean,
	slotsCount: number
}>

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
	);

	if (themeRows.length !== 1) {
		return null;
	}

	const creator = await getUserInfo(themeRows[0].creator);
	const approver = themeRows[0].approver ? await getUserInfo(themeRows[0].approver) : undefined;
	const executorsGroup = await getGroup(themeRows[0].executors_group);
	const joinRequests = await getJoinRequests(themeRows[0].executors_group);

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

export async function getAllRecruitingThemes(filters?: Filters, orderBy?: OrderBy): Promise<number[]> {
	let slotsCount = 1;
	const defaultQuery = `--sql
		SELECT t.id FROM themes as t
		LEFT JOIN groups AS g
		ON t.executors_group = g.id
		WHERE status = 'recruiting' AND approver IS NOT NULL
		AND g.size - (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) >= $1
	`

	const query = [defaultQuery];

	for (const [key, value] of Object.entries(filters ?? {})) {
		if (key === 'slotsCount') {
			if (typeof value === 'number') {
				slotsCount = value;
			}
			continue;
		}
		let val;

		if(value) {
			val = `'${value}'`
		} else {
			val = null;
		}

		query.push(`
			AND (
				CASE
					WHEN ${val} IS NOT NULL THEN ${key} = ${val}
					ELSE TRUE
				END
			)
		`)
	}

	if (orderBy?.field && orderBy?.order) {
		query.push(`ORDER BY ${orderBy.field} ${orderBy.order}`)
	}

	const {rows} = await dbClient.query<{id: number}>(query.join('\n'), [slotsCount]);

	return rows.map((row) => row.id);
}

export async function getAllThemesForUser(userUid: string, filters?: Filters, orderBy?: OrderBy): Promise<number[]> {
	const userId = await getUserIdByUid(userUid);

	const query = `--sql
		SELECT t.id FROM themes AS t
		LEFT JOIN groups AS g
		ON t.executors_group = g.id
		WHERE t.approver = $1 OR $1 IN (
			SELECT member FROM group_members WHERE
			group_id = g.id
		)
	`

	const {rows} = await dbClient.query<{id: number}>(query, [userId]);

	return rows.map((row) => row.id);
}

export async function updateTheme(payload: {
	id: number,
	description: string,
	shortDescription: string,
	private: boolean,
	title: string,
	type: ThemeType
}) {
	const query = `--sql
		UPDATE themes
		SET description = $1, short_description = $2, private = $3, title = $4, type = $5
		WHERE id = $6;
	`;

	try {
		await dbClient.query(query, [payload.description, payload.shortDescription, payload.private, payload.title, payload.type, payload.id]);
	} catch (error){
		logger.error(error)
		return false;
	}

	return true;
};