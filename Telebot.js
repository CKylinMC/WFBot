var token = 'xxx';//机器人token

var statapi = 'https://api.warframestat.us/pc';//WF状态API
var nightwaveDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/master/WF_NightWave.json";//夜波词典
var wfDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/master/WF_Dict.json";//WF总词典
var modDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/master/WF_Modifier.json";//突击强化词典

var showMsgId = false;//测试用，功能作废，等待移除
var showWaitMsg = false;//开启此项可以让机器人收到消息时回复等待消息。


//////////////////////////////////////////// 不要修改下面的内容


function doGet(){
  return HtmlService.createHtmlOutput('<h1>Warframe TG BOT</h1><hr><a target="_blank" href="https://t.me/yorurinbot">@yorurinbot</a>');
}


function doPost(e) {
 // Make sure to only reply to json requests
 if(e.postData.type == "application/json") {
 
  // Parse the update sent from Telegram
  var update = JSON.parse(e.postData.contents);

// Instantiate the bot passing the update 
  var bot = new Bot(token, update);
  var bus = new CommandBus();
   
  bus.on(/\/start/, getStarted);
  bus.on(/\/help/, getStarted);
  bus.on(/\/帮助/, getStarted);
  
  bus.on(/\/wfbotinfo/, getWFBotInfo);
   
  bus.on(/\/时间\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getCycles);
  bus.on(/\/时间播报\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getCycles);
  bus.on(/\/time\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getCycles);
   
  bus.on(/\/夜波\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getNightwaves);
  bus.on(/\/午夜电波\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getNightwaves);
  bus.on(/\/nightwave\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getNightwaves);
  bus.on(/\/nw\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getNightwaves);
   
  bus.on(/\/奸商\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getVoidTrager);
  bus.on(/\/虚空商人\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getVoidTrager);
  bus.on(/\/voidtrader\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getVoidTrager);
  bus.on(/\/vd\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getVoidTrager);
   
  bus.on(/\/sortie\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getSortie);
  bus.on(/\/突击\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getSortie);
   
  bus.on(/\/fissures\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getFissures);
  bus.on(/\/裂缝\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getFissures);
   
  bus.on(/\/conprogress\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getConProgress);
  bus.on(/\/建造进度\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getConProgress);
   
  bus.on(/\/darvo\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getDarvo);
  bus.on(/\/每日优惠\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getDarvo);
   
  bus.on(/\/kuva\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getKuva);
  bus.on(/\/赤毒\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getKuva);
   
  bus.on(/\/arbit\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getArbitration);
  bus.on(/\/仲裁\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getArbitration);
   
  bus.on(/\/invas\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getInvasions);
  bus.on(/\/入侵\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getInvasions);
   
  bot.register(bus);
 
  // If the update is valid, process it
  if (update) {
   bot.process();
  }
   
 } 
}

function Bot (token, update) {
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
 this.commands.push({'regexp': regexp, 'callback': callback});
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
  'method' : 'post',
  'contentType': 'application/json',
  // Convert the JavaScript object to a JSON string.
  'payload' : JSON.stringify(data)
 };
 
 var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + this.token + '/' + method, options);
 
 if (response.getResponseCode() == 200) {
  return JSON.parse(response.getContentText());
 }

return false;
}

