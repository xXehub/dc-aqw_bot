import { Client, MessageAttachment } from "discord.js"
import BaseCog from './base'
import fs from 'fs'


export default class TextCog {
    // Class Metadata
    public description = "The Class Containing Text send command"

    // Class Variables
    private files = {}
    private guideHeaders = {}

    constructor(private client: Client, private base: BaseCog) {
        this.files = base.files

        this.base.registerCommand(this.cmdUploadFile.bind(this), {
            name: 'upfile',
            description: 'Send txt to upload',
        }, false, true)

    }


    async cmdUploadFile(mode: string, source, defered: boolean = false) {

        // Chekc if Bloom
        if (source.author.id != this.files["resources"]["bloom-id"]) {
            await source.reply("You're not bloom.")
            return
        }

        // Attachment check
        if(!source.attachments.first()) {
            await source.reply("Please add a txt file only")
            return
        }
        
        // Check if ,txt
        const url = source.attachments.first().url
        const filename = url.split("/").at(-1)
        if (filename.split(".").at(-1) !== "txt") {
            await source.reply("Only .txt files")
            return 
        }
        
        // Process text for sending
        const data = await this.base.getWebData(url)
        const texts = data.split("\n")
        let textList: Array<string> = []
        let textRaw: string = ""
        for (const text of texts) {
            if (textRaw.length >= 1800) {
                textList.push(textRaw)
                textRaw = ""
            }
            textRaw += text + "\n"
        }
        if (textRaw !== "") {
            textList.push(textRaw)
        }

        // Create new channel and delete old channel
        const channel = await source.channel.clone()
        await source.channel.delete()

        for (const text of textList) {
            await channel.send(text)
        }

        console.log("[Text]: Done Uploading")
            
        const attachment = new MessageAttachment(Buffer.from(data, 'utf-8'), filename)
        await channel.send({files: [attachment]})

        
    }
}
