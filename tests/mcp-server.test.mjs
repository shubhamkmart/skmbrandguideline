import test from 'node:test';
import assert from 'node:assert/strict';
import {handleMessage, executeTool, readResource, getPrompt} from '../mcp-server.mjs';

test('MCP initialize returns JSON-RPC protocolVersion 2024-11-05 and capabilities', async () => {
  const res = await handleMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {}
  });
  assert.equal(res.jsonrpc, '2.0');
  assert.equal(res.id, 1);
  assert.equal(res.result.protocolVersion, '2024-11-05');
  assert.ok(res.result.capabilities.tools);
  assert.ok(res.result.capabilities.resources);
  assert.ok(res.result.capabilities.prompts);
  assert.equal(res.result.serverInfo.name, 'shubham-k-mart-brand-mcp');
});

test('MCP tools/list returns all official brand tools', async () => {
  const res = await handleMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  });
  assert.equal(res.jsonrpc, '2.0');
  const toolNames = res.result.tools.map(t => t.name);
  assert.ok(toolNames.includes('get_brand_tokens'));
  assert.ok(toolNames.includes('get_brand_colors'));
  assert.ok(toolNames.includes('get_brand_logo'));
  assert.ok(toolNames.includes('search_brand_guidelines'));
  assert.ok(toolNames.includes('generate_digital_template'));
  assert.ok(toolNames.includes('generate_social_template'));
  assert.ok(toolNames.includes('validate_brand_design'));
});

test('get_brand_tokens returns valid tokens in JSON and CSS', async () => {
  const jsonRes = await executeTool('get_brand_tokens', { format: 'json' });
  const data = JSON.parse(jsonRes.content[0].text);
  assert.equal(data.color.brand.green, '#39823C');
  assert.equal(data.color.brand.gold, '#F3CB2D');

  const cssRes = await executeTool('get_brand_tokens', { format: 'css' });
  assert.ok(cssRes.content[0].text.includes('--brand-green: #39823C;'));
  assert.ok(cssRes.content[0].text.includes('--brand-gold: #F3CB2D;'));
});

test('get_brand_colors returns exact HEX codes and contrast pairings', async () => {
  const res = await executeTool('get_brand_colors', {});
  const data = JSON.parse(res.content[0].text);
  assert.equal(data.brand, 'Shubham K Mart');
  assert.ok(data.palette.some(c => c.hex === '#39823C' && c.name === 'Brand green'));
  assert.ok(data.palette.some(c => c.hex === '#F3CB2D' && (c.name.toLowerCase() === 'brand yellow' || c.name.toLowerCase() === 'brand gold')));
  assert.ok(data.contrastRules.some(r => r.pair.includes('White') && r.status.includes('PASS')));
});

test('get_brand_logo returns authentic SVG, PNG base64, and strict background restrictions', async () => {
  const yellowRes = await executeTool('get_brand_logo', { color: 'yellow', format: 'svg' });
  assert.ok(yellowRes.content[0].text.includes('<svg'));
  assert.ok(yellowRes.content[0].text.includes('Permitted Background: #39823C (Brand Green only)'));

  const greenRes = await executeTool('get_brand_logo', { color: 'green', format: 'info' });
  const info = JSON.parse(greenRes.content[0].text);
  assert.equal(info.color, 'green');
  assert.ok(info.permittedBackground.includes('#F3CB2D'));
  assert.ok(info.file.includes('green'));

  const pngRes = await executeTool('get_brand_logo', { color: 'yellow', format: 'png_base64' });
  const pngData = JSON.parse(pngRes.content[0].text);
  assert.equal(pngData.mimeType, 'image/png');
  assert.ok(pngData.base64.length > 500);
  assert.ok(pngData.file.includes('yellow'));
});

test('validate_brand_design enforces logo-only, permitted colors, and contrast', async () => {
  // Test 1: Prohibited wordmark
  const wordmarkAudit = await executeTool('validate_brand_design', {
    logo_type: 'named_logo_wordmark',
    background_color: '#39823C'
  });
  const audit1 = JSON.parse(wordmarkAudit.content[0].text);
  assert.equal(audit1.compliant, false);
  assert.ok(audit1.issues.some(i => i.rule.includes('Logo only')));

  // Test 2: Illegal background for yellow logo (white background)
  const illegalBgAudit = await executeTool('validate_brand_design', {
    logo_type: 'logo_yellow',
    background_color: '#FFFFFF'
  });
  const audit2 = JSON.parse(illegalBgAudit.content[0].text);
  assert.equal(audit2.compliant, false);
  assert.ok(audit2.issues.some(i => i.rule.includes('Yellow logo placement rule')));

  // Test 3: Compliant design
  const compliantAudit = await executeTool('validate_brand_design', {
    logo_type: 'logo_green',
    background_color: '#F3CB2D',
    text_color: '#214B32',
    font_family: 'Inter, sans-serif',
    tagline: 'Shopping karo khulke, paise bachao jamke!'
  });
  const audit3 = JSON.parse(compliantAudit.content[0].text);
  assert.equal(audit3.compliant, true);
  assert.equal(audit3.issues.length, 0);
});

