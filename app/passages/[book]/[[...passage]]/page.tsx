import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from '@/lib/session';
import ActionsBar from "@/app/components/utilities/ActionsBar";
import ScriptureText from "@/app/components/passages/ScriptureText";
import { getBiblePassage, navigateToChapter } from "@/lib/esvApi";
import { getUserByEmail, getUserSearchHistory } from "@/supabase/utils/user";
import { Fade } from "react-awesome-reveal";
import { SessionData } from "@/lib/constants";

type ParamProps = {
  params: Promise<{
    book: string;
    passage: string[];
  }>;
};

export async function generateMetadata({
  params,
}: ParamProps): Promise<Metadata> {
  const { book, passage } = await params;

  if (!passage) {
    return {};
  }

  const [chapter, verses] = passage;
  const [startVerse, endVerse] = verses?.split("-") || [];

  const chapterVerses = `${chapter}${startVerse ? `:${startVerse}` : ""}${
    endVerse ? `-${endVerse}` : ""
  }`;
  const title = `${book} ${chapterVerses}`;
  const description = `Read ${title} in the ESV Bible`;
  const url = `https://www.justscripture.app/passages/${encodeURIComponent(
    book
  )}/${encodeURIComponent(chapter)}${
    verses ? `/${encodeURIComponent(verses)}` : ""
  }`;
  const image = "https://www.justscripture.app/og-image.png";

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "JustScripture",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "JustScripture",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

async function fetchSearchHistory(session: SessionData | null) {
  let user, searchHistory;

  if (session?.email) {
    user = await getUserByEmail(session.email);
  }

  if (user?.id) {
    searchHistory = await getUserSearchHistory(user.id);
  }

  return searchHistory || [];
}

function getBookNameFromCanonical(canonical: string, fallback: string) {
  return canonical.replace(/\s+\d.*$/, "") || fallback;
}

export default async function Passage({ params }: ParamProps) {
  const { book, passage } = await params;

  if (!passage) {
    return redirect(`/passages/${book}/1`);
  }

  const session = await getServerSession();
  const searchHistory = await fetchSearchHistory(session);

  const [chapter, verses] = passage;
  const { passageText, canonical, audioSrc, previousChapter, nextChapter } =
    await getBiblePassage(book, passage);
  const passageUrl = `/passages/${book}/${chapter}${
    verses ? `/${verses}` : ""
  }`;
  const commentaryChapter = Number(chapter);
  const commentaryBookName = getBookNameFromCanonical(canonical, book);

  return (
    <main>
      <Fade duration={750} triggerOnce style={{ height: "100vh" }}>
        <div>
          <ScriptureText
            passageText={passageText}
            book={book}
            chapter={chapter}
            shouldShowFullChapterLink={!!verses}
          />
          <ActionsBar 
            navigateToChapter={navigateToChapter}
            previousChapter={previousChapter}
            nextChapter={nextChapter}
            userSession={session}
            passageUrl={passageUrl}
            audioPassageRef={canonical}
            audioSrc={audioSrc}
            searchHistory={searchHistory}
            commentaryBookSlug={book}
            commentaryBookName={commentaryBookName}
            commentaryChapter={commentaryChapter}
          />
        </div>
      </Fade>
    </main>
  );
}
