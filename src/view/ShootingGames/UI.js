

class UI {
    constructor(game) {
        const playBtn = document.getElementById('playBtn')
        playBtn.addEventListener('click',this.playBtnPressed.bind(this))

        this.game = game
    }

    set visible(value) {
        const playBtn = document.getElementById('playBtn')
        const ui = document.getElementById('ui')
        const display = (value) ? 'block' : 'none'
        playBtn.style.display = display
        ui.style.display = display
    }

    playBtnPressed() {

    }

    showGameOver() {

    }

    set ammo(value) {
        const progressBar = document.getElementsByName('ammoBar')[0]
        progressBar.style.width = `${value * 100}%`
    }

    set health(value) {
        const progressBar = document.getElementsByName('healthBar')[0]
        progressBar.style.width = `${value * 100}%`
    }

}


export {UI}
