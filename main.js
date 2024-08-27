const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardMatchFailed: "CardMatchFailed",
    CardMatched: "CardMatched",
    GameFinished: "GameFinished",
}

const Symbols = [
    "./img/spade.png", // 黑桃
    "./img/heart.png", // 愛心
    "./img/diamond.png", // 方塊
    "./img/club.png", // 梅花
]

const model = {
    revealedCards: [],
    score: 0,
    triedTimes: 0,

    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    },
}

const view = {
    flipCards(...cards) {
        cards.map((card) => {
            if (card.classList.contains("back")) {
                card.classList.remove("back")
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                return
            }

            card.classList.add("back")
            card.innerHTML = null
        })
    },
    getCardElement(index) {
        return `<div class="card back" data-index="${index}"></div>`
    },
    getCardContent(index) {
        const number = this.transferNumber((index % 13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]
        return `
                <p>${number}</p>
                <img src=${symbol} />
                <p>${number}</p>
                `
    },
    transferNumber(number) {
        switch (number) {
            case 1:
                return "A"
            case 11:
                return "J"
            case 12:
                return "Q"
            case 13:
                return "K"
            default:
                return number
        }
    },
    displayCards(indexes) {
        const rootElement = document.querySelector("#cards")
        rootElement.innerHTML = indexes.map((index) => this.getCardElement(index)).join("")
    },
    pairCards(...cards) {
        cards.map((card) => {
            card.classList.add("paired")
        })
    },
    renderScore(score) {
        document.querySelector(".score").textContent = `Score: ${score}`
    },
    renderTriedTimes(times) {
        document.querySelector(".tried").textContent = `You've tried: ${times} times`
    },
    appendWrongAnimation(...cards) {
        cards.map((card) => {
            card.classList.add("wrong")
            card.addEventListener("animationend", (event) => {
                event.target.classList.remove("wrong"), { once: true }
            })
        })
    },
    showGameFinished() {
        const div = document.createElement("div")
        div.classList.add("completed")
        div.innerHTML = `
          <p>Complete!</p>
          <p>Score: ${model.score}</p>
          <p>You've tried: ${model.triedTimes} times</p>
        `
        const header = document.querySelector("#header")
        header.before(div)
    },
}

const controller = {
    currentState: GAME_STATE.FirstCardAwaits,
    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },
    dispatchCardAction(card) {
        if (!card.classList.contains("back")) return

        switch (this.currentState) {
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                break

            case GAME_STATE.SecondCardAwaits:
                view.renderTriedTimes(++model.triedTimes)
                view.flipCards(card)
                model.revealedCards.push(card)

                if (model.isRevealedCardsMatched()) {
                    view.renderScore((model.score += 10))
                    this.currentState = GAME_STATE.CardMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    if (model.score === 260) {
                        console.log("showGameFinished")
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished() // 加在這裡
                        return
                    }
                    this.currentState = GAME_STATE.FirstCardAwaits
                } else {
                    this.currentState = GAME_STATE.CardMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards, 1000)
                }
        }
        console.log("this.currentState", this.currentState)
        console.log(model.revealedCards.map((card) => card.dataset.index))
    },
    resetCards() {
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    },
}

const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        for (let index = number.length - 1; index > 0; index--) {
            let randomIndex = Math.floor(Math.random() * (index + 1))
            ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    },
}

controller.generateCards()

document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (event) => {
        controller.dispatchCardAction(card)
    })
})
