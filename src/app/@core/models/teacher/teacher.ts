export interface Teacher {
	userid: number
	admin: boolean
	superAdmin: boolean
	email: string
	gender: string
	groups: Array<number>
	imageUrl: string
	name: string
	nationalIdNo: number
	personalEmail: string
	phone: string
	role: number
	tscNo: string
	isPrincipal: boolean,
	isDeputyPrincipal: boolean,
	title: string
	biography: string;
	address: string;
	isDos: boolean;
}
