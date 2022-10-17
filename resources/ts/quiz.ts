import { post } from "./modules/http";
import { displayCourseCompleted, getQuestionsOnPage, handleShowHints } from "./questions";

export default function quiz() {
    const body = document.querySelector('body')

    if (!body?.classList.contains('quiz')) {
        return;
    }

    const intro = document.querySelector('.quiz-intro')
    const start = document.getElementById('start-quiz')
    const questionWrapper = document.querySelector('.quiz-questions')
    const questionNumber = document.querySelector('.question-number') as HTMLSpanElement
    const progressBar = document.querySelector('.progress-bar-container span') as HTMLSpanElement

    if (!intro || !start) {
        return
    }

    // Get question list
    const questions = Array.from(document.querySelectorAll('.question'))
    questions.sort(() => Math.random() > .5 ? -1 : 1)

    const answers: any[] = []

    const totalQuestions = questions.length

    let currentQuestion
    let currentAttempts = 0

    const setProgress = () => {
        const currentQuestionNumber = totalQuestions - questions.length
        const progress = (currentQuestionNumber) / totalQuestions

        // Set current question number
        questionNumber.innerText = currentQuestionNumber.toString()
        progressBar.style.width = `${Math.max(progress, 0.02) * 100}%`
    }

    const removeCurrentQuestion = () => {
        document.querySelectorAll('.question--current')
            .forEach(el => el.remove())
    }

    const nextQuestion = (e: any = undefined) => {
        e && e.preventDefault()

        intro.remove()

        removeCurrentQuestion()

        currentQuestion = questions.pop()
        currentAttempts = 0

        questionWrapper?.classList.add('quiz-questions--visible')
        currentQuestion?.classList.add('question--current')

        setProgress()
    }

    start.addEventListener('click', nextQuestion)


    const checkAnswerButton = document.getElementById('check-answer') as HTMLButtonElement

    checkAnswerButton.addEventListener('click', e => {
        e.preventDefault()

        currentAttempts++
        const questionDetails = getQuestionsOnPage().find(question => question.element == currentQuestion)

        const responses = Array.from(currentQuestion.querySelectorAll(`input:checked, select option:checked`))
            .map((element: any) => element.getAttribute('value'))
            .filter(value => !!value)
            .map(value => value!.trim())

        const correctAnswers = questionDetails!.options?.filter(option => option.correct).map(option => option.value) || []

        const correct = responses.length && correctAnswers.every(answer => responses?.includes(answer))


        if (!correct) {
            handleShowHints(currentQuestion)
        }
        else {
            answers.push({
                question: questionDetails?.question,
                correct,
                answers: responses,
                attempts: currentAttempts,
            })

            if (questions.length === 0) {
                handleCompletion()
            }
            else {
                nextQuestion()
            }

        }

    })

    const handleCompletion = async () => {
        // Remove Unwanted elements
        setProgress()
        removeCurrentQuestion()
        document.querySelector('.quiz-submit')?.remove()

        try {
            const res = await post(`./`, {
                answers,
            })

            if (res.data.message) {
                // TODO: More robust error handling
                return document.location.reload()
            }

            displayCourseCompleted(res)
        }
        catch (e) {
            // TODO: More robust error handling
            // document.location.reload()
            console.log(e);

        }
    }

}
