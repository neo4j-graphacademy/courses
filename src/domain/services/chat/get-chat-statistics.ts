// import axios from "axios";

interface ChatStatistics {
    online: number;
}

const { THIRD_PARTY_UPDATE_INTERAL, DISCORD_ID } = process.env

let cache: ChatStatistics;
let updatedAt: Date;

export async function getChatStatistics(): Promise<ChatStatistics> {
    if ( DISCORD_ID === undefined ) {
        return { online: 0 }
    }

    try {
        const now = new Date()

        if ( updatedAt === undefined || now.getTime() - updatedAt.getTime() > parseInt(THIRD_PARTY_UPDATE_INTERAL as string) ) {
            const response = await fetch(`https://discord.com/api/guilds/${DISCORD_ID}/widget.json`)
            const data = await response.json()

            cache = {
                online: data.presence_count || 0
            }
            updatedAt = now
        }
    }
    catch(e) {
        // Do nothing...
    }

    return cache
}