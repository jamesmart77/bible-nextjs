import { createSystem, defaultConfig } from "@chakra-ui/react";
import { headingRecipe } from "./headingRecipe";

export default createSystem(defaultConfig, {
  globalCss: {
    body: {
      fontSize: "1rem",
      color: "black",
      backgroundColor: "white",
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
    recipes: {
      heading: headingRecipe,
    },
  },
});
