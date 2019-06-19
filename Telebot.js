var token = 'xxxx';
var statapi = 'https://api.warframestat.us/pc';
var nightwaveDict = "https://raw.githubusercontent.com/Richasy/WFA_Lexicon/master/WF_NightWave.json";
var showMsgId = false;


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
   
  bus.on(/\/时间播报\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getCycles);
  bus.on(/\/time\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getCycles);
   
  bus.on(/\/午夜电波\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getNightwaves);
  bus.on(/\/nightwave\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getNightwaves);
  bus.on(/\/nw\s*([A-Za-z0–9_]+)?\s*([A-Za-z0–9_]+)?/, getNightwaves);
   
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
    +"/nw | /午夜电波 : 查询午夜电波任务信息。\n"
    +"\n\nBot developed by ShadowKylin氏族\n"
    +"API: WarframeStat.us\n"
    +"DICT: https://github.com/Richasy/WFA_Lexicon"
  );
}

//////////////////////////////////////////// HELPERS

function getStat(){
  return JSON.parse(UrlFetchApp.fetch(statapi).getContentText());;
}

function getBJTime(t){
    var d = new Date(t);
    d.setTime(d.getTime()+8*60*60*1000); 
    return d;
}

//////////////////////////////////////////// Cycles

function getCycles(){
  this.replyToSender("正在获取数据...");
  var data = getStat();
  var d = getBJTime(data.timestamp);
  var msg = "时间播报:\n\n"
    +"查询时间：(UTC+8)\n"
    +d.getUTCFullYear()+"年"+(d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日"+d.getUTCHours()+":"+d.getUTCMinutes()+":"+d.getUTCSeconds()+"\n\n"
    +"*地球*\n"
    +"- 当前："+(data.earthCycle.isDay?"白天":"夜晚")+"\n"
    +"- 距离切换："+data.earthCycle.timeLeft+"\n\n"
    +"*希图斯*\n"
    +"- 当前："+(data.cetusCycle.isDay?"白天":"夜晚")+"\n"
    +"- 距离切换："+data.cetusCycle.timeLeft+"\n\n"
    +"*福尔图纳*\n"
    +"- 当前："+(data.vallisCycle.isWarm?"温暖":"寒冷")+"\n"
    +"- 距离切换："+data.vallisCycle.timeLeft+"\n\n";
  this.replyToSender(msg);
}

//////////////////////////////////////////// Nightwave

function getNWDict(){
  return JSON.parse(UrlFetchApp.fetch(nightwaveDict).getContentText());;
}

function getNightwaves(){
  this.replyToSender("正在获取数据...");
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
    contents+= "\n\n+ *"+c.title+"* ("+(c.isDaily?"每日":"每周")+(c.isElite?"精英":"日常")+")\n"
              +dict.filter(function(a){return a.en==c.desc})[0].zh
              +"\n*回报：*"+c.reputation
              +"\n*截止：*"+t.getUTCFullYear()+"年"+(t.getUTCMonth()+1)+"月"+t.getUTCDate()+"日"+t.getUTCHours()+":"+t.getUTCMinutes()+":"+t.getUTCSeconds();
    });
  }else
    contents+= "未开放。";
  
  this.replyToSender(contents);
}
