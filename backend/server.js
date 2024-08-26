const express = require("express")
const axios = require("axios")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(cors())

app.post("/get-oauth-token", async (req, res) => {
	const client_id = 34412
	const client_secret = "E2xfngzdAModufS118h06QXvPUX4vsZT7WdHCsfu"

	const data = new URLSearchParams({
		client_id: client_id,
		client_secret: client_secret,
		grant_type: "client_credentials",
		scope: "public",
	})

	const response = await axios.post(
		"https://osu.ppy.sh/oauth/token",
		data.toString(),
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		}
	)

	res.json(response.data)
})

app.get("/get-user", async (req, res) => {
	const url = new URL(
		"https://osu.ppy.sh/api/v2/users/" + req.headers.id + "/scores/best"
	)

	const params = {
		legacy_only: "1",
		include_fails: "0",
		mode: req.headers.mode,
		limit: "100",
		offset: "0",
	}
	Object.keys(params).forEach((key) =>
		url.searchParams.append(key, params[key])
	)

	const token = req.headers.key

	const headers = {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
		Accept: "application/json",
	}

	const response = await fetch(url, {
		method: "GET",
		headers,
	})
	const data = await response.json()
	res.json(data)
})

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`)
})
