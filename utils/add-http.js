const addHttp = (url) => {
	if (!url.startsWith('http')) {
		return `https://${url}`;
	}
	return url;
};

export default addHttp;
