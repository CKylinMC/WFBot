# WFBot
一个中文Warframe信息查询TelegramBot（PC）,可以用于在GAS(Google App Script)部署

API来自[WarframeStat.us API](https://api.warframestat.us/pc)，词典来自[Richasy/WFA_Lexicon](https://github.com/Richasy/WFA_Lexicon)，js模板来自网络。

## 命令
* /help - 欢迎和帮助
* /time - 查询平原和地球时间与气候
* /nw - 查询夜波任务
* /vd - 查询虚空商人
* /sortie - 查询突击信息
* /fissures - 查询虚空裂缝信息
* /conprogress - 查询入侵建造进度信息
* /darvo - 查询每日Darvo优惠信息
* /kuva - 查询当前赤毒任务
* /arbit - 查询当前仲裁任务 
* /invas - 查询当前入侵任务

## 选项

 * [showWaitMsg](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L9) (true/false)
   - 此选项用于开关是否在用户发送正确的命令后立刻回复一条"正在获取数据..."。这在使用获取信息缓慢的命令时可以告诉用户你的命令被收到了，而不是干等。

 * [token](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L1) (string)
   - 此选项用于设定你的机器人token。
   
## 极其简陋的配置方法步骤教学

1. 访问[BotFather](https://t.me/botfather)，输入`/newbot`，然后跟着提示创建一个Bot。
2. 输入`/mybots`，选择你刚刚创建的Bot，然后点击`API Token`，记下那一串字符串。
3. 登陆[Google Apps Script](https://script.google.com/home/my)后台，然后点击左边的新建脚本按钮。
4. 复制[Telebot.js](https://github.com/Cansll/WFBot/raw/master/Telebot.js)的所有内容到GAS。
5. 修改[Token](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L1)变量内容为你刚刚创建Bot时给你的那一串字符串。
6. 保存，找到工具条上的选择函数(或显示`myFunction`)，选择`setWebHook`。
7. 点击左侧三角形按钮运行一次。
8. 点击发布-部署为网络应用，输入项目名字。期间可能会提示你授权，请跟着提示确认。
9. 现在可以看看你的bot是不是可以响应你的指令了?
