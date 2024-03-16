import {dbClient} from '../lib/db-client';
import {NotificationType} from '../types';
import {getUserIdByUid} from './user';

export async function createNotification(payload: {
	userUid: string,
	type: NotificationType,
	attributes: unknown
}) {
	try {
		const userId = await getUserIdByUid(payload.userUid);
		await dbClient.query<{id: number}>(`--sql
			INSERT INTO notifications (user_id, type, attributes)
			VALUES ($1, $2, $3);
		`, [userId, payload.type, payload.attributes]);

		return true;
	} catch (error) {
		return false;
	}
}

export async function getNotifications(userUid: string) {
	const userId = await getUserIdByUid(userUid);
	const {rows} = await dbClient.query(`--sql
		SELECT type, created_at, attributes, new FROM notifications WHERE user_id = $1;
	`, [userId]);

	return rows.map((row) => ({...row, createdAt: row.created_at}));
}