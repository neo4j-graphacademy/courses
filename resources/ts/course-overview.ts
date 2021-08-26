export default function courseOverview() {
    document.querySelectorAll('.course-unenrol-link')
        .forEach(element => {
            element.addEventListener('click', e => {
                if ( !confirm('Are you sure you want to unenroll?  All of your current progress will be lost.')) {
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
}