export default function exam() {
  const body = document.querySelector('body')

  if (!body?.classList.contains('layout--exam')) {
    return;
  }

  const submit = document.querySelector('.btn--primary')

  if (submit) {
    submit.setAttribute('disabled', 'disabled')

    document.querySelectorAll('input, textarea, select').forEach(
      el =>
        el.addEventListener('change', () => {
          submit.removeAttribute('disabled')
          submit.classList.remove('btn--hidden')
        })
    )
  }

  const remaining = document.querySelector('.progress-remaining')

  if (remaining !== undefined && typeof remaining?.getAttribute('data-expires') === 'string') {
    const expires = new Date(remaining.getAttribute('data-expires') as string)

    let timeout

    const pad = (input: number) => ('00' + input).slice(-2)

    const calculateRemaining = () => {
      const now = new Date()
      const time = new Date(now.toUTCString()).getTime()

      const difference = expires.getTime() - time

      if (difference < 0) {
        clearInterval(timeout)
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      remaining.innerHTML = `${pad(minutes)}:${pad(seconds)}`
    }

    timeout = setInterval(calculateRemaining, 1000)
    calculateRemaining()
  }
}
