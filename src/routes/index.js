const router = require("express").Router();

router.get("/", (req, res) => {
	return res.send({ name:"David Nelson", title: "Source to Test the API" })
});

module.exports = router;