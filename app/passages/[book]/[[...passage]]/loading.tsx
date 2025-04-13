import { Flex, Spinner } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Flex justify={"center"} align="center" height="100vh">
      <Spinner size="lg" />
    </Flex>
  )
}