export function post(url: string, formData: Record<string, any> = {}) {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    }).then(async (res) => {
        // Check if response has content and is JSON
        const contentType = res.headers.get('content-type')
        const hasJsonContent = contentType && contentType.includes('application/json')
        const text = await res.text()

        if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`)
        }

        // If there's no content or it's not JSON, return empty data
        if (!text || !hasJsonContent) {
            return { data: null }
        }

        try {
            return { data: JSON.parse(text) }
        } catch (e) {
            // If JSON parsing fails, return the text as data
            return { data: text }
        }
    })
}
