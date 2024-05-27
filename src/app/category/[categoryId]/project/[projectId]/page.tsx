// src/app/category/[categoryId]/project/[projectId]/page.tsx
import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';

interface ProjectData {
    id: number;
    name: string;
    description: string;
    image: string;
}

async function loader({ params }: { params: { categoryId: string, projectId: string } }): Promise<ProjectData | null> {
    console.log("loader called with params:", params); // Log the received params

    const { categoryId, projectId } = params;
    const filePath = path.join(process.cwd(), 'public', 'data', 'categories', `${categoryId}.json`);

    console.log("Constructed file path:", filePath); // Log the constructed file path

    // Read the entire contents of the.json file
    const data = await fs.readFile(filePath, 'utf8');

    console.log("File data read:", data); // Log the raw file data

    // Parse the JSON data into a JavaScript object
    const jsonData = JSON.parse(data);

    console.log("Parsed JSON data:", jsonData); // Log the parsed JSON data

    // Use explicit type coercion in the find operation
    const projectData = jsonData.projects.find((project: ProjectData) => Number(project.id) === Number(projectId));

    console.log("Found project data:", projectData); // Log the found project data

    // Return the project data or null if not found
    return projectData || null;
}

export default async function CategoryProjectPage({ params }: { params: { categoryId: string, projectId: string } }) {
    const projectData = await loader({ params });

    if (!projectData) {
        return <div>Project not found</div>;
    }

    return (
        <main>
            <section>
                <h1 style={{ fontSize: '2em' }}>{projectData.name}</h1> {/* Inline style applied here */}
                <br />
                <img src={projectData.image} alt={projectData.name} />
                <div>
                <br />
                    <p>{projectData.description}</p>
                </div>
            </section>
        </main>
    );
}
