import { Switch, NativeSelect, SwitchCheckedChangeDetails } from "@chakra-ui/react";
import { HiX, HiCheck } from "react-icons/hi";

type SearchType = "passage" | "keyword";

type Props = {
  searchType: string;
  isExactPhrase: boolean;
  setSearchType: (value: SearchType) => void;
  setIsExactPhrase: (value: boolean) => void;
};

export default function SearchTypeSettings(props: Props) {
  const { searchType, setSearchType, isExactPhrase, setIsExactPhrase } = props;

  const focusOnInput = () => {
    // Focus the input element after changing search type
    const input = window.document.querySelector("input");
    if (input) input.focus();
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(event.target.value as SearchType);
    focusOnInput();
  };

  const handleSwitchChange = (e: SwitchCheckedChangeDetails) => {
    setIsExactPhrase(e.checked);
    focusOnInput();
  };

  return (
    <>
      {searchType === "keyword" && (
        <Switch.Root
          mr="2"
          size="md"
          checked={isExactPhrase}
          onCheckedChange={handleSwitchChange}
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
            Exact match
          </Switch.Label>
        </Switch.Root>
      )}
      <NativeSelect.Root size="xs" variant="outline" width="auto" me="-1">
        <NativeSelect.Field
          fontSize="sm"
          value={searchType}
          onChange={handleOnChange}
        >
          <option value="passage">Passage</option>
          <option value="keyword">Keyword</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </>
  );
}
