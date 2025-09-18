import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Admin dashboard
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get all redirect links with click statistics
    const links = await prisma.redirectLink.findMany({
      include: {
        _count: {
          select: { clicks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total clicks
    const totalClicks = await prisma.click.count();
    
    // Get recent clicks (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentClicks = await prisma.click.count({
      where: {
        clickedAt: {
          gte: yesterday
        }
      }
    });
    
    // Get top performing links
    const topLinks = await prisma.redirectLink.findMany({
      include: {
        _count: {
          select: { clicks: true }
        }
      },
      orderBy: {
        clicks: {
          _count: 'desc'
        }
      },
      take: 5
    });
    
    // Get clicks by source (blog)
    const clicksBySourceRaw = await prisma.$queryRaw`
      SELECT 
        COALESCE(source, 'direct') as source,
        COUNT(*) as count
      FROM clicks 
      GROUP BY source
      ORDER BY count DESC
    ` as Array<{ source: string; count: bigint }>;
    
    const clicksBySource = clicksBySourceRaw.map(item => ({
      source: item.source,
      count: Number(item.count)
    }));
    
    // Get recent clicks by source (last 24 hours)
    const recentClicksBySourceRaw = await prisma.$queryRaw`
      SELECT 
        COALESCE(source, 'direct') as source,
        COUNT(*) as count
      FROM clicks 
      WHERE clickedAt >= datetime('now', '-1 day')
      GROUP BY source
      ORDER BY count DESC
    ` as Array<{ source: string; count: bigint }>;
    
    const recentClicksBySource = recentClicksBySourceRaw.map(item => ({
      source: item.source,
      count: Number(item.count)
    }));
    
    res.render('admin/dashboard', {
      links,
      totalClicks,
      recentClicks,
      topLinks,
      clicksBySource,
      recentClicksBySource,
      title: '관리자 대시보드'
    });
    
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Link details page
router.get('/link/:id', async (req: Request, res: Response) => {
  try {
    const linkId = parseInt(req.params.id);
    
    const link = await prisma.redirectLink.findUnique({
      where: { id: linkId },
      include: {
        clicks: {
          orderBy: { clickedAt: 'desc' },
          take: 100
        },
        _count: {
          select: { clicks: true }
        }
      }
    });
    
    if (!link) {
      return res.status(404).render('admin/error', { 
        message: '링크를 찾을 수 없습니다',
        title: '오류'
      });
    }
    
    // Group clicks by date for chart
    const clicksByDateRaw = await prisma.$queryRaw`
      SELECT 
        DATE(clickedAt) as date,
        COUNT(*) as count
      FROM clicks 
      WHERE linkId = ${linkId}
      GROUP BY DATE(clickedAt)
      ORDER BY date DESC
      LIMIT 30
    ` as Array<{ date: string; count: bigint }>;
    
    const clicksByDate = clicksByDateRaw.map(item => ({
      date: item.date,
      count: Number(item.count)
    }));
    
    res.render('admin/link-details', {
      link,
      clicksByDate,
      title: `링크 상세 - ${link.slug}`
    });
    
  } catch (error: any) {
    console.error('Link details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new link form
router.get('/create', (req: Request, res: Response) => {
  res.render('admin/create-link', { title: '새 링크 생성' });
});

// Create new link handler
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { slug, targetUrl, title, description } = req.body;
    
    // Check if slug already exists
    const existingLink = await prisma.redirectLink.findUnique({
      where: { slug }
    });
    
    if (existingLink) {
      return res.render('admin/create-link', {
        title: '새 링크 생성',
        error: '슬러그가 이미 존재합니다',
        formData: { slug, targetUrl, title, description }
      });
    }
    
    await prisma.redirectLink.create({
      data: {
        slug,
        targetUrl,
        title: title || null,
        description: description || null
      }
    });
    
    res.redirect('/admin?success=created');
    
  } catch (error: any) {
    console.error('Create link error:', error);
    res.render('admin/create-link', {
      title: '새 링크 생성',
      error: '링크 생성에 실패했습니다',
      formData: req.body
    });
  }
});

// Toggle link status
router.post('/toggle/:id', async (req: Request, res: Response) => {
  try {
    const linkId = parseInt(req.params.id);
    
    const link = await prisma.redirectLink.findUnique({
      where: { id: linkId }
    });
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await prisma.redirectLink.update({
      where: { id: linkId },
      data: { isActive: !link.isActive }
    });
    
    res.redirect('/admin');
    
  } catch (error: any) {
    console.error('Toggle link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Blog analytics page
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    // Get clicks by source with date range
    const clicksBySourceAndDateRaw = await prisma.$queryRaw`
      SELECT 
        COALESCE(source, 'direct') as source,
        DATE(clickedAt) as date,
        COUNT(*) as count
      FROM clicks 
      WHERE clickedAt >= datetime('now', '-30 days')
      GROUP BY source, DATE(clickedAt)
      ORDER BY date DESC, count DESC
    ` as Array<{ source: string; date: string; count: bigint }>;
    
    const clicksBySourceAndDate = clicksBySourceAndDateRaw.map(item => ({
      source: item.source,
      date: item.date,
      count: Number(item.count)
    }));
    
    // Get total clicks by source
    const totalClicksBySourceRaw = await prisma.$queryRaw`
      SELECT 
        COALESCE(source, 'direct') as source,
        COUNT(*) as count,
        COUNT(DISTINCT linkId) as unique_links
      FROM clicks 
      GROUP BY source
      ORDER BY count DESC
    ` as Array<{ source: string; count: bigint; unique_links: bigint }>;
    
    const totalClicksBySource = totalClicksBySourceRaw.map(item => ({
      source: item.source,
      count: Number(item.count),
      unique_links: Number(item.unique_links)
    }));
    
    // Get clicks by source for each link
    const linksBySourceRaw = await prisma.$queryRaw`
      SELECT 
        rl.slug,
        rl.title,
        COALESCE(c.source, 'direct') as source,
        COUNT(*) as count
      FROM clicks c
      JOIN redirect_links rl ON c.linkId = rl.id
      GROUP BY rl.id, rl.slug, rl.title, c.source
      ORDER BY count DESC
    ` as Array<{ slug: string; title: string; source: string; count: bigint }>;
    
    const linksBySource = linksBySourceRaw.map(item => ({
      slug: item.slug,
      title: item.title,
      source: item.source,
      count: Number(item.count)
    }));
    
    // Get hourly distribution by source (last 7 days)
    const hourlyDistributionRaw = await prisma.$queryRaw`
      SELECT 
        COALESCE(source, 'direct') as source,
        strftime('%H', clickedAt) as hour,
        COUNT(*) as count
      FROM clicks 
      WHERE clickedAt >= datetime('now', '-7 days')
      GROUP BY source, hour
      ORDER BY hour
    ` as Array<{ source: string; hour: string; count: bigint }>;
    
    const hourlyDistribution = hourlyDistributionRaw.map(item => ({
      source: item.source,
      hour: item.hour,
      count: Number(item.count)
    }));
    
    res.render('admin/analytics', {
      clicksBySourceAndDate,
      totalClicksBySource,
      linksBySource,
      hourlyDistribution,
      title: '블로그 분석'
    });
    
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
