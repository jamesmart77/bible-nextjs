import { Suspense } from "react";
import ErrorContent from "@/app/components/error/ErrorContent";

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}