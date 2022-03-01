const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');

const router = Router();

router.get(
	'/',

	(req, res) => {
		console.log(uuidv4());
		return res.json({ msg: 'weeena' });
	}
);

module.exports = router;
