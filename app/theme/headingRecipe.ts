import { defineRecipe } from "@chakra-ui/react";

export const headingRecipe = defineRecipe({
  base: {
    fontFamily: "heading",
    lineHeight: "shorter",
    fontWeight: "bold",
    letterSpacing: "normal",
    textAlign: "left",
    mt: 4,
    alignItems: "center",
    display: "flex",
  },
  variants: {
    size: {
      xxl: {
        fontSize: { base: "xl", md: "2xl" },
      },
      xl: {
        fontSize: { base: "xl", md: "2xl" },
      },
      lg: {
        fontSize: { base: "lg", md: "lg" },
      },
      md: {
        fontSize: { base: "sm", md: "md" },
      },
      sm: {
        fontSize: { base: "sm", md: "md" },
      },
      xs: {
        fontSize: { base: "xs", md: "sm" },
      },
    },
  },
});
