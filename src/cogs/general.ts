import { Client, MessageEmbed, Constants } from "discord.js"
import BaseCog from './base'

export default class GeneralCog {
    // Class Metadata
    public description = "The Class Containing the General Commands"

    // Class Variables
    private files = {}
    private guideHeaders = {}

    constructor(private client: Client, private base: BaseCog) {
        this.files = base.files

        // Command register
        this.base.registerCommand(this.cmdHelp.bind(this), {
            name: 'help',
            description: 'Shows the Bloom Bot command list!',
        })

        this.base.registerCommand(this.cmdCredits.bind(this), {
            name: 'credits',
            description: 'Shows the Bloom Bot Credits!',
        })

        this.base.registerCommand(this.cmdInvite.bind(this), {
            name: 'invite',
            description: 'Get bloom bot invitation!',
        })

        this.base.registerCommand(this.cmdShowChannels.bind(this), {
            name: 'channels',
            description: 'Show registered r/AQW or Twitter Feed Channels.',
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

    async cmdInvite(mode: string, source) {
        const embed = new MessageEmbed()
            .setColor(this.base.color)
            // .setTitle("Bloom Bot")
            .setAuthor({name: "A Discord Bot Made by Bloom Autist#4713"})
            .setThumbnail(this.base.files["resources"]["icon"])
            // .setURL(this.base.files["resources"]["links"]["botInvite"])
            .setDescription(`**Bloom Bot**: [Invitation Link](${this.base.files["resources"]["links"]["botInvite"]})\n**Support Server**: [Discord](${this.base.files["resources"]["links"]["supportServer"]})`)
        await this.base.reply({ embeds: [embed] }, source)
    }

    async cmdHelp(mode: string, source) {

                            // > \`${this.base.prefix}ioda character_name\` ➣ IoDA date calculations.
        const embed = new MessageEmbed()
            .setColor(this.base.color)
            .setTitle("Bloom Bot Help")
            .setDescription(`**Prefix**: \` ${this.base.prefix} \` or \` / \`\n** Bloom Bot**: [Invitation Link](${this.base.files["resources"]["links"]["botInvite"]})\n**Support Server**: [Discord](${this.base.files["resources"]["links"]["supportServer"]})\n**Github**: [Source Code](${this.base.files["resources"]["links"]["github"]})`)
            .setThumbnail(this.base.files["resources"]["icon"])
 
            embed.addField("Commands:", `> \`${this.base.prefix}help\` ➣ Shows all Bloom commands.
                    > \`${this.base.prefix}g\` ➣ Summons a list of all guides commands.
                    > \`${this.base.prefix}g guide_name\` ➣ Returns a specific guide.
                    > \`${this.base.prefix}c class_name\` ➣ Shows Class data chart. Can use acronyms.
                    > \`${this.base.prefix}legends\` ➣ Shows the legends for the class data charts.
                    > \`${this.base.prefix}char character_name\` ➣ Shows Char pager info.
                    > \`${this.base.prefix}w search\` ➣ Directly Search AQW Wikidot.
                    > \`${this.base.prefix}servers\` ➣ Shows player count of Aqw servers.
                    > \`${this.base.prefix}credits\` ➣ Reveals the credits.
                    > \`${this.base.prefix}invite\` ➣ Get Bloom bot invite.`)

            embed.addField("Admin Commands:", `> \`${this.base.prefix}channels\` ➣ Shows registered Feed Channels.
                    > \`${this.base.prefix}register_raqw\` ➣ Set channel as r/AQW Feed.
                    > \`${this.base.prefix}unregister_raqw\` ➣ Removes r/AQW Feed registry.
                    > \`${this.base.prefix}register_daily role_id\` ➣ Set channel as Daily Gift Feed.
                    > \`${this.base.prefix}unregister_daily\` ➣ Removes Daily Gift Feed registry.
                    `)
            embed.addField("Useful Links: ", `[AuQW.tk](https://auqw.tk/) | [Class Tiers](${this.base.files["resources"]["links"]["classTiers"]}) | [Class Performance Excel](${this.base.files["resources"]["links"]["vanilleStats"]}) | [Wikidot](http://aqwwiki.wikidot.com/)`)

            // > \`/ws search\` ➣ Gets list of AQW Wikidot search results.

        await this.base.reply({ embeds: [embed] }, source)
    }

    async cmdCredits(mode: string, source) {
        const embed = new MessageEmbed()
            .setColor(this.base.color)
            // .setTitle("Credits")
            .setAuthor({name: "Bloom Bot Credits", iconURL: this.base.files["resources"]["icon"]})
            .setDescription(`Bloom Bot and Class Charts made by Bloom Autist.
                            Thanks to [Shiminuki](https://www.youtube.com/channel/UCyQ5AocDVVDznIslRuGUS3g) and [Molevolent](https://twitter.com/molevolent) for creating the [Class Tier List](https://docs.google.com/spreadsheets/d/1Ywl9GcfySXodGA_MtqU4YMEQaGmr4eMAozrM4r00KwI/edit?usp=sharing).
                            Lastly, thanks to Satan, Shane and to the [AutoQuest Worlds Community](https://auqw.tk/)!`)
        await this.base.reply({ embeds: [embed] }, source)
    }


    async cmdShowChannels(mode: string, source) {

        // Permission Check
        if (!source.member.permissionsIn(source.channel).has("ADMINISTRATOR")) {
            await source.reply("\`[Error]\`: You do not have administrator permission to use this command.")
            return
        }

        // Variables
        const guildID: string = String(source.guild.id)

        var content = ""
        if (this.base.aqwChannels.hasOwnProperty(guildID) && this.base.aqwChannels[guildID].trim() != "") {
            content += `**r/AQW**\n\`Feed Channel\`: <#${this.base.aqwChannels[guildID]}>\n\n`
        } 
        if (this.base.dailyChannels.hasOwnProperty(guildID) && this.base.dailyChannels[guildID].channel.trim() != "") {
            content += `**Daily Gifts**\n\`Feed Channel\`: <#${this.base.dailyChannels[guildID].channel}>`
            if (this.base.dailyChannels[guildID].hasOwnProperty("role") && this.base.dailyChannels[guildID].role.trim() != "") {
                content += `\n\`Daily Gift Role\`: <@&${this.base.dailyChannels[guildID].role}>`
            }
        } 

        // Embed
        const embed = new MessageEmbed()
            .setColor(this.base.color)
            .setAuthor({name: `Bloom Bot`, iconURL: this.base.files["resources"]["icon"]})
            .setTitle("Registered Feed Channels")
        if (content !== "") {
            embed.setDescription(content)
        } else {
            embed.setDescription(`No registered Channel. Please check \`${this.base.prefix}help\` for more info.`)
        } 

        await this.base.reply({ embeds: [embed] }, source)
    }
}

