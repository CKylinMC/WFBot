// 请修改以下选项以符合你的要求

// 设置TelegramBot的Token
var token = 'xxx';

// 有的时候机器人需要收集的数据比较多，相应可能会缓慢。
// 开启此项可以让机器人收到消息时回复等待消息。
var showWaitMsg = true;

// 启用手动设置时区功能
// 建议开启此功能。
var usetimezone = true;

// 配合手动设置时区功能
// UTC+? (默认：Asia/Shanghai UTC+8)
var utc = 8;

// 数据接口设置，如果其中有失效您可以自行替换。
var statapi = 'https://api.warframestat.us/pc'; //WF状态API
// var nightwaveDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/WFA5/WF_NightWave.json"; //夜波词典
var wfDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/WFA5/WF_Dict.json"; //WF总词典
// var modDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/WFA5/WF_Modifier.json"; //突击强化词典
var wmDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/WFA5/WF_Sale.json"; //WF可售卖物品词典
var wmapi = "https://api.warframe.market/v1/items/%item%/statistics"; //WM数据接口
var wmorderapi = "https://api.warframe.market/v1/items/%item%/orders"; //WM数据接口
var wmitemapi = "https://api.warframe.market/v1/items/%item%"; //WM数据接口

// 配置到此为止

// 测试代码，默认输出到Logger
// 不影响发布后效果
var loggerMode = false;

// 直接访问时显示的内容，虽然一般情况下不应该出现此情况。
function doGet() {
    return HtmlService.createHtmlOutput('<h1>Warframe TG BOT</h1><hr><a target="_blank" href="https://t.me/yorurinbot">@yorurinbot</a>');
}

//////////////////////////////////////////// 不要修改下面的内容

// 测试用函数
function Dev_TestEntry() {
    loggerMode = true;
    Logger.log("[INFO] Started.")

    // 测试代码
    getCycles();

    Logger.log("[INFO] Stopped.")
}

function reply(e, text) {
    if (loggerMode) {
        Logger.log("[MSG] " + text);
        return;
    } else
        e.replyToSender(text);
}

function doPost(e) {
    // 自动禁用测试模式
    loggerMode = false;

    // 只响应JSON请求
    if (e.postData.type == "application/json") {

        // 解析数据
        var update = JSON.parse(e.postData.contents);

        // 初始化 
        var bot = new Bot(token, update);
        var bus = new CommandBus();

        // 注册命令

        bus.on(/\/start/, getStarted);
        bus.on(/\/help/, getStarted);
        bus.on(/\/帮助/, getStarted);

        bus.on(/\/wfbotinfo/, getWFBotInfo);

        bus.on(/\/时间/, getCycles);
        bus.on(/\/时间播报/, getCycles);
        bus.on(/\/time/, getCycles);

        bus.on(/\/夜波/, getNightwaves);
        bus.on(/\/午夜电波/, getNightwaves);
        bus.on(/\/nightwave/, getNightwaves);
        bus.on(/\/nw/, getNightwaves);

        bus.on(/\/奸商/, getVoidTrager);
        bus.on(/\/虚空商人/, getVoidTrager);
        bus.on(/\/voidtrader/, getVoidTrager);
        bus.on(/\/vd/, getVoidTrager);

        bus.on(/\/sortie/, getSortie);
        bus.on(/\/突击/, getSortie);

        bus.on(/\/fissures/, getFissures);
        bus.on(/\/裂缝/, getFissures);

        bus.on(/\/conprogress/, getConProgress);
        bus.on(/\/建造进度/, getConProgress);

        bus.on(/\/darvo/, getDarvo);
        bus.on(/\/每日优惠/, getDarvo);

        bus.on(/\/kuva/, getKuva);
        bus.on(/\/赤毒/, getKuva);

        bus.on(/\/arbit/, getArbitration);
        bus.on(/\/仲裁/, getArbitration);

        bus.on(/\/invas/, getInvasions);
        bus.on(/\/入侵/, getInvasions);

        bus.on(/\/wm\s*([\sA-Za-z0-9_\u4e00-\u9fa5]+)?/, getWMData);

        bus.on(/\/price\s*([\sA-Za-z0-9_\u4e00-\u9fa5]+)?/, getPrice);

        bus.on(/\/drop\s*([\sA-Za-z0-9_\u4e00-\u9fa5]+)?/, getDrops);

        bot.register(bus);

        // 执行处理
        if (update) {
            bot.process();
        }

    }
}

