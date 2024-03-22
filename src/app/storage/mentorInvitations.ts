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
		const {rows} = await dbClient.query<{id: number}>(`--sql
			INSERT INTO mentor_invitations (mentor_id, theme_id, inviter)
			VALUES ($1, $2, $3)
			RETURNING id;
		`, [mentorId, payload.themeId, payload.inviter]);

		if (!rows || rows.length !== 1) {
			return null
		}

		return rows[0].id;
	} catch (error) {
		return null;
	}
}

export async function mentorInvitationResponse(payload: {
	themeId: number,
	mentorUid: string,
	action: 'accept' | 'reject' | 'not_relevant'
}) {
	const mentorId = await getUserIdByUid(payload.mentorUid)

	const query = `--sql
		UPDATE mentor_invitations
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

export async function declinePendingInvitations(themeId: number) {
	const query = `--sql
		UPDATE mentor_invitations
		SET status='not_relevant'
		WHERE 
			theme_id = $1 AND
			status = 'pending'
	`;

	try {
		const {rows} = await dbClient.query<{inviter: string}>(query, [themeId]);

		if (!rows || rows.length !== 1) {
			return null;
		}

		return true;
	} catch (error){
		logger.error(error)
		return false;
	}
}
