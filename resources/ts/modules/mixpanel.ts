export function track(event: string, data: Record<string, any>) {
    // @ts-ignore
    window.mixpanel?.track(event, data)
}