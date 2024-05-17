import {getUserInfo} from '../integration/user';
import {dbClient} from '../lib/db-client';
import {logger} from '../lib/logger';
import {Theme, ThemeStatus, ThemeType, TeachingMaterial, DateInterval, OrderData} from '../types';
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
	teachingMaterials: TeachingMaterial[] | null;
	joinDate: string;
	realizationDates: DateInterval;
	ruleId: number | null;
	orgId: number;
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
	organization_id: number;
	teaching_materials: TeachingMaterial[] | null,
	join_date: string;
	realization_dates: DateInterval;
	created_at: Date;
	updated_at: Date;
	rule_id: number | null;
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
			(title, type, short_description, description, creator, approver, private, executors_group, teaching_materials, join_date, realization_dates, rule_id, organization_id)
			VALUES
			($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
			RETURNING id;
		`, [
			payload.title,
			payload.type ?? 'pet',
			payload.shortDescription ?? '',
			payload.description,
			payload.creator,
			payload.approver ?? null,
			payload.private,
			payload.executorsGroup,
			payload.teachingMaterials ? JSON.stringify(payload.teachingMaterials) : null,
			payload.joinDate,
			JSON.stringify(payload.realizationDates),
			payload.ruleId,
			payload.orgId
		]);
		if (rows.length !== 1) {
			return null;
		}

		return rows[0].id;
	} catch (error) {
		logger.error(error)
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
		teachingMaterials: themeRows[0].teaching_materials,
		joinDate: themeRows[0].join_date,
		realizationDates: themeRows[0].realization_dates,
		organizationId: themeRows[0].organization_id,
		creator,
		approver,
		executorsGroup,
		joinRequests,
		ruleId: themeRows[0].rule_id
	};
}

export async function getAllRecruitingThemes(orgId: number, filters?: Filters, orderBy?: OrderBy, search?: string): Promise<number[]> {
	let slotsCount = 1;
	const defaultQuery = `--sql
		SELECT t.id FROM themes as t
		LEFT JOIN groups AS g
		ON t.executors_group = g.id
		WHERE status = 'recruiting' AND approver IS NOT NULL
		AND (
			CASE 
				WHEN private = true THEN t.organization_id = $1
				ELSE true
			END
		)
		AND g.size - (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) >= $2
	`

	const query = [defaultQuery];

	if (search) {
		query.push(`
			AND LOWER(title) LIKE '%${search}%'
		`);
	}

	for (const [key, value] of Object.entries(filters ?? {})) {
		if (key === 'slotsCount') {
			if (typeof value === 'number') {
				slotsCount = value;
			}
			continue;
		}
		let val;

		if (key === 'private' && value === false) {
			val = null;
		}

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

	const {rows} = await dbClient.query<{id: number}>(query.join('\n'), [orgId, slotsCount]);

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
		) OR t.creator = $1
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
	teachingMaterials: TeachingMaterial[] | null,
	joinDate: string,
	realizationDates: DateInterval,
	type: ThemeType,
	ruleId: number | null
}) {
	const query = `--sql
		UPDATE themes
		SET
			description = $1,
			short_description = $2,
			private = $3,
			title = $4,
			type = $5,
			teaching_materials = $6,
			join_date = $7,
			realization_dates = $8,
			rule_id = $9
		WHERE id = $10;
	`;

	try {
		await dbClient.query(query, [
			payload.description,
			payload.shortDescription,
			payload.private,
			payload.title,
			payload.type,
			payload.teachingMaterials ? JSON.stringify(payload.teachingMaterials) : null,
			payload.joinDate,
			JSON.stringify(payload.realizationDates),
			payload.ruleId,
			payload.id
		]);
	} catch (error){
		logger.error(error)
		return false;
	}

	return true;
};

export async function addMentor(mentorUid: string, themeId: number) {
	const mentorId = await getUserIdByUid(mentorUid);

	const query = `--sql
		UPDATE themes
		SET approver = $1
		WHERE id = $2;
	`;

	try {
		await dbClient.query(query, [mentorId, themeId]);
	} catch (error){
		logger.error(error)
		return false;
	}

	return true;
}

export async function getOrderData(ruleId: number) {
	const query = `--sql
		SELECT id FROM themes
		WHERE rule_id = $1 AND approver IS NOT NULL;
	`

	const {rows} = await dbClient.query<{id: number}>(query, [ruleId]);

	const ids = rows.map((row) => row.id);
	const themes: Theme[] = [];

	for (const themeId of ids) {
		const theme = await getTheme(themeId);

		if (!theme) {
			continue;
		}

		themes.push(theme);
	}

	const orderData: OrderData = {};
	for (const theme of themes) {
		const executors = theme.executorsGroup.participants;
		const head = theme.approver!;
		for (const executor of executors) {
			const group = executor.group ?? 'NО_GROUP';
			if (!orderData[group]) {
				orderData[group] = [] as any;
			}

			orderData[group].push({
				executorName: executor.name + ' ' + executor.surname + ' ' + executor.patronymic,
				head: {
					name: head.name + ' ' + head.surname + ' ' + head.patronymic,
					post: head.post ?? ''
				},
				themeTitle: theme.title
			})
		}
	}

	return orderData;
}

export async function updateStatus(themeId: number, newStatus: ThemeStatus) {
	const query = `--sql
		UPDATE themes
		SET status = $1
		WHERE id = $2;
	`;

	try {
		await dbClient.query(query, [newStatus, themeId]);
	} catch (error){
		logger.error(error)
		return false;
	}

	return true;
}

export async function getThemeByGroup(groupId: number) {
	const query = `--sql
		SELECT id FROM themes
		WHERE executors_group = $1;
	`

	const {rows} = await dbClient.query<{id: number}>(query, [groupId]);

	const themeId = rows[0].id;

	const theme = await getTheme(themeId);

	return theme;
}

export async function getThemesToSync() {
	const query = `--sql
		SELECT id FROM themes
		WHERE status NOT IN ('recruiting', 'completed');
	`

	const {rows} = await dbClient.query<{id: number}>(query);

	if (!rows.length) {
		return [];
	}

	const themes = await Promise.all(rows.map((row) => dbClient.query<ThemeDbEntry>(`
		SELECT * FROM themes WHERE id = ${row.id};
	`)));

	return themes.map((theme) => theme.rows[0]);
}
