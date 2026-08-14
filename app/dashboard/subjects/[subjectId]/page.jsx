import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SubjectDetailView from './SubjectDetailView';

export default async function SubjectPage(props) {
  // Properly await props.params in Next.js modern routing
  const params = await props.params;
  const subjectId = params?.subjectId;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  const [subjectRes, chaptersRes] = await Promise.all([
    supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
  ]);

  return (
    <div className="p-6 md:p-10">
      <SubjectDetailView 
        user={user} 
        initialSubject={subjectRes.data || null} 
        initialChapters={chaptersRes.data || []} 
      />
    </div>
  );
}