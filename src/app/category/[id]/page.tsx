import React from 'react';
import Link from "next/link";
import { CardContent, Card } from "@/components/ui/card";
import { promises as fs } from 'fs';
import path from 'path';

interface Data {
    title: string;
    projects: {
        id: number;
        name: string;
        description: string;
        image: string;
    }[];
}

async function loader({ params }: { params: { id: number } }) {
    const id = params.id;
    const filePath = path.join(process.cwd(), 'public', 'data', 'categories', `${id}.json`);

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as Data;
}

export default async function Page({ params }: { params: { id: number } }) {
    const data: Data = await loader({ params });
    return (
        <main className="flex flex-col">
            <section className="relative h-[95vh] w-full overflow-hidden">
                <img
                    alt="Hero Image"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    src="/background.jpg"
                    style={{
                        aspectRatio: "1920/1080",
                        objectFit: "cover",
                    }}
                />
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-6 px-4 text-center text-gray-50 sm:px-6 md:px-8">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{data.title}</h1>
                    <p className="max-w-[600px] text-lg md:text-xl">
                        Se gjennom de forskjellige prosjektene innen {data.title.toLowerCase()}
                    </p>
                </div>
            </section>
            <section className="bg-gray-100 py-12 dark:bg-gray-800 sm:py-16 md:py-20">
                <div className="container">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Object.values(data.projects).sort(() => Math.random() - 0.5).map((project) => (
                            <Link href={`/project/${project.id}`} key={project.id}>
                                <div className="text-primary-500">
                                    <Card className="group h-full w-full overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg">
                                        <CardContent>
                                            <img
                                                alt={project.name}
                                                className="aspect-w-16 aspect-h-9 w-full object-cover object-center transition-all group-hover:scale-105"
                                                src={project.image}
                                            />
                                            <div className="mt-4 space-y-2">
                                                <h3 className="text-xl font-semibold">{project.name}</h3>
                                                <p className="text-gray-500 dark:text-gray-400">{project.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}