function Bot(token, update) {
    this.token = token;
    this.update = update;
    this.handlers = [];
}

Bot.prototype.register = function (handler) {
    this.handlers.push(handler);
}

Bot.prototype.process = function () {
    for (var i in this.handlers) {
        var event = this.handlers[i];
        var result = event.condition(this);
        if (result) {
            return event.handle(this);
        }
    }
}

function CommandBus() {
    this.commands = [];
}

CommandBus.prototype.on = function (regexp, callback) {
    this.commands.push({
        'regexp': regexp,
        'callback': callback
    });
}

CommandBus.prototype.condition = function (bot) {
    return bot.update.message.text.charAt(0) === '/';
}

CommandBus.prototype.handle = function (bot) {
    for (var i in this.commands) {
        var cmd = this.commands[i];
        var tokens = cmd.regexp.exec(bot.update.message.text);
        if (tokens != null) {
            return cmd.callback.apply(bot, tokens.splice(1));
        }
    }
    return bot.replyToSender("未知命令，尝试输入 /help 获得可使用的命令列表。");
}

Bot.prototype.request = function (method, data) {
    var options = {
        'method': 'post',
        'contentType': 'application/json',
        // 转换JS对象为Json
        'payload': JSON.stringify(data)
    };

    var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + this.token + '/' + method, options);

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }

    return false;
}

Bot.prototype.replyToSender = function (text) {
    if (this.update.message.chat.type == "supergroup") {
        return this.request('sendMessage', {
            'chat_id': "@" + this.update.message.chat.username,
            'parse_mode': "Markdown",
            'reply_to_message_id': this.update.message.chat.id,
            'text': text
        });
    } else {
        return this.request('sendMessage', {
            'chat_id': this.update.message.from.id,
            'parse_mode': "Markdown",
            'text': text
        });
    }
}

function setWebhook() {
    var bot = new Bot(token, {});
    var result = bot.request('setWebhook', {
        url: ScriptApp.getService().getUrl()
    });

    Logger.log(result);
}

function getRandomKey() {
    return Math.floor(Math.random() * 10000);
}

//////////////////////////////////////////// 开始和帮助
function getStarted() {
    reply(this,
        "*欢迎使用 Warframe 信息查询BOT！*\n\n" +
        "用法：\n" +
        "/help | /帮助 : 查询帮助(此消息)。\n" +
        "/time | /时间播报 : 查询平原和地球的时间和气候。\n" +
        "/wfbotinfo : 查询机器人信息。\n" +
        "\n" +
        "/nw | /午夜电波 : 查询午夜电波任务信息。\n" +
        "/vd | /虚空商人 : 查询虚空商人信息。\n" +
        "/sortie | /突击 : 查询每日突击信息。\n" +
        "/fissures | /裂缝 : 查询虚空裂缝信息。\n" +
        "/conprogress | /建造进度 : 查询入侵建造进度信息。\n" +
        "/darvo | /每日优惠 : 查询每日Darvo优惠信息。\n" +
        "/kuva | /赤毒 : 查询当前赤毒任务信息。\n" +
        "/arbit | /仲裁 : 查询当前仲裁任务信息。\n" +
        "/invas | /入侵 : 查询当前入侵任务信息。\n" +
        "\n" +
        "/wm <物品> : 查询物品的WM市场价格统计。\n" +
        "/price <物品> : 查询物品的WM价格。\n" +
        "/drop <物品> : 查询物品的掉落信息。\n"
    );
}

function getWFBotInfo() {
    reply(this, "*Warframe CN Bot for Telegram*\n作者：CKylinMC\n开源地址：[Cansll/WFBot](https://github.com/Cansll/WFBot) | [更新日志](https://github.com/Cansll/WFBot/commits/master)\nAPI接口: [WarframeStat.us](https://docs.warframestat.us/)\n词典: [云乡](https://github.com/Richasy/WFA_Lexicon)");
}

//////////////////////////////////////////// 辅助

