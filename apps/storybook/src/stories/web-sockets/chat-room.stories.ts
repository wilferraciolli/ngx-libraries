import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChatRoom } from '@wiltech-labs/ngx-web-sockets';
import { fakeWebSocketProvider } from './fake-web-socket-service';

const meta: Meta<ChatRoom> = {
  title: 'ngx-web-sockets/ChatRoom',
  component: ChatRoom,
  decorators: [moduleMetadata({ providers: [fakeWebSocketProvider()] })],
  parameters: {
    docs: {
      description: {
        component: `Joins \`roomName\` on init, leaves it on destroy, connecting the shared \`WebSocketService\` first if it isn't already. Manages exactly one room for its lifetime — render a fresh instance to switch rooms.

There's no real Socket.IO backend for this to connect to (the same reason \`apps/showcase\` doesn't wire \`ChatRoom\` in either — see that package's own \`CLAUDE.md\`). This story instead overrides \`WebSocketService\` at the component level with \`FakeWebSocketService\` (in this folder), which scripts a "client connected" status message shortly after mount and echoes a canned reply back whenever you send a message — enough to show the whole flow (connecting, status messages, sending, receiving) without a server.

Type in the composer and press Enter (or the send button) to see a reply arrive a moment later.`,
      },
    },
  },
  argTypes: {
    roomName: { description: 'The room to join.' },
    clientName: { description: "This client's display name, sent with every message it posts." },
  },
};

export default meta;
type Story = StoryObj<ChatRoom>;

export const Default: Story = {
  args: { roomName: 'general', clientName: 'You' },
};

export const TwoParticipants: Story = {
  name: 'Two rooms side by side',
  parameters: {
    docs: {
      description: {
        story:
          'Two independent `ChatRoom` instances, each with its own fake connection and reply timers — sending in one never affects the other.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="Story-row" style="align-items: flex-start">
        <ngx-chat-room roomName="support" clientName="Priya" />
        <ngx-chat-room roomName="sales" clientName="Sam" />
      </div>`,
  }),
};
