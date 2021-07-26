export default function account() {
    document.querySelectorAll('#delete .btn--danger').forEach(el => {
        el.addEventListener('click', e => {
            if ( !confirm('Are you sure you want to delete your account?  This action cannot be undone!') ) {
                e.preventDefault()
            }
        })
    })
}