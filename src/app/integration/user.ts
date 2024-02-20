import {passportProvider} from '../providers/passport';
import {getUserDetails, getUserUidById} from '../storage/user';
import {UserWithDetails} from '../types';

export async function getUserInfo(userId: string | number): Promise<UserWithDetails> {
	let uid: string;
	if (typeof userId === 'number') {
		uid = await getUserUidById(userId);
	} else {
		uid = userId;
	}
	const userInfoResponse = await passportProvider.userInfo(uid);

	if (!userInfoResponse.ok) {
		throw userInfoResponse.error;
	}

	const userDetails = await getUserDetails(uid);

	if (!userDetails) {
		throw Error('failed to get user details');
	}

	return {
		...userInfoResponse.value,
		...userDetails
	}
}