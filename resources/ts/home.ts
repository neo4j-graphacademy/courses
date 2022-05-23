export default function home() {
    const hero = document.querySelector('.hero')
    const body = document.querySelector('body')

    if (body && hero) {
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

    // Toggle stacked cards on mobile
    const PATH_VISIBLE = 'category-path--visible'

    document.querySelectorAll('.category-path-toggle').forEach(element => {
        element.addEventListener('click', e => {
            e.preventDefault()

            element.parentElement?.classList.toggle(PATH_VISIBLE)
        })
    })

    // Lists on tablet and bigger
    const links = document.querySelectorAll('.level-nav-item')

    const LINK_ACTIVE = 'level-nav-item--active'
    const PATH_ACTIVE = 'category-path--active'

    links.forEach(parent => {
        parent.getElementsByTagName('a')[0].addEventListener('click', (e: Event) => {
            e.preventDefault()

            // Toggle link classes
            document.querySelectorAll(`.${LINK_ACTIVE}`).forEach(element => element.classList.remove(LINK_ACTIVE))
            // @ts-ignore
            parent.classList.add(LINK_ACTIVE)

            // Toggle path classes
            document.querySelectorAll(`.${PATH_ACTIVE}`).forEach(element => element.classList.remove(PATH_ACTIVE))

            // @ts-ignore
            document.getElementById(e.target.getAttribute('href').replace('#', '')).classList.add(PATH_ACTIVE)
        })
    })

    // Horizontal Controlls
    document.querySelectorAll('.horizontal-controls')
        .forEach(element => {
            const target: HTMLDivElement = element.parentElement!.querySelector('.course-list') as HTMLDivElement

            const scrollOffset = 0 // flexbox column-gap between items
            const itemCount = target.children.length || 0;

            element.querySelectorAll('.horizontal-control')!.forEach(controlElement => {
                controlElement.addEventListener('click', e => {
                    e.preventDefault()
                    const isLeftScroll = (e.currentTarget as Element).classList.contains('horizontal-control--left');

                    // Needs to be computed on click because on page load this section can be hidden under a tab leading to 0px width
                    const width = target.scrollWidth || 0;
                    const widthPerItem = width / itemCount + scrollOffset || 0;
                    const currentScroll = target.parentElement?.scrollLeft || 0;
                    const scrollMovement = isLeftScroll ? 0 - widthPerItem : widthPerItem;

                    if (target.parentElement) {
                        target.parentElement.scrollLeft = Math.floor(currentScroll / itemCount) * itemCount + scrollMovement;
                    }
                })
            })
        })
}
