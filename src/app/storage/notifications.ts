import {dbClient} from '../lib/db-client';
import {logger} from '../lib/logger';
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
		SELECT id, type, created_at, attributes, new, interacted
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC;
	`, [userId]);

	return rows.map((row) => ({...row, createdAt: row.created_at}));
}

export async function notificationLook(notificationId: number) {
	const query = `--sql
		UPDATE notifications
		SET new=false
		WHERE id=$1
	`;

	try {
		await dbClient.query(query, [notificationId]);
	} catch (error){
		logger.error(error)
		return false;
	}

	return true;
}

export async function notificationInteract(notificationId: number) {
	const query = `--sql
		UPDATE notifications
		SET interacted=true
		WHERE id=$1
	`;

	try {
		await dbClient.query(query, [notificationId]);
	} catch (error){
		logger.error(error)
		return false;
	}

	return true;
}