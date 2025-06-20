import React from "react";
import Link from "next/link";
import { CardContent, Card } from "@/components/ui/card";
import { promises as fs } from "fs";
import path from "path";

interface Data {
  title: string;
  projects: {
    id: number;
    name: string;
    description: string;
    image: string;
  }[];
}

async function loader({
  params,
}: {
  params: { yearId: string; categoryId: number };
}) {
  const categoryId = params.categoryId;
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    params.yearId,
    "categories",
    `${categoryId}.json`
  );

  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data) as Data;
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export default async function Page({
  params,
}: {
  params: { yearId: string; categoryId: number };
}) {
  const data: Data = await loader({ params });
  shuffleArray(data.projects);

  // Only use the info from categories/{categoryId}.json for the overview page
  // Do NOT load the full project files here
  return (
    <main className="flex flex-col">
      <section className="relative h-80 w-full overflow-hidden">
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
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {data.title}
          </h1>
          <p className="max-w-[600px] text-lg md:text-xl">
            Se gjennom de forskjellige prosjektene innen{" "}
            {data.title.toLowerCase()}
          </p>
        </div>
      </section>
      <section className="bg-gray-100 py-12 dark:bg-gray-800 sm:py-16 md:py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((project) => (
              <Link
                href={`/year/${params.yearId}/category/${params.categoryId}/project/${project.id}`}
                key={`${params.categoryId}-${project.id}`}
              >
                <div className="text-primary-500">
                  <Card className="group h-full w-full overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg">
                    <CardContent>
                      {project.image && (
                        <img
                          src={project.image}
                          alt="Project Image"
                          className="w-full h-auto rounded-md"
                        />
                      )}
                      <div className="mt-4 space-y-2 p-6">
                        <h3 className="text-xl font-semibold">
                          {project.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {project.description}
                        </p>
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
