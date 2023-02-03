import { logUiEvent } from "./modules/events";

function embedVideo(element: HTMLDivElement) {
    const { id: videoId, width, height } = element.dataset

    element.setAttribute('id', videoId as string)

    // @ts-ignore
    const player = new YT.Player(videoId, {
        width,
        height,
        videoId,
        playerVars: {
            'playsinline': 1
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

export default function embedVideos() {
    const videos = Array.from(document.querySelectorAll('.video[data-id]'))

    if (videos.length) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];

        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        setTimeout(() => {

            videos.map(video => embedVideo(video as HTMLDivElement))

        }, 200)

    }
}