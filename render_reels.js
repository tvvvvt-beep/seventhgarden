import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function main() {
  console.log('🚀 Starting Instagram Reels Video Render (1080x1920 @ 30fps)...');

  const DURATION = 12.0; // 12秒ループ
  const FPS = 30;
  const TOTAL_FRAMES = Math.round(DURATION * FPS); // 360 frames
  const OUTPUT_FILE = '7th_garden_new_visual_reels.mp4';
  const PUBLIC_OUTPUT = path.join('public', 'promo', OUTPUT_FILE);

  console.log(`⏱️ Duration: ${DURATION}s, FPS: ${FPS}, Total frames: ${TOTAL_FRAMES}`);

  // FFmpeg プロセス起動
  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-loglevel', 'warning',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(FPS),
    '-i', 'pipe:0',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    OUTPUT_FILE
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.error(`[ffmpeg] ${data.toString().trim()}`);
  });

  const ffmpegDone = new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  // Puppeteer で Chrome 起動
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      '--window-size=1080,1920',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--hide-scrollbars',
    ],
    defaultViewport: {
      width: 1080,
      height: 1920,
      deviceScaleFactor: 1,
    }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  const url = 'http://localhost:5173/insta-story.html';
  console.log(`🌐 Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle0' });

  // 3Dアセットの読み込み完了を待機
  console.log('⏳ Waiting for 3D textures to load...');
  await page.waitForFunction(() => window.__READY__ === true, { timeout: 20000 });
  await page.evaluate(() => { window.__CAPTURING__ = true; });
  console.log('✨ All textures loaded! Starting frame capture...');

  const startTime = Date.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = (i / TOTAL_FRAMES) * DURATION;

    // 指定時刻にレンダリング
    await page.evaluate((time) => {
      window.renderAtTime(time);
    }, t);

    // 画面キャプチャ (JPEG quality 96)
    const imgBuffer = await page.screenshot({
      type: 'jpeg',
      quality: 96,
      omitBackground: false,
    });

    // FFmpeg の stdin に送信
    const canWrite = ffmpeg.stdin.write(imgBuffer);
    if (!canWrite) {
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }

    if (i % 30 === 0 || i === TOTAL_FRAMES - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const percent = Math.round((i / TOTAL_FRAMES) * 100);
      console.log(`📸 Frame ${i}/${TOTAL_FRAMES} (${percent}%) — ${elapsed}s`);
    }
  }

  console.log('🎬 All frames captured. Finalizing video...');
  ffmpeg.stdin.end();

  await ffmpegDone;
  await browser.close();

  // public/promo にもコピー
  try {
    fs.copyFileSync(OUTPUT_FILE, PUBLIC_OUTPUT);
    console.log(`📁 Copied to ${PUBLIC_OUTPUT}`);
  } catch (err) {
    console.warn(`Could not copy to public/promo: ${err.message}`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const stats = fs.statSync(OUTPUT_FILE);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`🎉 Done in ${totalTime}s! Output: ${OUTPUT_FILE} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error('❌ Render error:', err);
  process.exit(1);
});