function getStat(e) {
    var a = JSON.parse(UrlFetchApp.fetch(statapi, {
        headers: {
            "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        }
    }).getContentText());
    if (a.timestamp) return a;
    reply(e, "获取世界数据时出错，请稍后重试。\n如果持续出现这个问题，请在[Github 项目页面](https://github.com/Cansll/WFBot/issues/new?assignees=&labels=&template=wfbot--------.md&title=%5B%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%95%85%E9%9A%9C%5D)中提交Issue。");
    return {};
}

function getTimeObj(t) {
    var d = new Date(t);
    if (usetimezone) d.setTime(d.getTime() + utc * 60 * 60 * 1000);
    return d;
}

function stampToDate(s) {
    var d = getTimeObj(s);
    return (usetimezone ? "(UTC+" + utc + ")" : "") + d.getUTCFullYear() + "年" + (d.getUTCMonth() + 1) + "月" + d.getUTCDate() + "日" + fillNums(d.getUTCHours(), 2) + ":" + fillNums(d.getUTCMinutes(), 2) + ":" + fillNums(d.getUTCSeconds(), 2);
}

function fillNums(i, n) {
    i = i.toString();
    if (!n) n = 2;
    while (i.length < n) {
        i = "0" + i;
    }
    return i;
}

function parseTime(t) {
    return t.replace("d", "天").replace("h", "小时").replace("m", "分钟").replace("s", "秒").replace("Infinty", "无限");
}

function cn(m, dict) {
    if (m) {
        if (!dict) dict = getWFDict();
        //if(dict) var n = dict.filter(function(a){return a.en==m})[0].zh; else var n=m;
        try {
            var n = dict.filter(function (a) {
                return a.en == m
            })[0].zh;
        } catch (err) {
            var n = m;
        }
        return n;
    } else return m;
}

//////////////////////////////////////////// 平原信息

function getCycles() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var msg = "时间播报:\n\n" +
        "查询时间：\n" +
        stampToDate(data.timestamp) + "\n\n" +
        "*地球*\n" +
        "- 当前：" + (data.earthCycle.isDay ? "白天" : "夜晚") + "\n" +
        "- 距离切换：" + parseTime(data.earthCycle.timeLeft) + "\n\n" +
        "*希图斯*\n" +
        "- 当前：" + (data.cetusCycle.isDay ? "白天" : "夜晚") + "\n" +
        "- 距离切换：" + parseTime(data.cetusCycle.timeLeft) + "\n\n" +
        "*福尔图纳*\n" +
        "- 当前：" + (data.vallisCycle.isWarm ? "温暖" : "寒冷") + "\n" +
        "- 距离切换：" + parseTime(data.vallisCycle.timeLeft) + "\n\n" +
        "*魔胎之境*\n" +
        "- 当前：" + (data.cambionCycle.active === "fass" ? "FASS" : "VOME") + "\n" +
        "- 过期时间：" + calc_time_diff(data.cambionCycle.expiry) + "\n\n";
    reply(this, msg);
}

//////////////////////////////////////////// 夜波

// function getNWDict() {
//     return JSON.parse(UrlFetchApp.fetch(nightwaveDict).getContentText());;
// }

// function nwcn(m, dict) {
//     if (m) {
//         if (!dict) dict = getNWDict();
//         //if(dict) var n = dict.filter(function(a){return a.en==m})[0].zh; else var n=m;
//         try {
//             var n = dict.filter(function (a) {
//                 return a.en == m
//             })[0].zh;
//         } catch (err) {
//             var n = m;
//         }
//         return n;
//     } else return m;
// }

function getNightwaves() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    // var dict = getNWDict();
    var data = getStat(this);
    var nwc = data.nightwave.activeChallenges;
    var contents = "*夜波：*";
    if (data.nightwave.active) {
        contents += "\n结束时间：\n" +
            stampToDate(data.nightwave.expiry) + "(" + calc_time_diff(data.nightwave.expiry) + ")" + "\n任务内容："
        nwc.forEach(function (c) {
            contents += "\n\n+ *" + c.title + "* (" + (c.isDaily ? "每日" : "每周") + (c.isElite ? "精英" : "日常") + ")\n" +
                c.desc +
                "\n*回报：*" + c.reputation +
                "\n*截止：*" + calc_time_diff(c.expiry);
        });
    } else
        contents += "未开放。";

    reply(this, contents);
}

