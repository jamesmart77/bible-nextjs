import { Button, Input } from "@chakra-ui/react";

export default function PassageSearch() {
  return (
    <div>
      <form>
        <Input
          placeholder="Enter passage (e.g., John 3:16)"
          aria-label="Search for a passage in the ESV Bible"
        />
        <Button
          mt="0.5rem"
          type="submit"
          width="100%"
          loadingText="Searching..."
        >
          Search
        </Button>
      </form>
    </div>
  );
}
