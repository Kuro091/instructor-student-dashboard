import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const isTwilioConfigured =
  accountSid &&
  authToken &&
  phoneNumber &&
  accountSid.startsWith("AC") &&
  authToken.length > 0 &&
  phoneNumber.length > 0;

let twilioClient: any = null;
let TWILIO_PHONE_NUMBER: string = "";
let TWILIO_MESSAGING_SERVICE_SID: string = "";

if (isTwilioConfigured) {
  twilioClient = twilio(accountSid, authToken);
  TWILIO_PHONE_NUMBER = phoneNumber;
  TWILIO_MESSAGING_SERVICE_SID = messagingServiceSid || "";
} else {
  console.warn("⚠️  Twilio not configured - SMS features will be disabled");
  // mock client for development
  twilioClient = {
    messages: {
      create: async (params: any) => {
        console.log(`📱 Mock SMS to ${params.to}: ${params.body}`);
        return { sid: "mock-message-id" };
      },
    },
  };
  TWILIO_PHONE_NUMBER = "+1234567890";
  TWILIO_MESSAGING_SERVICE_SID = "";
}

export { twilioClient, TWILIO_PHONE_NUMBER, TWILIO_MESSAGING_SERVICE_SID };
