import Parser from 'rss-parser'
import { COMMUNITY_RSS_URL } from '../../../constants';
import { notify } from '../../../middleware/bugsnag.middleware';
import { Topic } from '../../model/topic';

const { THIRD_PARTY_UPDATE_INTERAL } = process.env

let topics: Topic[] = []
let updatedAt: Date;

interface RssItem {
    title?: string;
    link?: string;
    description?: string;
    pubDate?: string;
    guid?: string;
    ['dc:creator']?: string;
    ['dc:date']?: string;
}

export async function getCommunityTopics(): Promise<Topic[]> {
    if ( typeof COMMUNITY_RSS_URL !== 'string' ) {
        return Promise.resolve([])
    }

    const now = new Date()

    if ( updatedAt === undefined || now.getTime() - updatedAt.getTime() > parseInt(THIRD_PARTY_UPDATE_INTERAL as string) ) {
        try {
            const parser = new Parser<Record<string, any>, RssItem>({
                customFields: {
                    item: ['description'],
                }
            })
            const feed = await parser.parseURL(COMMUNITY_RSS_URL!)

            topics = feed.items.slice(0, 5)
                .map(item => ({
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    author: item['dc:creator'],
                    publishedAt: new Date(item.pubDate!),
                } as Topic))
        }
        catch(e) {
            notify(e as Error)
        }

        updatedAt = now
    }

    return topics
}