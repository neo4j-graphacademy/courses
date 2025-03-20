export const CLASSROOM_SLIDES_VISIBLE = 'lesson--slides-visible';
const SLIDE_VISIBLE = 'slide--visible';

let slideIndex = 0;
let slideElements: HTMLDivElement[] = []
let previousSlide: HTMLButtonElement | null = null
let nextSlide: HTMLButtonElement | null = null

function setCurrentSlide(index: number) {
  slideIndex = index;
  const current = document.querySelector('.slide-number-current')
  if (current) {
    current.textContent = (slideIndex + 1).toString()

    slideElements.forEach((slide, idx) => {
      // display active index
      if (idx === slideIndex) {
        slide.classList.add(SLIDE_VISIBLE)
      } else {
        // hide all of the others
        slide.classList.remove(SLIDE_VISIBLE)
      }
    })

    // disable previous button if on first slide
    if (previousSlide) {
      if (slideIndex === 0) {
        previousSlide.classList.add('slide-control--disabled')
      } else {
        previousSlide.classList.remove('slide-control--disabled')
      }
    }

    if (nextSlide) {
      // disable next button if on last slide
      if (slideIndex === slideElements.length - 1) {
        nextSlide.classList.add('slide-control--disabled')
      } else {
        nextSlide.classList.remove('slide-control--disabled')
      }
    }
  }
}

export default function slides() {
  const body = document.querySelector<HTMLBodyElement>('body');

  // if (body?.classList.contains('lesson--slides')) {
  if (body && document.querySelector('.slide')) {
    const slidesButton = document.querySelectorAll('.classroom-slides-toggle');

    slidesButton.forEach((button) => {
      button.addEventListener('click', () => {
        body.classList.toggle(CLASSROOM_SLIDES_VISIBLE);
      });
    });

    // Get total slide elements
    slideElements = Array.from(document.querySelectorAll('.slide'))

    // set total slide count
    const total = document.querySelector('.slide-number-total')
    if (total) {
      total.textContent = slideElements.length.toString()
    }
    // set first slide to active
    setCurrentSlide(0)

    // go to next slide
    previousSlide = document.querySelector('.slide-control-previous')
    previousSlide?.addEventListener('click', () => {
      if (slideIndex > 0) {
        setCurrentSlide(slideIndex - 1)
      }
    })

    nextSlide = document.querySelector('.slide-control-next')
    nextSlide?.addEventListener('click', () => {
      if (slideIndex < slideElements.length - 1) {
        setCurrentSlide(slideIndex + 1)
      }
    })

    // Close button
    const closeButton = document.querySelector('.slide-close-button')

    closeButton?.addEventListener('click', () => {
      body.classList.remove(CLASSROOM_SLIDES_VISIBLE)
    })

    // Close slides when .classroom-content is clicked, but not when a child element is clicked
    const classroomContent = document.querySelector('.classroom-content')
    classroomContent?.addEventListener('click', (event) => {
      if (event.target === classroomContent) {
        body.classList.remove(CLASSROOM_SLIDES_VISIBLE)
      }
    })

    // Open slides on CMD + K or CTRL + K
    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === '/')) {
        body.classList.toggle(CLASSROOM_SLIDES_VISIBLE)
      }
    })

    // Listen for ESC press and close slides
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        body.classList.remove(CLASSROOM_SLIDES_VISIBLE)
      }
    })

    // Listen for arrow keys
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        if (slideIndex > 0) {
          setCurrentSlide(slideIndex - 1)
        }
      }

      if (event.key === 'ArrowRight') {
        // If ctrl/cmd is pressed, go to next page
        if (event.metaKey || event.ctrlKey) {
          const nextLink = document.querySelector('.pagination-link--next > a') as HTMLAnchorElement;
          if (nextLink) {
            window.location.href = nextLink.href;
          }
        } else {
          if (slideIndex < slideElements.length - 1) {
            setCurrentSlide(slideIndex + 1);
          }
        }
      }
    })

    // Use number keys to navigate slides
    document.addEventListener('keydown', (event) => {
      const key = parseInt(event.key, 10);
      if (!isNaN(key) && key >= 1 && key <= slideElements.length) {
        setCurrentSlide(key - 1);
      }
    })
  }
}
