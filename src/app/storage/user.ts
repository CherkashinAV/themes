import {dbClient} from '../lib/db-client'
import {UserDetails} from '../types';

export type UserDetailsDbEntry = {
	id: number;
	uid: string;
	description: string;
	organization: number;
}

export async function getUserDetails(userId: string): Promise<UserDetails | null> {
	const client = await dbClient.connect()
	const {rows: userRows} = await client.query<UserDetailsDbEntry>(`--sql
		SELECT id, description, organization FROM users
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
		}
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

export async function createUserRecord(userId: string) {
	try {
		await dbClient.query(`--sql
			INSERT INTO users (uid) VALUES ($1);
		`, [userId]);
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