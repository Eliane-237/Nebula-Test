import { getPublishedPrograms } from '@/app/actions/programsQueries';
import { ProgramsCatalog } from './ProgramsCatalog';

export default async function PublicProgramsPage() {
  const programs = await getPublishedPrograms();
  return <ProgramsCatalog programs={programs} />;
}
