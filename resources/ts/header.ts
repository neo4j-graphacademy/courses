export default function header() {
    const body = document.getElementsByTagName('body')[0]!
    const hero = document.querySelector('.navbar-burger')
    const menu = document.querySelector('.navbar-menu')

    if ( hero && menu ) {
        hero.addEventListener('click', (e) => {
            body.classList.toggle('navbar--visible')
        })
    }
}