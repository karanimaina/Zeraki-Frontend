export class Micropayment {
	stage = 1;
	paymentSource = "Mpesa";
	amount?: number;
	paymentTo?: string;
	phoneNumber?: string;
	product?: string = "ZERAKI_FINANCE";
}
