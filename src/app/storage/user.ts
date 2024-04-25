import {dbClient} from '../lib/db-client'
import {UserDetails} from '../types';

export type UserDetailsDbEntry = {
	id: number;
	uid: string;
	description: string;
	organization: number;
	group_name: string | null;
	post: string | null;
}

export async function getUserDetails(userId: string): Promise<UserDetails | null> {
	const client = await dbClient.connect()
	const {rows: userRows} = await client.query<UserDetailsDbEntry>(`--sql
		SELECT id, description, organization, group_name, post FROM users
		WHERE uid =  $1;
	`,
		[userId]
	)

	if (userRows.length !== 1) {
		return null;
	}

	const {rows: organizationRows} = await client.query(`--sql
		SELECT * FROM organizations
		WHERE id =  $1;
	`,
		[userRows[0].organization]
	)

	if (organizationRows.length !== 1) {
		return null;
	}

	client.release(true)

    const userDetails: UserDetails = {
		id: userRows[0].id,
		description: userRows[0].description,
		organization: {
			id: organizationRows[0].id,
			uid: organizationRows[0].uid,
			shortName: organizationRows[0].short_name,
			fullName: organizationRows[0].full_name,
			description: organizationRows[0].description,
			attributes: organizationRows[0].attributes
		},
		group: userRows[0].group_name,
		post: userRows[0].post
	}

    return userDetails;
}

export async function updateProfile(userId: string, updateFields: {description: string}) {
	const query = `--sql
		UPDATE users
		SET description = $1
		WHERE uid = $2;
	`;

	try {
		await dbClient.query(query, [updateFields.description, userId]);
	} catch {
		return false;
	}

	return true;
}

export async function checkUserIsExist(userId: string) {
	const {rows} = await dbClient.query(`--sql
		SELECT * FROM users WHERE uid=$1
	`, [userId]);

	if (!rows || !rows.length) {
		return false;
	}

	return true;
} 

export async function createUserRecord(userId: string, organizationId?: number) {
	const query = organizationId ?
		`INSERT INTO users (uid, organization) VALUES ('${userId}', ${organizationId});`
		:
		`INSERT INTO users (uid) VALUES ('${userId}');`

	try {
		await dbClient.query(query);
	} catch (error) {
		return false;
	}

	return true;
}

export async function getUserUidById(id: number) {
	const {rows} = await dbClient.query<{uid: string}>(`--sql
		SELECT uid FROM users WHERE id = $1
	`, [id]);

	if (!rows || !rows.length) {
		throw new Error('Failed to get user UID');
	}

	return rows[0].uid;
}

export async function getUserIdByUid(uid: string) {
	const {rows} = await dbClient.query<{id: number}>(`--sql
		SELECT id FROM users WHERE uid = $1
	`, [uid]);

	if (!rows || !rows.length) {
		throw new Error('Failed to get user id');
	}

	return rows[0].id;
}
