import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  const passwordHash = await hash("123456", 1);
  
  const userOne = await prisma.user.create({
    data: {
      id: faker.string.uuid(),
      name: "John Doe",
      email: "johndoe@acme.com",
      avatarUrl: "https://github.com/diego3g.png",
      passwordHash,
    },
  });
  const userTwo = await prisma.user.create({
    data: {
      id: faker.string.uuid(),
      name: "Jane Doe",
      email: "janedoe@hotmail.com",
      avatarUrl: "https://github.com/diego3g.png",
      passwordHash,
    },
  });
  const userThree = await prisma.user.create({
    data: {
      id: faker.string.uuid(),
      name: "Connor Morgan",
      email: "connormorgan@hotmail.com",
      avatarUrl: "https://github.com/diego3g.png",
      passwordHash,
    },
  });

  await prisma.organization.create({
    data: {
      name: "Acme Inc(Admin)",
      slug: "acme-admin",
      avatarUrl: faker.image.avatarGitHub(),
      owner: {
        connect: {
          id: userOne.id,
        },
      },
      projects: {
        createMany:{
          data:[
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userOne.id,
            }, {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userTwo.id,
            }, {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userThree.id,
            },
          ]
        }
      },
      members: {
        createMany: {
          data: [
            {
              userId: userOne.id,
              role: "ADMIN",
            },
            {
              userId: userTwo.id,
              role: "ADMIN",
            },
            {
              userId: userThree.id,
              role: "ADMIN",
            },
          ],
        },
      },
    },
  });
  await prisma.organization.create({
    data: {
      name: "Acme Inc(Member)",
      slug: "acme-member",
      avatarUrl: faker.image.avatarGitHub(),
      owner: {
        connect: {
          id: userOne.id,
        },
      },
      projects: {
        createMany:{
          data:[
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userOne.id,
            }, {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userTwo.id,
            }, {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userThree.id,
            },
          ]
        }
      },
      members: {
        createMany: {
          data: [
            {
              userId: userOne.id,
              role: "MEMBER",
            },
            {
              userId: userTwo.id,
              role: "ADMIN",
            },
            {
              userId: userThree.id,
              role: "BILLING",
            },
          ],
        },
      },
    },
  });
  await prisma.organization.create({
    data: {
      name: "Acme Inc(Billing)",
      slug: "acme-billing",
      avatarUrl: faker.image.avatarGitHub(),
      owner: {
        connect: {
          id: userOne.id,
        },
      },
      projects: {
        createMany:{
          data:[
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userOne.id,
            }, {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userTwo.id,
            }, {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              userId: userThree.id,
            },
          ]
        }
      },
      members: {
        createMany: {
          data: [
            {
              userId: userOne.id,
              role: "BILLING",
            },
            {
              userId: userTwo.id,
              role: "MEMBER",
            },
            {
              userId: userThree.id,
              role: "ADMIN",
            },
          ],
        },
      },
    },
  });
}

seed().then(() => console.log("Database seeded"));
