import { Bold } from "./blocks/Bold";
import { Code } from "./blocks/Code";
import { Image } from "./blocks/Image";
import { Todo } from "./blocks/Todo";
import { YouTube } from "./blocks/YouTube";
import type { Rule } from "./parser";

export const rules: Rule[] = [
  {
    match: /\`([^\`]*)\`/,
    processor(matched, position) {
      return {
        type: "CODE",
        meta: {
          component: Code,
          props: {
            content: matched[1],
          },
        },
        position,
        matched,
      };
    },
  },
  {
    match: /\*\*([^\*]*)\*\*/,
    processor(matched, position) {
      return {
        type: "BOLD",
        meta: {
          component: Bold,
          props: {
            content: matched[1],
          },
        },
        position,
        matched,
      };
    },
  },
  {
    match: /\{\{\{TODO\}\}\}/,
    processor(matched, position) {
      return {
        type: "TODO",
        meta: {
          component: Todo,
          props: {
            checked: false,
          },
        },
        position,
        matched,
      };
    },
  },
  {
    match: /\{\{\{DONE\}\}\}/,
    processor(matched, position) {
      return {
        type: "DONE",
        meta: {
          component: Todo,
          props: {
            checked: true,
          },
        },
        position,
        matched,
      };
    },
  },
  {
    match: /!\[([^\]]*?)]\(([^\)]+)\)/,
    processor(matched, position) {
      return {
        type: "IMAGE",
        meta: {
          component: Image,
          props: {
            alt: matched[1],
            url: matched[2],
          },
        },
        position,
        matched,
      };
    },
  },
  {
    match: /{{youtube: ([^}]+)}}/,
    processor(matched, position) {
      return {
        type: "YOUTUBE",
        meta: {
          component: YouTube,
          props: {
            link: matched[1],
          },
        },
        position,
        matched,
      };
    },
  },
];
