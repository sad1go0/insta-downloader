const { Bot } = require('grammy');
const axios = require('axios');
require('dotenv').config();

if (!process.env.BOT_TOKEN && !process.env.KEY && !process.env.HOST)
  throw new Error('Environment variables are not set');

const bot = new Bot(process.env.BOT_TOKEN);

bot.command('start', ctx => {
  ctx.reply('Hello World!');
});

bot.on('::url', async ctx => {
  const options = {
    method: 'GET',
    url: 'https://instagram-media-downloader.p.rapidapi.com/rapid/post.php',
    params: {
      url: `${ctx.message.text}`,
    },
    headers: {
      'X-RapidAPI-Key': process.env.KEY,
      'X-RapidAPI-Host': process.env.HOST,
    },
  };

  const { data } = await axios.default.request(options);

  if (data.video)
    return ctx.replyWithVideo(data.video, { caption: data.caption || '' });
  if (data.image)
    return ctx.replyWithPhoto(data.image, { caption: data.caption || '' });

  let media = [];
  try {
    for (let m of data) {
      if (
        m.split('?')[0].slice(m.split('?')[0].length - 3) === 'jpg' ||
        m.split('?')[0].slice(m.split('?')[0].length - 4) === 'webp'
      )
        media.push({ type: 'photo', media: m });
      if (m.split('?')[0].slice(m.split('?')[0].length - 3) === 'mp4')
        media.push({ type: 'video', media: m });
    }
  } catch (error) {
    for (let key in data) {
      if (key === 'caption') break;
      let m = data[key];
      if (
        m.split('?')[0].slice(m.split('?')[0].length - 3) === 'jpg' ||
        m.split('?')[0].slice(m.split('?')[0].length - 4) === 'webp'
      )
        media.push({ type: 'photo', media: m });
      if (m.split('?')[0].slice(m.split('?')[0].length - 3) === 'mp4')
        media.push({ type: 'video', media: m });
    }
  }

  if (data.caption) media[0].caption = data.caption;

  ctx.replyWithMediaGroup(media);
});

bot.start();
