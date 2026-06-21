import {
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { headingRecipe } from "./recipes/headingRecipe";
import { buttonRecipe } from "./recipes/buttonRecipe";

const config = defineConfig({
  globalCss: {
    body: {
      fontSize: "1rem",
      transitionProperty: "background-color, color",
      transitionDuration: "0.2s",
      margin: 0,
      minHeight: "100vh",
    },
    h1: {
      ...headingRecipe.base,
      ...headingRecipe.variants?.size.xxl,
    },
    h2: {
      ...headingRecipe.base,
      ...headingRecipe.variants?.size.xl,
    },
    h3: {
      ...headingRecipe.base,
      ...headingRecipe.variants?.size.lg,
    },
    h4: {
      ...headingRecipe.base,
      ...headingRecipe.variants?.size.sm,
    },
    h5: {
      ...headingRecipe.base,
      ...headingRecipe.variants?.size.xs,
    },
    h6: {
      ...headingRecipe.base,
      ...headingRecipe.variants?.size.xs,
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: "Georgia, 'Times New Roman', serif",
        },
        body: {
          value:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          body: {
            default: { value: "#FAF7F0" },
            _dark: { value: "#161218" },
          },
          surface: {
            default: { value: "#FFFDF8" },
            _dark: { value: "#211A24" },
          },
          muted: {
            default: { value: "#F1EDE4" },
            _dark: { value: "#2A2230" },
          },
          input: {
            default: { value: "#FFFCF6" },
            _dark: { value: "#1B151E" },
          },
        },
        text: {
          primary: {
            default: { value: "#29202B" },
            _dark: { value: "#F6F0E8" },
          },
          secondary: {
            default: { value: "#6E6470" },
            _dark: { value: "#C9BFCB" },
          },
        },
        border: {
          muted: {
            default: { value: "#E6DED1" },
            _dark: { value: "#3A303F" },
          },
        },
        accent: {
          solid: {
            default: { value: "#2D8C84" },
            _dark: { value: "#5AB8AE" },
          },
          hover: {
            default: { value: "#24766F" },
            _dark: { value: "#4AA79E" },
          },
          subtle: {
            default: { value: "#E1F0ED" },
            _dark: { value: "#193C3A" },
          },
          border: {
            default: { value: "#A8D3CE" },
            _dark: { value: "#2F6964" },
          },
          focus: {
            default: { value: "#2D8C84" },
            _dark: { value: "#67C8BF" },
          },
          contrast: {
            default: { value: "#FFFDF8" },
            _dark: { value: "#161218" },
          },
          "1": {
            default: { value: "#2D8C84" },
            _dark: { value: "#5AB8AE" },
          },
        },
        chip: {
          bg: {
            default: { value: "rgba(255, 253, 248, 0.68)" },
            _dark: { value: "rgba(33, 26, 36, 0.68)" },
          },
        },
        nav: {
          bg: {
            default: { value: "rgba(250, 247, 240, 0.86)" },
            _dark: { value: "rgba(22, 18, 24, 0.86)" },
          },
        },
      },
    },
    recipes: {
      heading: headingRecipe,
      button: buttonRecipe,
    },
  },
});

export default createSystem(defaultConfig, config)
