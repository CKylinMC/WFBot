var token = 'xxx';
var statapi = 'https://api.warframestat.us/pc';
var nightwaveDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/master/WF_NightWave.json";
var wfDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/master/WF_Dict.json";
var showMsgId = false;
var showWaitMsg = false;


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
  return bot.replyToSender("Invalid command");
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

//////////////////////////////////////////// Start and help
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
  );
}

function getWFBotInfo(){
  this.replyToSender("*Warframe CN Bot for Telegram*\n作者：CKylinMC\n开源地址：[Cansll/WFBot](https://github.com/Cansll/WFBot) | [更新日志](https://github.com/Cansll/WFBot/commits/master)\nAPI接口: [WarframeStat.us](https://docs.warframestat.us/)\n词典: [云乡](https://github.com/Richasy/WFA_Lexicon)");
}

//////////////////////////////////////////// HELPERS

function getStat(){
  return JSON.parse(UrlFetchApp.fetch(statapi).getContentText());
}

function getBJTime(t){
    var d = new Date(t);
    d.setTime(d.getTime()+8*60*60*1000); 
    return d;
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

//////////////////////////////////////////// Cycles

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

//////////////////////////////////////////// Nightwave

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

//////////////////////////////////////////// Baro Ki Teer

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
