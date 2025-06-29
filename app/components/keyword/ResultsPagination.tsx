"use client";

import { Box, ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useRouter } from "next/navigation";

type Props = {
  currentPage: number;
  totalResults: number;
  totalPages: number;
};

export default function ResultsPagination(props: Props) {
  const router = useRouter();
  const { currentPage, totalResults, totalPages } = props;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return; // Prevent out of bounds
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("page", newPage.toString());
    router.push(newUrl.toString());
  };

  return (
    <Box textAlign="center">
      <Pagination.Root
        count={totalResults}
        pageSize={50} // 50 results count set in esv api
        page={currentPage}
        onPageChange={(e) => handlePageChange(e.page)}
      >
        <ButtonGroup variant="outline" size="sm">
          <Pagination.PrevTrigger asChild disabled={currentPage <= 1}>
            <IconButton>
              <HiChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton colorPalette="teal" variant={{ base: "ghost", _selected: "solid" }}>
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild disabled={currentPage >= totalPages}>
            <IconButton>
              <HiChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </Box>
  );
}
