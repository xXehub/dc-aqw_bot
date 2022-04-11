import BaseCog from './base'
import { Client, MessageEmbed, TextChannel } from "discord.js"
import snoowrap, { Submission } from 'snoowrap'
import { SubmissionStream } from "snoostorm";

export default class RedditCog {
    // Class Metadata
    public description = "The Class Containing the Guide Commands"

    // Class Variables
    // Stream Objects
    public redditclient
    private submissions


    // Datas

    private redditdb = { "AutoQuestWorlds": "r/auqw", "AQW": "r/aqw", "FashionQuestWorlds": "r/fqw"}

    constructor(private client: Client, private base: BaseCog) {
        this.start()

        this.base.registerCommand(this.cmdRegisterChannel.bind(this), {
            name: 'register_raqw',
            description: 'Administrator only command. Set this channel to receive r/AQW live stream of new posts',
        })

        this.base.registerCommand(this.cmdUnregisterChannel.bind(this), {
            name: 'unregister_raqw',
            description: 'Administrator only command. Remove this channel from r/AQW live stream of new posts',
        })
    }

    /*==============================================================================================================
                                                                                                   
                         ██████╗ ██████╗ ███╗   ███╗███╗   ███╗ █████╗ ███╗   ██╗██████╗ ███████╗
                        ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝
                        ██║     ██║   ██║██╔████╔██║██╔████╔██║███████║██╔██╗ ██║██║  ██║███████╗
                        ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██╔══██║██║╚██╗██║██║  ██║╚════██║
                        ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║██████╔╝███████║
                         ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝
                                                                                                 
    ==============================================================================================================*/


    async cmdRegisterChannel(mode: string, source) {
        
        // Permission Check
        if (!source.member.permissionsIn(source.channel).has("ADMINISTRATOR")) {
            await source.reply("\`[Error]\`: You do not have administrator permission in this channel to use `register_raqw` command.")
            return
        } 

        // Variables
        const channelID: string = String(source.channel.id).trim()
        const guildID: string = String(source.guild.id)

        if (this.base.aqwChannels.hasOwnProperty(guildID) && channelID == this.base.aqwChannels[guildID]) {
            await source.reply(`** __Register Reddit Feed__ **\n\`Status\`: This Channel is already registered.`)
            return
        }

        // Validity
        var status = "\`Status\`: Registered"
        if (this.base.aqwChannels.hasOwnProperty(guildID) && this.base.aqwChannels[guildID].trim() != "") {
            status += `\n\`Notice\`: Replacing Previous Channel <#${this.base.aqwChannels[guildID]}>`
        }

        // Add it
        this.base.aqwChannels[guildID] = channelID
        const result = await this.base.database.dbUpdate("settings.webhooks", { _id: "aqw_webhooks" }, { $set: { urls: this.base.aqwChannels } })
        await source.reply(`**__Register Reddit Feed__**\n\`Channel\`: <#${channelID}>\n${status}`)
        return        
    }


    async cmdUnregisterChannel(mode: string, source) {

        // Permission Check
        if (!source.member.permissionsIn(source.channel).has("ADMINISTRATOR")) {
            await source.reply("\`[Error]\`: You do not have administrator permission in this channel to use `unregister_raqw` command.")
            return
        }

        // Variables
        const guildID: string = String(source.guild.id)

        // Validity
        if (!this.base.aqwChannels.hasOwnProperty(guildID)) {
            await source.reply(`** __Unregister Reddit Feed__ **\n\`Status\`: No registered Feed Channel.`)
            return
        }

        // Delete it
        const channelID = this.base.aqwChannels[guildID]
        delete this.base.aqwChannels[guildID]

        // Upload Change
        const result = await this.base.database.dbUpdate("settings.webhooks", { _id: "aqw_webhooks" }, { $set: { urls: this.base.aqwChannels } })

        // Reply
        await source.reply(`**__Unregister Reddit Feed__**\n\`Channel\`: <#${channelID}>\n\`Status\`: Removed`)
        return
    }


    /*==============================================================================================================
                                                                                                       
                            ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
                            ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
                            ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
                            ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
                            ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
                             ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝
                                                                                        
    ==============================================================================================================*/


