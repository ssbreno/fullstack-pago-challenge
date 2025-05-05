import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { Page } from './Page';
import { expect } from '@storybook/test';

const meta = {
  title: 'Example/Page',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const LoggedIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole('button', { name: /Log in/i });
    
    // Click the login button
    await userEvent.click(loginButton);
    
    // Verify logout button appears
    const logoutButton = canvas.getByRole('button', { name: /Log out/i });
    await expect(logoutButton).toBeTruthy();
  },
};