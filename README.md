# Bloom Bot: Dragon
<img src="https://media.discordapp.net/attachments/805367955923533845/813066459281489981/icon3.png" width="100" height="100">
An AdventureQuest Worlds Discord Helper bot. Completely overhauled from scratch and ported from python to js. To invite the bot, simply use the link below. For any suggestions or concerns, join the Support Discord Server and we will help you.

&nbsp;

**Details**
- **Creator**: [Bloom Autist#4713](https://twitter.com/BloomAutist47)
- **Current Version**: v.2.0.0
- **Invitation Link**: [Bloom Bot](https://discord.com/api/oauth2/authorize?client_id=799639690176495637&permissions=2416298048&scope=applications.commands%20bot)
- **Discord Support**: [discord.gg/YcXzxPt593](https://discord.gg/YcXzxPt593)

**Prefix**
 - ` ; ` - Semi Colon
 - ` / ` - Slash

&nbsp;

# Credits
- Satan and Shane for their suggestions.
- AuQW Coomunity for their support.
- Molevolent and Shiminuki for their Class Charts
- AE for creating this game we both love and hate.

&nbsp;

# Command List
- `;help` ➣ Shows all Bloom commands.
- `;g` ➣ Summons a list of all guides commands.
- `;g guide_name` ➣ Returns a specific guide.
- `;c class_name` ➣ Shows Class data chart. Can use acronyms.
- `;legends` ➣ Shows the legends for the class data charts.
- `;char character_name` ➣ Shows Char pager info.
- `;w search` ➣ Directly Search AQW Wikidot.
- `;servers` ➣ Shows player count of Aqw servers.
- `;credits` ➣ Reveals the credits.
- `;invite` ➣ Get Bloom bot invite.

### Admin Commands:
- `;channels` ➣ Shows registered Feed Channels.
- `;register_raqw` ➣ Set channel as r/AQW Feed.
- `;unregister_raqw` ➣ Removes r/AQW Feed registry.
- `;register_daily role_id` ➣ Set channel as Daily Gift Feed.
- `;unregister_daily` ➣ Removes Daily Gift Feed registry.

&nbsp;

# Features
 - [Help](#help)
 - [Game Guide Helps](#game-guide-helps)
 - [Class Chart Search](#class-chart-search)
 - [Player Search](#player-search)
 - [Fully Detailed Wiki Search](#wiki-search)
 - [Server Details](#server-details)
 - [Alina's Daily Gift Updates (Automated)](#alinas-daily-gift-updates)
 - [r/AQW Reddit Feeds](#aqw-reddit-feeds)

&nbsp;

----
&nbsp;

## Help
**Description**: Opens the help embed containing list of commands.

**Command**: `;help`

**Screenshot**: [Click Here](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/screenshots/01-01%20Help.png?raw=true)


&nbsp;

&nbsp;






## Game Guide Helps
**Description**: Contains a wide array of guides ranging from gold guide, xp guide, farming guides, ioda guides, alchemy guides, boosted set guides, and more...

**Commands**:
- `;g` - Summons a list of all [guides](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/data/guides.json).
- `;g guide_name` - Returns a specific guide. 

**Example**:
`;g xp`
`;g setgeneral`
`;g topfarm`

&nbsp;

&nbsp;







## Class Chart Search
**Description**: Using the [data chart](https://docs.google.com/spreadsheets/d/1Ywl9GcfySXodGA_MtqU4YMEQaGmr4eMAozrM4r00KwI/edit?usp=sharing) created by [Molevolent](https://twitter.com/molevolent) and [Shiminuki](https://www.youtube.com/channel/UCyQ5AocDVVDznIslRuGUS3g), and with the help of the [AuQW coomunity](https://auqw.tk/), we created a Class Chart containing Class Radar Values, allowing you to see how strong certain classes are, as well as their difficulty.

**Command**: 
- `;c class_name` - Returns a class data chart of a given name or acronym. If no result, will give list of suggestions.

**Screenshot**: [image1](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/screenshots/02-01%20Class%20Search.png),
[image2](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/screenshots/02-02%20Class%20Search.png)

**Example**:
`;c legion revenant`
`;c vhl`

&nbsp;

&nbsp;





## Player Search
**Description**:  Gets player data from [AQW Character Page](https://account.aq.com/CharPage?).

**Command**: 
- `;char player_name`

**Screenshot**: [Click Here](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/screenshots/03-01%20Character%20Search.png)

**Example**:
`;char artix`
`;char sora to hoshi`

&nbsp;

&nbsp;







## Wiki Search
**Description**:  Smart Searches the [AQW Wikidot page](http://aqwwiki.wikidot.com/) and returns direct or search results. Due to limitations of discord (plus it didn't make any sense to), I've disabled the following page types: Events, Maps, Cutscene-scripts, Quests, Chaos, Game-menu, NPCs.

**Command**: 
- `;w search_key`

**Screenshot**: [Click Here](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/screenshots/04-01%20Wiki%20Search.png)

**Example**:
`;w legion revenant`
`;w necrotic sword of doom sword`

&nbsp;

&nbsp;






## Server Details
**Description**:  Shows a list of AQW servers and their player count and online status.
**Command**: `;servers`

**Screenshot**: [Click Here](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/screenshots/05-01%20Servers.png)

&nbsp;

&nbsp;





## Alina's Daily Gift Updates
**Description**:  Sets a discord channel to receive feed on Alina's Daily Gift Updates. Fully automated by Bloom Bot. You can also set a role id to ping whenever a new daily gift arrives.
**Note**: Ensure that Bloom Bot has message and embed permissions on the channel. If you will use the optional update ping *role_id*, then add mention permission.

**Screenshot**: [Click Here](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/screenshots/06-01%20Daily%20Gift.png)

**Commands**: 
- `;register_daily role_id` - Registers current channel to receive Daily Gift updates. *role\_id* is optional. To change the registered channel, simply enter this command on a new channel. 
- `;unregister_daily`- Removes registered daily gift feed channel.
- `;channels` - View registered feed channels.

**Example**:
- `;register_daily` - Will simply send updates to channel without any pings.
- `;register_daily 814054683651342367` - Will ping my **@Daily Gifts** role whenever there's a new update.

&nbsp;

&nbsp;





## AQW Reddit Feeds
**Description**:  Sets a discord channel to receive r/AQW feed updates.
**Note**: Ensure that Bloom Bot has message and embed permissions on the channel. If you will use the optional update ping *role_id*, then add mention permission.

**Screenshot**: [Click Here](https://github.com/BloomAutist47/bloom-bot-dragon/blob/main/screenshots/07-01%20Reddit%20Feed.png)

**Commands**: 
- `;register_raqw` - Registers current channel to receive r/AQW Reddit new posts. To change the registered channel, simply enter this command on a new channel. 
- `;unregister_raqw` - Removes registered r/AQW feed channel.
- `;channels` - View registered feed channels.

**Example**:
`;register_raqw` - that's literally it.

&nbsp;

&nbsp;

