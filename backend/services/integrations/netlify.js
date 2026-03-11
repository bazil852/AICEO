import crypto from 'crypto';

const NETLIFY_API = 'https://api.netlify.com/api/v1';

async function netlifyFetch(path, token, options = {}) {
  const res = await fetch(`${NETLIFY_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Netlify API ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function validate(apiKey) {
  const accounts = await netlifyFetch('/accounts', apiKey);
  if (!accounts?.length) throw new Error('Invalid Netlify token or no accounts found');
  return { account_name: accounts[0].name, account_slug: accounts[0].slug };
}

// Deploy a single HTML file as a Netlify site
export async function deploy(token, html, { siteName, siteId } = {}) {
  // 1. Create or find existing site
  let site;
  if (siteId) {
    site = await netlifyFetch(`/sites/${siteId}`, token);
  } else {
    // Try to find an existing site with our naming pattern
    const sites = await netlifyFetch('/sites?per_page=100', token);
    site = sites?.find(s => s.name === siteName);
    if (!site) {
      site = await netlifyFetch('/sites', token, {
        method: 'POST',
        body: JSON.stringify({ name: siteName || undefined }),
      });
    }
  }

  // 2. Compute SHA1 of the index.html content
  const htmlBuffer = Buffer.from(html, 'utf-8');
  const sha1 = crypto.createHash('sha1').update(htmlBuffer).digest('hex');

  // 3. Create deploy with file digest
  const deployResult = await netlifyFetch(`/sites/${site.id}/deploys`, token, {
    method: 'POST',
    body: JSON.stringify({
      files: { '/index.html': sha1 },
    }),
  });

  // 4. Upload the file content
  await fetch(`${NETLIFY_API}/deploys/${deployResult.id}/files/index.html`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    body: htmlBuffer,
  });

  return {
    site_id: site.id,
    site_name: site.name,
    deploy_id: deployResult.id,
    url: site.ssl_url || site.url || `https://${site.name}.netlify.app`,
  };
}
