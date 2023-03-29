declare global {
    interface Window {
        env: 'dev' | undefined;
        user?: { sub: string, id: string };
        analytics: {
            course: Record<string, any>;
            module: Record<string, any>;
            lesson: Record<string, any>;
            user: Record<string, any>;
        };

        i18n: {
            feedbackFollowup: string;
            feedbackThankyou: string;
            missing: string;
            hardToFollow: string;
            inaccurate: string;
            other: string;
            moreInformation: string;
            feedbackSubmit: string;
            feedbackSkip: string;
            advanceTo: string;
            [key: string]: any;
        }
    }
}

const hideFeedback = (el: HTMLDivElement) => {
    el.parentElement?.removeChild(el)
}
const thankyou = (el: HTMLDivElement) => {
    el.classList.remove('feedback--negative')
    el.classList.add('feedback--positive')

    el.innerHTML = `<div class="feedback-header thank-you-positive"><p><strong>${window.i18n.feedbackThankyou}</strong></p></div>`
}

const sendFeedback = (helpful, reason: string | undefined = undefined, additional: string | undefined = undefined) => {
    fetch(`${document.location.protocol}//${document.location.host}${document.location.pathname}feedback`, {
        method: 'post',
        body: JSON.stringify({ helpful, reason, additional }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
}

const isHelpful = (el: HTMLDivElement) => {
    sendFeedback(true)

    el.querySelector('.helpful-form')?.classList.add('hidden')
    el.classList.add('feedback--positive')

    thankyou(el)

}

const isUnhelpful = (el: HTMLDivElement) => {
    el.querySelector('.helpful-form')?.classList.add('hidden')
    el.classList.add('feedback--negative')

    const unhelpful = document.createElement('div')
    unhelpful.classList.add('unhelpful-form')

    unhelpful.innerHTML = `<form class="form">
    <div class="feedback-header">
      <p><strong>${window.i18n.feedbackFollowup}</strong></p>
      <svg width="14px" height="22px" viewBox="0 0 22 22" role="button" class="cancel" aria-label="Cancel Feedback">
        <line x1="19.5833333" y1="0.416666667" x2="0.416666667" y2="19.5833333"></line>
        <line x1="19.5833333" y1="19.5833333" x2="0.416666667" y2="0.416666667"></line>
      </svg>
    </div>
    <div>
      <input id="missing" type="radio" class="feedback-option" data-reason="missing" name="specific" value="missing" checked="true">
      <label for="missing">${window.i18n.missing}</label>
    </div>
    <div>
      <input id="hard-to-follow" type="radio" class="feedback-option" data-reason="hard-to-follow" name="specific" value="hard-to-follow">
      <label for="hard-to-follow">${window.i18n.hardToFollow}</label>
    </div>
    <div>
      <input id="inaccurate" type="radio" class="feedback-option" data-reason="inaccurate" name="specific" value="inaccurate">
      <label for="inaccurate">I${window.i18n.inaccurate}</label>
    </div>
    <div>
        <input id="other" type="radio" class="feedback-option" data-reason="other" name="specific" value="other">
        <label for="other">${window.i18n.other}</label>
    </div>
    <div class="more-information"><label for="more-information"><strong>${window.i18n.moreInformation}</strong></label><textarea
        id="more-information" type="text" rows="3" cols="50" name="more-information" style="resize:none" required></textarea>
    </div>
    <div class="buttons"><input type="button" class="btn btn-primary submit" data-submit="submit" value="${window.i18n.feedbackSubmit}"><input
        type="button" class="btn btn-secondary cancel" data-submit="skip" value="${window.i18n.feedbackSkip}"></div>
    </div>
  </form>
  `

    el.appendChild(unhelpful)

    el.querySelectorAll('.cancel').forEach(cancel => {
        cancel.addEventListener('click', () => reset(el as HTMLDivElement))
    })

    el.querySelector('.submit')?.addEventListener('click', e => {
        e.preventDefault()

        const reason = el.querySelector('input[name="specific"]:checked') as HTMLInputElement
        const additional = el.querySelector('textarea[name="more-information"]') as HTMLInputElement

        if ((!additional.value || additional.value.trim() === '') || additional.value.length <= 5) {
            if (!additional.parentElement?.querySelector('.error')) {
                const error = document.createElement('div')

                error.setAttribute('for', 'more-information')
                error.classList.add('error')
                error.innerText = 'Please provide more information on how we could improve this page.'

                additional.parentElement?.appendChild(
                    error
                )
            }
            return
        }

        sendFeedback(false, reason.value, additional.value)

        thankyou(el)
    })

}

const reset = (el: HTMLDivElement) => {
    el.querySelector('.helpful-form')?.classList.remove('hidden')
    const unhelpful = el.querySelector('.unhelpful-form')
    if (unhelpful) {
        el.removeChild(unhelpful)
    }
}

export default function feedback() {
    document.querySelectorAll('.feedback')
        .forEach((element: any) => {
            const yes = element.querySelector('.yes')
            const no = element.querySelector('.no')

            if (yes && no) {
                yes.addEventListener('click', e => {
                    e.preventDefault()
                    isHelpful(element as HTMLDivElement)
                })
                no.addEventListener('click', e => {
                    e.preventDefault()
                    isUnhelpful(element as HTMLDivElement)
                })
            }
        })
}