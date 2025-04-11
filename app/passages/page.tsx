import { redirect } from "next/navigation";

export default function PassageRedirect() {
  return redirect("/passages/John/1");
}
