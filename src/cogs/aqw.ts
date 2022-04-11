import BaseCog from './base'
import { Client, MessageEmbed } from "discord.js"
import cheerio, { CheerioAPI, Cheerio, Element } from "cheerio"
import { AxiosResponse } from 'axios'
import { NodeHtmlMarkdown } from 'node-html-markdown'

export default class AQWCog {
    // Class Metadata
    public description = "The Class Containing the AQW scrape Commands"
    private wikiIndex: Object = {}
    private emojiObj: Object = {
        "Sword_Table": "<:Sword_Table:923565757030363236>",
        "Armor_Table": "<:Armor_Table:923566567306969108>",
        "Axe_Table": "<:Axe_Table:923565848147423282>",
        "Cloak_Table": "<:Cloak_Table:923566796374704138>",
        "Dagger_Table": "<:Dagger_Table:923566158815322242>",
        "Gun_Table": "<:Gun_Table:923566264016850945>",
        "Mace_Table": "<:Mace_Table:923566336616058951>",
        "Polearm_Table": "<:Polearm_Table:923566435014438923>",
        "Staff_Table": "<:Staff_Table:923566501708038165>",
        "misc": "<:misc:923621566380658708>",
        "Helmet_table": "<:Helmet_table:923623081279389696>",
        "class_table": "<:class_table:923883849719644190>",
        "Pet_Table": "<:Pet_Table:923883819059281940>",
        "Bow_Table": "<:Bow_Table:923884197872021505>",
        "Wand_Table": "<:Wand_Table:923884430085484566>"
    }

    private INVALIDWIKIPAGE: Array<string> = [
        "Events", "Maps", "Cutscene-scripts",
        "Quests", "Chaos", "Game-menu", "Npcs"
    ]

    private SKIPWIKIIMAGE: Array<string> = [
        "Shops", "Factions", 
    ]

    constructor(private client: Client, private base: BaseCog) {

        this.getWikiIndex()

        // Command register
        this.base.registerCommand(this.cmdServers.bind(this), {
            name: 'servers',
            description: 'Shows the AQW Server status and it\'s player count.',
        })

        
        this.base.registerCommand(this.cmdChar.bind(this), {
            name: 'char',
            description: 'Searches for an AQW Character',
            options: [{
                name: 'character_name',
                description: "Enter a valid player character name.",
                required: true,
                type: base.dTypes.STRING,
            }]
        }, true)

        this.base.registerCommand(this.cmdWiki.bind(this), {
            name: 'w',
            description: 'AQW Wikidot Search',
            options: [{
                name: 'search_query',
                description: "Enter something to search in the aqw wiki.",
                required: true,
                type: base.dTypes.STRING,
            }]
        }, true)

    }

    /*==============================================================================================================
                                                                                               
                     ██████╗ ██████╗ ███╗   ███╗███╗   ███╗ █████╗ ███╗   ██╗██████╗ ███████╗
                    ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝
                    ██║     ██║   ██║██╔████╔██║██╔████╔██║███████║██╔██╗ ██║██║  ██║███████╗
                    ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██╔══██║██║╚██╗██║██║  ██║╚════██║
                    ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║██████╔╝███████║
                     ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝
                                                                                             
    ==============================================================================================================*/

