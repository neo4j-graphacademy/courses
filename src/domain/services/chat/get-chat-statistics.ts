import axios from "axios";

interface ChatStatistics {
    online: number;
}

const { THIRD_PARTY_UPDATE_INTERAL, DISCORD_ID } = process.env

let cache: ChatStatistics;
let updatedAt: Date;

export async function getChatStatistics(): Promise<ChatStatistics> {
    const now = new Date()

    if ( updatedAt === undefined || now.getTime() - updatedAt.getTime() > parseInt(THIRD_PARTY_UPDATE_INTERAL as string) ) {
        const res = await axios.get(`https://discord.com/api/guilds/${DISCORD_ID}/widget.json`)

        cache = {
            online: res.data.presence_count || 0
        }
        updatedAt = now
    }

    return cache
}