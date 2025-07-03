import { NativeSelect } from "@chakra-ui/react";
type SearchType = "passage" | "keyword";

type Props = {
  searchType: string;
  setSearchType: (value: SearchType) => void;
};

export default function SearchTypeSettings(props: Props) {
  const { searchType, setSearchType } = props;

  const focusOnInput = () => {
    // Focus the input element after changing search type
    const input = window.document.querySelector("input");
    if (input) input.focus();
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(event.target.value as SearchType);
    focusOnInput();
  };

  return (
    <NativeSelect.Root size="xs" variant="outline" width="auto" me="-1">
      <NativeSelect.Field
        aria-label="Select scripture search type"
        fontSize="sm"
        value={searchType}
        onChange={handleOnChange}
      >
        <option value="passage">Passage</option>
        <option value="keyword">Keyword</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
