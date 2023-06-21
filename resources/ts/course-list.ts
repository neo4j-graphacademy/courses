export default function courseList() {
    document.querySelectorAll('.secondary-nav-title')
        .forEach(element => {
            element.addEventListener('click', event => {
                (event.target as HTMLElement).parentElement?.classList.toggle('secondary-nav--visible')
            })
        })

    document.querySelectorAll('.progress-indicator')
        .forEach(element => {
            const circle = element.querySelector('.progress-indicator__circle') as SVGCircleElement
            const percent = parseInt(element.getAttribute('data-value') || '0')

            if (circle) {
                const radius = circle.r.baseVal.value;
                const circumference = radius * 2 * Math.PI;

                const offset = circumference - percent / 100 * circumference;

                circle.style.strokeDasharray = `${circumference} ${circumference}`;
                circle.style.strokeDashoffset = offset.toFixed(2);
            }
        })

}