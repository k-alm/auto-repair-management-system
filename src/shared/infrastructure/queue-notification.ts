import type { Prisma } from "@prisma/client";
import { encryptPayload } from "./secure-tokens";

export async function queueNotification(
  prisma: Prisma.TransactionClient,
  input: { recipient: string; subject: string; text: string; html: string },
) {
  await prisma.notification.create({
    data: {
      recipient: input.recipient,
      subject: input.subject,
      encryptedPayload: encryptPayload({ text: input.text, html: input.html }),
    },
  });
}
