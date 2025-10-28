import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import ActionsBar from "@/app/components/utilities/ActionsBar";
import ScriptureText from "@/app/components/passages/ScriptureText";
import { getBiblePassage, navigateToChapter } from "@/lib/esvApi";
import { getUserByEmail, getUserSearchHistory } from "@/supabase/utils/user";
import { SessionData } from "@auth0/nextjs-auth0/types";
import { Fade } from "react-awesome-reveal";

type ParamProps = {
  params: Promise<{
    book: string;
    passage: string[];
  }>;
};

export async function generateMetadata({ params }: ParamProps) {
  const { book, passage } = await params;

  if (!passage) {
    return null;
  }

  const [chapter, verses] = passage;
  const [startVerse, endVerse] = verses?.split("-") || [];

  const chapterVerses = `${chapter}${startVerse ? `:${startVerse}` : ""}${
    endVerse ? `-${endVerse}` : ""
  }`;

  return {
    title: `${book} ${chapterVerses}`,
    description: `Read ${book} ${chapterVerses} in the ESV Bible`,
    siteName: "JustScripture",
    openGraph: {
      title: `${book} ${chapterVerses}`,
      description: `Read ${book} ${chapterVerses} in the ESV Bible`,
      images: [
        {
          url: "https://www.justscripture.app/logo.webp",
          width: 50,
          height: 50,
        },
      ],
    },
  };
}

async function fetchSearchHistory(session: SessionData | null) {
  let user, searchHistory;

  if (session?.user?.email) {
    user = await getUserByEmail(session.user.email);
  }

  if (user?.id) {
    searchHistory = await getUserSearchHistory(user.id);
  }

  return searchHistory || [];
}

export default async function Passage({ params }: ParamProps) {
  const { book, passage } = await params;

  if (!passage) {
    return redirect(`/passages/${book}/1`);
  }

  const session = await auth0.getSession();
  const searchHistory = await fetchSearchHistory(session);

  const [chapter, verses] = passage;
  const { passageText, previousChapter, nextChapter } = await getBiblePassage(
    book,
    passage
  );
  const passageUrl = `/passages/${book}/${chapter}${
    verses ? `/${verses}` : ""
  }`;

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
            searchHistory={searchHistory}
          />
        </div>
      </Fade>
    </main>
  );
}
