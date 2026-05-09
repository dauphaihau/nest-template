import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailSender } from '../../modules/infra/mail/app/ports/mail-sender';
import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class SendWelcomeEmailOnUserCreatedListener {
  private readonly logger = new Logger(
    SendWelcomeEmailOnUserCreatedListener.name,
  );

  constructor(private readonly mailSender: MailSender) {}

  @OnEvent('user.created', { async: true, suppressErrors: true })
  async handle(event: UserCreatedEvent): Promise<void> {
    await this.mailSender.send({
      to: { email: event.email, name: event.displayName },
      subject: 'Welcome',
      text: `Hello ${event.displayName ?? event.email}, your account was created.`,
      html: `<p>Hello ${event.displayName ?? event.email}, your account was created.</p>`,
      tags: ['user-created'],
    });

    this.logger.log(`Sent welcome email to ${event.email}`);
  }
}