test('generate_digital_template produces valid SVG with Inter type and logo for banners', async () => {
  const webBannerRes = await executeTool('generate_digital_template', {
    type: 'web_banner',
    headline: 'Ghar ki list, ab thodi easier.',
    theme: 'green_canvas'
  });
  const webBannerSvg = webBannerRes.content[0].text;
  assert.ok(webBannerSvg.includes('<svg'));
  assert.ok(webBannerSvg.includes('viewBox="0 0 1080 600"'));
  assert.ok(webBannerSvg.includes('Ghar ki list, ab thodi easier.'));
  assert.ok(webBannerSvg.includes('#39823C'));

  // Test app_banner format
  const appBannerRes = await executeTool('generate_digital_template', {
    type: 'app_banner',
    headline: 'Mobile app deals',
    theme: 'gold_canvas'
  });
  const appBannerSvg = appBannerRes.content[0].text;
  assert.ok(appBannerSvg.includes('viewBox="0 0 1080 600"'));
  assert.ok(appBannerSvg.includes('Mobile app deals'));
  assert.ok(appBannerSvg.includes('#F3CB2D'));

  // Test og_image format
  const ogRes = await executeTool('generate_digital_template', {
    type: 'og_image',
    headline: 'Brand Digital Guidelines',
    theme: 'green_canvas'
  });
  const ogSvg = ogRes.content[0].text;
  assert.ok(ogSvg.includes('viewBox="0 0 1200 630"'));
  assert.ok(ogSvg.includes('Brand Digital Guidelines'));
});

test('resources and prompts can be read and retrieved including PNG masters', async () => {
  const cssRes = await readResource('brand://tokens/css');
  assert.equal(cssRes.mimeType, 'text/css');
  assert.ok(cssRes.text.includes('--brand-green'));

  const pngYellowRes = await readResource('brand://logos/yellow.png');
  assert.equal(pngYellowRes.mimeType, 'image/png');
  assert.ok(pngYellowRes.blob.length > 500);

  const pngGreenRes = await readResource('brand://logos/green.png');
  assert.equal(pngGreenRes.mimeType, 'image/png');
  assert.ok(pngGreenRes.blob.length > 500);

  const bannerPrompt = getPrompt('create_app_banner', { campaign_name: 'Weekend Groceries' });
  assert.ok(bannerPrompt.messages[0].content.text.includes('Weekend Groceries'));
  assert.ok(bannerPrompt.messages[0].content.text.includes('1080 × 600'));
});

test('get_brand_asset returns file paths, mime types, data URIs and strict rules for all brand assets', async () => {
  // Test yellow SVG logo asset
  const yellowSvgRes = await executeTool('get_brand_asset', { asset_id: 'logo_yellow_svg' });
  const yellowData = JSON.parse(yellowSvgRes.content[0].text);
  assert.equal(yellowData.mimeType, 'image/svg+xml');
  assert.ok(yellowData.filePath.includes('logo-bag-only-yellow-transparent.svg'));
  assert.ok(yellowData.dataUri.startsWith('data:image/svg+xml;base64,'));
  assert.ok(yellowData.permittedBackground.includes('#39823C'));
  assert.ok(yellowData.rawContent.includes('<svg'));

  // Test green PNG logo asset
  const greenPngRes = await executeTool('get_brand_asset', { asset_id: 'logo_green_png' });
  const greenData = JSON.parse(greenPngRes.content[0].text);
  assert.equal(greenData.mimeType, 'image/png');
  assert.equal(greenData.dimensions, '2160 × 2160 px');
  assert.ok(greenData.filePath.includes('logo-bag-only-green-transparent.png'));
  assert.ok(greenData.dataUri.startsWith('data:image/png;base64,'));
  assert.ok(greenData.permittedBackground.includes('#F3CB2D'));
  assert.ok(greenData.base64.length > 500);

  // Test web banner template asset
  const bannerRes = await executeTool('get_brand_asset', { asset_id: 'web_banner_template' });
  const bannerData = JSON.parse(bannerRes.content[0].text);
  assert.equal(bannerData.mimeType, 'image/svg+xml');
  assert.equal(bannerData.dimensions, '1080 × 600 px');
  assert.ok(bannerData.rawContent.includes('1080'));

  // Test app banner template asset
  const appBannerRes = await executeTool('get_brand_asset', { asset_id: 'app_banner_template' });
  const appBannerData = JSON.parse(appBannerRes.content[0].text);
  assert.equal(appBannerData.mimeType, 'image/svg+xml');
  assert.equal(appBannerData.dimensions, '1080 × 600 px');

  // Test tokens asset
  const tokensRes = await executeTool('get_brand_asset', { asset_id: 'tokens_css' });
  const tokensData = JSON.parse(tokensRes.content[0].text);
  assert.equal(tokensData.mimeType, 'text/css');
  assert.ok(tokensData.rawContent.includes('--brand-green'));
});

test('MCP resources include banner layout templates that can be read directly', async () => {
  const webSvg = await readResource('brand://templates/web-banner.svg');
  assert.equal(webSvg.mimeType, 'image/svg+xml');
  assert.ok(webSvg.text.includes('<svg'));
  assert.ok(webSvg.text.includes('1080'));

  const appSvg = await readResource('brand://templates/app-banner.svg');
  assert.equal(appSvg.mimeType, 'image/svg+xml');
  assert.ok(appSvg.text.includes('<svg'));
  assert.ok(appSvg.text.includes('1080'));

  const ogSvg = await readResource('brand://templates/og-image.svg');
  assert.equal(ogSvg.mimeType, 'image/svg+xml');
  assert.ok(ogSvg.text.includes('1200'));
});
