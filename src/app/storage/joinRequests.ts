import {getUserInfo} from '../integration/user';
import {dbClient} from '../lib/db-client';
import {UserWithDetails} from '../types';

export async function getJoinRequests(groupId: number): Promise<{user: UserWithDetails, requestDateTime: string}[]> {
	const {rows: requestsRows} = await dbClient.query<{user_id: number, created_at: string}>(`--sql
		SELECT user_id, created_at FROM join_requests WHERE group_id = $1;
	`, [groupId]);

	const requesters = await Promise.all(
		requestsRows.map((row) => {
			return (async () => ({
				requestDateTime: row.created_at,
				user: await getUserInfo(row.user_id)
			}))()
		})
	);

	return requesters;
}

export async function createJoinRequest(groupId: number, userId: number): Promise<string | null> {
	try {
		const {rows} = await dbClient.query<{created_at: string}>(`--sql
			INSERT INTO join_requests (group_id, user_id)
			VALUES ($1, $2)
			RETURNING created_at;
		`, [groupId, userId]);

		return rows[0].created_at;
	} catch (error) {
		return null;
	}
}

export async function deleteJoinRequest(groupId: number, userId: number): Promise<boolean> {
	try {
		await dbClient.query(`--sql
			DELETE FROM join_requests
			WHERE 
				group_id = $1 AND
				user_id = $2
		`, [groupId, userId]);

		return true;
	} catch {
		return false;
	}
}