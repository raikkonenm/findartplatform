#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const FF = require('@ffmpeg-installer/ffmpeg').path;
const SRC_DIR = path.join(ROOT, 'public/index');
const DST_DIR = path.join(ROOT, 'public/directory');
const BACKUP_DIR = path.join(ROOT, '.compress-backup/index');

// filename in public/index → { out: name in public/directory (without .web.mp4), stripAudio: bool }
const JOBS = [
  { src: 'irenemolina.mp4', out: 'irenemolina', stripAudio: false },
  { src: 'stinedeja.mp4', out: 'stinedeja', stripAudio: true },
  { src: 'Inside Job.mp4', out: 'inside-job', stripAudio: false },
  { src: 'nathancareme.mp4', out: 'nathancareme', stripAudio: false },
];

fs.mkdirSync(BACKUP_DIR, { recursive: true });

for (const job of JOBS) {
  const srcPath = path.join(SRC_DIR, job.src);
  const dstPath = path.join(DST_DIR, `${job.out}.web.mp4`);
  const backupPath = path.join(BACKUP_DIR, job.src);

  if (!fs.existsSync(srcPath)) {
    console.warn(`SKIP: missing ${srcPath}`);
    continue;
  }
  const srcSize = fs.statSync(srcPath).size;

  const args = [
    '-y',
    '-i', srcPath,
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '24',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=iw*min(1\\,1280/iw):-2',
    '-movflags', '+faststart',
  ];
  if (job.stripAudio) {
    args.push('-an');
  } else {
    args.push('-c:a', 'aac', '-b:a', '96k');
  }
  args.push(dstPath);

  console.log(`Encoding ${job.src} -> ${path.relative(ROOT, dstPath)}${job.stripAudio ? ' (no audio)' : ''}`);
  execFileSync(FF, args, { stdio: ['ignore', 'ignore', 'ignore'] });
  const dstSize = fs.statSync(dstPath).size;
  console.log(`  ${(srcSize/1024/1024).toFixed(1)} MB -> ${(dstSize/1024/1024).toFixed(1)} MB`);

  fs.renameSync(srcPath, backupPath);
}
console.log('Done.');
