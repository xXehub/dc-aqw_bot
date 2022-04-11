import { Client, MessageEmbed, Constants } from "discord.js"
import BaseCog from './base'

export default class GuideCog {
    // Class Metadata
    public description = "The Class Containing the Guide Commands"

    // Class Variables
    private files = {}
    private guideHeaders = {}

    constructor(private client: Client, private base: BaseCog) {
        this.files = base.files

        // Remove outdated guides
        for (let guide in this.files["guides"]) {
            if (this.files["guides"][guide] === "header") continue
            if (("status" in this.files["guides"][guide]) && this.files["guides"][guide]["status"] == "outdated") {
                delete this.files["guides"][guide]
            }
        }

        // Create Guide list sorted by Categories
        let guideList: Array<string> = []
        for (let guide in this.files["guides"]) {
            if (this.files["guides"][guide] == "header") {
                this.guideHeaders[guide] = guideList
                guideList = []
                continue
            } else {
                guideList.push(guide)
            }
        }

        // Command register
        this.base.registerCommand(this.cmdGuide.bind(this), {
            name: 'g',
            description: 'Shows the guide list',
            options: [{
                name: 'guidename',
                description: "Enter a specific guide from the guide list.",
                required: false,
                type: base.dTypes.STRING,
            }]

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

    async cmdGuide(mode: string, source, defered: boolean = false) {
        var args
        var embed
        
        // Args check
        switch (mode) {
            case "slash":
                let { options } = source
                args = options.getString("guidename")
                if (args) {
                    embed = await this.getGuideEmbed(args, source)
                }
                break
            case "legacy":
                args = this.base.ContentSplit(source.content)
                if (args.length != 1) {
                    embed = await this.getGuideEmbed(args[1], source)
                }
                break;
        }


        
        // Found a guide. Send it.
        if (embed) {
            await this.base.reply({ embeds: [embed] }, source, defered)
            return
        }

        // Just send the glist
        embed = new MessageEmbed()
            .setColor(this.base.color)
            .setTitle('Guide Commands')
            .setDescription(`To summon this list, use \`${this.base.prefix}g\`.\n To know all Bloom Bot commands, use \`${this.base.prefix}help\`.\n\u200b`)

        let text: string = ""
        for (const [key, value] of Object.entries(this.files["guides"])) {
            if (this.files["guides"][key] == "header") {
                if (key === "Skill Guides") {
                    embed.addField(key, `${text}`)
                    text = ""
                    continue
                }
                embed.addField(key, `${text}\u200b`)
                text = ""
                continue
            } else {
                if (("ignore" in this.files["guides"][key]) && (this.files["guides"][key]["ignore"] == true)) continue
            }
            text += `\`${this.base.prefix}g ${key}\` -  ${this.files["guides"][key]["title"]}\n`
        }
        text = this.base.removeLastOccurance(text, "\n")
        await this.base.reply({ embeds: [embed] }, source, defered)
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

    private printHeader() {
        for (let i in this.guideHeaders) {
            console.log(`${i}: ${this.guideHeaders[i]}`)
        }
    }

    async getGuideSuggest(name: string, source) {
        let embed = new MessageEmbed()
            .setColor(this.base.color)
            .setTitle("Guide Not Found")
            .setDescription(`I'm sorry, the guide name \`${this.base.prefix}g ${name}\` does not exists. Maybe these?`)

        // Search for possible guide names
        let possibleGuides = {}
        for (let header in this.guideHeaders) {
            for (let i in this.guideHeaders[header]) {
                let guide = this.guideHeaders[header][i]
                if (guide.includes(name) || name.includes(guide)) {
                    if (!(header in possibleGuides)) {
                        possibleGuides[header] = []
                    }
                    possibleGuides[header].push(`\`${this.base.prefix}g ${guide}\` - ${this.files["guides"][guide]["title"]}`)
                }
            }
        }

        // If no possible guides, return
        if (Object.keys(possibleGuides).length === 0) {
            embed.setDescription(`I'm sorry, the guide name \`${this.base.prefix}g ${name}\` does not exists.`)
            return embed
        } 

        // Else return embed list
        for (let header in possibleGuides) {
            embed.addField(header, this.base.combineStrArray(possibleGuides[header]))
        }
        return embed
    }

    async getGuideEmbed(name: string, source) {
        var embed: MessageEmbed
        // Validity Check
        name = name.toLowerCase().trim()
        if (!(name in this.files["guides"]) || (this.files["guides"][name] == "header")) {
            embed = await this.getGuideSuggest(name, source)
            return
        }
        

        // Embed Creation
        let gItem = this.files["guides"][name]
        embed = new MessageEmbed()
            .setColor(this.base.color)
            .setTitle(`${gItem["title"]} `)
            .setDescription("Test")
        // Author Check
        if ("auth" in gItem) {
            let auths = this.base.files["resources"]["auths"]
            embed.setAuthor({name: auths[gItem["auth"]]["author"], iconURL: auths[gItem["auth"]]["image"]})
        }

        // Description Check
        if (typeof gItem["description"] === 'string' || gItem["description"] instanceof String) {
            embed.setDescription(gItem["description"])
        }
        else {
            embed.setDescription(this.base.combineStrArray(gItem["description"]))
        }

        // Field Check
        if ("fields" in gItem) {
            for (var field in gItem["fields"]) {
                embed.addField(field, this.base.combineStrArray(gItem["fields"][field]))
            }
        }

        // Inline Field check
        if ("fieldsInline" in gItem) {
            for (var field in gItem["fieldsInline"]) {
                embed.addField(field, this.base.combineStrArray(gItem["fieldsInline"][field]), true)
            }
        }

        // Image Check
        if ("image" in gItem) embed.setImage(gItem["image"])

        // Thumbnail Check
        if ("thumbnail" in gItem) embed.setThumbnail(gItem["thumbnail"]) 
        return embed
    }


}