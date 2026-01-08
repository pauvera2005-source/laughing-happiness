const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}
resize()
window.addEventListener("resize", resize)

const startOverlay = document.getElementById("start")
const gameOverOverlay = document.getElementById("gameover")
const scoreEl = document.getElementById("score")

let running = false
let score = 0
let speed = 2
let columns = []

const virus = {
    x: 100,
    y: canvas.height / 2,
    size: 12,
    velocity: 0
}

let tiltY = 0

const chars = "01PAUVERADATAHACKER"

window.addEventListener("deviceorientation", e => {
    tiltY = e.gamma || 0
})

window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") virus.velocity = -3
    if (e.key === "ArrowDown") virus.velocity = 3
})

async function requestStart() {
    if (running) return

    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission !== "granted") return
    }

    startGame()
}

window.addEventListener("touchstart", requestStart, { once: true })
window.addEventListener("click", requestStart, { once: true })

function startGame() {
    running = true
    score = 0
    speed = 2
    columns = []
    virus.y = canvas.height / 2
    startOverlay.style.display = "none"
    gameOverOverlay.style.display = "none"
    loop()
}

function endGame() {
    running = false
    gameOverOverlay.style.display = "flex"
}

function createColumn() {
    const gap = 160
    const top = Math.random() * (canvas.height - gap)

    columns.push({
        x: canvas.width,
        top,
        bottom: top + gap
    })
}

function drawMatrixColumn(x, yStart, yEnd) {
    for (let y = yStart; y < yEnd; y += 16) {
        const c = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(c, x, y)
    }
}

function loop() {
    if (!running) return

    ctx.fillStyle = "rgba(0,0,0,0.2)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = "14px Share Tech Mono"

    virus.velocity = tiltY * 0.15
    virus.y += virus.velocity
    virus.y = Math.max(0, Math.min(canvas.height, virus.y))

    if (columns.length === 0 || columns[columns.length - 1].x < canvas.width - 220) {
        createColumn()
    }

    columns.forEach(col => {
        col.x -= speed

        ctx.fillStyle = "#0f0"
        drawMatrixColumn(col.x, 0, col.top)
        drawMatrixColumn(col.x, col.bottom, canvas.height)

        if (
            virus.x > col.x &&
            virus.x < col.x + 20 &&
            (virus.y < col.top || virus.y > col.bottom)
        ) {
            endGame()
        }
    })

    columns = columns.filter(c => c.x > -40)

    ctx.fillStyle = "#f00"
    ctx.beginPath()
    ctx.arc(virus.x, virus.y, virus.size, 0, Math.PI * 2)
    ctx.fill()

    score++
    speed += 0.0005
    scoreEl.textContent = score

    requestAnimationFrame(loop)
}
