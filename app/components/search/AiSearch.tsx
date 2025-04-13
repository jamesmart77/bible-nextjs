import { Input, Button, Heading } from "@chakra-ui/react";
import { RiGeminiLine } from "react-icons/ri";

type Props = {
  isLoading: boolean;
  handleSubmit: (event: React.FormEvent) => void;
  query: string;
  setQuery: (query: string) => void;
};

export default function AiSearch(props: Props) {
  const { isLoading, handleSubmit, query, setQuery } = props;
  return (
    <div>
      <Heading as="h2" size="lg" mb={4}>
        Search the Bible
      </Heading>
      <form
        onSubmit={handleSubmit}
        aria-disabled={isLoading}
        aria-busy={isLoading}
      >
        <Input
          placeholder="Ask a question"
          disabled={isLoading}
          size="lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)} // Update state on input change
        />
        <Button
          mt={2}
          type="submit"
          width="100%"
          loading={isLoading}
          loadingText="Searching..."
        >
          Search <RiGeminiLine />
        </Button>
      </form>
    </div>
  );
}