//////////////////////////////////////////// 奸商

function getWFDict() {
    return JSON.parse(UrlFetchApp.fetch(wfDict).getContentText());
}

function getVTPoint(p, dict) {
    var r = /^.+?\((.+?)\).*$/;
    var m = r.exec(p);
    if (m) {
        if (!dict) dict = getWFDict();
        //if(dict) var n = dict.filter(function(a){return a.en==m[1]})[0].zh; else var n=m;
        try {
            var n = dict.filter(function (a) {
                return a.en == m[1]
            })[0].zh;
        } catch (err) {
            var n = m[1];
        }
        return n;
    } else return p;
}

function getVoidTrager() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var dict = getWFDict();
    var vd = data.voidTrader
    var contents = "*虚空商人*(" + (vd.active ? "已到达" : "未到达") + ")";
    contents += "\n\n目标节点：" + getVTPoint(vd.location, dict) + "中继站";
    if (vd.active) {
        var inv = vd.inventory;
        contents += "\n\n离开时间：\n" +
            stampToDate(vd.expiry) + "(" + calc_time_diff(vd.expiry) + ")" +
            "\n(" + parseTime(vd.endString) + " 后)";
        contents += "\n\n携带物品：\n\n";
        inv.forEach(function (c) {
            contents += "*" + cn(c.item, dict) + "*\n - 杜卡德金币：" + c.ducats + "\n - 现金：" + c.credits + "\n\n";
        });
    } else {
        contents += "\n\n到达时间：\n" +
            stampToDate(vd.activation) + "(" + calc_time_diff(vd.activation) + ")" +
            "\n(" + parseTime(vd.startString) + " 后)";
    }
    reply(this, contents);
}

//////////////////////////////////////////// 突击

function getModDict() {
    return JSON.parse(UrlFetchApp.fetch(modDict).getContentText());
}

function sortieNum(i) {
    var t = "突击";
    switch (i) {
        case 1:
            t += "一";
            break;
        case 2:
            t += "二";
            break;
        case 3:
            t += "三";
            break;
        default:
            t = "未知突击";
    }
    return t;
}

function smcn(m, dict) {
    if (m) {
        if (!dict) dict = getModDict();
        //if(dict) var n = dict.filter(function(a){return a.en==m})[0].zh; else var n=m;
        try {
            var n = dict.filter(function (a) {
                return a.en == m
            })[0].zh;
        } catch (err) {
            var n = m;
        }
        if (n) return n;
        else return m;
    } else return m;
}

function getNode(p, dict) {
    var r = /^.+?\((.+?)\).*$/;
    var m = r.exec(p);
    if (m) {
        if (!dict) dict = getWFDict();
        //if(dict) var n = dict.filter(function(a){return a.en==m[1]})[0].zh; else var n=m;
        try {
            var n = dict.filter(function (a) {
                return a.en == m[1]
            })[0].zh;
        } catch (err) {
            var n = m;
        }
        if (n) return n + " " + p.split(" (")[0];
        else return m[1] + " " + p.split(" (")[0];
    } else return p;
}

function getSortie() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var sortie = data.sortie;

    if (sortie.active != true) {
        reply(this, "突击尚未开启。");
        return;
    }

    var dict = getWFDict();
    // var moddict = getModDict();
    var eta = parseTime(sortie.eta);
    var contents = "*每日突击*\n(剩余 " + eta + ")\n\n";
    contents += "阵营：" + sortie.faction + "\n" + "首领：" + cn(sortie.boss, dict) + "\n\n";
    var variants = sortie.variants;
    var counter = 1;
    variants.forEach(function (c) {
        contents += "*" + sortieNum(counter++) + "*\n" + " - 强化：" + cn(c.modifier, dict) + "\n - 节点：" + getNode(c.node, dict) + "\n\n";
    });
    reply(this, contents);
}

//////////////////////////////////////////// 裂缝

