#!/usr/bin/env node
/**
 * Shubham K Mart Brand Guidelines MCP Server
 * Model Context Protocol (MCP) JSON-RPC 2.0 Server over Stdio
 * 
 * Exposes tools, resources, and prompts for AI assistants (Codex, Antigravity,
 * Claude Desktop, Cursor, Windsurf) to access brand guidelines, design tokens,
 * official logos, template generators, and compliance validators.
 */

import readline from 'node:readline';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chapters, palette, campaignPalette, complementaryPalette, colorCombinations, gradientIdeas, paletteMatrix, brandRecommendation, tokens} from './src/data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const tokenCSS = `:root {
  --brand-green: #39823C;
  --brand-gold: #F3CB2D;
  --brand-yellow: #F3CB2D;
  --brand-green-deep: #214B32;
  --text-primary: #192C20;
  --text-inverse: #FFFFFF;
  --text-charcoal: #111827;
  --surface-base: #FFFFFF;
  --surface-warm: #FBFAF4;
  --surface-mint: #D9F7E5;
  --surface-golden-cream: #FFF7D6;
  --border-default: #E2E8DE;
  /* Campaign & Promotion Inspiration Colors */
  --campaign-orange: #FF941A;
  --campaign-red: #E63946;
  --campaign-mint: #D9F7E5;
  --campaign-charcoal: #111827;
  --campaign-forest-green: #1B5E20;
  --campaign-golden-cream: #FFF7D6;
  --campaign-purple: #7C3AED;
  --campaign-sky-blue: #38BDF8;
  --campaign-mint-bright: #A7E3A1;
  /* Category Complementary Palette */
  --category-red: #D8232A;
  --category-orange: #F37021;
  --category-plum: #3E162F;
  --category-terracotta: #C86D51;
  --category-lilac: #9678B6;
  --category-cocoa: #3D1E16;
  --category-cyan: #00A3E0;
  --font-latin: 'Inter', system-ui, sans-serif;
  --font-devanagari: 'Noto Sans Devanagari', sans-serif;
  --space-1: 4px; --space-2: 8px;
  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px;
  --space-12: 48px; --space-16: 64px;
  --radius-sm: 8px; --radius-md: 12px;
  --radius-lg: 16px;
  --content-width: 1200px;
  --button-height: 48px;
  --target-size: 44px;
  --motion-fast: 150ms;
  --motion-standard: 250ms;
}`;

// Cache loaded SVG assets
let yellowBagSvg = null;
let greenBagSvg = null;

async function getYellowBagSvg() {
  if (!yellowBagSvg) {
    yellowBagSvg = await readFile(path.join(__dirname, 'public/assets/logo-bag-only-yellow-transparent.svg'), 'utf8');
  }
  return yellowBagSvg;
}

async function getGreenBagSvg() {
  if (!greenBagSvg) {
    greenBagSvg = await readFile(path.join(__dirname, 'public/assets/logo-bag-only-green-transparent.svg'), 'utf8');
  }
  return greenBagSvg;
}

export const TOOLS = [
  {
    name: 'get_brand_tokens',
    description: 'Retrieve official Shubham K Mart design tokens including colors, typography, spacing, border radius, content width, and animation timings.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'css'],
          description: 'Format to return tokens in. Default is "json".',
          default: 'json'
        }
      }
    }
  },
  {
    name: 'get_brand_colors',
    description: 'Retrieve the Shubham K Mart color palette with exact HEX codes, UI roles, and WCAG 2.2 AA accessibility contrast pairings.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_brand_logo',
    description: 'Retrieve the official Shubham K Mart logo (SVG vector code, base64 data URI, raw PNG base64, or file paths) and mandatory background rules. Note: The 4 supplied files (yellow SVG/PNG, green SVG/PNG) are the ONLY authorized logos in existence; named wordmarks or other marks are strictly prohibited.',
    inputSchema: {
      type: 'object',
      properties: {
        color: {
          type: 'string',
          enum: ['yellow', 'green'],
          description: '"yellow" for yellow logo on Brand Green (#39823C), "green" for green logo on Brand Yellow (#F3CB2D).'
        },
        format: {
          type: 'string',
          enum: ['svg', 'data_uri', 'info', 'png_base64'],
          description: 'Return raw SVG code, base64 data URI, metadata/paths, or base64-encoded PNG. Default is "svg".',
          default: 'svg'
        }
      },
      required: ['color']
    }
  },
  {
    name: 'search_brand_guidelines',
    description: 'Search across all 18 Shubham K Mart digital brand guideline chapters (mission, colors, typography, logo placement, layout, banners, website UI, accessibility, tokens, assets, release checklist, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword or topic (e.g., "banner", "logo placement", "tagline", "buttons", "contrast", "font weights").'
        },
        chapter_id: {
          type: 'string',
          description: 'Optional chapter ID to narrow results (e.g., "logo", "logo-placement", "colors", "typography", "banners", "website").'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'generate_digital_template',
    description: 'Generate a production-ready, standards-compliant SVG banner template (web banner 1080x600, app banner 1080x600, or Open Graph 1200x630) featuring the official logo and Inter typography.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['web_banner', 'app_banner', 'og_image'],
          description: 'Format type: web_banner (1080x600 · Brand Green), app_banner (1080x600 · Brand Yellow), or og_image (1200x630 · Brand Green).'
        },
        headline: {
          type: 'string',
          description: 'Primary headline text (default: "Ghar ki list, ab thodi easier.")'
        },
        subheadline: {
          type: 'string',
          description: 'Supporting copy line (default: "A little everyday warmth.")'
        },
        theme: {
          type: 'string',
          enum: ['gold_canvas', 'green_canvas'],
          description: 'Background theme: "gold_canvas" (#F3CB2D with green logo) or "green_canvas" (#39823C with yellow logo).'
        }
      },
      required: ['type']
    }
  },
  {
    name: 'generate_social_template',
    description: 'Generate a digital banner or layout template (web_banner 1080x600, app_banner 1080x600, or og_image 1200x630). Feed and stories have been retired in favor of web and app banners.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['web_banner', 'app_banner', 'og_image', 'feed_portrait', 'feed_square', 'story'],
          description: 'Format type: web_banner (1080x600), app_banner (1080x600), or og_image (1200x630).'
        },
        headline: {
          type: 'string',
          description: 'Primary headline text (default: "Ghar ki list, ab thodi easier.")'
        },
        subheadline: {
          type: 'string',
          description: 'Supporting copy line (default: "A little everyday warmth.")'
        },
        theme: {
          type: 'string',
          enum: ['gold_canvas', 'green_canvas'],
          description: 'Background theme: "gold_canvas" (#F3CB2D with green logo) or "green_canvas" (#39823C with yellow logo). Default is "gold_canvas".',
          default: 'gold_canvas'
        }
      },
      required: ['type']
    }
  },
  {
    name: 'validate_brand_design',
    description: 'Audit a proposed design, banner, post, or UI component against Shubham K Mart brand guidelines. Detects unapproved wordmarks, illegal logo-background pairings, non-brand fonts, and WCAG contrast failures.',
    inputSchema: {
      type: 'object',
      properties: {
        logo_type: {
          type: 'string',
          enum: ['logo_yellow', 'logo_green', 'bag_symbol_yellow', 'bag_symbol_green', 'named_logo_wordmark', 'none'],
          description: 'The logo variant being used ("logo_yellow", "logo_green", "named_logo_wordmark", "none").'
        },
        background_color: {
          type: 'string',
          description: 'HEX code of the surface behind the logo (e.g., "#39823C", "#F3CB2D", "#FFFFFF").'
        },
        text_color: {
          type: 'string',
          description: 'HEX code of the text on this surface (e.g., "#FFFFFF", "#214B32", "#192C20").'
        },
        font_family: {
          type: 'string',
          description: 'Font family name being used (e.g., "Inter", "Roboto", "Helvetica").'
        },
        tagline: {
          type: 'string',
          description: 'Any brand tagline text used.'
        }
      }
    }
  },
  {
    name: 'get_brand_asset',
    description: 'Retrieve any official brand asset (logos, banners, templates, tokens, brand guide) including absolute local file paths, MIME types, raw text, and base64 data URIs for direct use in code, designs, or image generation.',
    inputSchema: {
      type: 'object',
      properties: {
        asset_id: {
          type: 'string',
          enum: [
            'logo_yellow_svg',
            'logo_yellow_png',
            'logo_green_svg',
            'logo_green_png',
            'web_banner_template',
            'app_banner_template',
            'og_image_template',
            'tokens_css',
            'tokens_json',
            'brand_guide_text'
          ],
          description: 'Identifier of the asset to retrieve.'
        }
      },
      required: ['asset_id']
    }
  }
];

export const RESOURCES = [
  {
    uri: 'brand://tokens/css',
    name: 'CSS Design Tokens',
    description: 'Shubham K Mart CSS custom properties (--brand-green, --brand-yellow, typography, spacing, radius).',
    mimeType: 'text/css'
  },
  {
    uri: 'brand://tokens/json',
    name: 'JSON Design Tokens',
    description: 'Shubham K Mart semantic design token values in JSON format.',
    mimeType: 'application/json'
  },
  {
    uri: 'brand://guidelines/text',
    name: 'Full Text Brand Guidelines',
    description: 'Complete plain-text brand book covering color palette, logo rules, typography, digital layout, and compliance.',
    mimeType: 'text/plain'
  },
  {
    uri: 'brand://logos/yellow.svg',
    name: 'Yellow Logo (SVG Master)',
    description: 'Vector SVG master of the official yellow logo. Permitted ONLY on Brand Green #39823C.',
    mimeType: 'image/svg+xml'
  },
  {
    uri: 'brand://logos/yellow.png',
    name: 'Yellow Logo (PNG Master)',
    description: 'Official 2160 × 2160 transparent PNG master of the yellow logo. Permitted ONLY on Brand Green #39823C.',
    mimeType: 'image/png'
  },
  {
    uri: 'brand://logos/green.svg',
    name: 'Green Logo (SVG Master)',
    description: 'Vector SVG master of the official green logo. Permitted ONLY on Brand Yellow #F3CB2D.',
    mimeType: 'image/svg+xml'
  },
  {
    uri: 'brand://logos/green.png',
    name: 'Green Logo (PNG Master)',
    description: 'Official 2160 × 2160 transparent PNG master of the green logo. Permitted ONLY on Brand Yellow #F3CB2D.',
    mimeType: 'image/png'
  },
  {
    uri: 'brand://templates/web-banner.svg',
    name: 'Web Banner Template (1080 × 600 SVG)',
    description: 'Official production SVG layout template for web banners on Brand Green #39823C with official yellow logo.',
    mimeType: 'image/svg+xml'
  },
  {
    uri: 'brand://templates/app-banner.svg',
    name: 'App Banner Template (1080 × 600 SVG)',
    description: 'Official production SVG layout template for in-app banners on Brand Yellow #F3CB2D with official green logo.',
    mimeType: 'image/svg+xml'
  },
  {
    uri: 'brand://templates/og-image.svg',
    name: 'Open Graph Image Template (1200 × 630 SVG)',
    description: 'Official production SVG template for Open Graph and Twitter card social previews.',
    mimeType: 'image/svg+xml'
  }
];

export const PROMPTS = [
  {
    name: 'create_app_banner',
    description: 'Prompt guiding an AI on how to design an on-brand 1080x600 in-app promotional banner for Shubham K Mart.',
    arguments: [
      { name: 'campaign_name', description: 'Name of the campaign or offer', required: true }
    ]
  },
  {
    name: 'create_social_post',
    description: 'Prompt guiding an AI on how to design an on-brand digital banner for Shubham K Mart.',
    arguments: [
      { name: 'topic', description: 'Topic or promotion for the banner', required: true },
      { name: 'format', description: 'web_banner (1080x600) or app_banner (1080x600)', required: false }
    ]
  },
  {
    name: 'create_web_banner',
    description: 'Prompt guiding an AI on how to design a responsive 1080x600 digital web banner.',
    arguments: [
      { name: 'campaign_name', description: 'Name of the campaign or offer', required: true }
    ]
  },
  {
    name: 'audit_design_spec',
    description: 'Prompt guiding an AI to review an existing creative design or frontend snippet for brand guideline compliance.',
    arguments: [
      { name: 'design_description', description: 'Details of the design, colors, font, and copy', required: true }
    ]
  }
];

export async function executeTool(name, args = {}) {
  switch (name) {
    case 'get_brand_tokens': {
      const format = args.format === 'css' ? 'css' : 'json';
      if (format === 'css') {
        return { content: [{ type: 'text', text: tokenCSS }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(tokens, null, 2) }] };
    }

    case 'get_brand_colors': {
      const data = {
        brand: 'Shubham K Mart',
        palette: palette.map(([name, hex, role]) => ({ name, hex, role })),
        campaignPalette: campaignPalette.map(([name, hex, category, usage]) => ({
          name,
          hex,
          category,
          usage
        })),
        complementaryPalette: complementaryPalette.map(c => Array.isArray(c) ? ({
          name: c[0],
          hex: c[1],
          category: c[2],
          role: c[3]
        }) : ({
          name: c.name,
          hex: c.hex,
          category: c.category,
          role: c.role
        })),
        colorCombinations,
        gradientIdeas,
        paletteMatrix,
        brandRecommendation,
        contrastRules: [
          { pair: 'White (#FFFFFF) on Brand Green (#39823C)', ratio: '4.74:1', status: 'PASS (WCAG AA for normal text)' },
          { pair: 'Deep Green (#214B32) on Brand Yellow (#F3CB2D)', ratio: '6.33:1', status: 'PASS (WCAG AA for normal text)' },
          { pair: 'Yellow (#F3CB2D) on Brand Green (#39823C)', ratio: '3.02:1', status: 'PASS for large text only (>=24px or bold >=19px)' },
          { pair: 'White (#FFFFFF) on Brand Yellow (#F3CB2D)', ratio: '1.57:1', status: 'FAIL - Avoid functional text; always use Deep Green on Yellow' }
        ],
        logoBackgroundRules: [
          'Yellow transparent logo MUST sit on solid #39823C Brand Green ONLY.',
          'Green transparent logo MUST sit on solid #F3CB2D Brand Yellow ONLY.',
          'Never place transparent logos directly on white, cream, black, gradients, or busy photography.',
          'Campaign and complementary category colors are strictly for promotional canvases. Every promotional asset must preserve the official Shubham K Mart brand anchor with its designated background.'
        ]
      };
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }

    case 'get_brand_logo': {
      const color = args.color;
      if (color !== 'yellow' && color !== 'green') {
        return {
          isError: true,
          content: [{ type: 'text', text: 'Invalid color. Must be "yellow" (for Brand Green background #39823C) or "green" (for Brand Yellow background #F3CB2D).' }]
        };
      }
      const svg = color === 'yellow' ? await getYellowBagSvg() : await getGreenBagSvg();
      const permittedBg = color === 'yellow' ? '#39823C (Brand Green only)' : '#F3CB2D (Brand Yellow only)';
      const filename = `logo-bag-only-${color}-transparent.svg`;
      const pngFilename = `logo-bag-only-${color}-transparent.png`;

      const format = args.format || 'svg';
      if (format === 'data_uri') {
        const base64 = Buffer.from(svg).toString('base64');
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              color,
              permittedBackground: permittedBg,
              dataUri: `data:image/svg+xml;base64,${base64}`,
              filename,
              pngFilename,
              clearSpaceRule: '0.25 × logo width minimum on all sides',
              rule: 'The logo is the sole visual brand mark. No named wordmarks or reconstructed typography lockups are permitted.'
            }, null, 2)
          }]
        };
      }

      if (format === 'png_base64') {
        const pngBuf = await readFile(path.join(__dirname, `public/assets/${pngFilename}`));
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              color,
              file: pngFilename,
              permittedBackground: permittedBg,
              base64: pngBuf.toString('base64'),
              mimeType: 'image/png',
              rule: `The 4 official logo files are the only permitted brand marks. Permitted background: ${permittedBg}`
            }, null, 2)
          }]
        };
      }

      if (format === 'info') {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              color,
              file: filename,
              pngFile: pngFilename,
              dimensions: '2160 × 2160 px vector master',
              permittedBackground: permittedBg,
              clearSpace: '0.25 × logo width minimum on each side',
              officialRule: 'The logo is the sole visual brand mark. No named wordmark logos are permitted in brand communications.'
            }, null, 2)
          }]
        };
      }

      // Default: Return raw SVG code with metadata header comment
      return {
        content: [{
          type: 'text',
          text: `<!-- Shubham K Mart Official Logo (${color}) | Permitted Background: ${permittedBg} | Wordmark prohibited -->\n${svg}`
        }]
      };
    }

    case 'search_brand_guidelines': {
      const q = (args.query || '').toLowerCase().trim();
      if (!q) {
        return { isError: true, content: [{ type: 'text', text: 'Query parameter is required.' }] };
      }

      const chapterId = (args.chapter_id || '').toLowerCase().trim();
      const matched = chapters.filter(c => {
        if (chapterId && c.id !== chapterId) return false;
        const fullText = JSON.stringify(c).toLowerCase();
        return fullText.includes(q) || (c.title && c.title.toLowerCase().includes(q)) || (c.nav && c.nav.toLowerCase().includes(q));
      });

      if (!matched.length) {
        return {
          content: [{
            type: 'text',
            text: `No exact matches found for "${args.query}". Try querying "logo", "colors", "typography", "banners", "spacing", or "accessibility".`
          }]
        };
      }

      const summary = matched.map(c => ({
        id: c.id,
        nav: c.nav,
        title: c.title,
        intro: c.intro,
        rules: c.rules || [],
        table: c.table || null,
        cards: c.cards || []
      }));

      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    }

    case 'generate_digital_template':
    case 'generate_social_template': {
      const type = args.type;
      const dims = {
        feed_portrait: [1080, 1350, 64, false, false],
        feed_square: [1080, 1080, 64, false, false],
        story: [1080, 1920, 64, true, false],
        web_banner: [1080, 600, 48, false, true],
        app_banner: [1080, 600, 48, false, true],
        og_image: [1200, 630, 64, false, true]
      }[type];

      if (!dims) {
        return { isError: true, content: [{ type: 'text', text: `Invalid type "${type}". Allowed: web_banner, app_banner, og_image.` }] };
      }

      const [w, h, inset, isStory, isBanner] = dims;
      const theme = args.theme === 'green_canvas' ? 'green_canvas' : 'gold_canvas';
      const bgColor = theme === 'green_canvas' ? '#39823C' : '#F3CB2D';
      const textColor = theme === 'green_canvas' ? '#FFFFFF' : '#214B32';
      const subtextColor = theme === 'green_canvas' ? '#E1E9D7' : '#4B683B';
      const top = isStory ? 270 : inset;
      const rawLogoSvg = theme === 'green_canvas' ? await getYellowBagSvg() : await getGreenBagSvg();
      const croppedLogoSvg = rawLogoSvg.replace(/viewBox="0 0 2160 2160"/, 'viewBox="819 730 560 741"');
      const bagBase64 = Buffer.from(croppedLogoSvg).toString('base64');

      let logoW = 140, logoH = 185, headY = 350, subY = 440;
      if (isStory) {
        logoW = 130; logoH = 172; headY = 570; subY = 660;
      } else if (isBanner) {
        logoW = 110; logoH = 145; headY = 265; subY = 330;
      } else if (type === 'og_image') {
        logoW = 115; logoH = 152; headY = 290; subY = 365;
      } else if (type === 'feed_square') {
        logoW = 130; logoH = 172; headY = 330; subY = 415;
      }

      const headline = args.headline || 'Ghar ki list, ab thodi easier.';
      const subheadline = args.subheadline || 'A little everyday warmth.';

      const template = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>Shubham K Mart ${type} branded template</title>
  <desc>Official digital template generated via Shubham K Mart Brand MCP Server. Inter font hierarchy and prominent vector logo embedded.</desc>
  <rect width="${w}" height="${h}" fill="${bgColor}"/>
  ${isStory ? `<!-- Safe area exclusions: Top 250px, Bottom 350px -->
  <rect x="0" y="0" width="${w}" height="250" fill="#000000" fill-opacity="0.12"/>
  <rect x="0" y="${h - 350}" width="${w}" height="350" fill="#000000" fill-opacity="0.12"/>
  <text x="${inset}" y="140" fill="${textColor}" opacity="0.6" font-family="'Inter', Arial, sans-serif" font-size="24" font-weight="600">STORY TOP UI EXCLUSION · 250 PX</text>
  <text x="${inset}" y="${h - 180}" fill="${textColor}" opacity="0.6" font-family="'Inter', Arial, sans-serif" font-size="24" font-weight="600">STORY BOTTOM UI EXCLUSION · 350 PX</text>` : ''}
  <!-- Official Logo (Cropped to visible mark for prominent, bold display) -->
  <image x="${inset}" y="${top}" width="${logoW}" height="${logoH}" xlink:href="data:image/svg+xml;base64,${bagBase64}"/>
  <!-- Typography & Messaging (Inter) -->
  <g fill="${textColor}" font-family="'Inter', system-ui, -apple-system, sans-serif">
    <text x="${inset}" y="${headY}" font-size="${isBanner ? 56 : 84}" font-weight="800" letter-spacing="-0.04em">${headline}</text>
    <text x="${inset}" y="${subY}" font-size="${isBanner ? 24 : 34}" font-weight="400" fill="${subtextColor}">${subheadline}</text>
    <path d="M${inset} ${h - (isStory ? 400 : 95)} H${w - inset}" stroke="${textColor}" stroke-opacity="0.25"/>
    <text x="${inset}" y="${h - (isStory ? 360 : 55)}" font-size="22" font-weight="600">Shubham K Mart</text>
    <text x="${w - inset}" y="${h - (isStory ? 360 : 55)}" font-size="20" font-weight="400" text-anchor="end" fill="${subtextColor}">Shopping karo khulke, paise bachao jamke!</text>
  </g>
</svg>`;

      return {
        content: [
          { type: 'text', text: template }
        ]
      };
    }

    case 'validate_brand_design': {
      const issues = [];
      const passes = [];

      // 1. Check Logo
      if (args.logo_type === 'named_logo_wordmark') {
        issues.push({
          severity: 'ERROR',
          rule: 'Logo only (Chapter 03)',
          message: 'The named wordmark logo is strictly prohibited. Shubham K Mart brand guidelines mandate using the official logo exclusively.'
        });
      } else if (args.logo_type === 'logo_yellow' || args.logo_type === 'logo_green' || args.logo_type === 'bag_symbol_yellow' || args.logo_type === 'bag_symbol_green') {
        passes.push('Used official logo.');
      }

      // 2. Check Logo-Background Pairing
      const bg = (args.background_color || '').toUpperCase().trim();
      const isYellowLogo = args.logo_type === 'logo_yellow' || args.logo_type === 'bag_symbol_yellow';
      const isGreenLogo = args.logo_type === 'logo_green' || args.logo_type === 'bag_symbol_green';

      if (isYellowLogo && bg && bg !== '#39823C') {
        issues.push({
          severity: 'ERROR',
          rule: 'Yellow logo placement rule (Chapter 03)',
          message: `Yellow logo is permitted ONLY on solid Brand Green #39823C. Found background: "${args.background_color}".`
        });
      } else if (isGreenLogo && bg && bg !== '#F3CB2D') {
        issues.push({
          severity: 'ERROR',
          rule: 'Green logo placement rule (Chapter 03)',
          message: `Green logo is permitted ONLY on solid Brand Yellow #F3CB2D. Found background: "${args.background_color}".`
        });
      } else if (bg === '#39823C' || bg === '#F3CB2D') {
        passes.push(`Background color ${bg} matches official logo pairing.`);
      }

      // 3. Check Text Contrast
      const text = (args.text_color || '').toUpperCase().trim();
      if (bg === '#F3CB2D' && (text === '#FFFFFF' || text === '#FFF')) {
        issues.push({
          severity: 'ERROR',
          rule: 'WCAG 2.2 AA Contrast (Chapter 11)',
          message: 'White text on Brand Yellow #F3CB2D has an illegible 1.57:1 contrast ratio. Always use Deep Green (#214B32) text on Yellow (6.33:1 ratio).'
        });
      }

      // 4. Check Typography
      const font = (args.font_family || '').trim();
      if (font && !font.toLowerCase().includes('inter')) {
        issues.push({
          severity: 'WARNING',
          rule: 'Typography standards (Chapter 06)',
          message: `Inter is the official Latin brand typeface. Found "${font}". Use Inter 700/800 for headlines and Inter 400 for body copy.`
        });
      } else if (font) {
        passes.push('Typography utilizes approved Inter font family.');
      }

      // 5. Check Tagline
      const tag = (args.tagline || '').trim();
      if (tag) {
        const official = 'Shopping karo khulke, paise bachao jamke!';
        if (tag.toLowerCase() !== official.toLowerCase()) {
          issues.push({
            severity: 'INFO',
            rule: 'Voice & Language (Chapter 07)',
            message: `Official brand tagline is "${official}". Custom campaign lines support this tagline rather than replacing it.`
          });
        } else {
          passes.push('Official tagline used correctly.');
        }
      }

      const passed = issues.filter(i => i.severity === 'ERROR').length === 0;
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            compliant: passed,
            verdict: passed ? 'PASSED: Design adheres to Shubham K Mart brand guidelines.' : 'FAILED: Brand violations detected that must be corrected.',
            issues,
            passes
          }, null, 2)
        }]
      };
    }

    case 'get_brand_asset': {
      const assetId = args.asset_id;
      const assetMap = {
        logo_yellow_svg: {
          file: 'public/assets/logo-bag-only-yellow-transparent.svg',
          mimeType: 'image/svg+xml',
          isBinary: false,
          description: 'Official yellow transparent logo vector master (SVG).',
          permittedBackground: '#39823C (Brand Green only)',
          rules: 'Permitted ONLY on solid Brand Green #39823C. No named wordmarks or alteration.'
        },
        logo_yellow_png: {
          file: 'public/assets/logo-bag-only-yellow-transparent.png',
          mimeType: 'image/png',
          isBinary: true,
          dimensions: '2160 × 2160 px',
          description: 'Official yellow transparent logo high-res master (PNG).',
          permittedBackground: '#39823C (Brand Green only)',
          rules: 'Permitted ONLY on solid Brand Green #39823C. No named wordmarks or alteration.'
        },
        logo_green_svg: {
          file: 'public/assets/logo-bag-only-green-transparent.svg',
          mimeType: 'image/svg+xml',
          isBinary: false,
          description: 'Official green transparent logo vector master (SVG).',
          permittedBackground: '#F3CB2D (Brand Yellow only)',
          rules: 'Permitted ONLY on solid Brand Yellow #F3CB2D. No named wordmarks or alteration.'
        },
        logo_green_png: {
          file: 'public/assets/logo-bag-only-green-transparent.png',
          mimeType: 'image/png',
          isBinary: true,
          dimensions: '2160 × 2160 px',
          description: 'Official green transparent logo high-res master (PNG).',
          permittedBackground: '#F3CB2D (Brand Yellow only)',
          rules: 'Permitted ONLY on solid Brand Yellow #F3CB2D. No named wordmarks or alteration.'
        },
        web_banner_template: {
          file: 'dist/assets/skm-banner-template.svg',
          mimeType: 'image/svg+xml',
          isBinary: false,
          dimensions: '1080 × 600 px',
          description: 'Official digital web banner SVG layout template on Brand Green with yellow logo.',
          permittedBackground: '#39823C (Brand Green)',
          rules: '48 px safe inset, 110 × 145 px logo in top-left, Inter Bold 700 headline.'
        },
        app_banner_template: {
          file: 'dist/assets/skm-app-banner-template.svg',
          mimeType: 'image/svg+xml',
          isBinary: false,
          dimensions: '1080 × 600 px',
          description: 'Official in-app promotional banner SVG layout template on Brand Yellow with green logo.',
          permittedBackground: '#F3CB2D (Brand Yellow)',
          rules: '48 px safe inset, 110 × 145 px logo in top-left, Deep Green #214B32 text.'
        },
        og_image_template: {
          file: 'dist/assets/skm-og-template.svg',
          mimeType: 'image/svg+xml',
          isBinary: false,
          dimensions: '1200 × 630 px',
          description: 'Official Open Graph social share card SVG template on Brand Green with yellow logo.',
          permittedBackground: '#39823C (Brand Green)',
          rules: '64 px safe inset, 115 × 152 px logo in top-left, standard 1.91:1 ratio.'
        },
        tokens_css: {
          file: 'dist/assets/skm-tokens-v1.css',
          mimeType: 'text/css',
          isBinary: false,
          description: 'CSS Custom Properties for colors, typography, spacing, radius.',
          contentOverride: tokenCSS
        },
        tokens_json: {
          file: 'dist/assets/skm-tokens-v1.json',
          mimeType: 'application/json',
          isBinary: false,
          description: 'JSON Design Tokens for design tools and programmatic themes.',
          contentOverride: JSON.stringify(tokens, null, 2)
        },
        brand_guide_text: {
          file: 'dist/brand-guide.txt',
          mimeType: 'text/plain',
          isBinary: false,
          description: 'Complete plain-text brand guideline book.'
        }
      };

      const meta = assetMap[assetId];
      if (!meta) {
        return {
          isError: true,
          content: [{
            type: 'text',
            text: `Invalid asset_id "${assetId}". Available assets: ${Object.keys(assetMap).join(', ')}`
          }]
        };
      }

      const absPath = path.join(__dirname, meta.file);
      let content = meta.contentOverride || null;
      let base64 = null;

      try {
        if (!content) {
          if (meta.isBinary) {
            const buf = await readFile(absPath);
            base64 = buf.toString('base64');
          } else {
            content = await readFile(absPath, 'utf8');
            base64 = Buffer.from(content).toString('base64');
          }
        } else {
          base64 = Buffer.from(content).toString('base64');
        }
      } catch (err) {
        if (assetId.includes('template')) {
          const generated = await executeTool('generate_digital_template', {
            type: assetId === 'web_banner_template' ? 'web_banner' : assetId === 'app_banner_template' ? 'app_banner' : 'og_image',
            theme: assetId === 'app_banner_template' ? 'gold_canvas' : 'green_canvas'
          });
          content = generated.content[0].text;
          base64 = Buffer.from(content).toString('base64');
        } else {
          throw err;
        }
      }

      const dataUri = `data:${meta.mimeType};base64,${base64}`;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            assetId,
            description: meta.description,
            mimeType: meta.mimeType,
            filePath: absPath,
            relativePath: meta.file,
            dimensions: meta.dimensions || null,
            permittedBackground: meta.permittedBackground || null,
            rules: meta.rules || null,
            dataUri,
            rawContent: meta.isBinary ? null : content,
            base64: meta.isBinary ? base64 : undefined
          }, null, 2)
        }]
      };
    }

    default:
      return { isError: true, content: [{ type: 'text', text: `Unknown tool "${name}".` }] };
  }
}

