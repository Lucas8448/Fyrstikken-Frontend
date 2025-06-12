import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CardContent, Card } from "@/components/ui/card";
import RandomCategory from "@/components/randomCategory";
import { promises as fs } from "fs";
import Image from "next/image";

interface Data {
  categories: {
    id: number;
    title: string;
    description: string;
    image: string;
  }[];
}

export default async function Component() {
  // Redirect to current year (2025)
  const currentYear = "2025";

  const file = await fs.readFile(
    process.cwd() + `/public/data/${currentYear}/categories.json`,
    "utf8"
  );
  const data: Data = JSON.parse(file);

  return (
    <main className="flex flex-col">
      <section className="relative h-[95vh] w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gray-900/50" />
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-6 px-4 text-center text-gray-50 sm:px-6 md:px-8">
          @
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Fyrstikken
          </h1>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Gratulerer til Infinitum av Elias Reitan Arntzen 1MKB som vinner av
            publikumsprisen
          </h1>
          <p className="max-w-[600px] text-lg md:text-xl">
            Her kan du stemme for publikumsprisen, se forskjellige elev
            prosjekter og lære mer om de.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/year/${currentYear}#categories`}>
              <Button variant="default">Utforsk kategorier</Button>
            </Link>
            <RandomCategory year={currentYear} />
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16 md:py-20" id="categories">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(data.categories)
              .sort(() => Math.random() - 0.5)
              .map((category) => (
                <Link
                  className="text-primary-500"
                  href={`/year/${currentYear}/category/${category.id}`}
                  key={category.id}
                >
                  <Card
                    key={category.title}
                    className="group h-full w-full overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg"
                  >
                    <CardContent>
                      <Image
                        alt={category.title}
                        className="aspect-w-16 aspect-h-9 w-full object-cover object-center transition-all group-hover:scale-105"
                        height={360}
                        src={category.image}
                        width={640}
                      />
                      <div className="mt-4 space-y-2 p-6">
                        <h3 className="text-xl font-semibold">
                          {category.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {category.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
