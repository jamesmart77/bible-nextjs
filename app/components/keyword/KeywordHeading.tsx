"use client";

import {
  Button,
  Flex,
  HStack,
  Switch,
  SwitchCheckedChangeDetails,
  Text,
} from "@chakra-ui/react";
import { InfoTip } from "@/app/components/chakra-snippets/toggle-tip";
import { useRouter } from "next/navigation";
import { HiX, HiCheck, HiInformationCircle } from "react-icons/hi";

type Props = {
  totalResults: number;
  queryTerm: string;
  isExact: boolean;
};

export default function KeywordHeading({
  totalResults,
  queryTerm,
  isExact,
}: Props) {
  const router = useRouter();

  const handleSwitchChange = (e: SwitchCheckedChangeDetails) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("isExact", e.checked.toString());
    router.push(newUrl.toString());
  };

  return (
    <Flex
      flexDirection={{ base: "column", sm: "row" }}
      alignItems={{ base: "start", sm: "center" }}
      mb={4}
    >
      <Text fontSize="md" color="gray.600">
        {totalResults} {totalResults === 1 ? "result" : "results"} for{" "}
        <b>{decodeURIComponent(queryTerm)}</b>{" "}
      </Text>
      <HStack mt={{base: 2, sm: 0 }}>
        <Switch.Root
          ml={{ base: 0, sm: 4 }}
          size="md"
          checked={isExact}
          onCheckedChange={handleSwitchChange}
          colorPalette="teal"
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb>
              <Switch.ThumbIndicator fallback={<HiX color="black" />}>
                <HiCheck />
              </Switch.ThumbIndicator>
            </Switch.Thumb>
          </Switch.Control>
          <Switch.Label mt="0.25" fontSize="xs">
            Make exact match
          </Switch.Label>
        </Switch.Root>
        <InfoTip content="Exact match only returns results for the exact phrase found in Scripture.">
          <Button size="xs" variant="ghost">
            <HiInformationCircle />
          </Button>
        </InfoTip>
      </HStack>
    </Flex>
  );
}
