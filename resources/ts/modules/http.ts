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
    })
    .then(res => res.json())
    .then(data => ({ data }))
}