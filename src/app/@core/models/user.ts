export class User {
	constructor(
		private _accessToken: string | null,
		private _refreshToken: string | null,
		public expiresAt: any,
		public schoolId: number | null,
		public tokenType: string | null,
		public user: any,
		private _userId: number | null,
	) { }

	get userId() {
		return this._userId;
	}

	get token() {
		// console.warn(new Date().getTime(), this.expiresAt, new Date().getTime() > this.expiresAt);
		if (!this.expiresAt) {
			return null;
		} else if (this.expiresAt && new Date() > this.expiresAt) {
			console.warn("Token expired");
			// return null;
			return "Token Expired";
		} else
			// console.warn('Token active');
			return this._accessToken;
	}

	get refreshToken() {
		return this._refreshToken;
	}
}

export interface LocalUser {
	email: string;
	name: string;
	role: number,
	roles: any
	tokens: {
		accessToken: string;
		expiresAt: number;
		refreshToken: string;
	},
	userid: number;
	schoolId: number | null;
	tokenType: string | null;
	admno?: string;
}
