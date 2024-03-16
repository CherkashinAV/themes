import {dbClient} from '../lib/db-client';
import {getUserIdByUid} from './user';

export async function inviteMentor(payload: {
	mentorUid: string,
	themeId: number
}) {
	const mentorId = await getUserIdByUid(payload.mentorUid);
	try {
		await dbClient.query<{id: number}>(`--sql
			INSERT INTO mentor_invitations (mentor_id, theme_id)
			VALUES ($1, $2);
		`, [mentorId, payload.themeId]);

		return true;
	} catch (error) {
		return false;
	}
}
