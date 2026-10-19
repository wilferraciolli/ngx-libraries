import type { Meta, StoryObj } from '@storybook/angular';
import { YoutubePlayer } from '@wiltech-labs/ngx-media';

const meta: Meta<YoutubePlayer> = {
  title: 'ngx-media/YoutubePlayer',
  component: YoutubePlayer,
  parameters: {
    docs: {
      description: {
        component: `Embeds a YouTube video by id using the privacy-enhanced \`youtube-nocookie.com\` player.

Always set \`title\` to name the video: it's the iframe's accessible name.`,
      },
    },
  },
  argTypes: {
    videoId: { description: 'The id from the YouTube URL (`watch?v=<id>`).' },
    autoplay: { description: 'Start playing on load (browsers usually require it to be muted).' },
    title: { description: 'Accessible name of the embed.' },
  },
};

export default meta;
type Story = StoryObj<YoutubePlayer>;

export const Default: Story = {
  args: { videoId: 'aqz-KE-bpKQ', title: 'Big Buck Bunny (open movie)' },
};

export const ConstrainedWidth: Story = {
  name: 'In a narrow column',
  args: { videoId: 'aqz-KE-bpKQ', title: 'Big Buck Bunny (open movie)' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 360px"><ngx-youtube-player [videoId]="videoId" [title]="title" /></div>`,
  }),
};

export const UnknownVideo: Story = {
  name: 'Unknown video id',
  parameters: {
    docs: {
      description: { story: "An id that doesn't exist shows YouTube's own unavailable message." },
    },
  },
  args: { videoId: 'does-not-exist', title: 'Missing video' },
};
