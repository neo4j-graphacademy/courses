import { User } from '../../../domain/model/user';
import { getChatbotDriver } from '../chatbot.driver';
import { CHATBOT_NEO4J_DATABASE } from '../../../constants';
import { notify } from '../../../middleware/bugsnag.middleware';

export default async function provideFeedback(
  user: User,
  messageId: string,
  helpful: boolean,
  reason: string | null = null,
  additional: string | null = null,
): Promise<{ errors?: Record<string, any>, success?: boolean }> {
  try {
    // Validation
    const errors: Record<string, any> = {};
    if (!messageId || messageId === '') errors.messageId = 'Message ID is required.';
    if (typeof helpful !== 'boolean') errors.helpful = 'Helpful flag must be a boolean.';
    if (Object.keys(errors).length > 0) return { errors };

    const label = helpful ? 'PositiveFeedback' : 'NegativeFeedback';

    const driver = await getChatbotDriver();

    const feedbackQuery = `
      MATCH (:User {sub: $sub})-[:HAS_CONVERSATION]->()-[:HAS_MESSAGE]->(m:CheckpointMessage {id: $id})
      SET m:${label},
          m.feedbackReason = $reason,
          m.feedbackAdditional = $additional,
          m.feedbackReceivedAt = datetime()
      RETURN m.id as messageId
    `;

    const result = await driver.executeQuery(feedbackQuery, {
      sub: user.sub,
      id: messageId,
      helpful,
      reason,
      additional
    }, { 
      database: CHATBOT_NEO4J_DATABASE,
      routing: 'WRITE'
    });

    if (result.records.length === 0) {
      return { errors: { message: 'Message not found.' } };
    }

    return { success: true };
  } catch (e: any) {
    notify(e);
    return { errors: { general: 'Internal server error' } };
  }
}