Bot.prototype.replyToSender = function (text) {
  if(this.update.message.chat.type=="supergroup"){
 return this.request('sendMessage', {
  'chat_id': "@"+this.update.message.chat.username,
  'parse_mode': "Markdown",
  'reply_to_message_id':this.update.message.chat.id,
  'text': msgID()+text
 });
  }else{
 return this.request('sendMessage', {
  'chat_id': this.update.message.from.id,
  'parse_mode': "Markdown",
  'text': msgID()+text
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

function getRandomKey(){
  return Math.floor(Math.random()*10000);
}

function msgID(){
  return showMsgId?"(MSGID"+getRandomKey()+")\n":"";
}

//////////////////////////////////////////// 开始和帮助
function getStarted(){
//  this.replyToSender(JSON.stringify(this.update));
  this.replyToSender(
    "*欢迎使用 Warframe 信息查询BOT！*\n\n"
    +"用法：\n"
    +"/help | /帮助 : 查询帮助(此消息)。\n"
    +"/time | /时间播报 : 查询平原和地球的时间和气候。\n"
    +"/wfbotinfo : 查询机器人信息。\n"
    +"\n"
    +"/nw | /午夜电波 : 查询午夜电波任务信息。\n"
    +"/vd | /虚空商人 : 查询虚空商人信息。\n"
    +"/sortie | /突击 : 查询每日突击信息。\n"
    +"/fissures | /裂缝 : 查询虚空裂缝信息。\n"
    +"/conprogress | /建造进度 : 查询入侵建造进度信息。\n"
    +"/darvo | /每日优惠 : 查询每日Darvo优惠信息。\n"
    +"/kuva | /赤毒 : 查询当前赤毒任务信息。\n"
    +"/arbit | /仲裁 : 查询当前仲裁任务信息。\n"
    +"/invas | /入侵 : 查询当前入侵任务信息。\n"
  );
}

function getWFBotInfo(){
  this.replyToSender("*Warframe CN Bot for Telegram*\n作者：CKylinMC\n开源地址：[Cansll/WFBot](https://github.com/Cansll/WFBot) | [更新日志](https://github.com/Cansll/WFBot/commits/master)\nAPI接口: [WarframeStat.us](https://docs.warframestat.us/)\n词典: [云乡](https://github.com/Richasy/WFA_Lexicon)");
}

//////////////////////////////////////////// 辅助

function getStat(){
  return JSON.parse(UrlFetchApp.fetch(statapi).getContentText());
}

function getBJTime(t){
    var d = new Date(t);
    d.setTime(d.getTime()+8*60*60*1000); 
    return d;
}

function stampToDate(s){
  var d = getBJTime(s);
  return "(UTC+8)"+d.getUTCFullYear()+"年"+(d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日"+d.getUTCHours()+":"+d.getUTCMinutes()+":"+d.getUTCSeconds()
}

function parseTime(t){
  return t.replace("d","天").replace("h","小时").replace("m","分钟").replace("s","秒");
}

function cn(m,dict){
  if(m){
    if(!dict) dict = getWFDict();
    //if(dict) var n = dict.filter(function(a){return a.en==m})[0].zh; else var n=m;
    try{
      var n = dict.filter(function(a){return a.en==m})[0].zh;
    }catch(Exception){
      var n=m;
      }
    if(n) return n;
    else return m;
  }
  else return m;
}

//////////////////////////////////////////// 平原信息

function getCycles(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var d = getBJTime(data.timestamp);
  var msg = "时间播报:\n\n"
    +"查询时间：(UTC+8)\n"
    +d.getUTCFullYear()+"年"+(d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日"+d.getUTCHours()+":"+d.getUTCMinutes()+":"+d.getUTCSeconds()+"\n\n"
    +"*地球*\n"
    +"- 当前："+(data.earthCycle.isDay?"白天":"夜晚")+"\n"
    +"- 距离切换："+parseTime(data.earthCycle.timeLeft)+"\n\n"
    +"*希图斯*\n"
    +"- 当前："+(data.cetusCycle.isDay?"白天":"夜晚")+"\n"
    +"- 距离切换："+parseTime(data.cetusCycle.timeLeft)+"\n\n"
    +"*福尔图纳*\n"
    +"- 当前："+(data.vallisCycle.isWarm?"温暖":"寒冷")+"\n"
    +"- 距离切换："+parseTime(data.vallisCycle.timeLeft)+"\n\n";
  this.replyToSender(msg);
}

//////////////////////////////////////////// 夜波

function getNWDict(){
  return JSON.parse(UrlFetchApp.fetch(nightwaveDict).getContentText());;
}

function nwcn(m,dict){
  if(m){
    if(!dict) dict = getNWDict();
    //if(dict) var n = dict.filter(function(a){return a.en==m})[0].zh; else var n=m;
    try{
      var n = dict.filter(function(a){return a.en==m})[0].zh;
    }catch(Exception){
      var n=m;
      }
    if(n) return n;
    else return m;
  }
  else return m;
}

function getNightwaves(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var dict = getNWDict();
  var data = getStat();
  var nwc = data.nightwave.activeChallenges;
  var contents = "*夜波：*";
  if(data.nightwave.active){
    var d = getBJTime(data.nightwave.expiry);
    contents+= "\n结束时间：(UTC+8)\n"
    +d.getUTCFullYear()+"年"+(d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日"+d.getUTCHours()+":"+d.getUTCMinutes()+":"+d.getUTCSeconds()+"\n任务内容："
    nwc.forEach(function(c){
    t = getBJTime(c.expiry);
    contents+= "\n\n+ *"+nwcn(c.title,dict)+"* ("+(c.isDaily?"每日":"每周")+(c.isElite?"精英":"日常")+")\n"
              +nwcn(c.desc,dict)
              +"\n*回报：*"+c.reputation
              +"\n*截止：*"+t.getUTCFullYear()+"年"+(t.getUTCMonth()+1)+"月"+t.getUTCDate()+"日"+t.getUTCHours()+":"+t.getUTCMinutes()+":"+t.getUTCSeconds();
    });
  }else
    contents+= "未开放。";
  
  this.replyToSender(contents);
}

//////////////////////////////////////////// 奸商

function getWFDict(){
  return JSON.parse(UrlFetchApp.fetch(wfDict).getContentText());
}

function getVTPoint(p,dict){
  var r = /^.+?\((.+?)\).*$/;
  var m = r.exec(p);
  if(m){
    if(!dict) dict = getWFDict();
    //if(dict) var n = dict.filter(function(a){return a.en==m[1]})[0].zh; else var n=m;
    try{
      var n = dict.filter(function(a){return a.en==m[1]})[0].zh;
    }catch(Exception){
      var n=m;
    }
    if(n) return n;
    else return m[1];
  }
  else return p;
}

function getVoidTrager(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var dict = getWFDict();
  var vd = data.voidTrader
  var contents = "*虚空商人*("+(vd.active?"已到达":"未到达")+")";
  contents+= "\n\n目标节点："+getVTPoint(vd.location,dict)+"中继站";
  if(vd.active){
    var inv = vd.inventory;
    var d = getBJTime(vd.expiry);
    contents+= "\n\n离开时间：\n"
    +d.getUTCFullYear()+"年"+(d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日"+d.getUTCHours()+":"+d.getUTCMinutes()+":"+d.getUTCSeconds()
    +"\n("+parseTime(vd.endString)+" 后)";
    contents+= "\n\n携带物品：\n\n";
    inv.forEach(function(c){ 
      contents+= "*"+cn(c.item,dict)+"*\n - 杜卡德金币："+c.ducats+"\n - 现金："+c.credits+"\n\n";
    });
  }else{
    var d = getBJTime(vd.activation);
    contents+= "\n\n到达时间：\n"
    +d.getUTCFullYear()+"年"+(d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日"+d.getUTCHours()+":"+d.getUTCMinutes()+":"+d.getUTCSeconds()
    +"\n("+parseTime(vd.startString)+" 后)";
  }
  this.replyToSender(contents);
}

//////////////////////////////////////////// 突击

function getModDict(){
  return JSON.parse(UrlFetchApp.fetch(modDict).getContentText());
}

function sortieNum(i){
  var t = "突击";
  switch(i){
    case 1:
      t+= "一";
      break;
    case 2:
      t+= "二";
      break;
    case 3:
      t+= "三";
      break;
    default:
      t = "未知突击";
  }
  return t;
}

function smcn(m,dict){
  if(m){
    if(!dict) dict = getModDict();
    //if(dict) var n = dict.filter(function(a){return a.en==m})[0].zh; else var n=m;
    try{
      var n = dict.filter(function(a){return a.en==m})[0].zh;
    }catch(Exception){
      var n=m;
      }
    if(n) return n;
    else return m;
  }
  else return m;
}

function getNode(p,dict){
  var r = /^.+?\((.+?)\).*$/;
  var m = r.exec(p);
  if(m){
    if(!dict) dict = getWFDict();
    //if(dict) var n = dict.filter(function(a){return a.en==m[1]})[0].zh; else var n=m;
    try{
      var n = dict.filter(function(a){return a.en==m[1]})[0].zh;
    }catch(Exception){
      var n=m;
    }
    if(n) return n+" "+p.split(" ")[0];
    else return m[1]+" "+p.split(" ")[0];
  }
  else return p;
}

function getSortie(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var sortie = data.sortie;
  
  if(sortie.active!=true){
    this.replyToSender("突击尚未开启。");
    return;
  }
  
  var dict = getWFDict();
  var moddict = getModDict();
  var eta = parseTime(sortie.eta);
  var contents = "*每日突击*\n(剩余 "+eta+")\n\n";
  contents+= "阵营："+sortie.faction+"\n"+"首领："+cn(sortie.boss,dict)+"\n\n";
  var variants = sortie.variants;
  var counter = 1;
  variants.forEach(function(c){ 
      contents+= "*"+sortieNum(counter++)+"*\n"+" - 强化："+smcn(c.modifier,moddict)+"\n - 节点："+getNode(c.node,dict)+"\n\n";
  });
  this.replyToSender(contents);
}

//////////////////////////////////////////// 裂缝

function getTier(i){
  var t = "";
  switch(i){
    case  1:
    case "1":
      t+= "古";
      break;
    case  2:
    case "2":
      t+= "前";
      break;
    case  3:
    case "3":
      t+= "中";
      break;
    case  4:
    case "4":
      t+= "后";
      break;
    default:
      t+= "?";
  }
  return t+"纪";
}

function getFissures(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var contents = "*虚空裂缝*\n\n";
  var dict = getWFDict();
  var fis = data.fissures;
  fis.forEach(function(c){ 
    contents+= "*("+getTier(c.tierNum)+") "+getNode(c.node,dict)+"*\n - 阵营："+c.enemy+"\n - 任务："+cn(c.missionType,dict)+"\n - 剩余："+parseTime(c.eta)+"\n\n";
  });
  this.replyToSender(contents);
}

//////////////////////////////////////////// 建造进度

function progressToStr(progress,step,filled,unfilled){
  if(!step) step = 5;
  if(!filled) filled = "|";
  if(!unfilled) unfilled = " ";
  if(progress<0) progress = 0;
  if(progress>100) progress = 100;
  progress = Math.floor(progress);
  var bar = "";
  var max = 100/step;
  while(progress>0){
    progress-=step;
    bar+=filled;
  }
  var uf = max-bar.length;
  for(i=0;i<uf;i++){
    bar+=unfilled;
  }
  return bar;
}

function getConProgress(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var contents = "*建造进度*\n\n";
  contents+= "*巨人战舰*\n进度：{"+progressToStr(data.constructionProgress.fomorianProgress)+"} "+data.constructionProgress.fomorianProgress+"%\n\n*利刃豺狼*\n进度：{"+progressToStr(data.constructionProgress.razorbackProgress)+"} "+data.constructionProgress.razorbackProgress+"%";
  this.replyToSender(contents);
}

//////////////////////////////////////////// Darvo

function toPercent(num, total) { 
    return Math.round(num/total*10000)/100.00;  
}

function getDarvo(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var contents = "*每日优惠*\n\n";
  var dict = getWFDict();
  var dd = data.dailyDeals;
  dd.forEach(function(c){ 
    contents+= "*"+cn(c.item,dict)+"*\n - 售价：*"+c.salePrice+"*(原价 "+c.originalPrice+","+c.discount+"%折扣)\n - 售出：{"+progressToStr(toPercent(c.sold,c.total))+"}"+c.sold+"/"+c.total+"\n - 剩余："+(c.total-c.sold)+"\n - 刷新："+parseTime(c.eta)+"后";
  });
  this.replyToSender(contents);
}

//////////////////////////////////////////// Kuva

function getKuva(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var contents = "*赤毒任务*\n\n";
  var dict = getWFDict();
  var kuva = data.kuva;
  kuva.forEach(function(c){ 
    var t = getBJTime();
    contents+= "*"+getNode(c.node,dict)+" ("+cn(c.type,dict)+")*\n - 阵营："+c.enemy+"\n - 结束："+stampToDate(c.expiry)+"\n"+(c.archwing?" - *空战任务*":"")+(c.sharkwing?" - *水下任务*":"")+"\n\n";
  });
  this.replyToSender(contents);
}

//////////////////////////////////////////// arbitration

function getArbitration(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var contents = "*仲裁任务*\n\n";
  var dict = getWFDict();
  var c = data.arbitration;
  //arbitration.forEach(function(c){ 
    contents+= "*"+getNode(c.node,dict)+" ("+cn(c.type,dict)+")*\n - 阵营："+c.enemy+"\n - 结束："+stampToDate(c.expiry)+"\n"+(c.archwing?" - *空战任务*":"")+(c.sharkwing?" - *水下任务*":"")+"\n\n";
  //});
  this.replyToSender(contents);
}

//////////////////////////////////////////// Invasions

function getInvasions(){
  if(showWaitMsg)this.replyToSender("正在获取数据...");
  var data = getStat();
  var contents = "*入侵任务*\n\n";
  var dict = getWFDict();
  var Invasions = data.invasions;
  var temprw;
  Invasions.forEach(function(c){ 
    if(!c.completed){
      contents+= "*"+c.attackingFaction+" VS "+c.defendingFaction+"* "+(c.vsInfestation?"(Infestation入侵)":"")+"\n"
       +" - 节点："+getNode(c.node,dict)+"\n"
       +" - 进度：{"+progressToStr(c.completion)+"}\n"
       +" - 剩余："+parseTime(c.eta)+"\n";
      if(c.vsInfestation){
        contents+= " - 防守奖励："+"\n";
        temprw = c.defenderReward.countedItems;
        temprw.forEach(function(i){
          contents+="  > "+cn(i.type,dict)+" x"+i.count+"\n";
        });
      }else{
        contents+= " - 帮助"+c.attackingFaction+"的奖励："+"\n";
        temprw = c.attackerReward.countedItems;
        temprw.forEach(function(i){
          contents+="  > "+cn(i.type,dict)+" x"+i.count+"\n";
        });
        contents+= " - 帮助"+c.defendingFaction+"的奖励："+"\n";
        temprw = c.defenderReward.countedItems;
        temprw.forEach(function(i){
          contents+="  > "+cn(i.type,dict)+" x"+i.count+"\n";
        });
      }
      contents+= "\n";
    }
  });
  this.replyToSender(contents);
}

