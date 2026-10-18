"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import type { InterlinearChapter, InterlinearToken, StrongsEntry } from "@/lib/interlinear/types";
import StrongsDefinition from "./StrongsDefinition";
import styles from "./InterlinearPanel.module.css";

type Props = { bookSlug: string; bookName: string; chapter: number };

export default function InterlinearPanel({ bookSlug, bookName, chapter }: Props) {
  const [passage, setPassage] = useState<InterlinearChapter | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [entry, setEntry] = useState<StrongsEntry | null>(null);
  const [entryError, setEntryError] = useState("");
  const [entryAttempt, setEntryAttempt] = useState(0);
  const entries = useRef(new Map<string, StrongsEntry>());
  const definitionHeading = useRef<HTMLHeadingElement>(null);
  const lastLink = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setPassage(null);
    setError("");
    setSelected(null);
    fetch(`/api/interlinear?${new URLSearchParams({ book: bookSlug, chapter: String(chapter) })}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!controller.signal.aborted) setPassage(data);
      }).catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message || "Unable to load the interlinear.");
      });
    return () => controller.abort();
  }, [bookSlug, chapter, attempt]);

  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    setEntry(entries.current.get(selected) ?? null);
    setEntryError("");
    definitionHeading.current?.focus();
    if (!entries.current.has(selected)) {
      fetch(`/api/interlinear/strongs?${new URLSearchParams({ number: selected, format: "structured" })}`, { signal: controller.signal })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          if (!controller.signal.aborted) {
            entries.current.set(selected, data);
            setEntry(data);
          }
        }).catch((cause) => {
          if (!controller.signal.aborted) setEntryError(cause.message || "Unable to load this definition.");
        });
    }
    return () => controller.abort();
  }, [selected, entryAttempt]);

  function tokens(items: InterlinearToken[], original = false) {
    return items.map((token, index) => token.strongs ? (
      <Link
        key={index}
        href={token.href}
        onClick={(event) => {
          event.preventDefault();
          lastLink.current = event.currentTarget;
          if (selected === token.strongs) {
            definitionHeading.current?.focus();
          } else {
            setEntry(null);
            setEntryError("");
            setSelected(token.strongs!);
          }
        }}
        display="inline"
        color="var(--js-accent-solid)"
        textDecoration="underline"
        textUnderlineOffset="3px"
        fontFamily="system-ui"
        fontSize={original ? "xs" : "inherit"}
        aria-label={`${token.text}, Strong’s ${token.strongs}`}
      >
        {token.text}{!original && <Box as="sup" fontSize="0.65em" ml={0.5}>{token.strongs}</Box>}
      </Link>
    ) : token.morphology ? (
      <Box as="span" key={index} fontFamily="system-ui" fontSize="xs" color="var(--js-text-secondary)" mx={1}>{token.text}</Box>
    ) : <span key={index}>{token.text}</span>);
  }

  return (
    <Box display="flex" flexDirection="column" minH={0} flex={1} gap={3}>
      <Text fontSize="sm" color="var(--js-text-secondary)">
        {bookName} {chapter} · NASB 1995 · {passage?.language === "greek" ? "Greek" : passage ? "Hebrew" : "Interlinear"}
      </Text>
      {selected && (
        <Box borderWidth="1px" borderColor="var(--js-border-muted)" rounded="lg" p={4} maxH="45%" overflowY="auto" flexShrink={0} role="region" aria-label="Strong’s definition">
          <Flex justify="space-between" align="center" gap={3} mb={2}>
            <Heading as="h3" size="sm" ref={definitionHeading} tabIndex={-1}>
              {selected}{entry ? ` · ${entry.word}` : ""}
            </Heading>
            <Button size="xs" variant="ghost" onClick={() => {
              setSelected(null);
              lastLink.current?.focus();
            }}>Close definition</Button>
          </Flex>
          <Box role="status" aria-live="polite">
            {!entry && !entryError && <Text>Loading definition…</Text>}
            {entryError && <><Text>{entryError}</Text><Button size="sm" mt={2} variant="outline" onClick={() => setEntryAttempt((n) => n + 1)}>Retry definition</Button></>}
          </Box>
          {entry && <>
            <Text color="var(--js-text-secondary)" mb={2}>{entry.pronunciation}</Text>
            <Text fontSize="sm" fontWeight="semibold">Parts of speech</Text>
            <Text mb={3}>{entry.partOfSpeech}</Text>
            <Text fontSize="sm" fontWeight="semibold">Definition</Text>
            <StrongsDefinition entry={entry} />
            {entry.details.map((detail) => <Box key={detail.label} mb={2}><Text fontSize="sm" fontWeight="semibold">{detail.label}</Text><Text whiteSpace="pre-line">{detail.text}</Text></Box>)}
            <Link href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" fontSize="sm" textDecoration="underline">View on BibleStudyTools</Link>
          </>}
        </Box>
      )}
      <Box overflowY="auto" minH={0} flex={1} pb={6}>
        <Box role="status" aria-live="polite">
          {!passage && !error && <Text>Loading NAS interlinear…</Text>}
          {error && <><Text>{error}</Text><Button variant="outline" size="sm" mt={3} onClick={() => setAttempt((n) => n + 1)}>Retry interlinear</Button></>}
        </Box>
        {passage?.verses.map((verse) => <Box key={verse.number} mb={5} pb={4} borderBottomWidth="1px" borderColor="var(--js-border-muted)">
          <Text lineHeight={1.9} mb={3}>
            <Box as="sup" fontSize="xs" mr={2} color="var(--js-text-secondary)">{verse.number}</Box>
            {tokens(verse.english)}
          </Text>
          <Box className={styles[passage.language]} fontSize="2xl" lineHeight={1.9} textAlign={passage.language === "hebrew" ? "right" : "left"} bg="var(--js-bg-surface)" rounded="md" p={3} aria-label={`Verse ${verse.number} original ${passage.language} text`}>
            {tokens(verse.original, true)}
          </Box>
        </Box>)}
        {passage && <Box fontSize="xs" color="var(--js-text-secondary)" mt={4}>
          <Link href={passage.sourceUrl} target="_blank" rel="noopener noreferrer" textDecoration="underline">Interlinear source: BibleStudyTools</Link>
          <Text mt={2}>Scripture quotations taken from the (NASB®) New American Standard Bible®, Copyright © 1960, 1971, 1977, 1995 by The Lockman Foundation. All rights reserved.</Text>
        </Box>}
      </Box>
    </Box>
  );
}
