import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database and setting up for real data...');

  // Delete all existing test click data
  await prisma.click.deleteMany({});
  console.log('Deleted all test click data');

  // Create main redirect links for blog tracking
  const sampleLinks = [
    {
      slug: 'kakao',
      targetUrl: 'https://open.kakao.com/o/sBSdpISh',
      title: '카카오톡 오픈채팅',
      description: '카카오톡 상담 링크 (6개 블로그별 추적)'
    },
    {
      slug: 'call',
      targetUrl: 'tel:01066357431',
      title: '전화 상담',
      description: '전화 상담 링크 (6개 블로그별 추적)'
    }
  ];

  for (const linkData of sampleLinks) {
    const link = await prisma.redirectLink.upsert({
      where: { slug: linkData.slug },
      update: linkData, // Update existing links with latest info
      create: linkData
    });
    console.log(`Created/updated link: ${link.slug}`);
  }

  // No test data creation - only real clicks will be recorded when users actually click links
  console.log('Ready to track real clicks from 6 blogs: HAUD, HanPro, Baek, Kang, DanPro, LaHom');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