export async function readResource(uri) {
  switch (uri) {
    case 'brand://tokens/css':
      return { uri, mimeType: 'text/css', text: tokenCSS };
    case 'brand://tokens/json':
      return { uri, mimeType: 'application/json', text: JSON.stringify(tokens, null, 2) };
    case 'brand://guidelines/text': {
      const guide = await readFile(path.join(__dirname, 'dist/brand-guide.txt'), 'utf8');
      return { uri, mimeType: 'text/plain', text: guide };
    }
    case 'brand://logos/yellow.svg':
    case 'brand://logos/bag-yellow.svg': {
      const svg = await getYellowBagSvg();
      return { uri, mimeType: 'image/svg+xml', text: svg };
    }
    case 'brand://logos/yellow.png': {
      const buf = await readFile(path.join(__dirname, 'public/assets/logo-bag-only-yellow-transparent.png'));
      return { uri, mimeType: 'image/png', blob: buf.toString('base64') };
    }
    case 'brand://logos/green.svg':
    case 'brand://logos/bag-green.svg': {
      const svg = await getGreenBagSvg();
      return { uri, mimeType: 'image/svg+xml', text: svg };
    }
    case 'brand://logos/green.png': {
      const buf = await readFile(path.join(__dirname, 'public/assets/logo-bag-only-green-transparent.png'));
      return { uri, mimeType: 'image/png', blob: buf.toString('base64') };
    }
    case 'brand://templates/web-banner.svg': {
      let svg;
      try {
        svg = await readFile(path.join(__dirname, 'dist/assets/skm-banner-template.svg'), 'utf8');
      } catch {
        const res = await executeTool('generate_digital_template', { type: 'web_banner', theme: 'green_canvas' });
        svg = res.content[0].text;
      }
      return { uri, mimeType: 'image/svg+xml', text: svg };
    }
    case 'brand://templates/app-banner.svg': {
      let svg;
      try {
        svg = await readFile(path.join(__dirname, 'dist/assets/skm-app-banner-template.svg'), 'utf8');
      } catch {
        const res = await executeTool('generate_digital_template', { type: 'app_banner', theme: 'gold_canvas' });
        svg = res.content[0].text;
      }
      return { uri, mimeType: 'image/svg+xml', text: svg };
    }
    case 'brand://templates/og-image.svg': {
      let svg;
      try {
        svg = await readFile(path.join(__dirname, 'dist/assets/skm-og-template.svg'), 'utf8');
      } catch {
        const res = await executeTool('generate_digital_template', { type: 'og_image', theme: 'green_canvas' });
        svg = res.content[0].text;
      }
      return { uri, mimeType: 'image/svg+xml', text: svg };
    }
    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}

export function getPrompt(name, args = {}) {
  switch (name) {
    case 'create_app_banner':
      return {
        description: 'Design a responsive 1080x600 in-app promotional banner for Shubham K Mart.',
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Design a 1080 × 600 app promotional banner for Shubham K Mart for campaign: "${args.campaign_name}".
Rules:
- 48 px outer safe insets.
- Background: Brand Yellow #F3CB2D with Green logo (Deep Green #214B32 text) or Brand Green #39823C with Yellow logo (White text).
- The 4 supplied logo files are the ONLY permitted marks in existence (no wordmark).
- Headline in Inter 700.
- One clear call-to-action button (48 px height, min 44 px touch target).`
          }
        }]
      };

    case 'create_social_post':
      return {
        description: 'Create an on-brand digital web or app banner for Shubham K Mart.',
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `You are an expert brand designer and copywriter for Shubham K Mart.
Task: Create an on-brand banner layout for the topic: "${args.topic}".
Format: ${args.format || 'web_banner (1080 × 600)'}.

Strict Brand Rules:
1. Logo: Use the 4 official logo files exclusively (NO named wordmark logo).
2. Canvas & Colors:
   - Yellow canvas: Background #F3CB2D with Green logo and Deep Green (#214B32) text.
   - Green canvas: Background #39823C with Yellow logo and White (#FFFFFF) text.
3. Typography: Inter ExtraBold (800) / Bold (700) for headlines; Inter Regular (400) for body copy.
4. Voice: Warm, helpful, grounded in everyday household lists ("Ghar ki list, ab thodi easier").
5. Tagline: Include "Shopping karo khulke, paise bachao jamke!".
6. Never make unverified cheapest-ever promises or fake urgency.`
          }
        }]
      };

    case 'create_web_banner':
      return {
        description: 'Design a responsive 1080x600 digital web banner for Shubham K Mart.',
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Design a 1080 × 600 digital web banner for Shubham K Mart for campaign: "${args.campaign_name}".
Rules:
- 48 px outer safe insets.
- Official logo anchored in top-left.
- Headline in Inter 700.
- One clear call-to-action button (48 px height, min 44 px touch target).
- Contrast: Never put white text on yellow #F3CB2D; use Deep Green #214B32.`
          }
        }]
      };

    case 'audit_design_spec':
      return {
        description: 'Audit a design specification for brand compliance.',
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Audit the following design specification against Shubham K Mart brand guidelines:
"${args.design_description}"

Check:
1. Is the logo the official logo only (no named wordmark)?
2. Is the yellow logo ONLY on Brand Green #39823C?
3. Is the green logo ONLY on Brand Yellow #F3CB2D?
4. Is text contrast WCAG AA compliant?
5. Is the font Inter?`
          }
        }]
      };

    default:
      throw new Error(`Prompt not found: ${name}`);
  }
}

export async function handleMessage(message) {
  const { jsonrpc, id, method, params } = message;
  if (jsonrpc !== '2.0') {
    return { jsonrpc: '2.0', id: id ?? null, error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' } };
  }

  // Notifications (no response expected)
  if (method === 'notifications/initialized' || method === 'initialized') {
    return null;
  }

  // Standard MCP JSON-RPC Request Handlers
  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {},
            prompts: {}
          },
          serverInfo: {
            name: 'shubham-k-mart-brand-mcp',
            version: '1.0.0',
            description: 'Model Context Protocol server for Shubham K Mart Digital Brand Guidelines, design tokens, official logos, and template generation.'
          }
        }
      };

    case 'ping':
      return { jsonrpc: '2.0', id, result: {} };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS }
      };

    case 'tools/call': {
      try {
        const { name, arguments: args } = params || {};
        const result = await executeTool(name, args);
        return { jsonrpc: '2.0', id, result };
      } catch (err) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [{ type: 'text', text: `Tool error: ${err.message}` }]
          }
        };
      }
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { resources: RESOURCES }
      };

    case 'resources/read': {
      try {
        const { uri } = params || {};
        const contents = await readResource(uri);
        return {
          jsonrpc: '2.0',
          id,
          result: { contents: [contents] }
        };
      } catch (err) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32002, message: err.message }
        };
      }
    }

    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { prompts: PROMPTS }
      };

    case 'prompts/get': {
      try {
        const { name, arguments: args } = params || {};
        const result = getPrompt(name, args);
        return { jsonrpc: '2.0', id, result };
      } catch (err) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: err.message }
        };
      }
    }

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` }
      };
  }
}

export function startStdioServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  process.stderr.write('Shubham K Mart Brand MCP Server listening on stdio (JSON-RPC 2.0)...\n');

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const msg = JSON.parse(trimmed);
      const res = await handleMessage(msg);
      if (res) {
        process.stdout.write(JSON.stringify(res) + '\n');
      }
    } catch (err) {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: `Parse error: ${err.message}` }
      }) + '\n');
    }
  });

  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

// When executed directly, run stdio server
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startStdioServer();
}
