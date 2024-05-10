"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'

export default function RandomCategory() {
    const router = useRouter();
    const navigateToRandomCategory = () => {
        const randomCategory = Math.floor(Math.random() * 18) + 1;
        router.push(`/category/${randomCategory}`);
    };

    return (
        <div>
            <Button variant="secondary" onClick={navigateToRandomCategory}>Gå til en tilfeldig</Button>
        </div>
    );
}