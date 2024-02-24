import {getUserInfo} from '../integration/user';
import {dbClient} from '../lib/db-client';
import {UserWithDetails} from '../types';

export async function getJoinRequests(themeId: number): Promise<UserWithDetails[]> {
	const {rows: requestsRows} = await dbClient.query<{user_id: number}>(`--sql
		SELECT user_id FROM join_requests WHERE theme_id = $1;
	`, [themeId]);

	const requesters = await Promise.all(
		requestsRows.map((row) => getUserInfo(row.user_id))
	);

	return requesters;
}

export async function createJoinRequest(themeId: number, userId: number): Promise<boolean> {
	try {
		await dbClient.query<{id: number}>(`--sql
			INSERT INTO join_requests (theme_id, user_id)
			VALUES ($1, $2);
		`, [themeId, userId]);

		return true;
	} catch (error) {
		return false;
	}
}