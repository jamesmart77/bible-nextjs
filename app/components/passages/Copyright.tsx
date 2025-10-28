import { Text } from "@chakra-ui/react";

export default function Copyright () {

  return (
    <div>
      <Text fontSize="sm" color="gray.600" mb="0.5rem">
        Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), 
        copyright &copy; 2001 by Crossway, a publishing ministry of Good News Publishers. 
        Used by permission. All rights reserved. You may not copy or download more than 500 consecutive 
        verses of the ESV Bible or more than one half of any book of the ESV Bible.
      </Text>
    </div>
  );
}
