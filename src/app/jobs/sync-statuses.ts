import * as cron from 'node-cron';
import {getThemesToSync, updateStatus} from '../storage/themes';
import {logger} from '../lib/logger';

export const syncStatusesCron = cron.schedule('* * * * *', async () => {
	const themes = await getThemesToSync();
	const curDate = new Date();
	for (const theme of themes) {
		if (!theme.realization_dates) {
			continue;
		}
		if (new Date(theme.realization_dates.from) < curDate && new Date(theme.realization_dates.to) > curDate) {
			await updateStatus(theme.id, 'in progress');
		} else if (new Date(theme.realization_dates.to) < curDate) {
			await updateStatus(theme.id, 'completed');
		}
	}

	logger.info(`Synced ${themes.length} themes`);
});