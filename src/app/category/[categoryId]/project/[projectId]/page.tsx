// src/app/category/[categoryId]/project/[projectId]/page.tsx
import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { dynamicBlurDataUrl } from '@/app/dynamicBlurDataUrl'

interface ProjectSection {
    type: 'image' | 'video' | 'audio' | 'text' | 'iframe';
    content: string;
    hidden?: boolean;
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
        <main className="p-4 relative min-h-screen bg-gray-100">
            <Image
                alt="Hero Image"
                className="absolute inset-0 h-full w-full object-cover object-center z-0"
                height={1080}
                src="/background.jpg"
                style={{
                    aspectRatio: "1920/1080",
                    objectFit: "cover",
                }}
                width={1920}
            />
            <div className='absolute inset-0 bg-gray-900/50 backdrop-blur-sm' />
            <div className='relative z-10 flex justify-center items-center min-h-screen'>
                <Card className="max-w-4xl w-full mx-auto shadow-lg bg-white overflow-hidden rounded-lg">
                    <CardHeader className="text-2xl font-bold p-6 border-b border-gray-200 bg-gray-50">
                        {projectData.name}
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-6">
                            {projectData.sections.map(async (section, index) => {
                                if (section.hidden) {
                                    return <div key={index}></div>;
                                }
                                if (section.type === 'image') {
                                    return (
                                        <div key={index}>
                                            <Image
                                                alt={`Section ${index}`}
                                                className="rounded-lg"
                                                src={section.content}
                                                width={1280}
                                                height={720}
                                                placeholder="blur"
                                                blurDataURL={await dynamicBlurDataUrl(section.content)}
                                            />
                                        </div>
                                    );
                                }
                                if (section.type === 'video') {
                                    return (
                                        <div key={index}>
                                            <video
                                                className="rounded-lg"
                                                controls
                                                src={section.content}
                                            />
                                        </div>
                                    );
                                }
                                if (section.type === 'audio') {
                                    return (
                                        <div key={index}>
                                            <audio
                                                className="rounded-lg"
                                                controls
                                                src={section.content}
                                            />
                                        </div>
                                    );
                                }
                                if (section.type === 'text') {
                                    return (
                                        <div key={index}>
                                            <p>{section.content}</p>
                                        </div>
                                    );
                                }
                                if (section.type === 'iframe') {
                                    return (
                                        <div key={index}>
                                            <iframe
                                                className="rounded-lg"
                                                src={section.content}
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: '16 / 9',
                                                }}
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 border-t border-gray-200 bg-gray-50 text-center">
                        {projectData.description}
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}