import {getUserInfo} from '../integration/user';
import {dbClient} from '../lib/db-client';
import {Group} from '../types';

export type GroupDbEntry = {
	id: number;
	size: number;
	created_at: Date;
	updated_at: Date;
}

export async function createEmptyGroup(groupSize: number) {
	try {
		const {rows} = await dbClient.query<{id: number}>(`--sql
			INSERT INTO groups (size)
			VALUES($1)
			RETURNING id;
		`, [groupSize]);

		if (rows.length !== 1) {
			return null;
		}

		return rows[0].id;
	} catch (error) {
		return null;
	}
}

export async function getGroup(groupId: number): Promise<Group | null> {
	const {rows: groupRows} = await dbClient.query<GroupDbEntry>(`--sql
		SELECT * FROM groups WHERE id = $1;
	`, [groupId]);

	if (groupRows.length !== 1) {
		return null;
	}

	const {rows: participantRows} = await dbClient.query<{member: number}>(`--sql
		SELECT member FROM group_members WHERE group_id = $1;
	`, [groupId]);

	const participants = await Promise.all(
		participantRows.map((participant) => getUserInfo(participant.member))
	);

	if (!participants) {
		return null;
	}

	return {
		id: groupRows[0].id,
		size: groupRows[0].size,
		createdAt: groupRows[0].created_at,
		updatedAt: groupRows[0].updated_at,
		participants
	}
}

export async function joinGroup(groupId: number, userId: number): Promise<Boolean> {
	try {
		await dbClient.query(`--sql
			INSERT INTO group_members (group_id, member) VALUES ($1, $2);
		`, [groupId, userId]);
	} catch (error) {
		return false;
	}

	return true;
}

export async function updateGroupSize(groupId: number, newSize: number) {
	const query = `--sql
		UPDATE groups
		SET size = $1
		WHERE id = $2;
	`;

	try {
		await dbClient.query(query, [newSize, groupId]);
	} catch {
		return false;
	}

	return true;
}