export interface LoginRequestData {
	username: string;
	password: string;
};

export interface LoginResponseData {
	data: {
		customer_id: string;
		access_token: string;
		refresh_token: string;
		expires_in: string;
	}
}

export interface SignUpRequestData {
	username: string;
	name: string;
	email: string;
	password: string;
	mobileNo: string;
	lineId: string;
}

export interface SignUpResponseData {
	data: {
		customer_id: string;
		access_token: string;
		refresh_token: string;
		expires_in: string;
	}
}
