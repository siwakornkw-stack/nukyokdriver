import Cookies from "js-cookie";

export function errorWrapper(error: unknown, name: string = ''): string {
	const t: string = `${name}: An unexpected error occurred: ${error}`;
	console.error(t);
	return t;
}

export function getDomain(): string {
	let hostname = window.location.hostname;
	if (hostname) {
		if (hostname.includes('localhost')) {	
			const port = window.location.port;
			hostname = hostname+':'+port;
		}
		return hostname;
	}
	return '';
}

export function removeAllCookies() {
    Object.keys(Cookies.get()).forEach(cookieName => {
		console.log('cookieName', cookieName);
        Cookies.remove(cookieName);
    });
}

/* export function getClientIp(): string {
	const headersList = headers();
	return (headersList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
} */
