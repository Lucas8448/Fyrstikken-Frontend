"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const categoryArray = [
  100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
];

interface RandomCategoryProps {
  readonly year?: string;
}

interface RandomCategoryProps {
    readonly year?: string;
}

export default function RandomCategory({ year = "2025" }: Readonly<RandomCategoryProps>) {
    const router = useRouter();
    const navigateToRandomCategory = () => {
        const randomIndex = Math.floor(Math.random() * categoryArray.length);
        const randomCategory = categoryArray[randomIndex];
        router.push(`/year/${year}/category/${randomCategory}`);
    };

  return (
    <div>
      <Button variant="secondary" onClick={navigateToRandomCategory}>
        Tilfeldig kategori
      </Button>
    </div>
  );
}
