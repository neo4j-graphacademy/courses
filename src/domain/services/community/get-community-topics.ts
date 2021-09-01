import axios from 'axios'
import { COMMUNITY_POSTS } from '../../../constants';
import { Topic } from '../../model/topic';

const { THIRD_PARTY_UPDATE_INTERAL } = process.env

let topics: Topic[] = []
let updatedAt: Date;

export async function getCommunityTopics(): Promise<Topic[]> {
    const now = new Date()

    if ( updatedAt === undefined || now.getTime() - updatedAt.getTime() > parseInt(THIRD_PARTY_UPDATE_INTERAL as string) ) {
        const res = await axios.get(COMMUNITY_POSTS)

        topics = res.data.topic_list.topics.filter((topic: Topic) => topic.pinned === false && topic.closed === false)
            .slice(0, 5)
        updatedAt = now
    }

    return topics
}