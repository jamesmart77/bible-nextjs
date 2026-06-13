import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: "lg",
    fontWeight: "semibold",
    transitionProperty: "background-color, color, border-color, opacity",
    transitionDuration: "0.15s",
    color: {
      base: "black",
      _dark: "white",
    },
  },
});
