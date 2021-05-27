
import axios from 'axios'

export function createElement(element: string, classes: string, children?: Array<HTMLElement | Text | string>) {
    const output = document.createElement(element)
    output.setAttribute('class', classes)

    children?.forEach(child => {
        if (typeof child === 'string') {
            child = document.createTextNode(child)
        }

        output.appendChild(child)
    })

    return output
}

interface Question {
    parent: Element;
    element: Element,
    id: string;
    type: 'freetext' | string;
    options: Option[] | undefined;
}

interface Option {
    element: Element,
    value: string;
    correct: boolean;
}

const CORRECT_INDICATOR = '✓'
const INCORRECT_INDICATOR = '❏'
const ADMONITION_VISIBLE = 'admonition--visible'
const ADMONITION_SHOW = 'admonition-show'
const ADMONITION_SHOW_VISIBLE = 'admonition-show--visible'

const QUESTION_SELECTOR_FREE_TEXT = 'freetext'
const QUESTION_CORRECT = 'question--correct'
const QUESTION_INCORRECT = 'question--incorrect'
const QUESTION_SELECTOR_SELECT_IN_SOURCE = 'select-in-source'
const QUESTION_SELECTOR_INPUT_IN_SOURCE = 'input-in-source'

const OPTION_CORRECT = 'question-option--correct'
const OPTION_INCORRECT = 'question-option--incorrect'

const COMMENT_SELECTOR = 'hljs-comment'
const COMMENT_SELECTOR_SELECT_PREFIX = '/*select'
const COMMENT_SELECTOR_INPUT_PREFIX = '/*input'

const ANSWER_TYPE_FREETEXT = 'freetext'
const ANSWER_TYPE_CHECKED = 'checked'

const BUTTON_LOADING = 'btn--loading'

const extractAnswersFromBlock = (div: Element): Option[] => {
    return Array.from(div.querySelectorAll('ul li'))
        .map((element: any) => ({
            element,
            value: element.textContent!.replace(CORRECT_INDICATOR, '').replace(INCORRECT_INDICATOR, '').replace(/^\s+|\s+$/g, ''),
            correct: element.textContent!.includes(CORRECT_INDICATOR),
        }))
}

const getQuestionDetails = (element: Element): Question => {
    const parent = element.parentElement as Element

    const question = element.querySelector('h3, h2')
    const id = question?.getAttribute('id')!

    return {
        parent,
        element,
        id,
        type: element.classList.contains(QUESTION_SELECTOR_FREE_TEXT) || element.classList.contains(QUESTION_SELECTOR_INPUT_IN_SOURCE) ? ANSWER_TYPE_FREETEXT : ANSWER_TYPE_CHECKED,
        options: undefined,
    }
}

const addHintListeners = (element: Element): void => {
    element.querySelectorAll('.admonition')
        .forEach(block => {
            const parent = block.parentElement

            const show = createElement('button', ADMONITION_SHOW, ['Show Hint'])
            show.addEventListener('click', e => {
                e.preventDefault()

                block.classList.add(ADMONITION_VISIBLE)
                show.classList.remove(ADMONITION_SHOW_VISIBLE)
            })

            parent?.insertBefore(show, block)
        })
}

const formatSelectionQuestion = async (element: Element): Promise<Question> => {
    const { id, type, parent, } = getQuestionDetails(element)

    const options: Option[] = extractAnswersFromBlock(element)

    const multiple = options.filter(answer => answer.correct).length > 1

    options.map(answer => {
        const input = createElement('input', '')
        input.setAttribute('id', `${id}--${answer.value}`)
        input.setAttribute('name', <string>id)
        input.setAttribute('value', answer.value)
        input.setAttribute('type', multiple ? 'checkbox' : 'radio')

        const label = createElement('label', 'question-option-label', [
            input,
        ])

        // Remove old nodes
        while (answer.element.hasChildNodes()) {
            const cloned = answer.element.childNodes[0].cloneNode(true)

            // TODO: Hacky
            if (cloned.nodeType != cloned.TEXT_NODE) {
                // @ts-ignore
                cloned.innerHTML = cloned.innerHTML.replace(CORRECT_INDICATOR, '').replace(INCORRECT_INDICATOR, '')
            }

            label.appendChild(cloned)
            answer.element.removeChild(answer.element.childNodes[0])
        }

        // Add the checkbox
        answer.element.classList.add('question-option')
        answer.element.appendChild(
            label
        )
    })

    // Add a 'show hint' link
    addHintListeners(element)

    return {
        id,
        type,
        element,
        parent,
        options,
    }
}

