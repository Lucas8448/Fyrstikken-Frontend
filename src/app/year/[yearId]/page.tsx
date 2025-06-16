import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CardContent, Card } from "@/components/ui/card";
import RandomCategory from "@/components/randomCategory";
import RandomProject from "@/components/randomProject";
import { promises as fs } from "fs";
import Image from "next/image";
import path from "path";

interface Data {
  categories: {
    id: number;
    title: string;
    description: string;
    image: string;
  }[];
}

export default async function Component({ params }: {params: { yearId: string}}) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    params.yearId,
    "categories.json"
  );
  const file = await fs.readFile(filePath, "utf8");
  const data: Data = JSON.parse(file);

  // Map of categoryId to available images
  const imageMap: Record<string, string[]> = {
    "100": ["101.jpg","102.jpg","103.jpg","104.jpg","105.jpg","106.jpg","107.jpg","108.jpg"],
    "110": ["111.jpg","112.jpg","113.jpg","114.jpg","115.jpg","116.jpg","117.jpg","118.jpg"],
    "120": ["120.png","121.jpg","122.jpg","124.jpg"],
    "130": ["131.jpg","132.jpg","133.jpg","134.jpg","135.jpg","136.jpg","137.jpg","138.jpg"],
    "140": ["141.jpg","142.jpg","143.jpg","144.jpg","145.jpg","146.jpg"],
    "150": ["151.jpg","152.jpg","153.jpg","154.jpg","155.jpg","156.jpg"],
    "160": ["161.jpg","162.jpg","163.jpg","164.jpg","165.jpg","166.jpg","167.jpg","168.jpg"],
    "170": ["171.jpg","172.jpg","173.jpg","174.jpg"],
    "180": ["181.jpg","182.jpg","183.jpg","184.jpg","185.jpg","186.jpg","187.jpg","188.jpg"],
    "190": ["191.jpg","192.jpg","193.jpg","194.jpg","195.jpg","196.jpg","197.jpg"],
    "200": ["201.jpg","202.jpg","203.jpg","204.jpg","205.jpg","206.jpg","207.jpg","208.jpg"]
  };

  // Helper to get a random image for a category
  function getRandomImage(categoryId: number) {
    const id = String(categoryId);
    const images = imageMap[id];
    if (images && images.length > 0) {
      const file = images[Math.floor(Math.random() * images.length)];
      return `/data/${params.yearId}/images/${id}/${file}`;
    }
    // fallback to default image
    return data.categories.find((c: any) => c.id === categoryId)?.image || "/background.jpg";
  }

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
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-6 px-4 text-center text-gray-50 sm:px-6 md:px-8">@
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Fyrstikken
          </h1>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Gratulerer til Infinitum av Elias Reitan Arntzen 1MKB som vinner av publikumsprisen
          </h1>
          <p className="max-w-[600px] text-lg md:text-xl">
            Her kan du stemme for publikumsprisen, se forskjellige elev
            prosjekter og lære mer om de.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/#categories">
              <Button variant="default">Utforsk kategorier</Button>
            </Link>
            <RandomCategory year={params.yearId} />
            <RandomProject year={params.yearId} />
          </div>
        </div>
      </section>
      <section
        className="py-12 sm:py-16 md:py-20"
        id="categories"
      >
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(data.categories)
              .sort(() => Math.random() - 0.5)
              .map((category) => (
                <Link
                  className="text-primary-500"
                  href={`/year/${params.yearId}/category/${category.id}`}
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
                        src={getRandomImage(category.id)}
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
