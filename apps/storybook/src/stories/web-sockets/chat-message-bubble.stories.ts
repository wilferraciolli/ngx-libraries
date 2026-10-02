import type { Meta, StoryObj } from '@storybook/angular';
import { ChatMessageBubble, ChatMessageType } from '@wiltech-labs/ngx-web-sockets';
import type { ChatMessage } from '@wiltech-labs/ngx-web-sockets';

const baseMessage = (overrides: Partial<ChatMessage>): ChatMessage => ({
  id: '1',
  clientId: 'user-a',
  clientName: 'Ada Lovelace',
  roomName: 'general',
  messageType: ChatMessageType.COMMENT_ADDED,
  message: 'Has anyone looked at the renewal pricing yet?',
  timestamp: new Date().toISOString(),
  ...overrides,
});

const meta: Meta<ChatMessageBubble> = {
  title: 'ngx-web-sockets/ChatMessageBubble',
  component: ChatMessageBubble,
  parameters: {
    docs: {
      description: {
        component: `One chat message, styled as "mine" or "theirs" by comparing \`clientId\` (the viewer's own id) against \`message.clientId\` (who sent it). Timestamps render via \`Temporal\`.

\`ChatRoom\`, the component that actually connects over a socket, needs a live \`WebSocketService\` backend (see the package's own \`CLAUDE.md\`) and isn't in this catalogue yet — a fake socket service is planned (see \`docs/Storybook.md\` phase 8). This bubble has no socket dependency of its own, so it's shown here on its own.`,
      },
    },
  },
  argTypes: {
    clientId: {
      description: 'The viewer\'s own client id — determines the "mine" vs "theirs" styling.',
    },
    message: { description: 'The message to render.' },
  },
};

export default meta;
type Story = StoryObj<ChatMessageBubble>;

export const OwnMessage: Story = {
  name: 'Own message',
  args: { clientId: 'user-a', message: baseMessage({ clientId: 'user-a' }) },
};

export const OtherPersonsMessage: Story = {
  name: "Other person's message",
  args: {
    clientId: 'user-a',
    message: baseMessage({
      clientId: 'user-b',
      clientName: 'Grace Hopper',
      message: 'Not yet — checking with finance now.',
    }),
  },
};

export const LongMessage: Story = {
  name: 'Long message (wraps)',
  args: {
    clientId: 'user-a',
    message: baseMessage({
      clientId: 'user-b',
      clientName: 'Grace Hopper',
      message:
        'The renewal pricing for the Northwind account needs a second look before it goes out — the discount tier looks off compared to last quarter, and I want finance to confirm before we send anything to the customer.',
    }),
  },
};

export const Conversation: Story = {
  name: 'A short conversation',
  render: () => ({
    props: {
      clientId: 'user-a',
      messages: [
        baseMessage({
          id: '1',
          clientId: 'user-b',
          clientName: 'Grace Hopper',
          message: 'Has the renewal gone out yet?',
        }),
        baseMessage({
          id: '2',
          clientId: 'user-a',
          message: 'Not yet, double-checking the discount tier first.',
        }),
        baseMessage({
          id: '3',
          clientId: 'user-b',
          clientName: 'Grace Hopper',
          message: 'Good call, saw the same thing.',
        }),
      ],
    },
    template: `
      <div class="Story-stack">
        @for (m of messages; track m.id) {
          <ngx-chat-message-bubble [clientId]="clientId" [message]="m" />
        }
      </div>`,
  }),
};
