/**
 * AegroShield Multi-Channel Notification Engine (SMS & WhatsApp)
 *
 * Supports Indian & Global Notification Gateways:
 * - SMS: Fast2SMS, MSG91, Twilio
 * - WhatsApp: WhatsApp Cloud API (Meta Graph), Generic Webhook (AiSensy/Wati/Gupshup)
 * - Development Simulator / Fallback Logger
 *
 * Resilience: All alerts are non-blocking (fire-and-forget safe) so gateway latency
 * or outages never disrupt core order or booking transactions.
 */

import axios from 'axios';
import * as Sentry from '@sentry/nextjs';

export interface OrderAlertPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod?: string;
  itemCount: number;
  sellerPhones?: string[];
}

export interface BookingAlertPayload {
  bookingId: string;
  serviceType: 'MACHINERY' | 'LABOUR';
  itemName: string;
  farmerName: string;
  farmerPhone: string;
  ownerPhone?: string;
  duration?: string;
  totalAmount: number;
}

export interface SellerVerifiedPayload {
  sellerName: string;
  sellerPhone: string;
  storeName: string;
}

/**
 * Standardize Indian phone number to 10 digits
 */
export function sanitizeIndianPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits.slice(-10);
}

/**
 * Low-level dispatch to external SMS/WhatsApp providers
 */
async function sendRawNotification(phone: string, message: string, channel: 'SMS' | 'WHATSAPP' = 'SMS'): Promise<boolean> {
  const cleanPhone = sanitizeIndianPhone(phone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    console.warn(`[Notification] Invalid phone number skipped: "${phone}"`);
    return false;
  }

  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  const msg91Key = process.env.MSG91_AUTH_KEY;
  const whatsappApiUrl = process.env.WHATSAPP_WEBHOOK_URL;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_PHONE;

  let dispatched = false;

  // 1. WhatsApp Webhook / Cloud API
  if (channel === 'WHATSAPP' && whatsappApiUrl) {
    try {
      await axios.post(whatsappApiUrl, {
        to: `+91${cleanPhone}`,
        message,
        timestamp: new Date().toISOString(),
      }, { timeout: 4000 });
      dispatched = true;
      console.log(`[Notification/WhatsApp] Alert dispatched to +91${cleanPhone}`);
    } catch (err: any) {
      console.warn(`[Notification/WhatsApp] Webhook failed, falling back to SMS:`, err?.message);
    }
  }

  // 2. Fast2SMS (India Quick SMS)
  if (!dispatched && fast2smsKey) {
    try {
      await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'q',
          message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        },
        {
          headers: { authorization: fast2smsKey },
          timeout: 4000,
        }
      );
      dispatched = true;
      console.log(`[Notification/Fast2SMS] SMS sent to ${cleanPhone}`);
    } catch (err: any) {
      console.error(`[Notification/Fast2SMS] Gateway error:`, err?.response?.data || err?.message);
    }
  }

  // 3. MSG91 Gateway
  if (!dispatched && msg91Key) {
    try {
      await axios.post(
        'https://api.msg91.com/api/v2/sendsms',
        {
          sender: process.env.MSG91_SENDER_ID || 'AGRSHL',
          route: '4',
          country: '91',
          sms: [{ message, to: [cleanPhone] }],
        },
        {
          headers: { authkey: msg91Key, 'content-type': 'application/json' },
          timeout: 4000,
        }
      );
      dispatched = true;
      console.log(`[Notification/MSG91] SMS sent to ${cleanPhone}`);
    } catch (err: any) {
      console.error(`[Notification/MSG91] Gateway error:`, err?.response?.data || err?.message);
    }
  }

  // 4. Twilio Gateway
  if (!dispatched && twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams({
        To: `+91${cleanPhone}`,
        From: twilioFrom,
        Body: message,
      });

      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 4000,
        }
      );
      dispatched = true;
      console.log(`[Notification/Twilio] SMS sent to +91${cleanPhone}`);
    } catch (err: any) {
      console.error(`[Notification/Twilio] Gateway error:`, err?.response?.data || err?.message);
    }
  }

  // 5. Development / Fallback Logger
  if (!dispatched) {
    console.log(
      `\n================================================================` +
      `\n🔔 [AEGROSHIELD ALERT SIMULATOR (${channel})] -> +91 ${cleanPhone}` +
      `\n----------------------------------------------------------------` +
      `\n${message}` +
      `\n================================================================\n`
    );
    dispatched = true;
  }

  return dispatched;
}

/**
 * 1. Order Placed Alert (Farmer & Seller)
 */
