import React from 'react';
import ChapterDetailView from '../ChapterDetailView';

export default async function ChapterNotesPage({ params }) {
  const resolvedParams = await params;
  
  // Provide every possible variation of id / chapterId at the root and inside params
  const enhancedProps = {
    id: resolvedParams?.chapterId,
    chapterId: resolvedParams?.chapterId,
    subjectId: resolvedParams?.subjectId,
    params: {
      ...resolvedParams,
      id: resolvedParams?.chapterId,
      chapterId: resolvedParams?.chapterId,
    },
  };

  return <ChapterDetailView {...enhancedProps} />;
}