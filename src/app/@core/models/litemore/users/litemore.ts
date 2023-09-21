import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";

export class LitemoreUser1 {
	constructor(
		public userId: number,
		public phoneNumber: number,
		public name: string,
		public email: string,
		public countyId: number,
		public countyName: string,
		public countryId: number,
		public countryName: string,
		public regionName: null,
		public regionId: number,
		public litemoreRoles: Array<LitemoreUserRole>,
		public managedRegionsIds: Array<number>
	) {}

	public get canEditCreditNotes() {
		return this.litemoreRoles.some((role) =>
			[
				LitemoreUserRole.LITEMORE_ADMIN,
				LitemoreUserRole.BDEV_MANAGER,
				LitemoreUserRole.FINANCE,
				LitemoreUserRole.FINANCE_MANAGER
			].includes(role)
		);
	}

	public get canRecordCollections() {
		return this.litemoreRoles.some((role) =>
			[LitemoreUserRole.FINANCE, LitemoreUserRole.CX_MANAGER].includes(role)
		);
	}

	get isAdminOrTechSupport(): boolean {
		return this.litemoreRoles.some((role) =>
			[LitemoreUserRole.SUPER_ADMIN, LitemoreUserRole.TECH_SUPPORT].includes(
				role
			)
		);
	}

	get isLitemoreAdmin(): boolean {
		return this.litemoreRoles.some((role) =>
			[LitemoreUserRole.LITEMORE_ADMIN].includes(role)
		);
	}

	get isBdevManager(): boolean {
		return this.litemoreRoles.some((role) =>
			[LitemoreUserRole.BDEV_MANAGER].includes(role)
		);
	}

	get isBdev(): boolean {
		return this.litemoreRoles.some((role) =>
			[LitemoreUserRole.BDEV].includes(role)
		);
	}

	get isBdevOrBdevManager(): boolean {
		return this.litemoreRoles.some((role) =>
			[LitemoreUserRole.BDEV_MANAGER, LitemoreUserRole.BDEV].includes(role)
		);
	}

	get isCx(): boolean {
		return this.litemoreRoles.some((role) =>
			[LitemoreUserRole.CX, LitemoreUserRole.CX_MANAGER].includes(role)
		);
	}

	get isFinance(): boolean {
		return this.litemoreRoles.some((role) =>
			[LitemoreUserRole.FINANCE, LitemoreUserRole.FINANCE_MANAGER].includes(
				role
			)
		);
	}

	get defaultRoute(): string {
		if (this.isAdminOrTechSupport) return "mg";
		return "am";
	}
}
