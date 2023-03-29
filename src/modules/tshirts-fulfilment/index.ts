import { User } from '@bugsnag/js'
import { GoogleAuth } from 'google-auth-library'
import { google } from 'googleapis'
import { GOOGLE_KEY_FILE, TSHIRT_SHEET_ID } from '../../constants'
import { Reward } from '../../domain/services/rewards/get-rewards'
import Recipient from '../printful/recipient.class'
import { Order, OrderProvider, OrderStatus, Variant } from '../printful/types'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let client: GoogleAuth

export async function appendOrderToGoogleSheet(user: User, reward: Reward, storeId: string, recipient: Recipient, variant: Variant, quantity: number): Promise<Order | any> {
    if (!client) {
        client = new google.auth.GoogleAuth({
            scopes: SCOPES,
            keyFile: GOOGLE_KEY_FILE,
        });
    }

    const sheets = google.sheets({ version: 'v4', auth: client });

    const res = await sheets.spreadsheets.values.append({
        spreadsheetId: TSHIRT_SHEET_ID as string,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        range: 'IN!A2:Z2',
        requestBody: {
            values: [
                [
                    recipient.name,
                    recipient.address1,
                    recipient.address2,
                    recipient.city,
                    recipient.state_name || recipient.state_code,
                    recipient.zip,
                    recipient.country_name || recipient.country_code,
                    recipient.email,
                    recipient.phone,
                    variant.name,
                    quantity,
                    reward.id,
                    new Date().toISOString(),
                    OrderStatus.pending,
                    // user.id, user.name, user.email,
                    // reward.slug, reward.title,
                    // recipient.name, recipient.address1, recipient.address2, recipient.city, recipient.state_code, recipient.state_name,
                    // recipient.country_code, recipient.country_name, recipient.zip, recipient.email, recipient.phone, recipient.company,
                    // recipient.tax_number,
                    // variant.id, variant.name,
                    // quantity
                ]
            ]
        }
    })

    return {
        id: reward.id,
        provider: OrderProvider.India,
        status: OrderStatus.pending,
        costs: {
            total: 'NA',
        },
        created: Date.now(),
        recipient,
    }
}
