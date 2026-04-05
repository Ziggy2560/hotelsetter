import Navbar from "@/components/layout/navbar";
import { SearchPageContent } from "@/components/search/search-page-content";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  return (
    <>
      <Navbar variant="solid" />
      <SearchPageContent searchParams={params} />
    </>
  );
}