export async function sendOrderPlacedAlert(payload: OrderAlertPayload): Promise<void> {
  try {
    const { orderId, customerName, customerPhone, totalAmount, paymentMethod, itemCount, sellerPhones } = payload;
    const shortOrderId = orderId.slice(-6).toUpperCase();

    // A. Farmer Message
    const farmerMessage =
      `🌾 AegroShield Order Confirmed!\n` +
      `Namaste ${customerName || 'Kisan Bhai'}, aapka Order #${shortOrderId} confirm ho gaya hai.\n` +
      `📦 Items: ${itemCount}\n` +
      `💰 Total: ₹${totalAmount.toLocaleString('en-IN')}\n` +
      `💳 Payment: ${paymentMethod || 'Cash on Delivery'}\n` +
      `Track on: https://aegroshield.vercel.app/farmer/home`;

    await sendRawNotification(customerPhone, farmerMessage, 'SMS');

    // B. Seller Alerts
    if (sellerPhones && sellerPhones.length > 0) {
      const uniqueSellers = [...new Set(sellerPhones.map(sanitizeIndianPhone))].filter(Boolean);
      for (const sellerPhone of uniqueSellers) {
        const sellerMessage =
          `🛒 AegroShield New Order Alert!\n` +
          `Aapki dukan par naya order #${shortOrderId} prapt hua hai.\n` +
          `Customer: ${customerName || 'Farmer'}\n` +
          `Kripya dispatch ke liye dashboard check karein: https://aegroshield.vercel.app/vendor/dashboard`;

        await sendRawNotification(sellerPhone, sellerMessage, 'SMS');
      }
    }
  } catch (error: any) {
    console.error('[Notification] Failed to send order placed alerts:', error?.message || error);
    Sentry.captureException(error, { tags: { service: 'notification', type: 'order_placed' } });
  }
}

/**
 * 2. Machinery & Labour Booking Alert (Farmer & Provider)
 */
export async function sendBookingConfirmedAlert(payload: BookingAlertPayload): Promise<void> {
  try {
    const { bookingId, serviceType, itemName, farmerName, farmerPhone, ownerPhone, duration, totalAmount } = payload;
    const shortBookingId = bookingId.slice(-6).toUpperCase();
    const serviceLabel = serviceType === 'MACHINERY' ? '🚜 Machinery Rental' : '👥 Labour Team';

    // A. Farmer Message
    const farmerMessage =
      `🌱 AegroShield Booking Confirmed!\n` +
      `Namaste ${farmerName || 'Kisan Bhai'}, aapki ${serviceLabel} booking (#${shortBookingId}) confirm ho gayi hai.\n` +
      `Service: ${itemName}\n` +
      `Duration: ${duration || 'As requested'}\n` +
      `Estimated Amount: ₹${totalAmount.toLocaleString('en-IN')}\n` +
      `Owner aapse jald hi sampark karenge.`;

    await sendRawNotification(farmerPhone, farmerMessage, 'SMS');

    // B. Owner / Labour Contractor Message
    if (ownerPhone) {
      const ownerMessage =
        `🚜 AegroShield New Booking Alert!\n` +
        `Aapke ${itemName} ke liye nayi booking (#${shortBookingId}) aayi hai.\n` +
        `Farmer: ${farmerName || 'Customer'} (Ph: ${farmerPhone})\n` +
        `Details ke liye AegroShield dashboard check karein.`;

      await sendRawNotification(ownerPhone, ownerMessage, 'SMS');
    }
  } catch (error: any) {
    console.error('[Notification] Failed to send booking confirmed alerts:', error?.message || error);
    Sentry.captureException(error, { tags: { service: 'notification', type: 'booking_confirmed' } });
  }
}

/**
 * 3. Seller Verification Approved Alert
 */
export async function sendSellerVerifiedAlert(payload: SellerVerifiedPayload): Promise<void> {
  try {
    const { sellerName, sellerPhone, storeName } = payload;
    const message =
      `🎉 Badhaai Ho! AegroShield Verification Approved.\n` +
      `Namaste ${sellerName || 'Dealer'}, aapki agri-store "${storeName}" ko AegroShield par officially verify kar diya gaya hai.\n` +
      `Ab aap pan-India kisaano ko products sell kar sakte hain.\n` +
      `Products list karein: https://aegroshield.vercel.app/vendor/dashboard`;

    await sendRawNotification(sellerPhone, message, 'SMS');
  } catch (error: any) {
    console.error('[Notification] Failed to send seller verified alert:', error?.message || error);
    Sentry.captureException(error, { tags: { service: 'notification', type: 'seller_verified' } });
  }
}
