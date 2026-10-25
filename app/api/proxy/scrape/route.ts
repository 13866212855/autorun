import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export interface ScrapedFormElement {
  selector: string;
  id?: string;
  name?: string;
  tagName: string;
  type: string;
  label: string;
  placeholder: string;
  options?: Array<{ text: string; value: string }>;
  contextText?: string;
  defaultValue?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: '请提供有效的网页地址 URL' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let html = '';
    let responseStatus = 200;

    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      responseStatus = res.status;
      html = await res.text();
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        {
          error: `无法直接抓取该目标网站 (${fetchErr.message || '网络连接超时'})。目标站点可能存在防火墙或内网限制。`,
        },
        { status: 502 }
      );
    }

    const $ = cheerio.load(html);
    const title = $('title').text().trim() || targetUrl;

    const elements: ScrapedFormElement[] = [];
    const usedSelectors = new Set<string>();

    // Query interactive inputs
    const interactiveQuery =
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea';

    $(interactiveQuery).each((idx, elem) => {
      const $el = $(elem);
      const tagName = (elem as any).tagName?.toLowerCase() || 'input';
      const type = $el.attr('type') || tagName;
      const id = $el.attr('id') || '';
      const name = $el.attr('name') || '';
      const placeholder = $el.attr('placeholder') || '';
      const defaultValue = $el.val()?.toString() || '';

      // Determine robust selector
      let selector = '';
      if (id) {
        selector = `#${id}`;
      } else if (name) {
        selector = `${tagName}[name="${name}"]`;
      } else {
        selector = `${tagName}:nth-of-type(${idx + 1})`;
      }

      if (usedSelectors.has(selector)) {
        selector = `${selector}:nth-of-type(${idx + 1})`;
      }
      usedSelectors.add(selector);

      // Find label
      let label = '';
      if (id) {
        label = $(`label[for="${id}"]`).text().trim();
      }
      if (!label) {
        const parentLabel = $el.closest('label');
        if (parentLabel.length) {
          label = parentLabel.clone().children().remove().end().text().trim();
        }
      }
      if (!label) {
        // Table cell preceding
        const td = $el.closest('td');
        if (td.length && td.prev().length) {
          label = td.prev().text().trim();
        }
      }
      if (!label) {
        // Preceding sibling text
        const prev = $el.prev();
        if (prev.length) {
          label = prev.text().trim();
        }
      }
      if (!label) {
        label = placeholder || name || id || `表单输入项_${idx + 1}`;
      }

      label = label.replace(/[*：:\n\r\t]/g, '').trim();

      // Options if select
      let options: Array<{ text: string; value: string }> = [];
      if (tagName === 'select') {
        $el.find('option').each((_, opt) => {
          const $opt = $(opt);
          options.push({
            text: $opt.text().trim(),
            value: $opt.attr('value') || $opt.text().trim(),
          });
        });
      }

      elements.push({
        selector,
        id,
        name,
        tagName,
        type,
        label,
        placeholder,
        defaultValue,
        options,
      });
    });

    return NextResponse.json({
      success: true,
      url: targetUrl,
      title,
      responseStatus,
      totalCount: elements.length,
      elements,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `表单解析失败: ${err.message}` }, { status: 500 });
  }
}
