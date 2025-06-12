import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { categoryId: string; projectId: string } }) {
    // Redirect old project routes to year-based routes (default to current year)
    const currentYear = "2025";
    redirect(`/year/${currentYear}/category/${params.categoryId}/project/${params.projectId}`);
}
