"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const categoryArray = [
  100, 110, 120, 130, 200, 210, 220, 300, 310, 400, 410, 420, 430, 440, 450,
  500, 510,
];

interface RandomCategoryProps {
  readonly year?: string;
}

export default function RandomCategory({ year = "2025" }: RandomCategoryProps) {
  const router = useRouter();
  const navigateToRandomCategory = () => {
    const randomIndex = Math.floor(Math.random() * categoryArray.length);
    const randomCategory = categoryArray[randomIndex];
    router.push(`/year/${year}/category/${randomCategory}`);
  };

  return (
    <div>
      <Button variant="secondary" onClick={navigateToRandomCategory}>
        Gå til en tilfeldig
      </Button>
    </div>
  );
}
