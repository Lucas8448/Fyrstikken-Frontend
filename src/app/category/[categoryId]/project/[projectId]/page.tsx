// src/app/category/[categoryId]/project/[projectId]/page.tsx
import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';

interface ProjectSection {
    type: 'image' | 'video' | 'audio' | 'text';
    content: string;
}

interface ProjectData {
    id: number;
    name: string;
    description: string;
    sections: ProjectSection[];
}

async function loader({ params }: { params: { categoryId: string, projectId: string } }): Promise<ProjectData | null> {
    const { categoryId, projectId } = params;
    const filePath = path.join(process.cwd(), 'public', 'data', 'projects', `${categoryId}`, `${projectId}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    const projectData = JSON.parse(data);
    return projectData || null;
}

export default async function CategoryProjectPage({ params }: { params: { categoryId: string, projectId: string } }) {
    const projectData = await loader({ params });

    if (!projectData) {
        return <div>Project not found</div>;
    }

    return (
        <main className="p-4">
            <Image
                alt="Hero Image"
                className="absolute inset-0 h-full w-full object-cover object-center"
                height={1080}
                src="/background.jpg"
                style={{
                    aspectRatio: "1920/1080",
                    objectFit: "cover",
                }}
                width={1920}
            />
            <div className='absolute inset-0 bg-gray-900/50 backdrop-blur-sm' />
            <div className='relative z-10 flex h-full w-full'>
                <Card className="max-w-3xl mx-auto shadow-lg">
                    <CardHeader className="text-2xl font-bold p-4 border-b">
                        {projectData.name}
                    </CardHeader>
                    <CardContent className="p-4">
                        <p className="mb-4">{projectData.description}</p>
                        <div className="space-y-4">
                            {projectData.sections.map((section, index) => (
                                <div key={index} className="p-2 border rounded-md shadow-md">
                                    {section.type === 'image' && <img src={section.content} alt="Project Image" className="w-full h-auto" />}
                                    {section.type === 'video' && <video controls autoPlay loop className="w-full h-auto"><source src={section.content} /></video>}
                                    {section.type === 'audio' && <audio src={section.content} controls className="w-full" />}
                                    {section.type === 'text' && <p>{section.content}</p>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                        Footer Content Here
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}