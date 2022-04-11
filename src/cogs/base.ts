import { Client, MessageEmbed, Message, Constants, ColorResolvable, CommandInteraction } from "discord.js"
import jsonfile from 'jsonfile'
import path from 'path'
import cheerio from "cheerio"
import axios from "axios"
import DataBase from './database'
const jsonfile = require('jsonfile')

class DInteraction {
    constructor(public source: CommandInteraction) {
    }
    async reply(dataObj) {
        await this.source.editReply(dataObj)
    }
}

interface slashCommand {
    func: Function; 
    data: Object;
    defered?: boolean;
    exclusive?: boolean;
}

export default class BaseCog {
    // Class Metadata
    public description = "The Base Class with common methods shared by all cogs"

    // Class Variables
    public files = {}
    public dTypes = Constants.ApplicationCommandOptionTypes
    public prefix = "\'"
    public color: ColorResolvable = '#44FC75'

    public database = new DataBase(this);
    public Ready;

    private commandList: Object = {}

    // Registered Channels
    public dailyChannels: Object = []
    public aqwChannels: Object = []
    public auqwChannels: Object = []
    

    constructor(private client: Client, public fileList: Array<string>, 
                public commands?) {

        client.on('shardError', error => {
            console.error('A websocket connection encountered an error:', error);
        });

        process.on('unhandledRejection', error => {
            console.error('Unhandled promise rejection:', error);
        });

        process.on('requestError', error => {
            console.error('Shayt:', error);
        });

        process.on('uncaughtException', function (err) {
            console.error(err.stack);
            console.log("Node NOT Exiting...");
        });


        // process.on('ESOCKETTIMEDOUT', error => {
        //     console.log("THIS HSIT AGAIN FUCK")
        // })

    }

    public async registerCommand(func: Function, slashData: any, defered: boolean=false, exclusive: boolean=false) {
        if (exclusive == false) {
            this.commands?.create(slashData)
        }
        this.commandList[slashData.name] = {func: func, data: slashData, defered: defered, exclusive: exclusive}
    }    

    public async createListener() {

        // Create Discord Listeners
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand()) return

            const prefix = interaction.commandName
            if (!this.commandList.hasOwnProperty(prefix)) return

            if (this.commandList[prefix].defered) {
                await interaction.deferReply();
            }
            try {
                await this.commandList[prefix].func("slash", interaction, this.commandList[prefix].defered)
            } catch (err) {
                if (this.commandList[prefix].defered) {
                    await interaction.editReply(`${err}`)
                    return
                } else {
                    await interaction.reply(`${err}`)
                }
            }
        })

        this.client.on("messageCreate", async msg => {
            
            
            const splitted_msg: Array<string> = msg.content.trim().split(" ")
            // Check prefix
            const prefix_text: string = splitted_msg[0].trim()
            // Return if not prefixed
            if (!prefix_text.startsWith(this.prefix)) return

            // Check Command Name
            let cName = splitted_msg[0].replace(this.prefix, "").trim()
            console.log("Command: ", cName)
            // Return if not
            if (!this.commandList.hasOwnProperty(cName)) return
            
            if (this.commandList[cName].exclusive === true) {
                if (msg.member!.id !== "252363724894109700") {
                    console.log("[Command]: Nope")
                    return
                }
            }
            
            try {
                await this.commandList[cName].func("legacy", msg, this.commandList[cName].defered)
            } catch (err) {
                await msg.reply(`${err}`)
            }
            
           
        })
    }    

    public async reply(data: any, source, defered:boolean=false) {
        if (source instanceof Message) {
            await source.reply(data)
            return
        }
        if (source instanceof CommandInteraction && defered) {
            await source.editReply(data)
        } else {
            source.reply(data)
        } 

    }

    public async getWebsite(url: string, tries: number = 5, parseData: boolean = true) {
        let tryCount: number = 0
        while(true) {
            if (tryCount >= tries) return NaN
            try {
                return axios.get(url)
                    .then(res => {
                        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
                        console.log('[http] Status Code:', res.status);
                        console.log('[http] Date in Response header:', headerDate);
                        if (!parseData) {
                            return res
                        }
                        return cheerio.load(res.data);
                    })
                    .catch(err => {
                        return NaN
                    });
            } catch (error) {
                tryCount += 1
                continue
            }
        }
    }

    async getWebData(url: string, tries: number = 5) {
        return axios.get(url)
            .then(res => {
                return res.data;
            })
            .catch(err => {
                console.log(err)
            });
    }

    // Reads Json files
    readData() {
        let curPath: string = path.join(__dirname, '../')
        for (let i = 0; i < this.fileList.length; i++) {
            jsonfile.readFile("./data/" + this.fileList[i] + ".json", 'utf8',  (err, data) => {
                if (err) throw(err)
                this.files[this.fileList[i]] = data
                console.log(`[File]: Finished reading ${this.fileList[i]}`)
            })
        }
    };

    // Sleep in miliseconds
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Checks if cmd uses right prefix
    isPrefixed(entry: string, cmdPrefix: string) {
        let pref = this.prefix + cmdPrefix
        if (entry.startsWith(pref + " ") || entry.startsWith(pref)) return true 
        else return false
    }

    // Removes prefix of cmd and returns string array of parameters
    ContentSplit(entry: string) {
        let _rawList: Array<string> = entry.replace(this.prefix, '').split(" ")!
        let result: Array<string> = []
        for (let item of _rawList) {
            console.log(item)
            result.push(item)
        }
        return result
    }

    ContentClean(entry: string, cmdPrefix: string) {
        return entry.replace(this.prefix + cmdPrefix, "").trim()
    }

    combineStrArray(str: Array<string>, removeLastLine:boolean=true) {
        if (str.length == 1) return str[0]
        var result: string = ""
        for (let i in str) {
            result += str[i] + "\n"
        }
        if (removeLastLine) result = this.removeLastOccurance(result, "\n")
        result += "\u200b"
        return result
    }

    removeLastOccurance(str: string, char: string) {
        var pos = str.lastIndexOf(char);
        return str.substring(0, pos) + str.substring(pos + 1)
    }

    simpleEmbedMsg(title: string, message: string) {
        return new MessageEmbed()
            .setColor(this.color)
            .setTitle(title)
            .setDescription(message)
    }
}