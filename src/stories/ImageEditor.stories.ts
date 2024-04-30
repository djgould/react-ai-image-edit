import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AIEdit from "../index";

const meta = {
  title: "Example/ImageEditor",
  component: AIEdit,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
} satisfies Meta<typeof AIEdit>;

export default meta;

export const Primary: StoryObj<typeof AIEdit> = {
  args: {
    src: "https://images.unsplash.com/photo-1499561385668-5ebdb06a79bc?q=80&w=2969&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
};
