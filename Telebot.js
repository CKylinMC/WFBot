// 请修改以下选项以符合你的要求

// 设置TelegramBot的Token
var token = 'xxxxxxxxxxxxxxxxxx'; // change this

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

var VERSIONCODE = 173;

// 直接访问时显示的内容，虽然一般情况下不应该出现此情况。
function doGet() {
    setWebhook();
    return HtmlService.createHtmlOutput('<h1>Warframe TG BOT</h1><hr><a target="_blank" href="https://t.me/yorurinbot">@yorurinbot</a>');
}

//////////////////////////////////////////// 不要修改下面的内容

// 测试用函数
function Dev_TestEntry() {
    loggerMode = true;
    Logger.log("[INFO] Started.")

    // 测试代码
    getBuff();

    Logger.log("[INFO] Stopped.")
}

function reply(e, text, mid = null) {
    if (loggerMode) {
        Logger.log("[MSG] " + text);
        return null;
    } else{
      if(mid){
        return e.editMessage(text,mid);
      }else return e.replyToSender(text);
    }
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

        bus.on(/\/sentient/, getSentient);
        bus.on(/\/S船/, getSentient);

        bus.on(/\/upgrade/, getBuff);
        bus.on(/\/buff/, getBuff);
        bus.on(/\/加成/, getBuff);

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

Bot.prototype.editMessage = function (text,mid) {
    if (this.update.message.chat.type == "supergroup") {
        return this.request('editMessageText', {
            'chat_id': "@" + this.update.message.chat.username,
            'message_id':mid,
            'parse_mode': "Markdown",
            'reply_to_message_id': this.update.message.chat.id,
            'text': text
        });
    } else {
        return this.request('editMessageText', {
            'chat_id': this.update.message.from.id,
            'message_id':mid,
            'parse_mode': "Markdown",
            'text': text
        });
    }
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
        url: "https://script.google.com/macros/s/AKfycbzydXaH0MRg1btfvwte3Z8U11C7GPcNWA2PaoZlFCbLZ8Bvy9l7oZO-bQ/exec"
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
        "/sentient | /S船 : 查询当前Sentient异常信息。\n" +
        "/buff | /加成 : 查询当前全局加成信息。\n" +
        "\n" +
        "/wm <物品> : 查询物品的WM市场价格统计。\n" +
        "/price <物品> : 查询物品的WM价格。\n" +
        "/drop <物品> : 查询物品的掉落信息。\n"
    );
}

function getWFBotInfo() {
    reply(this, "*Warframe CN Bot for Telegram("+VERSIONCODE+")*\n作者：CKylinMC\n开源地址：[CKylinMC/WFBot](https://github.com/CKylinMC/WFBot) | [更新日志](https://github.com/CKylinMC/WFBot/commits/master)\nAPI接口: [WarframeStat.us](https://docs.warframestat.us/)\n词典: [云乡](https://github.com/Richasy/WFA_Lexicon)");
}

//////////////////////////////////////////// 辅助

