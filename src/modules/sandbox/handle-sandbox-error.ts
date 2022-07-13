import { User } from "@bugsnag/js";
import { AxiosError } from "axios";
import { notify } from "../../middleware/bugsnag.middleware";
import { SandboxBadRequestError } from "./sandbox-bad-request.error";
import { SandboxForbiddenError } from "./sandbox-forbidden.error";
import { SandboxServerError } from "./sandbox-server.error";
import { SandboxUnknownError } from "./sandbox-unknown.error";

export async function handleSandboxError(token: string, user: User, endpoint: string, error: any) {
    let output: Error

    const code = error.response?.status

    switch (code) {
        case 400:
            output = new SandboxBadRequestError(endpoint, error)
            break
        case 403:
            output = new SandboxForbiddenError(endpoint, error)
            break
        case 500:
        case 502:
            output = new SandboxServerError(endpoint, error)

        default:
            output = new SandboxUnknownError(endpoint, error)

    }

    // Notify Bugsnag
    notify(output, event => {
        event.setUser(user.id, user.email, user.name)

        event.addMetadata('auth', {
            token,
        })

        event.addMetadata('request', {
            data: error.request.data,
            headers: error.request.headers,
            status: error.request.status,
            statusText: error.request.statusText,
        })

        if (error.response) {
            event.addMetadata('response', {
                data: error.response.data,
                headers: error.response.headers,
                status: error.response.status,
                statusText: error.response.statusText,
            })
        }
    })

    return output
}