const formatSelectInSourceQuestion = async (element: Element): Promise<Question> => {
    const { id, type, parent, } = getQuestionDetails(element)

    // Get options from checklist
    const options: Option[] = extractAnswersFromBlock(element)

    // Remove checklist
    element.querySelectorAll('.checklist').forEach(el => {
        el.parentElement!.removeChild(el)
    })

    // Create <select>
    const select = createElement('select', 'select-in-source-select', options.map(option => {
        const el = createElement('option', '', [option.value.trim()])

        el.setAttribute('value', option.value)

        return el
    }))

    // Insert blank item at the top
    const blank = document.createElement('option')
    blank.selected = true
    select.insertBefore(blank, select.children[0])

    select.setAttribute('id', id)
    select.setAttribute('name', <string>id)

    // Place <select> in the source block
    Array.from(element.querySelectorAll(`.${COMMENT_SELECTOR}`))
        .filter(el => el.innerHTML.startsWith(COMMENT_SELECTOR_SELECT_PREFIX))
        .forEach(el => {
            const parent = el.parentElement!
            parent.insertBefore(select, el)
            parent.removeChild(el)
        })

    return {
        parent,
        element,
        id,
        type,
        options,
    } as Question
}

const formatInputInSourceQuestion = async (element: Element): Promise<Question> => {
    const { id, type, parent, } = getQuestionDetails(element)

    // Get options from checklist
    const options: Option[] = extractAnswersFromBlock(element)

    // Remove checklist
    element.querySelectorAll('.checklist').forEach(el => {
        el.parentElement!.removeChild(el)
    })

    // Create <input>
    const input = createElement('input', 'input-in-source-select')


    // // Insert blank item at the top
    // const blank = document.createElement('option')
    // blank.selected = true
    // select.insertBefore(blank, select.children[0])

    input.setAttribute('id', id)
    input.setAttribute('name', <string>id)

    // Place <select> in the source block
    Array.from(element.querySelectorAll(`.${COMMENT_SELECTOR}`))
        .filter(el => el.innerHTML.startsWith(COMMENT_SELECTOR_INPUT_PREFIX))
        .forEach(el => {
            const parent = el.parentElement!
            parent.insertBefore(input, el)
            parent.removeChild(el)
        })

    return {
        parent,
        element,
        id,
        type,
        options,
    } as Question
}

const formatFreeTextQuestion = async (element: Element): Promise<Question> => {
    const options: Option[] = extractAnswersFromBlock(element)

    // Remove Answers
    element.querySelectorAll('.checklist').forEach(el => {
        el.parentElement!.removeChild(el)
    })

    return {
        ...getQuestionDetails(element),
        options,
    }
}

const formatQuestion = async (div: Element): Promise<Question> => {
    if (div.classList.contains(QUESTION_SELECTOR_SELECT_IN_SOURCE)) {
        return formatSelectInSourceQuestion(div)
    }
    else if (div.classList.contains(QUESTION_SELECTOR_INPUT_IN_SOURCE)) {
        return formatInputInSourceQuestion(div)
    }
    else if (div.classList.contains(QUESTION_SELECTOR_FREE_TEXT)) {
        return formatFreeTextQuestion(div)
    }

    return formatSelectionQuestion(div)
}

const LESSON_OUTCOME_SELECTOR = 'lesson-outcome'
const LESSON_OUTCOME_PASSED = 'lesson-outcome--passed'
const LESSON_OUTCOME_FAILED = 'lesson-outcome--failed'

const handleResponse = (parent, button, res, showHint = false) => {
    parent.querySelectorAll(`.${LESSON_OUTCOME_SELECTOR}`)
        .forEach(el => parent.removeChild(el))

    if (res.data.completed) {
        parent.removeChild(button)

        if (res.data.next) {
            // Next Link
            const link = createElement('a', 'lesson-outcome-progress', [
                res.data.next.title
            ])
            link.setAttribute('href', res.data.next.link)

            parent.appendChild(createElement('div', `admonition admonition--tip ${LESSON_OUTCOME_SELECTOR} ${LESSON_OUTCOME_PASSED}`, [
                createElement('h3', 'admonition-title', ['Well done!']),
                createElement('p', '', [
                    'You are now ready to progress to the next lesson: ',
                    link,
                ])
            ]))
        }
        else {
            // Course completed
            parent.appendChild(createElement('div', `admonition admonition--tip ${LESSON_OUTCOME_SELECTOR} ${LESSON_OUTCOME_PASSED}`, [
                createElement('h3', 'admonition-title', ['Congratulations!']),
                createElement('p', '', [
                    'You have completed this lesson!',
                ])
            ]))
        }
    }
    else {
        let children: any[] = ['It looks like you haven\'t passed the test, please try again.']

        // Show hint text?
        if (parent.querySelector('.admonition')) {
            children = children.concat(
                'If you are still stuck, try clicking the ',
                createElement('strong', '', ['Show Hint']),
                ' button'
            )
        }

        parent.appendChild(createElement('div', `admonition admonition--danger ${LESSON_OUTCOME_SELECTOR} ${LESSON_OUTCOME_FAILED}`, [



            createElement('h3', 'admonition-title', ['Oops!']),
            createElement('p', '', children)
        ]))

        if (showHint) {
            // Show hints links
            parent.querySelectorAll(`.${ADMONITION_SHOW}`)
                .forEach((element) => {
                    element.classList.add(ADMONITION_SHOW_VISIBLE)
                })
        }
    }
}

