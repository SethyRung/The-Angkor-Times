export default defineAppConfig({
  ui: {
    button: {
      default: {
        size: "md",
      },
    },
    input: {
      default: {
        size: "md",
      },
    },
    textarea: {
      default: {
        size: "md",
      },
    },
    select: {
      default: {
        size: "md",
      },
    },
    navigationMenu: {
      compoundVariants: [
        {
          variant: "link",
          orientation: "horizontal",
          active: false,
          class: {
            link: "text-gray-300 hover:text-white",
          },
        },
        {
          variant: "link",
          orientation: "horizontal",
          active: true,
          class: {
            link: "text-white",
          },
        },
      ],
    },
    colors: {
      primary: "primary",
      secondary: "secondary",
    },
  },
});