function getTier(i) {
    var t = "";
    switch (i) {
        case "Lith":
        case 1:
        case "1":
            t += "古";
            break;
        case "Meso":
        case 2:
        case "2":
            t += "前";
            break;
        case "Neo":
        case 3:
        case "3":
            t += "中";
            break;
        case "Axi":
        case 4:
        case "4":
            t += "后";
            break;
        default:
            t += "?";
    }
    return t + "纪";
}

function getFissures() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var contents = "*虚空裂缝*\n\n";
    var dict = getWFDict();
    var fis = data.fissures;
    fis.forEach(function (c) {
        contents += "*(" + getTier(c.tierNum) + ") " + getNode(c.node, dict) + "*\n - 阵营：" + c.enemy + "\n - 任务：" + cn(c.missionType, dict) + "\n - 剩余：" + parseTime(c.eta) + "\n\n";
    });
    reply(this, contents);
}

//////////////////////////////////////////// 建造进度

function progressToStr(progress, step, filled, unfilled) {
    if (!step) step = 5;
    if (!filled) filled = "|";
    if (!unfilled) unfilled = " ";
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;
    progress = Math.floor(progress);
    var bar = "";
    var max = 100 / step;
    while (progress > 0) {
        progress -= step;
        bar += filled;
    }
    var uf = max - bar.length;
    for (i = 0; i < uf; i++) {
        bar += unfilled;
    }
    return bar;
}

function getConProgress() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var contents = "*建造进度*\n\n";
    contents += "*巨人战舰*\n进度：{" + progressToStr(data.constructionProgress.fomorianProgress) + "} " + data.constructionProgress.fomorianProgress + "%\n\n*利刃豺狼*\n进度：{" + progressToStr(data.constructionProgress.razorbackProgress) + "} " + data.constructionProgress.razorbackProgress + "%";
    reply(this, contents);
}

//////////////////////////////////////////// Darvo

function toPercent(num, total) {
    return Math.round(num / total * 10000) / 100.00;
}

function getDarvo() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var contents = "*每日优惠*\n\n";
    var dict = getWFDict();
    var dd = data.dailyDeals;
    dd.forEach(function (c) {
        contents += "*" + cn(c.item, dict) + "*\n - 售价：*" + c.salePrice + "*(原价 " + c.originalPrice + "," + c.discount + "%折扣)\n - 售出：{" + progressToStr(toPercent(c.sold, c.total)) + "}" + c.sold + "/" + c.total + "\n - 剩余：" + (c.total - c.sold) + "\n - 刷新：" + parseTime(c.eta) + "后";
    });
    reply(this, contents);
}

//////////////////////////////////////////// Kuva

function getKuva() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var contents = "*赤毒任务*\n\n";
    var dict = getWFDict();
    var kuva = data.kuva;
    kuva.forEach(function (c) {
        var t = getTimeObj();
        contents += "*" + getNode(c.node, dict) + " (" + cn(c.type, dict) + ")*\n - 阵营：" + c.enemy + "\n - 结束：" + stampToDate(c.expiry) + "(" + calc_time_diff(c.expiry) + ")" + "\n" + (c.archwing ? " - *空战任务*" : "") + (c.sharkwing ? " - *水下任务*" : "") + "\n\n";
    });
    reply(this, contents);
}

//////////////////////////////////////////// arbitration

function getArbitration() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var contents = "*仲裁任务*\n\n";
    var dict = getWFDict();
    var c = data.arbitration;
    //arbitration.forEach(function(c){ 
    contents += "*" + getNode(c.node, dict) + " (" + cn(c.type, dict) + ")*\n - 阵营：" + c.enemy + "\n - 结束：" + stampToDate(c.expiry) + "(" + calc_time_diff(c.expiry) + ")" + "\n" + (c.archwing ? " - *空战任务*" : "") + (c.sharkwing ? " - *水下任务*" : "") + "\n\n";
    //});
    reply(this, contents);
}

//////////////////////////////////////////// Invasions

