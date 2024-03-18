import {dbClient} from '../lib/db-client';
import {logger} from '../lib/logger';
import {getUserIdByUid} from './user';

export async function inviteMentor(payload: {
	mentorUid: string,
	themeId: number,
	inviter: string
}) {
	const mentorId = await getUserIdByUid(payload.mentorUid);
	try {
		await dbClient.query<{id: number}>(`--sql
			INSERT INTO mentor_invitations (mentor_id, theme_id, inviter)
			VALUES ($1, $2, $3);
		`, [mentorId, payload.themeId, payload.inviter]);

		return true;
	} catch (error) {
		return false;
	}
}

export async function mentorInvitationResponse(payload: {
	themeId: number,
	mentorUid: string,
	action: 'accept' | 'reject'
}) {
	const mentorId = getUserIdByUid(payload.mentorUid)

	const query = `--sql
		UPDATE invitations
		SET status=$1
		WHERE 
			theme_id = $2 AND
			mentor_id = $3
		RETURNING inviter
	`;

	try {
		const {rows} = await dbClient.query<{inviter: string}>(query, [
			payload.action === 'accept' ? 'accepted' : 'rejected', payload.themeId, mentorId
		]);

		if (!rows || rows.length !== 1) {
			return null;
		}

		return rows[0].inviter;
	} catch (error){
		logger.error(error)
		return null;
	}
}