function getStat(e,node="") {
    if(node!=""&&!node.startsWith("/")) node = "/"+node;
    try{
        var a = JSON.parse(UrlFetchApp.fetch(statapi+node, {
            headers: {
                "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        }).getContentText());
        if (node==""&&a.timestamp) return a;
        else{
          if(a&&a!={}&&a.code!=400&&!a.hasOwnProperty("error")) return a;
          else throw new Error();
        }
    }catch(err){
        reply(e, "获取世界数据时出错，请稍后重试。\n如果持续出现这个问题，请在[Github 项目页面](https://github.com/CKylinMC/WFBot/issues/new?assignees=&labels=&template=wfbot--------.md&title=%5B%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%95%85%E9%9A%9C%5D)中提交Issue。");
    return {};
    }
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
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var data = getStat(this);
    var msg = "*时间播报*:\n\n" +
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
    reply(this, msg, minfo!=null?minfo.result.message_id:null);
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
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    // var dict = getNWDict();
    var data = getStat(this,"nightwave");
    var nwc = data.activeChallenges;
    var contents = "*午夜电波：*";
    if (data.active) {
        contents += "\n当前是第 "+data.season+" 季度第 "+data.phase+" 部分";
        contents += "\n开始时间: "+stampToDate(data.activation);
        contents += "\n结束时间：\n" +
            stampToDate(data.expiry) + "(" + calc_time_diff(data.expiry) + ")" + "\n任务内容："
        nwc.forEach(function (c) {
            contents += "\n\n+ *" + c.title + "* (" + (c.isDaily ? "每日" : "每周") + (c.isElite ? "精英" : "日常") + ")\n" +
                c.desc +
                "\n*回报：*" + c.reputation +
                "\n*截止：*" + calc_time_diff(c.expiry);
        });
    } else
        contents += "当前没有开放的午夜电波活动。";

    reply(this, contents, minfo!=null?minfo.result.message_id:null);
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
        var n;
        //if(dict) var n = dict.filter(function(a){return a.en==m[1]})[0].zh; else var n=m;
        try {
            n = dict.filter(function (a) {
                return a.en == m[1]
            })[0].zh;
        } catch (err) {
            n = m[1];
        }
        return n;
    } else return p;
}

function getVoidTrager() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var vd = getStat(this,"voidTrader");
    var dict = getWFDict();
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
            stampToDate(vd.activation) /* + "(" + calc_time_diff(vd.activation) + ")"*/ +
            "\n(" + parseTime(vd.startString) + " 后)";
    }
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// 突击

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

function getNode(p, dict) {
  return p;
  // Official translations available now.
}

function getSortie() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var sortie = getStat(this,"sortie");

    if (sortie.active != true) {
        reply(this, "突击尚未开启。", minfo!=null?minfo.result.message_id:null);
        return;
    }
    //var dict = null;
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
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// 裂缝

function getTier(i) {
    var t = "";
    switch (i) {
        case "Lith":
        case 1:
        case "1":
            t += "古纪";
            break;
        case "Meso":
        case 2:
        case "2":
            t += "前纪";
            break;
        case "Neo":
        case 3:
        case "3":
            t += "中纪";
            break;
        case "Axi":
        case 4:
        case "4":
            t += "后纪";
            break;
        case 5:
        case "5":
            t += "安魂";
            break;
        default:
            t += "未知";
    }
    return t;
}

function getFissures() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var fis = getStat(this,"fissures");
    var contents = "*虚空裂缝*\n\n";
    var dict = getWFDict();
    fis.forEach(function (c) {
        contents += "*(" + getTier(c.tierNum) + ") " + getNode(c.node, dict) + "*\n - 阵营：" + c.enemy + "\n - 任务：" + cn(c.missionType, dict) + "\n - 剩余：" + parseTime(c.eta) + "\n\n";
    });
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// 建造进度

/*
 * A improved progress-to-str method
 */
function progressToStrIm(progress) {
  let fullfilled = ":";
  let halffilled = ".";
  let zerofilled = " ";
  let leftborder = "[";
  let rightborder= "]";

  let str = "";

  if(progress<0) progress = 0;
  if(progress>100) progress = 100;
  let pcounts = progress/2;

  str+=leftborder;

  let singlenum = false;

  for(var i=1;i<=50;i++){
    if(i<=pcounts){
      if(i%2){
        singlenum = true;
      }else{
        if(singlenum){
          singlenum = false;
          str+=fullfilled;
        }else{
          singlenum = false;
          str+=halffilled;
        }
      }
    }else{
      if(singlenum){
        singlenum = false;
        str+=halffilled;
      }else{
        if(str.length<26) str+=zerofilled;
      }
    }
  }

  str+=rightborder;

  return str
}

function getConProgress() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var data = getStat(this,"constructionProgress");
    var contents = "*建造进度*\n\n";
    contents += "*巨人战舰*\n进度：{" + progressToStrIm(data.fomorianProgress) + "} " + data.fomorianProgress + "%\n\n*利刃豺狼*\n进度：{" + progressToStrIm(data.razorbackProgress) + "} " + data.razorbackProgress + "%";
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// Darvo

function toPercent(num, total) {
    return Math.round(num / total * 10000) / 100.00;
}

function getDarvo() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var dd = getStat(this,"dailyDeals");
    var contents = "*每日优惠*\n\n";
    var dict = getWFDict();
    dd.forEach(function (c) {
        contents += "*" + cn(c.item, dict) + "*\n - 售价：*" + c.salePrice + "*(原价 " + c.originalPrice + "," + c.discount + "%折扣)\n - 售出：{" + progressToStrIm(toPercent(c.sold, c.total)) + "}   " + c.sold + "/" + c.total + "\n - 剩余：" + (c.total - c.sold) + "\n - 刷新：" + parseTime(c.eta) + "后";
    });
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// Kuva

function getKuva() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var data = getStat(this);
    var contenttitle = "*赤毒任务*\n\n";
    var contents = ""
    var dict = getWFDict();
    var kuva = data.kuva;
    kuva.forEach(function (c) {
        var t = getTimeObj();
        contents += "*" + getNode(c.node, dict) + " (" + cn(c.type, dict) + ")*\n - 阵营：" + c.enemy + "\n - 结束：" + stampToDate(c.expiry) + "(" + calc_time_diff(c.expiry) + ")" + "\n" + (c.archwing ? " - *空战任务*" : "") + (c.sharkwing ? " - *水下任务*" : "") + "\n\n";
    });
    if(contents=="")contents = "没有可显示的数据。"
    contents = contenttitle+contents;
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// arbitration

function getArbitration() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var c = getStat(this,"arbitration");
    var contents = "*仲裁任务*\n\n";
    var dict = getWFDict();
    //arbitration.forEach(function(c){ 
    contents += "*" + getNode(c.node, dict) + " (" + cn(c.type, dict) + ")*\n - 阵营：" + (typeof(c.enemy)==="undefined"?"无阵营或多阵营":c.enemy) + "\n - 结束：" + stampToDate(c.expiry) + "(" + calc_time_diff(c.expiry) + ")" + "\n" + (c.archwing ? " - *空战任务*" : "") + (c.sharkwing ? " - *水下任务*" : "") + "\n\n";
    //});
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// Invasions

function getInvasions() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var Invasions = getStat(this,"invasions");
    var contents = "*入侵任务*\n\n";
    var dict = getWFDict();
    var temprw;
    Invasions.forEach(function (c) {
        if (!c.completed) {
            contents += "*" + c.attackingFaction + " VS " + c.defendingFaction + "* " + (c.vsInfestation ? "(Infestation入侵)" : "") + "\n" +
                " - 节点：" + getNode(c.node, dict) + "\n" +
                " - 进度：{" + progressToStrIm(c.completion) + "}\n" +
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
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// Sentient

function getSentient() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var s = getStat(this,"sentientOutposts");
    var contenttitle = "*Sentient 异常*\n\n";
    var contents = ""
    var dict = getWFDict();
    if(!s||!s.hasOwnProperty('active')){
      contents = "没有可以显示的数据。";
    } else if(s.active!="true"&&s.active!=true){
      contents = "*当前没有任何 Sentient 异常*";
    }else{
      var endtime = calc_time_diff(s.expiry)
      if(endtime=="已经切换"){
        contents = "*当前没有任何 Sentient 异常。*\n\n*上一事件：*\n";
      }else{
        contents = "*正在发生：*\n"
        endtime+="后";
      }
      contents+= "- 阵营："+s.mission.faction;
      contents+= "\n- 类型: "+cn(s.mission.type, dict);
      contents+= "\n- 位置: "+cn(s.mission.node, dict);
      //contents+= "\n* 类型: "+s.mission.type;
      //contents+= "\n* 位置: "+s.mission.node;
      contents+= "\n- 开始: "+stampToDate(s.activation);
      contents+= "\n- 结束: "+endtime+"  ("+stampToDate(s.expiry)+")";
    }
    //if(contents=="")contents = "没有可显示的数据。"
    //contents = contenttitle+contents;
    //reply(this, contenttitle+123);
    reply(this, contenttitle+contents, minfo!=null?minfo.result.message_id:null);
}

//////////////////////////////////////////// 实时加成

function getBuff() {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    var data = getStat(this,"globalUpgrades");
    var msg = "*活动加成*\n\n";
    if(data){
      data.forEach((e,i)=>{
        msg+="*[活动 "+(i+1)+" ]* 加成: "+e.upgrade;
        msg+="\n- 是否有效: "+(e.expired?"已经过期":"当前可用")
        msg+="\n- 效果描述: "+e.upgrade+" "+e.operationSymbol+e.upgradeOperationValue;
        msg+="\n- 开始时间: "+stampToDate(e.start);
        msg+="\n- 结束时间: "+stampToDate(e.end);
        msg+="\n- 剩余时间: "+parseTime(e.eta);
        msg+="\n\n"
      })
    }else{
      msg+="没有正在进行的全局活动加成。"
    }
    reply(this, msg, minfo!=null?minfo.result.message_id:null);
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
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    if (!item || item == "") {
        reply(this, "*WM查询(Beta)*\n需要指定物品。\n用法：`/price <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS", minfo!=null?minfo.result.message_id:null);
        return;
    }
    item = item.toUpperCase();
    var wmDict = getSaleDict();
    var res = getSaleItem(item, wmDict);
    if (res == false) {
        var o = guess(item, wmDict);
        if (o.length == 0) reply(this, "*WM查询(Beta)*\n查询：" + item + "\n没有这条词条。\n用法：`/price <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS", minfo!=null?minfo.result.message_id:null);
        else {
            var contents = "*WM查询(Beta)*\n查询：" + item + "\n没有这条词条。\n\n您输入的或许是这些中的一个？\n";
            o.forEach(function (oi) {
                contents += " + `" + oi + "`\n";
            });
            contents += "\n请使用`/price [上面内容的完整字符]`命令进行查询，长按上面的字符可以进行复制。";
            reply(this, contents, minfo!=null?minfo.result.message_id:null);
        }
        return;
    }
    var contents = "*WM查询(Beta)*\n";
    contents += "查询：" + res.zh + "\n";
    contents += "英文：" + res.en + "\n\n";
    contents += parseWM(res.code);
    contents += "\n\nWM市场链接：[" + res.en + " | Warframe Market](https://warframe.market/items/" + res.code + ")";
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

function getWMData(item) {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    if (!item || item == "") {
        reply(this, "*WM查询(Beta)*\n需要指定物品。\n用法：`/wm <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS", minfo!=null?minfo.result.message_id:null);
        return;
    }
    item = item.toUpperCase();
    var wmDict = getSaleDict();
    var res = getSaleItem(item, wmDict);
    if (res == false) {
        var o = guess(item, wmDict);
        if (o.length == 0) reply(this, "*WM查询(Beta)*\n查询：" + item + "\n没有这条词条。\n用法：`/wm <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS", minfo!=null?minfo.result.message_id:null);
        else {
            var contents = "*WM查询(Beta)*\n查询：" + item + "\n没有这条词条。\n\n您输入的或许是这些中的一个？\n";
            o.forEach(function (oi) {
                contents += " + `" + oi + "`\n";
            });
            contents += "\n请使用`/wm [上面内容的完整字符]`命令进行查询，长按上面的字符可以进行复制。";
            reply(this, contents, minfo!=null?minfo.result.message_id:null);
        }
        return;
    }
    var contents = "*WM查询(Beta)*\n查询：" + res.zh + "\n";
    contents += "英文：" + res.en + "\n\n";
    try {
        var wmdata = getWMApi(res.code);
    } catch (err) {
        contents += "WM查询失败。";
        reply(this, contents, minfo!=null?minfo.result.message_id:null);
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
    reply(this, contents, minfo!=null?minfo.result.message_id:null);
}

function getDrops(item) {
    var minfo = null;if (showWaitMsg) minfo=reply(this, "正在获取数据...");
    if (!item || item == "") {
        reply(this, "*掉落查询(Beta)*\n需要指定物品。\n用法：`/drop <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS", minfo!=null?minfo.result.message_id:null);
        return;
    }
    item = item.toUpperCase();
    var wmDict = getSaleDict();
    var res = getSaleItem(item, wmDict);
    if (res == false) {
        var o = guess(item, wmDict);
        if (o.length == 0) reply(this, "*物品信息查询(Beta)*\n查询：" + item + "\n没有这条词条(-1)。\n用法：`/drop <物品>`\n请注意查询格式，例如AshP的机体应该如此查询:\n中文：ASH PRIME 机体\n英文：ASH PRIME CHASSIS", minfo!=null?minfo.result.message_id:null);
        else {
            var contents = "*物品信息查询(Beta)*\n查询：" + item + "\n没有这条词条(-2)。\n\n您输入的或许是这些中的一个？\n";
            o.forEach(function (oi) {
                contents += " + `" + oi + "`\n";
            });
            contents += "\n请使用`/drop [上面内容的完整字符]`命令进行查询，长按上面的字符可以进行复制。";
            reply(this, contents, minfo!=null?minfo.result.message_id:null);
        }
        return;
    }
    var contents = "*物品信息查询(Beta)*\n查询：" + res.zh + "\n";
    contents += "英文：" + res.en.toUpperCase() + "\n";
    try {
        var wmdata = getWMItemApi(res.code);
    } catch (err) {
        contents += "WM查询失败。";
        reply(this, contents, minfo!=null?minfo.result.message_id:null);
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
    reply(this, contents, minfo!=null?minfo.result.message_id:null);

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
