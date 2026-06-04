import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';
import request from 'supertest';
import { Readable } from 'stream';

const require = createRequire(import.meta.url);

// Load CJS modules and patch BEFORE loading the app
const watermark = require('../services/watermark');
const axios = require('axios');

watermark.parseUrl = vi.fn();
axios.get = vi.fn();

// Now load the app — routes will use the patched module references
const app = require('../server');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /health', () => {
  it('返回 200 和 ok 状态', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/parse', () => {
  it('缺少 url 时返回 400', async () => {
    const res = await request(app).post('/api/parse').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('解析成功时返回数据', async () => {
    const mockData = {
      type: 'video',
      title: '测试视频',
      author: '测试作者',
      author_avatar: '',
      images: [],
      video_url: 'https://example.com/video.mp4',
      text: '测试视频',
      cover: '',
    };
    watermark.parseUrl.mockResolvedValue(mockData);

    const res = await request(app).post('/api/parse').send({ url: 'https://v.douyin.com/test' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockData);
    expect(watermark.parseUrl).toHaveBeenCalledWith('https://v.douyin.com/test');
  });

  it('解析失败时返回 500', async () => {
    watermark.parseUrl.mockRejectedValue(new Error('API 超时'));

    const res = await request(app).post('/api/parse').send({ url: 'https://v.douyin.com/bad' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('API 超时');
  });
});

describe('GET /api/proxy', () => {
  it('缺少 url 时返回 400', async () => {
    const res = await request(app).get('/api/proxy');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('代理成功时 pipe 流数据', async () => {
    const fakeStream = new Readable({
      read() {
        this.push('fake-data');
        this.push(null);
      },
    });
    axios.get.mockResolvedValue({
      headers: { 'content-type': 'image/jpeg', 'content-length': '9' },
      data: fakeStream,
    });

    const res = await request(app).get('/api/proxy').query({ url: 'https://example.com/img.jpg' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/jpeg');
    expect(Buffer.from(res.body).toString()).toBe('fake-data');
  });

  it('代理失败时返回 500', async () => {
    axios.get.mockRejectedValue(new Error('network error'));

    const res = await request(app).get('/api/proxy').query({ url: 'https://example.com/fail.jpg' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
