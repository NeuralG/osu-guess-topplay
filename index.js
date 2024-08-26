async function getToken() {
	const response = await fetch("http://localhost:3000/get-oauth-token", {
		method: "POST",
	})
	const data = await response.json()
	return data.access_token
}

async function getUserTop100(id = 13811400, mode = "osu") {
	const currentToken = await getToken()

	const response = await fetch("http://localhost:3000/get-user", {
		method: "GET",
		headers: {
			key: currentToken,
			id: id,
			mode: mode,
		},
	})

	const data = await response.json()
	return data
}

function pickRandomFromArray(arr) {
	const index = Math.floor(Math.random() * arr.length)
	return arr[index]
}

function generateMapInfos(mapObj) {
	const playInfo = {
		mapName: mapObj.beatmapset.title,
		missCount: mapObj.statistics.count_miss,
		accuracy: mapObj.accuracy * 100,
		performancePoint: mapObj.pp,
		mods: mapObj.mods,
		bgLink: mapObj.beatmapset.covers.card,
	}
	return playInfo
}

function youWin(guessCount, bgLink) {
	gameStatus = 0
	const endDialog = document.getElementById("end-dialog")
	const endImg = document.getElementById("img-end")

	endDialog.showModal()
	endDialog.classList.add("flex")

	document.getElementById("guess-count-end").innerText = guessCount + 1
	endImg.innerHTML = "<img src=" + bgLink + ">"

	endDialog.addEventListener("click", (e) => {
		const dialogDimensions = endDialog.getBoundingClientRect()
		if (
			e.clientX < dialogDimensions.left ||
			e.clientX > dialogDimensions.right ||
			e.clientY < dialogDimensions.top ||
			e.clientY > dialogDimensions.bottom
		) {
			endDialog.close()
			endDialog.classList.remove("flex")
		}
	})
}

const hint1 = document.getElementById("hint1")
const hint2 = document.getElementById("hint2")
const hint3 = document.getElementById("hint3")
const hint4 = document.getElementById("hint4")
const hint5 = document.getElementById("hint5")

const guessInput = document.getElementById("guess-input")
const guessBtn = document.getElementById("guess-btn")

const welcomeDialog = document.getElementById("welcome-dialog")
const osuIdInput = document.getElementById("osuid")
const osu = document.getElementById("osu")
const taiko = document.getElementById("taiko")
const ctb = document.getElementById("catch")
const mania = document.getElementById("mania")
const random = document.getElementById("random")
const startButton = document.getElementById("start-btn")

let gameStatus = 1

welcomeDialog.classList.add("flex")
welcomeDialog.showModal()

//dialog esc bugu düzelt

startButton.addEventListener("click", () => {
	if (osuIdInput.value == "") {
		return
	}
	const userId = osuIdInput.value
	let mode = "osu"
	if (osu.checked) {
		mode = "osu"
	}
	if (taiko.checked) {
		mode = "taiko"
	}
	if (ctb.checked) {
		mode = "fruits"
	}
	if (mania.checked) {
		mode = "mania"
	}
	if (random.checked) {
		mode = pickRandomFromArray(["osu", "taiko", "fruits", "mania"])
	}

	welcomeDialog.classList.remove("flex")
	welcomeDialog.close()

	getUserTop100(userId, mode).then((array) => {
		const { mapName, missCount, accuracy, performancePoint, mods, bgLink } =
			generateMapInfos(pickRandomFromArray(array))

		hint1.children[0].innerText = `${performancePoint.toFixed(1)}PP`

		let guessCount = 0

		function mainGame() {
			if (gameStatus && guessInput.value) {
				console.log(mapName)
				console.log(guessInput.value)
				if (mapName == guessInput.value) {
					youWin(guessCount, bgLink)
				} else if (guessCount === 0) {
					guessCount++
					hint2.classList.remove("fade")
					hint2.children[0].innerText = `${accuracy.toFixed(
						2
					)}% \nACC`
				} else if (guessCount === 1) {
					guessCount++
					hint3.classList.remove("fade")
					hint3.children[0].innerText =
						missCount == 0 ? "Full Combo" : `${missCount} misses`
				} else if (guessCount === 2) {
					guessCount++
					hint4.classList.remove("fade")
					hint4.children[0].innerText =
						mods != "" ? "+" + mods : "Nomod"
				} else if (guessCount === 3) {
					guessCount++
					hint5.removeChild(hint5.children[0])
					hint5.innerHTML = "<img src=" + bgLink + ">"
				} else {
					guessCount++
				}
				guessInput.value = ""
			}
		}

		guessBtn.addEventListener("click", mainGame)
		guessInput.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				mainGame()
			}
		})
	})
})