    async cmdChar(mode: string, source, defered: boolean = false) {
        let args: string = ""

        // Args check
        switch (mode) {
            case "slash":
                let { options } = source
                args = options.getString("character_name").trim()
                break
            case "legacy":
                args = source.content.replace(`${this.base.prefix}char`, "").trim()
                if (args.length == 0) {
                    let embed = await this.invalidEntry()
                    await this.base.reply({ embeds: [embed] }, source, defered)
                    return
                }
                break;
        }

        // url
        const playerURL: string = "https://account.aq.com/CharPage?id=" + args.replace(/ /g, "+")

        // Gets Website
        const $ = await this.base.getWebsite(playerURL, 4) as CheerioAPI
        if (!$) return
        
        // Find name
        let playerName: string = $(".card-header").find("h1").text()
        if (playerName == "...") playerName = args

        // Get player data
        let details = $('.card-body').find(".row").text().split("\n")
    
        // Empty Player data
        if (details.length == 1 && details[0] == "") {
            let bodyinfo = $('.card-body').text().trim()

            // NO result
            if (!bodyinfo) {
                const embed = new MessageEmbed()
                    .setTitle(args.replace(/\_\_/, "\\\_\_"))
                    .setURL(playerURL)
                    .setColor(this.base.color)
                    .setAuthor({name: "Character Profile"})
                    .setDescription(`Character not found.`)
                    .setThumbnail(this.base.files["resources"]["images"]["not_found"])
                await this.base.reply({ embeds: [embed] }, source, defered)
                return  
            }

            // Has char but disabled
            let warn = "**Status**: " + bodyinfo
            while (true) {
                if (warn.includes("Disabled")) {
                    warn = "**Status**: Disabled\n**Reason**: Cheating, Rules Violations, or Payment Fraud."
                    break;
                }
                if (warn.includes("wandering")) {
                    warn = "**Status**: AFK\n**Reason**: Account has __not logged in__  for years."
                    break;
                }
                if (warn.includes("Locked")) {
                    warn = "**Status**: Locked\n**Reason**: Unknown. Contact support for help."
                    break;
                }
                break;
            }
            const embed = new MessageEmbed()
                .setTitle(playerName.replace(/\_\_/, "\\\_\_"))
                .setURL(playerURL)
                .setColor(this.base.color)
                .setAuthor({name: "Character Profile"})
                .setDescription(`${warn}`)
                .setThumbnail(this.base.files["resources"]["images"]["lock"])
            await this.base.reply({ embeds: [embed] }, source, defered)
            return 
        }

        // Parse Player Card Data
        let exceptedType: Array<string> = ["Level", "Faction", "Guild"]
        let charInfos: Object = {}
        for (let detail of details) {
            let a = detail.trim()
            if (a === "") continue
            let b = a.split(":")
            if (b[1] == "") {
            //    b[1] = "\u200b"
            //    charInfos[b[0]] = b[1]
               continue
            }
            let itemName = b[1].trim()
            if (exceptedType.includes(b[0])) {
                charInfos[b[0]] = itemName
                continue
            }
            charInfos[b[0]] = `[${itemName}](${this.wikiLinkifier(itemName)})`
        }

        // Get ID
        let ccid = $('script')['6'].children[0]["data"].match(/(var ccid = )[0-9]+/g)[0].split("=")[1].trim()

        // Get inventory

        let invWebsite = await this.base.getWebsite(`https://account.aq.com/CharPage/Inventory?ccid=${ccid}`, 5, false) as AxiosResponse
        const inv = JSON.parse(JSON.stringify(invWebsite.data))

        let iodaCount: number = 0
        let tpCount: number = 0
        let iodaItems: string = ""
        
        for (let item of inv) {
            if (item["strName"].includes("of Digital Awesomeness")) {
                iodaCount += 1
            }
            if (item["strName"].includes("Treasure Potion")) {
                tpCount = parseInt(item["intCount"])
            }
            if (item["strName"].includes("IoDA")) {
                iodaItems += `• ${item["strName"].trim()}\n`
            }
        }

        // Send Embed
        const embed = new MessageEmbed()
            .setTitle(playerName.replace(/\_\_/, "\\\_\_"))
            .setURL(playerURL)
            .setColor(this.base.color)
            .setAuthor({name: "Character Profile"})
            .setThumbnail(this.base.files["resources"]["images"]["aqw_icon_long"])

        // Only shows non-empty infos
        let _datadesc: Array<string> = ["Name", "Level", "Class", "Faction", "Guild", "ID"]
        let datadesc: string = ""//`Name: [${playerName.replace('__', '\__')}](${playerURL})\n`
        let equips: string = ""
        for (let info in charInfos) {
            if (_datadesc.includes(info)) {
                datadesc += `${info}: ${charInfos[info]}\n`
            } else {
                equips += `${info}: ${charInfos[info]}\n`
            }
        }

        // Adds special inventory
        let inventory: string = ""
        if (tpCount) inventory = `Treasure Potion: ${ tpCount }\n`
        if (iodaCount) inventory += `\nIoDA Token: ${iodaCount}\n`
        if (iodaItems) inventory += `IoDA Items:\n ${iodaItems}\n`
            
        embed.setDescription(datadesc + `ID: [${ ccid }](https://account.aq.com/CharPage/Inventory?ccid=${ccid})\u200b`)
        embed.addField("Equipment:", equips)
        if (tpCount || iodaCount || iodaItems) {
            embed.addField("Inventory:", "```YAML\n" + inventory + "```")
        }

        await this.base.reply({ embeds: [embed] }, source, defered)
    }

