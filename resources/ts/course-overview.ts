import { embedVideo } from "./embed-videos"

export default function courseOverview() {
    document.querySelectorAll('.btn--enrol').forEach(el => {
        el.addEventListener('click', () => {
            el.classList.add('btn--loading')
            el.innerHTML = 'Enrolling, please wait&hellip;'

            setTimeout(() => {
                el.setAttribute('href', '#')
            }, 100)
        })
    })

    document.querySelectorAll('.btn--unenrol')
        .forEach(element => {
            element.addEventListener('click', e => {
                if (!confirm('Are you sure you want to unenroll?  All of your current progress will be lost.')) {
                    e.preventDefault()
                }
            })
        });

    document.querySelectorAll('.course-details')
        .forEach(element => {
            // TODO: Hacky
            setTimeout(() => {
                const overview = document.querySelector('.course-overview')

                if (overview) {
                    (element as HTMLDivElement).style.minHeight = `${overview.clientHeight}px`
                }
            }, 100)
        })

    const ddActive = 'dd--visible'
    const dtActive = 'dt--visible'

    document.querySelectorAll('.hdlist1')
        .forEach(element => {
            element.addEventListener('click', e => {
                const dl = element.parentElement
                const dd = element.nextElementSibling

                dl?.querySelectorAll(`.${ddActive}`).forEach(el => el.classList.remove(ddActive))
                dl?.querySelectorAll(`.${dtActive}`).forEach(el => el.classList.remove(dtActive))

                element.classList.add(dtActive)
                dd?.classList.add(ddActive)
            })
        })

    document.querySelectorAll('.course-video[data-id]')
        .forEach((el) => {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            el.addEventListener('click', e => {
                e.preventDefault()

                embedVideo(el as HTMLDivElement, 1)
            })
        })
}
