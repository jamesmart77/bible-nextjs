import { Box, Text } from "@chakra-ui/react";

export default function Copyright () {

  return (
    <Box mt="1rem" py="3rem" maxW={{ base: "100%", md: "740px" }} borderTop="1px solid" borderColor="gray.200">
      <Text fontSize="xs" color="gray.500">
        Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), 
        copyright &copy; 2001 by Crossway, a publishing ministry of Good News Publishers. 
        Used by permission. All rights reserved. You may not copy or download more than 500 consecutive 
        verses of the ESV Bible or more than one half of any book of the ESV Bible.
      </Text>
    </Box>
  );
}
