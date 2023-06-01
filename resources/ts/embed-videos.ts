import { logUiEvent } from "./modules/events";

function embedVideo(element: HTMLDivElement) {
    const { id: videoId, width, height } = element.dataset

    element.setAttribute('id', videoId as string)

    // @ts-ignore
    new YT.Player(videoId, {
        width,
        height,
        videoId,
        playerVars: {
            playsinline: 1,
            rel: 0,
            controls: 0,
            modestbranding: 1,
        },
        events: {
            onStateChange: (event) => {
                switch (event.data) {
                    // @ts-ignore
                    case YT.PlayerState.UNSTARTED: // -1
                        break;
                    // @ts-ignore
                    case YT.PlayerState.ENDED: // 0
                        logUiEvent('video-ended', { videoId })
                        break;
                    // @ts-ignore
                    case YT.PlayerState.PLAYING: // 1
                        logUiEvent('video-playing', { videoId })
                        break;

                    // @ts-ignore
                    case YT.PlayerState.PAUSED: // 2
                        const time = event.target.getCurrentTime()
                        logUiEvent('video-paused', { videoId, time })
                        break;
                    // @ts-ignore
                    case YT.PlayerState.BUFFERING: // 3
                        break;

                    // @ts-ignore
                    case YT.PlayerState.CUED: // 5
                        break;
                }
            }
        }
    })
}

function sleep(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 500))
}

async function waitForYT(): Promise<void> {
    // @ts-ignore
    if (window.YT) {
        return Promise.resolve()
    }

    await sleep()

    return waitForYT()
}

export default async function embedVideos() {
    const videos = Array.from(document.querySelectorAll('.video[data-id]'))

    if (videos.length) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];

        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        await waitForYT()

        videos.map(video => embedVideo(video as HTMLDivElement))
    }
}