import { createClient } from "@/app/lib/supabase-server";
import { redirect } from "next/navigation";
import ChapterDetailView from "./ChapterDetailView";

export default async function ChapterDetailPage(props) {
  const params = await props.params;
  const { subjectId, chapterId } = params;

  const supabase = await createClient();

  // Fetch current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login");
  }

  // Fetch subject details
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .single();

  // Fetch chapter details
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .single();

  // Fetch user's private notes for this chapter
  const { data: notes } = await supabase
    .from("chapter_notes")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (subjectError || chapterError || !subject || !chapter) {
    console.error("Failed to load chapter detail:", { subjectError, chapterError });
    redirect(`/dashboard/subjects/${subjectId}`);
  }

  return (
    <ChapterDetailView
      user={user}
      subject={subject}
      initialChapter={chapter}
      initialNotes={notes}
    />
  );
}