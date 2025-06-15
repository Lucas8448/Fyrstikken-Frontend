"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Project {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface CategoryData {
  title: string;
  projects: Project[];
}

interface RandomProjectProps {
  readonly year?: string;
}

export default function RandomProject({ year = "2025" }: Readonly<RandomProjectProps>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const categoryIds = [
    100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
  ];

  const navigateToRandomProject = async () => {
    setIsLoading(true);
    
    try {
      // Get all projects from all categories for the selected year
      const allProjects: { project: Project; categoryId: number }[] = [];
      
      for (const categoryId of categoryIds) {
        try {
          const response = await fetch(`/data/${year}/categories/${categoryId}.json`);
          if (response.ok) {
            const categoryData: CategoryData = await response.json();
            categoryData.projects.forEach((project) => {
              allProjects.push({ project, categoryId });
            });
          }
        } catch {
          // Skip categories that don't exist
        }
      }

      if (allProjects.length > 0) {
        // Select a random project
        const randomIndex = Math.floor(Math.random() * allProjects.length);
        const { project, categoryId } = allProjects[randomIndex];
        
        // Navigate to the random project
        router.push(`/year/${year}/category/${categoryId}/project/${project.id}`);
      } else {
        console.log(`No projects found for year ${year}`);
      }
    } catch (error) {
      console.error("Error fetching random project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button 
        variant="secondary" 
        onClick={navigateToRandomProject}
        disabled={isLoading}
      >
        {isLoading ? "Laster..." : "Tilfeldig prosjekt"}
      </Button>
    </div>
  );
}