function getInvasions() {
    if (showWaitMsg) reply(this, "正在获取数据...");
    var data = getStat(this);
    var contents = "*入侵任务*\n\n";
    var dict = getWFDict();
    var Invasions = data.invasions;
    var temprw;
    Invasions.forEach(function (c) {
        if (!c.completed) {
            contents += "*" + c.attackingFaction + " VS " + c.defendingFaction + "* " + (c.vsInfestation ? "(Infestation入侵)" : "") + "\n" +
                " - 节点：" + getNode(c.node, dict) + "\n" +
                " - 进度：{" + progressToStr(c.completion) + "}\n" +
                " - 剩余：" + parseTime(c.eta) + "\n";
            if (c.vsInfestation) {
                contents += " - 防守奖励：" + "\n";
                temprw = c.defenderReward.countedItems;
                temprw.forEach(function (i) {
                    contents += "  > " + cn(i.type, dict) + " x" + i.count + "\n";
                });
            } else {
                contents += " - 帮助" + c.attackingFaction + "的奖励：" + "\n";
                temprw = c.attackerReward.countedItems;
                temprw.forEach(function (i) {
                    contents += "  > " + cn(i.type, dict) + " x" + i.count + "\n";
                });
                contents += " - 帮助" + c.defendingFaction + "的奖励：" + "\n";
                temprw = c.defenderReward.countedItems;
                temprw.forEach(function (i) {
                    contents += "  > " + cn(i.type, dict) + " x" + i.count + "\n";
                });
            }
            contents += "\n";
        }
    });
    reply(this, contents);
}

//////////////////////////////////////////// WM数据

function getSaleDict() {
    return JSON.parse(UrlFetchApp.fetch(wmDict).getContentText());
}

function getWMApi(item) {
    return JSON.parse(UrlFetchApp.fetch(wmapi.replace("%item%", item)).getContentText());
}

function getWMItemApi(item) {
    return JSON.parse(UrlFetchApp.fetch(wmitemapi.replace("%item%", item)).getContentText());
}

function getWMOrderApi(item) {
    return JSON.parse(UrlFetchApp.fetch(wmorderapi.replace("%item%", item)).getContentText());
}

function getFPlace(str) {
    str = str.toLowerCase();
    var i = "";
    switch (str) {
        case "uncommon":
            i += "银";
            break;
        case "rare":
            i += "金";
            break;
        case "common":
            i += "铜";
            break;
    }
    i += "部件";
    return i;
}

function parseHT(str) {
    var arr = str.split(" ");
    if (arr.length < 3) return str;
    var text = getTier(arr[0]) + " " + arr[1] + " " + getFPlace(arr[2]);
    return text;
}

function getSaleItem(item, dict) {
    if (!dict) dict = getSaleDict();
    var res;
    try {
        res = dict.filter(function (a) {
            return a.zh == item
        })[0];
        if (!res) res = dict.filter(function (a) {
            return a.en.toUpperCase() == item.toUpperCase()
        })[0];
    } catch (err) {
        res = dict.filter(function (a) {
            return a.en == item
        })[0];
    }

    if (!res) return false;
    return res;
}

function guess(str, dict, max) {
    if (!dict) return [];
    if (!str) return [];
    if (!max) max = 5;
    var reg = new RegExp(str);
    var arr = [];
    try {

        dict.filter(function (a) {
            return reg.test(a.zh);
        }).forEach(function (a) {
            if (arr.length < max) arr.push(a.zh);
        });
    } catch (err) {
        //
    }
    try {
        dict.filter(function (a) {
            return reg.test(a.en);
        }).forEach(function (a) {
            if (arr.length < max) arr.push(a.en);
        });
    } catch (err) {
        //
    }
    return arr;
}

function parseWM(item) {
    var res = UrlFetchApp.fetch("https://warframe.market/items/" + item);
    if (res.getResponseCode() != 200) {
        if (res.getResponseCode() == 404) {
            return "在WM市场中未能找到此物品。";
        }
        return "WM市场未能返回正确的数据。";
    }
    var page = res.getContentText();
    var datastr = page.split("<meta name=\"description\" content=\"")[1].split(" | All trading")[0];
    var price = datastr.split("ce: ")[1].split(" platinum | ")[0]+" 白金";
    var volume = datastr.split("me: ")[1].split(" | Get the best trading")[0];
    return "+ *参考价格：*" + price + "\n+ *交易数量：*" + volume;
}

