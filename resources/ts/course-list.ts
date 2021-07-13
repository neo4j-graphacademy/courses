export default function courseList() {
    document.querySelectorAll('.course-filter-title')
        .forEach(element => {
            element.addEventListener('click', event => {
                (event.target as HTMLElement).parentElement?.classList.toggle('course-filters--visible')
            })
        })

}