    async start() {
        // Get account details
        var account = await this.base.database.dbRead("settings.accounts", {_id: "reddit_account"})

        // Get channels
        await this.getAQWChannels()

        // AQW
        try {
            this.redditclient = await new snoowrap(account)
            this.submissions = new SubmissionStream(this.redditclient, {
                subreddit: "AQW+FashionQuestWorlds+AutoQuestWorlds",
                // limit: 10,
                pollTime: 2000,
            });
            this.submissions.on("item", this.submissionStream.bind(this));

        } catch (error) {
            console.log("[Reddit]: Restart")
            await this.start()
        }
    }

    async getAQWChannels() {
        this.base.aqwChannels = (await this.base.database.dbRead("settings.webhooks", { _id: "aqw_webhooks"})).urls
        this.base.auqwChannels = (await this.base.database.dbRead("settings.webhooks", { _id: "auqw_webhooks" })).urls
    }


    async submissionStream(subObj: Submission) {

        // Validation
        const subreddit = subObj.subreddit.display_name
        const subExists = await this.base.database.dbRead(`logger.${this.redditdb[subreddit]}`, {_id: subObj.id}, true)
        if (subExists) return

        // Metadata
        const date = new Date(subObj.created_utc * 1000).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        const author = subObj.author.name
        const title = subObj.title
        const link = `https://www.reddit.com${subObj.permalink}`
        const content = subObj.selftext.replace("&#x200B;", "").trim()
        let note = ""

        // Image
        let image
        if (subObj.hasOwnProperty('post_hint')) {
            if (subObj.post_hint === "image") {
                image = subObj.url
            }
        }

        // Gallery
        if (subObj.hasOwnProperty('is_gallery')) {
            note = "Is a Gallery"
        }

        // Video
        let thumbnail
        if (subObj.media != null) {
            note = "Is a Video"
            // Is reddit video?
            if (subObj.is_video) {
                thumbnail = subObj.thumbnail
            } else {
                // Is Youtube video?
                if (subObj.media?.type == "youtube.com") {
                    image = subObj.media.oembed?.thumbnail_url
                }
            }
        }
        console.log(link)


        // Upload
        const result = await this.base.database.dbInsert(`logger.${this.redditdb[subreddit]}`, 
            { _id: subObj.id,
              author: author,
              title: title,
              date: date,
              link: link,
              content: content,
              image: image,
              thumbnail: thumbnail,
              note: note
            })


        // Create Embed
        const embed = new MessageEmbed()
            .setColor(this.base.color)
            
            .setAuthor({name: `r/${subreddit}`, iconURL: this.base.files["resources"]["reddit"][subreddit]})
            .setThumbnail(thumbnail)
            .setURL(link)
            .setImage(image)
            .setFooter({text: note})
            .addFields(
                { name: "Author:", value: `[u/${author}](https://www.reddit.com/user/${author}/)`, inline: true },
                { name: 'Date:', value: date, inline: true }
            )
        // Title
        if (title.length >= 256) {
            embed.setTitle(title.substring(0, 252) + "...")
            console.log("YEs long name")
        } else {
            embed.setTitle(title)
        }

        // Content Spliiting
        if (content) {
            if (content.length <= 950) {
                embed.addField("Content:", content, false)
            } else {
                const contents = content.match(/.{1,1020}/g);
                let title: string = "\u200b"
                let first: boolean = true
                let length: number = 0;
                for (let con of contents!) {
                    if (con.trim() === '') continue
                    // Checks if embed is too big
                    if (length >= 5000) {
                        console.log("TOO BIG")
                        break
                    }
                    length += con.length;
                    if (first) {
                        first = false
                        embed.addField("Content:", con, false)
                        continue
                    }
                    embed.addField(title, con, false)
                    title += "\u200b"
                }
            }
        }

        // Send to Channel
        switch (subreddit) {
            case "AutoQuestWorlds":
                for (const channelID in this.base.auqwChannels) {
                    try {
                        let loginChannel = await this.client.channels.cache.get(this.base.auqwChannels[channelID]) as TextChannel
                        await loginChannel.send({ embeds: [embed] })
                    } catch (error) {
                        console.log("[Reddit] Error:> ", error)
                    }

                }
                break;
            case "AQW": 
            case "FashionQuestWorlds":
                for (const channelID in this.base.aqwChannels) {
                    try {
                        let loginChannel = await this.client.channels.cache.get(this.base.aqwChannels[channelID]) as TextChannel
                        await loginChannel.send({ embeds: [embed] })
                    } catch (error) {
                        console.log("[Reddit] Error:> ", error)
                    }

                }
                break;
            default:
                break;
        }


    }


}