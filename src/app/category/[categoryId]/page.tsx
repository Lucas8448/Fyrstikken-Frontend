import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { categoryId: string } }) {
    // Redirect old category routes to year-based routes (default to current year)
    const currentYear = "2025";
    redirect(`/year/${currentYear}/category/${params.categoryId}`);
}