    async cmdServers(mode: string, source, defered: boolean=false) {
        const $: CheerioAPI = await this.base.getWebsite("https://game.aq.com/game/cf-serverlist.asp") as CheerioAPI
        if(!$) return

        // Get HTML
        let serverData = $('servers')

        // Variables
        let totalPlayers: number = 0
        let servers: Object = {}
        let onlineServerCount: number = 0
        let servText: string = ""
        // Parse Data
        for (let attrib of serverData) {
            if (attrib.name !== 'servers') continue
            let serv = attrib.attribs
            if (serv.bonline == "1") {
                servers[serv.icount] = `🟢 ${serv.sname}:   **${serv.icount}**\n`
                onlineServerCount += 1
            } else {
                servers[serv.icount] = `🔴 ${serv.sname}:   **${serv.icount}**\n`
            }
            
            totalPlayers += parseInt(serv.icount)
        }
        
        // Embed Construction
        let descText: string = `**Server Info**:\`\`\`YAML\nPlayers: ${totalPlayers}\nServers: ${onlineServerCount} / ${Object.keys(servers).length}\`\`\``
        for (let server of Object.keys(servers).reverse()) servText += servers[server]

        // Get time
        let datetime = new Date();
        let date = datetime.toLocaleString("en-US", { timeZone: "America/New_York" }); 

        const embed = new MessageEmbed()
            .setColor(this.base.color)
            .setTitle(`AQW Servers`)
            .setThumbnail(this.base.files["resources"]["images"]["server"])
            .setDescription(descText)
            .addField("Server List:", servText)
            .addField("Time:", `${date} EST`)
            
        this.base.reply({ embeds: [embed] }, source, defered)

    }

    async cmdWiki(mode: string, source, defered: boolean = false) {

        let args: string = ""

        // Args check
        switch (mode) {
            case "slash":
                let { options } = source
                args = options.getString("search_query").trim()
                break
            case "legacy":
                args = source.content.replace(`${this.base.prefix}w`, "").trim()
                if (args.length == 0) {
                    let embed = await this.invalidEntry()
                    await this.base.reply({ embeds: [embed] }, source, defered)
                    return
                }
                break;
        }


        // Check Wiki Index
        if (args.toLowerCase() in this.wikiIndex) {
            args = this.wikiIndex[args]
        }

        // Get Essentials
        const URL = this.wikiLinkifier(args)

        if (URL === "http://aqwwiki.wikidot.com/featured-gear-shop") {
            const embed = this.wikiNoResult(URL, "No.")
            this.base.reply({ embeds: [embed] }, source, defered)
            return
        }
        console.log(URL)
        // Try Direct or Refer
        try {
            const $ = await this.base.getWebsite(URL) as CheerioAPI

            // Page Validation
            let page = $('#page-content')

            // Get Wiki - Indirect - Has refer
            if (page.text().trim().includes("usually refers to")) {
                const links = page.find("a")
                const firstLink = "http://aqwwiki.wikidot.com" + links[0].attribs.href
                let linkText: string = `**Usually Refers to:**\n► [Disambiguation Page](${URL})\n`
                links.each((i, item) => {
                    linkText += `► [${$(item).text().trim()}](http://aqwwiki.wikidot.com${item.attribs.href}): \`${item.attribs.href.replace("/", "").replace(/-/g, " ")}\` \n`
                })
                this.base.getWebsite(firstLink)
                    .then(res => {
                        const $ = res
                        const result = this.getWiki($, firstLink)
                        const embed = result[0] as MessageEmbed
                        
                        if (result[1] === "invalid") {
                            this.base.reply({ embeds: [embed] }, source, defered)
                            return
                        } else {
                            embed.setDescription(linkText)
                            this.base.reply({ embeds: [embed] }, source, defered)
                            if (result.length === 1) return
                        }

                        // Send Shop
                        for (let text of result[1] as string[]) {
                            source.channel.send(text)
                        }
                        return
                    })
                return
            }

            // Get Wiki - Direct
            const result = this.getWiki($, URL)
            const embed = result[0] as MessageEmbed
 
            this.base.reply({ embeds: [embed] }, source, defered)

            if (result[1] === "invalid") {
                return
            } 
            if (result.length === 1) return

            // Send Shop
            for (let text of result[1] as string[]) {
                await source.channel.send(text)
            }
        

        // Wiki Search Results
        } catch (err) {
            console.log(err)
            const searchQuery = encodeURIComponent(args)
            const URLWiki = `http://aqwwiki.wikidot.com/search:site/q/${searchQuery}`

            var tryCount: number = 0

            while(true) {
                try {
                    if (tryCount >= 3) {
                        const embed = this.wikiNoResult(URLWiki, "Timeout Error. The wiki shitted itself.")
                        this.base.reply({ embeds: [embed] }, source, defered)
                        return
                    }
                    const $ = await this.base.getWebsite(URLWiki) as CheerioAPI

                    // Timeout error check
                    let errorCheck = $(".error-block").text().trim()
                    if (errorCheck) {
                        tryCount += 1
                        continue
                    }
                    let page = $(".search-results")

                    // No result
                    if ($(page).text().trim().includes("Sorry, no results found for your query.")) {
                        const embed = this.wikiNoResult(URLWiki)
                        this.base.reply({ embeds: [embed] }, source, defered)
                        return
                    }

                    // Parse Results

                    const embed = new MessageEmbed()
                        .setColor(this.base.color)
                        .setAuthor({name: `AQW Wiki Search`, iconURL: this.base.files["resources"]["images"]["aqw_icon"]})
                        .setTitle("Found Results")
                        .setURL(URLWiki)

                    const results = page.find(".item")
                    let desc: string = ""
                    for (let item of results) {
                        const itemObj = $(item).find(".title")
                        const link = itemObj.find("a")[0].attribs.href
                        const linkName = link.split("/")
                        const searchName = linkName[linkName.length - 1].replace(/-/g, " ").trim()
                        const title = itemObj.text().trim()
                        desc += `► [${title}](${link}): \`${searchName}\`\n`
                    }
                    embed.setDescription(desc)

                    this.base.reply({ embeds: [embed] }, source, defered)
                    return
                } catch (err) {
                    continue
                } 
            }

        }
    }

