# WFBot

[![GitHub license](https://img.shields.io/github/license/Cansll/WFBot.svg)](https://github.com/Cansll/WFBot/blob/master/LICENSE) [![WFBot](https://img.shields.io/badge/BOT-@yorurinbot-green.svg?logo=telegram&style=flat)](https://t.me/yorurinbot)

一个中文Warframe信息查询TelegramBot（PC）,可以用于在GAS(Google App Script)部署

API来自[WarframeStat.us API](https://api.warframestat.us/pc)，词典来自[Richasy/WFA_Lexicon](https://github.com/Richasy/WFA_Lexicon)，js模板来自[unnikked的Gist](https://gist.github.com/unnikked/828e45e52e217adc09478321225ec3de)。

## 命令
```
/help | /帮助 : 查询帮助。
/time | /时间播报 : 查询平原和地球的时间和气候。
/wfbotinfo : 查询机器人信息。

/nw | /午夜电波 : 查询午夜电波任务信息。
/vd | /虚空商人 : 查询虚空商人信息。
/sortie | /突击 : 查询每日突击信息。
/fissures | /裂缝 : 查询虚空裂缝信息。
/conprogress | /建造进度 : 查询入侵建造进度信息。
/darvo | /每日优惠 : 查询每日Darvo优惠信息。
/kuva | /赤毒 : 查询当前赤毒任务信息。
/arbit | /仲裁 : 查询当前仲裁任务信息。
/invas | /入侵 : 查询当前入侵任务信息。
/sentient | /S船 : 查询当前Sentient异常信息。
/buff | /加成 : 查询当前全局加成信息。

/wm <物品> : 查询物品的WM市场价格统计。
/price <物品> : 查询物品的WM价格。
/drop <物品> : 查询物品的掉落信息。

/setplatform <pc|xb1|ps4|swi> : 修改在bot向你服务时查询的平台。
/getplatform : 查看当前bot向你服务时查询的平台。
```

## 选项

 * [showWaitMsg](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L6) (boolean)
   - 此选项用于开关是否在用户发送正确的命令后立刻回复一条"正在获取数据..."。这在使用获取信息缓慢的命令时可以告诉用户你的命令被收到了，而不是干等。

 * [token](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L4) (string)
   - 此选项用于设定你的机器人token。

 * [usetimezone](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L12) (boolean)
   - 此选项用于设定是否启用时区修正。

 * [utc](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L16) (int)
   - 此选项在开启时区修正后可以自动转换时区时间。填写数字(UTC+?)。

 * [defaultPlatform ](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L20) (string)
   - 默认查询平台。此字串将拼接到地址中，请勿乱填。支持的参数："pc" "ps4" "xb1" "swi"
   - 此选项设定bot默认情况下的平台，每个用户可以通过`/setplatform`命令设置自己需要查询的平台。
   
## 极其简陋的配置方法步骤教学

1. 访问[BotFather](https://t.me/botfather)，输入`/newbot`，然后跟着提示创建一个Bot。
2. 输入`/mybots`，选择你刚刚创建的Bot，然后点击`API Token`，记下那一串字符串。
3. 登陆[Google Apps Script](https://script.google.com/home/my)后台，然后点击左边的新建脚本按钮。
4. 复制[Telebot.js](https://github.com/Cansll/WFBot/raw/master/Telebot.js)的所有内容到GAS。
5. 修改[Token](https://github.com/Cansll/WFBot/blob/master/Telebot.js#L4)变量内容为你刚刚创建Bot时给你的那一串字符串。
6. 保存，找到工具条上的选择函数(或显示`myFunction`)，选择`setWebHook`。
7. 点击左侧三角形按钮运行一次。
8. 点击发布-部署为网络应用，输入项目名字。期间可能会提示你授权，请跟着提示确认。
9. 现在可以看看你的bot是不是可以响应你的指令了?
