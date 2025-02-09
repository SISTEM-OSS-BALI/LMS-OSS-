import axios from "axios";

export async function sendWhatsAppMessage(
  apiKey: string,
  numberKey: string,
  phoneNo: string,
  message: string
) {
  return axios.post("https://api.watzap.id/v1/send_message", {
    api_key: apiKey,
    number_key: numberKey,
    phone_no: phoneNo,
    message,
    wait_until_send: "1",
  });
}

export function formatPhoneNumber(phone: string): string {
  return phone.startsWith("0") ? "62" + phone.slice(1) : phone;
}
