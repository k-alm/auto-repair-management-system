import type { FastifyInstance } from "fastify";
import nodemailer from "nodemailer";
import { env } from "@/config/env";
import { decryptPayload } from "./secure-tokens";

type EmailPayload = { text: string; html: string };

async function deliverNext(
  fastify: FastifyInstance,
  transporter: ReturnType<typeof nodemailer.createTransport>,
) {
  const now = new Date();
  const notification = await fastify.prisma.notification.findFirst({
    where: {
      status: "PENDING",
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
  });
  if (!notification) return false;

  const claimed = await fastify.prisma.notification.updateMany({
    where: {
      id: notification.id,
      status: "PENDING",
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    data: { status: "PROCESSING", attempts: { increment: 1 } },
  });
  if (claimed.count !== 1) return true;

  try {
    const payload = decryptPayload<EmailPayload>(notification.encryptedPayload);
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: notification.recipient,
      subject: notification.subject,
      text: payload.text,
      html: payload.html,
    });
    await fastify.prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date(), lastError: null },
    });
    return true;
  } catch {
    const attempts = notification.attempts + 1;
    await fastify.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: attempts >= 10 ? "FAILED" : "PENDING",
        lastError: "Falha na entrega da notificação",
        nextAttemptAt:
          attempts >= 10 ? null : new Date(Date.now() + Math.min(60, 2 ** attempts) * 1000),
      },
    });
    fastify.log.error({ notificationId: notification.id }, "Falha ao enviar notificação");
    return false;
  }
}

export function notificationWorker(fastify: FastifyInstance) {
  if (!env.SMTP_HOST) {
    fastify.log.warn("SMTP_HOST não configurado; notificações serão mantidas pendentes");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  let running = false;

  const dispatch = async () => {
    if (running) return;
    running = true;
    try {
      while (await deliverNext(fastify, transporter)) {}
    } catch (error) {
      fastify.log.error({ err: error }, "Falha ao processar fila de notificações");
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void dispatch(), 5000);
  timer.unref();
  fastify.addHook("onReady", dispatch);
  fastify.addHook("onClose", async () => clearInterval(timer));
}
