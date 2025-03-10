import confetti from 'canvas-confetti';

const count = 200
const defaults = {
    zIndex: 2000,
    origin: { y: 0.7 }
}

function fire(particleRatio: number, opts: any) {
    confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
    })
}

export function celebrate() {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        })

        fire(0.2, {
            spread: 60,
        })

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        })

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        })

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        })
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        })

        fire(0.2, {
            spread: 60,
        })

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        })

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        })

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        })
    }
}