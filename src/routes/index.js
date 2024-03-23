const router = require("express").Router();

router.get("/", (req, res) => {
	return res.send({ name:"SpaceBank-API, designed by Wiley", title: "Source to Test the API" })
});


module.exports = router;