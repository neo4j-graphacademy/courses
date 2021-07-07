export default function home() {
    const hero = document.querySelector('.hero')
    const body = document.querySelector('body')

    if ( body && hero ) {
        setTimeout(() => body.classList.remove('preload'), 4000)

        window.onscroll = (e) => {
            const height = hero.clientHeight
            const scroll = window.pageYOffset

            if (scroll > height) {
                body.classList.remove('transparent-nav')
                body.classList.add('past-hero')
            }
            else {
                body.classList.add('transparent-nav')
                body.classList.remove('past-hero')
            }

        }
    }

    const PATH_VISIBLE = 'category-path--visible'
    // const paths = document.querySelectorAll('.category-path')

    document.querySelectorAll('.category-path-toggle').forEach(element => {
        element.addEventListener('click', e => {
            e.preventDefault()


            element.parentElement?.classList.toggle(PATH_VISIBLE)

            // paths.forEach(el => {
            //     if (el !== element.parentElement) {
            //         el.classList.remove(PATH_VISIBLE)
            //     }
            // })
        })
    })
}
