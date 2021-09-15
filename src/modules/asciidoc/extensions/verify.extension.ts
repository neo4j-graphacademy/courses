export function verifyBlockProcessor(registry: any) {
    const svg = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3.25C6.41421 3.25 6.75 2.91421 6.75 2.5V1C6.75 0.585786 6.41421 0.25 6 0.25C5.58579 0.25 5.25 0.585786 5.25 1V2.5C5.25 2.91421 5.58579 3.25 6 3.25Z" fill="black"/>
    <path d="M4.13406 3.05305L3.07306 1.99255C2.77589 1.71033 2.30973 1.71033 2.01256 1.99255C1.71977 2.28543 1.71977 2.76018 2.01256 3.05305L3.07356 4.11355C3.21405 4.25447 3.40507 4.33333 3.60406 4.33255C3.90698 4.33208 4.17988 4.14943 4.29581 3.86957C4.41173 3.58971 4.34792 3.26758 4.13406 3.05305Z" fill="black"/>
    <path d="M0.25 6C0.25 6.41421 0.585786 6.75 1 6.75H2.5C2.91421 6.75 3.25 6.41421 3.25 6C3.25 5.58579 2.91421 5.25 2.5 5.25H1C0.585786 5.25 0.25 5.58579 0.25 6Z" fill="black"/>
    <path d="M3.47867 7.76202C3.27984 7.76127 3.08898 7.84013 2.94867 7.98102L1.88767 9.04202C1.6092 9.33763 1.61662 9.80118 1.90439 10.0877C2.19217 10.3743 2.65575 10.3797 2.95017 10.1L4.01117 9.03902C4.2251 8.82442 4.28888 8.50218 4.17282 8.22227C4.05677 7.94236 3.78368 7.75979 3.48067 7.75952L3.47867 7.76202Z" fill="black"/>
    <path d="M5.25 11C5.25 11.4142 5.58579 11.75 6 11.75C6.41421 11.75 6.75 11.4142 6.75 11V9.5C6.75 9.08579 6.41421 8.75 6 8.75C5.58579 8.75 5.25 9.08579 5.25 9.5V11Z" fill="black"/>
    <path d="M8.02428 8.00297C7.73149 8.29585 7.73149 8.7706 8.02428 9.06347L9.08528 10.124C9.3784 10.4179 9.85432 10.4186 10.1483 10.1255C10.4422 9.83235 10.4429 9.35643 10.1498 9.06247L9.08628 7.99997C8.94517 7.85931 8.7539 7.78057 8.55465 7.78113C8.35541 7.78169 8.16458 7.86151 8.02428 8.00297Z" fill="black"/>
    <path d="M11.75 6C11.75 5.58579 11.4142 5.25 11 5.25H9.5C9.08579 5.25 8.75 5.58579 8.75 6C8.75 6.41421 9.08579 6.75 9.5 6.75H11C11.4142 6.75 11.75 6.41421 11.75 6Z" fill="black"/>
    <path d="M9.52103 1.70496C9.32219 1.70421 9.13133 1.78307 8.99103 1.92396L7.93103 2.98396C7.79012 3.12465 7.71094 3.31559 7.71094 3.51471C7.71094 3.71383 7.79012 3.90478 7.93103 4.04546C8.2239 4.33825 8.69865 4.33825 8.99153 4.04546L10.052 2.98546C10.2667 2.77089 10.3309 2.44806 10.2147 2.16767C10.0984 1.88728 9.82457 1.70462 9.52103 1.70496Z" fill="black"/>
    </svg>`

    registry.blockMacro(function () {
        // @ts-ignore
        const self: any = this

        self.named('verify')
        self.process(function(parent: any, target: any, attrs: any) {
            const input = `
                <button class="btn btn-submit btn-verify">
                    <span class="loading-indicator">${svg}</span>
                    <span class="btn-label">${target !== '' ? target : 'Check Database'}</span>
                </button>
            `

            return self.createBlock(parent, 'pass', input)
        })
    })

    registry.blockMacro(function () {
        // @ts-ignore
        const self: any = this

        self.named('read')
        self.process(function(parent: any, target: any, attrs: any) {
            const input = `
                <button class="btn btn-submit btn-read">
                    <span class="loading-indicator">${svg}</span>
                    <span class="btn-label">${target !== '' ? target : 'Mark As Read'}</span>
                </button>
            `

            return self.createBlock(parent, 'pass', input)
        })
    })
}