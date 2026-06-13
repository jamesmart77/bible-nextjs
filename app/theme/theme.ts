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
          value: "'Open Sans', sans-serif",
        },
        body: {
          value: "'Open Sans', sans-serif",
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          body: {
            default: { value: "#ffffff" },
            _dark: { value: "#1A1A1A" },
          },
          surface: {
            default: { value: "#f8fafc" },
            _dark: { value: "#242424" },
          },
          muted: {
            default: { value: "#f1f5f9" },
            _dark: { value: "#2b2b2b" },
          },
        },
        text: {
          primary: {
            default: { value: "#111827" },
            _dark: { value: "#F0F0F0" },
          },
          secondary: {
            default: { value: "#475569" },
            _dark: { value: "#A8A8A8" },
          },
        },
        border: {
          muted: {
            default: { value: "#e2e8f0" },
            _dark: { value: "#3C646D" },
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