function getPrice(item) {
    if (showWaitMsg) reply(this, "正在获取数据...");
    if (!item || item == "") {
        reply(this, "*WM查询(Beta)*\n需要指定物品。\n用法：`/price <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS");
        return;
    }
    item = item.toUpperCase();
    var wmDict = getSaleDict();
    var res = getSaleItem(item, wmDict);
    if (res == false) {
        var o = guess(item, wmDict);
        if (o.length == 0) reply(this, "*WM查询(Beta)*\n查询：" + item + "\n没有这条词条。\n用法：`/price <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS");
        else {
            var contents = "*WM查询(Beta)*\n查询：" + item + "\n没有这条词条。\n\n您输入的或许是这些中的一个？\n";
            o.forEach(function (oi) {
                contents += " + `" + oi + "`\n";
            });
            contents += "\n请使用`/price [上面内容的完整字符]`命令进行查询，长按上面的字符可以进行复制。";
            reply(this, contents);
        }
        return;
    }
    var contents = "*WM查询(Beta)*\n";
    contents += "查询：" + res.zh + "\n";
    contents += "英文：" + res.en + "\n\n";
    contents += parseWM(res.code);
    contents += "\n\nWM市场链接：[" + res.en + " | Warframe Market](https://warframe.market/items/" + res.code + ")";
    reply(this, contents);
}

function getWMData(item) {
    if (showWaitMsg) reply(this, "正在获取数据...");
    if (!item || item == "") {
        reply(this, "*WM查询(Beta)*\n需要指定物品。\n用法：`/wm <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS");
        return;
    }
    item = item.toUpperCase();
    var wmDict = getSaleDict();
    var res = getSaleItem(item, wmDict);
    if (res == false) {
        var o = guess(item, wmDict);
        if (o.length == 0) reply(this, "*WM查询(Beta)*\n查询：" + item + "\n没有这条词条。\n用法：`/wm <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS");
        else {
            var contents = "*WM查询(Beta)*\n查询：" + item + "\n没有这条词条。\n\n您输入的或许是这些中的一个？\n";
            o.forEach(function (oi) {
                contents += " + `" + oi + "`\n";
            });
            contents += "\n请使用`/wm [上面内容的完整字符]`命令进行查询，长按上面的字符可以进行复制。";
            reply(this, contents);
        }
        return;
    }
    var contents = "*WM查询(Beta)*\n查询：" + res.zh + "\n";
    contents += "英文：" + res.en + "\n\n";
    try {
        var wmdata = getWMApi(res.code);
    } catch (err) {
        contents += "WM查询失败。";
        reply(this, contents);
        return;
    }
    var rd = wmdata.payload.statistics_live['48hours'];
    contents += "**48小时交易数据**\n\n";
    var buy_min_price = -1;
    var buy_max_price = -1;
    var buy_wa_price = -1;
    var buy_avg_price = -1;
    var sell_min_price = -1;
    var sell_max_price = -1;
    var sell_wa_price = -1;
    var sell_avg_price = -1;
    rd.forEach(function (d) {
        if (d.order_type == "buy") {
            if (buy_wa_price == -1) {
                buy_wa_price = d.wa_price;
            }
            if (buy_avg_price == -1) {
                buy_avg_price = d.avg_price;
            }
            if (buy_min_price == -1 || buy_min_price > d.min_price) {
                buy_min_price = d.min_price;
            }
            if (buy_max_price == -1 || buy_max_price < d.max_price) {
                buy_max_price = d.max_price;
            }
        } else if (d.order_type == "sell") {
            if (sell_wa_price == -1) {
                sell_wa_price = d.wa_price;
            }
            if (sell_avg_price == -1) {
                sell_avg_price = d.avg_price;
            }
            if (sell_min_price == -1 || sell_min_price > d.min_price) {
                sell_min_price = d.min_price;
            }
            if (sell_max_price == -1 || sell_max_price < d.max_price) {
                sell_max_price = d.max_price;
            }
        }
    });

    contents += "**购买数据**\n+ *最新期望价格：*" + buy_wa_price + "\n+ *最新平均价格：*" + buy_avg_price + "\n+ *48小时最高价格：*" + buy_max_price + "\n+ *48小时最低价格：*" + buy_min_price + "\n\n";
    contents += "**卖出数据**\n+ *最新期望价格：*" + sell_wa_price + "\n+ *最新平均价格：*" + sell_avg_price + "\n+ *48小时最高价格：*" + sell_max_price + "\n+ *48小时最低价格：*" + sell_min_price + "\n\n";
    contents += "WM市场链接：[" + res.en + " | Warframe Market](https://warframe.market/items/" + res.code + ")";
    reply(this, contents);
}