    // async cmdIODA(mode, source, defered=false) {
    //     let args: string = ""

    //     // Args check
    //     switch (mode) {
    //         case "slash":
    //             let { options } = source
    //             args = options.getString("character_name").trim()
    //             break
    //         case "legacy":
    //             args = source.content.replace(`${this.base.prefix}char`, "").trim()
    //             if (args.length == 0) {
    //                 let embed = await this.invalidEntry()
    //                 await this.base.reply({ embeds: [embed] }, source, defered)
    //                 return
    //             }
    //             break;
    //     }

    //     const playerURL: string = "https://account.aq.com/CharPage?id=" + args.replace(/ /g, "+")


        
    // }

    /*==============================================================================================================
                                                                                                       
                            ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
                            ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
                            ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
                            ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
                            ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
                             ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝
                                                                                        
    ==============================================================================================================*/

    async invalidEntry() {
        return this.base.simpleEmbedMsg("Character Search Error", "Please enter a character name")
    }

    wikiLinkifier(name: string) {
        const url = "http://aqwwiki.wikidot.com/" + name.trim().replace(/  /g, ' ').replace(/ /g, '-').replace("(", '').replace(")", '').toLowerCase()
        return url
    }


    toCaptialize(word: string) {
        if (!word) return word;
        return word[0].toUpperCase() + word.substr(1).toLowerCase();
    }

