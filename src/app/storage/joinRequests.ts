import {getUserInfo} from '../integration/user';
import {dbClient} from '../lib/db-client';
import {UserWithDetails} from '../types';

export async function getJoinRequests(groupId: number): Promise<UserWithDetails[]> {
	const {rows: requestsRows} = await dbClient.query<{user_id: number}>(`--sql
		SELECT user_id FROM join_requests WHERE group_id = $1;
	`, [groupId]);

	const requesters = await Promise.all(
		requestsRows.map((row) => getUserInfo(row.user_id))
	);

	return requesters;
}

export async function createJoinRequest(groupId: number, userId: number): Promise<boolean> {
	try {
		await dbClient.query<{id: number}>(`--sql
			INSERT INTO join_requests (group_id, user_id)
			VALUES ($1, $2);
		`, [groupId, userId]);

		return true;
	} catch (error) {
		return false;
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