import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ModalTriggerHost } from './modal-trigger-host';
import { ApprovalModalContent } from './approval-modal-content';
import { SignupModalContent } from './signup-modal-content';
import { NodeDetailModalContent } from './node-detail-modal-content';

const meta: Meta<ModalTriggerHost> = {
  title: 'ngx-modals/Modal',
  component: ModalTriggerHost,
  decorators: [
    moduleMetadata({
      imports: [ModalTriggerHost, ApprovalModalContent, SignupModalContent, NodeDetailModalContent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `\`ModalService.open(component, config)\` opens \`component\` in a \`MatDialog\`-based panel docked to an edge of the screen — full viewport height, full screen below the CDK's \`XSmall\` breakpoint.

- The panel can only be closed via its own close button: Escape and a backdrop click are disabled, so in-progress work is never lost by accident.
- Content that implements \`ModalContent.hasUnsavedChanges()\` gets a confirm prompt before that close button actually closes it — try typing in the Approval or Sign up story below, then closing.
- \`component\` receives \`config.data\` through a \`data\` input and closes itself with a typed result via \`MatDialogRef.close(result)\`, the same way it would if opened directly — \`afterClosed()\` on the caller's side sees that result, shown below each story's button.

Each story here opens a different content component (in this folder) with a different \`ModalConfig\`.`,
      },
    },
  },
  argTypes: {
    content: { description: 'The component class to render as the modal body.' },
    config: {
      description: '`{ title?, data?, width?, side?, backdrop?, minimizable?, ariaLabel? }`.',
    },
  },
};

export default meta;
type Story = StoryObj<ModalTriggerHost>;

export const RightSideWithGuard: Story = {
  name: 'Right side, unsaved-changes guard',
  parameters: {
    docs: {
      description: {
        story:
          "Default side (right). Type a note, then click the shell's close button — the unsaved-changes prompt appears before it actually closes.",
      },
    },
  },
  args: {
    buttonLabel: 'Approve holiday request',
    content: ApprovalModalContent,
    config: { title: 'Approve holiday request', data: { employeeName: 'Priya Patel' } },
  },
};

export const LeftSide: Story = {
  name: 'Left side',
  args: {
    buttonLabel: 'Sign up (left panel)',
    content: SignupModalContent,
    config: { title: 'Sign up', side: 'left' },
  },
};

export const CustomWidth: Story = {
  name: 'Custom width',
  args: {
    buttonLabel: 'Open narrow panel',
    content: SignupModalContent,
    config: { title: 'Sign up', width: '420px' },
  },
};

export const Minimizable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Adds a minimize button: the panel shrinks to a bar at the bottom of its edge and restores from there.',
      },
    },
  },
  args: {
    buttonLabel: 'Open minimizable panel',
    content: SignupModalContent,
    config: { title: 'Sign up', minimizable: true },
  },
};

export const Modeless: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`backdrop: false` leaves the page behind the panel usable — no dimming, no click-blocking, page scroll kept. For a panel that sits beside the content it describes, like an org chart node's details.",
      },
    },
  },
  args: {
    buttonLabel: 'Open node details (modeless)',
    content: NodeDetailModalContent,
    config: {
      title: 'Node details',
      backdrop: false,
      data: { name: 'Priya Patel', role: 'Engineering Manager' },
    },
  },
};

export const NoTitle: Story = {
  name: 'No title',
  args: {
    buttonLabel: 'Open untitled panel',
    content: NodeDetailModalContent,
    config: { ariaLabel: 'Node details', data: { name: 'Sam Lee', role: 'Designer' } },
  },
};