function getDrops(item) {
    if (showWaitMsg) reply(this, "正在获取数据...");
    if (!item || item == "") {
        reply(this, "*掉落查询(Beta)*\n需要指定物品。\n用法：`/drop <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS");
        return;
    }
    item = item.toUpperCase();
    var wmDict = getSaleDict();
    var res = getSaleItem(item, wmDict);
    if (res == false) {
        var o = guess(item, wmDict);
        if (o.length == 0) reply(this, "*物品信息查询(Beta)*\n查询：" + item + "\n没有这条词条(-1)。\n用法：`/drop <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS");
        else {
            var contents = "*物品信息查询(Beta)*\n查询：" + item + "\n没有这条词条(-2)。\n\n您输入的或许是这些中的一个？\n";
            o.forEach(function (oi) {
                contents += " + `" + oi + "`\n";
            });
            contents += "\n请使用`/drop [上面内容的完整字符]`命令进行查询，长按上面的字符可以进行复制。";
            reply(this, contents);
        }
        return;
    }
    var contents = "*物品信息查询(Beta)*\n查询：" + res.zh + "\n";
    contents += "英文：" + res.en.toUpperCase() + "\n";
    try {
        var wmdata = getWMItemApi(res.code);
    } catch (err) {
        contents += "WM查询失败。";
        reply(this, contents);
        return;
    }
    var wantedData = res.en.toUpperCase();
    var data = wmdata.payload.item.items_in_set;
    var other = [];
    var zh;
    data.forEach(function (a) {
        if (a.en.item_name.toUpperCase() == wantedData || wantedData.indexOf("SET") != 0) {
            if (a.en.item_name.toUpperCase().indexOf("SET") <= 0) {
                if (wantedData.indexOf("SET") != 0) {
                    zh = getSaleItem(a.en.item_name, wmDict).zh || a.en.item_name;
                    contents += "\n\n= `" + zh + "`";
                }
                contents += "\n+ *交易税额：*" + a.trading_tax;
                if (a.zh.drop.length != 0) {
                    contents += "\n+ *遗物掉落：*";
                    a.zh.drop.forEach(function (b) {
                        contents += "\n   > " + parseHT(b.name);
                    });
                } else {
                    contents += "\n+ 暂无掉落或需要合成。";
                }
            }
        } else {
            other.push(getSaleItem(a.en.item_name.toUpperCase(), wmDict).zh);
        }
    });
    if (other) {
        contents += "\n\n+ *你可能还想看：*";
        other.forEach(function (c) {
            contents += "\n  > `" + c + "`";
        });
    }

    contents += "\n\nWM市场链接：[" + res.en + " | Warframe Market](https://warframe.market/items/" + res.code + ")";
    reply(this, contents);

}

//From: https://blog.csdn.net/weixin_43295397/article/details/84940910
function calc_time_diff(target_time) {
    var now_time = Date.parse(new Date());
    var end_time = Date.parse(new Date(target_time));
    if (end_time < now_time) {
        return "已经切换"
    } else {
        var time_diff_stamp = end_time - now_time;
        var days = Math.floor(time_diff_stamp / (24 * 3600 * 1000));
        var leave1 = time_diff_stamp % (24 * 3600 * 1000);
        var hours = Math.floor(leave1 / (3600 * 1000));
        var leave2 = leave1 % (3600 * 1000);
        var minutes = Math.floor(leave2 / (60 * 1000));
        var leave3 = leave2 % (60 * 1000);
        var second = leave3 / 1000;
        var result = (days > 0 ? days + "天" : "") + (hours > 0 ? hours + "小时" : "") + (minutes > 0 ? minutes + "分" : "") + (second > 0 ? second + "秒" : "");
        if (result === "") return "现在";
        return result;
    }
}
