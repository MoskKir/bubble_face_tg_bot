const { Telegraf } = require('telegraf')
const fetch = require("node-fetch")
// const download = require('download')
const FormData = require('form-data')
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_API)
bot.start((ctx) => ctx.reply('Welcome'))

bot.on('photo', (ctx) => {
    const picture = ctx.message.photo[0].file_id
    const photo = process.env.PHOTO_LINK + picture
    
    async function getPhoto() {
        const response = await fetch(photo)
        const photoData = await response.json()
        
        let formData = new FormData();
        const headers = formData.getHeaders();

        // await download(process.env.FILE_LINK + photoData.result.file_path, 'file')
        const fileLink = process.env.FILE_LINK + photoData.result.file_path

        const originalImageResponse = await axios({
            method: 'GET',
            responseType: 'stream',
            url: fileLink,
        });

        formData.append('image', originalImageResponse.data)

        const processedImageResponse = await axios({
            method: 'post',
            url: process.env.FACE_BUBBLE_API,
            responseType: 'stream',
            headers,
            data: formData,
        });
    
        await ctx.replyWithPhoto({ source: processedImageResponse.data });
    }

    try {
        getPhoto()
    } catch (error) {
        console.log(error)
    }
})


bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()
console.log('>>> bot launch')