// pages/category/[categoryId]/project/[projectId]/page.tsx
import React from 'react';
import { CardContent, Card } from "@/components/ui/card";
import { promises as fs } from 'fs';
import path from 'path';

interface ProjectData {
    id: number;
    name: string;
    description: string;
    image: string;
}

// Adjusted loader function to correctly find the project by projectId
async function loader({ params }: { params: { categoryId: number, projectId: number } }) {
    const { categoryId, projectId } = params;
    // Construct the path to the.json file containing the category data
    const filePath = path.join(process.cwd(), 'public', 'data', 'categories', `${categoryId}.json`);

    // Read the entire contents of the.json file
    const data = await fs.readFile(filePath, 'utf8');

    // Parse the JSON data into a JavaScript object
    const jsonData = JSON.parse(data);

    // Find the project with the matching projectId within the projects array
    const projectData = jsonData.projects.find((project: { id: number; }) => project.id === projectId);

    // Return the project data or null if not found
    return projectData || null;
}

export default async function CategoryProjectPage({ params }: { params: { categoryId: number, projectId: number } }) {
    const projectData = await loader({ params });

    if (!projectData) {
        return <div>Project not found</div>;
    }

    return (
        <main>
            <img src={projectData.image} alt={projectData.name} />
            <div>
                <h3>{projectData.name}</h3>
                <p>{projectData.description}</p>
            </div>
        </main>
    );
}