const handleError = (parent, button, error) => {
    parent.querySelectorAll(`.${LESSON_OUTCOME_SELECTOR}`)
        .forEach(el => parent.removeChild(el))

    parent.appendChild(createElement('div', `admonition admonition--danger ${LESSON_OUTCOME_SELECTOR} ${LESSON_OUTCOME_FAILED}`, [
        createElement('h3', 'admonition-title', ['Error!']),
        createElement('p', '', [
            error.message,
        ])
    ]))

    button.classList.remove()

}

const setupQuestions = async () => {
    const questions: Question[] = await Promise.all(
        Array.from(document.querySelectorAll<Element>('.question'))
            .map(div => formatQuestion(div))
    )

    if (questions.length) {
        const parent = questions[0].parent;
        const button = createElement('button', 'btn btn-submit', [
            `Check Answer${questions.length > 1 ? 's' : ''}`
        ])

        parent.appendChild(button)

        button.addEventListener('click', (e) => {
            e.preventDefault()

            // Gather answers
            const answers = questions.map(question => {
                let answers: string[] = [];

                if (question.type === ANSWER_TYPE_FREETEXT) {
                    answers = <string[]>Array.from(question.element.querySelectorAll('input'))
                        .map(input => input.value)
                        .filter(value => value && value !== '')

                }
                else {
                    answers = <string[]>Array.from(document.querySelectorAll(`input[name="${question.id}"]:checked, select[name="${question.id}"] option:checked`))
                        .map(element => element.getAttribute('value'))
                        .filter(value => !!value)
                }

                if (!answers.length) return

                // @ts-ignore
                const correctOptions = question.options.filter(option => option.correct).map(option => option.value)

                return {
                    id: question.id,
                    answers,
                    correct: answers.length === correctOptions.length && answers.every(answer => correctOptions.includes(answer!)),
                }
            })
                .filter(e => !!e)

            if (answers.length === 0) {
                return
            }

            // Apply Progress
            answers.map(answer => {
                const question = questions.find(question => question!.id === answer!.id)!

                if (answer!.correct) {
                    // Set class on question
                    question.element.classList.add(QUESTION_CORRECT)
                    question.element.classList.remove(QUESTION_INCORRECT)
                }
                else {
                    // Set class on question
                    question.element.classList.add(QUESTION_INCORRECT)
                    question.element.classList.remove(QUESTION_CORRECT)

                    // Show hints links
                    question.element.querySelectorAll(`.${ADMONITION_SHOW}`)
                        .forEach((element) => {
                            element.classList.add(ADMONITION_SHOW_VISIBLE)
                        })
                }

                // Set option classes
                // @ts-ignore
                question.options.map(option => {
                    const selected = answer!.answers.includes(option.value)
                    const correct = option.correct

                    if (selected && correct) {
                        option.element.classList.add(OPTION_CORRECT)
                        option.element.classList.remove(OPTION_INCORRECT)

                    }
                    else if (selected && !correct) {
                        option.element.classList.remove(OPTION_CORRECT)
                        option.element.classList.add(OPTION_INCORRECT)
                    }
                    else {
                        option.element.classList.remove(OPTION_CORRECT)
                        option.element.classList.remove(OPTION_INCORRECT)
                    }

                })
            })

            // Send Progress to API
            button.classList.add('btn--loading')

            axios.post(document.location.pathname, answers)
                .then(res => handleResponse(parent, button, res))
                .finally(() => {
                    button.classList.remove('btn--loading')
                })
        })
    }
}

const setupVerify = () => {
    Array.from(document.querySelectorAll('.verify'))
        .map((element: Element) => {
            addHintListeners(element)

            const button = element.querySelector('input[type="button"]')
            button?.addEventListener('click', e => {
                e.preventDefault()

                button.classList.add(BUTTON_LOADING)

                axios.post(`${document.location.pathname}verify`)
                    .then(res => handleResponse(element.parentElement, element, res, true))
                    .catch(e => handleError(element.parentElement, element, e))
                    .finally(() => {
                        button.classList.remove(BUTTON_LOADING)
                    })
            })
        })
}

const setupMarkAsReadButton = () => {
    Array.from(document.querySelectorAll('input[name="read"]'))
        .map((button: Element) => {
            button.addEventListener('click', e => {
                e.preventDefault()

                axios.post(`${document.location.pathname}read`)
                    .then(res => handleResponse(button.parentElement, button, res, true))
                    .catch(e => handleError(button.parentElement, button, e))
                    .finally(() => {
                        button.classList.remove(BUTTON_LOADING)
                    })
            })
        })
}

export default function questions() {
    setupVerify()
    setupMarkAsReadButton()
    setupQuestions()
}