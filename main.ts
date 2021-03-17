import { PuppetPadlocal } from "wechaty-puppet-padlocal";
import { Contact, log, Message, ScanStatus, Wechaty } from "wechaty";
import { FileBox } from 'file-box'
import {
    UrlLink,
    MiniProgram,
} from 'wechaty'
const request = require('request');
const puppet = new PuppetPadlocal({
    token: "puppet_padlocal_1a202fb7d89741269bbd97867b4651ad"
})

function print(msg: string, res?: any): void {

    console.debug(msg + '------------------------------------')
    console.debug(res)
    console.debug('\n')

}

const bot = new Wechaty({
    name: "TestBot",
    puppet,
})
    .on("scan", (qrcode: string, status: ScanStatus) => {
        if (status === ScanStatus.Waiting && qrcode) {
            const qrcodeImageUrl = [
                'https://wechaty.js.org/qrcode/',
                encodeURIComponent(qrcode),
            ].join('')

            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

            require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console
        } else {
            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
        }
    })
    .on("login", (user: Contact) => {
        log.info("TestBot", `${user} login`);
    })

    .on("logout", (user: Contact, reason: string) => {
        log.info("TestBot", `${user} logout, reason: ${reason}`);
    })

    .on("message", async (message: Message) => {

        const contact = message.talker()
        const text = message.text()
        const room = message.room()
        // print('@me', await message.mentionSelf())
        // print('message.text()', message.text())
        // print('talker', contact)
        // print('wxid', contact.id)
        // print('gender', contact.gender())
        // print('type', contact.type())
        // print('name', contact.name())
        // print('avatar', await contact.avatar())
        // print('alias', await contact.alias())
        // print('city', contact.city())
        // print('friend', contact.friend())
        // print('province', contact.province())
        // print('roomid', room.id)
        // print('room.topic()', await room.topic())

        let datas = {
            // 'me': await message.mentionSelf(),
            'message_text': 'X' + message.text(),
            // 'talker': contact,
            'wxid': contact.id,
            'gender': contact.gender(),
            'type': contact.type(),
            'name': contact.name(),
            'avatar': await contact.avatar(),
            'alias': await contact.alias() || '',
            'city': contact.city(),
            'friend': contact.friend(),
            'province': contact.province(),
            'roomid': room.id,
            'room_topic': await room.topic(),
        }

        print('datas', datas)

        let datas_jsonstr = JSON.stringify(datas)

        // 群组大师小程序提供的活动查询和报名接口
        let url = 'http://test-958d13-1251176925.ap-shanghai.service.tcloudbase.com/test/groupmaster?action=wechaty' + '&data=' + datas_jsonstr


        request(encodeURI(url), function (error, response, body) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.
            if (JSON.parse(body).data && JSON.parse(body).data.content) {

                // 小程序返回的活动报名信息发送到群
                message.say(JSON.parse(body).data.content)
            }
        });



        // const toContact = message.to()
        // if (toContact) {
        //     const name = toContact.name()
        //     print(`toContact: ${name} Contact: ${contact.name()} Text: ${text}`)
        // } else {
        //     print(`Contact: ${contact.name()} Text: ${text}`)
        // }

        // 1. send Image

        if (/^ding$/i.test(message.text())) {
            const fileBox = FileBox.fromUrl('https://wechaty.github.io/wechaty/images/bot-qr-code.png')
            await message.say(fileBox)
        }

        // 2. send Text

        if (/^dong$/i.test(message.text())) {
            await message.say('dingdingding')
        }

        // 3. send Contact

        if (/^luyuchao$/i.test(message.text())) {
            const contactCard = await bot.Contact.find({ name: 'luyuchao' })
            if (!contactCard) {
                console.log('not found')
                return
            }
            await message.say(contactCard)
        }

        // 4. send UrlLink
        if (/^link$/i.test(message.text())) {
            const urlLink = new UrlLink({
                description: '点击链接关注超哥的个人微信公众号——彪悍的超哥',
                thumbnailUrl: 'https://camo.githubusercontent.com/f310a2097d4aa79d6db2962fa42bb3bb2f6d43df/68747470733a2f2f6368617469652e696f2f776563686174792f696d616765732f776563686174792d6c6f676f2d656e2e706e67',
                title: '关注超哥',
                url: 'https://mp.weixin.qq.com/s/sC76qzmzV61IV-I6RMOj2w',
            });

            await message.say(urlLink);
        }

        // 5. send MiniProgram (only supported by `wechaty-puppet-macpro`)

        // if (/^mini-program$/i.test(message.text())) {
        //     const miniProgram = new MiniProgram({
        //         appid: 'gh_0aa444a25adc',
        //         title: '我正在使用Authing认证身份，你也来试试吧',
        //         pagePath: 'routes/explore.html',
        //         description: '身份管家',
        //         thumbUrl: '30590201000452305002010002041092541302033d0af802040b30feb602045df0c2c5042b777875706c6f61645f31373533353339353230344063686174726f6f6d3131355f313537363035393538390204010400030201000400',
        //         thumbKey: '42f8609e62817ae45cf7d8fefb532e83',
        //     });

        //     await message.say(miniProgram);
        // }

    })

    .on("error", (error) => {
        log.error("TestBot", 'on error: ', error.stack);
    })


bot.start().then(() => {
    log.info("TestBot", "started.");
});

