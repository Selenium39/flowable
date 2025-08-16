#!/usr/bin/env node

/**
 * Post-build script to fix sitemap.xml by removing duplicate /index URL
 * This script should be run after the build process to clean up the generated sitemap
 */

const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(__dirname, '../build/flowable-userguide/sitemap.xml');

function fixSitemap() {
  try {
    // Check if sitemap exists
    if (!fs.existsSync(SITEMAP_PATH)) {
      console.log('❌ Sitemap not found at:', SITEMAP_PATH);
      console.log('💡 Make sure to run this script after building the site');
      return;
    }

    // Read the current sitemap
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
    
    // Remove any URLs that end with /index (but keep the root / URL)
    // This regex will match URLs like <loc>https://flowable.me/index</loc>
    const fixedContent = sitemapContent.replace(
      /<url>\s*<loc>[^<]*\/index<\/loc>[\s\S]*?<\/url>/g,
      ''
    );
    
    // Clean up any extra whitespace that might be left
    const cleanedContent = fixedContent.replace(/\n\s*\n/g, '\n');
    
    // Write the fixed sitemap back
    fs.writeFileSync(SITEMAP_PATH, cleanedContent, 'utf8');
    
    console.log('✅ Sitemap fixed successfully!');
    console.log('📄 Removed duplicate /index URLs from sitemap.xml');
    console.log('🔍 SEO issue resolved - no more duplicate content between / and /index');
    
  } catch (error) {
    console.error('❌ Error fixing sitemap:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixSitemap();
