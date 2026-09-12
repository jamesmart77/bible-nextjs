"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Heading,
  Link,
  Portal,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  domToReact,
  htmlToDOM,
  Element,
  type DOMNode,
} from "html-react-parser";
import { replaceEsvHtmlNode } from "@/app/utils/htmlParser";
import {
  crossReferenceHref,
  getCrossReferences,
  isCrossReferenceMarker,
  splitReferenceText,
} from "@/app/utils/crossReferences";
import {
  serializeHtmlNode,
  type VerseNodeGroup,
} from "@/app/utils/scriptureHtmlParser";

type Props = { verse: VerseNodeGroup; reference: string; onClose: () => void };
type Result = { text?: string; error?: string };

export default function CrossReferenceDrawer({
  verse,
  reference,
  onClose,
}: Props) {
  const crossReferences = useMemo(
    () => getCrossReferences(verse.nodes),
    [verse],
  );
  const sourceNodes = useMemo(
    () =>
      htmlToDOM(
        verse.nodes
          .map(serializeHtmlNode)
          .join("")
          .replace(/\sid="[^"]*"/g, ""),
      ),
    [verse],
  );
  const [results, setResults] = useState<Record<string, Result>>({});
  const [attempt, setAttempt] = useState(0);
  const referenceCount = new Set(
    crossReferences.flatMap((item) => item.references),
  ).size;
  const completedCount = Object.keys(results).length;
  const failedCount = Object.values(results).filter(
    (result) => result.error,
  ).length;
  const loadingMessage =
    completedCount < referenceCount
      ? "Loading cross references."
      : failedCount
        ? `Cross references finished loading. ${failedCount} could not be loaded. Use Retry references to try again.`
        : "Cross references loaded.";

  useEffect(() => {
    const controller = new AbortController();
    const queue = [
      ...new Set(crossReferences.flatMap((item) => item.references)),
    ];
    setResults({});
    const worker = async () => {
      while (queue.length && !controller.signal.aborted) {
        const ref = queue.shift()!;
        let result: Result;
        try {
          const response = await fetch(
            `/api/cross-reference?${new URLSearchParams({ reference: ref })}`,
            { signal: controller.signal },
          );
          if (!response.ok) throw new Error("Reference unavailable");
          result = await response.json();
        } catch {
          result = { error: "Unable to load this reference." };
        }
        if (!controller.signal.aborted)
          setResults((previous) => ({ ...previous, [ref]: result }));
      }
    };
    void Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
    return () => controller.abort();
  }, [crossReferences, attempt]);

  return (
    <Drawer.Root
      open
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      placement="end"
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            bg="var(--js-bg-surface)"
            color="var(--js-text-primary)"
          >
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" aria-label="Close cross references" />
            </Drawer.CloseTrigger>
            <Drawer.Header pr={12}>
              <Drawer.Title>Cross references</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body overflowY="auto" pb={8}>
              <Text color="var(--js-text-secondary)" fontSize="sm" mb={3}>
                {reference}
              </Text>
              <Box
                fontSize="1.125em"
                lineHeight={1.8}
                pb={6}
                mb={6}
                borderBottomWidth="1px"
                borderColor="var(--js-border-muted)"
              >
                {domToReact(sourceNodes as DOMNode[], {
                  replace: (node, index) => {
                    if (isCrossReferenceMarker(node))
                      return (
                        <Fragment>
                          {getCrossReferences([node as Element]).map((item) => (
                            <Fragment key={item.label}>
                              <VisuallyHidden>{` Reference ${item.label}. `}</VisuallyHidden>
                              <Box
                                as="sup"
                                aria-hidden="true"
                                color="var(--js-accent-solid)"
                              >
                                {item.label}
                              </Box>
                            </Fragment>
                          ))}
                        </Fragment>
                      );
                    if (
                      node instanceof Element &&
                      node.name === "a" &&
                      node.attribs.class === "fn"
                    )
                      return (
                        <span>{domToReact(node.children as DOMNode[])}</span>
                      );
                    return replaceEsvHtmlNode(node, index);
                  },
                })}
              </Box>
              <VisuallyHidden
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {loadingMessage}
              </VisuallyHidden>
              <Box>
                {crossReferences.map((item, index) => (
                  <Box key={`${item.label}-${index}`} mb={7} lineHeight={1.75}>
                    <Heading
                      as="h3"
                      fontSize="sm"
                      fontWeight="semibold"
                      color="var(--js-text-secondary)"
                      mb={3}
                    >
                      Reference {item.label}
                    </Heading>
                    {item.references.map((ref) => {
                      const href = crossReferenceHref(ref);
                      const result = results[ref];
                      return (
                        <Box key={ref} mb={5}>
                          {href ? (
                            <Link
                              asChild
                              color="var(--js-accent-solid)"
                              textDecoration="underline"
                            >
                              <NextLink href={href} onClick={onClose}>
                                {ref}
                              </NextLink>
                            </Link>
                          ) : (
                            <Text as="span">{ref}</Text>
                          )}
                          <Text
                            mt={1}
                            whiteSpace="pre-line"
                            color={
                              result?.text
                                ? "var(--js-text-primary)"
                                : "var(--js-text-secondary)"
                            }
                          >
                            {result?.text
                              ? splitReferenceText(result.text).map(
                                  (part, partIndex) => (
                                    <Fragment key={partIndex}>
                                      {partIndex > 0 && " "}
                                      {part.verseNumber && (
                                        <>
                                          <VisuallyHidden>{`Verse ${part.verseNumber}. `}</VisuallyHidden>
                                          <Box
                                            as="sup"
                                            aria-hidden="true"
                                            color="var(--js-text-secondary)"
                                            mr={1}
                                          >
                                            {part.verseNumber}
                                          </Box>
                                        </>
                                      )}
                                      {part.text}
                                    </Fragment>
                                  ),
                                )
                              : (result?.error ?? "Loading…")}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
              {Object.values(results).some((result) => result.error) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResults({});
                    setAttempt((value) => value + 1);
                  }}
                >
                  Retry references
                </Button>
              )}
              <Text fontSize="xs" color="var(--js-text-secondary)" mt={6}>
                Scripture quotations are from the ESV® Bible.
              </Text>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
