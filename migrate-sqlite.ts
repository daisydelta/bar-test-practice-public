import { PrismaClient as SqlitePrismaClient } from "./generated/sqlite-client";
import { PrismaClient as PostgresPrismaClient } from "@prisma/client";

const sqlite = new SqlitePrismaClient();
const postgres = new PostgresPrismaClient();

async function main() {
  console.log("Reading SQLite database...");

  const subjects = await sqlite.subject.findMany();
  const topics = await sqlite.topic.findMany();
  const questions = await sqlite.question.findMany();
  const legalReferences = await sqlite.legalReference.findMany();

  console.log(`Found ${subjects.length} subjects`);
  console.log(`Found ${topics.length} topics`);
  console.log(`Found ${questions.length} questions`);
  console.log(`Found ${legalReferences.length} legal references`);

  console.log("Copying subjects...");
  for (const item of subjects) {
    await postgres.subject.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }

  console.log("Copying topics...");
  for (const item of topics) {
    await postgres.topic.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log("Copying questions...");
  for (const item of questions) {
    await postgres.question.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log("Copying legal references...");
  for (const item of legalReferences) {
    await postgres.legalReference.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log("Migration completed successfully!");
}

main()
  .catch((error) => {
    console.error("Migration failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });