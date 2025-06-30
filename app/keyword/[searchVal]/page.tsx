import KeywordHeading from "@/app/components/keyword/KeywordHeading";
import ResultsPagination from "@/app/components/keyword/ResultsPagination";
import ScrollToTop from "@/app/components/keyword/ScrollToTop";
import { getKeywordResults } from "@/lib/esvApi";
import {
  Container,
  Flex,
  Heading,
  List,
  ListItem,
  Separator,
  Text,
  Icon,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Link from "next/link";
import { RiArrowRightLine, RiSearchLine } from "react-icons/ri";

type ParamProps = {
  params: Promise<{
    searchVal: string;
  }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function KeywordPage({
  params,
  searchParams,
}: ParamProps) {
  const { searchVal } = await params;
  const searchParamaters = await searchParams;

  const isExact = searchParamaters?.isExact === "true";
  const page = parseInt(searchParamaters?.page || "1");

  const searchQuery = isExact ? `"${searchVal}"` : searchVal;
  const searchHits = await getKeywordResults(searchQuery);

  const buildChapterUrl = (reference: string) => {
    const [bookAndChapter] = reference.split(":");
    const lastSpaceIndex = bookAndChapter.lastIndexOf(" ");
    const book = bookAndChapter.substring(0, lastSpaceIndex);
    const chapter = bookAndChapter.substring(lastSpaceIndex + 1);
    const formattedBook = book.replace(/\s+/g, ""); // Remove spaces from book name
    return `/passages/${formattedBook}/${chapter}`;
  };

  return (
    <main>
      <Container py={8} bg="gray.100" mb='6rem'>
        <Heading as="h2" fontSize="2xl" fontWeight="medium" mb={2}>
          <Flex>
            <Icon mr={1} mt={0.5}>
              <RiSearchLine />
            </Icon>
            Keyword seach
          </Flex>
        </Heading>
        <KeywordHeading
          totalResults={searchHits.total_results}
          queryTerm={searchVal}
          isExact={isExact}
        />

        <Separator my={2} maxW={{ base: "100%", lg: "1024px" }} />

        {searchHits.total_results > 0 ? (
          <>
            <List.Root listStyle="none" maxW={{ base: "100%", lg: "1024px" }}>
              {searchHits.results.map((result, index) => (
                <ListItem
                  key={index}
                  my={2}
                  bg="white"
                  p={3}
                  borderRadius="10px"
                >
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="light"
                    color="teal.700"
                  >
                    {result.reference}
                  </Heading>
                  <Text fontSize="md">{result.content}</Text>
                  <ChakraLink
                    asChild
                    color="teal.700"
                    fontSize="sm"
                    mt={2}
                    mr={4}
                    float="right"
                  >
                    <Link
                      href={buildChapterUrl(result.reference)}
                      aria-label={`Read full chapter of ${result.reference}`}
                    >
                      Read full chapter
                      <Icon>
                        <RiArrowRightLine />
                      </Icon>
                    </Link>
                  </ChakraLink>
                </ListItem>
              ))}
            </List.Root>
            <ScrollToTop />
            {searchHits.total_results > 50 && (
              <ResultsPagination
                currentPage={page}
                totalPages={searchHits.total_pages}
                totalResults={searchHits.total_results}
              />
            )}
          </>
        ) : (
          <Text>No results found. Refine your search and try again.</Text>
        )}
      </Container>
    </main>
  );
}