    // Returns textObject
    getBodyGeneric(page: Cheerio<Element>) {

        // Body - Convert to Mark Down 
        let texts = NodeHtmlMarkdown.translate(
            page.toString(),
          /* options (optional) */ {},
        ).split("\n")

        // Body - Clean up
        let textFiltered: Array<string> = []
        for (let text of texts) {
            if (text.includes("www.AQ.com")) continue
            if (text.includes("Browse this shop in our free web game")) continue
            if (text.includes("---")) continue
            if (text.includes("javascript") || text.includes("Thanks to")) continue
            if (text !== "") {
                let result: string = text
                if (text.includes("(/")) {
                    result = result.replace(/\(\//g, "(http://aqwwiki.wikidot.com/")
                }
                if (!text.includes("**") && text.includes("*")) {
                    result = result.replace("   * ", "<:blank:923853405573754901>► ")
                    result = result.replace("* ", "► ")
                    
                }
                result = result.replace("   * ", "<:blank:923853405573754901>► ")
                
                textFiltered.push(result)
            }
        }

        // Body - Split into object
        let textObject: Object = {}
        let current: string = ""
        for (let text of textFiltered) {
            if (current === "**Skills:**") continue
            if (text.includes(":**")) {
                let testHeader = text.split(":**")
                if (testHeader.length >= 2 && testHeader[1] !== '') {
                    current = testHeader[0].trim() + ":**"
                    if (current === "**Skills:**") continue
                    testHeader.splice(0, 1);
                    textObject[current] = [testHeader.join(" ").replace("►", "").trim()]
                    continue
                }
                current = text.trim()
                if (current === "**Skills:**") continue
                textObject[current] = []
                continue
            }
            let textMatch = text.match(/\*\*(.+?)\*\*/)
            if (textMatch && (text.replace(textMatch[0], "").trim() == "")) {
                current = textMatch[0]
                textObject[current] = []
                continue
            }
            if (!current.trim()) continue
            text = text.replace("* ", "► ")
            textObject[current].push(text.trim())
        }
        return textObject
    }

    // Returns Image url string
    getImage(page: Cheerio<Element>) {
        let image
        const imageTest = page.find(".yui-content")
        if (imageTest[0]) {
            image = imageTest.find("img")[0].attribs.src
        } else {
            let images = page.find("img")
            image = images[images.length - 1].attribs.src
        }
        if (image) {
            console.log("We got an image: " + image)
        } else {
            console.log("No image i guess ")
        }
        return image
    }

    // Returns shop category emoji
    getShopTag(emoji: string) {
        if (!(emoji.trim() in this.emojiObj)) {
            return "❌"
        }
        return this.emojiObj[emoji.trim()]
    }

    // Returns shopObject
    getShop($) {

        let shopObject: Object = {} 

        const main = $('#page-content')
        const shop = main.find(".yui-content")
        const navs = main.find(".yui-nav")
        main.find(".yui-content").remove()

        // Get nav
        let navList: Array<string> = []
        const navContents: Cheerio<Element> = $(navs).find("li")
        for (let nav of navContents) {
            navList.push($(nav).text().trim())
        }

        // Get items
        const shopContents: Cheerio<Element> = $(shop).find("div")
        shopContents.find('span[style="text-decoration: line-through;"]').each((i, item) => {
            $(item).remove()
        })

        let navCount: number = 0
        for (let shopTab of shopContents) {
            let rows = $(shopTab).find("tr")
            for (let row of rows) {
                const itemData = $(row).find("td")
                const findLink = $($(itemData[1]).find("a")[0]).attr("href")

                if (!findLink) continue

                const tag = $($(itemData[0]).find("img")[0]).attr("alt").replace(".png", "")
                const link = findLink.replace("/", "http://aqwwiki.wikidot.com/")
                const name = $(itemData[1]).text().trim()
                const price = $(itemData[2]).text().trim()

                if (!shopObject.hasOwnProperty(navList[navCount])) {
                    shopObject[navList[navCount]] = []
                }
                shopObject[navList[navCount]].push(`${this.getShopTag(tag)} \`${name} - ${price}\` ► ${link}`)
            }
            navCount += 1
        }
        return shopObject
    }


    getWiki($, URL) {

        // Title
        let title = $('#page-title').text().trim()

        // Crumbs
        let breadcrumbs: Array<string> = []
        $('#breadcrumbs').find('a').each((index, item) => {
            breadcrumbs.push(this.toCaptialize(item.attribs.href.replace("/", "")))
        })
        const pageType = breadcrumbs[breadcrumbs.length - 1].trim()
        console.log("TYPE:> " + pageType)
        if (this.INVALIDWIKIPAGE.includes(pageType)) {
            const embed = new MessageEmbed()
                .setColor(this.base.color)
                .setAuthor({name: `AQW Wiki Search`, iconURL: this.base.files["resources"]["images"]["aqw_icon"]})
                .setTitle("Invalid Search")
                .setURL(URL)
                .setDescription(`Wiki Page of \`${pageType}\` type is not allowed in this bot.`)
            return [embed, "invalid"]
        }
        // Tags
        let tags: Object = {}
        $('.page-tags').find("span").find("a").each((index, item) => {
            tags[item.attribs.href.match(/tag\/(.*?)#pages/)![0].replace("#pages", "").replace("tag/", "")] = item.attribs.href
        })
        
        // Main Page
        let page = $('#page-content')

        // Get Image
        var image = ""
        if (!this.SKIPWIKIIMAGE.includes(pageType)) {
            image = this.getImage(page).replace("https://", "http://")
        }

        // Remove class skills
        if (pageType == "Classes") {
            $(page.find(".skills")).remove()
        }

        // Remove line through
        page.find('span[style="text-decoration: line-through;"]').each((i, item) => {
            let thisItem = $(item)
            thisItem.remove()

            let parent = thisItem.parent()
            if (parent.children().length == 0 || parent[0].name == "li") {
                parent.remove()
            }
        })

        // Checks shop
        var shop: Object = {}
        if (pageType === "Shops") {
            shop = this.getShop($)
            $(page).find(".yui-content").remove()
        }

        // Remove scripts && imgs
        $(page).find("img").remove()
        $(page).find("script").remove()

        // Tag s
        let embedTitle = title
        if (tags.hasOwnProperty("ac")) embedTitle += " <:tagAC:819918881077985330> "
        if (tags.hasOwnProperty("specialoffer")) embedTitle += " <:tagSpecialOffer:819933780201439283> "
        if (tags.hasOwnProperty("rare")) embedTitle += " <:tagRare:819927693096124476> "
        if (tags.hasOwnProperty("seasonal")) embedTitle += " <:tagSeasonal:819927624343617558> "
        if (tags.hasOwnProperty("legend")) embedTitle += " <:tagLegend:819927815091650593> "
        if (tags.hasOwnProperty("pseudo-rare")) embedTitle += " <:tagPseudoRare:819933807296643072> "

        // Get Body
        const textObject: Object = this.getBodyGeneric(page)
        const embed = new MessageEmbed()
            .setColor(this.base.color)
            // .setAuthor(`AQW Wiki Search - ${breadcrumbs.join(" » ")}`, this.base.files["resources"]["images"]["aqw_icon"])
            .setAuthor({name: `AQW Wiki Search`, iconURL: this.base.files["resources"]["images"]["aqw_icon"]})
            .setTitle(embedTitle)
            .setURL(URL)
            .setFooter({text: Object.keys(tags).join(" | ")})
            .setImage(image)

        console.log(textObject)

        for (let header in textObject) {
            if (textObject[header].length === 0) continue
            if (textObject[header].length === 1 && textObject[header][0].length <= 20) {
                embed.addField(header, textObject[header][0].replace("►", ""), true)
                continue
            }
            let textraw = " "
            for (let text of textObject[header]) {
                if (textraw.length >= 900) {
                    embed.addField(header, textraw)
                    textraw = " "
                }
                textraw += text + "\n"
            }
            embed.addField(header, textraw)
        }
        
        // for (let header in shop) {
        //     let textraw = " "
        //     for (let text of shop[header]) {
        //         if (textraw.length >= 800) {
        //             embed.addField(header, textraw)
        //             textraw = " "
        //         }
        //         textraw += text + "\n"
        //     }
        //     embed.addField(header, textraw)
        // }

        let ShopContents: Array<string> = []
        if (shop) {
            for (let header in shop) {
                let textraw = `**${header}**\n`
                for (let text of shop[header]) {
                    if (textraw.length >= 1800) {
                        ShopContents.push(textraw)
                        textraw = ""
                    }
                    textraw += text + "\n"
                    
                }
                ShopContents.push(textraw)
            }
            return [embed, ShopContents]
        }

        return [embed]
        

    }

    wikiNoResult(URLWiki: string, message: string = "Nope. Try a different one.") {
        return new MessageEmbed()
            .setColor(this.base.color)
            .setAuthor({name: `AQW Wiki Search`, iconURL: this.base.files["resources"]["images"]["aqw_icon"]})
            .setTitle("No Result")
            .setURL(URLWiki)
            .setDescription(message)
    }

    async getWikiIndex() {
        const res = await this.base.getWebsite("https://raw.githubusercontent.com/DarkFireKiller/darkfirekiller.github.io/master/wiki/locs.js", 3, false) as AxiosResponse
        const data = res.data.replace("var locIndex = {\n", "").replace("\n};", "").trim().split(",")
        
        for (const point of data) {
            const item = point.split(":")
            try {
                this.wikiIndex[item[0].trim()] = item[1].replace(/\"/g, "").trim()
            } catch (err) {
                // console.log(err)
            }
 
        }
        // console.log(this.wikiIndex)
    }


    

}