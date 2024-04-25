import {dbClient} from '../lib/db-client';
import {DateInterval, Rule, ThemeType} from '../types';

type RuleDbEntry = {
	id: number;
	title: string;
	type: ThemeType;
	expiration_date: string;
	join_date: string;
	realization_dates: DateInterval;
	download_link: string;
	organization_id: number;
}

export async function createRule(rule: Omit<Rule, 'id'>) {
	try {
		const {rows} = await dbClient.query<RuleDbEntry>(`--sql
			INSERT INTO organization_rules (title, type, expiration_date, join_date, realization_dates, download_link, organization_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING *;
		`, [
			rule.title,
			rule.type,
			rule.expirationDate,
			rule.joinDate,
			JSON.stringify(rule.realizationDates),
			rule.downloadLink,
			rule.organizationId
		]);

		return {
			id: rows[0].id,
			joinDate: rows[0].join_date,
			realizationDates: rows[0].realization_dates,
			title: rows[0].title,
			type: rows[0].type,
			expirationDate: rows[0].expiration_date,
			downloadLink: rows[0].download_link,
			organizationId: rows[0].organization_id
		};
	} catch (error) {
		return null;
	}
}

export async function getRules(organizationId: number): Promise<Rule[] | null> {
	const {rows} = await dbClient.query<RuleDbEntry>(`--sql
		SELECT * FROM organization_rules
		WHERE organization_id=$1 AND expiration_date::DATE > NOW()::DATE;
	`, [organizationId]);

	if (!rows || !rows.length) {
		return null;
	}

	return rows.map((row) => ({
		id: row.id,
		joinDate: row.join_date,
		realizationDates: row.realization_dates,
		title: row.title,
		type: row.type,
		expirationDate: row.expiration_date,
		downloadLink: row.download_link,
		organizationId: row.organization_id
	}));
}
