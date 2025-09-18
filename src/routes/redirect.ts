import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Redirect handler for /go/:slug
router.get('/go/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Find the redirect link
    const redirectLink = await prisma.redirectLink.findUnique({
      where: { slug, isActive: true }
    });
    
    if (!redirectLink) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Extract request information
    const userAgent = req.get('User-Agent') || null;
    const referer = req.get('Referer') || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    
    // Extract source and campaign from query parameters
    const source = req.query.source as string || null;
    const campaign = req.query.campaign as string || null;
    
    // Record the click
    await prisma.click.create({
      data: {
        linkId: redirectLink.id,
        userAgent,
        referer,
        ipAddress,
        source,
        campaign,
      }
    });
    
    // Redirect to target URL
    res.redirect(302, redirectLink.targetUrl);
    
  } catch (error: any) {
    process.stderr.write(`Redirect error: ${error}\n`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
